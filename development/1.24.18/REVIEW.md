# PlazCode 1.24.18 — private validation build

No main branch, release, promotion, or update-feed changes are authorized by this work. Test on codex/plazcode-1.24.18 first.

## Interface languages

- Language is the first desktop Settings section and the first bar Settings section. The extension popup also offers the same control.
- Search above a native dropdown supports English/native names and codes. English is the default. Fourteen choices: English, Spanish, French, Russian, Arabic, Simplified/Traditional Chinese, Japanese, Korean, German, Brazilian Portuguese, Italian, Hindi and Turkish.
- The existing native-preference/extension synchronization carries rsLanguage. A failed save reverts the picker and leaves a visible error. Other preferences keep their existing behavior.
- Offline catalogs contain 877 built-in interface source strings per language. English fallback covers unknown technical and mixed external/status messages. No network translation service is used.
- Translate only PlazCode-owned UI. User prompts/replies, skill names/instructions, memory, file paths/source, template examples, notification contents and JSON/tool commands are protected. This setting does not instruct the AI to change reply language.
- Arabic uses scoped RTL; source code and technical fields remain LTR, authored text uses automatic direction. PlazCode/Ultra branding stays unchanged. Existing Ultra styling is preserved.
- Existing early debug capture and input isolation stay first in production script lists; catalog/runtime load before UI. Both native desktop render paths embed the same assets.
- Six mixed widgets have granular user-content guards and controlled UI binding. Dynamic mixed errors/status and native confirmations deliberately retain original English rather than translating arbitrary user data.
- Settings now opens at the top rather than the legacy Support shortcut. Menu width/position clamp to narrow viewports and the menu sits above the floating library button.

## ClickUp startup draft handling

- Reproduced the definite bug: a pre-send failure leaves the injected startup draft.
- On a definitely unattempted send, restore the original draft only if the same chat/editor still contains the exact known startup text, there were no attachments or trusted user edits, and no Send click occurred.
- Preserve user edits, ordinary messages, changed chats, attachments and all attempted/uncertain sends. Never automatically replay.
- Diagnostics distinguish missing, disabled, aria-disabled, obscured Send and a changed draft without recording draft text.
- This does NOT establish why Send is unavailable on the affected live installation. Manual-send and browser details remain necessary; no paid-plan cause is assumed and disabled native controls are not bypassed.

## Evidence before hosted validation

- New scoped runtime unit test and real Chromium desktop/extension language tests passed: all14 choices, native-name search, persistence, refresh without writes, failure rollback, reopen, scoped RTL and preserved authored text.
- Six-widget integration passed 2,208 isolated JSDOM/Chromium assertions, plus syntax checks and runtime-absent compatibility.
- ClickUp Chromium provider/full-core fixtures passed startup, bounded context parts, agent threads, Studio/Blender/file dispatch, large result paging and receipt/no-replay behavior. All11 new send-readiness/rollback cases passed.
- Strict catalog/compiler reproducibility and canonical Windows-CRLF overlay preparation passed.
- Desktop regression harness strips new injected assets in fake-DOM mode; approved main/toolkit localization changes have updated integrity baselines. Existing toolkit behavior fixtures remain.
- The local full JS runner completed; its 12 initial failures were missing local acorn dependencies, expected version/script-index changes, an isolated settings dependency, and new unguarded provider attribute reads. Those were corrected without dropping assertions; all12 failing tests then passed individually. A complete clean rerun and hosted native/browser/platform builds are required before delivery.
- Portable real-catalog widget fixture passed 1,102 assertions and is included in hosted browser validation. Local Rust/cargo and Firefox are unavailable; do not claim those checks from local tests.

## Reproducibility and packaging

Base is the published1.24.17 source, SHA25635af2180823382c057580fab9a41455f5f907e232c249af087d25c97b7873e24. prepare.py applies only this overlay to build-src-1.24.18/PlazCode and synchronizes extension copies. Version18 Cargo changes are package-version-only; dependency pins remain unchanged. package.py keeps the inherited platform pruning, source parity, Firefox rebuild and checksums. Catalog keys are packed once to avoid repeated English source text; runtime contract is unchanged and inline-script delimiters are escaped.

Validation workflow preserves the browser job and three-platform native matrix, isolated native preference crate, full regression and Windows Defender checks. Artifact: plazcode-1.24.18-Windows-validation. Signing, Defender, final package parity and platform compilation are not established until that run succeeds. Never interpret a configured check as passing evidence.
