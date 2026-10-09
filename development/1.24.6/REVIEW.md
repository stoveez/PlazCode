# PlazCode 1.24.6

Validation: local JavaScript and browser checks in progress; exact-source platform CI pending. Release promotion must require all four validation jobs and the real macOS desktop check.

Only command deadlines, cancellation continuation, updater helper selection/launch policy and Skills importing change. Provider adapters, startup protocol, tool parsing, native remote authority, pairing, checksum validation, rollback and user storage remain covered by their existing regression suites.

Native Studio MCP uses one absolute deadline, including stdin writes, and tests cover noisy notifications, wrong response IDs, blocked writes and repeated healthy calls. Add-on stdin writes share their existing read deadline. Content-script background requests resolve once with a bounded deadline and ignore late replies; stopped requests retain drain guards. A provider generation flag alone cannot reset progress forever. Fresh native requests remain deferred until the old loop/cancellation drains; a later Stop invalidates them. Already-executed commands keep their existing deduplication records.

Automatic updates stage the embedded helper, preserving the installed copy. Windows helper launch uses process-scoped ExecutionPolicy Bypass; no machine policy changes. Real Windows tests cover Restricted parent process policy for automatic and BAT launches; package installation, checksums, settings preservation, backup/rollback, automatic triggers and relaunch tests remain required.

JSON/text imports reuse the validated save API with a new ID. They preserve Unicode content and existing skills, reject oversized/malformed data and begin unverified. Import is local and does not execute helpers or publish content.

Provider DOM fixtures simulate responses and the bridge. Live signed-in account behavior and real Roblox Studio remain unverified. Windows builds are unsigned and macOS uses ad-hoc signing. Release notes follow current emoji headings and concise bold-label bullets, well below 2,000 words (also within the repository's existing 2,000-character guard).
