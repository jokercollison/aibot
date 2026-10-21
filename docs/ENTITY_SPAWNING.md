# Entity spawning and location batch after 0.2.9

This source batch is not yet in a downloadable test release. Published 0.2.9
archives remain unchanged.

## Connected coverage

- 90 catalog mobs have sourced spawning-troubleshooting summaries. These cover
  natural spawning, structures, breeding, construction or trigger/conversion
  routes as appropriate, rather than assigning every mob a dark-floor rule.
- 48 location answers were expanded alongside the 90 troubleshooting answers.
  Existing location answers remain connected for the other subjects.
- 60 pinned sample spawn-rule files are preserved as developer evidence with
  source hashes and original condition branches. Weights, filters and alternatives
  are retained without flattening them into a universal set of requirements.
- The compiled database now has 1,170 reviewed topic summaries. Counts describe
  summaries, not exhaustive mechanics or an overall percentage complete.

Question recognition distinguishes “Where can I find it?” from “Why won’t it
spawn?” and retains the creature when the question mentions a longer block name.
Pronoun follow-ups preserve the previous subject; named-variant restrictions
remain attached to troubleshooting, such as blue axolotls not spawning naturally.

Bedrock-specific examples include village golem beds/work requirements, fixed
guardian columns, surface-only bogged, underground glow-squid height/light,
surface-water fish checks and daytime phantom possibilities. Future ice-cave and
Frostbite rules from newer wiki sections are not imported into this target.

## Evidence limits

These answers are checklists, not a spawn simulator. They do not inspect the
player’s world, biome, light, mob caps, simulation distance or obstruction blocks.
The evidence files are not proof of every engine outcome in Bedrock 1.26.52.
Missing sample files never mean that a mob cannot spawn: structure generation,
engine rules, conversion and construction can be represented elsewhere.

The creeper sample brightness filter permits 0–7 while the archived wiki gives
0. Its numeric natural light threshold remains withheld from player guidance;
the answer recommends darkness without claiming a disputed exact threshold.
Other engine-specific details still require reconciliation. Exact farm layouts,
all capacity/distance checks and every special trigger are not complete.

Raw sample evidence is development-only and is not imported by runtime code.
Raw wiki articles remain in the offline SQLite archive. Answer source pointers
refer to preserved revisions. All completeness flags remain false.

## Validation and regeneration

`npm run check` and `npm test` pass, including 134 tests. Tests cover all 90
catalog mob routes plus moon, height, edition, structure, trigger, variant,
pronoun and subject-selection cases. Minecraft execution is unavailable in the
cloud, and multiplayer remains untested.

Ordinary compilation uses committed facts without network access. Refresh the
sample inventory explicitly with:

```
python tools/entity_spawning.py --refresh-samples /path/to/bedrock-samples
```

Then run `npm test`. The machine-readable audit is ENTITY_SPAWNING_COVERAGE.json.
Next entity work remains special interactions and unresolved conditional loot;
spawning summaries should not be presented as full entity completion.
