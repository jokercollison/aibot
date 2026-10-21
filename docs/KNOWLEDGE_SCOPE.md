# Basic explanations versus complete gameplay knowledge

Version 0.2.0 adds separate **what it is** and **what it does** text for all
**3,222** block/item/entity records in the existing catalog:

| Category | Records | Specific entries | Family-derived entries |
| --- | ---: | ---: | ---: |
| Blocks | 1,463 | 284 | 1,179 |
| Items | 1,630 | 400 | 1,230 |
| Entities | 129 | 129 | 0 |

This counts records, not unique player-visible objects: many blocks also have an
item record, and the catalog includes legacy/internal/Education and version-specific
identifiers. It is **not** a claim that all Minecraft knowledge, all versions, every
use, or every mechanic has been implemented or independently verified.

The 813 specific record explanations and 2,409 family-derived explanations come
from original editorial summaries, existing project context, inspected official
recipes/entity components, and shared behavior for explicit families such as
stairs, tools and colored blocks. Family rules are positive regex matches with
editable what/does text. An unknown future identifier is never given a guessed
fact just to make coverage appear complete.

`data/descriptions/` is editable source; `tools/descriptions.py` expands it against
the catalog and records every coverage gap in `KNOWLEDGE_COVERAGE.json`.
`data/description_catalog.json` preserves the editorial/source-reference metadata;
`data/description_runtime.json` omits that metadata from the game bundle.
Referenced web pages are research targets, not evidence that every page was
fetched or checked. Most editorial summaries still need target-version review.
Some new content, such as potent sulfur and sulfur spikes, has only a limited
basic explanation and explicitly admits that special interactions remain unknown.

Automated tests require both explanation fields, provenance metadata, and a
working question path for every covered record. They detect missing routing,
recipe-only redirects, unexpanded templates and unwanted developer text. They do
not prove that each factual sentence is correct in the user's exact game version.

Next knowledge work: factual review against authoritative target-version sources,
more specific variant behavior, richer acquisition/loot/spawn/diet/taming/mining
answers, natural-language ambiguity resolution and additional gameplay mechanics.
Unsupported questions still receive an honest uncertainty response; they are not
answered with an unrelated basic description. Existing approved banter and all
legacy research remain unchanged.
