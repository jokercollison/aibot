// Version 45: deterministic offline resolver, no network, no Minecraft runtime dependency.
'use strict';
const db=require('../knowledge/integrated_v44.json');
const reverse=require('../knowledge/recipe_ingredient_reverse_v45.json');
const norm=s=>String(s||'').toLowerCase().replace(/minecraft:/g,'').replace(/[_-]/g,' ').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const pretty=s=>String(s||'').replace(/^minecraft:/,'').replace(/_/g,' ');
const irregular={wolves:'wolf',sheep:'sheep',fish:'fish',mice:'mouse',leaves:'leaf',potatoes:'potato',tomatoes:'tomato',bodies:'body',axes:'axe',pickaxes:'pickaxe'};
const singular=s=>irregular[s]||((s.endsWith('ies')&&s.length>4)?s.slice(0,-3)+'y':(s.endsWith('s')&&!s.endsWith('ss')&&!s.endsWith('us')&&s.length>3)?s.slice(0,-1):s);
const token=s=>norm(s).split(' ').filter(Boolean).map(singular);
const stop=new Set('a an the i me my you your do does is are can could would please how what which where why tell show give about of to for with in on minecraft item block mob make craft crafting recipe recipes get find locate obtain want need some any it its there this that them have has'.split(' '));
const catalog={};for(const c of Object.keys(db)){catalog[c]=Object.keys(db[c]).map(k=>({key:k,words:token(k)})).sort((a,b)=>b.words.length-a.words.length||b.key.length-a.key.length);}
function find(q,cat){let w=token(q).filter(x=>!stop.has(x));return (catalog[cat]||[]).find(e=>e.words.every(x=>w.includes(x)))?.key||null;}
function classify(q){let n=norm(q);
 if(/\b(what can i (craft|make)|uses? for|used for|craft with|make with)\b/.test(n))return 'ingredient_uses';
 if(/\b(brew|brewing|potion|potions)\b/.test(n))return 'brewing';
 if(/\b(enchant|enchantment|enchantments|maximum level|max level)\b/.test(n))return 'enchantments';
 if(/\b(craft|crafting|recipe|ingredients|make|smelt|cook|smith)\b/.test(n))return 'recipes';
 if(/\b(breed|breeding|baby|babies)\b/.test(n))return 'breeding';
 if(/\b(tame|taming|pet)\b/.test(n))return 'taming';
 if(/\b(afraid|scared|avoid|flee|fear)\b/.test(n))return 'avoidance';
 if(/\b(drown|drowning|underwater|breathe|breathing)\b/.test(n))return 'breathing';
 if(/\b(lava|burn|fire|flame)\b/.test(n))return 'fire';
 if(/\b(attack|fight|damage|hostile|friendly|health)\b/.test(n))return 'combat';
 if(/\b(drop|drops|loot|chest|obtain|find|where|location)\b/.test(n))return 'acquisition';
 if(/\b(biome|temperature|climate)\b/.test(n))return 'biomes';
 return 'definition';}
function ingredient(x){if(typeof x==='string')return pretty(x);if(!x)return 'unspecified';return pretty(x.item||x.tag||'unspecified')+(x.count>1?' ×'+x.count:'');}
function recipe(r){const station=(r.station||[]).map(pretty).join(', ')||'appropriate workstation';
 if(r.pattern&&r.key){const counts={};for(const row of r.pattern)for(const ch of row)if(ch!==' ')counts[ch]=(counts[ch]||0)+1;
 const parts=Object.entries(counts).map(([k,n])=>n+' × '+ingredient(r.key[k]));return 'Use '+station+': '+parts.join(', ')+'. Pattern: '+r.pattern.map(x=>x.replace(/ /g,'·')).join(' / ')+'.';}
 if(r.ingredients){let count={};for(const x of r.ingredients){const k=ingredient(x);count[k]=(count[k]||0)+1;}return 'Use '+station+': '+Object.entries(count).map(([k,n])=>n+' × '+k).join(', ')+'.';}
 if(r.input||r.reagent)return 'Use '+station+': '+ingredient(r.input)+' with '+ingredient(r.reagent)+'.';
 if(r.base||r.addition)return 'Use '+station+': '+ingredient(r.base)+' and '+ingredient(r.addition)+(r.template?', template '+ingredient(r.template):'')+'.';
 return 'The source contains a recipe, but its ingredient representation requires review.';}
function response(status,intent,cat,key,answer,extra={}){return {status,intent,category:cat,subject:key,answer,...extra};}
function resolve(question,context={}){let n=norm(question),intent=classify(question);
 if(!n)return response('clarify',intent,null,null,'What would you like to know about Minecraft?');
 if(intent==='ingredient_uses'){
  const names=Object.keys(reverse).sort((a,b)=>b.length-a.length);const name=names.find(k=>{const ws=token(k),qw=token(n);return ws.every(x=>qw.includes(x));});
  if(!name)return response('unknown_subject',intent,'recipes',null,'Which ingredient are you asking about?');
  const arr=reverse[name],outputs=[...new Set(arr.map(x=>x[0]))];return response('found',intent,'recipes',name,pretty(name)+' appears in '+outputs.length+' distinct recipe outputs in the supplied samples. Examples: '+outputs.slice(0,12).map(pretty).join(', ')+(outputs.length>12?', and more.':'.'),{total_outputs:outputs.length,examples:outputs.slice(0,12),source:'behavior_pack/recipes/'});
 }
 const order={recipes:['recipes'],enchantments:['enchantments'],brewing:['brewing'],breeding:['profiles','mobs'],taming:['profiles','mobs'],avoidance:['profiles','mobs'],breathing:['profiles','mobs'],fire:['profiles','mobs'],combat:['profiles','mobs'],acquisition:['loot','mobs'],biomes:['biomes'],definition:['mobs','profiles','enchantments','biomes','recipes']}[intent];
 let matches=[];for(const cat of order){const key=find(n,cat);if(key)matches.push([cat,key]);}
 if(!matches.length&&context.subject&&context.category&&order.includes(context.category)&&db[context.category]?.[context.subject])matches.push([context.category,context.subject]);
 if(!matches.length)return response('unknown_subject',intent,null,null,'I cannot identify that subject in my indexed knowledge. Please name the exact mob, item, or block.');
 const [cat,key]=matches[0];
 if(cat==='recipes'){let variants=db.recipes[key];return response('found',intent,cat,key,pretty(key)+': '+recipe(variants[0])+(variants.length>1?' There are '+variants.length+' recorded recipe variants.':''),{source:variants[0].source,variant_count:variants.length,source_kind:'vanilla_samples'});}
 if(cat==='enchantments'){let v=db.enchantments[key];let verified=v.level_status==='verified';return response('reference_pending_verification',intent,cat,key,pretty(key)+': '+(v.effect||'Effect not documented')+'. Maximum level: '+(v.max_level??'unknown')+'. Equipment: '+(v.equipment||[]).join(', ')+'.',{source_kind:'reference_summary',verified});}
 if(cat==='brewing'){let v=db.brewing[key];return response('found',intent,cat,key,'Recorded brewing transformations for '+pretty(key)+': '+v.slice(0,4).map(r=>ingredient(r.input)+' + '+ingredient(r.reagent)).join('; ')+'.',{source:v[0]?.source,variant_count:v.length});}
 if(cat==='loot'){let v=db.loot[key];let tables=[...new Set(v.map(x=>x.table))];return response('possible_sources',intent,cat,key,pretty(key)+' appears in '+tables.length+' loot tables. Examples: '+tables.slice(0,6).map(pretty).join('; ')+'. These are possible entries, not guaranteed drops.',{source_kind:'vanilla_samples',total_tables:tables.length});}
 if(cat==='biomes'){let v=db.biomes[key];return response('technical_evidence',intent,cat,key,pretty(key)+' is indexed as a biome. Tags: '+(v.tags||[]).slice(0,8).join(', ')+'. This does not prove a particular structure or item generates there.',{source:v.source});}
 if(cat==='mobs'){let arr=db.mobs[key];let topic=({breeding:/breed/i,taming:/tame/i,avoidance:/avoid|fear/i,breathing:/breath|water/i,fire:/fire|lava/i,combat:/attack|health/i})[intent];let found=topic?arr.find(x=>topic.test(x.topic||'')):arr[0];if(found)return response('evidence_with_caveat',intent,cat,key,found.answer,{warning:found.caveat||null});}
 if(cat==='profiles'){let p=db.profiles[key];let c=p.components||{};let re=({breeding:/breed/,taming:/tame/,avoidance:/avoid|panic/,breathing:/breath|underwater/,fire:/fire|hurt_on_condition|damage_sensor/,combat:/attack|health|type_family/,definition:/type_family/})[intent]||/type_family/;let found=Object.keys(c).filter(x=>re.test(x));return response(found.length?'technical_evidence':'insufficient_evidence',intent,cat,key,found.length?'Relevant entity components: '+found.map(pretty).join(', ')+'. Conditional groups and engine defaults require interpretation.':'The entity exists in the samples, but the current data does not establish this specific behavior.',{source:p.source,components:found});}
 return response('insufficient_evidence',intent,cat,key,'The indexed data does not yet establish a reliable answer.');
}
module.exports={resolve,find,classify,recipe};
