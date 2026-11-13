import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { ProviderStore } from './lib/state.js';
import { TaskStore, mimeFor } from './lib/tasks.js';
import {
  OPERATIONS,
  PROTOCOL_LABELS,
  buildCreateRequest,
  buildDownloadRequest,
  buildQueryRequest,
  buildTestRequest,
  operationsFor,
  parseCreateResponse,
  parseDownloadResponse,
  parseTaskResponse,
  parseTestResponse,
} from './lib/protocols.js';

export const inject = ['tools'];

const ROUTE_PREFIX = '/plugins/dsh-tripo-support';
const MAX_WAIT_MS = 10 * 60 * 1000;
const MAX_BODY_BYTES = 30 * 1024 * 1024;

function dshHome() {
  return process.env.DSH_HOME || join(homedir(), '.dsh');
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

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`服务返回了非 JSON 响应（HTTP ${response.status}）：${text.slice(0, 240)}`);
  }
  return { response, json, text };
}

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

const WORKSHOP_MODEL_EXTENSIONS = new Set(['.glb', '.gltf', '.fbx', '.obj', '.stl', '.usdz']);
const TASK_ID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const previewableModel = (file) => ['.glb', '.gltf'].includes(extname(file).toLowerCase());
const pathKey = (value) => resolve(String(value || '')).replace(/\\/g, '/').toLowerCase();
const isWithin = (child, root) => {
  const c = pathKey(child);
  const r = pathKey(root).replace(/\/+$/, '');
  return c === r || c.startsWith(`${r}/`);
};

export function apply(ctx, config = {}) {
  const root = join(dshHome(), 'tripo-support');
  const credentials = {
    async resolve(ref) {
      const service = ctx.get('credentials');
      ensure(service, 'DSH 凭据服务不可用');
      return service.resolve(ref);
    },
    async describe(ref) {
      const service = ctx.get('credentials');
      ensure(service, 'DSH 凭据服务不可用');
      return service.describe(ref);
    },
    async set(ref, value) {
      const service = ctx.get('credentials');
      ensure(service, 'DSH 凭据服务不可用');
      return service.set(ref, value);
    },
    async unset(ref) {
      const service = ctx.get('credentials');
      ensure(service, 'DSH 凭据服务不可用');
      return service.unset(ref);
    },
  };

  const providers = new ProviderStore({ file: join(root, 'state.json'), credentials });
  const tasks = new TaskStore({ file: join(root, 'tasks.json'), previewFile: join(root, 'previews.json') });

  const workspaceRecords = async () => {
    await tasks.load();
    const found = new Map();
    const registry = ctx.get('workspaceRegistry');
    if (registry && typeof registry.list === 'function') {
      for (const workspace of registry.list()) {
        if (!workspace?.path) continue;
        found.set(pathKey(workspace.path), {
          id: String(workspace.id || workspace.workspaceId || pathKey(workspace.path)),
          title: String(workspace.title || basename(String(workspace.path)) || '工作区'),
          path: String(workspace.path),
        });
      }
    }
    // Keep old task outputs discoverable even when the workspace registration was removed.
    for (const task of tasks.list()) {
      if (!task.file) continue;
      const outputDir = dirname(task.file);
      if (basename(outputDir).toLowerCase() !== '3d-output') continue;
      const workspacePath = dirname(outputDir);
      if (!found.has(pathKey(workspacePath))) {
        found.set(pathKey(workspacePath), {
          id: `task-${pathKey(workspacePath)}`,
          title: basename(workspacePath) || '工作区',
          path: workspacePath,
        });
      }
    }
    return [...found.values()];
  };

  const allowedWorkspace = async (workspacePath) => {
    const wanted = pathKey(workspacePath);
    return (await workspaceRecords()).find((workspace) => pathKey(workspace.path) === wanted);
  };

  const taskForFile = (file) => {
    const key = pathKey(file);
    return tasks.list().find((task) => task.file && pathKey(task.file) === key);
  };

  const scanWorkspaceModels = async (workspace) => {
    const outputDirectory = join(workspace.path, '3d-output');
    const models = [];
    const walk = async (directory, depth = 0) => {
      let entries;
      try { entries = await readdir(directory, { withFileTypes: true }); } catch { return; }
      for (const entry of entries) {
        const file = join(directory, entry.name);
        if (entry.isDirectory()) {
          if (depth < 2) await walk(file, depth + 1);
          continue;
        }
        if (!entry.isFile() || !WORKSHOP_MODEL_EXTENSIONS.has(extname(entry.name).toLowerCase())) continue;
        let info;
        try { info = await stat(file); } catch { continue; }
        const embeddedTaskId = (entry.name.match(TASK_ID_PATTERN) || [])[0] || '';
        const task = taskForFile(file) || tasks.list().find((item) => item.taskId && item.taskId === embeddedTaskId);
        models.push({
          id: pathKey(file),
          name: entry.name,
          path: file,
          workspaceId: workspace.id,
          workspaceTitle: workspace.title,
          workspacePath: workspace.path,
          bytes: info.size,
          updatedAt: info.mtime.toISOString(),
          previewable: previewableModel(file),
          provider: task?.providerId,
          providerLabel: task?.providerLabel || task?.providerId,
          operation: task?.operation,
          model: task?.model,
          taskId: task?.taskId,
          sourceTaskId: task?.taskId || embeddedTaskId || undefined,
          modelUrl: task?.modelUrl,
          thumbnailUrl: /^https?:/i.test(String(task?.previewUrl || '')) ? task.previewUrl : undefined,
          status: task?.status,
        });
      }
    };
    await walk(outputDirectory);
    models.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    return models;
  };

  const workshopSnapshot = async ({ scope = 'current', path } = {}) => {
    const workspaces = await workspaceRecords();
    let selected = workspaces;
    if (scope !== 'all') {
      const current = workspaces.find((workspace) => pathKey(workspace.path) === pathKey(path));
      ensure(current, '当前工作区不在已注册工作区列表中');
      selected = [current];
    }
    const groups = [];
    for (const workspace of selected) {
      groups.push({ ...workspace, models: await scanWorkspaceModels(workspace) });
    }
    return { workspaces: groups, models: groups.flatMap((workspace) => workspace.models) };
  };

  const workshopBalance = async (providerId) => {
    const provider = await providerOrThrow(String(providerId || ''));
    if (!['tripo', 'meshy', 'hyper'].includes(provider.protocol)) {
      return { ok: true, supported: false, provider: provider.id, message: '暂不支持查询积分' };
    }
    const secrets = await providers.secrets(provider);
    ensure(secrets.apiKey, `${provider.label} 还没有配置 API Key`);
    const request = buildTestRequest(provider, secrets);
    const { response, json } = await fetchJson(request.url, { method: request.method, headers: request.headers, body: request.body, signal: AbortSignal.timeout(10000) });
    if (response.status === 401 || response.status === 403) throw new Error(`API Key 无效（HTTP ${response.status}）`);
    ensure(response.ok, `查询积分失败：HTTP ${response.status}`);
    const balance = provider.protocol === 'tripo' ? (json.data?.balance ?? json.balance) : json.balance;
    return { ok: true, supported: true, provider: provider.id, balance: balance ?? null };
  };

  const workshopUpload = async ({ providerId, fileName, mediaType, data }) => {
    const provider = await providerOrThrow(String(providerId || ''));
    const secrets = await providers.secrets(provider);
    const raw = String(data || '');
    const base64 = raw.replace(/^data:[^;]+;base64,/, '');
    const bytes = Buffer.from(base64, 'base64');
    ensure(bytes.length > 0, '图片内容为空');
    ensure(bytes.length <= 20 * 1024 * 1024, '图片不能超过 20MB');
    const contentType = String(mediaType || 'image/png');
    if (provider.protocol === 'tripo') {
      ensure(secrets.apiKey, `${provider.label} 还没有配置 API Key`);
      const form = new FormData();
      form.set('file', new Blob([bytes], { type: contentType }), String(fileName || 'image.png'));
      const response = await fetch(`${provider.baseURL.replace(/\/+$/, '')}/files`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${secrets.apiKey}` },
        body: form,
        signal: AbortSignal.timeout(30000),
      });
      const json = await response.json().catch(() => ({}));
      ensure(response.ok && json.code === 0 && json.data?.file_token, `${provider.label} 上传图片失败：${json.message || `HTTP ${response.status}`}`);
      return { ok: true, provider: provider.id, kind: 'file_token', fileToken: json.data.file_token, fileName: String(fileName || 'image.png') };
    }
    if (provider.protocol === 'hyper' || provider.protocol === 'tencent') {
      return { ok: true, provider: provider.id, kind: 'data_url', dataUrl: raw.startsWith('data:') ? raw : `data:${contentType};base64,${base64}`, fileName: String(fileName || 'image.png') };
    }
    throw new Error(`${provider.label} 的接口需要公网图片链接，暂不支持本地图片上传`);
  };

  const generationTurns = new Map();
  ctx.effect(() => {
    const dispose = ctx.on('agent/inbox/claimed', (payload) => {
      const id = payload?.agent?.id;
      if (id) generationTurns.set(id, 0);
    });
    return () => dispose?.();
  }, 'dsh-tripo-support: reset one-shot generation per user turn');
  ctx.tools.guard((execution) => {
    const generationOps = new Set(['text_to_3d', 'image_to_3d', 'multiview_to_3d']);
    const name = String(execution.name || '');
    const args = execution.arguments && typeof execution.arguments === 'object' ? execution.arguments : {};
    const isGeneration = name === 'generate_3d' || ((name === 'create_3d_task' || name === 'run_3d_operation') && generationOps.has(String(args.operation || '')));
    if (!isGeneration) return undefined;
    const agentId = execution.agent?.id || 'global';
    const count = generationTurns.get(agentId) || 0;
    if (count >= 1) return '本轮已经创建了一个 3D 生成任务。不要再次生成或对比生成；先向用户报告当前结果，并询问是否继续。';
    generationTurns.set(agentId, count + 1);
    return undefined;
  });
  ctx.inject(['systemPrompt'], (scoped) => {
    scoped.effect(() => scoped.systemPrompt.section({
      name: 'dsh-tripo-support/3d-policy',
      order: 46,
      text: [
        '3D generation policy (dsh-tripo-support):',
        '- Do only what the user explicitly asked for. If the user asks to generate a model, create exactly one 3D generation task and stop; do not add texture, retopology, rigging, segmentation, conversion, DCC/procedural modeling, or any other step unless the user explicitly requests that separate step.',
        '- If the user asks for a material/texture, topology, rigging or another post-process, perform only that operation on the referenced model; do not also regenerate or remesh it.',
        '- Never retry automatically. If the result is unsatisfactory, report what was produced and stop; ask the user whether to retry and what to change.',
        '- Never switch provider, model, or operation silently. If the requested operation needs another model in the same provider (for example qwenai Tripo texture/rig/topology models), explain the choice and ask; only after explicit user approval call select_3d_model.',
        '- Report every task result to the user, including failures, before doing anything else.',
      ].join('\n'),
    }), 'dsh-tripo-support: 3D policy');
  });

  const outputDir = () => (config.workspaceDir ? String(config.workspaceDir) : join(root, 'output'));

  const providerOrThrow = async (id) => {
    const provider = await providers.get(id);
    ensure(provider, `未知的 3D 服务：${id}`);
    return provider;
  };

  const updateRepo = String(config.updateRepo || 'OMEN111111/dsh-tripo-support');

  const versionParts = (value) => String(value || '0').replace(/^v/i, '').split('-')[0].split('.').map((part) => Number.parseInt(part, 10) || 0);
  const compareVersions = (left, right) => {
    const a = versionParts(left);
    const b = versionParts(right);
    for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
      const delta = (a[index] || 0) - (b[index] || 0);
      if (delta !== 0) return delta > 0 ? 1 : -1;
    }
    return 0;
  };

  const checkForUpdate = async () => {
    const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
    const fallback = [
      {
        url: `https://github.com/${updateRepo}/releases/latest`,
        parse: async (response) => {
          const releaseUrl = response.url || `https://github.com/${updateRepo}/releases/latest`;
          const tag = decodeURIComponent((releaseUrl.match(/\/releases\/tag\/([^/?#]+)/) || [])[1] || '');
          return { latest: tag.replace(/^v/i, ''), releaseUrl };
        },
      },
      {
        url: `https://api.github.com/repos/${updateRepo}/releases/latest`,
        parse: async (response) => {
          const release = await response.json();
          return { latest: String(release.tag_name || '').replace(/^v/i, ''), releaseUrl: release.html_url || `https://github.com/${updateRepo}/releases` };
        },
      },
      {
        url: `https://raw.githubusercontent.com/${updateRepo}/main/package.json`,
        parse: async (response) => {
          const pkg = await response.json();
          return { latest: String(pkg.version || ''), releaseUrl: `https://github.com/${updateRepo}/releases` };
        },
      },
    ];
    let found;
    let lastError;
    for (const attempt of fallback) {
      try {
        const response = await fetch(attempt.url, { redirect: 'follow', headers: { 'User-Agent': 'dsh-tripo-support' }, signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const parsed = await attempt.parse(response);
        if (parsed.latest) { found = parsed; break; }
      } catch (error) { lastError = error; }
    }
    if (!found) throw new Error(`无法连接 GitHub 检查版本：${lastError?.message || ''}`);
    const latest = found.latest.replace(/^v/i, '');
    return {
      current: packageJson.version,
      latest,
      updateAvailable: compareVersions(latest, packageJson.version) > 0,
      releaseUrl: found.releaseUrl || `https://github.com/${updateRepo}/releases`,
      notes: '',
      publishedAt: '',
      assetUrl: `https://github.com/${updateRepo}/releases/download/v${latest}/dsh-tripo-support-${latest}.tgz`,
      installSpec: `https://github.com/${updateRepo}/releases/download/v${latest}/dsh-tripo-support-${latest}.tgz`,
    };
  };

  const discoverModels = async (providerId) => {
    const provider = await providerOrThrow(String(providerId));
    const catalog = (provider.modelCatalog?.length ? provider.modelCatalog : provider.models.map((id) => ({ id, name: id }))).map((item) => ({ ...item }));
    if (provider.protocol === 'tencent') return { models: catalog, source: 'catalog', message: '腾讯云 HY3D 没有模型列表接口，已返回当前模型目录' };
    const secrets = await providers.secrets(provider);
    ensure(secrets.apiKey, `${provider.label} 还没有配置 API Key`);
    const base = provider.baseURL.replace(/\/+$/, '');
    let origin;
    try { origin = new URL(base).origin; } catch { origin = base; }
    const candidates = [
      provider.modelDiscoveryURL,
      provider.protocol === 'meshy' ? `${base}/openapi/v1/models` : undefined,
      provider.protocol === 'hyper' ? `${base}/models` : undefined,
      provider.protocol === 'dashscope' ? `${origin}/api/v1/models` : undefined,
      provider.protocol === 'tripo' ? `${base}/models` : undefined,
    ].filter(Boolean);
    let lastError;
    for (const url of candidates) {
      try {
        const response = await fetch(url, { headers: { Authorization: `Bearer ${secrets.apiKey}`, Accept: 'application/json', 'User-Agent': 'dsh-tripo-support' }, signal: AbortSignal.timeout(10000) });
        if (response.status === 401 || response.status === 403) throw new Error(`API Key 无效（HTTP ${response.status}）`);
        if (!response.ok) { lastError = new Error(`HTTP ${response.status}`); continue; }
        const json = await response.json();
        const raw = Array.isArray(json) ? json : json?.data || json?.models || json?.result || [];
        const models = (Array.isArray(raw) ? raw : []).map((item) => ({
          id: String(item?.id || item?.model || item?.name || item || '').trim(),
          name: String(item?.name || item?.display_name || item?.id || item?.model || item || '').trim(),
        })).filter((item) => item.id);
        if (models.length) {
          const seen = new Set();
          return { models: models.filter((item) => !seen.has(item.id) && seen.add(item.id)), source: 'remote', message: `已从 ${url} 读取模型` };
        }
      } catch (error) {
        lastError = error;
        if (/API Key 无效/.test(String(error.message))) throw error;
      }
    }
    return { models: catalog, source: 'catalog', message: `服务未提供模型列表，返回当前目录${lastError ? `（${lastError.message}）` : ''}` };
  };

  const status = async () => {
    await tasks.load();
    return {
      ok: true,
      providers: await providers.list(),
      operations: OPERATIONS,
      protocols: PROTOCOL_LABELS,
      selection: await providers.selection(),
      presets: await providers.presets(),
    };
  };

  const testProvider = async (providerId, model) => {
    const started = Date.now();
    try {
      const provider = await providerOrThrow(providerId);
      if (model) ensure(provider.models.includes(String(model)), `${provider.label} 不包含模型 ${model}`);
      const secrets = await providers.secrets(provider);
      if (provider.protocol === 'tencent' && provider.auth !== 'bearer') ensure(secrets.secretId && secrets.secretKey, '还没有配置 SecretId / SecretKey');
      else ensure(secrets.apiKey, '还没有配置 API Key');
      const request = buildTestRequest(provider, secrets);
      const { response, json } = await fetchJson(request.url, { method: request.method, headers: request.headers, body: request.body });
      const result = parseTestResponse(request.protocol, response.status, json);
      return { ok: true, latencyMs: Date.now() - started, message: result.message, model: model || provider.defaultModel };
    } catch (error) {
      return { ok: false, latencyMs: Date.now() - started, message: error instanceof Error ? error.message : String(error) };
    }
  };

  const createTask = async ({ providerId, operation, args = {}, signal }) => {
    const provider = await providerOrThrow(providerId);
    ensure(OPERATIONS[operation], `未知的 3D 操作：${operation}`);
    const secrets = await providers.secrets(provider);
    if (provider.protocol === 'tencent' && provider.auth !== 'bearer') ensure(secrets.secretId && secrets.secretKey, `${provider.label} 还没有配置 SecretId / SecretKey`);
    else ensure(secrets.apiKey, `${provider.label} 还没有配置 API Key`);
    const request = await buildCreateRequest(provider, operation, args, secrets);
    const { response, json } = await fetchJson(request.url, { method: request.method, headers: request.headers, body: request.body, signal });
    if (response.status >= 400) {
      // Tencent returns HTTP 200 with an error envelope; other protocols use HTTP status.
      if (!json.Response && !json.output) throw new Error(`${provider.label} 创建任务失败：HTTP ${response.status}`);
    }
    const created = parseCreateResponse(request.protocol, json);
    const record = {
      providerId,
      providerLabel: provider.label,
      protocol: provider.protocol,
      operation,
      model: request.model || args.model || provider.defaultModel,
      downloadTaskId: created.downloadTaskId,
      taskId: created.taskId,
      status: created.status,
      progress: created.progress ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await tasks.put(record);
    return { provider, record, created };
  };

  const queryTask = async ({ providerId, taskId, operation, download = false, outputDirectory, signal }) => {
    const provider = await providerOrThrow(providerId);
    const record = tasks.get(providerId, taskId);
    const op = operation || record?.operation;
    ensure(op, `找不到任务 ${taskId} 的操作类型`);
    const secrets = await providers.secrets(provider);
    if (provider.protocol === 'tencent' && provider.auth !== 'bearer') ensure(secrets.secretId && secrets.secretKey, `${provider.label} 还没有配置 SecretId / SecretKey`);
    else ensure(secrets.apiKey, `${provider.label} 还没有配置 API Key`);
    const request = buildQueryRequest(provider, taskId, op, secrets);
    const { json } = await fetchJson(request.url, { method: request.method, headers: request.headers, body: request.body, signal });
    let parsed = parseTaskResponse(request.protocol, json);
    if (provider.protocol === 'hyper' && parsed.status === 'success' && record?.downloadTaskId) {
      const downloadRequest = buildDownloadRequest(provider, record.downloadTaskId, secrets);
      const { json: downloadJson } = await fetchJson(downloadRequest.url, { method: downloadRequest.method, headers: downloadRequest.headers, body: downloadRequest.body, signal });
      const downloaded = parseDownloadResponse(downloadRequest.protocol, downloadJson);
      parsed = { ...parsed, modelUrl: downloaded.modelUrl, results: downloaded.results };
    }
    let saved;
    let preview;
    if (parsed.status === 'success' && download && parsed.modelUrl) {
      saved = await tasks.download(parsed.modelUrl, outputDirectory || record?.outputDirectory || outputDir(), { providerId, taskId });
      preview = await tasks.registerPreview(saved.file, { providerId, taskId, mediaType: saved.mediaType });
    }
    const next = {
      ...(record || { providerId, taskId, operation: op, providerLabel: provider.label, model: provider.defaultModel }),
      ...(outputDirectory ? { outputDirectory } : {}),
      status: parsed.status,
      progress: parsed.progress ?? record?.progress ?? 0,
      modelUrl: parsed.modelUrl,
      previewUrl: parsed.previewUrl,
      credits: parsed.credits,
      error: parsed.error,
      file: saved?.file || record?.file,
      bytes: saved?.bytes || record?.bytes,
      previewId: preview?.id || record?.previewId,
      mediaType: preview?.mediaType || record?.mediaType,
      updatedAt: new Date().toISOString(),
    };
    await tasks.put(next);
    return {
      provider: provider.id,
      providerLabel: provider.label,
      operation: op,
      taskId,
      status: parsed.status,
      progress: next.progress,
      modelUrl: parsed.modelUrl,
      previewUrl: parsed.previewUrl,
      previewId: next.previewId,
      mediaType: next.mediaType,
      localFile: next.file,
      bytes: next.bytes,
      credits: parsed.credits,
      error: parsed.error,
    };
  };

  const waitTask = async ({ providerId, taskId, operation, timeoutMs = MAX_WAIT_MS, download = true, outputDirectory, signal }) => {
    const started = Date.now();
    let last;
    while (Date.now() - started < Math.min(timeoutMs, MAX_WAIT_MS)) {
      last = await queryTask({ providerId, taskId, operation, download: false, signal });
      if (last.status === 'success') {
        return download ? queryTask({ providerId, taskId, operation, download: true, outputDirectory, signal }) : last;
      }
      if (last.status === 'failed' || last.status === 'cancelled' || last.status === 'unknown') return last;
      await sleep(2000, signal);
    }
    return { ...(last || { providerId, taskId, operation }), status: 'timeout', error: `等待超时（${timeoutMs}ms）` };
  };

  const runOperation = async ({ providerId, operation, args = {}, wait = true, timeoutMs = MAX_WAIT_MS, outputDirectory, signal }) => {
    const provider = await providerOrThrow(providerId);
    if (provider.protocol === 'tencent' && operation === 'convert') {
      const secrets = await providers.secrets(provider);
      if (provider.auth === 'bearer') ensure(secrets.apiKey, `${provider.label} 还没有配置 API Key`); else ensure(secrets.secretId && secrets.secretKey, `${provider.label} 还没有配置 SecretId / SecretKey`);
      const request = await buildCreateRequest(provider, operation, args, secrets);
      const { json } = await fetchJson(request.url, { method: request.method, headers: request.headers, body: request.body, signal });
      const response = json.Response || {};
      if (response.Error) throw new Error(`${response.Error.Code}: ${response.Error.Message}`);
      ensure(response.ResultFile3D, '混元3D 格式转换没有返回 ResultFile3D');
      const saved = await tasks.download(response.ResultFile3D, outputDirectory || outputDir(), { providerId, taskId: 'convert-' + Date.now() });
      const preview = await tasks.registerPreview(saved.file, { providerId, taskId: 'convert', mediaType: saved.mediaType });
      return { provider: providerId, providerLabel: provider.label, operation, model: args.model || provider.defaultModel, taskId: 'convert-' + Date.now(), status: 'success', progress: 100, previewId: preview.id, localFile: saved.file, bytes: saved.bytes, modelUrl: response.ResultFile3D };
    }
    const created = await createTask({ providerId, operation, args, signal });
    const base = {
      provider: providerId,
      providerLabel: created.provider.label,
      operation,
      model: created.record.model || args.model || created.provider.defaultModel,
      taskId: created.created.taskId,
    };
    if (!wait) return { ...base, status: created.created.status, progress: 0 };
    const finished = await waitTask({ providerId, taskId: created.created.taskId, operation, timeoutMs, outputDirectory, signal });
    return {
      ...base,
      status: finished.status,
      progress: finished.progress,
      previewUrl: finished.previewUrl,
      previewId: finished.previewId,
      mediaType: finished.mediaType,
      localFile: finished.localFile,
      bytes: finished.bytes,
      modelUrl: finished.modelUrl,
      credits: finished.credits,
      error: finished.error,
    };
  };

  const previewURL = (previewId) => (previewId ? `${ROUTE_PREFIX}/model/${encodeURIComponent(previewId)}` : undefined);

  const verifyWebhook = (signature, rawBody, secret) => {
    const match = String(signature || '').match(/t=(\d+),v1=([0-9a-f]{64})/i);
    ensure(match, '缺少有效的 Webhook 签名');
    const expected = createHmac('sha256', secret).update(`${match[1]}.${rawBody}`).digest('hex');
    const actual = Buffer.from(match[2], 'hex');
    const wanted = Buffer.from(expected, 'hex');
    ensure(actual.length === wanted.length && timingSafeEqual(actual, wanted), 'Webhook 签名校验失败');
  };
  const summarize = (result) => {
    const bits = [`${result.operation}`, result.model || '', result.status || ''];
    if (result.localFile) bits.push(`已保存 ${result.localFile}`);
    if (result.error) bits.push(`错误：${result.error}`);
    return bits.filter(Boolean).join(' · ');
  };

  // Tool definitions -------------------------------------------------------
  ctx.tools.register({
    name: 'list_3d_providers',
    description: 'List configured 3D services (Tripo, Meshy, Hyper3D, Tencent Hunyuan3D, qianwenai and custom relays), their models, operations and credential status. Call once before choosing a provider.',
    parameters: { type: 'object', properties: {} },
    output: {
      schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          providers: { type: 'array', items: { type: 'object', additionalProperties: true } },
          operations: { type: 'object', additionalProperties: true },
        },
        required: ['summary', 'providers'],
        additionalProperties: true,
      },
      render: (_args, value) => [{ type: 'text', text: value.summary }],
      presentationMeta: (_args, value) => ({ kind: 'dsh-tripo-support', ...value }),
    },
    async execute() {
      const snapshot = await status();
      const lines = snapshot.providers.map((provider) => {
        const ops = provider.operations.map((id) => OPERATIONS[id]?.label || id).join('、');
        return `${provider.id}（${provider.label}，${PROTOCOL_LABELS[provider.protocol]}）：${provider.configured ? '密钥已配置' : '密钥未配置'}；模型 ${provider.models.join(', ') || '无'}；操作 ${ops}`;
      });
      return { summary: lines.join('\n'), providers: snapshot.providers, operations: OPERATIONS };
    },
  });

  ctx.tools.register({
    name: 'list_3d_tasks',
    description: 'List recent local 3D task records (provider, operation, status, task id, downloaded file, preview id). Use when the user asks about earlier 3D jobs.',
    parameters: { type: 'object', properties: {} },
    output: {
      schema: {
        type: 'object',
        properties: { summary: { type: 'string' }, tasks: { type: 'array', items: { type: 'object', additionalProperties: true } } },
        required: ['summary', 'tasks'],
        additionalProperties: true,
      },
      render: (_args, value) => [{ type: 'text', text: value.summary }],
      presentationMeta: (_args, value) => ({ kind: 'dsh-tripo-support', ...value }),
    },
    async execute() {
      const list = tasks.list().slice(-50).reverse().map((task) => ({ provider: task.providerId, providerLabel: task.providerLabel, operation: task.operation, model: task.model, taskId: task.taskId, status: task.status, file: task.file, previewId: task.previewId, updatedAt: task.updatedAt }));
      return { summary: list.length ? list.map((task) => `${task.taskId} ${task.providerLabel || task.provider} ${task.operation} ${task.status}`).join('\n') : '还没有本地 3D 任务记录', tasks: list };
    },
  });

  ctx.tools.register({
    name: 'batch_query_3d_tasks',
    description: 'Query multiple Tripo async task ids in one request (Tripo v3 POST /tasks/list, max 100). Returns task statuses and any missed ids.',
    parameters: { type: 'object', properties: { provider: { type: 'string' }, taskIds: { type: 'array', items: { type: 'string' } } }, required: ['taskIds'] },
    output: {
      schema: { type: 'object', properties: { summary: { type: 'string' }, tasks: { type: 'array', items: { type: 'object', additionalProperties: true } }, missed: { type: 'array', items: { type: 'string' } } }, required: ['summary', 'tasks'], additionalProperties: true },
      render: (_args, value) => [{ type: 'text', text: value.summary }],
      presentationMeta: (_args, value) => ({ kind: 'dsh-tripo-support', ...value }),
    },
    async execute(args) {
      const providerId = String(args.provider || 'tripo-official');
      const provider = await providerOrThrow(providerId);
      ensure(provider.protocol === 'tripo', '批量查询目前仅支持 Tripo v3 协议');
      ensure(Array.isArray(args.taskIds) && args.taskIds.length > 0, 'taskIds 不能为空');
      const secrets = await providers.secrets(provider);
      ensure(secrets.apiKey, `${provider.label} 还没有配置 API Key`);
      const { json } = await fetchJson(`${provider.baseURL.replace(/\/+$/, '')}/tasks/list`, { method: 'POST', headers: { Authorization: `Bearer ${secrets.apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ task_ids: args.taskIds.slice(0, 100) }) });
      if (json.code !== 0) throw new Error(json.message || `批量查询失败 code ${json.code}`);
      const tasks = Object.values(json.data?.tasks || {});
      const missed = json.data?.missed || [];
      return { summary: `批量查询 ${tasks.length} 个任务${missed.length ? `，${missed.length} 个未找到` : ''}`, tasks, missed };
    },
  });

  ctx.tools.register({
    name: 'select_3d_model',
    description: 'Change the active 3D provider/model for the composer pill. Call this only after the user explicitly agrees to switch; never switch silently. Use it when an operation needs a different model in the same provider (for example qwenai Tripo texture/rig/topology models).',
    parameters: {
      type: 'object',
      properties: {
        provider: { type: 'string', description: 'Provider id.' },
        model: { type: 'string', description: 'Model id from list_3d_providers.' },
        userApproved: { type: 'boolean', description: 'Set true only after the user explicitly approved this switch.' },
        reason: { type: 'string', description: 'One short sentence shown to the user explaining the switch.' },
      },
      required: ['provider', 'model', 'userApproved'],
    },
    output: {
      schema: {
        type: 'object',
        properties: { summary: { type: 'string' }, provider: { type: 'string' }, model: { type: 'string' } },
        required: ['summary', 'provider', 'model'],
        additionalProperties: true,
      },
      render: (_args, value) => [{ type: 'text', text: value.summary }],
      presentationMeta: (_args, value) => ({ kind: 'dsh-tripo-support-selection', ...value }),
    },
    async execute(args) {
      ensure(args.userApproved === true, '切换 3D 模型需要用户明确同意');
      const provider = await providerOrThrow(String(args.provider));
      ensure(provider.models.includes(String(args.model)), `${provider.label} 不包含模型 ${args.model}`);
      const selection = await providers.setSelection({ providerId: provider.id, model: String(args.model) });
      return { summary: `已切换 3D 模型：${provider.label} · ${selection.model}${args.reason ? `（${args.reason}）` : ''}`, provider: provider.id, model: selection.model };
    },
  });

  ctx.tools.register({
    name: 'create_3d_task',
    description: 'Create exactly one asynchronous 3D task for the user request. Do not retry, do not add texture/retopology/rigging or any follow-up operation unless the user explicitly asked for it. Returns a task id and stops so the result can be reported to the user.',
    parameters: {
      type: 'object',
      properties: {
        provider: { type: 'string', description: 'Provider id from list_3d_providers, for example tripo-official, qwenai-dashscope, hy3d-official.' },
        operation: { type: 'string', description: 'Operation id: text_to_3d, image_to_3d, multiview_to_3d, texture, segment, smart_segment, retopology, uv, mesh_complete, convert, rig_check, auto_rig, animation_retarget, image_to_splat, part, reduce_face, motion, profile_to_3d.' },
        model: { type: 'string', description: 'Model id; omit for the provider default.' },
        prompt: { type: 'string' },
        imageUrl: { type: 'string' },
        imageUrls: { type: 'array', items: { type: 'string' } },
        sourceTaskId: { type: 'string' },
        modelUrl: { type: 'string' },
        format: { type: 'string' },
        outFormat: { type: 'string' },
        size: { type: 'string', description: 'Image generation size, for example 2048x2048 or 2K.' },
        animations: { type: 'array', items: { type: 'string' } },
        texturePrompt: { type: 'string' },
        faceLimit: { type: 'integer' },
        faceCount: { type: 'integer' },
        faceLevel: { type: 'string', description: 'Tencent reduce-face level: high, medium, or low.' },
        motionType: { type: 'integer', description: 'Tencent auto-rigging preset motion type.' },
        template: { type: 'string', description: 'Tencent profile-to-3D template name.' },
        duration: { type: 'integer', description: 'Tencent motion duration in seconds (1-12).' },
        modelVersion: { type: 'string', description: 'Protocol model version for segmentation or retopology.' },
        granularity: { type: 'string', description: 'Segmentation granularity.' },
        segType: { type: 'string', description: 'Smart segmentation type: image or model.' },
        hint: { type: 'string', description: 'Segmentation hint text.' },
        smartUv: { type: 'boolean', description: 'Unwrap UVs during retopology (Tripo v3.0).' },
        imageBase64: { type: 'string', description: 'Inline base64 image for providers that accept it.' },
        quad: { type: 'boolean' },
        pbr: { type: 'boolean' },
        rigType: { type: 'string' },
        spec: { type: 'string' },
        parameters: { type: 'object', additionalProperties: true, description: 'Protocol-specific parameters passed through to the provider.' },
      },
      required: ['provider', 'operation'],
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          provider: { type: 'string' },
          operation: { type: 'string' },
          model: { type: 'string' },
          taskId: { type: 'string' },
          status: { type: 'string' },
          previewUrl: { type: 'string' },
        },
        required: ['summary', 'provider', 'operation', 'taskId', 'status'],
        additionalProperties: true,
      },
      render: (_args, value) => [{ type: 'text', text: value.summary }],
      presentationMeta: (_args, value) => ({ kind: 'dsh-tripo-support', ...value }),
    },
    async execute(args, exec) {
      const outputDirectory = await sessionOutputDir(ctx, exec, outputDir());
      const created = await createTask({
        providerId: String(args.provider),
        operation: String(args.operation),
        args,
        signal: exec.signal,
      });
      return {
        summary: `已创建 ${created.provider.label} 的 ${args.operation} 任务：${created.created.taskId}（${created.created.status}）`,
        provider: created.provider.id,
        operation: args.operation,
        model: created.record.model || args.model || created.provider.defaultModel,
        taskId: created.created.taskId,
        status: created.created.status,
        outputDirectory,
      };
    },
  });

  ctx.tools.register({
    name: 'get_3d_task',
    description: 'Query one asynchronous 3D task by task id. Returns status, progress, result URLs, and optionally downloads the finished model into the workspace.',
    parameters: {
      type: 'object',
      properties: {
        provider: { type: 'string' },
        taskId: { type: 'string' },
        operation: { type: 'string' },
        download: { type: 'boolean', description: 'Download the finished model into the workspace (default true).' },
      },
      required: ['provider', 'taskId'],
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          provider: { type: 'string' },
          taskId: { type: 'string' },
          status: { type: 'string' },
          progress: { type: 'integer' },
          previewUrl: { type: 'string' },
          localFile: { type: 'string' },
        },
        required: ['summary', 'provider', 'taskId', 'status'],
        additionalProperties: true,
      },
      render: (_args, value) => [{ type: 'text', text: value.summary }],
      presentationMeta: (_args, value) => ({ kind: 'dsh-tripo-support', ...value }),
    },
    async execute(args, exec) {
      const result = await queryTask({
        providerId: String(args.provider),
        taskId: String(args.taskId),
        operation: args.operation ? String(args.operation) : undefined,
        download: args.download !== false,
        outputDirectory: await sessionOutputDir(ctx, exec, outputDir()),
        signal: exec.signal,
      });
      return { ...result, summary: summarize(result) };
    },
  });

  ctx.tools.register({
    name: 'wait_3d_task',
    description: 'Poll one asynchronous 3D task until it finishes, then download the model into the workspace. Use after create_3d_task when the next step depends on the finished asset.',
    parameters: {
      type: 'object',
      properties: {
        provider: { type: 'string' },
        taskId: { type: 'string' },
        operation: { type: 'string' },
        timeoutMs: { type: 'integer', description: 'Maximum wait in milliseconds (default 600000).' },
      },
      required: ['provider', 'taskId'],
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          provider: { type: 'string' },
          taskId: { type: 'string' },
          status: { type: 'string' },
          progress: { type: 'integer' },
          previewUrl: { type: 'string' },
          localFile: { type: 'string' },
        },
        required: ['summary', 'provider', 'taskId', 'status'],
        additionalProperties: true,
      },
      render: (_args, value) => [{ type: 'text', text: value.summary }],
      presentationMeta: (_args, value) => ({ kind: 'dsh-tripo-support', ...value }),
    },
    async execute(args, exec) {
      const result = await waitTask({
        providerId: String(args.provider),
        taskId: String(args.taskId),
        operation: args.operation ? String(args.operation) : undefined,
        timeoutMs: Number(args.timeoutMs || MAX_WAIT_MS),
        download: true,
        outputDirectory: await sessionOutputDir(ctx, exec, outputDir()),
        signal: exec.signal,
      });
      return { ...result, summary: summarize(result) };
    },
    timeoutMs: 600000,
  });

  ctx.tools.register({
    name: 'run_3d_operation',
    description: 'Perform exactly one 3D operation (generation, texture, segmentation, retopology, conversion, rigging, animation) and download the result. Do not chain or retry operations; report the result and ask before any follow-up.',
    parameters: {
      type: 'object',
      properties: {
        provider: { type: 'string' },
        operation: { type: 'string' },
        model: { type: 'string' },
        prompt: { type: 'string' },
        imageUrl: { type: 'string' },
        imageUrls: { type: 'array', items: { type: 'string' } },
        sourceTaskId: { type: 'string' },
        modelUrl: { type: 'string' },
        format: { type: 'string' },
        outFormat: { type: 'string' },
        size: { type: 'string', description: 'Image generation size, for example 2048x2048 or 2K.' },
        animations: { type: 'array', items: { type: 'string' } },
        texturePrompt: { type: 'string' },
        faceLimit: { type: 'integer' },
        faceCount: { type: 'integer' },
        faceLevel: { type: 'string', description: 'Tencent reduce-face level: high, medium, or low.' },
        motionType: { type: 'integer', description: 'Tencent auto-rigging preset motion type.' },
        template: { type: 'string', description: 'Tencent profile-to-3D template name.' },
        duration: { type: 'integer', description: 'Tencent motion duration in seconds (1-12).' },
        modelVersion: { type: 'string', description: 'Protocol model version for segmentation or retopology.' },
        granularity: { type: 'string', description: 'Segmentation granularity.' },
        segType: { type: 'string', description: 'Smart segmentation type: image or model.' },
        hint: { type: 'string', description: 'Segmentation hint text.' },
        smartUv: { type: 'boolean', description: 'Unwrap UVs during retopology (Tripo v3.0).' },
        imageBase64: { type: 'string', description: 'Inline base64 image for providers that accept it.' },
        quad: { type: 'boolean' },
        pbr: { type: 'boolean' },
        rigType: { type: 'string' },
        spec: { type: 'string' },
        parameters: { type: 'object', additionalProperties: true },
      },
      required: ['provider', 'operation'],
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          provider: { type: 'string' },
          operation: { type: 'string' },
          model: { type: 'string' },
          taskId: { type: 'string' },
          status: { type: 'string' },
          progress: { type: 'integer' },
          previewUrl: { type: 'string' },
          localFile: { type: 'string' },
          bytes: { type: 'integer' },
        },
        required: ['summary', 'provider', 'operation', 'taskId', 'status'],
        additionalProperties: true,
      },
      render: (_args, value) => [{ type: 'text', text: value.summary }],
      presentationMeta: (_args, value) => ({ kind: 'dsh-tripo-support', ...value }),
    },
    timeoutMs: 600000,
    async execute(args, exec) {
      const result = await runOperation({
        providerId: String(args.provider),
        operation: String(args.operation),
        args,
        timeoutMs: MAX_WAIT_MS,
        outputDirectory: await sessionOutputDir(ctx, exec, outputDir()),
        signal: exec.signal,
      });
      return { ...result, previewUrl: previewURL(result.previewId), summary: summarize(result) };
    },
  });

  ctx.tools.register({
    name: 'generate_3d',
    description: 'Generate exactly one 3D model from text or images and stop. Do not auto-texture, retopologize, rig, retry or invoke DCC tools unless the user explicitly asks for that separate operation.',
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Text prompt for text-to-3D.' },
        imageUrl: { type: 'string', description: 'Single image URL for image-to-3D.' },
        imageUrls: { type: 'array', items: { type: 'string' }, description: '2-4 image URLs for multiview-to-3D.' },
        provider: { type: 'string', description: 'Provider id; omit for the configured default.' },
        model: { type: 'string' },
        parameters: { type: 'object', additionalProperties: true },
      },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          provider: { type: 'string' },
          operation: { type: 'string' },
          model: { type: 'string' },
          taskId: { type: 'string' },
          status: { type: 'string' },
          previewUrl: { type: 'string' },
          localFile: { type: 'string' },
          bytes: { type: 'integer' },
        },
        required: ['summary', 'provider', 'operation', 'taskId', 'status'],
        additionalProperties: true,
      },
      render: (_args, value) => [{ type: 'text', text: value.summary }],
      presentationMeta: (_args, value) => ({ kind: 'dsh-tripo-support', ...value }),
    },
    timeoutMs: 600000,
    async execute(args, exec) {
      const list = await providers.list();
      const selected = await providers.selection();
      const providerId = args.provider || selected?.providerId || list.find((item) => item.configured)?.id || list[0]?.id;
      ensure(providerId, '没有可用的 3D 服务');
      const operation = (args.imageUrls && args.imageUrls.length > 1) ? 'multiview_to_3d' : (args.imageUrl ? 'image_to_3d' : 'text_to_3d');
      const result = await runOperation({
        providerId,
        operation,
        args,
        timeoutMs: MAX_WAIT_MS,
        outputDirectory: await sessionOutputDir(ctx, exec, outputDir()),
        signal: exec.signal,
      });
      return { ...result, previewUrl: previewURL(result.previewId), summary: summarize(result) };
    },
  });

  // Same-origin control surface for the Models card and the composer pill.
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
      if (req.method === 'GET' && path === '/update/check') return send(200, { ok: true, ...(await checkForUpdate()) });
      if (req.method === 'GET' && path === '/viewer3d.js') {
        const script = await readFile(new URL('./assets/viewer3d.js', import.meta.url));
        res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Content-Length': script.length, 'Cache-Control': 'public, max-age=86400' });
        return res.end(script);
      }
      if (req.method === 'GET' && path === '/model-viewer.js') {
        const script = await readFile(new URL('./assets/model-viewer.min.js', import.meta.url));
        res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Content-Length': script.length, 'Cache-Control': 'public, max-age=86400' });
        return res.end(script);
      }
      if (req.method === 'GET' && path === '/workshop/models') {
        const snapshot = await workshopSnapshot({ scope: url.searchParams.get('scope') || 'current', path: url.searchParams.get('path') || '' });
        return send(200, { ok: true, ...snapshot });
      }
      if (req.method === 'GET' && path === '/workshop/balance') {
        return send(200, await workshopBalance(url.searchParams.get('provider') || ''));
      }
      if (req.method === 'GET' && path === '/workshop/model') {
        const requested = String(url.searchParams.get('path') || '');
        ensure(requested, '缺少模型路径');
        const absolute = resolve(requested);
        ensure(WORKSHOP_MODEL_EXTENSIONS.has(extname(absolute).toLowerCase()), '不支持的模型格式');
        const workspaces = await workspaceRecords();
        const allowed = workspaces.some((workspace) => isWithin(absolute, join(workspace.path, '3d-output')));
        ensure(allowed, '模型不在工作区的 3d-output 目录中');
        const real = await realpath(absolute);
        ensure(workspaces.some((workspace) => isWithin(real, join(workspace.path, '3d-output'))), '模型路径不在工作区中');
        const info = await stat(real);
        ensure(info.isFile(), '模型文件不存在');
        const file = await readFile(real);
        res.writeHead(200, { 'Content-Type': mimeFor(real), 'Content-Length': file.length, 'Cache-Control': 'private, max-age=60' });
        return res.end(file);
      }
      const modelMatch = path.match(/^\/model\/([^/]+)$/);
      if (req.method === 'GET' && modelMatch) {
        const preview = tasks.resolvePreview(decodeURIComponent(modelMatch[1]));
        if (!preview) return send(404, { ok: false, error: 'model not found' });
        const file = await readFile(preview.file);
        res.writeHead(200, { 'Content-Type': preview.mediaType || 'application/octet-stream', 'Content-Length': file.length, 'Cache-Control': 'private, max-age=3600' });
        return res.end(file);
      }
      if (req.method === 'GET' && path === '/task') {
        const providerId = url.searchParams.get('provider') || '';
        const taskId = url.searchParams.get('taskId') || '';
        const result = await queryTask({ providerId, taskId, operation: url.searchParams.get('operation') || undefined, download: url.searchParams.get('download') !== '0' });
        return send(200, { ok: true, result: { ...result, previewUrl: previewURL(result.previewId) } });
      }
      if (req.method !== 'POST') return send(405, { ok: false, error: 'method not allowed' });
      const chunks = [];
      let bytes = 0;
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > MAX_BODY_BYTES) return send(413, { ok: false, error: 'request too large' });
        chunks.push(chunk);
      }
      const text = Buffer.concat(chunks).toString('utf8');
      const body = text ? JSON.parse(text) : {};
      if (path === '/update/apply') {
        const check = await checkForUpdate();
        ensure(check.updateAvailable, '当前已是最新版本');
        const manager = ctx.get('pluginManager');
        ensure(manager?.installBundle, '当前 DSH 没有提供插件管理服务');
        const requestId = `dsh-tripo-support-${randomUUID()}`;
        const result = await manager.installBundle(check.installSpec, { enabled: true, saveExact: true, requestId });
        return send(200, { ok: true, check, result });
      }
      if (path.startsWith('/webhook/')) {
        const providerId = decodeURIComponent(path.slice('/webhook/'.length));
        const provider = await providerOrThrow(providerId);
        const secret = await providers.webhookSecret(provider);
        ensure(secret, '该服务还没有配置 Webhook Secret');
        verifyWebhook(req.headers['tripo-webhook-signature'], text, secret);
        const eventType = String(body.type || '');
        if (eventType === 'task.completed' || eventType === 'task.failed') {
          const taskId = String(body.data?.task_id || '');
          if (taskId) {
            const current = tasks.get(providerId, taskId);
            if (current) await tasks.patch(providerId, taskId, { status: eventType === 'task.completed' ? 'success' : 'failed', webhookEvent: eventType, webhookAt: new Date().toISOString() });
          }
        }
        return send(200, { ok: true });
      }
      if (path === '/test') return send(200, { ok: true, result: await testProvider(String(body.providerId), body.model ? String(body.model) : undefined) });
      if (path === '/models/discover') return send(200, { ok: true, ...(await discoverModels(String(body.providerId))) });
      if (path === '/selection') return send(200, { ok: true, selection: await providers.setSelection(body) });
      if (path === '/key') return send(200, { ok: true, provider: await providers.setKey(body) });
      if (path === '/key/clear') return send(200, { ok: true, provider: await providers.clearKey(String(body.providerId)) });
      if (path === '/provider') return send(200, { ok: true, provider: await providers.add(body) });
      if (path === '/provider/official') return send(200, { ok: true, provider: await providers.addOfficial(String(body.presetId)) });
      if (path === '/provider/update') return send(200, { ok: true, provider: await providers.update(body) });
      if (path === '/provider/delete') return send(200, await providers.remove(String(body.providerId)));
      if (path === '/workshop/upload') {
        return send(200, await workshopUpload(body));
      }
      if (path === '/workshop/generate') {
        const providerId = String(body.providerId || '');
        const operation = String(body.operation || '');
        const provider = await providerOrThrow(providerId);
        ensure(operationsFor(provider.protocol).includes(operation), `${provider.label} 不支持操作 ${operation}`);
        let outputDirectory = outputDir();
        if (body.workspacePath) {
          const workspace = await allowedWorkspace(String(body.workspacePath));
          ensure(workspace, '生成目标工作区不存在');
          outputDirectory = join(workspace.path, '3d-output');
        }
        const args = {
          ...(body.args && typeof body.args === 'object' ? body.args : {}),
          model: body.model ? String(body.model) : provider.defaultModel,
        };
        if (provider.protocol === 'tencent' && operation === 'convert') {
          const result = await runOperation({ providerId, operation, args, outputDirectory });
          return send(200, { ok: true, result: { ...result, previewUrl: previewURL(result.previewId) } });
        }
        const created = await createTask({ providerId, operation, args });
        await tasks.patch(providerId, created.created.taskId, { outputDirectory });
        return send(200, {
          ok: true,
          task: {
            provider: providerId,
            providerLabel: provider.label,
            operation,
            model: created.record.model,
            taskId: created.created.taskId,
            status: created.created.status,
            outputDirectory,
          },
        });
      }
      if (path === '/operation') {
        const result = await runOperation({
          providerId: String(body.providerId),
          operation: String(body.operation),
          args: body,
          timeoutMs: Math.min(Number(body.timeoutMs || MAX_WAIT_MS), MAX_WAIT_MS),
          outputDirectory: outputDir(),
        });
        return send(200, { ok: true, result: { ...result, previewUrl: previewURL(result.previewId) } });
      }
      if (path === '/generate') {
        const list = await providers.list();
        const providerId = String(body.providerId || list.find((item) => item.configured)?.id || list[0]?.id);
        const operation = (body.imageUrls && body.imageUrls.length > 1) ? 'multiview_to_3d' : (body.imageUrl ? 'image_to_3d' : 'text_to_3d');
        const result = await runOperation({ providerId, operation, args: body, outputDirectory: outputDir() });
        return send(200, { ok: true, result: { ...result, previewUrl: previewURL(result.previewId) } });
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

async function sessionOutputDir(ctx, exec, fallback) {
  const workingDirectory = ctx.get('workingDirectory');
  if (workingDirectory && exec?.agent) {
    try {
      const dir = await workingDirectory.ensure(exec.agent, exec.signal);
      if (dir) return join(dir, '3d-output');
    } catch {
      /* fall back to the plugin output directory */
    }
  }
  return fallback;
}





























