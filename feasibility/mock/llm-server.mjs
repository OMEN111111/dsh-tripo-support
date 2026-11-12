/**
 * Tiny OpenAI-compatible LLM used only to exercise the DSH agent loop and the
 * generate/3D tool-card UI in the isolated test profile. It always asks the
 * agent to call create_3d_task on the first turn, then returns a final text.
 */
import http from 'node:http';

const PORT = Number(process.env.LLM_PORT || 6140);
const HOST = '127.0.0.1';

function sse(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function chunk(content) {
  return {
    id: 'chatcmpl-mock',
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: 'mock-tool',
    choices: [{ index: 0, delta: content, finish_reason: null }],
  };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true }));
  }
  if (req.method !== 'POST' || !req.url?.startsWith('/v1/chat/completions')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: { message: 'not found' } }));
  }
  const chunks = [];
  for await (const part of req) chunks.push(part);
  let body = {};
  try { body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { /* ignore */ }
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const last = messages[messages.length - 1] || {};
  const hasToolResult = last.role === 'tool' || messages.some((message) => message.role === 'tool');
  res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  if (hasToolResult) {
    sse(res, chunk({ role: 'assistant', content: '3D 任务已完成，未执行额外处理。结果已显示在对话中。' }));
    sse(res, { ...chunk({}), choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] });
    res.write('data: [DONE]\n\n');
    return res.end();
  }
  const args = JSON.stringify({
    provider: 'qwenai-dashscope',
    operation: 'text_to_3d',
    prompt: 'A low-poly treasure chest with iron hinges, game ready',
    model: 'Tripo/Tripo-H3.1',
  });
  sse(res, chunk({
    role: 'assistant',
    tool_calls: [{ index: 0, id: 'call_3d_mock', type: 'function', function: { name: 'create_3d_task', arguments: args } }],
  }));
  sse(res, { ...chunk({}), choices: [{ index: 0, delta: {}, finish_reason: 'tool_calls' }] });
  res.write('data: [DONE]\n\n');
  res.end();
});

server.listen(PORT, HOST, () => console.log(`mock LLM listening on http://${HOST}:${PORT}`));



