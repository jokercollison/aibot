# Initial archive audit

## Inputs and decisions

- **Minecraft_AI_66.zip**, 306 entries: imported unchanged into `legacy/`. Contains substantial research and source-provenance material, 4,783 v64 records, many separate versioned engines, v65/v66 acquisition/spawn evidence, and historical tests. It contains no complete BP/RP product. Preserve everything; do not treat version counts as proof of completeness. The v64 baseline's 10 smoke assertions pass from its own working directory.
- **A!2.zip**, 21 entries: the previous AI bot, identified by `AI2 Beh` and `AI2 Res`. Inspected behavior, manifest, client entity and geometry. The entity is a copied zombie: targets players/villagers/golems, burns in daylight, converts to drowned, breaks doors and despawns. Its client entity also retains zombie/humanoid controllers and an uninitialized animation variable. Rejected as gameplay architecture; no code or artwork copied into the new runtime.
- **Talking_Villagers_GoldenKnight_v1.1 (1).mcaddon**, 60 entries: inspected script event handling, cooldowns, spatial queries, personality and audiovisual triggering. Reuse concepts of proximity reactions, rate limiting and event-driven forms; do not copy spoken audio, identifiers or vanilla villager overrides. No files from this add-on are shipped in the new packs.
- **bedrock-samples-v1.26.50.4-full.zip**: the uploaded archive exceeds the file-transfer tool's 32 MiB limit and could not be opened here. Instead fetched the matching official repository tag, verified SHA `46ba6ea985fb5a92d79a9419198f10dda14c199d`, and inspected the behavior/metadata tree. The full uploaded archive is not claimed to have been inspected or compared byte for byte. Official recipe files were parsed with string-aware JSONC comment removal into readable local JSON. Checked hopper pattern, creeper avoidance and adult cow breeding directly. Official wolf definitions informed native follow/owner-defense component selection.

Reference checkouts and expanded reference add-ons remain outside the source checkout under `/workspace/reference`; they are development references, not additional product repositories or runtime requirements.

## Data weaknesses addressed

The v64 engine scans every alias on each question, does not reliably match plurals in natural-language questions, returns structured recipe objects without a usable answer, and does not integrate the latest acquisition evidence. Some ordinary questions receive registry records instead of explanations. Recipe records lose the source key-to-ingredient mapping, making displayed grid letters unusable without recovery. The new engine uses bounded word windows, plural matching, source recipe mappings, explicit conditional/partial/unknown outcomes, limited follow-up context, and conservative replies for unsupported questions. Acquisition and spawn coverage remain outstanding rather than being fabricated.

## Preservation and sources

`data/banter.json` is byte-identical to `legacy/robot_prototype/knowledge/banter.json` and covered by a regression test. Original database, source tracking and all historical notes remain in `legacy/`. New working JSON is indented; legacy compact files retain original archive bytes. Existing fact provenance is not upgraded to in-game verified status.

API reference pages at `learn.microsoft.com` returned HTTP 403 in this environment. Stable API compatibility was checked against Microsoft's published npm declarations for exact versions `@minecraft/server@2.0.0` and `@minecraft/server-ui@2.0.0`, and official Mojang sample definitions. This is narrower than full content validation in the game. Relevant references:

- https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/minecraft-server?view=minecraft-bedrock-stable
- https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server-ui/modalformdata?view=minecraft-bedrock-stable
- https://github.com/Mojang/bedrock-samples/tree/v1.26.50.4

No wiki articles or reference-project voice recordings were copied into the new packs. Samples-derived recipe data requires attribution/license review before public distribution. Samples' `LICENSE` is retained as `docs/BEDROCK_SAMPLES_LICENSE.txt`.
