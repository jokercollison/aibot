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
