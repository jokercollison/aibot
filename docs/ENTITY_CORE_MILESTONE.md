# Historical 0.2.16 baseline

This earlier milestone is superseded by the [0.2.17 entity closeout](ENTITY_COMPLETION.md).
The feeding gaps and capability coverage described below record the 0.2.16 state,
not the current completion report. Its published download remains unchanged.

# Entity core baseline — test release 0.2.16

This release closes the broad core pass so entity work does not continue as an
indefinite series of tiny releases. The next planned knowledge category is blocks.
This is a practical baseline with known limits, not exhaustive wiki coverage.

## What changed

289 new core answers across 87 mob profiles: 117 combat summaries (attack,
provocation and counterplay for the remaining 39 profiles), 60 persistence
summaries, 63 relocation summaries and 49 growth-eligibility summaries. Of these,
287 are reviewed summaries and two are explicitly partial command-created undead
foal growth cases. The database total is now 2,168 reviewed summaries across
142 knowledge subjects. Profile counts include alternate catalog IDs and are
not counts of distinct biological species.

41 existing generic negative breeding replies now use direct language such as
“You cannot breed a creeper.” Construction/summoning exceptions remain attached.
Allay duplication, shulker duplication and sulfur-cube splitting are preserved.

## Current mob core coverage

| Topic | Reviewed mob profiles | Explicit limits |
| --- | ---: | --- |
| Spawning and spawning conditions | 90/90 | Summaries are not exhaustive spawn simulation |
| Breeding, taming, variants and XP | 90/90 each | Includes verified negative eligibility |
| Attack style, provocation, counterplay | 90/90 each | Passive creatures do not gain imaginary attacks |
| Ordinary persistence / despawning | 90/90 | Timers, origin, difficulty and special encounter states still matter |
| Practical relocation | 90/90 | Leads, minecarts and unsupported boss transport stay distinct |
| Growth eligibility | 88/90 reviewed; 2 partial | No invented command-created undead foal timer |
| Feeding guidance | 39/90 | 51 remain unsupported; no blanket no-food claim inferred from missing components |

Health answers retain their existing scoped values and exceptions. All 39
non-mob catalog entities already have 112 reviewed vehicle, projectile or
technical mechanics; these are included in the question audit too.

## Evidence and limits

Authoring data is vertical JSON in `data/entities/core_editorial.json`, with
revision URLs/hashes and pinned source file hashes. Central Baby, Mob spawning,
Minecart and Lead references are reconciled with each mob's article and sample.
Direct sample inspection uses actual files rather than assuming omitted evidence
fields mean the original component was absent.

Baby inventory distinguishes normal babies, undead babies that never mature,
size variants and tadpoles. The two command-created horse cases do not import
edition-specific growth history as a Bedrock timer. The happy-ghast wiki
always-persistent list and pinned despawn component differ; its answer gives
verified player-interaction persistence rather than an origin-independent claim.

Persistence answers distinguish ordinary distance removal from death, drifting,
oxidation/statues, Peaceful changes and encounter cleanup. Existing wandering
trader, skeleton trap, endermite, vex and warden exceptions are retained. A boat
or cart alone is never offered as a blanket Bedrock persistence guarantee.

Relocation follows explicit lead eligibility and minecart exclusions. A ghast
can enter a minecart, while wardens, withers, dragons and creakings cannot be
handled as ordinary minecart passengers. Mount/rider aggression is separate.
Names and interactions that grant persistence do not make hostile passengers safe.

Feeding gaps remain honest unknowns, not manufactured negative facts. Three
reward-source conflicts, unavailable fox/piglin loot tables, the withheld
creeper/parched music-disc case and other narrow topic gaps remain in their
existing evidence reports. The baseline does not promise every wiki detail or
every possible wording. Targeted bugs can be fixed while block work proceeds.

## Verification

`tools/entity_question_audit.mjs` runs the actual conversation engine against
16 core topics for all 90 mobs, using explicit IDs and natural names with a mob
hint (2,880 requests), plus all 112 reviewed non-mob mechanics: 2,992 requests.
It checks the selected subject, topic, nonempty answer and source links, and
compares object answers to their reviewed text. The ordinary regression suite
checks specific facts, exceptions, conditions, negative questions and follow-ups.

Results: 2,886 answered, four partial (two profiles in two forms), 102 explicitly
unsupported (51 dietary profiles in two forms), zero unexpected failures.
`ENTITY_QUESTION_AUDIT.json` records outcomes per subject/topic. Unsupported
outcomes are counted, not hidden or called successful knowledge answers.
This is a representative matrix, not every phrasing or independent proof of
all facts. Most names use a mob hint; targeted tests additionally cover common
unqualified names and pronouns. Alternate villager IDs share natural names.

199 automated tests, TypeScript API checks, readable build and archive checks
pass. Actual Minecraft testing, multiplayer and device performance are separate.
Use the short changed-feature checklist rather than manually repeating the matrix.
