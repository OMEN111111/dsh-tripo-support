# Formal plugin evidence

| File | What it proves |
|---|---|
| `chat-3d-preview.png` | A real DSH agent turn called `create_3d_task`; the tool card polled to success and rendered an interactive `model-viewer` GLB in the conversation. |
| `operation-preview.png` | Settings → Models → 3D operation panel completed a qianwenai/DashScope task and rendered the GLB preview. |
| `operation-result.txt` | Text result of that operation (provider, operation, status, task id, local file). |
| `operation-preview.json` | `model-viewer` load state for the settings-panel preview. |

`raw/` keeps intermediate screenshots and DOM/log dumps from the same runs.
