# Bedrock Samples and DigMinecraft cross-reference — October 20, 2026

## Confirmed extraction

Parsed **1892 recipe definitions** from the user's Mojang Bedrock Samples v1.26.50.4 archive. Categories: shaped: 1064, shapeless: 591, furnace: 152, brewing_mix: 70, smithing_transform: 12, brewing_container: 2, smithing_trim: 1. Parse errors: 0.

All full recipe objects are saved in `database/vanilla/recipes_1_26_50.json`, preserving shaped grids, shapeless ingredients, furnace inputs, brewing reagents, smithing templates, result counts, and original source paths. These are vanilla *recipe definitions*, not necessarily one per distinct craftable item; variants and unlock conditions exist. They have **not** been tested in-game. A recipe search/index and natural-language answers remain to be implemented.

## Commands

Saved 78 command names from Microsoft's Bedrock command index in `database/vanilla/bedrock_commands_index.json`. This is **not** a complete syntax database. Each command needs its argument grammar, permission level, cheats requirement, examples, and supported version reviewed individually. Microsoft pages can be old even when indexed as current; cross-check the target version.

Sources:
- https://learn.microsoft.com/en-us/minecraft/creator/commands/commands?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/reference/content/commandsreference/examples/commandlist?view=minecraft-bedrock-stable
- https://www.digminecraft.com/index.php

## Division of labor

- **Bedrock Samples**: authoritative raw vanilla recipe definitions, block/entity JSON, assets and identifiers.
- **Microsoft Learn**: official command syntax, permissions, Bedrock-specific rules and scripting APIs.
- **DigMinecraft**: human-readable how-to steps, brewing explanations, fireworks, survival tutorials, tips, and gaps not represented in samples. Independently verify Java vs Bedrock differences and update dates.

## Outstanding

DigMinecraft has not been exhaustively crawled. Command syntax is not fully ingested. Recipes may include game-internal variations; don't claim the bot can answer all recipes until query and explanation layers exist. Do not redistribute DigMinecraft articles verbatim.
