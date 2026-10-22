# Entity persistence and relocation batch — 0.2.12

62 reviewed summaries across 42 entity subjects cover lifetime/persistence,
relocation and selected teleportation behavior. These include refinements to
previous lifetime topics; they are not 62 new mobs or exhaustive coverage.
The compiled database has 1,610 reviewed entity topic summaries overall.

Natural despawning, lifetime damage, damage/death, movement and unloaded chunks
are distinguished. Named wandering traders still leave; unnamed endermites time
out even in vehicles; summoned vexes take lifetime damage; skeleton trap horses
have special timers. Bedrock converted zombie villagers, trader llamas and newer
mount interactions preserve their state-dependent behavior. Persistence never
means immunity to suffocation, drowning, attacks or Peaceful removal.

Relocation guidance separates riding, leads, buckets, boats and minecarts. Pet
teleportation is conditional, not a guarantee of cross-dimension or unloaded-chunk
rescue. Turtle home beaches, aquatic air/water needs, llama steering limitations
and leashed-sniffer digging restrictions remain explicit.

Reviewed article revision IDs/hashes are preserved. Missing subjects/topics stay
pending_review in ENTITY_MOVEMENT_COVERAGE.json; no missing component is used to
prove impossibility. Every subject remains complete=false.

Validation: 161 automated tests, API checking and readable-build/archive checks.
Actual Minecraft and multiplayer testing remain separate. Further entity gaps
include unresolved loot payloads, exact special-state conditions and additional
movement topics. This release does not complete the whole entity encyclopedia.
