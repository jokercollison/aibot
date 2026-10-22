# Time Trap Studios — AI Bot — 0.2.20 development build

An offline Minecraft Bedrock robot companion. This is a development build, not a finished or certified Marketplace product.

**[Download the latest add-on](https://github.com/jokercollison/aibot/raw/refs/heads/main/downloads/TimeTrapRobot-0.2.20.mcaddon)** · **[Download the testing list](https://github.com/jokercollison/aibot/raw/refs/heads/main/downloads/Robot_Test_Checklist-0.2.20.txt)**

**Plants, devices and utility blocks:** This release adds 437 block variants across farming, foliage, storage, workstations, redstone, lighting, transport and special utility families. Growth, harvesting, inventory and operation follow-ups are connected. See [block progress](docs/BLOCK_PROGRESS.md). Full block coverage remains in progress.

**Normal entity pass complete:** 0.2.17 closed the agreed feeding, capability and special-mechanic checklist across all 129 catalog entities. It includes 2,241 reviewed topic summaries across 142 knowledge subjects, shared capability/effect rules and 66 trade inventories. See [completion scope and narrow exceptions](docs/ENTITY_COMPLETION.md). Blocks are the next knowledge phase; full Minecraft knowledge is not complete.

**Offline research archive:** a broad wiki text snapshot and verified offline restore tools are documented in [the archive guide](research/wiki-archive/README.md). This preserves references independently of live wiki access; it is separate from the bot’s playable knowledge.

## Install this separate test version

1. Download and open the `.mcaddon` with **Minecraft Bedrock**. It contains ordinary `TimeTrapRobot_BP` and `TimeTrapRobot_RP` folders directly at its root, with no nested pack archives.
2. Create a **fresh Creative test world** and activate only **Time Trap Studios AI Bot — Behavior 0.2.20** and **Time Trap Studios AI Bot — Resources 0.2.20**. Both descriptions also say TEST VERSION 0.2.20.
3. Spawn a new **Time Trap Robot** from its Creative egg, or use `/summon tts_ai_bot_v0_2_20:robot`.
4. Interact. The menu title must show **v0.2.20**. **Things to try** gives examples; **Test robot sound** plays the chirp.

Each new test version now gets **new header/module UUIDs and version-specific content names**, as requested. It installs separately and does not migrate robots or settings from previous versions. You can keep earlier worlds for comparison, but do not enable older packs in this test world. See [the release policy](docs/TEST_RELEASE_POLICY.md).

If only one pack imports, open the [resource pack](downloads/TimeTrapRobot-Resources-0.2.20.mcpack) and [behavior pack](downloads/TimeTrapRobot-Behavior-0.2.20.mcpack) separately. Confirm both names/descriptions show 0.2.20. Do not delete an existing world to fix an import.

The user reported earlier single-player testing on Bedrock **1.26.52**; this release still needs actual-game validation. [Recorded results](docs/USER_TEST_REPORT.md).

## Continuous conversation

Choose **Talk to me** once. Send a question; the next form shows your recent
conversation above an empty message box. Keep sending follow-ups or switch topics
without interacting with the robot again. Close/Back/Escape finishes the session.
Bedrock recreates a form after each submission, so a brief refresh is expected.
Recent history is private to that player/robot and lasts only in script memory;
it is not a permanent saved chat log. Things to try remains on the main menu.

## What to ask

- `What is a hopper?` now explains collection, transfer direction, redstone locking, and uses.
- Follow with `What does it do?` or `How do I craft it?` The subject is remembered separately for each player/robot session.
- Try `What is a furnace?`, `What is a diamond pickaxe?`, `What is a zombie?`, `What is lava?`, or `What are oak stairs?`
- Crafting replies give only ingredient quantities, without grid positions or station/output metadata. A stone pickaxe needs **3 cobblestone and 2 sticks**.
- `What scares creepers?`, `How do I breed cows?`, `What does Mending do?`, ingredient-use questions, greetings, and approved jokes remain available.

Basic what/does entries cover all **3,222 block/item/entity records** in the supplied catalog, including duplicated block/item forms, legacy and Education entries. Some explanations are shared by explicit families such as colored blocks or tool materials. This is not complete knowledge of every special mechanic or evidence that every fact has been checked in the user's game version. Unknown specific questions still get an honest uncertainty reply. [Coverage and limitations](docs/KNOWLEDGE_SCOPE.md) are tracked separately from player text.

## Gameplay and sound

Owner-only menus offer naming/settings, follow/stay, home position and checked same-dimension return, opt-in native defense, and warnings for **creepers, nearby lava and low health only**. A creeper warning checks within 10 blocks of the owner; the robot must be within 24 blocks. Warnings share a 60-second cooldown and are proximity checks, not visibility checks. Other mob warnings are not implemented.

The original chirp was valid but quiet and only 0.2 seconds long. This version uses an original louder 0.45-second mono OGG and a dedicated sound-test button. Custom sound event: `tts_ai_bot_v0_2_20.robot.chirp`. If it is silent, check Minecraft master/creature sound volumes and the active resource pack. The command `/playsound tts_ai_bot_v0_2_20.robot.chirp @s` is an optional separate test. The user confirmed chirp playback in 0.2.2; 0.2.20 still needs an in-game check.

## Develop and build

Node 22+ (tested 24.19.0), npm and Python 3 are required. No API key or external service is needed by the add-on.

```sh
cd /workspace/aibot
npm ci --ignore-scripts
npm run validate
```

Validation checks stable API declarations, description coverage and question routing, knowledge/state behavior, simulated Bedrock integration, namespaces and asset paths. Build output includes:

- `dist/TimeTrapRobot-0.2.20.mcaddon` and separate versioned `.mcpack` files for testing.
- `dist/TimeTrapRobot-Content-0.2.20.zip`, a Content-layout **development** archive matching the supplied Factions reference's pack roots. It lacks final Store Art, Marketing Art and submission approval.
- `build/TimeTrapRobot_BP` and `build/TimeTrapRobot_RP`, the expanded runnable packs.

Generic source templates live in `Content/behavior_packs/AI_Bot` and `Content/resource_packs/AI_Bot`. Custom assets use `tts/ai_bot/` subdirectories and version-specific `tts_ai_bot_v...` identifiers. See [the structure notes](docs/PACK_STRUCTURE.md). `src/` contains runtime code, `data/descriptions/` contains editable basic explanations, and `tools/descriptions.py` compiles them and reports gaps. `legacy/` preserves the entire original research archive; approved `data/banter.json` is tested byte for byte.

API dependencies remain stable `@minecraft/server` 2.0.0 and `@minecraft/server-ui` 2.0.0. Knowledge includes samples v1.26.50.4 and version-specific entries that may not exist in older retail versions. Optional recipe refresh uses `python tools/import-samples.py /path/to/bedrock-samples`. Regenerating the original chirp uses `python tools/generate_sound.py` and requires ffmpeg; ordinary builds use the committed audio and do not need ffmpeg.

Automated tests do not execute Minecraft. Follow [the actual-game checklist](docs/IN_GAME_TESTING.md) for each release. See [current status](docs/STATUS.md) and [0.2.20 changes](docs/RELEASE_0.2.20.md).
