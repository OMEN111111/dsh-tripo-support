# Changelog

## 0.2.0 — 2026-11-14

### Changed

- **正式更名为 `dsh-model-gen`**：插件包名、设置页标识、Host 路由、客户端模块 id、更新仓库和 GitHub 仓库均改为 `dsh-model-gen`；设置数据目录迁移到 `$DSH_HOME/model-gen`，首次启动自动复制旧的 `tripo-support` 状态/任务/预览记录。
- 保留旧路由 `/plugins/dsh-tripo-support` 作为兼容别名，已有对话里的旧预览链接仍可打开。
- 声明并验证 DSH **0.2.2-rc.3** 兼容范围：`engines.dsh: >=0.2.2-rc.3 <0.3.0`。
- 左侧模型卡片缩略图改为居中 `contain` 展示，避免模型被 `cover` 裁切而偏离中心。
- 费用预估扩展到其他渠道：腾讯云按专业版/极速版积分与人民币参考价显示；Hyper3D 显示订阅结果价；百炼/qwenai 和缺少公开固定报价的操作优先使用最近一次成功任务的实际扣费作为参考，否则明确显示按实际账单计费。
- 版本号提升到 **0.2.0**。

### Verification

- 在 DSH 0.2.2-rc.3 隔离环境启动、设置页、3D 胶囊、3D 工坊和预览路由通过。
- 旧 `tripo-support` 数据迁移和旧预览路由兼容验证。
- 缩略图居中、任务无记录来源自动填入、费用预估显示验证。
- `node tests/protocols-smoke.mjs`：52 项通过。

## 0.1.8 — 2026-11-13

### Added

- **3D 工坊生成体验升级**：
  - 单张图 / 多张图生成拆分为独立模式，支持直接选择本地图片；Tripo 通过官方 `/v3/files` 上传获取 `file_token`，Hyper3D / 腾讯人物接口使用 Base64，其他供应商保留公网图片链接输入。
  - 多张图生成改为按视角的独立图片插槽：Tripo / qwenai / Meshy 使用前、左、右、后四视图；HY3D 3.1 额外支持左 45°、右 45°、顶、底，共八个插槽。每个插槽一张图，允许留空，前视图必填。
  - 右侧显示当前供应商账户剩余积分（Tripo / Meshy / Hyper3D；其余供应商显示暂不可查）；查询失败自动重试一次。
  - 左侧模型库改为两列圆角正方形缩略图卡片，卡片本身只显示预览图；文件名、供应商、任务类型、时间和大小通过悬停信息框展示。
  - 没有供应商预览图的历史模型会由客户端 three.js 自动渲染缩略图，不再只显示空白卡片。
  - 选择已有模型后自动填入「模型来源」和「模型文件地址」；旧文件没有任务记录时从文件名解析任务 ID，模型地址回退到本地文件路径。
  - 新增面数、贴图尺寸、分部件生成、模型精度、四边面、高质量材质等生成选项。
  - 面数按供应商/模型提供上限选项：Tripo / qwenai 最高 1.5M，HY3D 最高 1.5M（含 1M、500K、200K、100K、50K、20K、10K、5K、3K），Meshy 提供 300K 等档位。
  - 固定输入改为下拉菜单：面数、贴图尺寸 1K/2K/4K/8K、拆分精细度、骨骼类型、骨骼标准、输出格式、减面程度、动作时长等。
  - 选择已有模型进行编辑时，自动填入源任务 ID、源模型 URL；只有用户主动选择模型时才切换供应商，避免仅切换任务类型就跳供应商。
  - 三种生成模式切换条移动到「任务类型」下方；当任务类型不是文字/单图/多图生成时隐藏。
  - 生成/处理按钮显示本次任务预计消耗：Tripo 按官网积分报价（生成基础、贴图尺寸、几何精度、四边面、分部件等叠加），Meshy 按 API 定价；腾讯云、Hyper3D、百炼和自定义网关按各自实际计费方式显示，不强行换算积分。
  - 任务类型、生成模式、面数、贴图尺寸、骨骼类型等选项增加悬停说明，包含用途和可能的费用影响。
  - 生成面板文案简化，任务类型、模型来源、模型文件地址、更多参数等标签更直白。

### Fixed

- **空工作区导致整个 3D 工坊不可点击**：无模型时，预览空状态是 `position:absolute; inset:0` 的透明层，定位到了外层视口，覆盖了左右面板。现在空状态被限制在预览容器内，并设置 `pointer-events:none`，左右面板和生成控件保持可点击。
- 上传接口请求体上限从 2MB 提升到 30MB，支持最大 20MB 的本地参考图。

### Verification

- 隔离 sandbox：空模型列表时右栏下拉、文本框、刷新、工作区切换和生成按钮的真实鼠标命中测试通过。
- Tripo mock：本地单图上传 → `file_token` → 图片生成任务完成；多图按前/左/右/后插槽上传 → 多视图生成任务完成。
- 多视角 UI：Tripo 显示 4 个插槽；HY3D 3.1 显示 8 个插槽；前视图必填、允许留空。
- 选择已有模型后自动填入源任务 ID 与源模型 URL；仅主动选择模型时切换供应商。
- 切换到格式转换/拆分等非生成任务时，生成模式条隐藏，供应商保持 Tripo，不再跳转 qwenai。
- 左侧模型卡片只显示缩略图，文件名/供应商/任务/时间/大小通过悬停 `title` 信息框展示。
- 无任务记录/无供应商预览图的历史模型用客户端 three.js 渲染出缩略图；`data:image/jpeg;base64` 结果验证通过。
- 选择无任务记录的模型后，从文件名解析出 `3d21c100-6460-4a70-9e72-19e56435eaf5` 填入「模型来源」，「模型文件地址」填入本地路径。
- 拆分精细度下拉显示简单/适中/精细；面数下拉最高 1.5M。
- 生成模式条位于任务类型下方；切换到贴图、拆分、转换时隐藏。
- 费用按钮验证：Tripo 文字生成默认显示 20 积分；贴图显示 10 积分；8K 贴图 + 精细几何显示 60 积分；腾讯云显示按账单计费而不显示积分。
- 余额查询：Meshy mock 返回 100；Tripo mock 返回 100；不支持查询的供应商显示提示。
- 协议构造验证：`face_limit`、`texture_size`、`generate_parts`、`texture_quality`、多图 `file_token` / 多视角 `MultiViewImages` 均写入正确请求字段。
- `node tests/protocols-smoke.mjs`：52 项通过。
- 说明：本版已完成本地验证，并发布为 v0.1.8。

## 0.1.7 — 2026-11-13

### Fixed

- **3D 工坊按钮无法点击**：DSH 会话视口的内容宽度拖拽手柄是覆盖在全高上的透明 `div`（左右各约 10px），会拦截落在其上的鼠标事件。3D 工坊原先没有把自己的实际绘制面板提升到手柄之上，右侧生成面板的中心恰好被右手柄覆盖，导致供应商、模型、操作、提示词、高级参数和 `开始生成` 等控件无法点击。
- 已给工坊标题栏、左侧模型库、中间预览区和右侧生成面板设置独立定位层级（`position: relative; z-index: 1`），使实际绘制的面板位于宽度手柄之上；切换回对话时手柄行为不变。

### Verification

- 使用真实鼠标坐标（非 JS 合成 click）验证：当前/全部工作区切换、刷新、模型列表选择、六种通道模式、聚焦、高级参数、开始生成均可点击。
- qwenai mock 文生 3D 通过工坊真实鼠标点击完成，新模型自动出现在列表并选中。
- `node tests/protocols-smoke.mjs`：51 项通过。

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
- 打包 `dsh-model-gen-0.1.6.tgz` 安装到全新 `feas2` / `feas3` profile：插件加载、五个供应商和 `3D 工坊` 页签均正常。
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





