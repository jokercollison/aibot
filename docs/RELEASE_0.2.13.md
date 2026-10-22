# Test release 0.2.13 — entity objects and conditional actions

Packages source work after 0.2.12: 112 mechanic summaries across all 39 catalog
non-mob entities, plus 43 state/condition answers across 30 subjects. The compiled
entity database contains 1,762 reviewed summaries, not exhaustive entity knowledge.

Vehicles and projectiles have storage, controls, impact and retrieval answers.
Technical/creator entities have availability restrictions. Compound vehicle names
and projectile aliases preserve subject selection without replacing recipe lookup.
Breeding checks distinguish babies from adult parents producing offspring, taming
and health prerequisites, and short context follow-ups. Reviewed fox/piglin/drowned
carried-item cases supplement ordinary loot without inventing missing table files.

Retains Bedrock-only player replies, vertically formatted script, source metadata
permitted in test builds, Things to try, private continuous conversation, colors,
approved artwork and 500-health robots. Production metadata removal remains a
separate final-package requirement. Bottom scrolling remains unchanged.

Fresh header/module UUIDs, matching dependencies, versioned identifiers, paths,
names, descriptions and menu use 0.2.13. Addon root contains ordinary BP/RP folders,
not a Content wrapper or nested archives. Use a fresh world/new robot and only
the matching pair. Prior 0.2.12 actual-game testing has not been reported.

Validation: npm run validate with API checks, 172 tests, readable bundle and archive
checks; final distributed payloads verified against the build. Actual Minecraft,
multiplayer and phone/console performance results remain separate and pending.
