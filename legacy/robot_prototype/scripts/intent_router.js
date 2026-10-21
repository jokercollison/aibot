// Offline, deterministic intent routing. Content stays in separate data modules.
// No dynamic code execution, external services, or experimental Minecraft APIs.
const recipes=require('../knowledge/recipes.json');
const mobs=require('../knowledge/mobs.json');
const normalize=s=>String(s||'').toLowerCase().replace(/minecraft:/g,'').replace(/[_-]/g,' ').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const nice=s=>String(s).replace(/^minecraft:/,'').replace(/_/g,' ');
const tokens=s=>normalize(s).split(' ').filter(Boolean);
const stop=new Set(['a','an','the','i','me','my','you','your','is','are','do','does','can','could','what','which','where','how','to','of','in','on','for','with','minecraft','please','tell','about','get','find','make','craft','recipe','it','some','any']);
const aliases={'creepers':'creeper','cows':'cow','wolves':'wolf','sheep':'sheep','zombies':'zombie','skeletons':'skeleton','spiders':'spider','endermen':'enderman','hoppers':'hopper','diamonds':'diamond'};
const singular=t=>aliases[t]||(t.endsWith('s')&&t.length>4&&!t.endsWith('ss')?t.slice(0,-1):t);
function extractSubject(q,keys){
 const words=tokens(q).map(singular).filter(t=>!stop.has(t));
 let best=null,score=-1;
 for(const key of keys){let kt=tokens(key);if(!kt.length)continue;const exact=words.join(' ').includes(kt.join(' '));const overlap=kt.filter(t=>words.includes(t)).length;
 if(!exact && overlap!==kt.length)continue;
 const s=kt.length*10+(exact?2:0);if(s>score){best=key;score=s;}}
 return best;
}
const rules=[
 ['recipe',/\b(craft|crafting|recipe|make|build|ingredients|smelt|cook|smith|brew)\b/],
 ['obtainment',/\b(where|find|obtain|get|locate|spawn|location|biome)\b/],
 ['mob_breeding',/\b(breed|breeding|baby|mate)\b/],
 ['mob_taming',/\b(tame|taming|pet)\b/],
 ['mob_avoidance',/\b(scared|afraid|fear|avoid|run away)\b/],
 ['mob_breathing',/\b(drown|breathe|underwater|suffocate)\b/],
 ['mob_fire',/\b(lava|burn|fire|flame)\b/],
 ['mob_drops',/\b(drop|loot|drops)\b/],
 ['mob_attack',/\b(attack|damage|fight|hurt|hostile|friendly)\b/],
 ['mob_info',/\b(what is|who is|tell me about|mob|creature)\b/]
];
function parse(text){const q=normalize(text);if(!q)return {intent:'clarify',subject:null};
 let intent=(rules.find(([_,re])=>re.test(q))||[])[0]||'general';
 let keys=intent==='recipe'?Object.keys(recipes):intent.startsWith('mob_')?Object.keys(mobs):[...new Set([...Object.keys(recipes),...Object.keys(mobs)])];
 let subject=extractSubject(q,keys);
 if(!subject&&intent==='obtainment')subject=extractSubject(q,[...new Set([...Object.keys(recipes),...Object.keys(mobs)])]);
 return {intent,subject,normalized:q};}
function ingredient(x){if(typeof x==='string')return nice(x);if(!x)return 'unknown';return nice(x.item||x.tag||x.name||'unknown')+(x.count>1?' x'+x.count:'');}
function recipeAnswer(r){const station=(r.station||[]).join(', ')||'appropriate station';
 if(r.pattern&&r.key)return 'Use '+station+'. Pattern: '+r.pattern.join(' / ')+'. '+Object.entries(r.key).map(([k,v])=>k+' = '+ingredient(v)).join('; ')+'.';
 if(r.ingredients)return 'Use '+station+' with '+r.ingredients.map(ingredient).join(', ')+'.';
 if(r.input||r.reagent)return 'Use '+station+': '+ingredient(r.input)+' with '+ingredient(r.reagent)+'.';
 if(r.base||r.addition)return 'Use '+station+': base '+ingredient(r.base)+', addition '+ingredient(r.addition)+(r.template?', template '+ingredient(r.template):'')+'.';
 return 'A recipe record exists, but its ingredients need more processing.';}
const topics={mob_breeding:['breed','breeding'],mob_taming:['tame','taming'],mob_avoidance:['avoid','fear','scared'],mob_breathing:['breath','drown','underwater'],mob_fire:['fire','lava','burn'],mob_drops:['drop','loot'],mob_attack:['attack','damage','combat']};
function answer(text){const p=parse(text);if(p.intent==='clarify')return {status:'clarify',answer:'What would you like to know?'};
 if(!p.subject)return {status:'unresolved_subject',intent:p.intent,answer:'Which Minecraft mob, block, or item are you asking about?'};
 if(p.intent==='recipe'){
 const rr=recipes[p.subject];if(!rr)return {status:'unknown',intent:p.intent,subject:p.subject,answer:'I do not have a confirmed crafting recipe for '+nice(p.subject)+'. That does not mean it cannot be obtained.'};
 return {status:'found',intent:p.intent,subject:p.subject,answer:'For '+nice(p.subject)+': '+recipeAnswer(rr[0])+(rr.length>1?' There are '+rr.length+' recipe variants.':''),source:rr[0].source,variants:rr.length};}
 if(p.intent.startsWith('mob_')){
 const rows=mobs[p.subject]||[];const wanted=topics[p.intent]||[];
 const row=rows.find(r=>wanted.some(w=>normalize(r.topic).includes(w)||normalize(r.question).includes(w)));
 if(row)return {status:'found',intent:p.intent,subject:p.subject,answer:row.answer,source:'bedrock samples derived mob profile',caveat:row.caveat};
 return {status:'unknown',intent:p.intent,subject:p.subject,answer:'I do not have a verified answer about '+nice(p.subject)+' for that question yet.'};}
 return {status:'needs_cross_category_lookup',intent:p.intent,subject:p.subject,answer:'I found '+nice(p.subject)+', but this question needs an additional verified data source.'};
}
module.exports={parse,answer,normalize,extractSubject};
