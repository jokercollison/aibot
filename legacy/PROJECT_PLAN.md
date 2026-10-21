# Minecraft AI — Master Project Plan
Version: 1 | 2026-10-20 | Status: Planning

## Product vision
One feature-rich, offline Minecraft Bedrock Marketplace robot companion add-on. Players should have many useful activities and discoveries, not just repetitive dialogue. Working project name: AI Bot; final Marketplace title undecided.

## Confirmed design
- Multiple robot companions in a multiplayer world; each player can own a separate bot.
- First placement: funny introduction and naming form. Example: "Hello! I'm your new robotic companion! ... wait a minute. I don't have a name! That's embarrassing. What would you like to call me?"
- Store each bot's chosen name and owner persistently. Use unique IDs in addition to names to prevent collisions.
- Everyday commands and questions via typed player text, addressed to the bot by name ("Gizmo, follow me", "Gizmo, how do I craft a piston?"). Avoid requiring menus for ordinary interactions.
- Large, offline searchable text/JSON knowledge base, covering recipes, commands, mobs, blocks, survival, redstone, and more. Expand from verified Microsoft Learn, vanilla content, and other sources.
- Intent matching, synonyms, context, fallback handling and varied accurate text answers. No internet or remote AI dependency.
- Robot makes short, reusable EMO-inspired electronic chirps, bleeps, glitches and alarms. Emotion and pacing follow text and events; text appears on screen. Avoid recording voice lines for every answer.
- Awareness of nearby players, creepers, mobs and events; varied contextual reactions with cooldowns and repeat prevention.
- Robot capabilities to investigate/implement: follow/stay/come here, home, danger warnings, defense, building and assistance; permissions and safety checks for world-changing actions.
- Persistent per-bot state and conversation context. Personality variation is desirable but lower priority than broad useful functionality.
- Future customization: change model/appearance and colors. Deferred.

## Technical conventions
- Use FactionsAddon1.2 as reference for TTS-specific pack structure; independent behavior and resource packs, manifests and UUIDs.
- Use safe names such as tts/ai_bot/ for scripts and tts_ai_bot: for identifiers, subject to verification with current Bedrock docs.
- Do not reuse legacy tts_cursed: identifiers or old pack UUIDs.
- Reference Talking Villagers GoldenKnight for awareness, reactions, dialogue timing, sounds and cooldowns.
- Reference AI.zip prototype for typed input UI, follow/stay, home, rename, help and jokes; modernize old APIs.
- Validate all scripts and APIs against current Microsoft Learn Bedrock stable docs and Marketplace restrictions.
- Prefer data-driven, modular behavior and bounded processing for performance.

## Database plan
- database/knowledge.json: factual answers and question examples, synonyms, sources and version verification.
- database/dialogue.json: text variations, tone, personality, mood and nonverbal sound cues.
- database/events.json: triggers and reactions for proximity, danger, interactions and environment.
- database/actions.json: bot commands, preconditions, permissions and handlers.
- database/synonyms.json: normalization and intent vocabulary (to populate).
- Keep facts distinct from phrasing; avoid duplicating every possible player question.
- Every imported entry must have an ID, source/provenance, verification status, and applicable Bedrock version when relevant.
- Existing piston recipe is illustrative only, not yet source-verified.

## Delivery and versioning
- Each delivery: Minecraft AI N.zip, increasing N sequentially.
- Every ZIP includes the full latest plan, tracker, datasets, and changelog, not only differences.
- Keep downloaded versions safe. Project files, not chat memory, are authoritative.
- ChatGPT manages research, design, data, priorities; move to Codex for sustained codebase implementation and testing.

## Open decisions
- Final Marketplace product title and brand presentation.
- Chat capture mechanics and Bedrock API limitations, including multiplayer routing.
- On-screen response UI style, limits, timing and accessibility.
- Full list of robot actions and how permissions/ownership work.
- Knowledge coverage priorities and sources.
- How many models/color variations and how they are unlocked.
- Target supported Bedrock version, device performance budgets, Marketplace compliance.

## Next steps
1. Establish database schemas, validation, and safe text-command routing.
2. Ingest source material incrementally with provenance and verification.
3. Prototype naming and ownership persistence, multiplayer name routing, chat and text display.
4. Prototype expressive chirps and contextual reactions.
5. Build and test useful commands, awareness and action permissions.
6. Evaluate full scope and hand coding work to Codex when specs are sufficient.

## Documentation research status (v4)
Broad section-level survey completed; nested references not exhaustively read. See `research/FULL_SITE_RESEARCH.md` and `research/MICROSOFT_LEARN_COVERAGE.csv`. Build fresh; do not port old naming implementation.

## Gameplay knowledge source: DigMinecraft
Use DigMinecraft category/individual pages as secondary player-facing research, with source tracking, Bedrock edition filtering, and cross-checking against vanilla samples and official command documentation. See research/DIGMINECRAFT_RESEARCH.md.
