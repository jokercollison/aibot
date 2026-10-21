# TIME TRAP STUDIOS — MINECRAFT AI ROBOT
## Complete Codex Development Handoff

You are the lead software engineer and technical architect for a new Minecraft Bedrock Marketplace add-on being developed by **Time Trap Studios**.

We have already completed extensive research, collected Minecraft gameplay data, developed preliminary JavaScript knowledge engines, and established the concept for an intelligent offline robot companion.

**Your responsibility is to turn this existing work into a complete, functional Minecraft Bedrock add-on.**

Do not restart the research unnecessarily, discard useful work, or blindly reuse outdated code.

---

## 1. PROJECT FILES — READ THIS FIRST

I am providing four project archives. Each has a different purpose.

### File 1: Minecraft_AI_66.zip — PRIMARY PROJECT

This is our accumulated project covering 66 development versions.

It contains:

- Minecraft knowledge databases and research
- Item and block registries
- Mob and entity information
- Crafting, smelting, smithing, and brewing recipes
- Enchantment information
- Biomes, spawning, and loot data
- Source references and verification notes
- JavaScript knowledge-engine prototypes
- Search indexes and database relationships
- Robot conversation and personality files
- Automated tests and development documentation

**This is the primary foundation for the new robot.**

The existing `banter.json` contains original dialogue that has been reviewed and approved. Preserve it.

Some existing code and data may be incomplete, duplicated, incorrectly connected, or outdated. Audit rather than assume correctness.

### File 2: Bedrock Samples v1.26.50.4 — OFFICIAL GAME DATA

This is the Minecraft Bedrock Samples repository archive.

It contains technical game definitions, including:

- Entity components and behaviors
- Block and item definitions
- Crafting and processing recipes
- Loot tables
- Spawning rules
- Trading data
- Other vanilla resources and metadata

Much of the primary project's knowledge was extracted from these samples.

Use these files to verify existing information and recover missing technical data.

The samples do not necessarily expose every gameplay mechanic. Some behaviors are implemented directly by Minecraft's engine.

### File 3: Talking Villagers — REFERENCE PROJECT

This is an older Minecraft project involving talking villagers.

Study it for useful ideas involving:

- Dialogue presentation
- Character interactions
- Personality
- Audio and sound triggers
- Events and reactions
- Conversation pacing

**Do not treat it as the architecture for the new robot.**

The new robot requires a much more advanced knowledge and conversation system.

Do not copy outdated APIs, project identifiers, or code simply because they exist in this project.

### File 4: Previous AI Bot — REFERENCE PROJECT

This is an earlier robot or AI-related Minecraft project.

Inspect it for:

- Player commands
- Robot movement
- Following and navigation
- Entity interaction
- Player ownership
- Behavior and animation
- Existing interface concepts
- Features worth improving or rebuilding

This project is also a reference, not the new product's codebase.

**Build the new robot from scratch using current stable Minecraft Bedrock APIs.**

Reuse ideas and proven approaches where appropriate, but avoid inheriting outdated implementations.

If the archive filenames differ from the names above, identify them by their contents. Do not assume which archive is which.

---

## 2. OVERALL PRODUCT VISION

We are building an intelligent-feeling robot companion that operates **entirely offline inside Minecraft Bedrock**.

The robot should feel like a knowledgeable, helpful, funny companion rather than a basic NPC with a handful of predefined responses.

It should be able to:

- Answer questions about Minecraft.
- Explain crafting and gameplay mechanics.
- Help players survive and explore.
- Follow and protect its owner.
- Recognize nearby dangers.
- Respond to player instructions.
- Engage in casual conversation.
- Make jokes and react naturally to events.
- Remember its name, owner, and settings.

The add-on must be suitable for Minecraft Marketplace and multiplayer gameplay.

The goal is an engaging, reliable product, not a demonstration of experimental AI technology.

---

## 3. OFFLINE KNOWLEDGE SYSTEM

The robot must have extensive, organized knowledge of Minecraft Bedrock.

### Mobs and entities

Cover:

- Identity and classification
- Passive, neutral, or hostile behavior
- Health and attacks
- Spawning locations and conditions
- Fears and avoidance behaviors
- Breeding and taming
- Drops and loot conditions
- Fire and lava damage
- Drowning and underwater behavior
- Sunlight vulnerability
- Special interactions
- Combat strategies

Preserve conditional behavior rather than reducing everything to simple yes/no statements.

### Blocks and items

Cover:

- Every applicable block and item identifier
- What it does
- Where it is found
- How it is obtained
- How it is crafted, when craftable
- How it is used
- Relevant properties and interactions
- Mining and harvesting requirements
- Redstone behavior where applicable

### Recipes and equipment

Cover:

- Crafting-grid recipes
- Shapeless crafting
- Smelting and other furnace processing
- Smithing
- Brewing
- Enchantments
- Ingredient quantities
- Recipe alternatives
- Equipment compatibility
- Enchantment conflicts and maximum levels

### Exploration and gameplay

Cover:

- Biomes
- Structures
- Resource locations
- Survival
- Farming
- Combat
- Redstone
- Transportation
- Commands
- Useful gameplay tutorials

Use current Bedrock behavior. Do not mix in Java-only mechanics.

### Research sources

Previous research included:

- https://minecraft.wiki/
- https://minecraft.wiki/w/Enchantment
- https://www.digminecraft.com/
- https://learn.microsoft.com/en-us/minecraft/creator/
- https://www.minecraft.net/

Use existing project research first. Consult external documentation to fill genuine gaps and verify questionable information.

Do not copy entire copyrighted Wiki articles into the product. Create concise, original factual explanations with source tracking in the development database.

---

## 4. KNOWLEDGE ARCHITECTURE

The information must be organized into clear categories, using consistent identifiers and relationships.

Recommended modules include:

- Entities
- Blocks
- Items
- Recipes
- Enchantments
- Brewing
- Smithing
- Biomes
- Structures
- Loot
- Spawning
- Redstone
- Survival
- Commands
- Conversation
- Personality
- Environmental reactions

Use editable JSON source data and optimized JavaScript runtime modules where appropriate.

**All editable JSON files must remain human-readable, with proper indentation and line breaks.**

Keep factual knowledge separate from jokes and personality dialogue.

The robot must distinguish:

1. Verified facts
2. Conditional facts
3. Information requiring verification
4. Unknown information

Never fabricate answers to fill gaps.

New knowledge should be addable without manually rebuilding unrelated parts of the system.

---

## 5. NATURAL-LANGUAGE QUESTION ENGINE

Build an offline system that recognizes different ways players ask questions.

Examples:

- "What is a creeper?"
- "Are creepers dangerous?"
- "What scares creepers?"
- "How do I make a hopper?"
- "What's the recipe for a hopper?"
- "Where can I find diamonds?"
- "What does Mending do?"
- "How do I breed cows?"
- "What can I make with iron?"

Implement:

- Intent detection
- Item and entity recognition
- Synonyms and aliases
- Plural recognition
- Contextual follow-ups
- Cross-category lookups
- Ambiguity handling
- Reliable answer generation
- Safe fallback responses

Do not attempt to manually write every possible question.

Instead, retrieve structured facts and generate readable responses using templates and appropriate dialogue variations.

Be realistic about what deterministic offline language processing can understand. Do not advertise unrestricted AI conversation if the system cannot provide it.

---

## 6. ROBOT GAMEPLAY FEATURES

Implement a new robot companion with:

- First-spawn introduction
- Custom name entry
- Persistent name and identity
- Player ownership
- Multiplayer permissions
- Follow and stay commands
- Return-home behavior
- Defensive behavior
- Environmental warnings
- Player interaction
- Conversation interface
- Persistent settings
- Movement and navigation
- Appropriate sounds and animations

The player should be able to interact with the robot naturally.

Prefer supported, stable Minecraft Bedrock Script APIs.

If direct chat interception is unavailable in the stable API, provide a reliable text-entry interface instead.

Do not require experimental APIs for core functionality.

---

## 7. PERSONALITY, HUMOR, AND DIALOGUE

The robot should have a recognizable personality.

The existing `banter.json` and related original dialogue are approved and must be preserved.

Expand the dialogue with:

- Greetings
- Farewells
- Jokes
- Casual conversation
- Funny observations
- Playful sarcasm
- Environmental warnings
- Reactions to nearby mobs
- Reactions to player actions
- Contextual comments
- Multiple variations of similar responses

Example when near lava:

"Careful! That lava is not a hot tub."

Example when spotting a creeper:

"That green fellow looks suspiciously explosive."

The personality should be clever, friendly, occasionally sarcastic, and family-friendly.

Avoid excessive repetition through cooldowns, probability controls, and contextual triggers.

Use original robotic bleeps and chirps rather than spoken voice lines.

Keep the personality separate from factual answer generation so jokes never compromise technical accuracy.

---

## 8. TECHNICAL REQUIREMENTS

The add-on must:

- Run completely offline.
- Use current stable Bedrock APIs.
- Avoid preview-only and experimental dependencies.
- Support single-player and multiplayer.
- Be optimized for performance.
- Avoid unnecessary memory usage.
- Maintain persistent player and robot information.
- Keep systems modular.
- Be suitable for Minecraft Marketplace submission.

Use the official Minecraft Creator documentation to verify supported APIs and manifest requirements.

Do not assume that JavaScript code passing outside Minecraft means it works inside Minecraft.

---

## 9. DEVELOPMENT ORDER

Follow this process:

**Phase 1 — Audit**

Inspect all four archives. Determine which code and data are reusable, incomplete, incorrect, or outdated.

**Phase 2 — Architecture**

Finalize the knowledge schema, indexing system, question engine, conversation engine, and robot behavior architecture.

**Phase 3 — Knowledge completion**

Consolidate and validate existing information. Fill important gaps using the supplied samples and reliable sources.

**Phase 4 — Implementation**

Build the actual behavior pack, resource pack, robot entity, conversation interface, behaviors, persistence, and environmental systems.

**Phase 5 — Integration**

Connect the knowledge engine, conversation system, and robot gameplay into one functioning add-on.

**Phase 6 — Testing**

Run automated tests, validate data integrity, verify stable API compatibility, and prepare the add-on for actual in-game testing.

Do not claim that Minecraft testing occurred unless the add-on was actually run inside Minecraft.

---

## 10. DELIVERABLES

Provide:

1. Complete organized source project.
2. Bedrock behavior pack.
3. Bedrock resource pack.
4. Importable `.mcaddon` development build.
5. Offline knowledge engine.
6. Robot gameplay systems.
7. Conversation and personality system.
8. Automated tests and results.
9. Installation instructions.
10. Concise remaining-issues report.

Use Git for version control.

Preserve source data, research provenance, and approved dialogue.

Do not continue generating dozens of incremental ZIP files unless needed for meaningful releases.

---

## 11. WORKING INSTRUCTIONS

Work autonomously through substantial development phases.

Do not stop after every small improvement to ask whether to continue.

Make routine technical decisions independently.

Research, implement, test, debug, and continue.

Only ask for my input when a significant product decision genuinely requires it.

Be transparent about what is implemented, what is tested, and what remains unfinished.

**Your immediate assignment: Inspect all four archives, establish the real current state of the project, and continue developing the new Minecraft Bedrock AI robot toward a playable, testable add-on. Prioritize working software over additional research reports.**