# PlazCode 1.24.9 validation in progress

This branch is a checkpoint, not a published update. It extends 1.24.8 with connection recovery, complete result paging, user-selected limits, a mutually exclusive startup/run lifecycle, screenshot controls, skill editing and UltraGUI references. The provider preservation check still compares 1047 original healthy function bodies; changed send limits, Notion editor verification and Qwen stream cleanup have targeted tests. Snapshot changes are deliberate versioned source changes, not proof of live provider compatibility.

Per-command deadlines remain enforced. Overall run limits are off unless enabled explicitly. Unknown mutation outcomes are not retried. Explicit provider policy refusals stop correction attempts and retain an honest message.

The original user-provided UltraGUI archive is checksum-verified and preserved with its assets/licenses. Its complete references are loaded only when relevant; the ordinary Ultracode prompt remains compact. Blender helpers are included in both root and extension packages.

Final native, browser, updater and package validation is still required. Do not promote this branch until the exact source commit passes all required jobs.

Desktop Model Builder/UI Creator pages and their runtime scripts are removed. Toolkit and notifications load independently. Final publication requires the exact validated source, successful platform jobs, and packaged macOS desktop/updater checks.
