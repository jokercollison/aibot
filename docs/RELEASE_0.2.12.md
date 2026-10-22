# Test release 0.2.12 — Bedrock replies, persistence and transport

Rewrites 39 player-facing answers to state applicable Bedrock facts directly,
without Java comparisons, Java values or instructions to ignore another edition.
The baby piglin XP answer states one base experience point without the unwanted
comparison. Development edition evidence remains preserved separately. Automated
checks scan compiled answer/description fields for regressions.

Packages 62 movement/persistence summaries across 42 subjects. Natural despawning,
special timers, lifetime damage, teleportation and death are distinguished.
Relocation covers supported leads, buckets, pets and mounts without treating
leashing as taming or naming as universal protection. Total reviewed entity
summaries: 1,610. No entity is marked complete.

Retains vertically formatted main.js, source metadata permitted in current test
builds, Things to try, continuous private conversation, approved artwork, speaker
colors and 500-health robots. Final production metadata removal remains pending.
Automatic bottom scrolling is unchanged.

Both headers and every module have fresh UUIDs; names, descriptions, menu,
identifiers and matching dependency use 0.2.12. The addon has ordinary BP/RP
folders directly at root. Use a fresh world/new robot with only the matching pair.

Validation: npm run validate, 161 automated tests, readable bundle validation and
exact distributed-payload verification. Cloud checks are not actual Minecraft
execution. User reports testing the 0.2.11 baby-piglin question and flags its
unwanted comparison; no full 0.2.11 checklist pass is assumed. Actual-game 0.2.12
and multiplayer checks remain pending.
