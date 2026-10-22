# Special entity interactions after 0.2.9

This source batch adds or refines 103 reviewed interaction summaries across 56
entity subjects. The compiled entity database contains 1,263 reviewed summaries
overall. Published 0.2.9 archives are unchanged; this work is not packaged yet.

## Connected actions

- Ordinary lead eligibility is explicitly reviewed against the archived Lead
  article, including angry wolves/nautiluses, hostile riders, and animals that
  cannot be leashed through normal player interaction. Absence of a component
  is not used as proof of impossibility.
- Water-bucket capture covers fish, axolotls and tadpoles; sulfur cubes instead
  require an empty bucket and have size and ignited-TNT restrictions.
- Allay example items, dropped-item collection, note-block deliveries and jukebox
  duplication remain separate. Copper golems use copper-chest inputs and suitable
  wooden/trapped-chest destinations, not arbitrary containers.
- Bee pollination/harvesting, dolphin treasure guidance/swimming boost, armadillo
  rolling/repelling, fox and ocelot trust, pet sitting, collars, parrot shoulders
  and imitation have dedicated topic recognition.
- Villager job claims, locked professions, restocking and breeding conditions are
  separate topics. Zombie-villager curing excludes enchanted golden apples.
- Panda breeding retains Bedrock’s eight nearby bamboo plants; sniffer breeding
  retains full-health requirements even in explicit food questions. Turtle home
  beaches and sniffer digging restrictions have expanded guidance.
- A cookie warning explicitly explains Bedrock Fatal Poison for parrots.

Action routing preserves the creature when another item or creature name appears
later in the question. Pronoun follow-ups retain the previous subject. Basic
variant identities and nitwit trade restrictions remain covered by regression
checks. Detailed breeding requirements also remain in ordinary feeding replies.

## Sources and limits

Author-written summaries cite preserved wiki revisions. Reference hashes and
revision IDs live in data/entities/special_editorial.json; raw article text stays
in the development SQLite archive. No external page text is executed as code.
The compiler merges this layer after earlier summaries and emits a separate
ENTITY_INTERACTION_COVERAGE.json audit. Missing topics remain unreviewed, not
implicitly impossible. Every subject remains complete=false.

This is not full coverage of all special interactions, precise conditional loot
or edition/version edge cases. The next entity work is unresolved conditional
loot and further topic gaps. Blocks/items and personality remain outside this
batch. Automatic bottom scrolling remains unchanged.

Validation: npm run check, 142 passing automated tests and a temporary esbuild
bundle without overwriting the test download. Actual Minecraft and multiplayer
execution are separate and remain pending for this source batch.
