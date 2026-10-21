# Version 57

- Added deterministic intent router for recipes, mobs, brewing, enchantments, biomes, blocks, item sources, and banter handoff.
- Added exact and category-prefixed aliases, cross-category fallback, ambiguous answer handling, source IDs, and no-guess safeguards.
- Added human-readable crafting grid formatter and source-qualified mob component evidence (not assumed gameplay truth).
- Audited per-category source provenance and in-game verification flags.
- Ran automated Node tests.
- Preserved all files from Version 56.

Note: Node test harness is for development; game runtime integration still requires Bedrock-specific packaging.
