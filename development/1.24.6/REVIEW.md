# PlazCode 1.24.6

Validation: local JavaScript and browser checks in progress; exact-source platform CI pending. Release promotion must require all four validation jobs and the real macOS desktop check.

The response watcher now bounds soft as well as native generation when meaningful text stops changing. Whitespace and PlazCode's own command timer do not count as model progress. Native Stop controls continue to prevent execution of partial responses. Existing provider time budgets and adapters are preserved.

Extension bridge callbacks have operation-specific deadlines, settle once and never replay a command. Immediate Stop permits a new user request while the old operation drains; Continue retains the old Stop latch until it is safe to clear. The latest accepted intent waits for outstanding operations and is scoped to the original conversation and session.

Native MCP exchanges use one absolute deadline for stdin writes, flush and stdout reads. Notifications and unrelated IDs cannot reset it. Whole tool deadlines include queueing and checkpoint work. An interrupted owned helper is reset, while another task's busy helper is left alone. Process cleanup is asynchronous and bounded. Add-on tools retain their existing long execution budgets.

The updater stages the current embedded helper for standard installations, preserving explicitly custom helpers. Both the built-in Windows updater and standalone batch launcher launch the helper with a process-scoped execution-policy bypass; it does not change system policy. Official release proof, archive version checks, SHA256 verification, backups and rollback remain required. The real batch launcher, automatic launch and post-launch integration tests run with a Restricted PowerShell policy.

Production-code Chromium/Firefox fixtures cover ChatGPT and Claude command completion, native generation pauses, stale soft generation and Stop. Native child-process tests cover notification noise, blocked stdin, unrelated response IDs and queued cancellation without replay. Existing startup, Notion, creation, provider preservation and UI suites remain required.

Live signed-in provider accounts and real Studio/Blender sessions are not tested. Windows remains unsigned and macOS ad-hoc signed, not notarized. Antivirus results are recorded without claiming universal acceptance. Release promotion requires all four platform jobs and a real 210-second macOS foreground lifetime plus background and restore checks.
