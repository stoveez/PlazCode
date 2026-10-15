# PlazCode 1.24.15 development — ClickUp provider

Private test build only. Do not publish or change update feeds without explicit approval.

Scope: ClickUp Ask Brain and existing AI-agent direct messages, using existing PlazCode Studio, Blender and local-file commands. The PlazCode bar follows the active composer. Human chats, task comments, Docs and agent-creation forms are excluded.

Implemented: ClickUp host permissions, SPA-scoped provider, exact Quill draft insertion, one-click Send with user-message receipt, scoped Send/Stop, role and thread identity, screenshot uploads and feedback, compact list_commands startup. No retry after an ambiguous send. Model picker and native ClickUp tools are not repurposed.

Live signed-in checks: Ask Brain and built-in Brain agent DM text sends, multiline Unicode/JSON fidelity, locked composer restoration, image-upload receipt, confirmed image message, active thread selection. No custom agents were available; arbitrary custom-agent layouts and user's local Studio/Blender execution remain unverified live.

Validation in progress: sanitized Chromium/Firefox DOM fixtures, full production-core startup and mock-bridge Studio/Blender/file feedback, bar geometry, protected-code and complete regressions. Workflow packages fresh native binaries for private testing only. No main/release/feed changes.
