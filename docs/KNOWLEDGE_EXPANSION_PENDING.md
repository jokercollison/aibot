Version 0.2.4 is now published for testing; unreleased references below are historical. Full knowledge expansion is still incomplete.

## New source work after 0.2.3

Live article/API access is now working (the earlier blocked status below is historical). WIKI_DATABASE.md describes the catalog-driven local cache and separately reviewed runtime facts. Current source is unreleased 0.2.4; the 0.2.3 download remains unchanged.

# Knowledge expansion included in 0.2.3; remaining gaps

The user requires broad Minecraft gameplay knowledge for each block, item and
entity, not a collection of example questions or basic names. They should not be
responsible for finding every missing entry. Version 0.2.3 is now published with new UUIDs after the user completed 0.2.2 testing. The larger knowledge expansion remains incomplete.

## Exhaustive source inventory and recipe audit

`docs/CRAFTING_COVERAGE.json` reconciles the pinned samples' complete metadata:

- 1,463 official blocks, 1,623 official items, 129 official entities: none missing
  from the local catalog. The extra seven item records are legacy aliases.
- All 1,892 source recipe files are represented: 1,064 shaped, 591 shapeless,
  152 furnace, 70 brewing-mix, 2 brewing-container, 12 smithing-transform and
  1 input-dependent smithing-trim operation.
- 1,051 normalized output subjects. This is NOT the number of all craftable
  game variants: sample coverage, legacy serialization variants and engine-driven
  operations still require review.
- 1,717 local block/item records match a normalized sample output; 222 have loot
  evidence but no matched recipe; 1,154 have neither a matched sample recipe nor
  this integrated loot evidence. Absence is never labeled proof of uncraftability.
- Entities are separately classified, not falsely expected to have ordinary
  inventory recipes. Construction/summoning, spawning, drops and breeding are
  independent topics.

Recipe loader fixes recover list outputs (cake, beehive, honey blocks, etc.),
string outputs (netherite upgrades), metadata-encoded colors/boat variants, and
brewing transformations. Byproducts are preserved separately, not treated as a
recipe's main product. Conditional sources are retained. Wooden-plank alternatives
are collapsed ONLY when a real generic-planks recipe for the same output matches
the concrete variant's quantities and other ingredients. Wood-specific boat
recipes still say the required species.

## Conversation correction

Ambiguity choices persist within that player/robot conversation. After 'What is
a slime?', 'a mob' selects its entity explanation and establishes the subject for
another follow-up. Other conversations cannot access this pending choice.

## Connected topics and remaining source limits

Component-derived data now connects health for 89 entity IDs, breeding for 26 and
taming for 5, with form/state conditions preserved. A maximum/base health value
is not assumed to describe every state simultaneously. Loot evidence covers
425 item IDs and 65 mob drop profiles, with possible-versus-guaranteed caveats.
Initial modern Overworld diamond/coal location guidance is connected, including
follow-ups. Those location summaries remain explicitly provisional for the target
version; inherited diamond guidance and general knowledge are not represented as
freshly verified wiki evidence.

`docs/GAMEPLAY_COVERAGE.json` tracks the full topic schema for every one of the
3,222 catalog records: identity/use, location/biome/depth/acquisition, mining and
properties, health/attack/drops/diet/taming/breeding and other relevant categories.
No subject is currently claimed complete. Missing topics need either a sourced
answer or an explicit sourced not-applicable result. A generic family description
does not satisfy every topic.

Live https://minecraft.wiki access returned a cloud-proxy CONNECT 403. The current
network allowlist lacks that hostname. The additive minecraft.wiki requirement
was saved in the environment configuration draft; saving the draft does not apply
runtime access. Review/save/publish environment settings and recheck access before
claiming live wiki verification. Never bypass the proxy or claim a full wiki was
imported. Existing inherited wiki research is inventoried with hashes in the audit;
it is not a complete wiki and some entries are drafts.

Next work is source-backed topic completion and factual review across the catalog,
not another claim of 'complete Minecraft knowledge'. Continue integrating existing
conditional evidence while live wiki verification is unavailable. Do not overwrite
approved dialogue or release a new test download until the user's current testing
round is finished, unless explicitly requested.
