# PlazCode 1.24.15 development — ClickUp provider

Private test build only. Do not publish or change update feeds without explicit approval.

## Scope
ClickUp Ask Brain and existing AI-agent direct messages, using the existing PlazCode Studio, Blender and local-file commands. The PlazCode bar follows the active composer and clears Ask/Agents tabs on the landing screen. Human chats, task comments, Docs and agent-creation forms are excluded. The desktop provider list opens the generic ClickUp site without embedding a private workspace ID.

## Implemented
ClickUp host permissions and SPA-scoped provider; exact Quill draft insertion; one exact Send click with a user-message receipt; scoped Send/Stop; avatar-based roles and stable thread identity; screenshot uploads and feedback; compact list_commands startup. No guessed form submissions, model-picker changes or automatic replay after ambiguous delivery. Native ClickUp task/Doc/agent tools cannot stand in for local PlazCode commands. All pre-existing provider function bodies and the merged Studio, Blender, dashboard and Skills behavior are preserved; desktop HTML changes are limited to one supported-AI entry and its count.

## Evidence
- Live signed-in Ask Brain and built-in Brain agent DM: text send receipts, multiline Unicode/JSON fidelity, locked-composer restoration, image uploads, active thread selection and actual toolbar placement.
- Ask Brain correctly read the four digits in a newly uploaded 640x320 PNG. The built-in Brain agent DM replied image unavailable, even when read-only image analysis was permitted. Upload transport is supported; image understanding depends on the ClickUp surface/model/agent and is not guaranteed in agent DMs.
- Sanitized Chromium fixtures run the complete production core: two-step startup, actual response watcher/parser/automatic tool loop, stubbed Studio/Blender/file dispatch with one execution per requested command, result feedback, normal Debug log probe, unlocked completion, active-composer bar tracking, exclusions, image receipts and no automatic resend after uncertainty. The CI workflow repeats these fixtures in Chromium and Firefox.
- Protected-code/provider-preservation, desktop/provider-roster and CRLF overlay preparation checks pass locally. Initial complete JavaScript suite found one expected roster assertion; adding the missing desktop ClickUp action and updating the roster checks resolved it. Compression checks reuse the established 1.24.14 read-only helper, not a new release promotion script.

## Remaining live coverage
No custom agents existed in the test account. Arbitrary custom-agent layouts and the user's real local Studio/Blender/files are not claimed as live-tested. Private CI builds fresh native executables and runs the full regression suites before delivery. Existing main, releases and update feeds remain unchanged. The development build is not publisher-signed.
