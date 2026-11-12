# Isolated feasibility sandbox

All runtime state stays under this directory. Nothing here is installed into the real `desktop` profile.

## Layout

- `dsh-home/` — throwaway DSH home created by `prepare.ps1`
- `prepare.ps1` — create the `feas` profile from the shipped `web` template and install the local plugin
- `start.ps1` / `stop.ps1` — start/stop the mock API and the isolated Web instance
- `inspect-ui.mjs`, `ui-*.mjs`, `preview-shot.mjs` — headless Edge checks and screenshots
- `*.log` — captured output from the last run

## Re-run

```powershell
# 1. Initialize the isolated profile (only the first time, or after deleting dsh-home)
.\prepare.ps1

# 2. Start mock + isolated DSH Web on 127.0.0.1:6130
.\start.ps1

# 3. Open the URL printed by start.ps1 (includes ?token=...)

# 4. Stop both processes
.\stop.ps1
```

## Mock credentials

These are local test values only; they are not real provider credentials:

| Service | Value |
|---|---|
| Tripo official protocol | `test-tripo-key` |
| Tripo third-party relay | `thirdparty-key` |
| Hunyuan3D SecretId | `test-hy3d-secret-id` |
| Hunyuan3D SecretKey | `test-hy3d-secret-key` |

## Notes

- The mock listens on `127.0.0.1` only.
- The Hunyuan3D mock recomputes the TC3-HMAC-SHA256 signature, so a wrong plugin signature fails the test.
- The isolated DSH home contains test credentials and session logs; delete `dsh-home/` to reset.


## Optional agent-loop mock

For the in-chat tool-card test, run `mock/llm-server.mjs` on port 6140 and add the `llm-pi-ai` mock provider + `agent-default-model` rows to the isolated `cordis.patch.yml` (see `.agent-backups/feas-patch-before-mockllm.yml` for the pre-test version). The mock LLM is a test fixture only and is not part of the plugin.


