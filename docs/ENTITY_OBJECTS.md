# Non-mob entity mechanics after 0.2.12

112 reviewed mechanic summaries cover all 39 catalog entities outside the mob
category. The compiled database has 1,719 reviewed topic summaries overall.
These are topic summaries, not 112 new entities or proof of complete mechanics.
See ENTITY_OBJECT_COVERAGE.json; every completeness flag remains false.

## Connected coverage

Vehicles: boats, chest boats and minecart types now have storage, propulsion and
retrieval guidance. Seats, inventory, powered versus activator rails, disabled
hopper collection, passengers and explosive cargo are separate concerns.

Projectiles: arrows, thrown tridents, snowballs, eggs, wind charges, fireballs,
potions, fishing bobbers and other catalog projectiles have use, impact and
retrieval answers. Player item variants and mob-fired projectiles are distinguished.
A moving wither skull is not a collectible wither skeleton skull; a dragon fireball
is not a ghast projectile that can simply be returned to its shooter.

Objects and technical entities: armor stand posing/equipment, End crystal
activation, primed TNT, experience orbs, lingering clouds, lightning, cushions
and creator/Education entity restrictions have reviewed answers. Survival
availability is not invented from mere presence in the sample catalog.

Question recognition includes compound vehicle names, eye-of-ender signals,
experience bottles and explicit projectile names. Object aliases apply outside
recipe/ingredient-use lookups so they do not replace ordinary crafting subjects.
Trident item questions bridge to its thrown-entity mechanics when appropriate.
XP bottle/orb identifiers no longer falsely force every question to the XP topic.
The word dangerous in a native ID no longer overrides a more specific question.

## Remaining entity bases

All 129 sample-catalog entities now have more than basic descriptions connected,
but that alone is not readiness for exhaustive gameplay knowledge. The remaining
work includes deeper subtype/state mechanics, detailed projectile interactions,
exact equipment conditions, dynamic carried-item rewards, two missing sample loot
payloads, source conflicts and actual-game validation. Missing topics remain
review gaps rather than automatic impossible/not-applicable answers.

Raw article text stays in the preserved development archive. Author-written
summaries retain source revision IDs/hashes. Current test builds may retain source
metadata; the final production strip requirement remains separate.

Validation: npm run check, 166 automated tests and temporary readable bundling.
Tests exercise every reviewed mechanic through public questions plus natural
vehicle/projectile names and follow-ups. This is not Minecraft execution.
Published 0.2.12 downloads remain unchanged while the user tests them. This batch
has not been packaged into a new version. Phone/console and multiplayer results
cannot be inferred from the cloud checks.
