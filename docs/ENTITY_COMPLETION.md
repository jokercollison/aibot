# Entity phase closeout — 0.2.17

The agreed **normal Bedrock 1.26.52 entity pass is complete**. Blocks are the next
knowledge phase. Entity bugs and additional facts can be added later without
keeping this phase open indefinitely. This is not a claim of every wiki detail,
every possible question wording, a finished product, or actual Minecraft testing.

## What completion means

`data/entities/completion_scope.json` defines a finite required topic list for
all 90 catalog mob profiles, a species-specific special-mechanic checklist, and
reviewed mechanic lists for all 39 non-mob catalog entities. Alternate catalog
IDs are profiles, not additional species. Thirteen extra wiki reference subjects
remain available but are not substituted for the 129-entity catalog denominator.

`docs/ENTITY_COMPLETION_REPORT.json` records all required slots, exclusions,
limits and blockers. There are **zero unresolved in-scope topic slots**. Full-wiki
completeness remains false in the wider research audits; their broader unused
categories are not silently relabeled complete.

The 31 normal mob topics include identity, location/spawning, health, food,
breeding, taming, growth eligibility, drops, XP, variants, interactions, combat,
persistence, relocation, leads, buckets, riding, trading, milk, naming, healing,
and reviewed enchantment/potion interactions. A source-backed negative answer is
a valid result; an unsupported question still gets an honest unknown answer.

## The final broad batch

- All 51 remaining feeding profiles now have useful explanations. Most have no
  food-based breeding/taming, rather than missing lists of food. Repair, curing,
  self-drinking, item pickup, age-locking and animal feeding stay distinct.
  Answers describe normal game mechanics, not fictional or real-world diets.
- Normal lead, bucket, riding, trading, milk and naming capabilities are explicit
  across all 90 mobs. Exhaustive wiki capability lists and pinned components are
  reconciled; missing components alone are not used to invent a negative rule.
- Smite, Bane of Arthropods, Impaling, Poison, Regeneration, Instant Health and
  Instant Damage use shared reviewed Bedrock rules applied per mob. Undead
  reversal, spider/nautilus immunity, witch resistance, dragon source restrictions
  and heart-linked creaking protection retain exceptions.
- Normal healing questions use applicable existing food/repair guidance or the
  reviewed effect interaction, not a made-up feeding ability.
- 22 additional species-specific summaries cover chicken eggs, bee housing,
  enderman blocks, elder-guardian Mining Fatigue, rabbit/vindicator names,
  silverfish infestation, llama caravans/breeding conditions, villager infection
  and verified curing limits.
- Trade inventories cover **13 villager professions at five levels**, plus one
  rotating wandering-trader inventory: **66 summaries**. They list possible
  selected offers, not guaranteed stock or fixed prices. Nested choices and old
  item IDs are interpreted; raw tables stay out of runtime. Cached output is
  verified so building does not require the external reference checkout.
- Conversation handling retains effect/level follow-ups, supports useful plural
  names, distinguishes naming a rabbit from its meat item, and separates milking
  from capturing a mob with a bucket.

There are **2,241 reviewed topic summaries** in the compiled
database. Shared capability/effect applications and component-derived trade
inventories are counted separately, not advertised as thousands of independent
wiki discoveries. See ENTITY_KNOWLEDGE_COVERAGE.json for exact categories.

## Explicit non-blocking exceptions

Two command-created undead baby growth timers are excluded: normal skeleton
trap horses are adults, and neither horse has a normal breeding cycle. Both
answers explain the limit rather than inventing a timer.

Eight narrow evidence limits remain listed in the completion report: axolotl XP,
llama breeding XP, piglin equipment XP, wither-rose suitability for bees, the
creeper/parched music-disc condition, absent fox and piglin/brute loot tables,
and universal happy-ghast persistence wording. General gameplay guidance is
present. Conflicting exact values or conditions are withheld, not guessed.
The 14 previously reported unparsed loot mark-variant conditions belong to
mooshroom milking; reviewed flower/stew rules handle that player interaction.

Full creator/Education command workflows, unused or command-created oddities,
future-version content, exact villager price simulation and every obscure AI
timer do not block this normal-gameplay phase. Existing availability restrictions
for technical entities remain. Full player progression and detailed block/item
knowledge belong to later phases.

## What was checked

The real conversation engine handles **5,780 representative requests**: all 90
mobs in explicit-ID and natural-name forms across 31 topics; 112 reviewed non-mob
mechanics; 22 final special-mechanic questions; and 66 trade inventory questions.
Results: **5,776 routed answers, four explicitly partial results** (the two
excluded timers in two forms), **zero unexpected routing failures** and no empty
normal-topic slots. A routed answer is not a promise of every exact value: the
narrow source limits above remain explicit.

209 automated tests additionally check specific facts, positive/negative
capabilities, effect exceptions, conversations, every trade tier, scope
reconciliation and offline cached trade builds. `npm run validate` passes API,
readable-script and archive checks. These checks do not execute Minecraft or
independently establish every fact. Actual-game, multiplayer and device
performance testing remain separate. Use only the short 0.2.17 changed-feature
checklist rather than repeating every old checklist.
