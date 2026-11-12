# Changelog

## 0.1.2 — 2026-11-12

### Added

- **Meshy official channel**: text-to-3D, image-to-3D, multi-image-to-3D, retexture, remesh, UV unwrap, conversion and rigging, using the official `https://api.meshy.ai` API.
- **Hyper3D / Rodin official channel**: text-to-3D and image-to-3D via `https://api.hyper3d.com/api/v2`, including async status and download handling.
- **`select_3d_model` tool**: lets the agent switch the active provider/model only after explicit user approval. This is intended for qwenai Tripo's per-operation models (texture, rigging, topology, etc.).
- **Dedicated in-chat 3D result node**: successful `create_3d_task` / `run_3d_operation` / `generate_3d` results render a `model-viewer` card directly in the conversation, without requiring the user to expand the tool-call row. The card polls the task and shows the GLB when ready.
- **Plugin-panel update checker**: Settings → Plugins → 3D 支持 reads the latest GitHub release, compares it with the installed version, and offers an explicit update action. Version remains `0.1.2`; the release asset is replaced in place.
- **3D execution policy** injected into the system prompt:
  - one user request = one requested operation;
  - no automatic texture, retopology, rigging, DCC modeling or retries;
  - always report the result and stop;
  - ask before switching provider/model/operation.
- DSH `0.2.2-rc.2` compatibility declaration (`engines.dsh`), while retaining `0.2.2-rc.1` support.

### Changed

- Moved **qwenai / 百炼 (Tripo)** from the official tab to the **third-party** tab. It is a Tripo-backed service, not a direct official provider.
- Official channel order and labels: **Tripo**, **Meshy**, **Hyper3D**, **HY3D**; the composer pill shows only provider names, without “官方” suffixes.
- Settings page remains limited to keys/configuration; provider and model invocation stays in the composer pill.
- Tool descriptions now explicitly prohibit automatic retries and chained 3D operations.
- Removed the duplicate preview inside the expanded tool-call row; the dedicated chat result card is the primary preview.
- Updated protocol smoke coverage to **51 operations** (Tripo 18, DashScope 13, Tencent 10, Meshy 8, Hyper3D 2).

### Fixed

- Provider state migration keeps built-in display names and the qwenai third-party classification when loading older `state.json` files.
- Model changes invalidate an incompatible persisted selection.
- Hyper3D download uses the generation task UUID while status polling uses the subscription key.
- Meshy accepts HTTP `202` create responses.
- `buildCreateRequest` is async to support Hyper3D multipart image uploads.

### Verification

- Protocol smoke test: 51 checks passed.
- Meshy and Hyper3D mock end-to-end generation: task created, polled, downloaded and previewed.
- Dedicated chat result node: `model-viewer loaded=true`, visible without expanding the tool card.
- Settings page: official providers (Tripo / Meshy / Hyper3D / HY3D) and third-party qwenai preset render correctly.
- Composer pill: provider switching and model switching persist through `/selection`.

### Known limitations

- Real paid provider keys were not used; live calls require the user's keys.
- Hyper3D currently supports text-to-3D and image-to-3D; texture/rigging endpoints are not exposed yet.
- Meshy post-processing endpoints are mapped but were validated only against the local mock, not a live Meshy account.
- Webhook production use needs a publicly reachable DSH endpoint/tunnel.

## 0.1.1 — 2026-11-12

- Dedicated `设置 → 3D 生成` page.
- Official/third-party tabs and compact provider cards.
- DSH-style composer 3D pill with provider and model switching.
- Separate from DSH model configuration; no settings operation panel.

## 0.1.0 — 2026-11-12

- Initial Tripo / qianwenai DashScope / Tencent Hunyuan3D support.
- Async tools, task polling, downloads, GLB preview and Webhook.
