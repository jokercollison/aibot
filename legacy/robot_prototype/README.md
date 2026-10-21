# Offline robot knowledge prototype (V38)

This is a Node-testable **prototype**, not a Minecraft-importable add-on yet. JavaScript CommonJS `require` is used for local testing; Minecraft Bedrock Script API deployment will require generated static ES modules and an entity behavior pack.

`node robot_prototype/tests/test.js` checks sample queries.

The source recipe files are authoritative for the supplied Bedrock Samples snapshot, but a recipe file's presence does not guarantee an item is currently obtainable. Search answers are intentionally conservative. Entity Q&A carries caveats about conditional behavior.

`eventLine(event,seed)` provides funny lines; it does **not** detect lava, mobs, health, or weather. Actual triggers must be wired to stable Bedrock Script API events/position checks, with per-player cooldowns, before release.

Remaining: source-aware query matching, exact item aliases, mob topic resolution, version filtering, packaging, persistent robot state, UI, runtime testing, and broad natural conversation. Do not market as true generative AI.


## V39: conversation and safety triggers
`scripts/conversation_engine.js` routes greetings, thanks, jokes, identity and encouragement to original family-friendly lines, then falls back to the existing factual knowledge engine. `DialogueScheduler` applies **per-owner, per-event** cooldowns using caller-supplied game ticks. These are pure modules tested with Node, **not yet wired to Minecraft world sensing**. To avoid unsupported APIs, an in-game adapter must supply nearby lava, creepers, health, nightfall and rain signals, and then call `maybe(event,ownerId,tick)`. The `knowledge_schema_v39.json` specifies provenance, uncertainty and version fields for future ingestion.
