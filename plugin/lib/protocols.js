/**
 * Protocol adapters and operation catalog for dsh-tripo-support.
 *
 * Five wire protocols are supported:
 *  - tripo: Tripo v3 (Bearer key, /v3/... paths)
 *  - meshy: Meshy /openapi/v2 tasks (Bearer key)
 *  - hyper: Hyper3D Rodin /api/v2 multipart tasks (Bearer key)
 *  - dashscope: Alibaba Bailian / qianwenai async 3D endpoint (third-party preset)
 *    (Bearer key, /api/v1/services/aigc/video-generation/3d-generation,
 *     then GET /api/v1/tasks/{id})
 *  - tencent: Tencent Cloud TI-3D (SecretId/SecretKey, TC3-HMAC-SHA256)
 *
 * A provider is data. Adding a third-party relay means adding a provider with
 * its base URL, auth mode and model ids; no protocol code changes when the
 * relay speaks the same wire format.
 */

export const PROTOCOL_LABELS = {
  tripo: 'Tripo v3',
  meshy: 'Meshy',
  hyper: 'Hyper3D Rodin',
  dashscope: 'DashScope 3D（百炼 / qianwenai）',
  tencent: '腾讯混元3D（TI-3D）',
};

export const OPERATIONS = {
  text_to_3d: { label: '文生 3D', description: '文本提示词生成 3D 模型', fields: ['prompt'] },
  image_to_3d: { label: '图生 3D', description: '单张图片生成 3D 模型', fields: ['imageUrl', 'sourceTaskId'] },
  multiview_to_3d: { label: '多视图生 3D', description: '多视角图片生成 3D 模型', fields: ['imageUrls'] },
  texture: { label: '生成贴图', description: '为已有模型重新生成贴图 / PBR 材质', fields: ['sourceTaskId', 'modelUrl', 'texturePrompt', 'pbr'] },
  segment: { label: '网格分割 / 拆件', description: '按几何或语义把模型拆成部件', fields: ['sourceTaskId', 'modelUrl', 'modelVersion', 'granularity'] },
  smart_segment: { label: '智能分割 / 拆件', description: '端到端智能分割，可自动建模', fields: ['sourceTaskId', 'modelUrl', 'segType', 'granularity', 'hint'] },
  retopology: { label: '重拓扑 / 减面', description: '重建干净拓扑或降低面数', fields: ['sourceTaskId', 'modelUrl', 'modelVersion', 'faceLimit', 'quad', 'smartUv'] },
  uv: { label: 'UV 展开', description: '为模型展开 UV', fields: ['sourceTaskId', 'modelUrl'] },
  mesh_complete: { label: '网格补全', description: '补全缺失的网格', fields: ['sourceTaskId', 'modelUrl'] },
  convert: { label: '格式转换', description: '转换为 GLB / FBX / OBJ / USDZ 等格式', fields: ['sourceTaskId', 'modelUrl', 'format'] },
  rig_check: { label: '可绑骨检查', description: '判断模型是否可绑骨并推荐骨骼类型', fields: ['sourceTaskId', 'modelUrl'] },
  auto_rig: { label: '自动绑骨', description: '自动添加骨骼与蒙皮', fields: ['sourceTaskId', 'modelUrl', 'rigType', 'spec', 'outFormat', 'motionType'] },
  animation_retarget: { label: '动画重定向', description: '把预设动画应用到已绑骨模型', fields: ['sourceTaskId', 'animations', 'outFormat'] },
  image_to_splat: { label: '图片生成 Gaussian Splat', description: '从图片生成 Gaussian Splat', fields: ['imageUrl'] },
  text_to_image: { label: '文生图（Tripo）', description: '文本生成参考图 / 概念图', fields: ['prompt', 'size'] },
  image_to_image: { label: '图生图 / 图片编辑（Tripo）', description: '参考图编辑、风格迁移、多图融合', fields: ['prompt', 'imageUrl', 'imageUrls', 'size'] },
  image_to_multiview: { label: '图生多视图（Tripo）', description: '从单图生成多视图参考图', fields: ['imageUrl'] },
  edit_multiview: { label: '编辑多视图（Tripo）', description: '编辑多视图参考图', fields: ['prompt', 'imageUrl', 'sourceTaskId'] },
  part: { label: '组件 / 部件生成', description: '生成可编辑的分部件模型（混元3D）', fields: ['modelUrl', 'format'] },
  reduce_face: { label: '智能减面 / 拓扑', description: '降低面数（混元3D）', fields: ['modelUrl', 'faceLevel', 'format'] },
  motion: { label: '文生动作', description: '生成动作（混元3D）', fields: ['prompt', 'modelUrl', 'duration'] },
  profile_to_3d: { label: '3D 人物生成', description: '人物图片生成 3D 角色（混元3D）', fields: ['imageUrl', 'template'] },
};

const TRIPO_OPERATIONS = [
  'text_to_3d', 'image_to_3d', 'multiview_to_3d', 'texture', 'segment', 'smart_segment',
  'retopology', 'uv', 'mesh_complete', 'convert', 'rig_check', 'auto_rig',
  'animation_retarget', 'image_to_splat', 'text_to_image', 'image_to_image', 'image_to_multiview', 'edit_multiview',
];

const DASHSCOPE_OPERATIONS = [
  'text_to_3d', 'image_to_3d', 'multiview_to_3d', 'texture', 'segment', 'smart_segment',
  'mesh_complete', 'retopology', 'convert', 'rig_check', 'auto_rig',
  'animation_retarget', 'image_to_splat',
];

const TENCENT_OPERATIONS = [
  'text_to_3d', 'image_to_3d', 'texture', 'reduce_face', 'part', 'uv', 'motion',
  'auto_rig', 'profile_to_3d', 'convert',
];
const MESHY_OPERATIONS = [
  'text_to_3d', 'image_to_3d', 'multiview_to_3d', 'texture', 'retopology', 'uv', 'convert', 'auto_rig',
];

const HYPER_OPERATIONS = [
  'text_to_3d', 'image_to_3d',
];


export function operationsFor(protocol) {
  if (protocol === 'tencent') return TENCENT_OPERATIONS;
  if (protocol === 'dashscope') return DASHSCOPE_OPERATIONS;
  if (protocol === 'meshy') return MESHY_OPERATIONS;
  if (protocol === 'hyper') return HYPER_OPERATIONS;
  return TRIPO_OPERATIONS;
}

const TRIPO_MODELS = ['v3.1-20260211', 'v3.0-20250812', 'v2.5-20250123', 'P1-20260311', 'P2-20260801'];
const DASHSCOPE_MODELS = [
  'Tripo/Tripo-H3.1',
  'Tripo/Tripo-P1.0',
  'Tripo/Tripo-Texture',
  'Tripo/Tripo-Segmentation',
  'Tripo/Tripo-SmartSegmentation',
  'Tripo/Tripo-MeshCompletion',
  'Tripo/Tripo-Retopology',
  'Tripo/Tripo-ConvertFormat',
  'Tripo/Tripo-RigCheck',
  'Tripo/Tripo-AutoRig',
  'Tripo/Tripo-AnimationRetarget',
  'Tripo/Tripo-ImageToSplat',
];
const TENCENT_MODELS = ['3.1-pro', '3.0-pro', 'rapid'];
const MESHY_MODELS = ['meshy-7.1', 'meshy-6', 'meshy-6-lite', 'meshy-t2.5', 'meshy-t2'];
const HYPER_MODELS = ['Gen-2.5-Medium', 'Gen-2.5-High', 'Gen-2.5-Low', 'Gen-2.5-Extreme-Low', 'Gen-2.5-Extreme-High'];

export const DEFAULT_PROVIDERS = {
  'tripo-official': {
    id: 'tripo-official',
    label: 'Tripo',
    protocol: 'tripo',
    auth: 'bearer',
    baseURL: 'https://openapi.tripo3d.ai/v3',
    models: TRIPO_MODELS,
    defaultModel: 'v3.1-20260211',
    apiKeyRef: 'TRIPO_API_KEY',
  },
  'qwenai-dashscope': {
    id: 'qwenai-dashscope',
    label: 'qwenai',
    custom: true,
    preset: true,
    protocol: 'dashscope',
    auth: 'bearer',
    baseURL: 'https://cn-beijing.maas.qianwenaiapi.com/api/v1/services/aigc/video-generation/3d-generation',
    models: DASHSCOPE_MODELS,
    defaultModel: 'Tripo/Tripo-H3.1',
    apiKeyRef: 'DASHSCOPE_API_KEY',
  },
  'meshy-official': {
    id: 'meshy-official',
    label: 'Meshy',
    protocol: 'meshy',
    auth: 'bearer',
    baseURL: 'https://api.meshy.ai',
    models: MESHY_MODELS,
    defaultModel: 'meshy-7.1',
    apiKeyRef: 'MESHY_API_KEY',
  },
  'hyper3d-official': {
    id: 'hyper3d-official',
    label: 'Hyper3D',
    protocol: 'hyper',
    auth: 'bearer',
    baseURL: 'https://api.hyper3d.com/api/v2',
    models: HYPER_MODELS,
    defaultModel: 'Gen-2.5-Medium',
    apiKeyRef: 'HYPER3D_API_KEY',
  },
  'hy3d-official': {
    id: 'hy3d-official',
    label: 'HY3D',
    protocol: 'tencent',
    auth: 'tc3',
    baseURL: 'https://ai3d.tencentcloudapi.com',
    region: 'ap-guangzhou',
    models: TENCENT_MODELS,
    defaultModel: '3.1-pro',
    secretIdRef: 'HY3D_SECRET_ID',
    secretKeyRef: 'HY3D_SECRET_KEY',
  },
};

export function normalizeProvider(id, input) {
  const protocol = ['dashscope', 'tencent', 'meshy', 'hyper'].includes(input.protocol) ? input.protocol : 'tripo';
  const p = {
    ...input,
    id,
    protocol,
    label: String(input.label || id),
    auth: protocol === 'tencent' && input.auth === 'bearer' ? 'bearer' : protocol === 'tencent' ? 'tc3' : 'bearer',
    baseURL: String(input.baseURL || DEFAULT_PROVIDERS[id]?.baseURL || '').replace(/\/+$/, ''),
    models: Array.isArray(input.models) ? input.models.map(String).filter(Boolean) : [],
    defaultModel: String(input.defaultModel || ''),
  };
  const catalog = Array.isArray(input.modelCatalog)
    ? input.modelCatalog.map((item) => ({
        id: String(item?.id || item || '').trim(),
        name: String(item?.name || item?.id || item || '').trim(),
      })).filter((item) => item.id)
    : [];
  if (catalog.length) {
    p.modelCatalog = catalog;
    p.models = catalog.map((item) => item.id);
  } else {
    if (!p.models.length) {
      p.models = protocol === 'tencent' ? [...TENCENT_MODELS] : protocol === 'dashscope' ? [...DASHSCOPE_MODELS] : protocol === 'meshy' ? [...MESHY_MODELS] : protocol === 'hyper' ? [...HYPER_MODELS] : [...TRIPO_MODELS];
    }
    p.modelCatalog = p.models.map((id) => ({ id, name: id }));
  }
  if (!p.models.includes(p.defaultModel)) p.defaultModel = p.models[0] || '';
  if (protocol === 'tencent') {
    p.region = String(input.region || 'ap-guangzhou');
    if (p.auth === 'bearer') {
      p.apiKeyRef = String(input.apiKeyRef || `DSH3D_${id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_API_KEY`);
      delete p.secretIdRef;
      delete p.secretKeyRef;
    } else {
      p.secretIdRef = String(input.secretIdRef || `DSH3D_${id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_SECRET_ID`);
      p.secretKeyRef = String(input.secretKeyRef || `DSH3D_${id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_SECRET_KEY`);
      delete p.apiKeyRef;
    }
  } else {
    p.apiKeyRef = String(input.apiKeyRef || `DSH3D_${id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_API_KEY`);
    delete p.secretIdRef;
    delete p.secretKeyRef;
  }
  if (protocol === 'dashscope') {
    p.queryURL = String(input.queryURL || deriveDashscopeTasksURL(p.baseURL));
  } else {
    delete p.queryURL;
  }
  p.webhookSecretRef = String(input.webhookSecretRef || `DSH3D_${id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_WEBHOOK_SECRET`);
  return p;
}

export function deriveDashscopeTasksURL(baseURL) {
  try {
    const url = new URL(baseURL);
    url.pathname = url.pathname.replace(/\/services\/aigc\/video-generation\/3d-generation\/?$/, '/tasks');
    url.search = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return '';
  }
}

function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      if (item === undefined || item === null || item === '') continue;
      out[key] = clean(item);
    }
    return out;
  }
  return value;
}

function mergeParams(parameters, extra = {}) {
  return clean({ ...(parameters && typeof parameters === 'object' ? parameters : {}), ...extra });
}

const TRIPO_CREATE = {
  text_to_3d: (a) => ({ path: '/generation/text-to-model', body: { prompt: a.prompt, model: a.model, ...a.parameters } }),
  image_to_3d: (a) => ({ path: '/generation/image-to-model', body: { input: a.imageUrl || a.sourceTaskId, model: a.model, ...a.parameters } }),
  multiview_to_3d: (a) => ({ path: '/generation/multiview-to-model', body: { inputs: a.imageUrls, model: a.model, ...a.parameters } }),
  texture: (a) => ({ path: '/models/texture', body: { input: a.sourceTaskId || a.modelUrl, model: a.model, texture_prompt: a.texturePrompt ? { text: a.texturePrompt } : undefined, pbr: a.pbr, ...a.parameters } }),
  segment: (a) => ({ path: '/mesh/segment', body: { input: a.sourceTaskId || a.modelUrl, model: a.modelVersion, segmentation_granularity: a.granularity, ...a.parameters } }),
  smart_segment: (a) => ({ path: '/mesh/smartsegment', body: { seg_type: a.segType || 'model', input: a.sourceTaskId || a.modelUrl, granularity: a.granularity, hint: a.hint, ...a.parameters } }),
  retopology: (a) => ({ path: '/mesh/decimate', body: { input: a.sourceTaskId || a.modelUrl, model: a.modelVersion, face_limit: a.faceLimit, quad: a.quad, smart_uv: a.smartUv, ...a.parameters } }),
  uv: (a) => ({ path: '/mesh/uv', body: { input: a.sourceTaskId || a.modelUrl, ...a.parameters } }),
  mesh_complete: (a) => ({ path: '/mesh/complete', body: { input: a.sourceTaskId || a.modelUrl, ...a.parameters } }),
  convert: (a) => ({ path: '/models/convert', body: { input: a.sourceTaskId || a.modelUrl, format: a.format, ...a.parameters } }),
  rig_check: (a) => ({ path: '/animations/rig-check', body: { input: a.sourceTaskId || a.modelUrl, ...a.parameters } }),
  auto_rig: (a) => ({ path: '/animations/rig', body: { input: a.sourceTaskId || a.modelUrl, rig_type: a.rigType, spec: a.spec, out_format: a.outFormat, ...a.parameters } }),
  animation_retarget: (a) => ({ path: '/animations/retarget', body: { input: a.sourceTaskId, animations: a.animations, out_format: a.outFormat, ...a.parameters } }),
  image_to_splat: (a) => ({ path: '/generation/image-to-splat', body: { input: a.imageUrl, ...a.parameters } }),
  text_to_image: (a) => ({ path: '/generation/text-to-image', body: { prompt: a.prompt, model: a.model, size: a.size, ...a.parameters } }),
  image_to_image: (a) => ({ path: '/generation/image-to-image', body: { input: a.imageUrl, inputs: a.imageUrls, prompt: a.prompt, model: a.model, size: a.size, ...a.parameters } }),
  image_to_multiview: (a) => ({ path: '/generation/image-to-multiview', body: { input: a.imageUrl, ...a.parameters } }),
  edit_multiview: (a) => ({ path: '/generation/edit-multiview', body: { input: a.sourceTaskId || a.imageUrl, prompt: a.prompt, ...a.parameters } }),
};

const DASHSCOPE_MODEL_BY_OPERATION = {
  text_to_3d: 'Tripo/Tripo-H3.1',
  image_to_3d: 'Tripo/Tripo-H3.1',
  multiview_to_3d: 'Tripo/Tripo-H3.1',
  texture: 'Tripo/Tripo-Texture',
  segment: 'Tripo/Tripo-Segmentation',
  smart_segment: 'Tripo/Tripo-SmartSegmentation',
  mesh_complete: 'Tripo/Tripo-MeshCompletion',
  retopology: 'Tripo/Tripo-Retopology',
  convert: 'Tripo/Tripo-ConvertFormat',
  rig_check: 'Tripo/Tripo-RigCheck',
  auto_rig: 'Tripo/Tripo-AutoRig',
  animation_retarget: 'Tripo/Tripo-AnimationRetarget',
  image_to_splat: 'Tripo/Tripo-ImageToSplat',
};

const DASHSCOPE_GENERATION_MODELS = new Set(['Tripo/Tripo-H3.1', 'Tripo/Tripo-P1.0']);

function dashscopeModel(provider, operation, requested) {
  if (operation === 'text_to_3d' || operation === 'image_to_3d' || operation === 'multiview_to_3d') {
    return DASHSCOPE_GENERATION_MODELS.has(requested) ? requested : (DASHSCOPE_GENERATION_MODELS.has(provider.defaultModel) ? provider.defaultModel : 'Tripo/Tripo-H3.1');
  }
  return DASHSCOPE_MODEL_BY_OPERATION[operation] || requested || provider.defaultModel;
}

function dashscopeInput(operation, a) {
  if (operation === 'text_to_3d') return { prompt: a.prompt };
  if (operation === 'image_to_3d') return { image: a.imageUrl };
  if (operation === 'multiview_to_3d') return { images: (a.imageUrls || []).map((url) => ({ type: String(url).toLowerCase().endsWith('.png') ? 'png' : 'jpeg', file_token: url })) };
  if (operation === 'image_to_splat') return { image: a.imageUrl };
  if (operation === 'convert') return clean({ original_model_task_id: a.sourceTaskId, model_url: a.modelUrl, format: a.format });
  return clean({ original_model_task_id: a.sourceTaskId, model_url: a.modelUrl });
}

function dashscopeParameters(operation, a) {
  const extra = {};
  if (a.texturePrompt) extra.texture_prompt = { text: a.texturePrompt };
  if (a.pbr !== undefined) extra.pbr = a.pbr;
  if (a.textureQuality) extra.texture_quality = a.textureQuality;
  if (a.geometryQuality) extra.geometry_quality = a.geometryQuality;
  if (a.quad !== undefined) extra.quad = a.quad;
  if (a.faceLimit !== undefined) extra.face_limit = a.faceLimit;
  if (a.modelVersion) extra.model_version = a.modelVersion;
  if (a.granularity) extra.segmentation_granularity = a.granularity;
  if (a.rigType) extra.rig_type = a.rigType;
  if (a.spec) extra.spec = a.spec;
  if (a.outFormat) extra.out_format = a.outFormat;
  if (a.animations) extra.animations = a.animations;
  if (a.segType) extra.seg_type = a.segType;
  if (a.hint) extra.hint = a.hint;
  return mergeParams(a.parameters, extra);
}

const TENCENT_ACTION = {
  text_to_3d: ['SubmitHunyuanTo3DProJob', 'QueryHunyuanTo3DProJob'],
  image_to_3d: ['SubmitHunyuanTo3DProJob', 'QueryHunyuanTo3DProJob'],
  texture: ['SubmitTextureTo3DJob', 'DescribeTextureTo3DJob'],
  reduce_face: ['SubmitReduceFaceJob', 'DescribeReduceFaceJob'],
  part: ['SubmitHunyuan3DPartJob', 'QueryHunyuan3DPartJob'],
  uv: ['SubmitHunyuanTo3DUVJob', 'DescribeHunyuanTo3DUVJob'],
  motion: ['SubmitHunyuanTo3DMotionJob', 'DescribeHunyuanTo3DMotionJob'],
  auto_rig: ['SubmitAutoRiggingJob', 'DescribeAutoRiggingJob'],
  profile_to_3d: ['SubmitProfileTo3DJob', 'DescribeProfileTo3DJob'],
  convert: ['Convert3DFormat', null],
};

function tencentSubmit(operation, a, provider) {
  const rapid = String(a.model || provider.defaultModel).toLowerCase().startsWith('rapid');
  const [action] = TENCENT_ACTION[operation] || [];
  const base = mergeParams(a.parameters);
  const file = (key, type = a.format || 'GLB') => (a.modelUrl ? { [key]: { Url: a.modelUrl, Type: type } } : {});
  if (operation === 'text_to_3d' || operation === 'image_to_3d') {
    if (rapid) {
      return { action: 'SubmitHunyuanTo3DRapidJob', body: clean({ ...base, Prompt: a.prompt, ImageUrl: a.imageUrl, ResultFormat: base.ResultFormat || 'GLB', EnablePBR: a.pbr ?? true }) };
    }
    return {
      action: 'SubmitHunyuanTo3DProJob',
      body: clean({
        ...base,
        Prompt: a.prompt,
        ImageUrl: a.imageUrl,
        Model: String(a.model || '').startsWith('3.1') ? '3.1' : '3.0',
        ResultFormat: base.ResultFormat || 'GLB',
        EnablePBR: a.pbr ?? true,
        FaceCount: a.faceCount,
      }),
    };
  }
  if (operation === 'texture') {
    return { action, body: clean({ ...base, ...file('File3D'), Model: String(a.model || '').startsWith('3.1') ? '3.1' : '3.0', Prompt: a.texturePrompt, Image: a.imageUrl ? { Url: a.imageUrl } : undefined, EnablePBR: a.pbr, TextureSize: base.TextureSize }) };
  }
  if (operation === 'reduce_face') {
    return { action, body: clean({ ...base, ...file('File3D'), PolygonType: base.PolygonType, FaceLevel: a.faceLevel || base.FaceLevel }) };
  }
  if (operation === 'part') {
    return { action, body: clean({ ...base, ...file('File', 'FBX'), Model: base.Model || '1.5' }) };
  }
  if (operation === 'uv') {
    return { action, body: clean({ ...base, ...file('File') }) };
  }
  if (operation === 'motion') {
    return { action, body: clean({ ...base, Prompt: a.prompt, Model: base.Model || 'HY-Motion-1.0', RetargetFile: a.modelUrl ? { Url: a.modelUrl, Type: 'FBX' } : undefined }) };
  }
  if (operation === 'auto_rig') {
    return { action, body: clean({ ...base, ...file('File3D'), MotionType: a.motionType || base.MotionType }) };
  }
  if (operation === 'profile_to_3d') {
    return { action, body: clean({ ...base, Profile: a.imageUrl ? { Url: a.imageUrl } : (a.imageBase64 ? { Base64: a.imageBase64 } : undefined), Template: a.template || base.Template }) };
  }
  if (operation === 'convert') {
    return { action, body: clean({ File3D: a.modelUrl, Format: a.outFormat || a.format || 'STL', ...base }) };
  }
  return { action, body: clean({ ...base, ...file('File3D') }) };
}function tc3Headers(provider, action, payload, secrets) {
  const url = new URL(provider.baseURL);
  const host = url.host;
  const timestamp = Math.floor(Date.now() / 1000);
  const date = new Date(timestamp * 1000).toISOString().slice(0, 10);
  const body = JSON.stringify(payload);
  const contentType = 'application/json; charset=utf-8';
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\n`;
  const signedHeaders = 'content-type;host';
  const canonicalRequest = ['POST', url.pathname || '/', '', `${canonicalHeaders}\n${signedHeaders}`, sha256Hex(body)].join('\n');
  const scope = `${date}/ai3d/tc3_request`;
  const stringToSign = ['TC3-HMAC-SHA256', String(timestamp), scope, sha256Hex(canonicalRequest)].join('\n');
  const secretDate = hmac(`TC3${secrets.secretKey}`, date);
  const secretService = hmac(secretDate, 'ai3d');
  const secretSigning = hmac(secretService, 'tc3_request');
  const signature = createHmac('sha256', secretSigning).update(stringToSign).digest('hex');
  return {
    body,
    headers: {
      Authorization: `TC3-HMAC-SHA256 Credential=${secrets.secretId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      'Content-Type': contentType,
      Host: host,
      'X-TC-Action': action,
      'X-TC-Version': '2025-05-13',
      'X-TC-Timestamp': String(timestamp),
      'X-TC-Region': provider.region || 'ap-guangzhou',
    },
  };
}

import { createHash, createHmac } from 'node:crypto';

function sha256Hex(value) {
  return createHash('sha256').update(value).digest('hex');
}

function hmac(key, value) {
  return createHmac('sha256', key).update(value).digest();
}

function tencentBearerHeaders(provider, action, secrets) {
  return {
    Authorization: `Bearer ${secrets.apiKey}`,
    'Content-Type': 'application/json',
    'X-TC-Action': action,
    'X-TC-Version': '2025-05-13',
    'X-TC-Region': provider.region || 'ap-guangzhou',
  };
}

const MESHY_ENDPOINTS = {
  text_to_3d: '/openapi/v2/text-to-3d',
  image_to_3d: '/openapi/v2/image-to-3d',
  multiview_to_3d: '/openapi/v2/multi-image-to-3d',
  texture: '/openapi/v2/retexture',
  retopology: '/openapi/v2/remesh',
  uv: '/openapi/v2/uv-unwrap',
  convert: '/openapi/v2/convert',
  auto_rig: '/openapi/v2/rigging',
};

function meshyBody(operation, a) {
  const extra = a.parameters && typeof a.parameters === 'object' ? a.parameters : {};
  if (operation === 'text_to_3d') return clean({ mode: 'preview', prompt: a.prompt, ai_model: a.model, target_formats: ['glb'], ...extra });
  if (operation === 'image_to_3d') return clean({ image_url: a.imageUrl, ai_model: a.model, should_texture: false, ...extra });
  if (operation === 'multiview_to_3d') return clean({ image_urls: a.imageUrls, ai_model: a.model, should_texture: false, ...extra });
  if (operation === 'texture') return clean({ input_task_id: a.sourceTaskId, text_style_prompt: a.texturePrompt, ai_model: a.model, ...extra });
  if (operation === 'retopology') return clean({ input_task_id: a.sourceTaskId, target_polycount: a.faceLimit, topology: a.quad ? 'quad' : 'triangle', ...extra });
  if (operation === 'uv') return clean({ input_task_id: a.sourceTaskId, ...extra });
  if (operation === 'convert') return clean({ input_task_id: a.sourceTaskId, target_format: a.format || 'glb', ...extra });
  if (operation === 'auto_rig') return clean({ input_task_id: a.sourceTaskId, ...extra });
  throw new Error(`Meshy 协议不支持操作 ${operation}`);
}

function hyperTier(a, provider) {
  return String(a.model || provider.defaultModel || 'Gen-2.5-Medium');
}

export async function buildCreateRequest(provider, operation, args, secrets) {
  const a = { ...args, model: args.model || provider.defaultModel };
  if (provider.protocol === 'meshy') {
    const path = MESHY_ENDPOINTS[operation];
    if (!path) throw new Error(`Meshy 协议不支持操作 ${operation}`);
    return {
      url: `${provider.baseURL.replace(/\/+$/, '')}${path}`,
      method: 'POST',
      headers: { Authorization: `Bearer ${secrets.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(meshyBody(operation, a)),
      protocol: 'meshy',
      model: a.model,
    };
  }
  if (provider.protocol === 'hyper') {
    if (operation !== 'text_to_3d' && operation !== 'image_to_3d') throw new Error(`Hyper3D 协议暂不支持操作 ${operation}`);
    const form = new FormData();
    form.set('tier', hyperTier(a, provider));
    form.set('prompt', a.prompt || '');
    form.set('mesh_mode', a.parameters?.mesh_mode || 'Raw');
    form.set('material', a.parameters?.material || 'None');
    form.set('geometry_file_format', 'glb');
    if (a.parameters && typeof a.parameters === 'object') {
      for (const [key, value] of Object.entries(a.parameters)) {
        if (value === undefined || value === null || value === '') continue;
        form.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    }
    if (a.imageUrl) {
      const image = await fetch(a.imageUrl);
      if (!image.ok) throw new Error(`Hyper3D 读取参考图失败：HTTP ${image.status}`);
      form.set('images', new Blob([await image.arrayBuffer()]), 'input.png');
    } else if (a.imageBase64) {
      const base64 = String(a.imageBase64).replace(/^data:[^;]+;base64,/, '');
      form.set('images', new Blob([Buffer.from(base64, 'base64')]), 'input.png');
    }
    return {
      url: `${provider.baseURL.replace(/\/+$/, '')}/rodin`,
      method: 'POST',
      headers: { Authorization: `Bearer ${secrets.apiKey}` },
      body: form,
      protocol: 'hyper',
      model: hyperTier(a, provider),
    };
  }
  if (provider.protocol === 'tencent') {
    const { action, body } = tencentSubmit(operation, a, provider);
    if (provider.auth === 'bearer') {
      return { url: provider.baseURL, method: 'POST', headers: tencentBearerHeaders(provider, action, secrets), body: JSON.stringify(body), action, protocol: 'tencent', model: a.model };
    }
    const signed = tc3Headers(provider, action, body, secrets);
    return { url: provider.baseURL, method: 'POST', headers: signed.headers, body: signed.body, action, protocol: 'tencent', model: a.model };
  }
  if (provider.protocol === 'dashscope') {
    const model = dashscopeModel(provider, operation, a.model);
    const body = clean({ model, input: dashscopeInput(operation, a), parameters: dashscopeParameters(operation, a) });
    return {
      url: provider.baseURL,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secrets.apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify(body),
      protocol: 'dashscope',
    };
  }
  const builder = TRIPO_CREATE[operation];
  if (!builder) throw new Error(`Tripo 协议不支持操作 ${operation}`);
  const { path, body } = builder(a);
  return {
    url: `${provider.baseURL.replace(/\/+$/, '')}${path}`,
    method: 'POST',
    headers: { Authorization: `Bearer ${secrets.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(clean(body)),
    protocol: 'tripo',
  };
}

export function buildQueryRequest(provider, taskId, operation, secrets) {
  if (provider.protocol === 'meshy') {
    const path = MESHY_ENDPOINTS[operation];
    if (!path) throw new Error(`Meshy 操作 ${operation} 没有查询接口`);
    return {
      url: `${provider.baseURL.replace(/\/+$/, '')}${path}/${encodeURIComponent(taskId)}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${secrets.apiKey}` },
      protocol: 'meshy',
    };
  }
  if (provider.protocol === 'hyper') {
    return {
      url: `${provider.baseURL.replace(/\/+$/, '')}/status`,
      method: 'POST',
      headers: { Authorization: `Bearer ${secrets.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription_key: taskId }),
      protocol: 'hyper',
    };
  }
  if (provider.protocol === 'tencent') {
    const [, queryAction] = TENCENT_ACTION[operation] || [];
    if (!queryAction) throw new Error(`混元3D 操作 ${operation} 没有查询接口`);
    if (provider.auth === 'bearer') {
      return { url: provider.baseURL, method: 'POST', headers: tencentBearerHeaders(provider, queryAction, secrets), body: JSON.stringify({ JobId: taskId }), protocol: 'tencent' };
    }
    const signed = tc3Headers(provider, queryAction, { JobId: taskId }, secrets);
    return { url: provider.baseURL, method: 'POST', headers: signed.headers, body: signed.body, protocol: 'tencent' };
  }
  if (provider.protocol === 'dashscope') {
    const base = String(provider.queryURL || deriveDashscopeTasksURL(provider.baseURL)).replace(/\/+$/, '');
    return {
      url: `${base}/${encodeURIComponent(taskId)}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${secrets.apiKey}` },
      protocol: 'dashscope',
    };
  }
  return {
    url: `${provider.baseURL.replace(/\/+$/, '')}/tasks/${encodeURIComponent(taskId)}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${secrets.apiKey}` },
    protocol: 'tripo',
  };
}

export function parseCreateResponse(protocol, json) {
  if (protocol === 'meshy') {
    if (json.error) throw new Error(json.error.message || json.error);
    const taskId = json.result || json.id;
    if (!taskId) throw new Error('Meshy 没有返回 task id');
    return { taskId, status: 'queued', progress: 0, raw: json };
  }
  if (protocol === 'hyper') {
    if (json.error) throw new Error(json.error);
    const taskId = json.jobs?.subscription_key;
    if (!taskId) throw new Error('Hyper3D 没有返回 subscription_key');
    return { taskId, downloadTaskId: json.uuid, status: 'queued', progress: 0, raw: json };
  }
  if (protocol === 'tencent') {
    const response = json.Response || {};
    if (response.Error) throw new Error(`${response.Error.Code}: ${response.Error.Message}`);
    const taskId = response.JobId;
    if (!taskId) throw new Error('混元3D 没有返回 JobId');
    return { taskId, status: 'queued', progress: 0, raw: json };
  }
  if (protocol === 'dashscope') {
    if (json.code) throw new Error(`${json.code}: ${json.message || '创建任务失败'}`);
    const output = json.output || {};
    if (!output.task_id) throw new Error('DashScope 没有返回 task_id');
    return { taskId: output.task_id, status: normalizeStatus(output.task_status), progress: 0, raw: json };
  }
  if (json.code !== 0) throw new Error(`${json.message || `code ${json.code}`}`);
  const taskId = json.data?.task_id;
  if (!taskId) throw new Error('Tripo 没有返回 task_id');
  return { taskId, status: 'queued', progress: 0, raw: json };
}

export function normalizeStatus(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'SUCCEEDED' || s === 'SUCCESS' || s === 'DONE' || s === 'COMPLETED') return 'success';
  if (s === 'FAILED' || s === 'FAIL') return 'failed';
  if (s === 'CANCELED' || s === 'CANCELLED') return 'cancelled';
  if (s === 'PENDING' || s === 'QUEUED' || s === 'WAIT' || s === 'WAITING') return 'queued';
  if (s === 'RUNNING' || s === 'RUN' || s === 'GENERATING' || s === 'IN_PROGRESS') return 'running';
  if (s === 'UNKNOWN') return 'unknown';
  return 'queued';
}

export function parseTaskResponse(protocol, json) {
  if (protocol === 'meshy') {
    if (json.error) throw new Error(json.error.message || json.error);
    const status = normalizeStatus(json.status);
    const urls = json.model_urls || {};
    return {
      status,
      progress: json.progress,
      modelUrl: urls.glb || urls.fbx || urls.obj || urls.usdz,
      previewUrl: json.thumbnail_url || json.render_urls?.[0],
      results: json.model_urls || {},
      error: status === 'failed' ? (json.task_error?.message || json.task_error || json.error) : undefined,
      raw: json,
    };
  }
  if (protocol === 'hyper') {
    if (json.error) throw new Error(json.error);
    const jobs = Array.isArray(json.jobs) ? json.jobs : [];
    const states = jobs.map((job) => String(job.status || '').toLowerCase());
    const failed = states.some((state) => state === 'failed');
    const success = jobs.length > 0 && states.every((state) => state === 'done');
    const status = failed ? 'failed' : success ? 'success' : states.some((state) => state === 'generating') ? 'running' : 'queued';
    return {
      status,
      progress: success ? 100 : undefined,
      modelUrl: undefined,
      previewUrl: undefined,
      results: jobs,
      error: failed ? (json.message || 'Hyper3D job failed') : undefined,
      raw: json,
    };
  }
  if (protocol === 'tencent') {
    const response = json.Response || {};
    if (response.Error) throw new Error(`${response.Error.Code}: ${response.Error.Message}`);
    const status = normalizeStatus(response.Status);
    const files = Array.isArray(response.ResultFile3Ds) ? response.ResultFile3Ds : [];
    const preferred = files.find((file) => String(file.Type).toUpperCase() === 'GLB') || files[0];
    return {
      status,
      progress: status === 'success' ? 100 : undefined,
      modelUrl: preferred?.Url,
      previewUrl: preferred?.PreviewImageUrl,
      results: files,
      credits: response.ResultCreditConsumed,
      error: status === 'failed' ? (response.ErrorMessage || response.ErrorCode) : undefined,
      raw: json,
    };
  }
  if (protocol === 'dashscope') {
    if (json.code) throw new Error(`${json.code}: ${json.message || '查询任务失败'}`);
    const output = json.output || {};
    const status = normalizeStatus(output.task_status);
    const result = Array.isArray(output.results) ? output.results[0] || {} : {};
    return {
      status,
      progress: status === 'success' ? 100 : undefined,
      modelUrl: result.model_url || result.pbr_model_url || result.base_model_url,
      previewUrl: result.rendered_image_url,
      results: output.results || [],
      credits: json.usage?.credits_consumed,
      error: status === 'failed' ? (output.code || output.message) : undefined,
      raw: json,
    };
  }
  if (json.code !== 0) throw new Error(`${json.message || `code ${json.code}`}`);
  const data = json.data || {};
  return {
    status: normalizeStatus(data.status),
    progress: data.progress,
    modelUrl: data.output?.model_url || data.output?.pbr_model?.url || data.output?.base_model?.url || data.output?.image_url || data.output?.images?.[0]?.url || data.output?.images?.[0],
    previewUrl: data.output?.rendered_image_url || data.output?.image_url || data.output?.images?.[0]?.url || data.output?.images?.[0],
    results: data.output || {},
    credits: data.credits_consumed,
    error: data.status === 'failed' ? (data.error_message || data.error_code) : undefined,
    raw: json,
  };
}

export function buildDownloadRequest(provider, downloadTaskId, secrets) {
  if (provider.protocol !== 'hyper') throw new Error('该协议不需要单独下载步骤');
  return {
    url: `${provider.baseURL.replace(/\/+$/, '')}/download`,
    method: 'POST',
    headers: { Authorization: `Bearer ${secrets.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_uuid: downloadTaskId }),
    protocol: 'hyper',
  };
}

export function parseDownloadResponse(protocol, json) {
  if (json.error) throw new Error(json.error);
  if (protocol !== 'hyper') return { modelUrl: undefined, results: json };
  const list = Array.isArray(json.list) ? json.list : [];
  const preferred = list.find((item) => /\.glb$/i.test(item.name || '')) || list[0];
  return { modelUrl: preferred?.url, results: list };
}

export function buildTestRequest(provider, secrets) {
  if (provider.protocol === 'meshy') {
    return { url: `${provider.baseURL.replace(/\/+$/, '')}/openapi/v1/balance`, method: 'GET', headers: { Authorization: `Bearer ${secrets.apiKey}` }, protocol: 'meshy' };
  }
  if (provider.protocol === 'hyper') {
    return { url: `${provider.baseURL.replace(/\/+$/, '')}/check_balance`, method: 'GET', headers: { Authorization: `Bearer ${secrets.apiKey}` }, protocol: 'hyper' };
  }
  if (provider.protocol === 'tencent') {
    if (provider.auth === 'bearer') {
      return { url: provider.baseURL, method: 'POST', headers: tencentBearerHeaders(provider, 'QueryHunyuanTo3DProJob', secrets), body: JSON.stringify({ JobId: '0' }), protocol: 'tencent' };
    }
    const signed = tc3Headers(provider, 'QueryHunyuanTo3DProJob', { JobId: '0' }, secrets);
    return { url: provider.baseURL, method: 'POST', headers: signed.headers, body: signed.body, protocol: 'tencent' };
  }
  if (provider.protocol === 'dashscope') {
    // A harmless query for a non-existent task: 404 / task error proves auth.
    const base = String(provider.queryURL || deriveDashscopeTasksURL(provider.baseURL)).replace(/\/+$/, '');
    return { url: `${base}/00000000-0000-0000-0000-000000000000`, method: 'GET', headers: { Authorization: `Bearer ${secrets.apiKey}` }, protocol: 'dashscope' };
  }
  return { url: `${provider.baseURL.replace(/\/+$/, '')}/account/balance`, method: 'GET', headers: { Authorization: `Bearer ${secrets.apiKey}` }, protocol: 'tripo' };
}

export function parseTestResponse(protocol, status, json) {
  if (protocol === 'meshy' || protocol === 'hyper') {
    if (status === 401 || status === 403) throw new Error(json.message || json.error || `HTTP ${status}`);
    if (json.error && !/NO_SUCH_TASK/i.test(String(json.error))) throw new Error(String(json.error));
    return { ok: true, message: json.balance !== undefined ? `已连通，余额 ${json.balance}` : `已连通（HTTP ${status}）` };
  }
  if (protocol === 'tencent') {
    const error = json.Response?.Error;
    if (error && /AuthFailure|Unauthorized|InvalidCredential|Signature/i.test(error.Code || '')) {
      throw new Error(`${error.Code}: ${error.Message}`);
    }
    return { ok: true, message: error ? `已连通（${error.Code}）` : '已连通' };
  }
  if (protocol === 'dashscope') {
    if (status === 401 || status === 403) throw new Error(json.message || `HTTP ${status}`);
    return { ok: true, message: `已连通（HTTP ${status}）` };
  }
  if (status === 401 || status === 403) throw new Error(json.message || `HTTP ${status}`);
  if (status === 200 && json.code === 0) return { ok: true, message: `已连通，余额 ${json.data?.balance ?? '未知'}` };
  return { ok: true, message: `已连通（HTTP ${status}）` };
}






















