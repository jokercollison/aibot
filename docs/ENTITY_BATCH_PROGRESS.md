# Entity batch — test release 0.2.8

The batch is packaged in 0.2.8; published 0.2.7 downloads remain unchanged. The user reported completing its
checks successfully apart from the unclear wolf/beef negative answer. That issue
is fixed in this batch and included in the 0.2.8 download.

## Connected work

- 142 knowledge subjects: the original 129 catalog entities plus 13 independently
  reviewed wiki references/composite roles. These references add knowledge, not
  native spawnable entity definitions.
- 641 curated topic summaries, 95 component-backed summaries, and 326 explicitly
  basic identity/behavior/safety summaries. These counts measure different levels
  of coverage and do not establish exhaustive knowledge.
- Every one of the 90 catalog mobs has a connected identity, behavior, spawning,
  health, drops, taming, breeding and combat topic. Basic passive/neutral/hostile
  classification is distinguished from detailed combat rules.
- Reviewed eligibility answers cover non-tameable and non-breedable species;
  splitting, construction, trust and ownership exceptions are kept separate.
  Eligibility is an explicit species review, not inferred from a missing component.
- Four Bedrock reference gaps now have basic connected topics: paintings, dropped
  items, falling blocks and elder guardian ghosts. Other additions cover Editor
  markers, Education balloons and seven jockey/captain subjects, with restrictions.
- The death-loot graph inventories all 128 pinned sample profiles, including 78
  profiles declaring loot tables. It preserves 91 linked death/interaction tables,
  152 pools, their conditions, functions and weighted alternatives.
- Contextual drops distinguish player/pet kills, killer species, burning, Looting,
  baby/adult, small/medium/large, sheared/woolly, saddled, captain/raid and mounted
  forms. Nested references and weighted alternatives are not flattened into a
  guaranteed combined list. Conditional answers remain qualified by form/state.
- Parsing retains the victim when a longer-named killer appears later. Short
  drop-condition follow-ups retain the previous victim and topic.
- Creature/food parsing distinguishes chickens and rabbits from their food items,
  and preserves the creature when incidental scenery contains a longer item name.
- Known incompatible foods get direct negative answers with the correct food,
  rather than an uncertainty phrase. The wolf/beef case applies generally to
  incompatible taming/breeding foods with an explicit allowed-item constraint.
- The user-tested cow food shorthand and incidental 200-years/plains wording are
  regression cases alongside the larger routing, edition and state checks.

## Evidence gaps retained

Two declared sample paths have no payload in the pinned checkout: fox.json and
piglin.json. Their curated/engine-mechanic answers remain separate; no empty table
is invented to mean no drops. The graph records the missing paths explicitly.

Fourteen has_mark_variant conditions belong to the preserved mooshroom-milking
interaction table. The death-loot question renderer does not interpret those
flower-to-stew state values. This is an interaction gap, not an omitted loot file.

The parched/creeper-disc source disagreement remains withheld from both specific
and general conditional answers. Raw evidence is retained without becoming advice.
Equipment, experience, dynamic held items, conditional table override ordering,
fishing luck and exact enchantment distributions are not all covered by the graph.
The fixed sample revision is not proof of every engine outcome in 1.26.52.

Detailed variants, precise biome/structure boundaries, environmental reactions,
and additional interaction sections still need review. Every subject stays
complete=false. The batch must not be called complete Minecraft entity knowledge.

## Validation and regeneration

`npm run check` and `npm test` pass 110 automated tests. A separate temporary
esbuild compilation checks bundling without overwriting the user's test download.
Actual Minecraft execution remains unavailable in the cloud; multiplayer remains
untested. Speaker colors and 500-health robot templates are retained.

Ordinary tests/builds compile committed evidence without contacting the wiki.
To refresh evidence from restored local references:

```sh
python tools/entity_behavior_evidence.py
python tools/entity_loot.py --refresh-samples /workspace/reference/bedrock-samples
python tools/entity_database.py
python tools/topics.py
```

The current global gameplay audit now uses the connected entity topics instead
of reporting only the older component-derived answers. Basic/partial statuses
remain distinct from complete topic interpretation.
