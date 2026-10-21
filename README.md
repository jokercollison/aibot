# Time Trap Studios — AI Bot — 0.2.0 development build

An offline Minecraft Bedrock robot companion. This is a development build, not a finished or certified Marketplace product.

**[Download the latest add-on](https://github.com/jokercollison/aibot/raw/refs/heads/main/downloads/TimeTrapRobot-0.2.0.mcaddon)** · **[Download the testing list](https://github.com/jokercollison/aibot/raw/refs/heads/main/downloads/Robot_Test_Checklist-0.2.0.txt)**

## Install or update

1. Open the downloaded `.mcaddon` with **Minecraft Bedrock**, not Java Edition.
2. Confirm both packs import. In your test world's settings, activate **Time Trap Studios AI Bot — Behavior 0.2.0** and **Time Trap Studios AI Bot — Resources 0.2.0**. Replace active older entries with the updated entries, then reopen the world. No experimental toggles are intended to be needed.
3. Use your existing robot, or find **Time Trap Robot** in Creative spawn eggs. The new summon command is `/summon tts_ai_bot:robot`. Previously spawned `tts:robot` companions retain a compatibility definition.
4. Interact to open the menu. Try **Things to try** for questions or **Test robot sound** for the chirp. First-meeting introductions occur only on new unclaimed robots.

If a resource dependency is missing, import the [resource pack](downloads/TimeTrapRobot-Resources-0.2.0.mcpack) and [behavior pack](downloads/TimeTrapRobot-Behavior-0.2.0.mcpack) separately, then confirm both updated versions are active. Pack UUIDs remain unchanged; both versions are now 0.2.0. Do not delete your world to fix an import.

The user reported single-player checks on Bedrock **1.26.52**, excluding multiplayer. The missing chirp and old resource-dependency warning remain unconfirmed until retested. Version 0.2.0 has not yet been run in Minecraft. See [the recorded user results](docs/USER_TEST_REPORT.md).

## What to ask

- `What is a hopper?` now explains collection, transfer direction, redstone locking, and uses.
- Follow with `What does it do?` or `How do I craft it?` The subject is remembered separately for each player/robot session.
- Try `What is a furnace?`, `What is a diamond pickaxe?`, `What is a zombie?`, `What is lava?`, or `What are oak stairs?`
- Crafting replies give quantities, without grid positions. A stone pickaxe needs **3 cobblestone and 2 sticks**.
- `What scares creepers?`, `How do I breed cows?`, `What does Mending do?`, ingredient-use questions, greetings, and approved jokes remain available.

Basic what/does entries cover all **3,222 block/item/entity records** in the supplied catalog, including duplicated block/item forms, legacy and Education entries. Some explanations are shared by explicit families such as colored blocks or tool materials. This is not complete knowledge of every special mechanic or evidence that every fact has been checked in the user's game version. Unknown specific questions still get an honest uncertainty reply. [Coverage and limitations](docs/KNOWLEDGE_SCOPE.md) are tracked separately from player text.

## Gameplay and sound

Owner-only menus offer naming/settings, follow/stay, home position and checked same-dimension return, opt-in native defense, and warnings for **creepers, nearby lava and low health only**. A creeper warning checks within 10 blocks of the owner; the robot must be within 24 blocks. Warnings share a 60-second cooldown and are proximity checks, not visibility checks. Other mob warnings are not implemented.

The original chirp was valid but quiet and only 0.2 seconds long. This version uses an original louder 0.45-second mono OGG and a dedicated sound-test button. Custom sound event: `tts_ai_bot.robot.chirp`. If it is silent, check Minecraft master/creature sound volumes and the active resource pack. The command `/playsound tts_ai_bot.robot.chirp @s` is an optional separate test. We have not verified playback in Minecraft.

## Develop and build

Node 22+ (tested 24.19.0), npm and Python 3 are required. No API key or external service is needed by the add-on.

```sh
cd /workspace/aibot
npm ci --ignore-scripts
npm run validate
```

Validation checks stable API declarations, description coverage and question routing, knowledge/state behavior, simulated Bedrock integration, namespaces and asset paths. Build output includes:

- `dist/TimeTrapRobot-0.2.0.mcaddon` and separate versioned `.mcpack` files for testing.
- `dist/TimeTrapRobot-Content-0.2.0.zip`, a Content-layout **development** archive matching the supplied Factions reference's pack roots. It lacks final Store Art, Marketing Art and submission approval.
- `build/TimeTrapRobot_BP` and `build/TimeTrapRobot_RP`, the expanded runnable packs.

Source content lives in `Content/behavior_packs/AI_Bot` and `Content/resource_packs/AI_Bot`. Custom assets use `tts/ai_bot/` subdirectories and `tts_ai_bot` identifiers. See [the structure notes](docs/PACK_STRUCTURE.md). `src/` contains runtime code, `data/descriptions/` contains editable basic explanations, and `tools/descriptions.py` compiles them and reports gaps. `legacy/` preserves the entire original research archive; approved `data/banter.json` is tested byte for byte.

API dependencies remain stable `@minecraft/server` 2.0.0 and `@minecraft/server-ui` 2.0.0. Knowledge includes samples v1.26.50.4 and version-specific entries that may not exist in older retail versions. Optional recipe refresh uses `python tools/import-samples.py /path/to/bedrock-samples`. Regenerating the original chirp uses `python tools/generate_sound.py` and requires ffmpeg; ordinary builds use the committed audio and do not need ffmpeg.

Automated tests do not execute Minecraft. Follow [the actual-game checklist](docs/IN_GAME_TESTING.md) for each release. See [current status](docs/STATUS.md) and [0.2.0 changes](docs/RELEASE_0.2.0.md).
