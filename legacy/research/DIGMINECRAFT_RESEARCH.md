# DigMinecraft — research and database intake
Date: 2026-10-20
Source: https://www.digminecraft.com/index.php

## Access and coverage
Direct homepage fetch returned HTTP 403; indexed search results exposed its category list and several section and individual pages. This is NOT a full crawl and does not imply every linked article was read. Verified URLs and exact statuses are in DIGMINECRAFT_COVERAGE.csv.

## Topic map discovered on homepage
Getting started; commands/cheats; command generators; brewing; fireworks; command blocks; basic recipes; mobs; materials; armor; decoration; dyes; block recipes; food; mechanisms/redstone; tools; transportation; weapons; status effects; enchantments; version history; seeds; ID/name lists; data tags; spawn eggs. Follow nested articles as they become accessible.

## Data ingestion policy
- Only Bedrock-relevant facts go into the robot's player-facing knowledge database. Keep Java-only syntax and legacy Pocket/Windows 10 examples out of executable answers.
- Cross-check commands against Microsoft Bedrock command reference and current Bedrock client. Some DigMinecraft pages include obsolete commands and edition-specific examples.
- Cross-check recipes and IDs against supplied Bedrock Samples v1.26.50.4; the sample files are the primary local source for current recipe structure.
- Record source URL, edition, last verified version, verification status, aliases, question patterns, and concise independently authored answer per fact.
- Do not bulk-copy website text or images. Preserve facts in original summaries and links for attribution; site content may be copyrighted.
- Distinguish user instructions (e.g. brewing sequence) from implementation data (recipe JSON, IDs).

## Priority for import
1. Bedrock commands with arguments and practical examples, including permissions/cheats requirements.
2. Brewing potion base, ingredient, modifier, duration and effect variants.
3. Recipes from vanilla samples plus user-facing explanatory answers.
4. Mobs, biome/structure locations, drops, weaknesses and survival tips.
5. Enchantments, effects, redstone, ID aliases, common gameplay questions.

## Observed compatibility risks
- The /recipe command example at DigMinecraft is specifically Java Edition. Do not teach it as a Bedrock command without confirmation.
- The effect command page explicitly separates Java and older PE/Windows 10 syntax.
- DigMinecraft ID lists include Java and legacy Bedrock platform pages; their numeric IDs can be obsolete.
- DigMinecraft is a research aid, not an authoritative source for current script API version numbers.

## Next stage
Build a crawler/source intake checklist for linked articles where accessible; enrich knowledge records in batches and validate each record. Current work is indexing and triage, not exhaustive article extraction.
