import utility from '../data/blocks/utility.json' with {type:'json'};
import devices from '../data/blocks/devices.json' with {type:'json'};
import plants from '../data/blocks/plants.json' with {type:'json'};
import masonry from '../data/blocks/masonry.json' with {type:'json'};
import ground from '../data/blocks/ground.json' with {type:'json'};
import families from '../data/blocks/families.json' with {type:'json'};
import terrain from '../data/blocks/terrain.json' with {type:'json'};

const rules=[...families.rules,...ground.rules,...masonry.rules,...plants.rules,...devices.rules,...utility.rules].map(rule=>({...rule,match:new RegExp('^(?:'+rule.pattern+')$')}));

// Keep the question facet separate from the catalog's basic definition.
export function blockTopic(q) {
  q=q.replace(/\bhoneycomb blocks?\b/g,'decorative block').replace(/\bfire coral\b/g,'coral').replace(/\b(?:powered|unpowered) (?=comparator|repeater)/g,'').replace(/\bredstone (?=lamp|torch|comparator|repeater|wire|block)/g,'');
  if (/^(?:what is|what are|describe|tell me about)\b/.test(q) && !/\b(?:tool|pickaxe|shovel|silk touch|fortune|happens|growth|growing|planting)\b/.test(q)) return undefined;
  if (/\b(?:where|find|found|locate|obtain|biomes?|depth|deep|height)\b/.test(q)) return 'location';
  if (/\b(?:grow|grows|growing|growth|planting|bone meal|bonemeal|fertili[sz]e|mature|maturing|hydrate|hydration|trample|trampling)\b/.test(q) || /\b(?:do i|can i|should i|to|you) plant\b/.test(q)) return 'growth';
  if (/\b(?:oxidi[sz](?:e|es|ing)|oxidation|rust|rusting|wax|waxing|honeycomb|scrape|scraping)\b/.test(q)) return 'oxidation';
  if (/\b(?:strip|stripping|bark)\b/.test(q) && /\b(?:how|can|axe|strip|stripping)\b/.test(q)) return 'stripping';
  if (/\b(?:burn|burns|burning|flammable|fireproof|fire|lava)\b/.test(q)) return 'fire';
  if (/\b(?:gravity|fall|falls|falling|unsupported|support)\b/.test(q)) return 'gravity';
  if (/\b(?:water|waterlogged|waterlogging|harden|hardens|rain|dissolve)\b/.test(q)) return 'water';
  if (/\b(?:silk touch|fortune|mine|mining|break|breaking|harvest|pickaxe|shovel|tool|drops?|loot)\b/.test(q)) return 'mining';
  if (/\b(?:explode|explodes|explosion|explosions|dangerous|danger)\b/.test(q)) return 'danger';
  if (/\b(?:slots?|capacity|inventory|store|storage|hold|holds|put in|insert|accept|accepts)\b/.test(q)) return 'storage';
  if (/\b(?:redstone|power|powered|signal|pulse|pulses|activate|activation|lock|locking)\b/.test(q)) return 'redstone';
  if (/\b(?:use|using|work|works|function|operate|operation|do|does)\b/.test(q)) return 'operation';
  if (/\b(?:where|find|found|locate|obtain|biomes?|depth|deep|height|level)\b/.test(q)) return 'location';
  return undefined;
}
export function blockAnswer(id, q) {
  id=({'minecraft:sugar_cane':'minecraft:reeds','minecraft:glow_berries':'minecraft:cave_vines_body_with_berries'})[id]??id;
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
