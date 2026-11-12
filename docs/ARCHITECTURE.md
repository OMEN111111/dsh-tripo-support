# Architecture

## Layers

```
plugin/index.js              Host wiring: tools, web routes, task lifecycle
plugin/lib/protocols.js      Protocol adapters + operation catalog
plugin/lib/state.js          Provider profiles + credential refs
plugin/lib/tasks.js          Async task records, downloads, preview registry
plugin/client.js             Models card, 3D selector, tool card viewer
plugin/assets/model-viewer   Bundled GLB viewer (Apache-2.0)
```

## Provider profiles

A provider is data, not code:

```json
{
  "id": "qwenai-dashscope",
  "label": "qwenai / 百炼 3D",
  "protocol": "dashscope",
  "auth": "bearer",
  "baseURL": "https://cn-beijing.maas.qianwenaiapi.com/api/v1/services/aigc/video-generation/3d-generation",
  "models": ["Tripo/Tripo-H3.1", "Tripo/Tripo-Texture"],
  "defaultModel": "Tripo/Tripo-H3.1"
}
```

- `protocol: tripo` — Tripo official v3 paths and Bearer key.
- `protocol: dashscope` — Bailian / qianwenai async 3D; `X-DashScope-Async: enable`; query URL derived by replacing the services path with `/api/v1/tasks`.
- `protocol: tencent` — Tencent Cloud TI-3D; SecretId/SecretKey; TC3-HMAC-SHA256; action names per operation.

Credentials live in DSH's `credentials` service. The profile only stores refs (`apiKeyRef` or `secretIdRef`/`secretKeyRef`).

## Task lifecycle

1. `create_3d_task` builds a protocol-specific create request.
2. Host stores `{providerId, taskId, operation, model, status}` in `$DSH_HOME/tripo-support/tasks.json`.
3. `get_3d_task` / `ToolPreview` polls every 2.5s.
4. On success, host downloads `model_url` into the Session cwd `3d-output/`, registers a preview id, and returns `previewUrl`.
5. `ToolPreview` renders the preview id through `/plugins/dsh-tripo-support/model/:id`.

## Why not an LLM adapter

DSH's `LlmAdapter` contract streams chat tokens and tool calls. Tripo/HY3D do not implement that; registering them as LLM routes would break the agent loop. The plugin therefore uses a separate 3D model selector and tools.

## UI seats

- `settings.section` — a dedicated Settings → 3D generation page with official and third-party provider configuration.
- `conversation.input.right` — the `3D · provider` model selector.
- `tool.call.toolview` — custom cards for `create_3d_task`, `run_3d_operation`, `generate_3d`, `wait_3d_task`.

