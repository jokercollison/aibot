# Test release 0.2.6 — entity knowledge first pass

Preserves the entity database work as a separately installable test release.
Question routing separates entity identity from gameplay topic, so incidental
wording does not hide a creeper-drop question. Topic summaries cover spawning,
loot, breeding, taming, health, transport and selected interactions. Named wolf
variants and short color-ambiguity clarifications retain conversation context.

- 494 topic summaries across 127 of 129 catalog entity IDs. All 129 have source
  evidence mappings; none is marked exhaustively complete. See
  [the entity database notes](ENTITY_DATABASE.md) and the per-topic coverage JSON.
- Preserved source revisions and sample evidence remain development inputs;
  only compiled curated topic answers enter the game bundle.
- Complete entity knowledge is still pending, including wiki-only candidates,
  availability differences, source conflicts and unimplemented topic details.
- This release does not fix bedrock-block question routing or native form scroll
  position. Blocks/items expansion and further conversation features follow the
  entity work. Existing artwork, Things to try and conversation UI are retained.
- New header/module UUIDs and version-specific IDs/assets; both pack names and
  descriptions include 0.2.6. The add-on contains ordinary pack folders at root.
- The new checklist contains installation and changed entity checks; historical
  checks remain available in their original versioned files.

Validation: API type checking, 79 automated tests and build validation are required
before distribution. Actual Minecraft execution is unavailable in this cloud;
0.2.6 still needs in-game testing and multiplayer remains untested.
