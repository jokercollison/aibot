# Test release 0.2.21 — catalog audit and block gap pass

Reconciles all 1,463 pinned block identifiers, including Education, creator and
internal identifiers. Adds focused answers for 549 previously description-only
entries in decorative (235), special (89) and availability (225) groups. These
contain 413 shared summaries with 1,775 new catalog/topic applications. Every
identifier now has at least one topic/availability answer; this is not full
block-topic completion. See BLOCK_CATALOG_AUDIT.md for limits and remaining work.

The new real-engine audit exercises 21,945 explicit-ID question paths and verifies
all 5,429 expected authored facet applications without routing failures. Basic
summaries, recipe decisions and unresolved topics remain separate. The audit runs
in tests/builds; GAMEPLAY_COVERAGE.json now incorporates block facets. A successful
route does not establish independent factual proof or actual Minecraft execution.

New answers include signs, banners, candles/cakes, pots, carpets, 96 pinned
wool/concrete shape variants, sculk, archaeology, resin, mineral variants, nests,
hearts, ghasts/statues, nylium, frogs/eggs, fluids, portals and newer natural blocks.
Education/creator guidance identifies availability without inventing Survival
recipes. Specific mining and world-interaction exceptions remain distinct.

Sign block identifiers reuse matching item recipes. A 4-brick decorated-pot recipe
fills a reviewed gap. Reviewed uncraftable subjects give an explicit negative;
missing sample recipes alone are not proof. Fluid/fire names do not override
mining/use/danger questions, and explicit block mining wins over incidental mob
aliases such as the bee in bee nest. Contextual follow-ups remain supported.

Validation: npm run validate passes TypeScript, 249 automated tests, the block
audit, the existing 5,780 entity requests and readable-output/package checks.
No actual Minecraft, multiplayer or device-performance pass is claimed.
Script: 6,541,520 bytes, 185,391 lines, longest line 1,607 characters.

All five pack/header/module UUIDs are fresh and the BP/RP dependency matches.
The add-on and standalone packs match the validated build byte for byte. The
add-on contains ordinary TimeTrapRobot_BP and TimeTrapRobot_RP folders directly
at root, without nested archives or Content wrappers. Raw research is absent.
Older downloads and approved banter remain unchanged. Use a fresh world/new
robot with only Behavior 0.2.21 and Resources 0.2.21.

Add-on SHA-256: `1515ea2703f72c2db218196a17e1e5270b7ec7a88ad66ce0426103c88ee6b148`.
