import database from '../data/entities/runtime.json' with {type:'json'};
const normalize=s=>s.toLowerCase().replace(/minecraft:/g,'').replace(/[_:]/g,' ').replace(/\s+/g,' ').trim();
const contains=(q,s)=>{
 const term=normalize(s),forms=[term,term+'s',term.endsWith('y')?term.slice(0,-1)+'ies':term];
 return forms.some(f=>(' '+q+' ').includes(' '+f+' '));
};
const foodNames=new Map();
for(const row of Object.values(database))for(const entries of [...Object.values(row.feeding?.roles??{}),row.feeding?.hazards??[],row.feeding?.withheld??[]])for(const item of entries) {
  foodNames.set(item.id,item.name);
}
const aliases={
 'minecraft:fish':['cod','raw cod'], 'minecraft:salmon':['salmon','raw salmon'],
 'minecraft:clownfish':['tropical fish'], 'minecraft:muttonRaw':['raw mutton'],
 'minecraft:muttonCooked':['cooked mutton'], 'minecraft:appleEnchanted':['enchanted golden apple'],
 'minecraft:hay_block':['hay bale'], 'minecraft:slime_ball':['slimeball']
};
function requestedFood(q) {
  const found=[];
  for(const [id,name] of foodNames)for(const alias of [name,normalize(id),...(aliases[id]??[])])if(contains(q,alias))found.push({id,size:alias.length});
  found.sort((a,b)=>b.size-a.size);
  return found[0]?.id;
}
const titles={breeding:'For breeding',taming:'For taming',healing:'For healing',growth:'To help babies grow'};
export function feedingAnswer(id,q,topic) {
 const row=database[id],food=row?.feeding;
 if(!food || (!Object.keys(food.roles).length&&!food.hazards.length))return null;
 const requested=requestedFood(q),hazard=food.hazards.find(i=>i.id===requested);
 const withheld=food.withheld?.find(i=>i.id===requested);
 if(withheld)return {status:'unknown',answer:withheld.answer,subject:id,topic:'diet',sources:food.sources};
 if(hazard)return {status:'conditional',answer:`Do not feed it ${hazard.name}; that interaction applies a harmful effect rather than healing it.`,subject:id,topic:'diet',sources:food.sources};
 const role=/\b(heal|healing|restore|recover)\b/.test(q)?'healing':/\b(grow|growth|baby|babies)\b/.test(q)&&topic!=='breeding'?'growth':topic==='taming'?'taming':topic==='breeding'?'breeding':null;
 const selected=role?[[role,food.roles[role]??[]]]:Object.entries(food.roles);
 if(!selected.some(([,items])=>items.length))return null;
 const lines=[];
 for(const [purpose,items] of selected) {
  if(!items.length)continue;
  const relevant=requested?items.filter(i=>i.id===requested):items;
  if(!relevant.length)continue;
  const names=[...new Set(relevant.map(i=>i.name))];
  lines.push(`${titles[purpose]}: ${names.join(', ')}.`);
  if(purpose==='healing'&&requested) {
   const amounts=[...new Set(relevant.map(i=>i.heal_amount).filter(n=>typeof n==='number'))];
   if(amounts.length===1)lines.push(`It restores ${amounts[0]} health points (${amounts[0]/2} hearts) when the feeding interaction is allowed.`);
  }
 }
 if(!lines.length) {
  const alternatives=[...new Set(selected.flatMap(([,items])=>items.map(i=>i.name)))];
  return {status:'unknown',answer:`I don't have a supported ${role??'feeding'} use for ${foodNames.get(requested)} with this creature. ${alternatives.length?'For that purpose, use '+alternatives.join(', ')+'.':'Ask about another feeding purpose.'}`,subject:id,topic:role??'diet',sources:food.sources};
 }
 const detail=role&&row.topics[role]?.answer;
 if(detail)lines.push(detail);
 else lines.push('The right use depends on its age and state; food for one purpose does not automatically work for another.');
 return {status:'conditional',answer:lines.join(' '),subject:id,topic:role??'diet',sources:food.sources,coverage:'scoped_sample_interactions'};
}
