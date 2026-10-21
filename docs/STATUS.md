# Development status

## Implemented, automated checks passing

Initial modular BP/RP development build; offline question form; first-use claim; owner-only controls; persistent name/settings/home; follow/stay and opt-in native defense component events; safe same-dimension home-return attempt; bounded owner-nearby warning scans; original minimal robot art, movement animation and chirp; preserved original banter and research; official recipe data with ingredient-only answers; friendly capability-based follow-up suggestions; a Things to try menu and downloadable test checklist; ingredient-use queries; limited mob/enchantment facts and session-only follow-ups; deterministic package build.

`npm run validate`: stable API declaration check passes; 35 Node tests pass (24 knowledge/state checks, 8 gameplay integration checks against simulated APIs, 3 pack/version/UV checks); JSON/dependency/runtime-import checks pass; `.mcaddon` CRC check passes. Separately, the inherited v64 engine's existing 10 smoke assertions pass. These are distinct checks, not actual game tests. Other historical suites remain unrun.

## Not yet complete

- **Actual game validation** remains necessary for each release. The user reported basic in-game interaction and supplied screenshots from 0.1.0 on Bedrock 1.26.52, including a missing-resource dependency error. This is user-reported evidence, not an in-game run by the cloud agent. The 0.1.1 dependency packaging and UV changes need retesting. Minecraft is not installed in this cloud machine. Import, content log, entity component acceptance, forms, tamed navigation, native target behavior, saved-state reload and mobile/controller rendering are unverified.
- Knowledge coverage is much smaller than the registry: most mobs/items have identifiers but no general explanations. Unsupported environmental mechanics, acquisition, spawn/loot interpretation, biomes, structures, tutorials and redstone need evidence-backed integration. V65/V66 research is preserved but not wired into player answers. No claim of complete knowledge.
- Smithing/brewing processing-specific instructions, multi-output/alternative recipe presentation, enchantment conflicts and ambiguity handling need further work. Recipe answers show at most four variants and reverse ingredient queries show a partial list. Tagged ingredients do not expand into every matching item.
- Defense is delegated to owner-hurt native behavior and defaults off. PvP/pet target policy and clearing existing targets after disabling defense need real multiplayer checks. Owner permissions apply to menus, not immunity from other players dealing damage. No transfer, recovery after owner account loss, or robot crafting recipe yet.
- Follow requires nearby loaded chunks and native pathfinding. No cross-dimension following/recall. Return home is a same-dimension checked teleport, not autonomous home navigation. Stay does not anchor physics or override combat. Robot can be damaged and destroyed.
- Personality expansion, contextual banter variations, world-event reactions and polished character art remain. Original approved dialogue is retained, but only selected categories are currently triggered.
- Performance on actual target devices, accessibility/localization, distribution licensing and Marketplace certification have not been completed.

No API keys or external AI services are required. Source and downloadable development builds are published to GitHub. Use the original handoff as the long-term product scope, not a description of this milestone's completed functionality.
