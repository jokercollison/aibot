# Block catalog audit and gap-driven pass

The pinned catalog contains 1,463 block identifiers, including ordinary gameplay,
Education chemistry, creator tools and internal state identifiers. The audit
checks all of them rather than silently removing inconvenient entries.

Before this pass, 914 identifiers had at least one reviewed detailed facet and
549 had only the basic definition/use path. The new decorative (235), special
(89) and availability (225) groups add focused answers for those 549 entries.
Every identifier now has at least one connected facet. This does not mean every
block has complete gameplay knowledge.

## What the question audit checks

Run `node tools/block_question_audit.mjs`. It exercises the actual conversation
engine with 15 questions per explicit block identifier: identity, uses, recipe,
mining, acquisition/location, growth, operation, storage, redstone, water, fire,
gravity, oxidation, stripping and danger. Total: 21,945 question paths. Existing
curated data supplies 5,429 expected detailed facet applications, all routed
correctly. Basic definitions, recipe decisions and unresolved topics remain
separate in BLOCK_QUESTION_AUDIT.json. The audit runs during tests and builds.
Natural phrasing and follow-ups are additionally covered by the Node tests.

A successful route is not independent factual verification or actual Minecraft
execution. Not all 15 topics apply to every block. Unreviewed topics remain
unresolved rather than being silently declared not-applicable. Every subject's
complete flag and the overall completion flag remain false.

## New answer families

Signs/hanging signs, banners, carpets, candles and cake distinguish their
placement/use and drop rules. Pots, sculk, archaeology, resin, bamboo, raw-metal
storage, reinforced/infested blocks, snow/dripstone and special plants retain
individual exceptions. 96 colored wool/concrete shape definitions and their loot
files were reconciled against the pinned sample commit, checking tool tags,
drops/counts, water containment and flammability across every color.

Bee nests/hives, creaking hearts, dried ghasts, statues, nylium, froglights,
other light blocks, eggs, fluids and portals get specific acquisition or mechanic
answers. Education/creator identifiers have explicit availability/use guidance;
that is not a claim that all chemistry recipes or command workflows are complete.
Source revisions, hashes and sample paths are development evidence in the data.

Standing/wall sign IDs reuse the matching sign item recipe. A decorated-pot brick
recipe fills a reviewed gap. Explicit uncraftable decisions are authored only for
reviewed subjects; absence from sample recipe files does not prove uncraftability.
Unknown recipes remain honest. GAMEPLAY_COVERAGE.json now includes the connected
block facets rather than reporting only the original descriptions/recipes.

## Remaining work before a block-topic closeout

Review the per-topic gaps, define evidence-backed applicability for each family,
and fill applicable acquisition, growth, redstone, environmental and interaction
slots. Identity-only counts and basic operation fallbacks cannot close these gaps.
Recipe cases with unhandled presentation methods remain unresolved in the audit.
Additional wording and source conflicts still need targeted review when found.
The next pass should follow this inventory rather than arbitrary examples.

0.2.21 packages this audit and gap pass for testing. It is not labeled the final
block closeout. Earlier distributed downloads remain unchanged.
