# dsh-tripo-support

在 DeepSeek Harness（DSH）的「设置 → 3D 生成」中管理 Tripo、Meshy、Hyper3D、腾讯混元3D 以及兼容的第三方异步 3D 服务，并让 Agent 在项目里生成、预览和继续处理 3D 模型。

## 功能

- **设置 → 3D 生成页面**：官方渠道 / 第三方渠道、API Key / SecretId+SecretKey、Base URL 与模型目录（官方预填，可高级覆盖）。
- **对话框工具条 3D 模型选择器**：独立于原生 LLM 模型选择器，不破坏 DSH 聊天模型体系。
- **对话内 3D 预览**：生成完成后在对话中自动出现独立的 `model-viewer` 结果卡片，不需要展开工具调用；支持旋转、缩放。
- **异步任务**：创建任务 → 轮询 → 下载到当前 Session 工作区的 `3d-output/`。
- **插件面板更新检查**：在「设置 → 内置插件 → 3D 支持」中检查 GitHub 最新版本，确认后可更新。
- **完整操作集**：
  - Tripo 官方 v3：文生3D、图生3D、多视图、文生图/图生图/多视图编辑、贴图、网格分割/智能分割、重拓扑、UV、补洞、格式转换、可绑骨检查、自动绑骨、动画重定向、图片生成 Gaussian Splat。
  - Meshy 官方：文生/图生/多视图 3D、贴图、重拓扑、UV、格式转换、自动绑骨。
  - Hyper3D / Rodin 官方：文生/图生 3D。
  - qwenai / DashScope 3D（第三方预设，Tripo 模型）：文生/图生/多视图、贴图、网格分割/智能分割、补洞、重拓扑、格式转换、可绑骨检查、自动绑骨、动画重定向、图片生成 Gaussian Splat（以平台实际公开的模型名为准）。
  - 腾讯混元3D 官方：Pro/Rapid 文生/图生3D、纹理、智能减面、组件、UV、文生动作、自动绑骨、3D 人物、格式转换。
  - 第三方：任何 Tripo v3 或 DashScope 3D 兼容网关，填自定义 Base URL + key + 模型名即可。

## 安装

```powershell
# 先备份真实 profile（推荐）
Copy-Item "$env:USERPROFILE\.dsh\profiles\desktop\cordis.patch.yml" `
  "$env:USERPROFILE\.dsh\profiles\desktop\cordis.patch.yml.bak-before-tripo"

# 从 GitHub 仓库根安装（仓库根已声明 dsh.bundle.patch）
dsh plugin --profile desktop add "https://github.com/OMEN111111/dsh-tripo-support.git"

# 或从本地仓库根目录安装
dsh plugin --profile desktop add "."

# 或从打包文件安装
dsh plugin --profile desktop add ".\dist\dsh-tripo-support-0.1.2.tgz"
```

安装完成后从托盘完整退出并重新打开 DSH。插件只把行插入 profile 的 bundle 列表；设置与凭据在插件自己的页面管理。

## 配置示例

### Tripo 官方

| 字段 | 值 |
|---|---|
| 协议 | Tripo v3 |
| Base URL | `https://openapi.tripo3d.ai/v3` |
| API Key | 控制台创建的 `tsk_...` |
| 默认模型 | `v3.1-20260211` |

### Meshy 官方

| 字段 | 值 |
|---|---|
| 协议 | Meshy |
| Base URL | `https://api.meshy.ai` |
| API Key | `msy_...` |
| 默认模型 | `meshy-7.1` |

### Hyper3D 官方

| 字段 | 值 |
|---|---|
| 协议 | Hyper3D Rodin |
| Base URL | `https://api.hyper3d.com/api/v2` |
| API Key | Rodin API Key |
| 默认模型 | `Gen-2.5-Medium` |

### 第三方：qianwenai / 百炼（DashScope 3D）

qianwenai/百炼的 3D 服务使用 Tripo 模型，因此位于「第三方渠道」预设中：

| 字段 | 值 |
|---|---|
| 协议 | DashScope 3D |
| Base URL | `https://cn-beijing.maas.qianwenaiapi.com/api/v1/services/aigc/video-generation/3d-generation` |
| API Key | 平台的 `sk-...` / DashScope key |
| 模型 | `Tripo/Tripo-H3.1`、`Tripo/Tripo-P1.0`、`Tripo/Tripo-Texture`、`Tripo/Tripo-Segmentation`、`Tripo/Tripo-SmartSegmentation`、`Tripo/Tripo-MeshCompletion`、`Tripo/Tripo-Retopology`、`Tripo/Tripo-ConvertFormat`、`Tripo/Tripo-RigCheck`、`Tripo/Tripo-AutoRig`、`Tripo/Tripo-AnimationRetarget`、`Tripo/Tripo-ImageToSplat` |

查询地址由 Base URL 自动推导为 `/api/v1/tasks/{task_id}`；如果平台使用不同的查询路径，可在服务配置中覆盖。

### 腾讯混元3D 官方

| 字段 | 值 |
|---|---|
| 协议 | 腾讯混元3D（TI-3D） |
| Base URL | `https://ai3d.tencentcloudapi.com` |
| Region | `ap-guangzhou`（当前官方地域） |
| SecretId / SecretKey | 腾讯云 API 密钥 |
| 默认模型 | `3.1-pro`（或 `3.0-pro` / `rapid`） |

插件自动使用 `TC3-HMAC-SHA256` 签名、`X-TC-Action`、`X-TC-Version: 2025-05-13`。

### 第三方混元3D

如果第三方平台把混元3D 包装成 DashScope 3D 协议，新增一个 DashScope 服务并填入它的模型名即可；如果它是另一种协议，需要增加一个协议适配器（参考 `lib/protocols.js` 的 `tencent` / `dashscope` 分支）。

## Agent 工具

| 工具 | 用途 |
|---|---|
| `list_3d_providers` | 列出服务、模型、操作和密钥状态 |
| `list_3d_tasks` | 列出本地最近的 3D 任务记录 |
| `batch_query_3d_tasks` | 批量查询 Tripo 任务（最多 100 个） |
| `select_3d_model` | 经用户明确同意后切换当前厂商/模型 |
| `create_3d_task` | 创建异步任务并立即返回 `task_id`，用于对话内进度/预览 |
| `get_3d_task` | 查询状态；成功时可下载到工作区 |
| `wait_3d_task` | 轮询到完成并下载 |
| `run_3d_operation` | 一次完成任意操作（生成/贴图/拆件/拓扑/绑定/动画等） |
| `generate_3d` | 文生3D / 图生3D / 多视图的便捷入口 |

所有工具都返回 `provider`、`operation`、`taskId`、`status`，成功时带 `localFile`、`bytes`、`previewUrl`；`previewUrl` 指向插件自己的同源模型路由。

### Webhook（Tripo）

在 Tripo 控制台 Settings → Webhooks 添加：

```
https://<你的 DSH 公网地址>/plugins/dsh-tripo-support/webhook/tripo-official
```

把控制台显示的 `whsec_...` 填到对应服务卡片的「Webhook Secret」并保存。插件会校验 `Tripo-Webhook-Signature` 的 HMAC-SHA256，并更新本地任务状态。

## 对话内预览

- `create_3d_task` 返回后，工具卡片每 2.5 秒轮询 `/plugins/dsh-tripo-support/task?...`。
- 任务成功后，卡片内 `<model-viewer>` 直接加载 GLB；可旋转、缩放、自动旋转。
- `model-viewer` 资源随插件打包在 `assets/model-viewer.min.js`，不依赖 CDN。
- 大模型可降级为缩略图/下载链接（后续版本）。

## 开发与测试

测试夹具在 `../feasibility`：

```powershell
# 初始化隔离 DSH_HOME + feas profile
..\feasibility\sandbox\prepare.ps1

# 启动 mock 3D API + 隔离 DSH Web（端口 6130）
..\feasibility\sandbox\start.ps1

# 停止
..\feasibility\sandbox\stop.ps1
```

Mock 覆盖 Tripo v3、DashScope 3D、腾讯混元3D（TC3 签名会被服务端重算验证）、Meshy 和 Hyper3D Rodin。协议目录静态检查共 51 项。

## 安全

- API Key 只写入 DSH `credentials` 服务，不写入 `cordis.patch.yml`，不写日志。
- 模型预览路由只提供已注册的预览文件，不接受任意路径。
- 设置卡片的写 key 路由做同源检查；正式版可改为 DSH `remote.credentials` 通道以进一步收敛。
- 下载文件限制到当前 Session 的 `3d-output/`，文件名做安全化处理。

## 已知限制

- 未使用真实 Tripo / Meshy / Hyper3D / 腾讯云 key 做付费联调；正式上线前需要用户提供低额度 key 做一次最小任务。
- 第三方混元3D 的具体协议未提供样例；当前覆盖 DashScope 兼容路径。
- `model-viewer` 依赖 WebGL；无 WebGL 的环境会降级为下载。
- DSH 0.2.x 插件 API 可能变化；本版本声明兼容 `>=0.2.2-rc.1 <0.3.0`，首选基线为 0.2.2-rc.2。

## 第三方资源

- `@google/model-viewer`，Apache-2.0，见 `assets/LICENSE-model-viewer` 与 `THIRD_PARTY_NOTICES.md`。










