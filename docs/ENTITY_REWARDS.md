# Entity experience and equipment reward batch after 0.2.10

This source batch connects 183 reviewed reward summaries across all 90 catalog
mobs: death experience, selected baby and breeding rewards, and equipment-specific
drops. The total entity database now has 1,446 reviewed topic summaries. A topic
summary is not proof of exhaustive mechanics; all completeness flags stay false.
The downloadable version remains 0.2.10, awaiting user testing.

## Behavior

Experience questions take precedence over ordinary item-drop routing. Amounts
refer to experience points, not player levels. Death, breeding and trading are
separate events; an unused on_bred component does not make a warden breedable.

Baby-animal zero rewards are separated from baby zombies, baby piglins and
hoglins. Bedrock evoker and Wither rewards do not require the usual player kill.
The first dragon reward differs from a resummoned dragon. Cube sizes have
per-cube rewards, not an invented combined total for all future split offspring.
Tamed wolves killed by their own owner retain the Bedrock exception.

Equipment answers distinguish naturally spawned gear, picked-up items and carried
storage. Certain reviewed Bedrock equipment/consumable chances use 25% before
Looting and 28% at Looting III, with the appropriate possession and kill conditions.
They do not become generic chances for all equipment. A vex’s natural sword never
drops; Looting does not change that. Trader consumables require the held state.

Reward questions preserve the subject when a longer killer name occurs later.
Basic identity questions still work for experience bottles. Reviewed article
names also supply missing catalog aliases, including evoker/evocation illager.

## Explicit evidence conflicts

- Axolotl death experience: archived wiki says one; pinned adult component says
  random one to three. Exact number withheld in player guidance.
- Llama breeding experience: archived wiki says one to eight; pinned component
  says one to seven. Exact number withheld.
- Piglin equipment bonus to experience: wiki says armor does not affect it, while
  the pinned component includes equipment_count. Only base amounts are stated.

Raw wiki articles remain in the offline development archive. The new summaries
retain revision IDs and hashes; neither raw articles nor sample expressions are
executed by the answer engine. No arbitrary Molang expression evaluator was added.
See ENTITY_REWARD_COVERAGE.json for the batch inventory and conflicts.

Other pending entity work includes deeper equipment conditions, exact extra XP
bonuses, dynamic carried items, source conflicts and remaining special mechanics.
Missing pinned fox/piglin loot files remain explicitly recorded in the loot audit.
This batch does not pretend those payloads were recovered.

Validation: API type checking, 149 automated tests and temporary bundle checking.
Tests cover all 90 death-XP routes, baby/breeding exceptions, bosses, equipment,
pronoun context and withheld conflicting numbers. Actual Minecraft execution is
unavailable in the cloud, and multiplayer remains untested. Published 0.2.10 files
are unchanged. A new test release requires a separate version and fresh identities.
