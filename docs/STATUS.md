# Source work: unreleased 0.2.4; published test download: 0.2.3

Live wiki article/API access is working. A catalog-driven local reference database and individual mapping report now exist; raw articles are excluded from game builds. Nine ore/resource location groups and Bedrock Slime spawning have reviewed revision sources. Most wiki mechanics are not yet interpreted/connected. The gameplay-topic audit includes 89 biomes. See WIKI_DATABASE.md.

# Current test release: 0.2.3

Published after the user completed 0.2.2 single-player testing and reported everything else looked good. Multiplayer remains untested. Version 0.2.3 passes type checking, 63 automated tests, and packaged identity/layout/asset validation; it has not been run in Minecraft here.

See KNOWLEDGE_EXPANSION_PENDING.md, CRAFTING_COVERAGE.json and GAMEPLAY_COVERAGE.json. Full gameplay knowledge is NOT complete. Live wiki verification remains blocked pending environment network access.

## Historical status below (0.2.1; superseded by current report)

# Development status — 0.2.1

## Implemented and checked outside Minecraft

Modular offline BP/RP development build; owner-only forms, naming and persistent settings; native follow/stay and opt-in owner defense; safe same-dimension home-return attempt; creeper/lava/health warnings; original minimal robot art and chirp; ingredient-only recipes; broad basic block/item/entity explanations with follow-ups; Things to try and Test robot sound menus; approved original dialogue preserved; namespaced source and Content-layout packaging.

Basic description coverage: **3,222 records**, consisting of **813 specific record entries** and **2,409 family-derived record entries**. A block and its item can count separately. This includes internal, legacy and Education entries and is not a claim of full knowledge of every mechanic. Read KNOWLEDGE_SCOPE.md and KNOWLEDGE_COVERAGE.json for scope, provenance and limitations.

`npm run validate` passes stable API type checking and **51 automated tests**: 25 knowledge/state, 8 description/routing, 11 simulated gameplay integration, 5 resource/version/path checks, 1 release-preparation check, and 1 folder-packaging check. Packaging also validates JSON, dependency versions, runtime imports, and CRCs. Tests do not establish factual correctness of every sentence in the target game version or run the Minecraft engine. The inherited v64 baseline's 10 assertions passed earlier; other historical suites remain unrun.

## User-reported actual-game evidence

The user reports completing the single-player checklist on Bedrock **1.26.52**, excluding multiplayer. Screenshots show interaction, naming, basic controls and responses. The missing-resource dependency warning and inaudible chirp remain open until explicitly retested. New 0.2.1 behavior has not been tested in-game. See USER_TEST_REPORT.md.

## Remaining work

- Target-version factual review and richer individual variant behavior. Most editorial summaries and family rules still need authoritative target-version review; reference URLs are not fetched-source verification records. Some newer objects have only limited basic role explanations.
- Additional acquisition/spawn/loot, diet, taming, mining, structures, redstone tutorials and other specific mechanic answers. V65/V66 research is preserved but not fully integrated. No unrestricted conversational AI is claimed.
- Update import, latest BP/RP selection, sound playback, isolated release identity, new namespace and device performance need actual-game validation. The ~3 MB offline bundle needs low-end-device profiling.
- Multiplayer ownership, simultaneous claims, PvP/pet target policy, and clearing native combat targets after disabling defense are untested. Menus are protected, but robots are not immune to other players' damage.
- Native following needs loaded chunks. No cross-dimension following/recall or walking home. Home return is a checked same-dimension teleport, and stay does not anchor physics or override combat.
- More mob warnings and personality variations, polished art, accessibility/localization, robot crafting/recovery/ownership transfer, submission artwork, licensing and Marketplace certification remain.

Source and development builds are published on GitHub. New releases use distinct UUIDs, version-specific content identifiers and visible version labels; older robots are intentionally not migrated. No external AI service or API key is required.

The current .mcaddon now uses the user-required single outer archive with Content pack folders, not nested .mcpack archives. This exact format still requires their Minecraft import test.
