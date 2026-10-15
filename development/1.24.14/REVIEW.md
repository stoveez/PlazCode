# PlazCode 1.24.14 private test build

Validation: local focused/browser/native checks passed. The first full JavaScript run passed 153 scripts and found two obsolete expectations (sent cards retained, source notice pinned to 1.24.13); both updated checks pass. A final full run and exact-source platform CI are pending. No public publication is authorized.

## Reported behavior and scope
1. Confirmed Co-Work follow-ups should disappear immediately. Their cards and queue-panel history stayed mounted after delivery.
2. Claude in Edge sometimes completed its reply but PlazCode stopped with “Claude sent nothing.” The DOM reader could count nested response elements as separate turns and choose a trailing empty child, or choose the thinking markdown before the answer.
3. On an affected Windows installation, Studio never connects, so RobloxScript Start is unavailable. The exact machine error was not supplied. Native code required LocalAppData/Roblox/mcp.bat and gated first connection on process-name detection, unlike the Python launcher's fallback discovery.

## Changes
- Hide only confirmed sent Co-Work receipts from the chat and queue panel. Keep bounded internal receipts, ordering, exact text and delivery uncertainty safeguards.
- Normalize Claude assistant candidates to owning turns and read all non-thinking answer blocks without duplicating nested markdown. Keep old layouts, raw tool source and empty-latest-turn isolation.
- Preserve the official Windows batch launcher; if missing, discover the running Studio's matching StudioMCP.exe, then a complete version under bounded Roblox install roots. Support spaces and custom running installation paths without scanning entire drives.
- Attempt MCP connection at app launch and retry without requiring process-name detection. Keep current operation locks, selected-Studio safeguards, miss debounce and truthful verified status. This does not enable a disabled Studio MCP setting.

## Evidence
- The new browser regression fails on the unmodified 1.24.13 source for both cards and nested Claude turns; it passes with these changes.
- The native no-process-detection startup fixture fails with the released native binary, and passes with the changed native binary. It checks unavailable Studio, late availability, closure and reconnection, without a browser.
- Chromium DOM fixtures pass for completed commands and immediate card cleanup, including keeping uncertain requests visible.
- Local Rust: 141 passed, 2 ignored (the existing stdio fixture and live revision-feed check); no failed tests. The exact-source platform workflow must supply Windows/macOS builds and full CI evidence.
- Existing native authenticated-route tests, generated Luau mesh/Explorer transactions, overlay CRLF preparation, package byte/mode preservation and promotion permission tests pass.

## Limits and release gate
The actual Edge/Claude account and affected Windows Studio installation have not been reproduced live. Fixtures are not proof of those live environments. Studio must be installed and its MCP server enabled; PlazCode must not claim connected before a successful probe. Windows artifacts are unsigned; macOS signing is only what the existing validation/package pipeline performs. Live user testing and explicit green light are required before any public release, feed promotion or publisher workflow. Current stable feeds and release assets are untouched.

Source: checksum-verified PlazCode-source-1.24.13.zip with development/1.24.14/overlay applied. Run python3 development/1.24.14/prepare.py; output is build-src-1.24.14/PlazCode. Existing build-src/PlazCode is preserved.
