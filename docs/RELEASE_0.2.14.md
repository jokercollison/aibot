# Test release 0.2.14 — entity growth, combat and follow-ups

Adds a full pinned-catalog core-topic audit, reviewed growth guidance for all
35 explicit ageable profiles, and 48 combat summaries across 16 additional entity
profiles. The database has 1,842 reviewed summaries; this does not mean entity
knowledge is finished. Details and gaps: [entity audit](ENTITY_AUDIT_0.2.14.md).

Also packages source fixes developed since 0.2.13: adult/baby wording for breeding
and XP, parent/offspring distinctions, short age follow-ups and topic-preserving
variant choices for feeding, taming, breeding, combat, rewards and movement.
Growth food questions keep the creature as subject and reject unsuitable foods.

Preserves Things to try, private continuous conversations, colors, artwork, chirp,
500-health robots and readable vertical scripts. Sources remain allowed in current
test builds; final production metadata stripping remains a later requirement.
Form scrolling behavior is unchanged.

Fresh BP/RP header and module UUIDs, matched dependency, versioned identifiers,
assets, names, descriptions and menu all use 0.2.14. The .mcaddon contains ordinary
TimeTrapRobot_BP and TimeTrapRobot_RP folders at root, with no Content wrapper
or nested archives. Use a fresh world/new robot and only the matching pair.

`npm run validate` passes API checks, 186 tests and build/archive checks.
Distributed pack payloads are checked against the validated build. Actual-game
results are pending; the changed-feature checklist is the tester's current list.
Older downloads remain unchanged.

Verified `.mcaddon` SHA-256:
`1876dd5b0c8fef5fba9c387408d52fbc5d553f9b167cb7c9c1dd36c06df740c2`.
All archive entries match the validated build byte for byte; standalone packs
match their corresponding build folders. All five header/module UUIDs are fresh
relative to earlier releases. Historical downloads and approved banter are unchanged.
