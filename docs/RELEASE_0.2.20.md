# Test release 0.2.20 — plants, devices and utility blocks

Combines the plant (134 variants), device (182 variants) and utility (121 variants)
batches: 437 additional catalog block variants. These contain 583 shared topic
summaries applied to 1,433 catalog/topic combinations. Applications are shared-rule
coverage, not 1,433 independently researched facts. Full block coverage remains
in progress. Evidence and exact member inventories are in the plant, device and
utility JSON/audit files; see BLOCK_PROGRESS.md.

Plant answers cover growth, harvesting, bone meal, locations and specific soil,
water, light and drop exceptions. Devices cover operation, storage, automation,
redstone and collection, preserving material/device distinctions. Utility answers
cover lighting, rails, special structures, respawn safety, uncollectible spawners,
shelves, copper chains/bars and wooden building shapes. Powered/unpowered and
material words in names do not override the requested topic. Ordinary aliases and
plural boxes are resolved; device pronouns retain context even when a redstone
material name also appears. Existing definitions and ingredient-only recipes remain.

New utility batch: 121 variants, 135 summaries, 405 applications. Beacons and
conduits have different activation structures; beds and charged anchors have
explicit dimension hazards. Spawners/vaults cannot be collected by Silk Touch.
Campfire and chiseled-bookshelf drops retain their own rules. Copper bars/chains
need any pickaxe; wooden double slabs drop two slabs. Sources remain in test
builds as authorized; raw research archives remain outside game payloads.

Validation: npm run validate passes TypeScript, 244 automated tests, all existing
5,780 entity audit requests and package/asset/readability checks. Actual Minecraft,
multiplayer, sound quality and device performance testing remain pending.
Readable script: 6,409,282 bytes, 182,619 lines, longest line 1,607 characters.

Fresh five header/module UUIDs and matching BP/RP dependency are verified.
Every add-on and standalone pack entry matches the validated build byte for byte.
The add-on has ordinary BP/RP folders directly at root, without Content wrappers
or nested archives. Historical downloads and approved banter remain unchanged.
Use a fresh world/new robot and only the matching 0.2.20 pack pair.

Add-on SHA-256: `a9c77dcc4ac4a7ebb881364eabaf1b81d41fb2f09c05c37dd9467e107bc02e75`.
