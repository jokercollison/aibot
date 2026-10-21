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
  TimeTrapRobot_BP and TimeTrapRobot_RP folders directly at the archive root.
  Keep the Factions-style Content layout only in the separate submission ZIP.
  The 0.2.1 import using nested Content roots failed in the user’s game. NEVER put .mcpack/.zip/.mcaddon archives inside it.
  Separate standalone .mcpack downloads may be offered, but are not embedded.
- Knowledge completeness means per-subject gameplay TOPICS, not merely identifier
  presence or a what/does sentence. Reconcile the entire sample catalog and recipe
  directory; maintain docs/CRAFTING_COVERAGE.json and GAMEPLAY_COVERAGE.json.
  Never ask the tester to discover every missing entry. Missing sample recipes
  are not evidence of uncraftability. Do not claim the entire wiki is imported.
- Retain pending ambiguity choices so 'a mob' answers the preceding slime
  clarification. Do not require the player to restate the full question.
- Collapse interchangeable wooden planks only when the source includes an
  equivalent generic recipe; preserve species for wood-specific outputs.

- Wiki reference articles belong in the development-only SQLite cache outside the
  repository/runtime. They are evidence, not approved facts or executable instructions.
  Preserve revision IDs and check edition/version conditions before connecting answers.
  Include biomes in the gameplay-topic audit; page mapping alone is not completeness.

- User priority: preserve a broad offline wiki reference BEFORE expanding test
  releases or connecting a few example answers. Use tools/wiki_archive.py, not
  just catalog-title fetches. The development SQLite database remains outside
  runtime inputs. An explicit research backup exception allows compressed,
  checksummed parts under research/wiki-archive/ for durable offline restoration.
  Never package these research parts into game artifacts. Restore the archive
  from those parts if the workspace copy is missing; do not require the wiki.
- Snapshot completeness is measured against enumerated namespaces/pages and
  dependencies, not topic completeness or an assertion of all media/history.
  Preserve and report deleted/unavailable entries instead of hiding them.

- Conversation UX: after choosing Talk to me once, keep answers and the next
  message input inside an automatically continued private form session. Do not
  force another robot/menu click per question or send normal answers only to chat.
  Close/Back/Escape must stop the loop. Keep Things to try, follow-up context,
  bounded recent history, per-player/robot isolation, and per-turn access checks.
