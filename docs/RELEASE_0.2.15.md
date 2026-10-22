# Test release 0.2.15 — feeding purposes and observed eating

Packages 39 reviewed dietary summaries, nine specific eating/collection cases,
and two frog prey-size rules from the source batch after 0.2.14. General questions
get concise species guidance. Specific feeding questions retain separate taming,
breeding, healing and growth checks. Mentioning a baby cannot override taming or
silently change an eating question into a growth question.

Panda cake differs from bamboo breeding; fox carried food differs from berry
breeding; villager inventory food differs from hand-feeding animals. Allay item
collection and piglin pork pickup remain distinct from breeding/bartering. Frogs
only swallow small slimes and magma cubes. Wolf fish/stew healing does not imply
breeding eligibility. Existing food hazards and withheld source conflicts remain.

The compiled database has 1,881 reviewed topic summaries, with 51 catalog mob
dietary profiles still pending. This is not complete entity knowledge. Details:
[feeding batch](ENTITY_FEEDING_PROGRESS.md).

Both packs receive fresh header/module UUIDs; BP depends on its matching RP.
Names, descriptions, menu, identifiers and asset paths use 0.2.15. Import the one
.mcaddon with ordinary BP/RP folders directly at root, without Content wrappers
or nested archives. Use a fresh world/new robot and only the matching pair.
Optional standalone .mcpack files are provided separately.

Preserves artwork, chirp, Things to try, private continuous conversation, colors,
500-health robots, readable scripts and approved banter. Sources remain in test
builds as authorized; production metadata stripping is a later requirement.

Validation: `npm run validate` passes API checks, 192 tests, readable output and
archive checks. Script: 5,403,668 bytes; 163,536 lines; longest line 801 characters.
Every distributed payload matches the validated build byte for byte. All five
UUIDs are fresh relative to historical releases. Older downloads are unchanged.
Actual Minecraft, multiplayer and phone/console performance remain untested.

Verified .mcaddon SHA-256:
`fd08b016b0e83c16caab7db50e68a182d2f1fe33bcae5a03beb7e6236e86aebe`.
