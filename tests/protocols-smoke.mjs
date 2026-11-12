/**
 * Static smoke test for the protocol/operation catalog. It does not call any
 * provider; every operation must produce a create request and (except the
 * synchronous Tencent convert) a query request.
 */
import { DEFAULT_PROVIDERS, normalizeProvider, operationsFor, buildCreateRequest, buildQueryRequest, parseCreateResponse, parseTaskResponse } from '../plugin/lib/protocols.js';

const secrets = { apiKey: 'sk-test', secretId: 'id-test', secretKey: 'key-test' };
const providers = {
  tripo: normalizeProvider('tripo-official', DEFAULT_PROVIDERS['tripo-official']),
  dashscope: normalizeProvider('qwenai-dashscope', DEFAULT_PROVIDERS['qwenai-dashscope']),
  tencent: normalizeProvider('hy3d-official', DEFAULT_PROVIDERS['hy3d-official']),
};
let checks = 0;
for (const [protocol, provider] of Object.entries(providers)) {
  for (const operation of operationsFor(protocol)) {
    const args = {
      prompt: 'a cat',
      imageUrl: 'https://example.com/a.png',
      imageUrls: ['https://example.com/a.png', 'https://example.com/b.png'],
      sourceTaskId: '00000000-0000-0000-0000-000000000001',
      modelUrl: 'https://example.com/model.glb',
      format: 'GLB',
      outFormat: 'FBX',
      model: provider.defaultModel,
    };
    const create = buildCreateRequest(provider, operation, args, secrets);
    if (!create.url || !create.body) throw new Error(`${protocol}/${operation}: missing create request`);
    if (!(protocol === 'tencent' && operation === 'convert')) {
      const query = buildQueryRequest(provider, '00000000-0000-0000-0000-000000000002', operation, secrets);
      if (!query.url) throw new Error(`${protocol}/${operation}: missing query request`);
    }
    checks += 1;
  }
}
console.log(`protocol operation checks passed: ${checks}`);
console.log(JSON.stringify({
  tripo: operationsFor('tripo').length,
  dashscope: operationsFor('dashscope').length,
  tencent: operationsFor('tencent').length,
}));
