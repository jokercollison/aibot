# Test release 0.2.16 — large entity core baseline

Adds 289 core answers across 87 catalog mob profiles: 117 combat, 60 persistence,
63 relocation and 49 growth-eligibility answers. 287 are reviewed summaries; two
command-created undead foal growth cases remain partial. The database now has
2,168 reviewed summaries. 41 negative breeding replies now use direct language
such as “You cannot breed a creeper,” retaining construction and other exceptions.

All 90 mobs now have attack, provocation, counterplay, ordinary persistence and
practical relocation guidance. Growth distinguishes real babies, size variants,
undead babies and mobs with no normal baby stage. Minecart/lead exclusions,
mount/rider attacks and special despawn timers remain distinct. Passive mobs do
not gain imaginary attacks. Unknown replies do not expose internal topic labels.

This establishes a practical entity baseline so blocks can be the next category.
It does not mean all wiki details are implemented. Feeding remains unsupported
for 51 mob profiles; narrow missing or conflicting evidence stays tracked. See
[the milestone and remaining limits](ENTITY_CORE_MILESTONE.md).

Validation: `npm run validate` passes API checking, 199 automated tests, readable
output and package checks. The real conversation engine also handles a matrix
of 2,992 representative requests across all 129 catalog entities: 2,886 answered,
four partial, 102 explicitly unsupported, zero unexpected routing failures.
These are code checks, not execution in Minecraft or independent proof of every
fact. Actual-game, multiplayer and device performance testing remain pending.

Fresh header/module UUIDs, matched BP/RP dependency, namespaced assets and exact
versioned names/descriptions/menu use 0.2.16. The add-on contains ordinary pack
folders directly at root, without a Content wrapper or nested archives. Use a
fresh world/new robot and only the matching pair. Older downloads are unchanged.

Artwork, chirp, Things to try, continuous private conversations, colors, 500-health
robots, readable scripts and approved banter are preserved. Sources stay in test
builds as authorized; final production metadata removal remains a later step.

Generated script: 5,548,570 bytes, 165,971 lines, longest line 801 characters.
Every distributed archive entry matches the validated build byte for byte.

Verified add-on SHA-256:
`b49f2d29f63f7d9a95f50d65246da12bb62753137655d9d85b72156ec3d16042`.
