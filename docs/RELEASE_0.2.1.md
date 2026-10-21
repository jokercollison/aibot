# 0.2.1 — isolated test release and visible build identification

The user's screenshot contains 0.1.0-only grid text and the original offline-helper
greeting. Inspection of the actual shipped artifacts confirms those strings are
absent from 0.1.1 and 0.2.0; both contain Things to try. This is evidence of older
code being loaded, not proof of the exact local import/activation failure.

Changes requested during follow-up:

- A new UUID for each pack header and every module; BP points to only this release's
  new RP UUID/version. All recorded release identities are checked for overlap.
- Version-specific custom IDs and asset paths, so simultaneously installed release
  files do not share our entity/geometry/animation/render/sound/family names. The
  code only controls this release's robot. Old legacy aliases are deliberately
  removed from isolated releases. Normal Minecraft world rules still affect all
  active addons; isolation is not a guarantee against unrelated third-party mods.
- Version is visible in both pack names and descriptions and in the robot menu.
- Things to try stays in the menu. New introductions explicitly mention examples.
- Crafting presentation is ingredient quantities only. Diamond sword answer:
  'To craft diamond sword, you'll need 2 diamonds and 1 stick.' Recipe source
  shapes remain internally for accurate ingredient counting, but are not shown.
- The texture bytes and geometry cube mapping are unchanged from the working 0.1.1
  release; only namespaced identifiers and resource paths differ.
- `tools/new_release.py` prepares future versions with new IDs once per release.
  A temporary-workspace regression test proves future IDs differ and rerunning the
  same release preserves its identity. `AGENTS.md` records the user's policy.

Validation: API type check and all 51 automated tests pass. Built namespace,
entrypoint, resource paths, sound registration, header descriptions, dependency
versions and UUID separation are additionally checked before packaging. The
actual downloadable archive is inspected before publication.

Install in a fresh test world with ONLY Behavior 0.2.1 and Resources 0.2.1 active.
New robot: `tts_ai_bot_v0_2_1:robot`. Sound: `tts_ai_bot_v0_2_1.robot.chirp`.
Old robots/ownership are intentionally not migrated between isolated test builds.
Actual Minecraft playback, appearance, loading and multiplayer remain unverified
for this release. No new UI overlay or mob-warning feature is included.

Packaging rule requested by the user: the outer .mcaddon contains ordinary Content/behavior_packs/AI_Bot and Content/resource_packs/AI_Bot files/folders, matching the supplied Factions ZIP. No .mcpack or ZIP archive is embedded. Standalone .mcpack downloads are optional separate alternatives. Actual Minecraft import of this exact archive still needs testing.
