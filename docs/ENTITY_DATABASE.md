# Entity core baseline — 0.2.16

The [milestone report](ENTITY_CORE_MILESTONE.md) defines the practical entity
baseline, known gaps and next transition to blocks. There are 2,168 reviewed
summaries, with all 90 catalog mobs covered for combat, persistence and relocation.
The [question audit](ENTITY_QUESTION_AUDIT.json) exercises 2,992 representative
requests across all 129 catalog entities and explicitly counts unsupported cases.
This is not complete wiki knowledge; earlier batch records follow.

# Current test release — 0.2.15

The feeding batch is now packaged: 1,881 reviewed topic summaries across 142
knowledge subjects. See [0.2.15 changes](RELEASE_0.2.15.md) and the
[current topic audit](ENTITY_CORE_TOPIC_AUDIT.json). Every subject remains
incomplete. Counts below preserve the earlier 0.2.14 audit and batch history.

# Current entity audit — 0.2.14

The new [catalog-wide topic audit](ENTITY_CORE_TOPIC_AUDIT.json) reconciles all
129 pinned catalog entities (90 mobs and 39 other entities). It distinguishes
reviewed summaries, scoped component facts, basic descriptions and pending review.
Feeding roles count as scoped dietary coverage, not a complete diet article.
Pending topics may need a sourced not-applicable answer; absence is not proof.

0.2.14 contains 1,842 reviewed summaries across 142 knowledge subjects, plus
185 component-backed summaries and 326 basic summaries. Variant counts remain
178 records with 520 topic summaries. These counts overlap neither full wiki
articles nor a claim that an entity is complete. See [this batch](ENTITY_AUDIT_0.2.14.md).

The sections below preserve earlier batch history and explain the data path.

# Entity knowledge work — test release 0.2.8

Work order: entities, blocks, items. Minecraft knowledge comes before additional
personality or casual conversation. Release 0.2.6 preserves this first pass as a separately installable test build.

The [current large entity batch](ENTITY_BATCH_PROGRESS.md) adds conditional loot,
reviewed eligibility answers and wiki reference subjects after the 0.2.7 test build.
The complete preserved wiki text archive remains separate from the game database.
Archiving an article does not establish that its gameplay facts are understood.

## Data path

1. `tools/entity_evidence.py` maps the 129 catalog entity IDs to preserved wiki
   revisions and section offsets, and retains pinned Bedrock sample components,
   events, spawn rules and loot conditions. No network is required.
2. `data/entities/editorial.json` contains independently written topic summaries,
   with source-section hints, variants and edition distinctions.
3. `tools/entity_database.py` compiles only the curated answer data into
   `data/entities/runtime.json`. The full article and sample evidence are not
   imported into the game bundle. Both test and build commands run this compiler.
4. `src/knowledge.js` identifies the subject, preserving existing catalog ambiguity
   and follow-up behavior. `src/entities.js` independently identifies the topic.
   Incidental scenery does not become an invented loot condition.
5. Returned answers retain permanent revision URLs internally. Developer evidence
   and confidence notes do not appear in player text.

Examples: creeper + drops; snowy wolf + spawning; wither + health.
“White wolf” asks which variant, accepts “snowy”, and remembers that variant for
“Where does it spawn?” A new explicit generic wolf question clears that variant.

## Actual coverage and remaining work

`ENTITY_KNOWLEDGE_COVERAGE.json` is the machine-readable per-subject topic audit.
The published 0.2.6 build contains 494 curated summaries across 127 catalog entities.
Release 0.2.7 has 498 curated summaries across all 129 catalog entities,
plus 95 component-backed health/feeding topic summaries. These are summaries, not
exhaustive mechanic coverage. Every subject remains marked incomplete. Camera
advice now distinguishes Education from normal Survival; cushion notes are linked
to its archived placement/breaking rules and Bedrock history.
The evidence inventory contains pointers for all 129 catalog subjects. Current
0.2.8 counts and limits are recorded in ENTITY_BATCH_PROGRESS.md; the figures
above describe published 0.2.6/0.2.7 builds.

`WIKI_ENTITY_RECONCILIATION.json` also inventories wiki entity pages absent from
that catalog. The classified [wiki inventory](ENTITY_WIKI_CLASSIFICATION.json) accounts for all
208 listed pages: mapped catalog subjects, four Bedrock reference gaps, composite
roles/jockeys, and excluded or restricted editions/features. Classification is
not answer coverage; the four Bedrock subjects now have basic connected topics in
the 0.2.8 batch, with additional detail still pending.
Do not assume the samples exhaust the wiki, or that later wiki mechanics apply to
1.26.52. Do not close this task based on article counts or passing routing tests.

Remaining work includes full topic interpretation, precise conditional loot
queries, additional diet/mechanic questions, connecting classified Bedrock gaps,
and explicit source conflicts. For example, the archived creeper article and the
pinned loot table differ on the parched-related disc condition. That condition
has not been promoted into an answer. No complete-knowledge claim is justified.

## Release and testing notes

Release 0.2.6 has fresh pack/module UUIDs and version-specific content identifiers.
Existing artwork and the continuous conversation UI are retained. Earlier
published versions remain available.

Before a new release, finish the remaining source/topic review and prepare only
new or changed player checks; move completed checks to testing history. Keep the
conversation chronological with newest answer beside the input. Native stable
server-ui currently exposes no scroll-position API; automatic bottom scrolling
remains unresolved and must not be advertised as fixed. Multiplayer is untested.

## Feeding and health work included in 0.2.7

`tools/entity_topics.py` preserves the food's purpose and component scope: breeding,
taming, healing and baby growth are distinct. Healing amounts, replacement buckets,
filters and harmful effects remain structured data. Cookies carrying fatal poison
are a parrot warning, never a healing suggestion. The conflicting wither-rose/bee
interaction is withheld and recorded in the coverage report.

`src/entity-feeding.js` answers specific food questions and keeps pronoun follow-ups
with the creature. In “feed tropical fish to an axolotl”, the fish is food rather
than the subject. Loose fish is distinguished from a bucket of fish. A named food
for an unsupported purpose does not silently produce generic affirmative advice.

Fixed health summaries use the pinned v1.26.50.4 sample revision. Variable or special
health is not flattened: wolves, difficulty-dependent withers and curated state
answers retain their separate explanations. Creakings, End crystals, experience
orbs and unreachable legacy ocelot state groups are excluded from that inference.

Regenerate without touching published packs:

```sh
python tools/entity_reconciliation.py
python tools/entity_database.py
npm run check
npm test
```

The wiki classification command uses the restored development-only SQLite archive;
ordinary compilation and tests use committed evidence and need no wiki connection.
Release 0.2.7 packages these additions with distinct conversation colors and
500-health robots. The prior 0.2.6 download remains available unchanged.
Full validation includes 89 automated tests; actual-game validation is pending.
