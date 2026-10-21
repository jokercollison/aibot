# Version 45: substantial retrieval and data-quality pass

- Adds a recipe-ingredient reverse index built from actual recipe entries, preserving variant IDs and sources.
- Adds a deterministic, no-network resolver with plural handling, category-specific intent, recipe quantities, source metadata, brewing steps and loot caveats.
- Adds cross-category collision audit and recipe-source provenance index.
- Adds a dataset audit and automated regression tests. No claim of full Bedrock gameplay coverage or runtime compatibility.
- The resolver is a Node.js development prototype, **not yet a Bedrock Script API module** (CommonJS `require` needs conversion during bundling).
- Important: source data may contain unused recipes, experimental identifiers, and legacy biomes. Do not treat source presence as survival obtainability.
