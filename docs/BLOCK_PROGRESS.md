# Block phase — development progress

This first batch is packaged as 0.2.18. Earlier downloads remain unchanged.

The first development batch adds separate mining and location facets for 15
terrain/resource subjects (30 authored topic summaries). Existing, more detailed
location facts take precedence. The subjects are stone, cobblestone, obsidian,
glass, sand, gravel, clay, ice, packed ice, blue ice, snow block, bookshelf,
ender chest, budding amethyst and ancient debris.

Readable editorial data: data/blocks/terrain.json. Each entry records the cached
wiki article revision, content hash and reviewed sections. Summaries are written
for Bedrock 1.26.52. Upcoming ice-cave/brittle-ice content is excluded. Source
articles remain outside the playable package. This is a first batch, not a claim
that block coverage is complete or game-tested.

The conversation engine routes named-block mining questions ahead of incidental
enchantment names, retains pronoun follow-ups, and declines unreviewed mining
questions rather than substituting a basic definition. Definitions and recipes
continue using the existing data paths.

Next work: reconcile every catalog block against an explicit topic inventory;
expand ore, wood, soil, plant and building families with specific exceptions;
then cover storage/workstations, redstone, fluids, growth and hazards. Keep
crafting ingredient-only and account for unavailable/internal identifiers.

Validation includes the public conversation path for all 30 topic entries,
Silk Touch/Fortune exceptions, follow-ups, recipe presentation and the existing
entity and ore-location regression suite. The focused release checklist covers these changed features.

## Next batch in development after 0.2.18

11 exact-match family rules cover 144 catalog block variants. They contain 53
shared topic summaries applied to 707 block/topic combinations; those applications
are not 707 independently researched facts. Topics include mining, acquisition,
fire, gravity, water and wood stripping where applicable. Source article revisions
and hashes remain in data/blocks/families.json. The member inventory is recorded
in BLOCK_FAMILY_AUDIT.json.

Coverage includes 16 colors each of concrete, powder, wool, stained glass and
stained panes; ordinary/tinted glass; Overworld logs and bark wood; Nether stems
and hyphae; and corresponding planks. Species/color-specific crafting still uses
the recipe index. Reviewed ingredient-only wool recipe fallbacks fill missing
color recipes without claiming missing sample files mean uncraftability.

Patterns intentionally exclude Education reinforced glass, wool/concrete shape
derivatives, bamboo blocks and crop/mushroom stems. Those require their own
review; family membership is not inferred from any substring match. Basic what/does
questions remain definitions even when block names contain fire or water.

Regression tests exercise all 707 family facet applications through the real
conversation engine, all 16 wool recipes, exception pairs and context follow-ups.
This development batch has not been packaged or tested in Minecraft. The published
0.2.18 downloads remain unchanged.

## Ground and ore batch in development

Adds 84 catalog variants across 26 exact-match families, with 109 authored shared
summaries applied to 341 block/topic combinations. Ores cover coal, iron, copper,
gold, diamond, emerald, lapis, redstone, Nether gold and Nether quartz, including
matching deepslate/lit forms. Mining separates minimum tool tiers, normal resource
drops, Silk Touch and Fortune. Existing more detailed location facts still win.

Other coverage includes deepslate building blocks, tuff building blocks, sandstone,
terracotta/glazed terracotta, dirt, coarse/rooted dirt, grass, podzol, mycelium, mud,
packed mud, mud bricks and red sand. Water-bottle conversion, red-sand recipe limits,
falling sand and hand-collectible packed mud retain explicit exceptions. Reinforced
and infested deepslate and shape derivatives are outside these patterns.

Data/evidence: data/blocks/ground.json. Reproduce both family inventories with
`python tools/block_family_audit.py`; ground membership appears in
BLOCK_GROUND_AUDIT.json. Counts describe shared applications, not independent
species discoveries or complete block coverage. Existing definition/recipe paths
are preserved. Drop questions now select the mining facet for blocks.

Validation: 221 automated tests pass, including every matching ground-family
facet through the conversation engine, representative natural questions, soil
followups, exceptions and the existing entity audit. Minecraft testing and a new
package remain pending; published 0.2.18 downloads are unchanged.

## Masonry, mineral storage and dimension-material batch in development

Adds 235 catalog variants across reviewed stone/mineral building families,
including ordinary/polished granite, diorite and andesite; stone/nether bricks;
blackstone, basalt, End stone, purpur, prismarine, quartz and amethyst; selected
masonry slabs/stairs/walls; copper building forms; storage blocks; soul sand/soil;
glowstone, sea lanterns and amethyst buds/clusters.

The exact member inventory in BLOCK_MASONRY_AUDIT.json records 1,145 facet
applications from 150 shared summaries. These are shared-rule applications, not
1,145 independent facts. Source revisions and hashes are in
 data/blocks/masonry.json. Shape rules exclude wood, copper functional components,
custom wool/concrete derivatives and unreviewed materials. Copper shapes have a
separate stone-pickaxe threshold; double slabs drop two matching slabs and cannot
be waterlogged. Storage block tool thresholds are separate from their ore rules.
Bedrock sea lantern drops are not increased by Fortune. Gilded blackstone,
glowstone, buds and clusters each retain their own drop rules. Copper oxidation,
waxing and scraping questions are connected without treating the adjectives
“waxed” and “oxidized” in a block name as the requested topic.

Also adds the requested uncertainty personality: unknown replies get a “Hmm, ”
opening while preserving their specific guidance and follow-up context. During
conversation, unknown-status answers use the existing original chirp at pitch
0.65 and volume 0.55; normal answers/clarifications retain pitch 1, volume 0.7.
This reuses the sound asset rather than adding a new recording. Known negative
answers are not treated as missing knowledge. Partial answers retain their own
status. No shared/world sound broadcast is added. Audible feel requires actual
Minecraft testing; no console/phone sound test is claimed.

Validation: TypeScript and all 230 automated tests pass, including all 1,145
masonry facet applications and simulated private-form sound selection/restoration.
The entity question audit remains green. This batch is saved in development;
0.2.18 downloads are unchanged. Packaging a new isolated release remains separate.

## Packaging update

The three subsequent development batches above are now packaged in isolated
release 0.2.19. Historical statements about development-only status describe their
original preparation; 0.2.18 and earlier downloads remain unchanged. See the
0.2.19 release notes and focused checklist. Actual Minecraft testing is pending.

## Plant and farming batch after 0.2.19 (development only)

Adds 134 catalog block variants across crops, saplings, leaves, conventional
flowers, coral forms, aquatic plants, fungi, moss, roots and fruit-producing plants.
264 shared topic summaries have 405 catalog/topic applications. The exact member
inventory is BLOCK_PLANT_AUDIT.json; data and revision/hash evidence are in
 data/blocks/plants.json. Regenerate inventories with tools/block_family_audit.py.
These counts describe scoped summaries, not complete botanical wiki coverage.

New growth questions support planting, bone meal, hydration, maturity and crop
followups. Location questions take precedence when a player asks where a plant
grows. Names such as fire coral and chorus plant do not accidentally turn a
harvesting question into a fire or growth question. Sugar cane and glow berries
reach their block mechanics despite item/block identifier differences; small
dripleaf and lily pad have natural-name aliases.

Exceptions include 2-by-2 dark/pale oak saplings, giant spruce/jungle forms,
mangrove propagule maturity, leaf collection versus sapling drops, farmland
hydration, Nether wart on soul sand and no bone meal, Bedrock sugar-cane bone
meal, nonaccelerated cactus, cocoa Fortune limits, aquatic shears, ordinary vine
shears, Nether vine harvesting direction, coral Silk Touch and dead coral, moss
spreading, hanging-root Silk Touch, pale moss bone meal, dripleaf conversion,
Nether fungi on matching nylium, and mushroom/fruit harvesting. Source articles
with disambiguation titles are replaced by actual species pages and dependencies.
Future/other unreviewed plants are not silently folded into broad flower rules.

Validation: TypeScript and 236 automated tests pass. Every 405 plant facet
application is exercised through the public conversation engine, alongside
natural phrasing, context and exception tests. Existing 5,780 entity requests
remain green. Temporary readable bundle: 6,322,270 bytes, maximum line 1,607
characters. No new release or Minecraft pass is claimed. Published 0.2.19 and
all earlier downloads remain unchanged.
