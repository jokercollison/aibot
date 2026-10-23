# Test release 0.2.23 — resource-location intent fixes

“Where can I find diamond blocks?” now leads with diamond ore mining depth,
not a storage-block recipe. The same location interpretation handles loose coal,
iron, copper, gold, redstone, lapis and emerald names. Quartz points to quartz ore
in Nether netherrack; netherite points to ancient debris. Answers reuse existing
reviewed guidance, including depth, dimension, biome notes and tools where known.
This release connects question wording; it does not add or claim a full wiki import.

Explicit storage/solid/crafted-block requests, “blocks of diamond,” exact Minecraft
identifiers, crafting questions, equipment and mobs retain their separate meanings.
A loose resource-location answer sets the ore subject for follow-up mining questions.
Ordinary terrain questions retain existing concise responses. Items have not started.

Validation: npm run validate passes TypeScript, 257 tests, the 21,945-path block
catalog audit, 9,163 normal-block baseline checks and 5,780 entity requests.
New natural-language regression checks cover resource names, plural blocks, depth,
biomes, ore followups and contrasting storage/equipment/mob/terrain queries.
The explicit-ID baseline did not catch the original player-wording issue; these
new checks exercise the actual natural question path. Minecraft testing is pending.

Five fresh header/module UUIDs and matching dependencies are verified. The add-on
has ordinary BP/RP folders directly at root, with no nested archives. All add-on
and standalone-pack files match the validated build byte for byte. Historical
downloads and approved banter remain unchanged. Readable script: 6,627,122 bytes,
187,493 lines, longest line 1,607 characters. Device performance is unverified.

Use only Behavior 0.2.23 and Resources 0.2.23 in a fresh world with a new robot.
See downloads/Robot_Test_Checklist-0.2.23.txt for changed-feature testing only.

Add-on SHA-256: `21d358f8ebca633187611ccf3c392ce46d56ba59b122e232863be990a63f914d`.
