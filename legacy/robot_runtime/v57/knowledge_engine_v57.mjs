// Minecraft AI offline query router, version 57. No network, no game APIs.
// Runtime data is supplied by the pack build; never rely on Node-only APIs.
export function normalize(s) {return String(s??'').toLowerCase().replace(/minecraft:/g,'').replace(/[_-]/g,' ').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();}
const stop=new Set(['a','an','the','some','any','please','me','you','i','can','could','would','tell','show','explain','what','whats','what is','how','do','does','is','are','to','of','about','get','make','craft','find','where','in','minecraft','bedrock','recipe','for','my','with','use','used','using','give']);
function tokens(s){return normalize(s).split(' ').filter(Boolean).filter(x=>!stop.has(x));}
export function classify(q){
 const s=normalize(q);
 if(/\b(joke|funny|laugh|hello|hi|thank you|thanks)\b/.test(s))return {intent:'conversation',category:null};
 if(/\b(brew|brewing|potion|reagent)\b/.test(s))return {intent:'brewing',category:'brewing'};
 if(/\b(enchant|enchantment|enchanted|maximum level|max level)\b/.test(s))return {intent:'enchantment',category:'enchantment'};
 if(/\b(drop|drops|loot|chest|where can i find|where do i find)\b/.test(s))return {intent:'sources',category:null};
 if(/\b(breed|tame|scared|afraid|drown|lava|burn|attacks|attack|health|mob|creeper|zombie|cow|wolf|allay)\b/.test(s))return {intent:'mob',category:'entity'};
 if(/\b(biome|climate|temperature)\b/.test(s))return {intent:'biome',category:'biome'};
 if(/\b(craft|crafting|recipe|make|ingredients|smelt|smithing)\b/.test(s))return {intent:'recipe',category:'recipe'};
 if(/\b(block|flammable|mine|mining|redstone)\b/.test(s))return {intent:'block',category:'block'};
 return {intent:'general',category:null};
}
export function findEntities(q,catalog,aliasIndex,category=null){
 const raw=normalize(q), words=tokens(q);
 const matches=new Map();
 for(const [term,ids] of Object.entries(aliasIndex)){
  if(!term || term.length<3)continue;
  // Only match whole words, avoiding 'cow' in 'cowboy'.
  const hit=raw===term||raw.startsWith(term+' ')||raw.endsWith(' '+term)||raw.includes(' '+term+' ');
  if(!hit)continue;
  for(const id of ids){const rec=catalog[id];if(!rec||(category&&rec.category!==category))continue;
   const score=term.split(' ').length*10+term.length+(raw===term?50:0);
   if(score>(matches.get(id)??0))matches.set(id,score);
  }
 }
 // For exact standalone terms, the alias index is authoritative.
 for(const id of aliasIndex[raw]??[]){const r=catalog[id];if(r&&(!category||r.category===category))matches.set(id,Math.max(matches.get(id)??0,1000));}
 return [...matches].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(([id,score])=>({record:catalog[id],score}));
}
function fmtItem(i){if(typeof i==='string')return normalize(i);if(!i)return 'unknown ingredient';if(Array.isArray(i))return i.map(fmtItem).join(' or ');if(i.item)return normalize(i.item);if(i.tag)return 'tag: '+normalize(i.tag);return 'unspecified ingredient';}
function fmtRecipe(r){const variants=r.data.variants??[];if(!variants.length)return 'Recipe details unavailable.';
 const v=variants[0],method=v.method??'unknown',out=[];
 if(method==='shaped'&&Array.isArray(v.pattern)){
  out.push('Crafting grid:');for(const row of v.pattern)out.push(row);
  out.push('Key: '+Object.entries(v.key??{}).map(([k,i])=>k+' = '+fmtItem(i)).join('; '));
 }else if(Array.isArray(v.ingredients)&&v.ingredients.length){out.push('Ingredients: '+v.ingredients.map(fmtItem).join(', '));}
 else if(v.input||v.reagent){out.push('Input: '+fmtItem(v.input)+'; reagent: '+fmtItem(v.reagent));}
 else out.push('Recipe details need review.');
 out.push('Method: '+method);if(variants.length>1)out.push(variants.length+' recipe variations available.');return out.join('\n');}
function fmtEntity(r,q){const facts=r.data.facts??{};const s=normalize(q);
 const topic=/\b(drown|breath|underwater|water)\b/.test(s)?'breathing':/\b(lava|fire|burn)\b/.test(s)?'fire_lava':/\b(scared|afraid|fear|run away|avoid)\b/.test(s)?'fear':/\b(breed|baby)\b/.test(s)?'breeding':/\b(tame)\b/.test(s)?'taming':/\b(attack|fight|damage|combat)\b/.test(s)?'combat':null;
 if(topic){const entries=facts[topic]??[];if(!entries.length)return {status:'unverified',text:'I have no verified '+topic+' behavior for '+r.label+'.'};
  return {status:'evidence',text:r.label+' has '+entries.length+' '+topic+' component record(s). This is technical evidence, not a confirmed gameplay conclusion.',details:entries.slice(0,5).map(x=>({component:x.component,scope:x.scope,value:x.value}))};}
 return {status:'found',text:r.label+' has entity component data. Ask about breathing, fire, fear, breeding, taming, or combat.',topics:Object.keys(facts)};
}
function fmtRecord(r,q){const d=r.data??{};
 if(r.category==='recipe')return {status:'found',text:r.label+'\n'+fmtRecipe(r)};
 if(r.category==='entity')return fmtEntity(r,q);
 if(r.category==='enchantment')return {status:'found',text:r.label+': '+(d.effect_summary??'Effect not documented')+'. Max level: '+(d.maximum_level??'unknown')+'. Compatibility: '+(d.equipment_family??[]).join(', ')+'.',note:d.verification??'Not tested in game'};
 if(r.category==='brewing')return {status:'found',text:'Brew '+fmtItem(d.input)+' with '+fmtItem(d.reagent)+' to get '+fmtItem(d.output)+'.'};
 if(r.category==='loot_item')return {status:'possible',text:r.label+' appears in '+(d.possible_sources??[]).length+' loot-table entries. These are possible sources, not guaranteed drops.',sources:(d.possible_sources??[]).slice(0,8).map(x=>x.table)};
 if(r.category==='biome')return {status:'found',text:r.label+' biome. Tags: '+(d.tags??[]).join(', ')+'.',note:'Sample definition does not prove current generation locations.'};
 if(r.category==='block')return {status:'found',text:r.label+' block. Components: '+(d.component_names??[]).join(', ')+'.',note:'Component list does not establish all engine-level behavior.'};
 if(r.category==='item')return {status:'found',text:r.label+' item. Components: '+(d.component_names??[]).join(', ')+'.'};
 return {status:'unverified',text:'No player-ready explanation yet.'};}
export function answer(question,catalog,aliasIndex){
 const intent=classify(question);if(intent.intent==='conversation')return {status:'conversation',intent:intent.intent,text:'Conversation should be handled by the separate banter system.'};
 const preferred=intent.category;
 let matches=findEntities(question,catalog,aliasIndex,preferred);
 if(!matches.length)matches=findEntities(question,catalog,aliasIndex,null);
 if(!matches.length)return {status:'unknown',intent:intent.intent,text:'I do not have that information verified yet.'};
 const top=matches[0].score,close=matches.filter(x=>x.score===top);
 if(close.length>1)return {status:'ambiguous',intent:intent.intent,choices:close.slice(0,12).map(x=>({id:x.record.id,category:x.record.category,label:x.record.label}))};
 const record=matches[0].record;
 return {...fmtRecord(record,question),intent:intent.intent,record_id:record.id,source:record.provenance?.source??null};
}
