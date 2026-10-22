# Latest source batch: experience and equipment rewards after 0.2.10

Connected 183 reviewed reward summaries across 90 catalog mobs. Total reviewed
entity topic summaries: 1,446. All 149 automated tests pass. See ENTITY_REWARDS.md
and ENTITY_REWARD_COVERAGE.json for limits and conflicts. Downloadable 0.2.10 is
unchanged and still awaiting user testing; this source work is not packaged yet.

# Latest source batch: special entity interactions after 0.2.9

Connected 103 reviewed interaction summaries across 56 subjects. Total reviewed
entity topic summaries: 1,263. All 142 automated tests pass. See
ENTITY_SPECIAL_INTERACTIONS.md and ENTITY_INTERACTION_COVERAGE.json for coverage
and remaining gaps. Downloadable 0.2.9 remains unchanged; this source is not yet
packaged. No entity is marked complete.

# Spawning/location source batch after 0.2.9

90 catalog mobs now have spawning-troubleshooting summaries, and 48 location
answers were expanded. All 60 pinned spawn-rule files are preserved as developer
evidence. 1,170 reviewed topic summaries are connected overall; 134 automated
tests pass. See ENTITY_SPAWNING.md for evidence limits and remaining work.
Published 0.2.9 downloads remain unchanged; this source batch is not packaged yet.

# Further entity review after 0.2.8

Added 67 form/state summaries, bringing all 90 catalog mobs to a sourced answer
for variant questions. These distinguish ages, equipment, encounter roles and
changing behavior from separate species or named coats. A summary is not a claim
that all variant mechanics are covered.

Additional reviewed topics cover slime/magma-cube drowning, Creative-only shulker
dyeing in Bedrock, baby squid growth, and the limited lifetime of evoker-summoned
vexes versus command/spawn-egg vexes. Plural subject matching now recognizes
“vexes” and “foxes”. The compiled database has 1,080 reviewed topic summaries.

126 automated tests pass. Published 0.2.8 archives remain unchanged. Next gaps:
precise spawn conditions, further special interactions, and unresolved conditional
loot evidence. No entity is marked complete.

# Entity expansion after 0.2.8 — source development

This work is saved separately from the published 0.2.8 test build. No new game
archive has been published from this source yet.

- 178 named variant records, with 520 variant-specific topic summaries: frog
  colors, axolotls, foxes, climate farm animals, cat coats, rabbit colors, horse
  coats and markings, llama coats, pandas, professions and other named forms.
- Variant follow-ups retain context, including short questions such as “what
  about the blue one?” and “does it need water?”
- 1,008 reviewed topic summaries, 216 component-backed summaries and 326 basic
  summaries across 142 knowledge subjects. These are coverage counts, not a claim
  that every mechanic has been completed.
- Fire, daylight, water, air, powder snow, conversions, equipment protection,
  shearing, milking, brushing, repair, hatching and growth have separate topics.
- Brown-mooshroom flower answers include 17 reviewed flower/effect rules with
  Bedrock durations. Baby growth controls exclude villagers explicitly.
- Edition and state exceptions are preserved: dolphin air requirements, magma
  cube fire immunity, frog growth biomes, and 2,700 natural Bedrock tropical-fish
  combinations. Future Freezing-effect rules are excluded.
- Tests exercise every named variant through the question engine, plus follow-up
  context, environmental exceptions and interactions. 122 automated tests pass.

Remaining work is still entity-only: unreviewed topic/variant gaps, exact spawning
boundaries, additional special interactions, and unresolved conditional loot
sources. All subjects remain marked complete=false. Minecraft and multiplayer
execution are separate from automated source validation.

## Published 0.2.8 record

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
