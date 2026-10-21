# Test release 0.2.8 — larger entity knowledge batch

Packages the entity work since 0.2.7: 641 curated topic summaries across 142 knowledge
subjects, 95 component-backed summaries, basic behavior coverage, and conditional
loot interpretation. Every catalog mob has connected core topics, but those topic
summaries do not establish exhaustive knowledge of its mechanics.

The loot graph covers 78 profiles declaring death tables and preserves 91 linked
tables. Answers retain kill conditions, Looting, burning, age, form and weighted
alternatives. Equipment and special engine drops remain separate. Known source
conflicts and missing payloads are explicit in ENTITY_LOOT_COVERAGE.json.

Adds 13 reviewed wiki reference subjects, including dropped items, falling blocks,
elder guardian ghosts and jockeys. Restricted Editor/Education content is identified;
these knowledge references do not add native entities to the world.

Known incompatible taming/breeding items now get a direct No with the correct
alternative. In particular, beef does not tame wolves; use bones. Parsing retains
the creature when food or scenery has a longer name, and retains the victim when
a longer-named killer appears in a drop question. Short conditional follow-ups work.

The user reported 0.2.7 testing complete except that unclear wolf/beef response.
The new checklist focuses on changed behavior. Speaker colors, conversation UI,
Things to try, artwork and 500-health robots are retained. Automatic bottom
scrolling is unchanged; multiplayer and 0.2.8 actual-game behavior remain untested.

All pack/module UUIDs are fresh. Names/descriptions show 0.2.8; identifiers/assets
are version-specific. The .mcaddon has ordinary pack folders directly at root.
Validation: npm run validate passes API checking, 110 automated tests and the
build/archive checks; distributed artifacts are verified against the build.

Next: continue entities in bulk, focusing on detailed variants and their habitats,
then remaining special interactions/environmental rules. Blocks and items follow
after the entity work; no personality expansion is part of this release.
