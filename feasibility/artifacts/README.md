# Feasibility evidence index

## screenshots/

| File | What it proves |
|---|---|
| `01-models-page.png` | The 3D service card is rendered inside Settings → Models, after the built-in provider rows. |
| `02-provider-cards-top.png` | Tripo and Hunyuan3D cards with key status, Base URL, model picker and test button. |
| `03-provider-cards-bottom.png` | Third-party provider, add-service form, and the end-to-end generate row. |
| `04-generate-result.png` | A UI-triggered async task completed and the GLB path/bytes are shown. |
| `05-save-key.png` | An API key typed in the card was saved through the Host credential path. |
| `06-composer-pill.png` | The composer has a separate 3D model picker; the native LLM selector is untouched. |
| `07-model-picker-popover.png` | Tripo, Hunyuan3D and a third-party provider are all selectable. |
| `08-3d-preview.png` | The generated GLB is loaded by `model-viewer` (`loaded=true`, `modelIsVisible=true`). |

## api-probes/

| File | What it proves |
|---|---|
| `tripo-auth-probe.txt` | Official Tripo v3 endpoint is reachable; invalid key returns HTTP 401 / code 2 and the `tsk_` hint. |
| `hy3d-auth-probe.txt` | Official Tencent Hunyuan3D endpoint is reachable; invalid SecretId returns HTTP 200 with `AuthFailure.SecretIdNotFound`. |
| `qwenai-auth-probe.txt` | qianwenai DashScope 3D endpoint is reachable; invalid key returns HTTP 401 `InvalidApiKey`. |

## logs/

Text dumps of the relevant UI states and the model-viewer load result. These are the source for the claims in `../REPORT.md`.

## raw/

Intermediate screenshots, control dumps and failed-run diagnostics kept for traceability. Not part of the delivery claims.

## formal/

Formal-plugin run evidence: settings page, composer pill, and the in-chat 3D tool card (`chat-3d-preview.png`).


## ui-redesign/

Evidence for the revised DSH-style UI: a dedicated Settings → 3D generation page and a composer 3D provider/model pill. See `ui-redesign/README.md`.

