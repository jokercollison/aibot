# AI Bot layout based on the supplied Factions reference

The source tree uses:

```
Content/
  behavior_packs/AI_Bot/
    manifest.json
    entities/tts/ai_bot/robot.json
    entities/tts/ai_bot/legacy_robot.json
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

New entity: `tts_ai_bot:robot`. New geometry, animation, render and sound IDs also
include `tts_ai_bot`. Both packs retain their existing unique header UUIDs and
receive matching version updates, preserving Minecraft's update identity. The BP
requires the exact matching resource-pack UUID/version. We did not copy the
Factions UUIDs or add reciprocal dependencies just to imitate every detail.

A hidden-spawn-egg compatibility definition still recognizes previously spawned
`tts:robot` entities. Old dynamic-property keys remain on those entities so owner,
name, home and settings are preserved. They are scoped to each robot, not global
world data. This compatibility exception is intentional; new robots use the new
project-specific ID. Test existing robots after import to verify native save
behavior in Minecraft, not only in simulated tests.

`npm run build` produces both the importable `.mcaddon`/separate `.mcpack` files
and a **Content-layout development ZIP** matching the reference's content roots.
The latter is not a certified or complete Marketplace submission: original Store
Art, Marketing Art, licensing, metadata/review and device testing remain separate.
No Factions assets or submission artwork are reused.
