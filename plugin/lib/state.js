import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { DEFAULT_PROVIDERS, deriveDashscopeTasksURL, normalizeProvider, operationsFor } from './protocols.js';

export class ProviderStore {
  constructor({ file, credentials }) {
    this.file = file;
    this.credentials = credentials;
    this.state = undefined;
  }

  defaults() {
    return {
      version: 1,
      providers: Object.fromEntries(Object.entries(DEFAULT_PROVIDERS).map(([id, provider]) => [id, normalizeProvider(id, provider)])),
    };
  }

  async load() {
    if (this.state) return this.state;
    let raw;
    try {
      raw = JSON.parse(await readFile(this.file, 'utf8'));
    } catch {
      raw = undefined;
    }
    const state = this.defaults();
    if (raw?.providers && typeof raw.providers === 'object') {
      for (const [id, provider] of Object.entries(raw.providers)) {
        if (!provider || typeof provider !== 'object') continue;
        state.providers[id] = normalizeProvider(id, provider);
      }
    }
    this.state = state;
    return state;
  }

  async save() {
    await mkdir(join(this.file, '..'), { recursive: true });
    await writeFile(this.file, JSON.stringify(this.state, null, 2), 'utf8');
  }

  async list() {
    const state = await this.load();
    return Promise.all(Object.values(state.providers).map((provider) => this.public(provider)));
  }

  async get(id) {
    const state = await this.load();
    return state.providers[id];
  }

  async public(provider) {
    return {
      id: provider.id,
      label: provider.label,
      protocol: provider.protocol,
      auth: provider.auth,
      baseURL: provider.baseURL,
      region: provider.region,
      models: provider.models,
      defaultModel: provider.defaultModel,
      operations: operationsFor(provider.protocol).map((id) => id),
      configured: await this.configured(provider),
      custom: !DEFAULT_PROVIDERS[provider.id],
    };
  }

  async configured(provider) {
    try {
      if (provider.protocol === 'tencent') {
        const [a, b] = await Promise.all([
          this.credentials.describe(provider.secretIdRef),
          this.credentials.describe(provider.secretKeyRef),
        ]);
        return Boolean(a.configured && b.configured);
      }
      const info = await this.credentials.describe(provider.apiKeyRef);
      return Boolean(info.configured);
    } catch {
      return false;
    }
  }

  async secrets(provider) {
    if (provider.protocol === 'tencent') {
      const [id, key] = await Promise.all([
        this.credentials.resolve(provider.secretIdRef),
        this.credentials.resolve(provider.secretKeyRef),
      ]);
      return { secretId: id?.value?.trim() || '', secretKey: key?.value?.trim() || '' };
    }
    const key = await this.credentials.resolve(provider.apiKeyRef);
    return { apiKey: key?.value?.trim() || '' };
  }

  async webhookSecret(provider) {
    const resolved = await this.credentials.resolve(provider.webhookSecretRef);
    return resolved?.value?.trim() || '';
  }

  async setKey({ providerId, apiKey, secretId, secretKey, webhookSecret }) {
    const provider = await this.get(providerId);
    if (!provider) throw new Error(`未知的 3D 服务：${providerId}`);
    if (webhookSecret) await this.credentials.set(provider.webhookSecretRef, String(webhookSecret));
    if (provider.protocol === 'tencent') {
      if (secretId) await this.credentials.set(provider.secretIdRef, String(secretId));
      if (secretKey) await this.credentials.set(provider.secretKeyRef, String(secretKey));
      if (!secretId && !secretKey && !webhookSecret) throw new Error('SecretId / SecretKey 不能同时为空');
    } else {
      if (apiKey) await this.credentials.set(provider.apiKeyRef, String(apiKey));
      if (!apiKey && !webhookSecret) throw new Error('API Key 不能为空');
    }
    return this.public(provider);
  }


  async clearKey(providerId) {
    const provider = await this.get(providerId);
    if (!provider) throw new Error(`未知的 3D 服务：${providerId}`);
    if (provider.protocol === 'tencent') {
      await this.credentials.unset(provider.secretIdRef);
      await this.credentials.unset(provider.secretKeyRef);
    } else {
      await this.credentials.unset(provider.apiKeyRef);
    }
    return this.public(provider);
  }

  async add(input) {
    const state = await this.load();
    const label = String(input.label || '').trim();
    if (!label) throw new Error('服务名称不能为空');
    const base = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'custom';
    let id = base;
    if (state.providers[id]) id = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const provider = normalizeProvider(id, {
      label,
      protocol: input.protocol,
      baseURL: input.baseURL,
      models: Array.isArray(input.models) ? input.models : String(input.models || '').split(/[,\n]/).map((item) => item.trim()).filter(Boolean),
      defaultModel: input.defaultModel,
      region: input.region,
    });
    if (provider.protocol === 'tencent') {
      if (!input.secretId || !input.secretKey) throw new Error('添加混元3D 服务需要 SecretId 和 SecretKey');
      await this.credentials.set(provider.secretIdRef, String(input.secretId));
      await this.credentials.set(provider.secretKeyRef, String(input.secretKey));
    } else {
      if (!input.apiKey) throw new Error('添加服务需要 API Key');
      await this.credentials.set(provider.apiKeyRef, String(input.apiKey));
    }
    state.providers[id] = provider;
    this.state = state;
    await this.save();
    return this.public(provider);
  }

  async update({ providerId, baseURL, models, defaultModel, region }) {
    const state = await this.load();
    const provider = state.providers[providerId];
    if (!provider) throw new Error(`未知的 3D 服务：${providerId}`);
    if (baseURL !== undefined) { provider.baseURL = String(baseURL).trim().replace(/\/+$/, ''); if (provider.protocol === 'dashscope') provider.queryURL = deriveDashscopeTasksURL(provider.baseURL); }
    if (region !== undefined && provider.protocol === 'tencent') provider.region = String(region).trim();
    if (models !== undefined) {
      provider.models = Array.isArray(models)
        ? models.map(String).map((item) => item.trim()).filter(Boolean)
        : String(models).split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
    }
    if (defaultModel !== undefined) provider.defaultModel = String(defaultModel);
    if (!provider.models.includes(provider.defaultModel)) provider.defaultModel = provider.models[0] || '';
    if (provider.protocol === 'dashscope') provider.queryURL = provider.queryURL || '';
    this.state = state;
    await this.save();
    return this.public(provider);
  }

  async remove(providerId) {
    const state = await this.load();
    if (!state.providers[providerId]) throw new Error(`未知的 3D 服务：${providerId}`);
    if (DEFAULT_PROVIDERS[providerId]) throw new Error('内置服务不能删除，只能清空密钥');
    delete state.providers[providerId];
    this.state = state;
    await this.save();
    return { ok: true };
  }
}


