# Source batch after 0.2.14 — feeding purposes and observed eating

39 reviewed dietary summaries now cover all 35 sample-backed positive feeding
profiles plus allay, piglin and both villager catalog IDs. The compiled source
total is 1,881 reviewed topic summaries. This is source work for a future release;
the downloadable 0.2.14 remains unchanged with its 186-test release record.

The dietary layer is `data/entities/diet_editorial.json`, compiled by
`tools/entity_database.py`. Wiki revision IDs/hashes and pinned sample links are
retained in development. The player sees explanations, not provenance notes.
These are purpose-specific summaries, not complete diet articles.

- General feeding questions now use readable species-specific guidance rather
  than enumerating every role and item, especially long bee and wolf lists.
- Existing scoped food checks still distinguish healing, breeding, taming and
  growth. A baby mention cannot override an explicit taming request, and does
  not by itself turn an eating question into a growth question.
- Nine reviewed specific cases cover pandas eating cake/bamboo, fox carried
  foods, piglin pork pickup, allay collection items and villager breeding/farming
  inventory items. These do not broaden breeding or taming eligibility.
- Two frog prey rules distinguish small slimes/magma cubes from larger ones.
  Prey size is read from the object of the eating question, not the frog's size.
- Wolf healing retains Bedrock fish/rabbit-stew use while breeding and growth
  retain their narrower meat lists. Bones remain taming food.
- Cookies remain harmful to parrots, wither-rose suitability remains withheld,
  and accepted healing/growth food never implies adult breeding capability.

The audit now shows 39 reviewed dietary summaries and 51 catalog mob dietary
profiles pending review. Missing components do not prove that a mob cannot eat,
accept an item, hunt prey or use a scripted interaction. No missing dietary
profile is automatically marked not applicable or complete.

Verification: 192 automated tests pass, API type checking passes and a temporary
readable bundle keeps a longest line of 801 characters. Tests cover every new
summary, positive-profile reconciliation, food purposes, observed eating, prey
size, unsupported foods and conversation isolation. These are not Minecraft
execution results. Prior downloads, artwork, UUIDs and approved banter remain
unchanged; no new package has been distributed in this source batch.
