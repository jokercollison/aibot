# 0.1.1 — feedback from the first in-game trial

- Player introduction now says AI companion; approved original greeting remains unchanged.
- Crafting replies give ingredient quantities and the useful crafting station, without shape names, grid rows, symbols, recipe-book metadata or developer notes. Stone pickaxe uses 3 cobblestone and 2 sticks; alternatives remain supported. "Pick axe" spelling is recognized.
- Mob facts, enchantment replies and unknown replies use player-facing wording. Provenance and verification statuses stay internal/in development docs. Durable equipment is described as items with durability.
- Recognized subjects suggest only supported follow-ups; subjects without explanatory knowledge admit that the companion is still learning.
- Things to try menu and downloads/Robot_Test_Checklist-0.1.1.txt provide actual question examples, expected answers, controls and current warning coverage. Other mob warnings have not been added.
- Resource mapping no longer wraps the shared diagonal cyan swatch around every body part. All faces use bounded palette UVs; front eyes, mouth and chest have separate cyan details. Original six body shapes and original palette image remain unchanged. Actual in-game appearance must be retested.
- Both pack versions and the required resource-pack dependency are 0.1.1; UUIDs remain stable. Add-on is packaged as two self-contained .mcpack archives, also downloadable separately. The user supplied a missing-resource error for 0.1.0; the new matching pair must both be imported and activated. This does not establish that their Minecraft installation has been repaired.

Validation: TypeScript against pinned stable API declarations passes; all 35 tests pass. The exhaustive formatting check exercises every indexed recipe output directly, in addition to public natural-language tests. Pack archives and their manifests/dependency versions are checked, including archive CRCs. No Minecraft engine is available in the cloud, so this is not an actual-game test of 0.1.1.
