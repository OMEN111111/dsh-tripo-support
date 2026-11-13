# Changelog

## 0.1.6 — 2026-11-13

### Added

- **3D 工坊页签**：在对话顶部视图标签栏新增 `3D 工坊`，提供独立的三栏工作台。
  - 左侧按「当前工作区 / 全部工作区」浏览已生成的 3D 模型，支持搜索与刷新。
  - 中间主预览视口支持颜色、法线、粗糙度、金属度、线框、白膜六种模式，以及 Maya 式 `Alt+左键` 旋转、`Alt+中键` 平移、`Alt+右键/滚轮` 缩放和 `F` 聚焦。
  - 右侧直接选择供应商、模型和操作，支持文生 3D、图生 3D、多视图生 3D、贴图、分割、重拓扑、UV、补洞、格式转换、绑骨、动画重定向等当前供应商支持的全部操作。
- 工作区模型发现与安全读取路由：只扫描已注册工作区（及历史任务输出）的 `3d-output`，模型读取限制在已注册工作区内。

### Changed

- `TaskStore` 首次读取持久化任务时增加并发加载保护；会话任务记录在插件启动后可继续读取。
- 通过 3D 工坊发起的生成任务会记录目标工作区，轮询完成后下载到该工作区的 `3d-output`。

### Verification

- 隔离 `feas` 沙箱：`3D 工坊` 页签正常注册，模型列表、查看器加载、通道切换和生成面板渲染通过。
- Maya 操作验证：Alt+左键旋转、Alt+中键平移、Alt+右键缩放、滚轮缩放和聚焦均改变相机；白膜/线框模式可切换。
- 通过 3D 工坊选择 qwenai 供应商生成 mock 任务，任务轮询成功后模型出现在列表并自动选中。
- 打包 `dsh-tripo-support-0.1.6.tgz` 安装到全新 `feas2` / `feas3` profile：插件加载、五个供应商和 `3D 工坊` 页签均正常。
- `node tests/protocols-smoke.mjs`：51 项通过。

## 0.1.5 — 2026-11-12

### Fixed

- Advanced settings no longer blanks the 3D settings page. The model-discovery state variables (`discoverBusy`, `discoverError`, `discovered`, `discoverSelected`) were referenced by the advanced panel but never declared, causing `ReferenceError: discoverBusy is not defined` and a crashed settings slot.
- Verified advanced settings opens with the provider card, model catalog and discovery controls intact.
## 0.1.4 — 2026-11-12

### Fixed

- Removed providers now disappear from the composer pill immediately (provider-change event).
- Model test results now use explicit success/failure styling; fetch failures are red.
- HY3D official endpoint defaults to TC3; API Key is only offered for Bearer-compatible gateways.

### Added

- Model discovery in the provider model catalog: `检测可用模型` reads the provider's model list when available and lets the user selectively add entries.
- Provider add menu includes official/custom paths; all added providers can be deleted and restored.
- Per-model test selection.
- PBR channel viewer modes: color, normal, roughness, metallic, wireframe, clay.

### Changed

- Version remains feature-scoped as 0.1.4; development docs and test artifacts are not published.
## 0.1.3 — 2026-11-12

### Added

- **Provider onboarding**: the 3D settings page shows only added providers and expands an `添加模型供应商` menu with **官方途径** and **自定义模型 API** choices.
- **Provider deletion**: every added provider can be removed, including official providers and the qwenai preset; all can be restored through the add menu.
- **Model catalog**: per-provider `modelCatalog` maps callable model IDs to display names. The composer pill shows the alias while tools continue using the real model ID.
- **Per-model test**: the provider card can select a catalog model and test that model.
- **PBR channel preview**: the in-chat 3D viewer now supports color, normal, roughness, metallic, wireframe and clay/white-model modes.
- **Hard one-shot guard**: at most one 3D generation operation per user turn; a second generation is denied with a user-facing reason.

### Changed

- HY3D official `ai3d` uses **SecretId + SecretKey (TC3)** by default; the card can switch to **API Key (Bearer)** for compatible gateways. The API-key default caused `AuthFailure.InvalidAuthorization` on the official endpoint and was reverted.
- The update checker is inside **Settings → 3D 生成 → 插件更新**, not a separate Plugins tab.
- The viewer is bundled locally (three.js MIT); `model-viewer` remains a legacy asset.

### Fixed

- The 3D update checks the GitHub release page first, then the API and raw manifest as fallbacks.
## 0.1.2 — 2026-11-12

### Added

- **Meshy official channel**: text-to-3D, image-to-3D, multi-image-to-3D, retexture, remesh, UV unwrap, conversion and rigging, using the official `https://api.meshy.ai` API.
- **Hyper3D / Rodin official channel**: text-to-3D and image-to-3D via `https://api.hyper3d.com/api/v2`, including async status and download handling.
- **`select_3d_model` tool**: lets the agent switch the active provider/model only after explicit user approval. This is intended for qwenai Tripo's per-operation models (texture, rigging, topology, etc.).
- **Dedicated in-chat 3D result node**: successful `create_3d_task` / `run_3d_operation` / `generate_3d` results render a `model-viewer` card directly in the conversation, without requiring the user to expand the tool-call row. The card polls the task and shows the GLB when ready.
- **Plugin-panel update checker**: Settings → 3D 生成 → Plugin update reads the latest GitHub release, compares it with the installed version, and offers an explicit update action. Version remains `0.1.2`; the release asset is replaced in place.
- **3D execution policy** injected into the system prompt:
  - one user request = one requested operation;
  - no automatic texture, retopology, rigging, DCC modeling or retries;
  - always report the result and stop;
  - ask before switching provider/model/operation.
- DSH `0.2.2-rc.2` compatibility declaration (`engines.dsh`), while retaining `0.2.2-rc.1` support.

### Changed

- Moved **qwenai / 百炼 (Tripo)** from the official tab to the **third-party** tab. It is a Tripo-backed service, not a direct official provider.
- HY3D official `ai3d` keeps **SecretId + SecretKey (TC3)** as the default; **API Key (Bearer)** remains available for compatible gateways. The previous API-key default was reverted after the official endpoint returned `AuthFailure.InvalidAuthorization`.
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
- Self-update: installed a 0.1.1 test copy, detected 0.1.2, installed the release tarball via `/update/apply`, and verified 0.1.2 after restart.

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





