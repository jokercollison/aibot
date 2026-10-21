# Entity knowledge work — test release 0.2.6

Work order: entities, blocks, items. Minecraft knowledge comes before additional
personality or casual conversation. Release 0.2.6 preserves this first pass as a separately installable test build.

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
There are currently 494 curated summaries across 127 catalog entities. These are
summaries, not exhaustive mechanic coverage. Every subject remains marked
incomplete. Camera and cushion availability needs explicit target-version review.
The evidence inventory contains pointers for all 129 catalog subjects.

`WIKI_ENTITY_RECONCILIATION.json` also inventories wiki entity pages absent from
that catalog. These require classification as Bedrock, Java-only, Education,
future, removed, variant/jockey, or another game before they become answers.
Do not assume the samples exhaust the wiki, or that later wiki mechanics apply to
1.26.52. Do not close this task based on article counts or passing routing tests.

Remaining work includes full topic interpretation, precise conditional loot
queries, unsupported diet/mechanic questions, wiki-only entity classification,
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
