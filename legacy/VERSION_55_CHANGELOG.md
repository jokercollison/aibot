# Minecraft AI v55 — Runtime architecture and integrity audit

This release separates editable JSON knowledge from generated, read-only JavaScript modules. The generated modules use standard ESM syntax and no Node.js APIs, suitable for inclusion in a Minecraft Bedrock Script API project after packaging and API compatibility testing.

## Data and code
- `database/structured/v55/entity_topic_index.json`: per-mob topic evidence, including exact component values and scope.
- `database/structured/v55/conditional_entity_index.json`: event and conditional groups preserved.
- `database/structured/v55/entity_intent_routes.json`: evidence routes, **not** finished natural-language gameplay answers.
- `robot_runtime/generated/*_data.js`: category-specific JS modules generated from v54 catalog.
- `robot_runtime/knowledge_api.js`: pure lookup and unknown/ambiguous answer handling.
- `research/V55_RUNTIME_AND_DATA_AUDIT.json`: integrity findings and limitations.

## Next required work
1. Resolve relation endpoints against canonical identifiers and distinguish reference types.
2. Add blocks/items/biomes/loot to the canonical catalog; they currently exist in other database files.
3. Write grounded gameplay answers with conditions, confidence, and citations.
4. Build and test a genuine Bedrock behavior/resource pack with entity interactions and persistence.

No claim of complete coverage or in-game functionality is made.
