import descriptions from '../data/description_runtime.json' with {type:'json'};
import bundle from '../data/catalog.json' with { type: 'json' };
import aliases from '../data/aliases_v64.json' with { type: 'json' };
import facts from '../data/facts.json' with { type: 'json' };
import official from '../data/official_recipes.json' with { type: 'json' };
import banter from '../data/banter.json' with { type: 'json' };

const records = bundle.records;
const clean = s => String(s ?? '').toLowerCase().replace(/minecraft:/g, '').replace(/[_-]/g, ' ').replace(/\bpick axe\b/g, 'pickaxe').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const label = s => clean(s).replace(/\b\w/g, c => c.toUpperCase());
const unknown = "I'm not sure about that yet. Try asking me how to craft something, or ask for a joke.";
const aliasIndex = new Map(Object.entries(aliases));
const byMinecraftId = new Map();
for (const record of Object.values(records)) {
  const id = record.minecraft_id.toLowerCase();
  if (!byMinecraftId.has(id)) byMinecraftId.set(id, []);
  byMinecraftId.get(id).push(record);
}
for (const record of Object.values(records)) {
  for (const term of [clean(record.name),clean(record.minecraft_id)]) {
    aliasIndex.set(term,[...new Set([...(aliasIndex.get(term) ?? []),record.id])]);
  }
}
const maxAliasWords = Math.max(...Object.keys(aliases).map(a => a.split(' ').length));
function subjects(text) {
  const words = clean(text).split(' '), found = [];
  for (let i = 0; i < words.length; i++) {
    for (let size = Math.min(maxAliasWords, words.length - i); size > 0; size--) {
      const term = words.slice(i, i + size).join(' ');
      const singular = term.endsWith('ies') ? term.slice(0, -3) + 'y' : term.endsWith('s') ? term.slice(0, -1) : term;
      const irregular = {wolves:'wolf'};
      const ids = aliasIndex.get(term) ?? aliasIndex.get(irregular[term] ?? singular) ?? aliasIndex.get(term + 's') ?? [];
      for (const id of ids) if (records[id]) found.push({record: records[id], size, start: i});
    }
  }
  return found.sort((a,b) => b.size - a.size || a.start - b.start);
}
const allRecipes = Object.values(official).flat();
const byOutput = new Map();
const uses = new Map();
const ingredientLabels = {
  'minecraft:stone_tool_materials': 'cobblestone',
  'minecraft:stone_crafting_materials': 'cobblestone',
  'minecraft:planks': 'wood planks',
  'minecraft:wooden_slabs': 'wood slabs',
  'minecraft:coals': 'coal or charcoal',
  'minecraft:logs': 'logs',
  'minecraft:wool': 'wool',
  'minecraft:egg': 'eggs',
  'minecraft:mushrooms_for_stew': 'mushrooms',
  'minecraft:metal_nuggets': 'metal nugget',
  'minecraft:soul_fire_base_blocks': 'soul sand or soul soil'
};
const ingredientName = i => typeof i === 'string' ? clean(i) : i.item ? clean(i.item) : i.tag ? ingredientLabels[i.tag] ?? clean(i.tag) : 'an ingredient I still need to check';
const plural = (name, count) => {
  if (count === 1 || /(?:s|wool|wheat|cobblestone|stone|deepslate|bread|sand|soil|coal|charcoal|quartz|glass|ice|sugar|paper|leather|beef|porkchop|mutton|chicken|fish|kelp|dye|redstone|copper|iron|gold|lapis lazuli)$/.test(name) || name.includes(' or ')) return name;
  return name.endsWith('ch') ? name + 'es' : name + 's';
};
const joinList = entries => entries.length < 3 ? entries.join(' and ') : entries.slice(0,-1).join(', ') + ', and ' + entries.at(-1);
function amounts(entries) {
  const grouped = new Map();
  for (const {ingredient, count} of entries) {
    const name = ingredientName(ingredient);
    grouped.set(name, (grouped.get(name) ?? 0) + count);
  }
  return joinList([...grouped].sort((a,b) => b[1]-a[1]).map(([name,count]) => `${count} ${plural(name,count)}`));
}
for (const r of allRecipes) {
  const d = r.definition;
  const output = d.result?.item ?? d.output;
  if (typeof output === 'string') {
    const id = output.includes(':') ? output : 'minecraft:' + output;
    if (!byOutput.has(id)) byOutput.set(id, []);
    byOutput.get(id).push(r);
  }
  const ingredients = [...Object.values(d.key ?? {}), ...(d.ingredients ?? []), ...(d.input ? [d.input] : [])];
  for (const i of ingredients) {
    const value = typeof i === 'string' ? i : i.item;
    if (!value) continue;
    const id = value.includes(':') ? value : 'minecraft:' + value;
    if (!uses.has(id)) uses.set(id, new Set());
    uses.get(id).add(label(output ?? d.description?.identifier ?? 'unknown output'));
  }
}
export function recipeText(record) {
  const recipes = byOutput.get(record.minecraft_id) ?? [];
  if (!recipes.length) return {status:'unknown',answer:`I'm not sure how to craft ${clean(record.name)} yet. You might be able to get it another way.`};
  const lines = recipes.slice(0,4).map(r => {
    const d = r.definition;
    const name = clean(record.name);
    let text;
    if (d.pattern || d.ingredients) {
      let entries;
      if (d.pattern) {
        const counts = {};
        for (const row of d.pattern) for (const c of row) if (c !== ' ') counts[c] = (counts[c] ?? 0) + 1;
        entries = Object.entries(d.key).filter(([symbol]) => counts[symbol]).map(([symbol,i]) => ({ingredient:i,count:counts[symbol] * (i.count ?? 1)}));
      } else entries = d.ingredients.map(i => ({ingredient:i,count:i.count ?? 1}));
      text = `To craft ${name}, you'll need ${amounts(entries)}`;
      text += '.';
    } else if (d.input) {
      const stations = (d.tags ?? []).map(t => ({furnace:'furnace',blast_furnace:'blast furnace',smoker:'smoker',campfire:'campfire',soul_campfire:'soul campfire'}[t])).filter(Boolean);
      text = `To make ${name}, cook ${ingredientName(d.input)}${stations.length ? ' using a ' + stations.join(' or ') : ''}.`;
    } else text = `I know a recipe for ${name}, but I still need to learn how to explain the steps.`;
    return text;
  });
  return {status:'conditional',answer:[...new Set(lines)].join('\n'),sources:recipes.map(r=>r.source)};
}
function followup(record) {
  const name = clean(record.name);
  const topics = facts[record.minecraft_id] ?? {};
  const suggestions = [];
  if (byOutput.has(record.minecraft_id)) suggestions.push('How do I craft it?');
  if (topics.fear) suggestions.push('What scares it?');
  if (topics.danger) suggestions.push('Is it dangerous?');
  if (topics.breed) suggestions.push('How do I breed them?');
  return suggestions.length ? ` You can also ask: ${suggestions.slice(0,2).map(q => '"' + q + '"').join(' or ')}` : '';
}
export function createConversation() {
  let previous;
  return {
    ask(input) {
      const q = clean(input);
      if (!q) return {status: 'clarify', answer: 'What would you like to know about Minecraft?'};
      if (q.length > 240) return {status: 'clarify', answer: 'Please ask a shorter question (up to 240 characters).'};
      if (/^(hi|hello|hey|greetings)$/.test(q)) return {status: 'dialogue', answer: banter.greeting[0]};
      if (/\b(joke|funny)\b/.test(q)) return {status: 'dialogue', answer: banter.idle[0]};
      if (/^(bye|goodbye|see you)$/.test(q)) return {status: 'dialogue', answer: 'Circuits on standby. See you on the next adventure!'};
      const definitionRequest = /^(?:what (?:is|are)|describe|tell me about)\b/.test(q) && !/\b(recipe|craft|make|ingredients|breeding|fear)\b/.test(q);
      const intent = definitionRequest ? 'describe' : /\b(what can i (make|craft)|can i make with)\b/.test(q) ? 'uses' :
        /\b(scared|scares|afraid|fear|avoid)\b/.test(q) ? 'fear' :
        /\b(breed|breeding|mate)\b/.test(q) ? 'breed' :
        /\b(dangerous|danger|explode)\b/.test(q) ? 'danger' :
        /\b(make|craft|recipe|ingredients|build)\b/.test(q) ? 'recipe' :
        /\b(where|find|obtain|spawn|drops|drop|get)\b/.test(q) ? 'acquisition' :
        /\b(what is|what are|tell me about|describe|what does|what do|used for|uses for|how does|how do i use)\b/.test(q) ? 'describe' :
        /\b(drown|underwater|lava|fire|sunlight|eat|tame|kill|health|attack|damage)\b/.test(q) ? 'mechanic' : 'describe';
      if (intent === 'uses' && /\bwith iron$/.test(q)) return {status:'ambiguous',answer:'Do you mean iron ingots, raw iron, or iron blocks? Please include the material in your question.'};
      const matches = subjects(q).filter(x => intent === 'recipe' || intent === 'uses' ? ['item','block'].includes(x.record.kind) : ['entity','block','item','enchantment','biome'].includes(x.record.kind));
      const exact = String(input).toLowerCase().match(/\b(?:(block|item|entity):)?(minecraft:[a-z0-9_]+)\b/);
      let candidates = matches.length ? matches.filter(m => m.size === matches[0].size && m.start === matches[0].start).map(m => m.record) : [];
      if (exact) candidates = (byMinecraftId.get(exact[2]) ?? []).filter(r => !exact[1] || r.kind === exact[1]);
      const kindHint = /\b(?:mob|animal|creature)\b/.test(q) && !/\bmob spawner\b/.test(q) ? 'entity' : /\bblock\b/.test(q) ? 'block' : /\bitem\b/.test(q) ? 'item' : null;
      if (!exact && kindHint && candidates.some(r=>r.kind===kindHint)) candidates=candidates.filter(r=>r.kind===kindHint);
      candidates = [...new Map(candidates.map(r => [r.id,r])).values()];
      if (!candidates.length && /\b(it|they|them|its)\b/.test(q) && previous) candidates = [previous];
      if (!candidates.length) return {status: 'unknown', answer: unknown};
      // Block/item pairs with the same Minecraft id are the same subject for basic lookup.
      const ids = new Set(candidates.map(r => r.minecraft_id));
      if (ids.size > 1) {
        return {status: 'ambiguous', answer: 'Which do you mean: ' + candidates.map(r => `${r.name} (${r.kind})`).join(', ') + '?'};
      }
      if (!exact && candidates.some(r=>r.kind==='entity') && new Set(candidates.map(r=>descriptions[r.id]?.what)).size>1) {
        return {status:'ambiguous',answer:'Do you mean the mob, or the block/item with that name? Please include which one in your question.'};
      }
      const r = candidates.find(r => r.recipes?.length) ?? candidates[0];
      previous = r;
      if (intent === 'recipe') return {...recipeText(r), subject: r.minecraft_id};
      if (intent === 'uses') {
        const results = [...(uses.get(r.minecraft_id) ?? [])];
        return {status: results.length ? 'conditional' : 'unknown', answer: results.length ? `Here are some things you can make with ${clean(r.name)}: ${results.slice(0,12).map(clean).join(', ')}.` : unknown};
      }
      const f = facts[r.minecraft_id]?.[intent];
      if (f) return {status: f.status, answer: f.text, sources: [f.source]};
      if (intent !== 'describe') return {status: 'unknown', answer: unknown};
      if (r.kind === 'enchantment' && r.effect) {
        const equipment = (r.equipment ?? []).map(e => e === 'durable_equipment' ? 'items with durability' : clean(e));
        return {status:'conditional',answer:`${r.name}: ${r.effect.replace(/[.!]+$/,'')}.${r.maximum_level ? ` Its highest level is ${r.maximum_level}.` : ''}${equipment.length ? ` It works on ${joinList(equipment)}.` : ''}`,sources:[r.source]};
      }
      const description = descriptions[r.id];
      if (description) {
        const hint = followup(r);
        return {status:'conditional',answer:description.what + ' ' + description.does + hint,sources:['descriptions:'+r.id],coverage:description.coverage};
      }
      return {status:'partial',answer:`I'm still learning about ${clean(r.name)} and don't have a dependable explanation yet.`,sources:[r.source]};
    }
  };
}
export const knowledgeStats = {records: bundle.originalRecordCount, recipes: allRecipes.length};
