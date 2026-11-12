/**
 * Feasibility host half for dsh-tripo-support.
 *
 * This slice proves four things inside an isolated DSH instance:
 *  1. a provider card can live in the shipped Models settings page;
 *  2. API keys can be stored through the Host credential service;
 *  3. an async 3D task can be created, polled and downloaded;
 *  4. a model-facing tool can use the same service.
 *
 * Provider endpoints and auth modes are data, not constants, so a third-party
 * relay such as qwenai can be added with its own Base URL and key.
 */
import { createHash, createHmac } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';

export const inject = ['tools'];

const ROUTE_PREFIX = '/plugins/dsh-tripo-support';
const STATE_VERSION = 1;
const TC3_VERSION = '2025-05-13';
const TC3_SERVICE = 'ai3d';

const DEFAULT_PROVIDERS = {
  tripo: {
    id: 'tripo',
    label: 'Tripo',
    kind: 'tripo',
    auth: 'bearer',
    baseURL: 'https://openapi.tripo3d.ai/v3',
    models: ['v3.1-20260211', 'v3.0-20250812', 'v2.5-20250123', 'P1-20260311', 'P2-20260801'],
    defaultModel: 'v3.1-20260211',
    apiKeyRef: 'TRIPO_API_KEY',
  },
  hy3d: {
    id: 'hy3d',
    label: '混元 3D',
    kind: 'hy3d',
    auth: 'tc3',
    baseURL: 'https://ai3d.tencentcloudapi.com',
    region: 'ap-guangzhou',
    models: ['3.1-pro', '3.0-pro', 'rapid'],
    defaultModel: '3.1-pro',
    secretIdRef: 'HY3D_SECRET_ID',
    secretKeyRef: 'HY3D_SECRET_KEY',
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function statePath() {
  const home = process.env.DSH_HOME || join(homedir(), '.dsh');
  return join(home, 'tripo-support', 'state.json');
}

function defaultState() {
  return { version: STATE_VERSION, providers: clone(DEFAULT_PROVIDERS) };
}

function normalizeProvider(id, value) {
  const p = { ...value, id };
  p.label = String(p.label || id);
  p.kind = p.kind === 'hy3d' ? 'hy3d' : 'tripo';
  p.auth = p.kind === 'hy3d' ? 'tc3' : 'bearer';
  p.baseURL = String(p.baseURL || (p.kind === 'hy3d' ? DEFAULT_PROVIDERS.hy3d.baseURL : DEFAULT_PROVIDERS.tripo.baseURL)).replace(/\/+$/, '');
  p.models = Array.isArray(p.models) ? p.models.map(String).filter(Boolean) : [];
  p.defaultModel = String(p.defaultModel || p.models[0] || '');
  if (p.kind === 'hy3d') {
    p.region = String(p.region || 'ap-guangzhou');
    p.secretIdRef = String(p.secretIdRef || `DSH3D_${id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_SECRET_ID`);
    p.secretKeyRef = String(p.secretKeyRef || `DSH3D_${id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_SECRET_KEY`);
  } else {
    p.apiKeyRef = String(p.apiKeyRef || `DSH3D_${id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_API_KEY`);
  }
  return p;
}

function mergeState(raw) {
  const state = defaultState();
  if (raw && typeof raw === 'object' && raw.providers && typeof raw.providers === 'object') {
    for (const [id, provider] of Object.entries(raw.providers)) {
      state.providers[id] = normalizeProvider(id, provider);
    }
  }
  state.version = STATE_VERSION;
  return state;
}

function sha256Hex(value) {
  return createHash('sha256').update(value).digest('hex');
}

function hmac(key, value) {
  return createHmac('sha256', key).update(value).digest();
}

function tc3Headers(provider, action, payload) {
  const url = new URL(provider.baseURL);
  const host = url.host;
  const timestamp = Math.floor(Date.now() / 1000);
  const date = new Date(timestamp * 1000).toISOString().slice(0, 10);
  const body = JSON.stringify(payload);
  const contentType = 'application/json; charset=utf-8';
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\n`;
  const signedHeaders = 'content-type;host';
  const canonicalRequest = ['POST', '/', '', canonicalHeaders + '\n' + signedHeaders, sha256Hex(body)].join('\n');
  const credentialScope = `${date}/${TC3_SERVICE}/tc3_request`;
  const stringToSign = ['TC3-HMAC-SHA256', String(timestamp), credentialScope, sha256Hex(canonicalRequest)].join('\n');
  const secretDate = hmac(`TC3${provider._secretKey}`, date);
  const secretService = hmac(secretDate, TC3_SERVICE);
  const secretSigning = hmac(secretService, 'tc3_request');
  const signature = createHmac('sha256', secretSigning).update(stringToSign).digest('hex');
  return {
    body,
    headers: {
      Authorization: `TC3-HMAC-SHA256 Credential=${provider._secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      'Content-Type': contentType,
      Host: host,
      'X-TC-Action': action,
      'X-TC-Version': TC3_VERSION,
      'X-TC-Timestamp': String(timestamp),
      'X-TC-Region': provider.region || 'ap-guangzhou',
    },
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`服务返回了非 JSON 响应（HTTP ${response.status}）：${text.slice(0, 200)}`);
  }
  return { response, json };
}

function ensureOk(condition, message) {
  if (!condition) throw new Error(message);
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new Error('任务已取消'));
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new Error('任务已取消'));
    }, { once: true });
  });
}

export function apply(ctx, config = {}) {
  const credentialService = () => {
    const service = ctx.get('credentials');
    if (!service) throw new Error('DSH 凭据服务不可用，无法读取 API Key');
    return service;
  };

  const resolveSecret = async (ref) => {
    const resolved = await credentialService().resolve(ref);
    return resolved?.value?.trim() || '';
  };

  let statePromise;
  const loadState = () => {
    if (!statePromise) {
      statePromise = (async () => {
        try {
          const raw = await readFile(statePath(), 'utf8');
          return mergeState(JSON.parse(raw));
        } catch {
          return defaultState();
        }
      })();
    }
    return statePromise;
  };

  const saveState = async (state) => {
    const path = statePath();
    await mkdir(join(path, '..'), { recursive: true });
    await writeFile(path, JSON.stringify(state, null, 2), 'utf8');
    statePromise = Promise.resolve(state);
  };

  const keyConfigured = async (provider) => {
    try {
      if (provider.kind === 'hy3d') {
        const [id, key] = await Promise.all([
          credentialService().describe(provider.secretIdRef),
          credentialService().describe(provider.secretKeyRef),
        ]);
        return Boolean(id.configured && key.configured);
      }
      const info = await credentialService().describe(provider.apiKeyRef);
      return Boolean(info.configured);
    } catch {
      return false;
    }
  };

  const publicProvider = async (provider) => ({
    id: provider.id,
    label: provider.label,
    kind: provider.kind,
    auth: provider.auth,
    baseURL: provider.baseURL,
    region: provider.region,
    models: provider.models,
    defaultModel: provider.defaultModel,
    configured: await keyConfigured(provider),
    custom: !DEFAULT_PROVIDERS[provider.id],
  });

  const status = async () => {
    const state = await loadState();
    return {
      ok: true,
      providers: await Promise.all(Object.values(state.providers).map(publicProvider)),
      official: {
        tripo: DEFAULT_PROVIDERS.tripo.baseURL,
        hy3d: DEFAULT_PROVIDERS.hy3d.baseURL,
      },
    };
  };

  const tripoGenerate = async (provider, prompt, model, signal) => {
    const apiKey = await resolveSecret(provider.apiKeyRef);
    ensureOk(apiKey, `${provider.label} 还没有配置 API Key`);
    const base = provider.baseURL.replace(/\/+$/, '');
    const created = await fetchJson(`${base}/generation/text-to-model`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model }),
      signal,
    });
    if (created.json.code !== 0) {
      throw new Error(`${provider.label} 创建任务失败：${created.json.message || `code ${created.json.code}`}`);
    }
    const taskId = created.json.data?.task_id;
    ensureOk(taskId, `${provider.label} 没有返回 task_id`);
    const deadline = Date.now() + 5 * 60 * 1000;
    let last = {};
    while (Date.now() < deadline) {
      await sleep(2000, signal);
      const queried = await fetchJson(`${base}/tasks/${encodeURIComponent(taskId)}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal,
      });
      if (queried.json.code !== 0) {
        throw new Error(`${provider.label} 查询任务失败：${queried.json.message || `code ${queried.json.code}`}`);
      }
      last = queried.json.data || {};
      if (last.status === 'success') {
        const modelUrl = last.output?.model_url || last.output?.pbr_model?.url;
        ensureOk(modelUrl, `${provider.label} 任务成功但没有 model_url`);
        return {
          taskId,
          status: 'success',
          progress: last.progress ?? 100,
          modelUrl,
          previewUrl: last.output?.rendered_image_url,
          credits: last.credits_consumed,
        };
      }
      if (['failed', 'cancelled', 'banned', 'expired'].includes(last.status)) {
        throw new Error(`${provider.label} 任务${last.status === 'failed' ? '失败' : '终止'}：${last.error_message || last.error_code || last.status}`);
      }
    }
    throw new Error(`${provider.label} 任务 ${taskId} 超时（最后状态：${last.status || 'unknown'}）`);
  };

  const hy3dGenerate = async (provider, prompt, model, signal) => {
    const secretId = await resolveSecret(provider.secretIdRef);
    const secretKey = await resolveSecret(provider.secretKeyRef);
    ensureOk(secretId && secretKey, `${provider.label} 还没有配置 SecretId / SecretKey`);
    const rapid = String(model || '').toLowerCase().startsWith('rapid');
    const submitAction = rapid ? 'SubmitHunyuanTo3DRapidJob' : 'SubmitHunyuanTo3DProJob';
    const queryAction = rapid ? 'QueryHunyuanTo3DRapidJob' : 'QueryHunyuanTo3DProJob';
    const submitPayload = rapid
      ? { Prompt: prompt, ResultFormat: 'GLB', EnablePBR: true }
      : { Prompt: prompt, Model: String(model || '').startsWith('3.1') ? '3.1' : '3.0', ResultFormat: 'GLB', EnablePBR: true };
    const signedProvider = { ...provider, _secretId: secretId, _secretKey: secretKey };
    const submit = tc3Headers(signedProvider, submitAction, submitPayload);
    const created = await fetchJson(provider.baseURL, { method: 'POST', headers: submit.headers, body: submit.body, signal });
    const createdResponse = created.json.Response || {};
    if (createdResponse.Error) {
      throw new Error(`${provider.label} 创建任务失败：${createdResponse.Error.Message || createdResponse.Error.Code}`);
    }
    const jobId = createdResponse.JobId;
    ensureOk(jobId, `${provider.label} 没有返回 JobId`);
    const deadline = Date.now() + 5 * 60 * 1000;
    let last = {};
    while (Date.now() < deadline) {
      await sleep(2000, signal);
      const query = tc3Headers(signedProvider, queryAction, { JobId: jobId });
      const queried = await fetchJson(provider.baseURL, { method: 'POST', headers: query.headers, body: query.body, signal });
      const response = queried.json.Response || {};
      if (response.Error) {
        throw new Error(`${provider.label} 查询任务失败：${response.Error.Message || response.Error.Code}`);
      }
      last = response;
      if (response.Status === 'DONE') {
        const files = Array.isArray(response.ResultFile3Ds) ? response.ResultFile3Ds : [];
        const preferred = files.find((file) => String(file.Type).toUpperCase() === 'GLB') || files[0];
        ensureOk(preferred?.Url, `${provider.label} 任务成功但没有返回文件 URL`);
        return {
          taskId: jobId,
          status: 'success',
          progress: 100,
          modelUrl: preferred.Url,
          previewUrl: preferred.PreviewImageUrl,
          credits: response.ResultCreditConsumed,
        };
      }
      if (response.Status === 'FAIL') {
        throw new Error(`${provider.label} 任务失败：${response.ErrorMessage || response.ErrorCode || 'FAIL'}`);
      }
    }
    throw new Error(`${provider.label} 任务 ${jobId} 超时（最后状态：${last.Status || 'unknown'}）`);
  };

  const downloadModel = async (provider, result, outputDir) => {
    const response = await fetch(result.modelUrl);
    ensureOk(response.ok, `下载模型失败：HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    let name = 'model.glb';
    try {
      const candidate = basename(new URL(result.modelUrl).pathname);
      if (candidate && candidate !== '/') name = candidate;
    } catch {
      /* keep default */
    }
    if (!/\.[a-z0-9]{2,5}$/i.test(name)) name += '.glb';
    await mkdir(outputDir, { recursive: true });
    const file = join(outputDir, `${provider.id}-${result.taskId}-${name}`.replace(/[<>:"/\\|?*]/g, '_'));
    await writeFile(file, buffer);
    return { file, bytes: buffer.byteLength };
  };

  const generate = async ({ providerId, prompt, model, outputDir, signal }) => {
    const state = await loadState();
    const provider = state.providers[providerId];
    ensureOk(provider, `未知的 3D 服务：${providerId}`);
    ensureOk(prompt && String(prompt).trim(), 'prompt 不能为空');
    const chosen = String(model || provider.defaultModel || '');
    const result = provider.kind === 'hy3d'
      ? await hy3dGenerate(provider, String(prompt).trim(), chosen, signal)
      : await tripoGenerate(provider, String(prompt).trim(), chosen, signal);
    const saved = await downloadModel(provider, result, outputDir);
    return { provider: provider.id, providerLabel: provider.label, model: chosen, ...result, ...saved };
  };

  const testProvider = async (providerId) => {
    const state = await loadState();
    const provider = state.providers[providerId];
    ensureOk(provider, `未知的 3D 服务：${providerId}`);
    const started = Date.now();
    try {
      if (provider.kind === 'hy3d') {
        const secretId = await resolveSecret(provider.secretIdRef);
        const secretKey = await resolveSecret(provider.secretKeyRef);
        ensureOk(secretId && secretKey, '还没有配置 SecretId / SecretKey');
        const signed = tc3Headers({ ...provider, _secretId: secretId, _secretKey: secretKey }, 'QueryHunyuanTo3DProJob', { JobId: '0' });
        const result = await fetchJson(provider.baseURL, { method: 'POST', headers: signed.headers, body: signed.body });
        const response = result.json.Response || {};
        const code = response.Error?.Code || '';
        if (/AuthFailure|Unauthorized|InvalidCredential|Signature/i.test(code)) {
          throw new Error(response.Error?.Message || code);
        }
        return { ok: true, latencyMs: Date.now() - started, message: code ? `已连通（${code}）` : '已连通' };
      }
      const apiKey = await resolveSecret(provider.apiKeyRef);
      ensureOk(apiKey, '还没有配置 API Key');
      const base = provider.baseURL.replace(/\/+$/, '');
      const balance = await fetchJson(`${base}/account/balance`, { headers: { Authorization: `Bearer ${apiKey}` } });
      if (balance.response.ok && balance.json.code === 0) {
        return { ok: true, latencyMs: Date.now() - started, message: `已连通，余额 ${balance.json.data?.balance ?? '未知'}` };
      }
      if (balance.response.status === 401 || balance.response.status === 403) {
        throw new Error(balance.json.message || `HTTP ${balance.response.status}`);
      }
      const probe = await fetchJson(`${base}/tasks/00000000-0000-0000-0000-000000000000`, { headers: { Authorization: `Bearer ${apiKey}` } });
      if (probe.response.status === 401 || probe.response.status === 403) {
        throw new Error(probe.json.message || `HTTP ${probe.response.status}`);
      }
      return { ok: true, latencyMs: Date.now() - started, message: `已连通（HTTP ${probe.response.status}）` };
    } catch (error) {
      return { ok: false, latencyMs: Date.now() - started, message: error instanceof Error ? error.message : String(error) };
    }
  };

  const addProvider = async ({ label, kind, baseURL, models, defaultModel, apiKey, secretId, secretKey, region }) => {
    const state = await loadState();
    const id = String(label || 'custom')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `custom-${Date.now()}`;
    const unique = state.providers[id] ? `${id}-${Math.random().toString(36).slice(2, 6)}` : id;
    const provider = normalizeProvider(unique, {
      label: label || unique,
      kind,
      baseURL,
      models: Array.isArray(models) ? models : String(models || '').split(/[,\n]/).map((item) => item.trim()).filter(Boolean),
      defaultModel,
      region,
    });
    if (provider.kind === 'hy3d') {
      ensureOk(secretId && secretKey, '添加混元3D服务需要 SecretId 和 SecretKey');
      await credentialService().set(provider.secretIdRef, String(secretId));
      await credentialService().set(provider.secretKeyRef, String(secretKey));
    } else {
      ensureOk(apiKey, '添加 Tripo 兼容服务需要 API Key');
      await credentialService().set(provider.apiKeyRef, String(apiKey));
    }
    state.providers[unique] = provider;
    await saveState(state);
    return publicProvider(provider);
  };

  const updateProvider = async ({ providerId, baseURL, models, defaultModel, region }) => {
    const state = await loadState();
    const provider = state.providers[providerId];
    ensureOk(provider, `未知的 3D 服务：${providerId}`);
    if (baseURL !== undefined) provider.baseURL = String(baseURL).trim().replace(/\/+$/, '');
    if (region !== undefined && provider.kind === 'hy3d') provider.region = String(region).trim();
    if (models !== undefined) {
      provider.models = Array.isArray(models)
        ? models.map(String).map((item) => item.trim()).filter(Boolean)
        : String(models).split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
    }
    if (defaultModel !== undefined) provider.defaultModel = String(defaultModel);
    if (!provider.models.includes(provider.defaultModel)) provider.defaultModel = provider.models[0] || '';
    await saveState(state);
    return publicProvider(provider);
  };

  const deleteProvider = async (providerId) => {
    const state = await loadState();
    ensureOk(state.providers[providerId], `未知的 3D 服务：${providerId}`);
    ensureOk(!DEFAULT_PROVIDERS[providerId], '内置服务不能删除，只能清空密钥');
    delete state.providers[providerId];
    await saveState(state);
    return { ok: true };
  };

  const setKey = async ({ providerId, apiKey, secretId, secretKey }) => {
    const state = await loadState();
    const provider = state.providers[providerId];
    ensureOk(provider, `未知的 3D 服务：${providerId}`);
    if (provider.kind === 'hy3d') {
      if (secretId) await credentialService().set(provider.secretIdRef, String(secretId));
      if (secretKey) await credentialService().set(provider.secretKeyRef, String(secretKey));
    } else {
      ensureOk(apiKey, 'API Key 不能为空');
      await credentialService().set(provider.apiKeyRef, String(apiKey));
    }
    return publicProvider(provider);
  };

  const clearKey = async (providerId) => {
    const state = await loadState();
    const provider = state.providers[providerId];
    ensureOk(provider, `未知的 3D 服务：${providerId}`);
    if (provider.kind === 'hy3d') {
      await credentialService().unset(provider.secretIdRef);
      await credentialService().unset(provider.secretKeyRef);
    } else {
      await credentialService().unset(provider.apiKeyRef);
    }
    return publicProvider(provider);
  };

  const workspaceOutputDir = () => {
    if (config.workspaceDir) return String(config.workspaceDir);
    if (process.env.DSH_HOME) return join(process.env.DSH_HOME, 'tripo-support', 'output');
    return join(homedir(), '.dsh', 'tripo-support', 'output');
  };

  // Host tool: the agent-facing capability.
  ctx.tools.register({
    name: 'generate_3d',
    description: 'Generate a 3D model through a configured asynchronous 3D service (Tripo, Hunyuan3D, or a compatible third-party relay). Creates the task, polls it, downloads the model into the workspace, and returns the saved file path. Use list_3d_providers first when unsure which provider or model is configured.',
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Text prompt describing the 3D asset.' },
        provider: { type: 'string', description: 'Configured provider id, for example tripo or hy3d.' },
        model: { type: 'string', description: 'Provider model id; omit to use the configured default.' },
      },
      required: ['prompt'],
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          provider: { type: 'string' },
          model: { type: 'string' },
          taskId: { type: 'string' },
          file: { type: 'string' },
          bytes: { type: 'integer' },
          previewUrl: { type: 'string' },
        },
        required: ['summary', 'provider', 'model', 'taskId', 'file', 'bytes'],
        additionalProperties: true,
      },
      render: (_args, value) => [{ type: 'text', text: value.summary }],
    },
    timeoutMs: 600000,
    async execute(args, exec) {
      const state = await loadState();
      const providerId = String(args.provider || 'tripo');
      ensureOk(state.providers[providerId], `未配置 3D 服务 ${providerId}，请先在设置 → 模型 → 3D 生成服务中配置`);
      const workingDirectory = ctx.get('workingDirectory');
      const sessionDir = workingDirectory && exec.agent ? workingDirectory.get(exec.agent) : workspaceOutputDir();
      const result = await generate({
        providerId,
        prompt: args.prompt,
        model: args.model,
        outputDir: join(sessionDir, '3d-output'),
        signal: exec.signal,
      });
      return {
        ...result,
        summary: `已通过 ${result.providerLabel} 生成 3D 模型（${result.model}），任务 ${result.taskId}，已保存到 ${result.file}（${result.bytes} 字节）。`,
      };
    },
  });

  ctx.tools.register({
    name: 'list_3d_providers',
    description: 'List configured 3D generation providers, their available model ids, default model, and whether a credential is configured. Use before generate_3d when the provider or model is unknown.',
    parameters: { type: 'object', properties: {} },
    output: {
      schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          providers: { type: 'array', items: { type: 'object', additionalProperties: true } },
        },
        required: ['summary', 'providers'],
        additionalProperties: true,
      },
      render: (_args, value) => [{ type: 'text', text: value.summary }],
    },
    async execute() {
      const snapshot = await status();
      const lines = snapshot.providers.map((provider) => `${provider.id}（${provider.label}，${provider.kind}）：${provider.configured ? '密钥已配置' : '密钥未配置'}；模型 ${provider.models.join(', ') || '无'}；默认 ${provider.defaultModel || '无'}`);
      return { summary: lines.join('\n'), providers: snapshot.providers };
    },
  });

  // Same-origin control surface for the Models settings card.
  const handler = async (req, res) => {
      const origin = req.headers.origin;
      const host = req.headers.host;
      if (origin && host && origin !== `http://${host}` && origin !== `https://${host}`) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'cross-origin request rejected' }));
        return;
      }
      const url = new URL(req.url || '/', 'http://localhost');
      const path = url.pathname.slice(ROUTE_PREFIX.length) || '/';
      const send = (code, body) => {
        res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify(body));
      };
      try {
        if (req.method === 'GET' && path === '/status') return send(200, await status());
        if (req.method !== 'POST') return send(405, { ok: false, error: 'method not allowed' });
        const chunks = [];
        let bytes = 0;
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 2 * 1024 * 1024) return send(413, { ok: false, error: 'request too large' });
          chunks.push(chunk);
        }
        const text = Buffer.concat(chunks).toString('utf8');
        const body = text ? JSON.parse(text) : {};
        if (path === '/test') return send(200, { ok: true, result: await testProvider(String(body.providerId)) });
        if (path === '/key') return send(200, { ok: true, provider: await setKey(body) });
        if (path === '/key/clear') return send(200, { ok: true, provider: await clearKey(String(body.providerId)) });
        if (path === '/provider') return send(200, { ok: true, provider: await addProvider(body) });
        if (path === '/provider/update') return send(200, { ok: true, provider: await updateProvider(body) });
        if (path === '/provider/delete') return send(200, await deleteProvider(String(body.providerId)));
        if (path === '/generate') {
          const result = await generate({
            providerId: String(body.providerId || 'tripo'),
            prompt: body.prompt,
            model: body.model,
            outputDir: workspaceOutputDir(),
          });
          return send(200, { ok: true, result });
        }
        return send(404, { ok: false, error: `unknown route ${path}` });
      } catch (error) {
        return send(400, { ok: false, error: error instanceof Error ? error.message : String(error) });
      }
  };
  ctx.inject(['webServer'], (webCtx) => {
    const webServer = webCtx.get('webServer');
    if (!webServer) return;
    webCtx.effect(() => webServer.register({ kind: 'prefix', path: ROUTE_PREFIX, handler }), 'dsh-tripo-support: routes');
  });
}
