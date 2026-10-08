# Release descriptions

Future GitHub release descriptions must contain fewer than 2,000 characters, including Markdown, whitespace and update instructions. Keep the existing title, summary bullet, New additions, Improvements, Bug fixes, Validation and limitations, and Update sections; omit empty change categories as before.

Write concise bullets before publishing. For a longer in-app changelog, give its release entry an optional `github` object containing shorter `summary`, `added`, `improved`, `fixed` and `notes` fields. This changes only the GitHub release copy. Full changelog details remain intact. The publisher refuses descriptions of 2,000 characters or more rather than cutting off Markdown or silently dropping details.

Published releases and archives remain immutable. This rule applies to future updates.
