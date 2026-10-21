# DigMinecraft deeper review — 2026-10-20

Scope: indexed DigMinecraft pages for brewing and commands; no claim of exhaustive site crawl. Six original, source-attributed database entries added to `database/knowledge.json` (five individual pages plus brewing overview). The database previously had one starter piston entry.

## Findings
- Brewing index enumerates normal, splash and lingering potion variants and modern effects (Infestation, Oozing, Weaving, Wind Charging). The index is a *discovery source*, not proof all recipes are current in Bedrock 1.26.50.
- Strength: water bottle → nether wart → Awkward Potion → blaze powder → Strength. Source: https://www.digminecraft.com/brewing_recipes/make_potion_strength.php
- Poison duration differs by edition. Extended Poison is listed at 2:00 in Bedrock vs 1:30 Java. Source: https://www.digminecraft.com/brewing_recipes/make_potion_poison_extended.php
- Poison II: glowstone dust modifies regular Poison. Source: https://www.digminecraft.com/brewing_recipes/make_potion_poison_extended2.php
- `/help` and `/list` can work without cheats; command availability and permissions still require game testing. Sources: https://www.digminecraft.com/game_commands/help_command.php and https://www.digminecraft.com/game_commands/list_command.php
- Some pages retain legacy Pocket Edition / Windows 10 labels, outdated item commands and Java-only arguments. Do not import their command syntax without checking current Bedrock documentation.

## Intake standard
Each knowledge entry stores an original short answer, source URL, Bedrock edition tag, question example, and explicit verification status. Do not copy copyrighted article text or graphics. More coverage needed for enchantments, mobs, effects, commands, all brewing variants, and crafting recipes.
