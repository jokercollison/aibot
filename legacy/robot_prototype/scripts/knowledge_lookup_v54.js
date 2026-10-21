// Offline, read-only knowledge lookup. No external services or Minecraft APIs required.
// This module deliberately returns evidence records, not unsupported gameplay claims.
const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '../../database/structured/v54');
const catalog = JSON.parse(fs.readFileSync(path.join(base,'knowledge_catalog.json'),'utf8'));
const aliases = JSON.parse(fs.readFileSync(path.join(base,'alias_index.json'),'utf8'));
const reverse = JSON.parse(fs.readFileSync(path.join(base,'reverse_edges.json'),'utf8'));
function normalize(text) { return String(text||'').toLowerCase().replace(/minecraft:/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,''); }
function find(term, category) {
  const key = normalize(term);
  let ids = aliases[key] || [];
  if (!ids.length && key.endsWith('s')) ids = aliases[key.slice(0,-1)] || [];
  if (category) ids = ids.filter(id => id.startsWith(category+':'));
  return ids.map(id => catalog[id]).filter(Boolean);
}
function recipe(term) { return find(term,'recipe').map(x=>({id:x.id,variants:x.data.variants})); }
function entity(term) { return find(term,'entity'); }
function usages(term) { return reverse['item:'+normalize(term)] || []; }
function answer(question) {
 const q=String(question||'').trim();
 const intent=/\b(recipe|craft|make|build|ingredients|smelt)\b/i.test(q)?'recipe':/\b(brew|potion)\b/i.test(q)?'brewing':/\b(enchant|enchantment)\b/i.test(q)?'enchantment':/\b(mob|creeper|zombie|cow|pig|skeleton|enderman|drown|lava|tame|breed)\b/i.test(q)?'entity':'unknown';
 const terms=q.toLowerCase().replace(/\b(how|do|i|you|what|is|the|a|an|to|craft|make|recipe|for|of|about|tell|me|ingredients|can|where|find|mob|enchant|enchantment|brew|potion)\b/g,' ').trim();
 const hits=find(terms,intent==='unknown'?undefined:intent);
 return {question:q,intent,records:hits,confidence:hits.length===1?'matched_identifier':'unresolved',warning:hits.length===0?'No exact supported lookup. Do not guess.':null};
}
module.exports={normalize,find,recipe,entity,usages,answer};
