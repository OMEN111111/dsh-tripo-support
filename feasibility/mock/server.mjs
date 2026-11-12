/**
 * Local mock of the two official async 3D protocols used by the feasibility
 * plugin. It deliberately keeps the wire shapes from the official docs:
 *
 *   Tripo v3:  POST /v3/generation/text-to-model, GET /v3/tasks/:id
 *   Hunyuan3D: POST / with X-TC-Action Submit/Query... (TC3 signed)
 *
 * The same Tripo handler is also mounted under /relay/tripo to emulate a
 * third-party API-key relay with a different Base URL and key.
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { createHash, createHmac, randomUUID } from 'node:crypto';

const PORT = Number(process.env.MOCK_PORT || 6123);
const HOST = '127.0.0.1';
const TRIPO_OFFICIAL_KEY = 'test-tripo-key';
const TRIPO_RELAY_KEY = 'thirdparty-key';
const DASHSCOPE_KEY = 'test-dashscope-key';
const HY3D_SECRET_ID = 'test-hy3d-secret-id';
const HY3D_SECRET_KEY = 'test-hy3d-secret-key';
const HY3D_API_KEY = 'test-hy3d-api-key';
const MESHY_KEY = 'test-meshy-key';
const HYPER_KEY = 'test-hyper-key';
const meshyTasks = new Map();
const hyperTasks = new Map();
const STARTED = Date.now();

const tasks = new Map();
const dashTasks = new Map();
const requests = [];

function makeGlb() {
  const positions = new Float32Array([
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,
  ]);
  const normals = new Float32Array(24);
  for (let i = 0; i < 8; i += 1) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];
    const length = Math.hypot(x, y, z) || 1;
    normals[i * 3] = x / length;
    normals[i * 3 + 1] = y / length;
    normals[i * 3 + 2] = z / length;
  }
  const indices = new Uint16Array([
    0, 2, 1, 0, 3, 2,
    4, 5, 6, 4, 6, 7,
    0, 1, 5, 0, 5, 4,
    2, 3, 7, 2, 7, 6,
    1, 2, 6, 1, 6, 5,
    0, 4, 7, 0, 7, 3,
  ]);
  const positionBuffer = Buffer.from(positions.buffer);
  const normalBuffer = Buffer.from(normals.buffer);
  const indexBuffer = Buffer.from(indices.buffer);
  const bin = Buffer.concat([positionBuffer, normalBuffer, indexBuffer]);
  const json = {
    asset: { version: '2.0', generator: 'dsh-tripo-support-feasibility-mock' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 0 }] }],
    materials: [{ pbrMetallicRoughness: { baseColorFactor: [0.36, 0.55, 1, 1], metallicFactor: 0.1, roughnessFactor: 0.45 } }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 8, type: 'VEC3', min: [-0.5, -0.5, -0.5], max: [0.5, 0.5, 0.5] },
      { bufferView: 1, componentType: 5126, count: 8, type: 'VEC3' },
      { bufferView: 2, componentType: 5123, count: 36, type: 'SCALAR' },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: positionBuffer.length },
      { buffer: 0, byteOffset: positionBuffer.length, byteLength: normalBuffer.length },
      { buffer: 0, byteOffset: positionBuffer.length + normalBuffer.length, byteLength: indexBuffer.length },
    ],
    buffers: [{ byteLength: bin.length }],
  };
  let jsonBuf = Buffer.from(JSON.stringify(json), 'utf8');
  const jsonPad = (4 - (jsonBuf.length % 4)) % 4;
  if (jsonPad) jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)]);
  const binPad = (4 - (bin.length % 4)) % 4;
  const binBuf = binPad ? Buffer.concat([bin, Buffer.alloc(binPad)]) : bin;
  const total = 12 + 8 + jsonBuf.length + 8 + binBuf.length;
  const header = Buffer.alloc(12);
  header.write('glTF', 0, 'ascii');
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(total, 8);
  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonBuf.length, 0);
  jsonHeader.writeUInt32LE(0x4e4f534a, 4);
  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(binBuf.length, 0);
  binHeader.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([header, jsonHeader, jsonBuf, binHeader, binBuf]);
}

const GLB = makeGlb();
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64',
);

function sendJson(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
    'Cache-Control': 'no-store',
  });
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function tripoAuth(req, expected) {
  return req.headers.authorization === `Bearer ${expected}`;
}

function sha256Hex(value) {
  return createHash('sha256').update(value).digest('hex');
}

function hmac(key, value) {
  return createHmac('sha256', key).update(value).digest();
}

/**
 * Recompute the TC3-HMAC-SHA256 signature from the actual request. This makes
 * the mock a real verifier for the plugin's signing code instead of a header
 * shape check.
 */
function verifyTc3(req, rawBody) {
  const authorization = String(req.headers.authorization || '');
  const match = authorization.match(/^TC3-HMAC-SHA256 Credential=([^/]+)\/([^/]+)\/([^/]+)\/tc3_request, SignedHeaders=([^,]+), Signature=([0-9a-f]+)$/);
  if (!match) return { ok: false, code: 'AuthFailure.SignatureMissing', message: 'Malformed TC3 authorization header.' };
  const [, secretId, date, service, signedHeaders, signature] = match;
  if (secretId !== HY3D_SECRET_ID) return { ok: false, code: 'AuthFailure.SecretIdNotFound', message: 'The SecretId is not found.' };
  if (service !== 'ai3d') return { ok: false, code: 'AuthFailure.SignatureFailure', message: 'Unexpected service in credential scope.' };
  const timestamp = String(req.headers['x-tc-timestamp'] || '');
  if (!timestamp) return { ok: false, code: 'AuthFailure.SignatureFailure', message: 'Missing X-TC-Timestamp.' };
  const contentType = String(req.headers['content-type'] || '');
  const host = String(req.headers.host || '');
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\n`;
  const canonicalRequest = ['POST', '/', '', `${canonicalHeaders}\n${signedHeaders}`, sha256Hex(rawBody)].join('\n');
  const credentialScope = `${date}/ai3d/tc3_request`;
  const stringToSign = ['TC3-HMAC-SHA256', timestamp, credentialScope, sha256Hex(canonicalRequest)].join('\n');
  const secretDate = hmac(`TC3${HY3D_SECRET_KEY}`, date);
  const secretService = hmac(secretDate, 'ai3d');
  const secretSigning = hmac(secretService, 'tc3_request');
  const expected = createHmac('sha256', secretSigning).update(stringToSign).digest('hex');
  if (expected !== signature) return { ok: false, code: 'AuthFailure.SignatureFailure', message: 'The signature does not match the request.' };
  return { ok: true };
}

function createTask(type, payload, provider) {
  const task = {
    id: randomUUID(),
    type,
    provider,
    status: 'queued',
    progress: 0,
    createdAt: Date.now(),
    payload,
    error: null,
  };
  tasks.set(task.id, task);
  return task;
}

function tick(task, phases = { queued: 1200, running: 4000 }) {
  const elapsed = Date.now() - task.createdAt;
  if (elapsed < phases.queued) {
    task.status = 'queued';
    task.progress = 0;
  } else if (elapsed < phases.running) {
    task.status = 'running';
    task.progress = Math.min(99, Math.round(((elapsed - phases.queued) / (phases.running - phases.queued)) * 100));
  } else {
    task.status = 'success';
    task.progress = 100;
  }
  return task;
}

function tripoResult(req, task) {
  const origin = `http://${req.headers.host || `${HOST}:${PORT}`}`;
  return {
    task_id: task.id,
    type: task.type,
    status: task.status,
    progress: task.progress,
    output: task.status === 'success' ? {
      model_url: `${origin}/files/${task.id}.glb`,
      rendered_image_url: `${origin}/files/${task.id}.png`,
    } : undefined,
    credits_consumed: task.status === 'success' ? 5 : 0,
    created_at: new Date(task.createdAt).toISOString(),
    completed_at: task.status === 'success' ? new Date().toISOString() : undefined,
  };
}

async function handleTripo(req, res, url, expectedKey) {
  if (url.pathname === '/account/balance') {
    if (!tripoAuth(req, expectedKey)) return sendJson(res, 401, { code: 2, status: 'error', message: 'Authentication required' });
    return sendJson(res, 200, { code: 0, data: { balance: 100.0, frozen: 0 } });
  }
  if (url.pathname === '/generation/text-to-model' && req.method === 'POST') {
    if (!tripoAuth(req, expectedKey)) return sendJson(res, 401, { code: 2, status: 'error', message: 'Authentication required' });
    const body = JSON.parse((await readBody(req)) || '{}');
    if (!body.prompt || !body.model) return sendJson(res, 400, { code: 1004, status: 'error', message: 'prompt and model are required' });
    const task = createTask('text_to_model', body, 'tripo');
    return sendJson(res, 200, { code: 0, data: { task_id: task.id } });
  }
  if (req.method === 'POST' && /^\/(generation|models|mesh|animations)\//.test(url.pathname)) {
    if (!tripoAuth(req, expectedKey)) return sendJson(res, 401, { code: 2, status: 'error', message: 'Authentication required' });
    const body = JSON.parse((await readBody(req)) || '{}');
    const task = createTask(url.pathname.replace(/^\//, '').replace(/\//g, '_'), body, 'tripo');
    return sendJson(res, 200, { code: 0, data: { task_id: task.id } });
  }  const match = url.pathname.match(/^\/tasks\/([^/]+)$/);
  if (match && req.method === 'GET') {
    if (!tripoAuth(req, expectedKey)) return sendJson(res, 401, { code: 2, status: 'error', message: 'Authentication required' });
    const task = tasks.get(match[1]);
    if (!task) return sendJson(res, 404, { code: 2001, status: 'error', message: 'The task is not found' });
    tick(task);
    return sendJson(res, 200, { code: 0, data: tripoResult(req, task) });
  }
  return sendJson(res, 404, { code: 4001, status: 'error', message: `No endpoint found: ${req.method} ${url.pathname}` });
}

function dashStatusFor(task) {
  const elapsed = Date.now() - task.createdAt;
  if (elapsed < 800) return { status: 'PENDING', progress: 0 };
  if (elapsed < 2600) return { status: 'RUNNING', progress: Math.min(90, Math.round(((elapsed - 800) / 1800) * 100)) };
  return { status: 'SUCCEEDED', progress: 100 };
}

async function handleDashscope(req, res, url) {
  if (req.headers.authorization !== `Bearer ${DASHSCOPE_KEY}`) {
    return sendJson(res, 401, { code: 'InvalidApiKey', message: 'No API-key provided.', request_id: randomUUID() });
  }
  if (url.pathname === '/api/v1/services/aigc/video-generation/3d-generation' && req.method === 'POST') {
    if (String(req.headers['x-dashscope-async'] || '') !== 'enable') {
      return sendJson(res, 400, { code: 'InvalidParameter', message: 'X-DashScope-Async must be enable', request_id: randomUUID() });
    }
    const body = JSON.parse((await readBody(req)) || '{}');
    if (!body.model) return sendJson(res, 400, { code: 'InvalidParameter', message: 'model is required', request_id: randomUUID() });
    const task = {
      id: randomUUID(),
      model: body.model,
      input: body.input || {},
      parameters: body.parameters || {},
      createdAt: Date.now(),
    };
    dashTasks.set(task.id, task);
    return sendJson(res, 200, { output: { task_status: 'PENDING', task_id: task.id }, request_id: randomUUID() });
  }
  const query = url.pathname.match(/^\/api\/v1\/tasks\/([^/]+)$/);
  if (query && req.method === 'GET') {
    const task = dashTasks.get(query[1]);
    if (!task) return sendJson(res, 404, { code: 'InvalidParameter', message: 'task not found', request_id: randomUUID() });
    const state = dashStatusFor(task);
    const origin = `http://${req.headers.host || `${HOST}:${PORT}`}`;
    return sendJson(res, 200, {
      request_id: randomUUID(),
      output: {
        task_id: task.id,
        task_status: state.status,
        results: state.status === 'SUCCEEDED' ? [{
          model_url: `${origin}/files/example.glb`,
          pbr_model_url: `${origin}/files/example.glb`,
          rendered_image_url: `${origin}/files/${task.id}.png`,
        }] : [],
      },
      usage: state.status === 'SUCCEEDED' ? { '3d_task_type': 'text-to-3d', credits_consumed: 10 } : undefined,
    });
  }
  return sendJson(res, 404, { code: 'InvalidParameter', message: `no dashscope route ${req.method} ${url.pathname}`, request_id: randomUUID() });
}

async function handleHy3d(req, res) {  if (req.method !== 'POST') return sendJson(res, 405, { Response: { Error: { Code: 'MethodNotAllowed', Message: 'POST only' } } });
  const action = String(req.headers['x-tc-action'] || '');
  const rawBody = (await readBody(req)) || '{}';
  const bearer = req.headers.authorization === `Bearer ${HY3D_API_KEY}`;
  const verification = bearer ? { ok: true } : verifyTc3(req, rawBody);
  if (!verification.ok) {
    return sendJson(res, 401, { Response: { Error: { Code: verification.code, Message: verification.message }, RequestId: randomUUID() } });
  }
  const body = JSON.parse(rawBody);
  if (action === 'SubmitHunyuanTo3DProJob' || action === 'SubmitHunyuanTo3DRapidJob') {
    if (!body.Prompt && !body.ImageUrl && !body.ImageBase64) {
      return sendJson(res, 200, { Response: { Error: { Code: 'InvalidParameter', Message: 'Prompt or image is required.' }, RequestId: randomUUID() } });
    }
    const task = createTask(action.includes('Rapid') ? 'rapid' : 'pro', body, 'hy3d');
    tasks.set(task.id, task);
    return sendJson(res, 200, { Response: { JobId: task.id, RequestId: randomUUID() } });
  }
  if (action === 'Convert3DFormat') {
    const origin = `http://${req.headers.host || `${HOST}:${PORT}`}`;
    return sendJson(res, 200, { Response: { ResultFile3D: `${origin}/files/example.glb`, RequestId: randomUUID() } });
  }
  if (action.startsWith('Submit')) {
    const task = createTask(action, body, 'hy3d');
    tasks.set(task.id, task);
    return sendJson(res, 200, { Response: { JobId: task.id, RequestId: randomUUID() } });
  }
  if (action.startsWith('Query') || action.startsWith('Describe')) {
    const task = tasks.get(String(body.JobId || ''));
    if (!task) return sendJson(res, 200, { Response: { Error: { Code: 'ResourceNotFound.JobNotFound', Message: 'Job not found.' }, RequestId: randomUUID() } });
    tick(task);
    const origin = `http://${req.headers.host || `${HOST}:${PORT}`}`;
    return sendJson(res, 200, { Response: {
      Status: task.status === 'queued' ? 'WAIT' : task.status === 'running' ? 'RUN' : 'DONE',
      ResultFile3Ds: task.status === 'success' ? [{ Type: 'GLB', Url: `${origin}/files/${task.id}.glb`, PreviewImageUrl: `${origin}/files/${task.id}.png` }] : [],
      ResultCreditConsumed: task.status === 'success' ? 10 : 0,
      RequestId: randomUUID(),
    } });
  }  if (action === 'QueryHunyuanTo3DProJob' || action === 'QueryHunyuanTo3DRapidJob') {
    const task = tasks.get(String(body.JobId || ''));
    if (!task) {
      return sendJson(res, 200, { Response: { Error: { Code: 'ResourceNotFound.JobNotFound', Message: 'Job not found.' }, RequestId: randomUUID() } });
    }
    tick(task);
    const origin = `http://${req.headers.host || `${HOST}:${PORT}`}`;
    return sendJson(res, 200, {
      Response: {
        Status: task.status === 'queued' ? 'WAIT' : task.status === 'running' ? 'RUN' : 'DONE',
        ResultFile3Ds: task.status === 'success' ? [{
          Type: 'GLB',
          Url: `${origin}/files/${task.id}.glb`,
          PreviewImageUrl: `${origin}/files/${task.id}.png`,
        }] : [],
        ResultCreditConsumed: task.status === 'success' ? 20 : 0,
        ResultCreditDetails: '{"GenerateType-Normal":20}',
        RequestId: randomUUID(),
      },
    });
  }
  return sendJson(res, 200, { Response: { Error: { Code: 'InvalidAction', Message: `Unsupported action ${action}` }, RequestId: randomUUID() } });
}

async function handleMeshy(req, res, url) {
  if (url.pathname === '/openapi/v1/balance') {
    if (req.headers.authorization !== `Bearer ${MESHY_KEY}`) return sendJson(res, 401, { error: { message: 'Unauthorized' } });
    return sendJson(res, 200, { balance: 100 });
  }
  if (req.headers.authorization !== `Bearer ${MESHY_KEY}`) return sendJson(res, 401, { error: { message: 'Unauthorized' } });
  const create = url.pathname.match(/^\/openapi\/v2\/(text-to-3d|image-to-3d|multi-image-to-3d|retexture|remesh|uv-unwrap|convert|rigging)$/);
  if (create && req.method === 'POST') {
    await readBody(req);
    const id = randomUUID();
    meshyTasks.set(id, { id, createdAt: Date.now(), path: create[1] });
    return sendJson(res, 202, { result: id });
  }
  const query = url.pathname.match(/^\/openapi\/v2\/(?:text-to-3d|image-to-3d|multi-image-to-3d|retexture|remesh|uv-unwrap|convert|rigging)\/([^/]+)$/);
  if (query && req.method === 'GET') {
    const task = meshyTasks.get(query[1]);
    if (!task) return sendJson(res, 404, { error: { message: 'task not found' } });
    const state = dashStatusFor(task);
    const origin = `http://${req.headers.host || `${HOST}:${PORT}`}`;
    return sendJson(res, 200, {
      id: task.id,
      status: state.status === 'SUCCEEDED' ? 'SUCCEEDED' : state.status === 'RUNNING' ? 'IN_PROGRESS' : 'PENDING',
      progress: state.progress,
      model_urls: state.status === 'SUCCEEDED' ? { glb: `${origin}/files/example.glb` } : {},
      thumbnail_url: state.status === 'SUCCEEDED' ? `${origin}/files/${task.id}.png` : undefined,
    });
  }
  return sendJson(res, 404, { error: { message: `no meshy route ${req.method} ${url.pathname}` } });
}

async function handleHyper(req, res, url) {
  if (url.pathname === '/api/v2/check_balance') {
    if (req.headers.authorization !== `Bearer ${HYPER_KEY}`) return sendJson(res, 401, { error: 'Unauthorized' });
    return sendJson(res, 200, { balance: 100 });
  }
  if (req.headers.authorization !== `Bearer ${HYPER_KEY}`) return sendJson(res, 401, { error: 'Unauthorized' });
  if (url.pathname === '/api/v2/rodin' && req.method === 'POST') {
    await readBody(req);
    const uuid = randomUUID();
    const key = randomUUID();
    hyperTasks.set(key, { uuid, createdAt: Date.now(), key });
    return sendJson(res, 201, { message: 'Submitted.', uuid, jobs: { uuids: [randomUUID()], subscription_key: key }, consumed: 0.5 });
  }
  if (url.pathname === '/api/v2/status' && req.method === 'POST') {
    const body = JSON.parse((await readBody(req)) || '{}');
    const task = hyperTasks.get(String(body.subscription_key || ''));
    if (!task) return sendJson(res, 201, { error: 'NO_SUCH_TASK' });
    const elapsed = Date.now() - task.createdAt;
    return sendJson(res, 201, { jobs: [{ uuid: task.uuid, status: elapsed > 2500 ? 'Done' : elapsed > 800 ? 'Generating' : 'Waiting' }] });
  }
  if (url.pathname === '/api/v2/download' && req.method === 'POST') {
    const body = JSON.parse((await readBody(req)) || '{}');
    const task = [...hyperTasks.values()].find((item) => item.uuid === body.task_uuid);
    if (!task) return sendJson(res, 201, { error: 'NO_SUCH_TASK' });
    const origin = `http://${req.headers.host || `${HOST}:${PORT}`}`;
    return sendJson(res, 201, { list: [{ name: 'model.glb', url: `${origin}/files/example.glb` }] });
  }
  return sendJson(res, 404, { error: `no hyper route ${req.method} ${url.pathname}` });
}

const server = http.createServer(async (req, res) => {
  const started = Date.now();
  const url = new URL(req.url || '/', `http://${req.headers.host || `${HOST}:${PORT}`}`);
  requests.push({ method: req.method, path: url.pathname, action: req.headers['x-tc-action'] || null, at: new Date().toISOString() });
  try {
    if (url.pathname === '/health') {
      return sendJson(res, 200, { ok: true, uptimeMs: Date.now() - STARTED, tasks: tasks.size, requests: requests.length });
    }
    if (url.pathname === '/preview') {
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>3D preview feasibility</title>
<style>html,body{margin:0;background:#15171c;height:100%;overflow:hidden}model-viewer{width:100vw;height:100vh;background:radial-gradient(circle at 50% 35%,#2c3340,#111318 70%)}</style>
<script type="module" src="/model-viewer.js"></script></head>
<body><model-viewer src="/files/example.glb" camera-controls auto-rotate interaction-prompt="none" shadow-intensity="1.2" exposure="1.1"></model-viewer></body></html>`;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': Buffer.byteLength(html) });
      return res.end(html);
    }
    if (url.pathname === '/model-viewer.js') {
      try {
        const script = await readFile(new URL('./model-viewer.min.js', import.meta.url));
        res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Content-Length': script.length });
        return res.end(script);
      } catch {
        return sendJson(res, 404, { error: 'model-viewer.min.js not downloaded' });
      }
    }
    if (url.pathname === '/files/example.glb') {
      res.writeHead(200, { 'Content-Type': 'model/gltf-binary', 'Content-Length': GLB.length });
      return res.end(GLB);
    }
    const file = url.pathname.match(/^\/files\/([^/]+)\.glb$/);
    if (file) {
      const task = tasks.get(file[1]);
      if (!task || task.status !== 'success') return sendJson(res, 404, { error: 'not ready' });
      res.writeHead(200, { 'Content-Type': 'model/gltf-binary', 'Content-Length': GLB.length });
      return res.end(GLB);
    }
    const preview = url.pathname.match(/^\/files\/([^/]+)\.png$/);
    if (preview) {
      res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': PNG.length });
      return res.end(PNG);
    }
    if (url.pathname.startsWith('/api/v1/')) {
      return await handleDashscope(req, res, url);
    }
    if (url.pathname.startsWith('/openapi/')) {
      return await handleMeshy(req, res, url);
    }
    if (url.pathname.startsWith('/api/v2/')) {
      return await handleHyper(req, res, url);
    }
    if (url.pathname.startsWith('/relay/tripo/')) {
      const rest = new URL(url.pathname.slice('/relay/tripo'.length), `http://${req.headers.host}`);
      return await handleTripo(req, res, rest, TRIPO_RELAY_KEY);
    }
    if (url.pathname.startsWith('/v3/')) {
      const rest = new URL(url.pathname.slice('/v3'.length), `http://${req.headers.host}`);
      return await handleTripo(req, res, rest, TRIPO_OFFICIAL_KEY);
    }
    if (url.pathname === '/' || url.pathname === '/hy3d') {
      return await handleHy3d(req, res);
    }
    return sendJson(res, 404, { ok: false, error: `no mock route for ${req.method} ${url.pathname}` });
  } catch (error) {
    console.error('handler error', req.method, url.pathname, error instanceof Error ? error.stack : error);
    return sendJson(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
  } finally {
    console.log(`${req.method} ${url.pathname} ${res.statusCode} ${Date.now() - started}ms`);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`mock 3D API listening on http://${HOST}:${PORT}`);
  console.log(`Tripo official key: ${TRIPO_OFFICIAL_KEY}`);
  console.log(`Tripo relay key: ${TRIPO_RELAY_KEY}`);
  console.log(`DashScope key: ${DASHSCOPE_KEY}`);
  console.log(`HY3D SecretId/Key: ${HY3D_SECRET_ID} / ${HY3D_SECRET_KEY}`);
});



