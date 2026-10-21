import graph from '../data/entities/loot_runtime.json' with {type:'json'};
const clean=s=>String(s).replace(/^minecraft:/,'').replaceAll('_',' ');
const range=n=>typeof n==='number'?[n,n]:[n?.min??1,n?.max??n?.min??1];
const span=([a,b])=>a===b?String(a):`${a}–${b}`;
const combine=values=>values.includes(false)?false:values.includes(null)?null:true;
const killers=['wither skeleton','charged creeper','tamed wolf','skeleton','stray','bogged','parched','player','wolf','creeper','zombie','wither','breeze','iron golem'];
const entityId=name=>name==='tamed wolf'?'minecraft:wolf':name==='charged creeper'?'minecraft:creeper':'minecraft:'+name.replaceAll(' ','_');
export function lootContext(q) {
 const c={};
 if(/\bnot (?:a )?baby\b/.test(q))c.baby=false;else if(/\bbab(?:y|ies)\b/.test(q))c.baby=true;else if(/\badults?\b/.test(q))c.baby=false;
 if(/\b(?:not burning|not on fire|without fire|no fire)\b/.test(q))c.fire=false;
 else if(/\b(?:burning|on fire|fire aspect|killed by fire|dies? in lava)\b/.test(q))c.fire=true;
 const level=q.match(/\blooting\s*(iii|ii|iv|i|[0-9]+)\b/);
 if(level)c.looting={i:1,ii:2,iii:3,iv:4}[level[1]]??Number(level[1]);
 else if(/\b(?:without looting|no looting)\b/.test(q))c.looting=0;
 if(c.looting>3)c.invalidLooting=true;
 if(/\b(?:killed by (?:lava|fire|falling|drowning|a cactus)|dies? (?:in lava|from drowning)|environmental kill)\b/.test(q))c.killer='environment';
 for(const k of killers) {
  if(new RegExp(`\\b(?:killed|slain|shot|blown up) by (?:a |an |the |my )?${k}\\b|\\b(?:a |an |the |my )?${k} (?:kills?|killed|slays?|shoots?|blows? up)\\b`).test(q)) {
   c.killer=entityId(k);c.pet=k==='tamed wolf'?true:null;c.charged=k==='charged creeper';break;
  }
 }
 if(/\b(?:i|you|we) (?:kill|killed|slay)\b|\bplayer kill\b/.test(q))c.killer='minecraft:player';
 if(/\b(?:reflect|reflected|return|returned|deflect|deflected)\b.*\bfireball\b|\bwith (?:its |a |the )?fireball\b/.test(q)){c.damager='minecraft:fireball';c.killer='minecraft:player';}
 if(/\briding (?:a |the )?chicken\b|\bchicken jockey\b/.test(q))c.passenger='minecraft:chicken';
 if(/\briding (?:a |the )?zombie horse\b|\bzombie horseman\b/.test(q))c.horseRider=true;
 if(/\b(?:holding|carrying|has) (?:a |the )?poppy\b|\bholding (?:a |the )?flower\b/.test(q))c.flower=true;
 if(/\b(?:no flower|without (?:a )?flower)\b/.test(q))c.flower=false;
 if(/\bsheared\b/.test(q))c.sheared=!/\b(?:not sheared|unsheared)\b/.test(q);
 if(/\bunsheared\b/.test(q))c.sheared=false;
 for(const size of ['small','medium','large'])if(new RegExp('\\b'+size+'\\b').test(q))c.size=size;
 if(/\bsaddled\b/.test(q))c.saddled=!/\bunsaddled\b/.test(q);
 if(/\bunsaddled\b/.test(q))c.saddled=false;
 if(/\bcaptain\b/.test(q))c.captain=true;
 if(/\b(?:in a raid|during a raid|raid drops|raid loot)\b/.test(q))c.raid=true;
 for(const d of ['peaceful','easy','normal','hard'])if(new RegExp('\\bon '+d+'\\b|\\b'+d+' difficulty\\b').test(q))c.difficulty=d;
 return c;
}
function condition(rule,c) {
 switch(rule.condition) {
  case 'killed_by_player':return c.killer===undefined?null:c.killer==='minecraft:player';
  case 'killed_by_player_or_pets':return c.killer===undefined?null:c.killer==='minecraft:player'||c.killer==='minecraft:wolf'&&c.pet===true?true:c.killer==='minecraft:wolf'&&c.pet===null?null:false;
  case 'killed_by_entity':return c.killer===undefined?null:c.killer===rule.entity_type;
  case 'damaged_by_entity':return c.damager===undefined?null:c.damager===rule.entity_type;
  case 'passenger_of_entity':return c.passenger===undefined?null:c.passenger===rule.entity_type;
  case 'is_baby':return c.baby??null;
  case 'entity_properties':return rule.entity==='this'&&Object.keys(rule.properties??{}).every(k=>k==='on_fire') ? c.fire===undefined?null:c.fire===rule.properties.on_fire:null;
  case 'bool_property':return rule.domain==='minecraft:has_flower'?c.flower===undefined?null:c.flower===rule.value:null;
  case 'random_chance':case 'random_chance_with_looting':case 'random_difficulty_chance':return true;
  default:return null;
 }
}
const gate=(rules,c)=>combine((rules??[]).map(r=>condition(r,c)));
function ruleText(r,c) {
 switch(r.condition) {
  case 'killed_by_player':return 'a player kill';
  case 'killed_by_player_or_pets':return 'a player or tamed-wolf kill';
  case 'killed_by_entity':return `killed by ${clean(r.entity_type)}`;
  case 'damaged_by_entity':return `damage from ${clean(r.entity_type)}`;
  case 'passenger_of_entity':return `riding ${clean(r.entity_type)}`;
  case 'is_baby':return 'a baby';
  case 'entity_properties':return r.entity==='this'&&'on_fire' in (r.properties??{})?r.properties.on_fire?'burning':'not burning':'another special condition';
  case 'bool_property':return r.domain==='minecraft:has_flower'?'holding a poppy':'another special condition';
  case 'has_mark_variant':return 'a particular variant';
  default:return r.condition?.startsWith('random_')?null:'another special condition';
 }
}
function chance(r,c) {
 if(r.condition==='random_chance')return r.chance;
 if(r.condition==='random_chance_with_looting'&&c.looting!==undefined)return Math.min(1,Math.max(0,r.chance+r.looting_multiplier*c.looting));
 if(r.condition==='random_difficulty_chance'&&c.difficulty)return r[c.difficulty]??r.default_chance;
 return null;
}
const NAMES={fish:'raw cod',cooked_fish:'cooked cod',salmon:'raw salmon',clownfish:'tropical fish',beef:'raw beef',porkchop:'raw porkchop',muttonRaw:'raw mutton',muttonCooked:'cooked mutton',chicken:'raw chicken',rabbit:'raw rabbit',slime_ball:'slimeball',record_13:'music disc 13',record_cat:'music disc Cat'};
const COOKED={fish:'cooked cod',salmon:'cooked salmon',beef:'steak',porkchop:'cooked porkchop',muttonRaw:'cooked mutton',chicken:'cooked chicken',rabbit:'cooked rabbit'};
function outcome(entry,c) {
 if(entry.type==='empty')return 'nothing';
 const id=entry.name.replace(/^minecraft:/,'');let name=NAMES[id]??clean(entry.name),count=[1,1],extra=[];
 if(id.startsWith('record_')||id.startsWith('music_disc_'))name='music disc '+id.replace(/^(record_|music_disc_)/,'').replaceAll('_',' ');
 for(const f of entry.functions??[]) {
  const allowed=gate(f.conditions,c);if(allowed===false)continue;
  switch(f.function) {
   case 'set_count':case 'minecraft:set_count':if(allowed===null)extra.push('quantity has another condition');else count=range(f.count);break;
   case 'looting_enchant':
    if(c.looting===undefined)extra.push('Looting can increase the amount');
    else if(f.limit!==undefined)extra.push('Looting has a capped amount');
    else {const n=range(f.count);count=[count[0]+n[0]*c.looting,count[1]+n[1]*c.looting];}break;
   case 'furnace_smelt':if(COOKED[id]){if(allowed===true)name=COOKED[id];else extra.push(`${COOKED[id]} instead if burning`);}break;
   case 'minecraft:set_potion':name='arrow of '+f.id;break;
   case 'set_data':if(id==='skull')name=['skeleton skull','wither skeleton skull','zombie head','player head','creeper head','dragon head','piglin head'][f.data]??'a head';else extra.push('a particular item variant');break;
   case 'minecraft:set_data_from_color_index':extra.push('matching its color');break;
   case 'set_ominous_bottle_amplifier':extra.push('Bad Omen level '+span(range(f.amplifier).map(n=>n+1)));break;
   case 'enchant_random_gear':case 'enchant_with_levels':extra.push('enchantments can vary');break;
   case 'set_damage':extra.push('durability can vary');break;
   default:extra.push('another special modifier');
  }
 }
 return span(count)+' '+name+(extra.length?' ('+[...new Set(extra)].join('; ')+')':'');
}
function scopeState(scope,c) {
 const values=[];
 if(/adult/.test(scope)&&c.baby!==undefined)values.push(!c.baby);
 if(/baby/.test(scope)&&c.baby!==undefined)values.push(c.baby);
 if(/slime_(small|medium|large)/.test(scope)&&c.size)values.push(scope.endsWith('_'+c.size));
 if(/scale_(small|normal|large)/.test(scope)&&c.size)values.push(scope.endsWith('_'+(c.size==='medium'?'normal':c.size)));
 if(/loot_sheared|loot_wooly/.test(scope)&&c.sheared!==undefined)values.push(scope.endsWith('sheared')===c.sheared);
 if(/saddled/.test(scope)&&c.saddled!==undefined)values.push(c.saddled);
 if(/captain/.test(scope)&&c.captain!==undefined)values.push(c.captain);
 if(/raid_configuration/.test(scope)&&c.raid!==undefined)values.push(c.raid);
 if(/zombie_rider|husk_rider/.test(scope)&&c.horseRider!==undefined)values.push(c.horseRider);
 if(/zombie_jockey/.test(scope)&&c.passenger==='minecraft:chicken')values.push(true);
 return values.length?combine(values):null;
}
function scopeText(scope) {
 if(scope==='base')return '';
 if(/loot_sheared/.test(scope))return 'When sheared';if(/loot_wooly/.test(scope))return 'When not sheared';
 if(/adult/.test(scope))return 'For adults';if(/slime_small/.test(scope))return 'For small ones';if(/slime_medium/.test(scope))return 'For medium ones';if(/slime_large/.test(scope))return 'For large ones';
 if(/scale_large/.test(scope))return 'For large fish';if(/scale_normal/.test(scope))return 'For medium fish';if(/scale_small/.test(scope))return 'For small fish';
 if(/captain/.test(scope))return 'For a captain';if(/raid_configuration/.test(scope))return 'During a raid';if(/saddled/.test(scope))return 'When saddled';
 if(/rider/.test(scope))return 'For the mounted form';if(/jockey/.test(scope))return 'For the jockey form';
 if(/default/.test(scope))return 'For the ordinary form';return 'For a particular form';
}
export function evaluateLoot(id,c) {
 const profile=graph.entities[id];if(!profile?.tables.length)return {profile,branches:[],missing:[],inapplicable:false};
 const available=profile.tables.filter(t=>scopeState(t.scope,c)!==false);
 const specific=available.filter(t=>scopeState(t.scope,c)===true);
 const nonAge=specific.filter(t=>!/adult|baby/.test(t.scope));
 const selected=nonAge.length?nonAge:specific.length?specific:available;
 const branches=[],missing=[];
 function visit(table,scope,inherited=[],trail=[]) {
  if(trail.includes(table)){missing.push(table);return;}
  const raw=graph.tables[table];if(!raw){missing.push(table);return;}
  for(const [index,pool] of (raw.pools??[]).entries()) {
   const rules=[...inherited,...pool.conditions??[]];if(gate(rules,c)===false)continue;
   const items=[];
   for(const entry of pool.entries??[]) {
    if(gate(entry.conditions,c)===false)continue;
    if(entry.type==='loot_table')visit(entry.name.endsWith('.json')?entry.name:entry.name+'.json',scope,[...rules,...entry.conditions??[]], [...trail,table]);
    else if(entry.type==='item'||entry.type==='empty')items.push({entry,condition:gate(entry.conditions,c)});
   }
   if(items.length)branches.push({table,index,scope,rules,rolls:pool.rolls??1,items});
  }
 }
 for(const link of selected)visit(link.table,link.scope);
 return {profile,branches,missing:[...new Set(missing)],inapplicable:available.length===0};
}
const headDrops={'minecraft:creeper':'creeper head','minecraft:zombie':'zombie head','minecraft:skeleton':'skeleton skull','minecraft:wither_skeleton':'wither skeleton skull','minecraft:piglin':'piglin head'};
export function conditionalLootAnswer(id,q,fallback) {
 const c=lootContext(q);if(!Object.keys(c).length)return null;
 if(c.invalidLooting)return {status:'unknown',answer:'Normal Survival Looting levels are I, II and III. Which level should I use?',subject:id,topic:'drops'};
 const blocked=graph.withheld.find(r=>r.subject===id&&r.killer===c.killer);
 if(blocked)return {status:'unknown',answer:"I'm not sure about that particular killer's special drop yet. Ask about a player, skeleton, stray or bogged kill instead.",subject:id,topic:'drops'};
 const result=evaluateLoot(id,c);
 if(c.charged&&headDrops[id]&&(!result.profile?.tables.length||result.missing.length))return {status:'conditional',answer:`A charged-creeper kill can drop a ${headDrops[id]}. Held items and equipment have separate drop rules.`,subject:id,topic:'drops',sources:fallback?.sources??[]};
 if(!result.profile?.tables.length)return null;
 if(result.missing.length)return null; // Curated answers may cover engine-only drops.
 if(result.inapplicable)return {status:'unknown',answer:"The item drops I know for this creature apply to a different age or form. I don't have a separate drop list for this one yet.",subject:id,topic:'drops',sources:[result.profile.source]};
 const lines=[];
 if(c.charged&&headDrops[id])lines.push(`A charged-creeper kill can drop a ${headDrops[id]}.`);
 for(const branch of result.branches) {
  if(graph.withheld.some(w=>w.subject===id&&branch.rules.some(r=>r.condition==='killed_by_entity'&&r.entity_type===w.killer)))continue;
  const conditions=[scopeText(branch.scope),...branch.rules.map(r=>ruleText(r,c))].filter(Boolean);
  const chances=branch.rules.map(r=>chance(r,c)).filter(n=>n!==null);
  if(chances.includes(0))continue;
  const probabilistic=branch.rules.filter(r=>r.condition?.startsWith('random_'));
  const chanceText=chances.length===probabilistic.length&&chances.length ? ` ${Number((chances.reduce((a,b)=>a*b,1)*100).toFixed(4))}% chance when those conditions are met.` : probabilistic.length?' The chance also depends on Looting or difficulty.':'';
  const names=branch.items.map(({entry})=>outcome(entry,c));
  const discs=branch.items.every(({entry})=>/^minecraft:(?:record_|music_disc_)/.test(entry.name??''));
  const choice=discs&&names.length>2?'one music disc from the eligible selection':names.length===1?names[0]:'one of: '+names.join(', ');
  const rolls=range(branch.rolls);const repeated=rolls[1]>1?` The choice repeats ${span(rolls)} times; totals can differ.`:'';
  const entryUnknown=branch.items.some(i=>i.condition===null)?' Some choices have additional conditions.':'';
  lines.push((conditions.length?[...new Set(conditions)].join('; ')+': ':'')+choice+'.'+chanceText+repeated+entryUnknown);
 }
 if(!lines.length)return {status:'conditional',answer:'That kill does not meet the conditions for the ordinary item drops I know. Equipment and other special drops can have separate rules.',subject:id,topic:'drops',sources:[result.profile.source]};
 return {status:'conditional',answer:[...new Set(lines)].join('\n')+'\nThese are possible drops under those conditions; equipment and other special drops can have separate rules.',subject:id,topic:'drops',sources:[result.profile.source],coverage:'conditional_table_graph'};
}
