# Offline Minecraft Wiki research archives

These development references are backed up in the repository so losing wiki
access or recreating the cloud workspace does not destroy the research corpus.
They are separate from the Minecraft add-on and are never included in `.mcaddon`
or `.mcpack` files. Downloading references does not automatically turn them into
accurate, edition-aware gameplay answers.

## Preserved snapshots

- **2026-10-21 text/source archive:** 79,308 current page revisions across 15
  game-content/support namespaces, including tutorials, templates, modules, data,
  categories, redirects, headings, links, and a full-text search index. One extra
  inventoried page became unavailable during capture and is explicitly recorded
  in `docs/WIKI_ARCHIVE_STATUS.json`. Binary media, user/talk pages and full edit
  histories are outside this source archive.
- **English August 2026 ZIM:** the complete 1,941,160,495-byte original file is
  saved at `/workspace/reference/minecraft-wiki/minecraft.wiki_en_all_2026-08.zim`.
  Its SHA-256 matches Kiwix's published value and its internal checksum passes.
  All **29,455 rendered HTML pages**, readable table text, redirects, and selected
  supporting text are preserved in a separate searchable SQLite database.
  Its compressed repository backup excludes binary media; the original ZIM
  retains those media. `ZIM_SOURCE.json` records its original download and hash;
  `docs/ZIM_ARCHIVE_STATUS.json` records the completed import and verification.

## Restore without wiki access

From the repository root, using only Python's standard library:

```sh
python tools/wiki_backup.py restore research/wiki-archive/2026-10-21/manifest.json /workspace/reference/minecraft-wiki/full-archive.sqlite
python tools/wiki_backup.py restore research/wiki-archive/2026-08-zim/manifest.json /workspace/reference/minecraft-wiki/zim-archive.sqlite
python tools/wiki_lookup.py --search '"snowy wolf"'
python tools/wiki_lookup.py --show Wolf --source zim --contains 'Spawning patterns'
python tools/wiki_archive.py --show Planks --section Crafting
```

The restore destination must not already exist; choose another path when testing
restoration. Each restore verifies the compressed parts, the complete database
hash, and SQLite integrity. `tools/wiki_lookup.py` opens databases read-only and
never fetches pages. The source-archive reader also supports `--show`, `--section`,
`--search`, and `--audit-only`. Full raw HTML/source remains stored, not just the
readable/searchable representation. The original ZIM and online wiki are not
required to read either restored SQLite database.

To inspect/import an original ZIM, install the pinned research-only dependencies:

```sh
python -m pip install --target /workspace/reference/zim-tools -r tools/requirements-research.txt
PYTHONPATH=/workspace/reference/zim-tools python tools/wiki_zim.py PATH_TO_ZIM --inspect --verify
```

Those dependencies are not used by the Minecraft add-on or by normal offline
SQLite lookup/restoration. Importing a ZIM never executes its scripts or loads
linked network resources. Binary metadata/path collisions are distinguished from
public article entries, and original source bytes are preserved before decoding.

## Verification and source notices

`docs/WIKI_OFFLINE_VERIFICATION.json` records tests against independently restored
backups with network calls forbidden, including actual wolf/biome/recipe/template
retrieval. Snapshot scope and gameplay knowledge completeness are separate issues.

Source: https://minecraft.wiki/ . Source rows preserve article titles, page IDs,
revision IDs/timestamps, capture timestamps and hashes. A fixed revision is
attributable at `https://minecraft.wiki/w/Special:PermanentLink/REVISION_ID`;
its page/history link provides original author attribution. ZIM metadata and its
verified whole-file hash identify the rendered snapshot separately.

Minecraft Wiki currently declares **CC BY-NC-SA 3.0 unless otherwise noted**:
https://creativecommons.org/licenses/by-nc-sa/3.0/ . Preserve source and any
article-specific notices. These third-party research archives are distinct from
the product's original explanations and are not included in the game product.
