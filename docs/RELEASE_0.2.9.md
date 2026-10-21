# Test release 0.2.9 — entity variants and interactions

Packages the entity source batches after 0.2.8: 178 named variant records with
520 variant-specific topic summaries, and 1,080 reviewed topic summaries across
142 knowledge subjects. All 90 catalog mobs have sourced form/state summaries.
This does not mean every entity mechanic is complete.

Variant context supports short follow-ups. Environment and interaction topics
cover fire versus sunlight, breathing, powder snow, conversions, milking,
shearing, brushing, equipment repair, hatching and growth. Brown-mooshroom
answers include 17 flower/effect rules with Bedrock durations. Shulker dyeing
correctly requires Creative mode; evoker-summoned vex lifetime differs from
spawn-egg/command vexes. Plural matching recognizes vexes and foxes.

Preserves Things to try, chronological continuous conversation, aqua/yellow
speaker colors, approved texture and mapping, and 500-health robots.
Automatic bottom scrolling remains unresolved. Detailed spawning boundaries,
further interactions and conditional loot gaps remain recorded, not invented.
Future Freezing-effect mechanics are excluded from this Bedrock 1.26.52 target.

Both packs have fresh header/module UUIDs, matching dependencies, exact 0.2.9
names/descriptions and version-specific content identifiers. The .mcaddon has
two ordinary pack folders directly at its root, without nested archives.
Use a fresh world and new robot with only this matching pack pair enabled.

Validation: npm run validate (API checking, 126 automated tests, build and archive
checks), followed by byte-for-byte distributed archive verification. These are
cloud checks, not Minecraft execution. Actual-game 0.2.9 and multiplayer testing
remain pending. The user reports the preceding tested version looked good.
