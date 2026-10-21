// Generated offline knowledge interface. No network, no Node runtime dependencies.
import knowledge from './knowledge_v62.json' with { type: 'json' };
import aliases from './aliases_v62.json' with { type: 'json' };
import reverse from './reverse_ingredients_v62.json' with { type: 'json' };
const records=knowledge.records;
const normalize=s=>String(s||'').toLowerCase().replace(/minecraft:/g,'').replace(/[_-]/g,' ').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const singular=s=>s.endsWith('ies')?s.slice(0,-3)+'y':s.endsWith('s')&&!s.endsWith('ss')?s.slice(0,-1):s;
const intentRules=[
 ['uses',/\b(uses?|used for)\b|what can i make with/],
 ['recipe',/\b(craft|make|recipe|ingredients|build)\b/],
 ['brewing',/\b(brew|brewing|potion|reagent)\b/],
 ['enchantment',/\b(enchant|enchantment|maximum level|max level)\b/],
 ['drops',/\b(drops?|loot|obtain|find|get)\b/],
 ['breeding',/\b(breed|breeding|baby|tame|taming)\b/],
 ['danger',/\b(lava|fire|drown|water|afraid|scared|attack|hurt|weakness)\b/]
];
const hints={recipe:['recipe','item','block'],uses:['item','block'],brewing:['brewing','item'],enchantment:['enchantment'],drops:['loot_item','entity','item','block'],breeding:['entity'],danger:['entity','block']};
function detectIntent(q){return intentRules.find(([_,rx])=>rx.test(q))?.[0]||'definition'}
function pickTerm(q){
 const stripped=q.replace(/\b(how do i|how to|what is|what are|where do i|where can i|tell me about|can you|please|show me|give me|the|a|an|of|for|to|with|from|recipe|craft|make|ingredients|breed|tame|drops|drop|loot|enchantment|enchant|maximum|max|level|brew|brewing|potion|what|which|does|do|is|are|can|it|in|on|at|about|scared|afraid|lava|fire|drown|water|attack|hurt|weakness|used|uses|use|get|find|what can i make with)\b/g,' ').replace(/\s+/g,' ').trim();
 const candidates=[stripped,q].filter(Boolean);
 for(const c of candidates){if(aliases[c])return c;const s=singular(c);if(aliases[s])return s}
 const keys=Object.keys(aliases).filter(k=>k.length>=3);
 const found=keys.filter(k=>q===k||q.startsWith(k+' ')||q.endsWith(' '+k)||q.includes(' '+k+' '));
 found.sort((a,b)=>b.length-a.length||a.localeCompare(b));
 return found[0]||stripped;
}
function resolve(term,intent){
 const ids=aliases[term]||aliases[singular(term)]||[];
 const valid=ids.filter(id=>records[id]);const priority=hints[intent]||[];
 if(!valid.length)return {status:'unknown',matches:[]};
 const scored=valid.map(id=>({id,record:records[id],rank:priority.indexOf(records[id].kind)}));
 const eligible=scored.filter(x=>x.rank>=0);
 if(eligible.length){const min=Math.min(...eligible.map(x=>x.rank));const best=eligible.filter(x=>x.rank===min);return best.length===1?{status:'found',record:best[0].record,matches:valid}:{status:'ambiguous',matches:best.map(x=>x.id)}}
 return valid.length===1?{status:'found',record:records[valid[0]],matches:valid}:{status:'ambiguous',matches:valid};
}
export function ask(question){
 const q=normalize(question),intent=detectIntent(q),term=pickTerm(q),found=resolve(term,intent);
 if(found.status!=='found')return {status:found.status,intent,term,possible_ids:found.matches,message:found.status==='unknown'?'I do not have verified information for that yet.':'Which one do you mean?'};
 const r=found.record,base={status:'found',intent,term,record_id:r.id,kind:r.kind,source:r.source,verification:r.verification};
 if(intent==='recipe'){
  const recipe=r.kind==='recipe'?r:records[(r.recipes||[])[0]];
  if(!recipe||!recipe.variants?.length)return {...base,status:'not_documented',message:'No crafting recipe is documented in these samples. That does not prove the item is unobtainable.'};
  return {...base,recipe_id:recipe.id,variants:recipe.variants,message:'Recipe variants found in the supplied Bedrock samples.'};
 }
 if(intent==='uses'){
  const id=r.minecraft_id;const matches=reverse[id]||[];
  return {...base,uses:matches,status:matches.length?'found':'not_documented',message:matches.length?'Recipes using this ingredient were found.':'No recipe uses found in the supplied samples.'};
 }
 if(intent==='enchantment')return r.kind==='enchantment'?{...base,effect:r.effect,maximum_level:r.maximum_level,equipment:r.equipment,conflicts:r.conflicts,warning:'Verify compatibility and exact levels in current Bedrock.'}:{...base,status:'not_documented',message:'No specific enchantment matched.'};
 if(intent==='brewing')return r.kind==='brewing'?{...base,brewing:r.brewing}:{...base,status:'not_documented',message:'Specify a potion or brewing transformation.'};
 if(intent==='breeding'||intent==='danger')return r.kind==='entity'?{...base,facts:r.facts||{},conditional:r.conditional??null,warning:'Component evidence may be conditional; it is not a guaranteed gameplay outcome.'}:{...base,status:'not_documented',message:'No mob behavior profile found.'};
 if(intent==='drops')return {...base,possible_sources:r.possible_sources||[],warning:'Possible loot entries are not guaranteed drops or locations.'};
 return {...base,name:r.name,technical_profile:r.technical_profile||null};
}
export const stats=Object.freeze({records:Object.keys(records).length,aliases:Object.keys(aliases).length,ingredientKeys:Object.keys(reverse).length});
