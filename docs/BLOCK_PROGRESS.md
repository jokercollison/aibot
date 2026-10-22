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
