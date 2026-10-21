# Test release 0.2.3

- Fixed source recipe normalization, including list/string results, brewing and metadata variants.
- Wooden sword answers collapse interchangeable planks; species-specific outputs retain their wood.
- Short clarification replies such as “a mob” resolve the preceding slime question and retain follow-up context.
- Added limited mining-location, conditional loot, health, breeding and taming answers with documented source limits.
- Audited all sample IDs and 1,892 recipe files; gameplay topic gaps remain explicitly tracked. This is not complete Minecraft knowledge.
- Preserved Things to try, ingredient-only crafting, working texture/mapping and chirp.
- Fresh version-specific header/module UUIDs and content names; both pack labels/descriptions show 0.2.3.
- Single outer addon archive with ordinary BP/RP root folders; no nested pack archives.

Validation: npm run validate passed (type checking, 63 tests, build and archive checks). The distributed files are byte-identical to validated dist artifacts. No Minecraft engine test was performed for 0.2.3. User completed previous 0.2.2 single-player testing; multiplayer remains untested.
