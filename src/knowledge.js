import acquisitionIndex from '../data/acquisition_index.json' with {type:'json'};
import entityKnowledge from '../data/entity_knowledge.json' with {type:'json'};
import locationFacts from '../data/location_facts.json' with {type:'json'};
import descriptions from '../data/description_runtime.json' with {type:'json'};
import bundle from '../data/catalog.json' with { type: 'json' };
import aliases from '../data/aliases_v64.json' with { type: 'json' };
import facts from '../data/facts.json' with { type: 'json' };
import recipeIndex from '../data/recipe_index.json' with { type: 'json' };
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
const byOutput = new Map(Object.entries(recipeIndex.by_output));
const allRecipes = [...byOutput.values()].flat();
const uses = new Map();
const ingredientLabels = {
  'minecraft:stone_tool_materials': 'cobblestone',
  'minecraft:stone_crafting_materials': 'cobblestone',
  'minecraft:planks': 'wooden planks',
  'minecraft:wooden_slabs': 'wooden slabs',
  'minecraft:coals': 'coal or charcoal',
  'minecraft:logs': 'logs',
  'minecraft:wool': 'wool',
  'minecraft:egg': 'egg',
  'minecraft:mushrooms_for_stew': 'mushrooms',
  'minecraft:metal_nuggets': 'metal nugget',
  'minecraft:soul_fire_base_blocks': 'soul sand or soul soil'
};
function display(id) {
  if(id.startsWith('minecraft:potion_type:')) {
    let effect=id.slice('minecraft:potion_type:'.length);
    if(effect==='water') return 'water bottle';
    effect=effect.replace(/^long_/,'extended ').replace(/^strong_/,'strong ').replace('nightvision','night vision');
    return clean(effect)+' potion';
  }
  return clean(id);
}
const ingredientName = i => i.tag ? ingredientLabels[i.tag] ?? clean(i.tag) : display(i.id);
const plural = (name, count) => {
  if (count === 1 || /(?:s|wool|wheat|cobblestone|stone|deepslate|bread|sand|soil|coal|charcoal|quartz|glass|ice|sugar|paper|leather|beef|porkchop|mutton|chicken|fish|kelp|dye|redstone|copper|iron|gold|lapis lazuli)$/.test(name) || name.includes(' or ')) return name;
  return name.endsWith('ch') ? name + 'es' : name + 's';
};
const joinList = entries => entries.length < 3 ? entries.join(' and ') : entries.slice(0,-1).join(', ') + ', and ' + entries.at(-1);
function amounts(entries) {
  const grouped = new Map();
  for (const ingredient of entries) {
    const name = ingredientName(ingredient);
    grouped.set(name, (grouped.get(name) ?? 0) + ingredient.count);
  }
  return joinList([...grouped].sort((a,b) => b[1]-a[1]).map(([name,count]) => `${count} ${plural(name,count)}`));
}
for(const [output,recipes] of byOutput) for(const recipe of recipes) {
  for(const i of recipe.ingredients) {
    if(!i.id) continue;
    if(!uses.has(i.id)) uses.set(i.id,new Set());
    uses.get(i.id).add(display(output));
  }
}
// Create query subjects for source-backed recipe variants not represented as
// separate registry items (for example potion effects and locator maps).
for(const id of byOutput.keys()) {
  if(byMinecraftId.has(id.toLowerCase())) continue;
  const name=display(id),record={id:'recipe_subject:'+id,minecraft_id:id,kind:'item',name,source:'official_recipes'};
  records[record.id]=record;byMinecraftId.set(id.toLowerCase(),[record]);
  for(const term of [name,clean(id),...(id.startsWith('minecraft:potion_type:') ? ['potion of '+name.replace(/ potion$/,'')] : [])]) {
    aliasIndex.set(term,[...new Set([...(aliasIndex.get(term)??[]),record.id])]);
  }
}
function presentationRecipes(recipes) {
  // Only replace a concrete wood choice when an actual generic-planks recipe
  // for the SAME output has the same remaining ingredients and quantities.
  const signature=r=>r.method+'|'+r.ingredients.map(i=>{
    const id=i.tag==='minecraft:planks'||i.id?.endsWith('_planks')?'tag:planks':i.id??'tag:'+i.tag;
    return id+':'+i.count;
  }).sort().join('|');
  const generic=new Set(recipes.filter(r=>r.ingredients.some(i=>i.tag==='minecraft:planks')).map(signature));
  return recipes.filter(r=>!r.ingredients.some(i=>i.id?.endsWith('_planks'))||!generic.has(signature(r)));
}
export function recipeText(record) {
  const recipes=byOutput.get(record.minecraft_id.toLowerCase())??[];
  if(!recipes.length)return {status:'unknown',answer:`I'm not sure how to craft ${clean(record.name)} yet. You might be able to get it another way.`};
  const lines=presentationRecipes(recipes).map(r=>{
    const name=display(record.minecraft_id);
    if(r.method==='shaped'||r.method==='shapeless')return `To craft ${name}, you'll need ${amounts(r.ingredients)}.`;
    if(r.method==='smithing_transform')return `To upgrade to ${name}, you'll need ${amounts(r.ingredients)} at a smithing table.`;
    if(r.method.startsWith('brewing_'))return `To brew ${name}, combine ${amounts(r.ingredients)} in a brewing stand fueled with blaze powder.`;
    if(r.method==='furnace')return `To make ${name}, process ${amounts(r.ingredients)} using ${joinList(r.stations.map(clean))}.`;
    return `I still need to learn the steps for ${name}.`;
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
  let pendingChoice;
  return {
    ask(input) {
      const q = clean(input);
      if (!q) return {status: 'clarify', answer: 'What would you like to know about Minecraft?'};
      if (q.length > 240) return {status: 'clarify', answer: 'Please ask a shorter question (up to 240 characters).'};
      const choice=q.match(/^(?:a |an |the )?(mob|entity|animal|creature|block|item)(?: please)?$/);
      if(pendingChoice && choice) {
        const kind=['mob','entity','animal','creature'].includes(choice[1])?'entity':choice[1];
        if(!pendingChoice.candidates.some(r=>r.kind===kind)) return {status:'clarify',answer:'That was not one of the choices. Please choose one of the options I listed.'};
        const question=pendingChoice.question;pendingChoice=undefined;
        return this.ask(String(question)+' '+(kind==='entity'?'mob':kind));
      }
      if (/^(hi|hello|hey|greetings)$/.test(q)) return {status: 'dialogue', answer: banter.greeting[0]};
      if (/\b(joke|funny)\b/.test(q)) return {status: 'dialogue', answer: banter.idle[0]};
      if (/^(bye|goodbye|see you)$/.test(q)) return {status: 'dialogue', answer: 'Circuits on standby. See you on the next adventure!'};
      const definitionRequest = /^(?:what (?:is|are)|describe|tell me about)\b/.test(q) && !/\b(recipe|craft|make|ingredients|breeding|fear)\b/.test(q);
      const intent = /\b(health|hearts)\b/.test(q) ? 'health' : /\b(tame|taming)\b/.test(q) ? 'taming' : definitionRequest ? 'describe' : /\b(what can i (make|craft)|can i make with)\b/.test(q) ? 'uses' :
        /\b(scared|scares|afraid|fear|avoid)\b/.test(q) ? 'fear' :
        /\b(breed|breeding|mate)\b/.test(q) ? 'breed' :
        /\b(dangerous|danger|explode)\b/.test(q) ? 'danger' :
        /\b(make|craft|recipe|ingredients|build|brew|smelt|cook|upgrade)\b/.test(q) ? 'recipe' :
        /\b(where|find|obtain|spawn|drops|drop|get|deep|depth|height|biome|biomes)\b/.test(q) ? 'acquisition' :
        /\b(what is|what are|tell me about|describe|what does|what do|used for|uses for|how does|how do i use)\b/.test(q) ? 'describe' :
        /\b(drown|underwater|lava|fire|sunlight|eat|tame|kill|health|attack|damage)\b/.test(q) ? 'mechanic' : 'describe';
      if (intent === 'uses' && /\bwith iron$/.test(q)) return {status:'ambiguous',answer:'Do you mean iron ingots, raw iron, or iron blocks? Please include the material in your question.'};
      const matches = subjects(q).filter(x => intent === 'recipe' || intent === 'uses' ? ['item','block'].includes(x.record.kind) : ['entity','block','item','enchantment','biome'].includes(x.record.kind));
      const exact = String(input).toLowerCase().match(/\b(?:(block|item|entity):)?(minecraft:(?:potion_type:)?[a-z0-9_]+)\b/);
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
        pendingChoice={question:input,candidates};
        return {status: 'ambiguous', answer: 'Which do you mean: ' + candidates.map(r => `${r.name} (${r.kind})`).join(', ') + '?'};
      }
      if (!exact && candidates.some(r=>r.kind==='entity') && new Set(candidates.map(r=>descriptions[r.id]?.what)).size>1) {
        pendingChoice={question:input,candidates};
        return {status:'ambiguous',answer:'Do you mean the mob, or the block/item with that name? Please include which one in your question.'};
      }
      const r = candidates.find(r => r.recipes?.length) ?? candidates[0];
      previous = r;
      pendingChoice=undefined;
      if (intent === 'recipe') return {...recipeText(r), subject: r.minecraft_id};
      if (intent === 'uses') {
        const results = [...(uses.get(r.minecraft_id) ?? [])];
        return {status: results.length ? 'conditional' : 'unknown', answer: results.length ? `Here are some things you can make with ${clean(r.name)}: ${results.slice(0,12).map(clean).join(', ')}.` : unknown};
      }
      if(intent==='acquisition') {
        const location=locationFacts[r.minecraft_id]??Object.values(locationFacts).find(f=>f.related_ids?.includes(r.minecraft_id));
        if(location)return {status:'conditional',answer:location.answer,sources:location.reference_urls};
        if(r.kind==='entity'&&/\b(drop|drops|loot)\b/.test(q)) {
          const drops=acquisitionIndex.entities[r.minecraft_id];
          if(drops?.length)return {status:'conditional',answer:`Depending on its form and the loot conditions, ${clean(r.name)} can drop ${joinList([...new Set(drops.flatMap(d=>d.possible_items))].map(display))}. These are possible drops, not a guaranteed list from every kill.`,sources:drops.map(d=>d.source)};
        }
        const entries=acquisitionIndex.items[r.minecraft_id];
        if(entries?.length && r.kind!=='entity') {
          const types=[...new Set(entries.map(e=>e.kind))];
          const options=types.map(t=>t==='chests'?'loot chests':t==='entities'?'certain mob drops':'certain block drops');
          return {status:'conditional',answer:`${clean(r.name)} can appear in ${joinList(options)}. The exact source and chance depend on the location and loot conditions; I do not yet know all of those details.`,sources:entries.map(e=>e.source)};
        }

      }
      const technical=entityKnowledge[r.minecraft_id]?.facts[intent==='breed'?'breeding':intent];
      if(r.kind==='entity'&&technical)return {status:'conditional',answer:technical.answer,sources:[entityKnowledge[r.minecraft_id].source]};
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
