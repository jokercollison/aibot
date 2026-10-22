import terrain from '../data/blocks/terrain.json' with {type:'json'};

// Keep the question facet separate from the catalog's basic definition.
export function blockTopic(q) {
  if (/\b(?:silk touch|fortune|mine|mining|break|breaking|harvest|pickaxe|shovel|tool)\b/.test(q)) return 'mining';
  if (/\b(?:where|find|found|locate|obtain|biomes?|depth|deep|height|level)\b/.test(q)) return 'location';
  return undefined;
}
export function blockAnswer(id, q) {
  const topic = blockTopic(q);
  if (!topic) return undefined;
  const entry = terrain.subjects[id];
  if (!entry?.topics[topic]) return undefined;
  return {
    status: 'conditional', subject: id, topic,
    answer: entry.topics[topic], sources: [entry.evidence.source],
    coverage: 'reviewed_block_summary'
  };
}
