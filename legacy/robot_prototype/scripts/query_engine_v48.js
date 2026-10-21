'use strict';
// Pure, offline knowledge routing. Source records are never mutated.
const db = require('../knowledge/integrated_v44.json');
const banter = require('../knowledge/banter.json');
const normalize = value => String(value ?? '').toLowerCase().replace(/^minecraft:/, '').replace(/[_-]/g, ' ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const label = value => String(value ?? '').replace(/^minecraft:/, '').replace(/_/g, ' ');
const irregular = {wolves:'wolf', axes:'axe', pickaxes:'pickaxe', leaves:'leaf', potatoes:'potato', berries:'berry', torches:'torch', sheep:'sheep', fish:'fish'};
function singular(w) { return irregular[w] || (w.endsWith('ies') && w.length > 4 ? w.slice(0,-3)+'y' : w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us') && w.length > 3 ? w.slice(0,-1) : w); }
const words = s => normalize(s).split(' ').filter(Boolean).map(singular);
const ignored = new Set('how what where when why which who is are do does can could would i you we me my a an the to of in on for from with about please tell show explain find get obtain craft make create recipe recipes item block mob entity enchant enchantment brewing potion use using minecraft it its them that this'.split(' '));
const names = Object.fromEntries(Object.entries(db).map(([category, records]) => [category, Object.keys(records).map(key => ({key, words:words(key)})).sort((a,b) => b.words.length-a.words.length || b.key.length-a.key.length)]));
function subjects(query, categories) {
 const tokens=words(query).filter(w=>!ignored.has(w));
 const result=[];
 for (const category of categories) for(const candidate of names[category] || []) {
  if(candidate.words.length && candidate.words.every(w=>tokens.includes(w))) result.push({category,key:candidate.key,wordCount:candidate.words.length});
 }
 return result.sort((a,b)=>b.wordCount-a.wordCount || b.key.length-a.key.length);
}
function intent(query) {
 const q=normalize(query);
 if(/\b(joke|funny|make me laugh)\b/.test(q)) return 'joke';
 if(/\b(hello|hi|hey|greetings)\b/.test(q) && q.split(' ').length<=4) return 'greeting';
 if(/\b(thank you|thanks)\b/.test(q)) return 'thanks';
 if(/\b(what can i (make|craft)|what is .* used for|uses? for|make with|craft with)\b/.test(q))return 'ingredient_uses';
 if(/\b(brew|brewing|potion|potions)\b/.test(q))return 'brewing';
 if(/\b(enchant|enchantment|enchantments|max level|maximum level)\b/.test(q))return 'enchantments';
 if(/\b(craft|crafting|recipe|ingredients|make|smelt|smelting|smith|smithing)\b/.test(q))return 'recipes';
 if(/\b(breed|breeding|baby|babies)\b/.test(q))return 'breeding';
 if(/\b(tame|taming|pet)\b/.test(q))return 'taming';
 if(/\b(scared|afraid|fear|avoid|flee)\b/.test(q))return 'avoidance';
 if(/\b(drown|drowning|breathe|breathing|underwater)\b/.test(q))return 'breathing';
 if(/\b(lava|fire|burn|burning)\b/.test(q))return 'fire';
 if(/\b(hostile|friendly|attack|damage|health|fight)\b/.test(q))return 'combat';
 if(/\b(drop|drops|loot|chest|find|where|obtain|location)\b/.test(q))return 'acquisition';
 if(/\b(biome|climate|temperature)\b/.test(q))return 'biomes';
 return 'definition';
}
const relevant={recipes:['recipes'],enchantments:['enchantments'],brewing:['brewing'],breeding:['mobs','profiles'],taming:['mobs','profiles'],avoidance:['mobs','profiles'],breathing:['mobs','profiles'],fire:['mobs','profiles'],combat:['mobs','profiles'],acquisition:['loot','mobs','biomes'],biomes:['biomes'],definition:['mobs','profiles','enchantments','biomes','recipes']};
function ingredient(x) { if(typeof x==='string')return label(x); if(!x)return 'unknown';return label(x.item || x.tag || x.name || 'unknown')+(x.count>1?' x'+x.count:''); }
function recipeText(r) {
 const station=(r.station||[]).map(label).join(', ') || 'appropriate workstation';
 if(r.pattern && r.key){const counts={};for(const row of r.pattern)for(const char of row)if(char!==' ')counts[char]=(counts[char]||0)+1;
  return 'At '+station+', use '+Object.entries(counts).map(([ch,n])=>n+' x '+ingredient(r.key[ch])).join(', ')+'. Grid: '+r.pattern.map(row=>row.replace(/ /g,'·')).join(' / ')+'.';}
 if(r.ingredients){const counts=new Map();for(const item of r.ingredients){const name=ingredient(item);counts.set(name,(counts.get(name)||0)+1);}return 'At '+station+', use '+[...counts].map(([name,n])=>n+' x '+name).join(', ')+'.';}
 if(r.input || r.reagent)return 'At '+station+', use '+ingredient(r.input)+' with '+ingredient(r.reagent)+'.';
 if(r.base || r.addition)return 'At '+station+', combine '+ingredient(r.base)+' and '+ingredient(r.addition)+(r.template?' using '+ingredient(r.template):'')+'.';
 return 'This recipe is indexed but its ingredients require interpretation.';
}
function result(status, category, subject, answer, extra={}) {return {status,category,subject,answer,...extra};}
function answer(query, context={}) {
 const q=normalize(query);if(!q)return result('clarify',null,null,'What would you like to know?');
 const mode=intent(query);
 if(['greeting','joke','thanks'].includes(mode)){
  if(mode==='thanks')return result('conversation','dialogue',null,'You are welcome. My circuits appreciate good manners.');
  const lines=banter[mode==='joke'?'idle':'greeting']||[];const n=((context.dialogueIndex||0)%lines.length+lines.length)%lines.length;
  return result('conversation','dialogue',null,lines[n]||'Beep.',{nextDialogueIndex:n+1});
 }
 if(mode==='ingredient_uses'){
  const rev=require('../knowledge/recipe_ingredient_reverse_v45.json');
  const tokens=words(q).filter(w=>!ignored.has(w));const hit=Object.keys(rev).sort((a,b)=>b.length-a.length).find(k=>words(k).every(w=>tokens.includes(w)));
  if(!hit)return result('unknown_subject','recipes',null,'Which ingredient do you mean?');
  const outputs=[...new Set(rev[hit].map(row=>row[0]))];return result('found','recipes',hit,label(hit)+' is used in '+outputs.length+' indexed recipe outputs. Examples: '+outputs.slice(0,10).map(label).join(', ')+'.',{total:outputs.length,source:'Bedrock Samples recipes'});
 }
 const categories=relevant[mode]||relevant.definition;
 let hits=subjects(query,categories);
 if(!hits.length && context.subject && context.category && categories.includes(context.category) && db[context.category]?.[context.subject])hits=[{category:context.category,key:context.subject}];
 if(!hits.length)return result('unknown_subject',null,null,'I cannot identify that subject in the database yet. Can you name the mob, block, or item?');
 const {category,key}=hits[0];const record=db[category][key];
 if(category==='recipes'){
  const requested=Number.isInteger(context.recipeVariant)?context.recipeVariant:0;
  if(requested<0||requested>=record.length)return result('clarify','recipes',key,'That recipe variant does not exist. Choose 1 through '+record.length+'.');
  const recipe=record[requested];return result('found','recipes',key,label(key)+': '+recipeText(recipe),{variant_count:record.length,variant_number:requested+1,source:recipe.source,output_count:recipe.result?.count||1});
 }
 if(category==='enchantments')return result('reference_pending_verification','enchantments',key,label(key)+': '+(record.effect||'Effect not verified')+'. Maximum level: '+(record.max_level??'unknown')+'. Equipment: '+(record.equipment||[]).join(', ')+'.',{verification:record.level_status||'unverified'});
 if(category==='brewing')return result('found','brewing',key,label(key)+': '+record.slice(0,5).map(r=>ingredient(r.input)+' + '+ingredient(r.reagent)).join('; ')+'.',{variant_count:record.length,source:record[0]?.source});
 if(category==='loot')return result('possible_sources','loot',key,label(key)+' occurs in '+new Set(record.map(x=>x.table)).size+' loot tables, including '+[...new Set(record.map(x=>x.table))].slice(0,4).join(', ')+'. These are possible entries, not guaranteed drops.',{source:'Bedrock Samples loot tables'});
 if(category==='biomes')return result('technical_evidence','biomes',key,label(key)+' is an indexed biome. Tags: '+(record.tags||[]).slice(0,8).join(', ')+'.',{source:record.source});
 if(category==='mobs'){
  const pattern={breeding:/breed/i,taming:/tame/i,avoidance:/avoid|fear|panic/i,breathing:/breath|water/i,fire:/fire|lava/i,combat:/attack|health|famil/i}[mode];
  const found=pattern?record.find(x=>pattern.test(x.topic||'')):record[0];
  if(found)return result('evidence_with_caveat','mobs',key,found.answer,{warning:found.caveat||'Behavior may be conditional.'});
 }
 if(category==='profiles'){
  const pattern={breeding:/breed/,taming:/tame|trust/,avoidance:/avoid|panic|flee/,breathing:/breath|underwater/,fire:/fire|lava|damage_sensor|hurt_on_condition/,combat:/attack|health|type_family/}[mode]||/type_family/;
  const matches=[];for(const [name,value] of Object.entries(record.components||{}))if(pattern.test(name))matches.push({scope:'base',component:name});
  for(const [group,components] of Object.entries(record.component_groups||{}))for(const name of Object.keys(components))if(pattern.test(name))matches.push({scope:'conditional',group,component:name});
  return result(matches.length?'technical_evidence':'insufficient_evidence','profiles',key,matches.length?'I found '+matches.length+' relevant entity components, but their presence alone does not prove a yes/no answer.':'I have no verified answer to that behavior question yet.',{evidence:matches,source:record.source});
 }
 return result('insufficient_evidence',category,key,'I have the subject indexed, but not a verified answer for this question.');
}
module.exports={answer,intent,subjects,recipeText};
