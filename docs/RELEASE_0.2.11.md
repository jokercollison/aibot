# Test release 0.2.11 — readable script, rewards and combat

The distributed main.js is now formatted into readable lines, with descriptive
identifiers retained. Build validation rejects oversized lines over 10,000
characters so multi-megabyte lines cannot silently return. Source knowledge remains
split into formatted data files and source modules. The playable entrypoint remains
one bundled script for compatibility. This formatting change is not lazy loading
and is not a claim of lower RAM usage or faster Minecraft startup.

Packages the reward and combat source batches after 0.2.10: 183 reward summaries
across 90 catalog mobs and 105 combat summaries across 35 subjects. Total reviewed
entity summaries: 1,551. Experience, baby/breeding rewards, equipment drops,
provocation, attack styles and counterplay have dedicated routing. Includes the
evoker naming fix and contextual shield follow-ups. Known source conflicts retain
honest uncertainty, and no entity is claimed complete.

Retains Things to try, continuous conversation, speaker colors, approved artwork,
500-health robots and earlier spawning/interaction answers. Automatic bottom
scrolling remains unchanged. Actual-game 0.2.10 results have not been reported;
actual-game 0.2.11 and multiplayer validation remain pending.

Both pack headers and all modules have fresh UUIDs. Dependencies, names,
descriptions, menu, identifiers and asset paths match 0.2.11. The addon has ordinary
TimeTrapRobot_BP and TimeTrapRobot_RP folders directly at root, no nested archives.
Use a fresh world/new robot with only the matching 0.2.11 pair enabled.

Validation: npm run validate, including API checks, 154 automated tests, readable
bundle validation and packaging checks; final download contents verified against
the build. These checks do not substitute for phone or console performance tests.

Final artifact: main.js 5,283,359 bytes, 161,199 lines, longest line 801 characters.
Addon 448,784 bytes. Readable versus compact knowledge builds returned identical
results for 15 representative questions/follow-ups. Addon SHA256:
`d653f9033b1baa6622081fb2d7cf4dc2a00f28592bc15a83512e455d9cadbe2d`.
