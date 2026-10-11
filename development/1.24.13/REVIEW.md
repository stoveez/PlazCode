# PlazCode 1.24.13 review

Validation: pending. Private test build only; not published.

Built from the published `PlazCode-source-1.24.12.zip` with `overlay/` applied by `prepare.py`.

Root causes and fixes:
- False "not connected" bar and long startup pause: `roblox_tools` waited for `AddonManager::list_tools`, which started every MCP add-on one after another (initialize timeout 120 s, runtime setup up to 300 s) while holding the manager lock. The browser's 8 s intro timed out and its `ok:false` frame could overwrite a verified connection. Add-ons now start with `join_all`, `addon_snapshot` waits at most 4 s and otherwise serves the cached catalogue (the refresh continues in the background), and a timed-out intro frame is dropped instead of reported as disconnected.
- "PlazCode Agent crashed" (OS Error 1450): tokio's reactor panics on ERROR_NO_SYSTEM_RESOURCES. The panic hook now relaunches the executable (max 5, `PLAZCODE_CRASH_RESTARTS`) instead of a modal box; panics on tokio worker threads no longer open a blocking MessageBox.
- `local (0 tools)`: `statusObj` hard-coded 0 for the local server; it now reports the real tool count.
- "Startup handshake failed": the single prose correction retry was Notion-only; every provider now gets it, and extra calls next to `list_commands` no longer fail the handshake.
- Crax/ChatGPT pasting scripts: the startup result states the connection; a reply with a Lua code block and no command triggers one reminder while Studio is verified connected.
- Notion unsent tool result: when our own text is verifiably still in the composer and no new turn appeared, it is delivered once more regardless of size.
- Task checklist: `requestSteps` condenses each request sentence into a short imperative; the system prompt asks for labels of at most 8 words.

Not changed: GLM "No response ... <!doctype" is z.ai returning an HTML error page.

Tests: `test-1.24.13-fixes.js`, updated `test-desktop-regression.js` (hashes for core/config.js and core/main.js), Rust `reactor_resource_panics_are_recognised_but_other_panics_are_not`.

Live Studio, Blender, Notion, Crax and ChatGPT behaviour is not yet verified.
