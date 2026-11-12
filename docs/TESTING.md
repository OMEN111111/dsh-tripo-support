# Formal plugin testing

## Isolation

- DSH_HOME: `feasibility/sandbox/dsh-home`
- Profile: `feas`
- Web port: `6131`
- Mock 3D API: `127.0.0.1:6123`
- Mock LLM: `127.0.0.1:6140` (only to exercise the agent loop)

The real `desktop` profile is not touched.

## Covered

| Area | Result |
|---|---|
| Plugin activation in DSH | pass; no startup errors |
| Settings → 3D generation page | pass; official/third-party tabs, compact provider cards, separate left-nav item |
| Key write through UI | pass; credential state becomes configured |
| Tripo official protocol | pass; create → poll → download against mock |
| DashScope / qianwenai protocol | pass; `X-DashScope-Async`; derived `/api/v1/tasks/{id}` |
| Tencent TI-3D protocol | pass; TC3 signature recomputed and verified by mock |
| HY3D API Key mode | pass against mock; Bearer auth configured without SecretId/SecretKey, generation succeeded |
| Meshy protocol | pass against mock; create 202 → poll → download → preview |
| Hyper3D Rodin protocol | pass against mock; subscription-key status → UUID download → preview |
| Tripo operations | pass against mock: generation, texture, segment, smart segment, retopology, UV, mesh complete, convert, rig check, auto rig, retarget, image-to-splat |
| Tencent operations | pass against mock: texture, reduce face, part, UV, motion, auto rig, profile-to-3D, convert (synchronous) |
| Agent tool call | pass; mock LLM emitted `create_3d_task`; tool succeeded |
| Composer 3D pill | pass; provider switch and model switch both persisted through `/selection` |
| Dedicated chat result node | pass; `<model-viewer>` `loaded=true`, `modelIsVisible=true` without expanding the tool row |
| Chat 3D preview | `loaded=true`, `modelIsVisible=true`; screenshot `feasibility/artifacts/formal/chat-3d-preview.png` |
| Tripo Webhook | pass; valid HMAC returned 200, bad signature returned 400 |
| 3D settings update check | pass; `/update/check` returned current/latest `0.1.2`; the 插件更新 card rendered in Settings → 3D 生成 |
| Self-update | pass; installed a 0.1.1 test copy, `/update/check` found 0.1.2, `/update/apply` installed the release tarball; after restart current version is 0.1.2 |

## Not covered

- Real paid tasks with real Tripo / Tencent Cloud keys.
- Real qianwenai production key (mock relay was used; the official endpoint was probed and returned HTTP 401 `InvalidApiKey`, which confirms reachability and the error envelope).
- Third-party HY3D protocol other than DashScope-compatible.
- Every optional parameter of every operation; `parameters` pass-through is available for advanced fields.

## Reproduce

```powershell
# from project root
cd feasibility\sandbox
.\prepare.ps1
.\start.ps1
# open the printed URL; then run UI checks or send a chat prompt
.\stop.ps1
```

For the agent-loop test, add the mock LLM rows to the isolated profile and start `mock/llm-server.mjs` on 6140; see `feasibility/sandbox` scripts and `feasibility/artifacts/formal/chat-3d-preview.png`.


### Probe evidence

- Tripo: `feasibility/artifacts/api-probes/tripo-auth-probe.txt` (HTTP 401, code 2).
- Tencent: `feasibility/artifacts/api-probes/hy3d-auth-probe.txt` (HTTP 200 with `AuthFailure.SecretIdNotFound`).
- qianwenai: `feasibility/artifacts/api-probes/qwenai-auth-probe.txt` (HTTP 401 `InvalidApiKey`).


- Packaged tarball: `dist/dsh-tripo-support-0.1.2.tgz` installed into a fresh profile; plugin loaded and `/plugins/dsh-tripo-support/status` returned the five providers (Tripo, qwenai, Meshy, Hyper3D, HY3D).
- DSH compatibility: manifest declares `engines.dsh >= 0.2.2-rc.1 < 0.3.0`; tested against 0.2.2-rc.1; the manifest accepts 0.2.2-rc.2. Live 0.2.2-rc.2 app verification remains to be performed after updating the DSH app.


## Remaining scope

- Tripo 2D image-generation endpoints are mapped (`text_to_image`, `image_to_image`, `image_to_multiview`, `edit_multiview`) and included in the protocol smoke test; the 3D operation paths were run end-to-end against the mock.
- Batch query and Webhook are implemented: `batch_query_3d_tasks` queries up to 100 Tripo task ids; `/plugins/dsh-tripo-support/webhook/<provider-id>` verifies `Tripo-Webhook-Signature` HMAC-SHA256 and updates the local task record. Production Webhook still needs a publicly reachable DSH endpoint/tunnel.
- Third-party HY3D protocols other than DashScope-compatible require a new adapter; only Tripo v3 and DashScope-compatible paths were tested.

- Protocol catalog smoke test: `node tests/protocols-smoke.mjs` passed 51 checks (Tripo 18, DashScope 13, Tencent 10, Meshy 8, Hyper3D 2).
ode tests/protocols-smoke.mjs` passed 51 checks (Tripo 18, DashScope 13, Tencent 10, Meshy 8, Hyper3D 2).








