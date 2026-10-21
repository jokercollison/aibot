# 0.2.2 — separate import and submission layouts

The user reports that 0.2.1 failed to import. Its Content hierarchy was modeled
on the supplied submission archive; that layout is a suspected cause, pending the
exact Minecraft import error. The 0.2.2 import .mcaddon instead puts ordinary
TimeTrapRobot_BP and TimeTrapRobot_RP folders directly at the root, with each
manifest immediately inside. It contains no nested archives. Only the separate
Content-layout ZIP retains the submission hierarchy. Standalone packs remain
available for isolating an import failure.

Fresh header/module UUIDs, matching dependency, version-specific identifiers,
visible 0.2.2 names/descriptions/menu, original working texture mapping, Things to
try and ingredient-only crafting replies are retained. All 51 automated tests and
built-reference/UUID/archive checks pass. No in-game import success is claimed;
the user must test this exact archive. The failed import's detailed error remains
useful if it fails again.
