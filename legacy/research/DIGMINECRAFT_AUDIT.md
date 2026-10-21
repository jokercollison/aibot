# DigMinecraft coverage and extraction audit — 2026-10-20

**Coverage status: INCOMPLETE.** The homepage returned HTTP 403 to direct retrieval. Search-indexed pages were accessible, but this does not permit an exhaustive crawl or proof that every article was examined. Do not claim the full website is in the robot database.

## Verified local resources
- 1,892 vanilla recipe definitions from official Bedrock Samples 1.26.50.4, already in `database/vanilla/recipes_1_26_50.json`. This is source data, not yet a player-readable recipe index.
- 78-command official Bedrock index in `database/vanilla/bedrock_commands_index.json`. Individual syntax and examples remain incomplete.
- DigMinecraft brewing index identified, including regular, splash, lingering and recent potion types. Potion variants require Bedrock-specific validation.
- 14 source URLs indexed in `DIGMINECRAFT_SOURCE_REGISTER.csv` during this pass; this is not a site-wide index.

## Required remaining coverage
- Every command page: command purpose, Bedrock 1.26.50 syntax, permissions, selector support, examples and edition differences.
- All potion recipes: ingredient chains, modifiers, duration, potency, splash/lingering conversions, Bedrock restrictions.
- Crafting: convert each official JSON into item names, grid diagrams and natural-language instructions; use DigMinecraft to supplement explanations and non-craftable items.
- Armor, tools, weapons, decorations, fireworks, food, transport, mechanisms, dyes, banners, smithing, redstone.
- Mobs, effects, enchantments, biomes, structures, villages, trading, farming, IDs and beginner tutorials.
- Commands and data tags shown as Java-only must never be silently imported as Bedrock.

## Intake rules
Write concise original explanations and structured facts, not copied article text, images, or full-page mirrors. Every entry needs provenance, edition, tested version and verification status. When a site is blocked, use official game data and authoritative documentation rather than assuming coverage.
