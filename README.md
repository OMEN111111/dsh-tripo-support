# dsh-tripo-support

**让 DeepSeek Harness（DSH）直接管理并调用 Tripo、Meshy、Hyper3D、腾讯混元3D（HY3D）以及兼容的第三方异步 3D 生成服务。**

Tripo, Meshy, Hyper3D and Tencent Hunyuan3D async 3D providers for DeepSeek Harness — configure keys in **Settings → 3D generation**, pick a provider/model in the composer, generate one requested model, and preview it in the conversation.

## 特性

- **独立设置页**：设置 → 3D 生成，只显示已添加的供应商。
- **添加模型供应商**：底部按钮展开「官方途径」/「自定义模型 API」二级菜单。
- **供应商管理**：所有已添加供应商均可删除；官方供应商可重新添加。
- **模型目录**：控制实际可调用模型，并为每个模型设置仅用于显示的别名。
- **模型测试**：选择供应商后测试具体模型。
- **对话框 3D 胶囊**：切换厂商和模型，不覆盖 DSH 原生 LLM 选择器。
- **多通道预览**：对话内 3D 结果卡片支持颜色、法线、粗糙度、金属度、线框和白膜模式。
- **单次生成约束**：Agent 每个用户轮次最多创建一个 3D 生成任务，禁止自动对比生成、重试或追加 DCC/修改操作；结果必须反馈给用户后停止。
- **插件内更新**：设置 → 3D 生成 → 插件更新，检查 GitHub Release 并确认更新。

## 供应商

| 渠道 | 认证 |
|---|---|
| Tripo | API Key（Bearer） |
| Meshy | API Key（Bearer） |
| Hyper3D / Rodin | API Key（Bearer） |
| HY3D（腾讯混元3D） | 默认 SecretId + SecretKey（TC3）；可选 API Key（Bearer，兼容网关） |
| qwenai / 百炼（Tripo） | 第三方预设，API Key（Bearer） |
| 自定义模型 API | Tripo v3 / Meshy / Hyper3D / DashScope / HY3D 兼容协议 |

> HY3D 官方 `ai3d.tencentcloudapi.com` 使用腾讯云 TC3 签名时，请在卡片「认证方式」切换为 SecretId + SecretKey。接受 Bearer 的兼容网关可使用 API Key。

## 安装

```powershell
dsh plugin --profile desktop add "https://github.com/OMEN111111/dsh-tripo-support.git"
```

或使用 Release 中的 `dsh-tripo-support-0.1.4.tgz`。

安装后完整退出并重新打开 DSH。

## 使用

- 设置 → 3D 生成：添加/配置供应商、模型目录、测试模型和插件更新。
- 对话输入框下方 3D 胶囊：选择厂商和具体模型。
- 对话中直接描述需求；Agent 只执行一次明确请求，完成后在对话内显示可交互 3D 结果卡片。

## 开发约束

插件只包含运行所需的 Host/Client 代码、资源、README、CHANGELOG 和许可文件。开发文档、可行性测试、临时文本和构建记录不进入版本库或发布包。

## 许可

MIT，见 [LICENSE](LICENSE)。`@google/model-viewer` 使用 Apache-2.0；three.js 使用 MIT，见 `plugin/assets/LICENSE-model-viewer` 与 `plugin/assets/LICENSE-three`。


