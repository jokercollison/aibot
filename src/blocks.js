import ground from '../data/blocks/ground.json' with {type:'json'};
import families from '../data/blocks/families.json' with {type:'json'};
import terrain from '../data/blocks/terrain.json' with {type:'json'};

const rules=[...families.rules,...ground.rules].map(rule=>({...rule,match:new RegExp('^(?:'+rule.pattern+')$')}));

// Keep the question facet separate from the catalog's basic definition.
export function blockTopic(q) {
  if (/^(?:what is|what are|describe|tell me about)\b/.test(q) && !/\b(?:tool|pickaxe|shovel|silk touch|fortune|happens)\b/.test(q)) return undefined;
  if (/\b(?:strip|stripping|bark)\b/.test(q) && /\b(?:how|can|axe|strip|stripping)\b/.test(q)) return 'stripping';
  if (/\b(?:burn|burns|burning|flammable|fireproof|fire|lava)\b/.test(q)) return 'fire';
  if (/\b(?:gravity|fall|falls|falling|unsupported|support)\b/.test(q)) return 'gravity';
  if (/\b(?:water|waterlogged|waterlogging|harden|hardens|rain|dissolve)\b/.test(q)) return 'water';
  if (/\b(?:silk touch|fortune|mine|mining|break|breaking|harvest|pickaxe|shovel|tool|drops?|loot)\b/.test(q)) return 'mining';
  if (/\b(?:where|find|found|locate|obtain|biomes?|depth|deep|height|level)\b/.test(q)) return 'location';
  return undefined;
}
export function blockAnswer(id, q) {
  const topic = blockTopic(q);
  if (!topic) return undefined;
  const family=rules.find(rule=>rule.match.test(id.replace(/^minecraft:/,'')));
  const entry = terrain.subjects[id]?.topics[topic] ? terrain.subjects[id] : family;
  if (!entry?.topics[topic]) return undefined;
  return {
    status: 'conditional', subject: id, topic,
    answer: entry.topics[topic], sources: [entry.evidence.source],
    coverage: entry===family ? 'reviewed_block_family' : 'reviewed_block_summary'
  };
}

// Reviewed wiki recipe fallback for color recipes absent from pinned sample files.
export function blockRecipe(id) {
  const match=id.match(/^minecraft:(white|orange|magenta|light_blue|yellow|lime|pink|gray|light_gray|cyan|purple|blue|brown|green|red|black)_wool$/);
  if(!match)return undefined;
  const color=match[1].replaceAll('_',' ');
  const answer=color==='white'
    ? "To craft white wool, you'll need 4 string. You can also use 1 wool and 1 white dye."
    : `To craft ${color} wool, you'll need 1 wool and 1 ${color} dye.`;
  return {status:'conditional',subject:id,answer,sources:[families.rules.find(r=>r.id==='wool').evidence.source]};
}
