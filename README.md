# Time Trap Robot — development build 0.1.0

An offline Minecraft Bedrock robot companion for Time Trap Studios. This is an early development build for in-game testing, not a finished Marketplace product.

## Try the add-on

1. Download `dist/TimeTrapRobot-0.1.0.mcaddon` and open it with **Minecraft Bedrock**, not Java Edition.
2. Create a **new test world**. Activate **Time Trap Robot — Development** under Behavior Packs and **Time Trap Robot — Resources** under Resource Packs. No experimental toggles are intended to be needed.
3. Use Creative mode and find **Time Trap Robot** in the spawn eggs, or enable cheats in the test world and enter `/summon tts:robot`.
4. Interact with the robot (right click on PC; use the interaction button on touch/controller). The first player to interact becomes its owner. The introduction appears in that player's chat.
5. Interact again to open its menu: Ask a question, Follow me, Stay here, Set home here, Return home, or Settings. Settings lets the owner rename it and toggle defense and warnings.
6. Ask `How do I craft a hopper?`, `What scares creepers?`, `How do I breed cows?`, or `What does Mending do?`. Questions use a text-entry form; the add-on does not intercept ordinary chat.

API compatibility floor: Bedrock 1.21.90 with stable `@minecraft/server` 2.0.0 and `@minecraft/server-ui` 2.0.0. Knowledge sources include samples v1.26.50.4 and may describe content absent from older game versions. Use a current compatible retail Bedrock version. Import, rendering, controls and native behavior still need actual game verification. See [the test checklist](docs/IN_GAME_TESTING.md).

## What this build implements

- A new custom robot entity with original simple geometry, texture, walking animation and synthesized chirp.
- Owner-only menus, persisted owner/name/settings, native follow/stay behavior and optional native defense when the owner is attacked.
- A saved home position and collision-checked same-dimension return teleport. Home must be loaded and clear. No cross-dimension recall or autonomous home pathfinding yet.
- Nearby creeper, lava-at-foot-level and low-health warnings with a shared one-minute per-robot cooldown.
- Deterministic offline questions using inherited records, aliases, plural normalization, recipe lookup, ingredient uses, limited factual answers and session-only follow-ups.
- Official recipe grid layouts with symbol mappings; original research and approved banter preserved.

A registry of 4,783 inherited records is **not** 4,783 fully implemented answers. The active catalog excludes raw recipe/loot records; recipes are imported separately from 1,892 official source files. Unknown mechanics and location questions deliberately return an uncertainty response. See [remaining work](docs/STATUS.md).

## Develop

Node.js 22+ (tested 24.19.0), npm and Python 3 are required. No paid keys, external server, or runtime network connection is needed.

```sh
cd /workspace/aibot
npm ci --ignore-scripts
npm run validate
```

`validate` checks stable API TypeScript declarations, runs Node tests, bundles the offline script, validates pack JSON/dependency versions and creates the CRC-checked `.mcaddon`. It does not execute Minecraft.

- `src/`: new runtime and deterministic question engine.
- `data/`: readable editable facts, aliases, source records, official recipe definitions and byte-preserved approved dialogue.
- `packs/`: behavior and resource pack source.
- `tools/`: build, catalog generation, packaging, optional recipe refresh.
- `tests/`: knowledge tests and gameplay integration against explicitly simulated Bedrock APIs.
- `legacy/`: all 306 archive entries from the primary project, preserved as imported. Historical test formats vary; they are not all included in `npm test`.
- `docs/`: audit, original request, source notes and actual-game checklist.
- `build/` and `dist/`: generated output, ignored by Git.

To refresh official recipe data, obtain the official `Mojang/bedrock-samples` tag `v1.26.50.4`, then run `python tools/import-samples.py /path/to/bedrock-samples`. This is optional: imported recipe JSON is committed. Do not replace it with a different version silently.

Git tracks source locally. Publishing or pushing the repository to GitHub is a separate step. Review rights to inherited material and source attribution before distribution; this project does not assert Marketplace approval.
