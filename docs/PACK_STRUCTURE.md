# AI Bot layout based on the supplied Factions reference

The source tree uses:

```
Content/
  behavior_packs/AI_Bot/
    manifest.json
    entities/tts/ai_bot/robot.json
    texts/en_US.lang
  resource_packs/AI_Bot/
    manifest.json
    entity/tts/ai_bot/
    models/entity/tts/ai_bot/
    animations/tts/ai_bot/
    render_controllers/tts/ai_bot/
    textures/tts/ai_bot/entity/robot.png
    sounds/sound_definitions.json
    sounds/tts/ai_bot/robot/chirp.ogg
    texts/en_US.lang
```

Build output adds `scripts/tts/ai_bot/main.js` to the behavior pack. Engine-defined
entrypoints such as `manifest.json`, text registration and sound definitions stay
at their required locations; custom asset payloads live under project paths.

Starting with 0.2.1, releases are isolated as explicitly requested by the user.
`tools/new_release.py` assigns new header/module UUIDs for each new version and
links the matching BP/RP pair. Source templates are specialized during build:
0.2.1 emits `tts_ai_bot_v0_2_1:robot`, project IDs using that prefix, and paths
under `tts/ai_bot/v0_2_1/`. Manifest and root registration files retain the
engine-prescribed locations. Both visible names/descriptions include the version.

Legacy shared aliases are no longer emitted. Each test release requires a fresh
robot/world; old ownership/settings do not transfer between different BP identities.
See TEST_RELEASE_POLICY.md for the release workflow. Historical 0.2.0 packaging
retained UUIDs and aliases; that behavior was replaced by the user's new policy.

`npm run build` produces both the importable `.mcaddon`/separate `.mcpack` files
and a **Content-layout development ZIP** matching the reference's content roots.
The latter is not a certified or complete Marketplace submission: original Store
Art, Marketing Art, licensing, metadata/review and device testing remain separate.
No Factions assets or submission artwork are reused.
