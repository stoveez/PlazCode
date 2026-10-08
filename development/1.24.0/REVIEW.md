# PlazCode 1.24.0

The 98 KiB feed exceeded existing clients’ 64 KiB limit. Both live feeds were compacted to about 10 KiB without changing archive URLs or checksums. Future feed generation uses a 48 KiB budget and the publisher validates both platforms.

Automatic shared learning is mandatory and uses three canonical local workflow IDs. Only an ID and pass/fail enum leave the client; the API rejects extra fields and cannot supply text or executable instructions. The recorded check is an actual process exit status, never parsed provider output or task completion alone. Unsupported tools/commands, missing reads, incomplete tasks and edits after the final test are excluded. Free-text skills remain local unless explicitly reviewed for manual publication.

The public service uses expiring one-use proof-of-work tickets, atomic deduplication, a bounded daily capacity, aggregate reports, versioned methods and maintainer retraction. No stable client identity or raw task data is stored by the application. Host networking may still process ordinary connection metadata. Anonymous reports are untrusted; the service cannot verify task correctness or prevent coordinated false counts. Returned IDs expand only into built-in reviewed workflow descriptions.

Scope limitation: this first automatic release learns which of three supported local workflows pass tests, not arbitrary problem-specific answers. Roblox/Blender and unsupported local workflows remain private. It neither changes provider model weights nor claims benchmark improvements.

Validation: pending exact-source platform CI.
