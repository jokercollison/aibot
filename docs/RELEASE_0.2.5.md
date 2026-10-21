# Test release 0.2.5 — continuous conversation

Previously every submitted question closed the question form and sent the answer
to chat, forcing another robot interaction and menu selection for every follow-up.
Now choose Talk to me once: a private form shows recent questions/answers above
an empty message field, automatically returning after Send until explicit close.
The same knowledge engine retains subject/ambiguity context across turns.

- Last four exchanges (up to 6,000 characters of recent history; retain the full
  latest answer) are scoped to player+robot and held in memory, not world saves.
- Empty/overlong messages keep the form open with a useful input prompt.
- Temporary UserBusy responses have a bounded retry; explicit cancellation stops.
- Ownership, player/entity validity, dimension and proximity are checked each turn.
- Existing controls, Things to try, art, sound and knowledge remain available.
- Every header/module UUID is new for 0.2.5. Custom IDs/assets are version-specific;
  pack names/descriptions and menu show 0.2.5. No nested archives/Content wrapper.

Bedrock forms are submitted and recreated; a brief refresh and keyboard/focus
behavior still need device testing. This does not claim a custom persistent text
widget. Actual Minecraft execution is unavailable in the cloud.

Validation: npm run validate passed API type checking, 72 automated tests and full
build/archive checks. New simulated tests cover continuous follow-ups, Slime
clarification, cancellation/re-entry, invalid messages, temporary busy responses,
per-turn access checks and bounded history isolated between robots. Distribution
is checked byte-for-byte against the validated dist files. In-game UI timing and
multiplayer remain untested.
