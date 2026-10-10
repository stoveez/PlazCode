# PlazCode 1.24.10 review

Validation: pending exact-source platform CI and the packaged macOS desktop check.

Scope: Notion AI provider only (`providers/notion.js`), plus its regression tests and the 1.24.10 version bump. The release is built from the published `PlazCode-source-1.24.9.zip` with the `overlay/` files applied by `prepare.py`.

Root causes fixed after Notion's site update:
- `/ai` is the new-chat landing and threads use `/chat?t=<id>`; the conversation key now includes the thread id so chats no longer collide.
- Large native inserts could freeze the tab; drafts are settle-checked and fall back to bounded chunked paste. Foreign or changed drafts are never overwritten.
- The composer renders emoji as `img.notion-emoji` and converts the final straight quote to a curly quote; draft read-back now includes emoji alt text and folds curly quotes, so the startup digest verifies and auto-sends.
- New chat controls are matched in multiple languages and the send control has a structural fallback.

Live check: the maintainer confirmed Start Agent on Windows / Chrome 154 / AgentScript — the startup digest auto-sent and the model replied.
