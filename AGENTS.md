# AI Bot project requirements

These preferences were explicitly requested by the user during in-game testing.

- Every NEW test release must have a new version and new UUIDs for BOTH pack
  headers and ALL their modules. BP dependencies must reference only the matching
  resource pack's new UUID and version. Never reuse another release's identities.
- Run `python tools/new_release.py VERSION` to prepare a release. It records IDs
  in `tools/pack_identities.json`. Rebuilding the SAME release reuses its IDs;
  randomizing UUIDs on every build is not the requested behavior.
- Builds must use version-specific entity, event, geometry, animation, render,
  sound, family, property and asset-path names. Do not add legacy shared entity
  aliases that let different test versions control each other's robots.
- Include the exact release version in both packs' visible names AND descriptions,
  and in the robot's menu. Test builds are separate installs, not in-place upgrades.
  Tell the tester to use a fresh world/robot and only the matching pack pair.
- Keep Things to try with useful question examples. Keep contextual follow-ups.
- Crafting replies must give ingredient quantities only, with no grid rows,
  positions, shape names, station metadata, developer notes or recipe-book metadata.
  Diamond sword: 2 diamonds, 1 stick. Stone pickaxe: 3 cobblestone, 2 sticks.
  Preserve accurate recipe source definitions; change the player presentation.
- Keep developer confidence/source/verification notes out of ordinary player text.
  Unsupported facts must still get an honest answer rather than invented knowledge.
- Preserve approved data/banter.json byte for byte. Preserve all legacy research.
- The last working 0.1.1 texture and cube mapping should remain unchanged unless
  the user requests an art change. Source templates live under Content; build
  namespacing must update all corresponding references together.
- The supplied Factions archive is a structure reference, not reusable artwork,
  sound, source code, UUIDs, or a complete submission template for this product.
- Run npm run validate before distributing a build and check the distributed
  .mcaddon contents match it. Do not claim actual Minecraft testing from Node tests.
- Record user-reported single-player testing separately from untested multiplayer
  and new-release checks. Cloud Minecraft execution is unavailable here.
- Package the .mcaddon as ONE outer archive with ordinary
  Content/behavior_packs/AI_Bot and Content/resource_packs/AI_Bot folders, matching
  FactionsAddon1.2 (1).zip. NEVER put .mcpack/.zip/.mcaddon archives inside it.
  Separate standalone .mcpack downloads may be offered, but are not embedded.
