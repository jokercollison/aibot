import bundle from '../data/catalog.json' with { type: 'json' };
import aliases from '../data/aliases_v64.json' with { type: 'json' };
import facts from '../data/facts.json' with { type: 'json' };
import official from '../data/official_recipes.json' with { type: 'json' };
import banter from '../data/banter.json' with { type: 'json' };

const records = bundle.records;
const clean = s => String(s ?? '').toLowerCase().replace(/minecraft:/g, '').replace(/[_-]/g, ' ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const label = s => clean(s).replace(/\b\w/g, c => c.toUpperCase());
const unknown = "I don't have enough verified information to answer that yet.";
const evidenceNote = 'From the supplied sample data; not yet checked in-game.';
const aliasIndex = new Map(Object.entries(aliases));
const maxAliasWords = Math.max(...Object.keys(aliases).map(a => a.split(' ').length));
function subjects(text) {
  const words = clean(text).split(' '), found = [];
  for (let i = 0; i < words.length; i++) {
    for (let size = Math.min(maxAliasWords, words.length - i); size > 0; size--) {
      const term = words.slice(i, i + size).join(' ');
      const singular = term.endsWith('ies') ? term.slice(0, -3) + 'y' : term.endsWith('s') ? term.slice(0, -1) : term;
      const ids = aliasIndex.get(term) ?? aliasIndex.get(singular) ?? [];
      for (const id of ids) if (records[id]) found.push({record: records[id], size, start: i});
    }
  }
  return found.sort((a,b) => b.size - a.size || a.start - b.start);
}
const allRecipes = Object.values(official).flat();
const byOutput = new Map();
const uses = new Map();
const ingredientName = i => typeof i === 'string' ? label(i) : i.item ? label(i.item) : i.tag ? `any item in the ${i.tag} tag` : 'unresolved ingredient';
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
function recipeText(record) {
  const recipes = byOutput.get(record.minecraft_id) ?? [];
  if (!recipes.length) return {status:'unknown',answer:'I do not have a confirmed recipe for that. This does not mean it is unobtainable.'};
  const lines = recipes.slice(0,4).map(r => {
    const d = r.definition;
    let text = `${record.name}: ${r.type.replace('minecraft:recipe_', '')}. Station: ${(d.tags ?? []).join(', ') || 'not specified'}.`;
    if (d.pattern) {
      const counts = {};
      for (const row of d.pattern) for (const c of row) if (c !== ' ') counts[c] = (counts[c] ?? 0) + 1;
      text += ' Ingredients: ' + Object.entries(d.key).map(([symbol,i]) => `${counts[symbol] ?? 0} × ${ingredientName(i)} (${symbol})`).join(', ') + '.';
      text += ' Grid rows, top to bottom: ' + d.pattern.map(row => `[${row.replace(/ /g,'·')}]`).join(' / ') + '. · means empty.';
    } else if (d.ingredients) text += ' Ingredients: ' + d.ingredients.map(i => `${i.count ?? 1} × ${ingredientName(i)}`).join(', ') + '.';
    else if (d.input) text += ` Input: ${ingredientName(d.input)}.`;
    else text += ' Exact ingredient instructions for this processing method are not implemented yet.';
    const result = d.result ?? {item:d.output};
    if (result && !Array.isArray(result)) text += ` Output: ${result.count ?? 1} × ${label(result.item ?? record.name)}.`;
    if (d.unlock) text += ' Recipe-book unlock conditions may apply.';
    return text;
  });
  return {status:'conditional',answer:lines.join('\n') + '\n' + evidenceNote, sources:recipes.map(r=>r.source)};
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
      const intent = /\b(what can i (make|craft)|uses for|can i make with)\b/.test(q) ? 'uses' :
        /\b(scared|scares|afraid|fear|avoid)\b/.test(q) ? 'fear' :
        /\b(breed|breeding|mate)\b/.test(q) ? 'breed' :
        /\b(dangerous|danger|explode)\b/.test(q) ? 'danger' :
        /\b(make|craft|recipe|ingredients|build)\b/.test(q) ? 'recipe' :
        /\b(where|find|obtain|spawn|drops|drop|get)\b/.test(q) ? 'acquisition' :
        /\b(drown|underwater|lava|fire|sunlight|eat|tame|kill|health|attack|damage)\b/.test(q) ? 'mechanic' : 'describe';
      if (intent === 'uses' && /\bwith iron$/.test(q)) return {status:'ambiguous',answer:'Do you mean iron ingots, raw iron, or iron blocks? Please include the material in your question.'};
      const matches = subjects(q).filter(x => intent === 'recipe' || intent === 'uses' ? ['item','block'].includes(x.record.kind) : ['entity','block','item','enchantment','biome'].includes(x.record.kind));
      let candidates = matches.length ? matches.filter(m => m.size === matches[0].size && m.start === matches[0].start).map(m => m.record) : [];
      candidates = [...new Map(candidates.map(r => [r.id,r])).values()];
      if (!candidates.length && /\b(it|they|them|its)\b/.test(q) && previous) candidates = [previous];
      if (!candidates.length) return {status: 'unknown', answer: unknown};
      // Block/item pairs with the same Minecraft id are the same subject for basic lookup.
      const ids = new Set(candidates.map(r => r.minecraft_id));
      if (ids.size > 1 || new Set(candidates.map(r => r.kind)).has('entity') && candidates.length > 1) {
        return {status: 'ambiguous', answer: 'Which do you mean: ' + candidates.map(r => `${r.name} (${r.kind})`).join(', ') + '?'};
      }
      const r = candidates.find(r => r.recipes?.length) ?? candidates[0];
      previous = r;
      if (intent === 'recipe') return {...recipeText(r), subject: r.minecraft_id};
      if (intent === 'uses') {
        const results = [...(uses.get(r.minecraft_id) ?? [])];
        return {status: results.length ? 'conditional' : 'unknown', answer: results.length ? `Some recipes using ${r.name}: ${results.slice(0,12).map(label).join(', ')}. This is a partial list. ${evidenceNote}` : unknown};
      }
      const f = facts[r.minecraft_id]?.[intent];
      if (f) return {status: f.status, answer: f.text + '\n' + evidenceNote, sources: [f.source]};
      if (intent !== 'describe') return {status: 'unknown', answer: unknown};
      if (r.kind === 'enchantment' && r.effect) return {status: 'conditional', answer: `${r.name}: ${r.effect}. Maximum level: ${r.maximum_level ?? 'not established'}. Equipment: ${(r.equipment ?? []).join(', ') || 'not established'}. ${evidenceNote}`, sources: [r.source]};
      return {status: 'partial', answer: `${r.name} (${r.minecraft_id}) is listed as ${r.kind} in the supplied registry. I don't yet have a verified general explanation. Try a crafting question or a specific mob behavior.`, sources: [r.source]};
    }
  };
}
export const knowledgeStats = {records: bundle.originalRecordCount, recipes: allRecipes.length};
