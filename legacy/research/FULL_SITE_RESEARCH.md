# Microsoft Learn research consolidation — 2026-10-20

## Scope and accuracy
This is a **broad structural survey**, not a claim that every page on Microsoft Learn was fetched. Direct internet access from the local file-processing environment is unavailable. Linked reference landing pages were inspected via search excerpts; each page has a per-section coverage status in `MICROSOFT_LEARN_COVERAGE.csv`. Individual class/command/schema pages remain to be exhaustively checked. The user asked to finish as much of the site as possible before moving to external knowledge sources.

## High-impact verified findings
1. Scripting V2 changed initialization: replace `world.afterEvents.worldInitialize` with `world.afterEvents.worldLoad`, and `world.beforeEvents.worldInitialize` with `system.beforeEvents.startup`. Startup runs in early execution; don't access live world entities/blocks/players until world load.
2. Before-event callbacks are restricted; defer mutations/UI until writable execution. After-event callbacks generally run in read-write mode.
3. `world.afterEvents.chatSend` is marked **pre-release** in current stable-view documentation. This makes direct typed-chat interception unsuitable as the only supported Marketplace interaction method.
4. Stable `playerInteractWithEntity` after-event exists. Use it to open a robot interaction UI, with async error/cancellation handling.
5. `Entity.id` is described as a unique identifier consistent across loads of a world instance; never parse its format. Still test owner/robot association through world reloads, world copies, and multiplayer.
6. `Entity.setDynamicProperty` and `World.setDynamicProperty` are documented. Use per-robot state plus a world-level index, with versioned migrations and bounded payloads.
7. World and Dimension APIs provide entity querying and block/biome operations. Design environmental awareness as periodic, bounded spatial queries rather than expensive every-tick full-world scans.
8. The Microsoft Learn Script API docs include prior 1.x pages. These are explicitly labeled older; use latest stable pages for fresh code, and verify module versions on the **actual 1.26.50.4 runtime**.
9. The local Bedrock Samples archive supplies vanilla behavior/resource files and metadata; it does **not** by itself prove the version of `@minecraft/server` or `@minecraft/server-ui` available at runtime.
10. The public command and recipe reference hierarchies are distinct from the developer API docs. Later, populate player-facing bot answers using these plus additional sources; don't confuse development instructions with user knowledge.

## Architecture changes recorded
- Build from scratch. Prior add-ons are conceptual references only.
- Use `system.beforeEvents.startup` only for supported registration; initialize world-dependent state in `world.afterEvents.worldLoad` or after world becomes available.
- Split: interaction adapter, persistence, identity/ownership, command intent parser, knowledge lookup, entity behavior, sound/animation, diagnostics.
- Keep stable entity-interaction + text forms as baseline; chat wake word feature gated pending stable API confirmation.
- Never import all vanilla samples into distributable add-on; reference specific needed formats and create original assets.

## Outstanding work
- Enumerate and validate **every** API/class method relevant to the bot; check stability notes and runtime version.
- Expand individual entity AI-goal components and animations, sound and render controllers.
- Verify exact supported manifest module dependencies on target game build.
- Test all claims in an actual Bedrock 1.26.50.4 world, including multiplayer and persistence.
- Continue per-page review of commands, recipe types, resource-pack and schemas; index last-modified metadata where the pages expose it.
- User will provide additional external websites for the **offline Minecraft knowledge database**. Those sources are a separate phase.

## Source index
See `MICROSOFT_LEARN_COVERAGE.csv` for linked sections and explicit review status; `SAMPLES_DETAILED_INVENTORY.json` for the actual 1.26.50.4 local archive inventory.
