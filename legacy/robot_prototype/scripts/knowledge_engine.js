// Offline searchable Minecraft knowledge engine. No network, no AI model, no chat interception.
const recipes = require('../knowledge/recipes.json');
const mobs = require('../knowledge/mobs.json');
const banter = require('../knowledge/banter.json');
const clean = s => String(s||'').toLowerCase().replace(/minecraft:/g,'').replace(/[_-]/g,' ').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const nice = s => String(s).replace(/^minecraft:/,'').replace(/_/g,' ');
function renderIngredient(x){ if(typeof x==='string') return nice(x); if(!x)return 'unknown ingredient'; return nice(x.item||x.tag||'unknown ingredient')+(x.count>1?' x'+x.count:''); }
function describeRecipe(r){
 let station=(r.station||[]).join(', ')||'appropriate station';
 if(r.pattern&&r.key){let lines=r.pattern.map(line=>line.split('').map(ch=>ch===' '?'·':ch).join('')).join(' / ');let keys=Object.entries(r.key).map(([k,v])=>k+' = '+renderIngredient(v)).join('; ');return 'Use '+station+'. Pattern: '+lines+'. '+keys+'.';}
 if(r.ingredients)return 'Use '+station+' with '+r.ingredients.map(renderIngredient).join(', ')+'.';
 if(r.input||r.reagent)return 'Use '+station+': '+renderIngredient(r.input)+' with '+renderIngredient(r.reagent)+'.';
 if(r.base||r.addition)return 'Use '+station+': base '+renderIngredient(r.base)+', addition '+renderIngredient(r.addition)+(r.template?', template '+renderIngredient(r.template):'')+'.';
 return 'Recipe available at '+station+'; see detailed recipe data.';
}
function query(text){
 const q=clean(text);if(!q)return {status:'clarify',answer:'What would you like to know about Minecraft?'};
 const recipeIntent=/craft|make|recipe|smith|brew|smelt|cook/.test(q);
 const mobIntent=/mob|breed|tame|attack|afraid|scared|health|drown|fire|lava|drop/.test(q);
 let hits=Object.keys(recipes).filter(k=>{const s=clean(k);return q.includes(s)&&s.length>2}).sort((a,b)=>b.length-a.length);
 if(recipeIntent&&hits.length){let k=hits[0], r=recipes[k];return {status:'found',category:'recipe',entity:k,answer:'For '+nice(k)+': '+describeRecipe(r[0])+(r.length>1?' There are '+r.length+' recipe variants.':''),source:r[0].source,variants:r.length};}
 let mobsHit=Object.keys(mobs).filter(k=>q.includes(clean(k))&&clean(k).length>2).sort((a,b)=>b.length-a.length);
 if(mobsHit.length&&(mobIntent||!recipeIntent)){
  let key=mobsHit[0],rows=mobs[key];let matched=rows.find(r=>q.includes(clean(r.topic)))||rows.find(r=>clean(r.question).split(' ').filter(w=>w.length>4).some(w=>q.includes(w)));
  if(matched)return {status:'found',category:'mob',entity:key,answer:matched.answer,warning:matched.caveat};
  return {status:'unknown',category:'mob',entity:key,answer:'I have some technical data for '+nice(key)+', but not a verified answer to that specific question yet.'};
 }
 return {status:'unknown',answer:'I do not have a verified answer for that yet. Try asking how to craft an item or about a mob.'};
}
function eventLine(event,seed=0){const lines=banter[event];if(!lines)return null;return lines[Math.abs(Math.floor(seed))%lines.length];}
module.exports={query,eventLine};
