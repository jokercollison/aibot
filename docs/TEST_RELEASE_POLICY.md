# Separate test releases — user-required policy

Prepare a new release using `python tools/new_release.py MAJOR.MINOR.PATCH`, then
run `npm run validate`. The release helper writes unique header/module UUIDs and
the matching dependency, updates manifest versions and puts the version in both
visible pack names/descriptions. IDs are persisted by release: repeat builds do
not generate duplicate identities for the same version.

The build specializes generic source templates into version-specific custom
identifiers and paths. Version 0.2.1 uses `tts_ai_bot_v0_2_1` and
`tts/ai_bot/v0_2_1/`. Future releases get their corresponding version prefix.
Only that version's entity is controlled; shared legacy aliases are not emitted.
Engine root registration files stay at their prescribed paths.

Copy only the validated release artifacts to downloads, update its README/test
list and publish source and artifacts together. Verify that the downloadable
addon contains the expected manifests, script, versioned resources and UUID pair.
Historical downloads remain historical; never silently substitute a different
version's bytes under an old filename.

Different UUIDs mean separate installations rather than automatic upgrades. The
tester should use a fresh world and spawn a new robot, activating only that
version's matching BP/RP. Saved ownership and settings are not migrated between
these isolated test builds. Version-specific content avoids our own name clashes,
but it cannot guarantee compatibility with every external addon or altered global
world rule. Multiplayer and actual game testing are separate from automated checks.

Packaging rule requested by the user: the outer .mcaddon contains ordinary Content/behavior_packs/AI_Bot and Content/resource_packs/AI_Bot files/folders, matching the supplied Factions ZIP. No .mcpack or ZIP archive is embedded. Standalone .mcpack downloads are optional separate alternatives. Actual Minecraft import of this exact archive still needs testing.

Correction following the reported 0.2.1 import failure: the importable .mcaddon
must use ordinary TimeTrapRobot_BP and TimeTrapRobot_RP folders at its root.
Keep Content/behavior_packs/AI_Bot and Content/resource_packs/AI_Bot only in the
separate submission-style ZIP. Neither archive contains another archive.
