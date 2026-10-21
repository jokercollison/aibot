# Offline Minecraft Wiki research archive

This is a development reference backup, separate from the Minecraft add-on.
The compressed database parts are intentionally stored here so loss of wiki
access or recreation of the cloud workspace does not destroy the research corpus.
They are **not** shipped inside any `.mcaddon` or `.mcpack`.

The 2026-10-21 snapshot contains current revision text, redirects, links, headings,
and a local full-text search index for 79,308 pages across 15 game-content and
support namespaces. These are page revisions, not 79,308 distinct gameplay facts.
One additional page disappeared from public access during capture and is explicitly
reported in `docs/WIKI_ARCHIVE_STATUS.json`. Binary images/audio/videos, full edit
histories, and user/talk pages are not part of this text archive. The original
Kiwix ZIM is a separate potential source of rendered pages/media.

## Restore without wiki access

From the repository root:

```sh
python tools/wiki_backup.py restore research/wiki-archive/2026-10-21/manifest.json /workspace/reference/minecraft-wiki/restored-archive.sqlite
python tools/wiki_archive.py --database /workspace/reference/minecraft-wiki/restored-archive.sqlite --search '"snowy wolf"'
python tools/wiki_archive.py --database /workspace/reference/minecraft-wiki/restored-archive.sqlite --show Wolf --section 'Color variants'
```

Restoration checks every compressed-part checksum, the complete database checksum,
and SQLite integrity. The destination must not already exist. For normal research,
restore to `/workspace/reference/minecraft-wiki/full-archive.sqlite` if absent.
All reads/searches and backup restoration use Python's standard library only.
The ZIM importer separately requires the pinned research-only `libzim==3.13.1`.

## Source notices

Source: https://minecraft.wiki/ . Each article row preserves its title, page ID,
revision ID, revision timestamp, capture timestamp, source hash and complete source.
A fixed revision is attributable at
`https://minecraft.wiki/w/Special:PermanentLink/REVISION_ID`; page history/author
attribution is available from its original wiki page and history link.

Minecraft Wiki currently declares **CC BY-NC-SA 3.0 unless otherwise noted**:
https://creativecommons.org/licenses/by-nc-sa/3.0/ . Preserve these source notices
and any article-specific notices. This archive retains third-party reference text;
it is not part of the product's original explanations or a declaration that the
wiki text can be included in a paid product. The archive backup is a research copy.
Future player answers need independently authored, edition/version-aware facts.

Verified restoration evidence is recorded in `docs/WIKI_OFFLINE_VERIFICATION.json`: all 79,308 source hashes matched after restoring solely from the backup parts, and real wolf/biome/recipe/template queries passed with networking forbidden.
