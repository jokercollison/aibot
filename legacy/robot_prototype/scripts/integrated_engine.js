// Offline knowledge resolver, data-only, no network or Minecraft API dependencies.
const db = require('../knowledge/integrated_v44.json');
const norm = s => String(s||'').toLowerCase().replace(/minecraft:/g,'').replace(/[_-]/g,' ').replace(/[^a-z0-9 ]/g,' ').trim().replace(/\s+/g,' ');
const label = s => String(s||'').replace(/^minecraft:/,'').replace(/_/g,' ');
const alias = {hoppers:'hopper',creepers:'creeper',cows:'cow',wolves:'wolf',sheep:'sheep',zombies:'zombie',diamonds:'diamond',potions:'potion',enchantments:'enchantment'};
const stop = new Set('a an the i me my you your do does is are can could would please how what which where why tell show give about of to for with in on minecraft item block mob make craft crafting recipe recipes get find locate obtain want need some any it its'.split(' '));
const categories = ['recipes','mobs','enchantments','brewing','biomes','loot','profiles'];
const lookup = {};
for(const c of categories){lookup[c]=Object.keys(db[c]).map(k=>({key:k,words:norm(k).split(' ')})).sort((a,b)=>b.words.length-a.words.length);}
function subject(q,cat){const words=norm(q).split(' ').map(w=>alias[w]||w);const relevant=words.filter(w=>!stop.has(w));
 for(const entry of lookup[cat])if(entry.words.every(w=>relevant.includes(w)))return entry.key;
 return null;
}
function ingredient(x){if(typeof x==='string')return label(x);if(!x)return 'unspecified';return label(x.item||x.tag||'unspecified')+(x.count>1?' ×'+x.count:'');}
function recipe(r){let station=(r.station||[]).map(label).join(', ')||'appropriate workstation';
 if(r.pattern&&r.key){const counts={};for(const row of r.pattern)for(const ch of row)if(ch!==' ')counts[ch]=(counts[ch]||0)+1;const ingredients=Object.entries(counts).map(([k,n])=>n+' '+ingredient(r.key[k]));return 'Use '+station+': '+ingredients.join(', ')+'. Grid: '+r.pattern.map(x=>x.replace(/ /g,'·')).join(' / ')+'.';}
 if(r.ingredients)return 'Use '+station+': '+r.ingredients.map(ingredient).join(', ')+'.';
 if(r.input||r.reagent)return 'Use '+station+': '+ingredient(r.input)+' and '+ingredient(r.reagent)+'.';
 if(r.base||r.addition)return 'Use '+station+': '+ingredient(r.base)+' and '+ingredient(r.addition)+(r.template?', template '+ingredient(r.template):'')+'.';
 return 'A '+(r.type||'crafting')+' recipe is recorded, but its ingredient representation needs review.';
}
const intents=[['recipe',/\b(craft|crafting|recipe|ingredients|make|smelt|cook|smith|build)\b/],['enchantment',/\b(enchant|enchantment|enchantments|maximum level|max level)\b/],['brewing',/\b(brew|brewing|potion|potions)\b/],['mob_breeding',/\b(breed|breeding|baby|babies)\b/],['mob_taming',/\b(tame|taming|pet)\b/],['mob_avoidance',/\b(afraid|scared|avoid|flee|fear)\b/],['mob_water',/\b(drown|drowning|underwater|breathe|breathing)\b/],['mob_fire',/\b(lava|burn|fire|flame)\b/],['mob_combat',/\b(attack|fight|damage|hostile|friendly|health)\b/],['loot',/\b(drop|drops|loot|chest|obtain|find|where|location)\b/],['biome',/\b(biome|temperature|climate)\b/],['definition',/\b(what is|what are|tell me about|describe)\b/]];
function resolve(q){const n=norm(q);if(!n)return {status:'clarify',answer:'What would you like to know about Minecraft?'};
 const intent=(intents.find(([_,re])=>re.test(n))||['definition'])[0];
 const preference={recipe:['recipes'],enchantment:['enchantments'],brewing:['brewing'],mob_breeding:['profiles','mobs'],mob_taming:['profiles','mobs'],mob_avoidance:['profiles','mobs'],mob_water:['profiles','mobs'],mob_fire:['profiles','mobs'],mob_combat:['profiles','mobs'],loot:['loot','mobs'],biome:['biomes'],definition:['mobs','profiles','biomes','enchantments','recipes']}[intent];
 let cat=null,key=null;for(const c of preference){let found=subject(n,c);if(found){cat=c;key=found;break;}}
 if(!key)return {status:'unknown_subject',intent,answer:'I need the exact mob, item, block, or enchantment name to answer that.'};
 const source=cat==='profiles'?db.profiles[key].source:cat==='recipes'?db.recipes[key][0]?.source:null;
 if(cat==='recipes')return {status:'found',intent,category:cat,subject:key,answer:label(key)+': '+recipe(db.recipes[key][0])+(db.recipes[key].length>1?' ('+db.recipes[key].length+' recipe variants recorded.)':''),source,variant_count:db.recipes[key].length};
 if(cat==='enchantments'){const v=db.enchantments[key];return {status:'found',intent,category:cat,subject:key,answer:label(key)+': '+(v.effect||'Effect not verified')+'. Maximum level: '+(v.max_level??'not verified')+'. Equipment: '+(v.equipment||[]).join(', ')+'.',verification:v.level_status||'requires_verification'};}
 if(cat==='mobs'){const arr=db.mobs[key];const match=arr.find(x=>/breed|tame|avoid|fire|water|attack|health|famil/i.test(x.topic||'') && (intent==='definition'|| (intent==='mob_breeding'&&/breed/i.test(x.topic))||(intent==='mob_taming'&&/tame/i.test(x.topic))||(intent==='mob_avoidance'&&/avoid|fear/i.test(x.topic))||(intent==='mob_water'&&/water|breath/i.test(x.topic))||(intent==='mob_fire'&&/fire|lava/i.test(x.topic))||(intent==='mob_combat'&&/attack|health/i.test(x.topic)))) || arr[0];return {status:'found',intent,category:cat,subject:key,answer:match?.answer||'No verified description yet.',warning:match?.caveat||null};}
 if(cat==='profiles'){const p=db.profiles[key],comp=p.components||{};let relevant=Object.keys(comp).filter(k=>intent==='mob_breeding'?/breed/.test(k):intent==='mob_taming'?/tame/.test(k):intent==='mob_avoidance'?/avoid|panic/.test(k):intent==='mob_water'?/breath|underwater/.test(k):intent==='mob_fire'?/fire|hurt_on_condition|damage_sensor/.test(k):intent==='mob_combat'?/attack|health|type_family/.test(k):/type_family/.test(k));if(!relevant.length)return {status:'insufficient_evidence',intent,category:cat,subject:key,answer:'I have a '+label(key)+' definition, but not enough verified evidence to answer that specific question.',source:p.source};return {status:'technical_evidence',intent,category:cat,subject:key,answer:'The '+label(key)+' has relevant behavior components: '+relevant.map(label).join(', ')+'. Their conditions must be checked before claiming a specific outcome.',source:p.source,components:relevant};}
 if(cat==='loot'){const v=db.loot[key];return {status:'possible_sources',intent,category:cat,subject:key,answer:label(key)+' appears in '+(Array.isArray(v)?v.length:Object.keys(v).length)+' recorded loot-source entries. These are possibilities, not guaranteed drops.',warning:'Loot tables may be conditional or not correspond to obtainable survival loot.'};}
 if(cat==='biomes')return {status:'found',intent,category:cat,subject:key,answer:'Biome '+label(key)+' is indexed in the supplied Bedrock data. Specific generation and location claims require verification.'};
 if(cat==='brewing')return {status:'technical_evidence',intent,category:cat,subject:key,answer:'Brewing transformations are indexed for '+label(key)+'. Consult the structured ingredient records before giving exact steps.'};
 return {status:'insufficient_evidence',intent,category:cat,subject:key,answer:'I cannot verify that answer yet.'};
}
module.exports={resolve,subject,recipe};
