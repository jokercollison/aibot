import catalog from '../data/catalog.json' with {type:'json'};
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
for(const item of Object.values(catalog.records))if(item.kind==='item'&&!foodNames.has(item.minecraft_id))foodNames.set(item.minecraft_id,item.name.toLowerCase());
const aliases={
 'minecraft:fish':['cod','raw cod'], 'minecraft:salmon':['salmon','raw salmon'],
 'minecraft:clownfish':['tropical fish'], 'minecraft:muttonRaw':['raw mutton'],
 'minecraft:muttonCooked':['cooked mutton'], 'minecraft:appleEnchanted':['enchanted golden apple'],
 'minecraft:hay_block':['hay bale'], 'minecraft:slime_ball':['slimeball']
};
function ingredientText(id,q) {
 const limited=text=>text.split(/\b(?:when|while|because|near|around)\b/)[0].trim();
 const withItem=q.match(/\b(?:with|using)\s+(.+)$/);if(withItem)return limited(withItem[1]);
 const feedTo=q.match(/\bfeed(?:ing)?\s+(.+?)\s+to\s+/);if(feedTo)return limited(feedTo[1]);
 const eating=q.match(/\b(?:eat|eats)\s+(.+)$/);if(eating)return /^(?:when|if|while|in |at )/.test(eating[1])?'':limited(eating[1]);
 const feed=q.match(/\bfeed(?:ing)?\s+(.+)$/);
 if(feed) {
  const name=normalize(id).replace(/\bv2\b/g,'').trim();
  const names=[name,name+'s',name==='wolf'?'wolves':name];
  let rest=feed[1].replace(/^(?:a |an |the |my )/,'');
  for(const n of names.sort((a,b)=>b.length-a.length))if(rest===n||rest.startsWith(n+' '))return rest.slice(n.length).trim();
  return rest.replace(/^(?:it|them)\b/,'').trim();
 }
 return '';
}
function requestedFood(q) {
  const found=[];
  for(const [id,name] of foodNames)for(const alias of [name,normalize(id),...(aliases[id]??[])])if(contains(q,alias))found.push({id,size:alias.length});
  found.sort((a,b)=>b.size-a.size);
  return found[0]?.id;
}
const titles={breeding:'For breeding',taming:'For taming',healing:'For healing',growth:'To help babies grow'};
export function feedingAnswer(id,q,topic) {
 const row=database[id],food=row?.feeding;
 if(!row)return null;
 const preyClause=topic==='diet'&&q.match(/\b(?:eat|eats|swallow|swallows|hunt|hunts)\s+(.+)$/);
 if(preyClause) {
  const prey=row.prey_cases?.find(c=>c.aliases.some(alias=>contains(preyClause[1],alias)));
  if(prey) {
   const answer=/\b(?:medium|large|big|giant)\b/.test(preyClause[1])?prey.large_answer:prey.small_answer;
   return {status:'conditional',answer,subject:id,topic:'diet',sources:prey.sources,coverage:'reviewed_summary'};
  }
 }
 const requested=requestedFood(ingredientText(id,q));
 const role=topic==='taming'?'taming':topic==='breeding'?'breeding':
  /\b(heal|healing|restore|recover)\b/.test(q)?'healing':
  (topic==='growth'||/\b(grow|growing|growth|mature|maturing)\b/.test(q))?'growth':null;
 if(topic==='diet'&&!role) {
  const fact=requested?row.diet_cases?.find(c=>c.items.includes(requested)):row.topics.diet;
  if(fact)return {status:'conditional',answer:fact.answer,subject:id,topic:'diet',sources:fact.sources,coverage:'reviewed_summary'};
 }
 if(!food || (!Object.keys(food.roles).length&&!food.hazards.length))return null;
 const hazard=food.hazards.find(i=>i.id===requested);
 const withheld=food.withheld?.find(i=>i.id===requested);
 if(withheld)return {status:'unknown',answer:withheld.answer,subject:id,topic:'diet',sources:food.sources};
 if(hazard&&id==='minecraft:parrot'&&requested==='minecraft:cookie'&&row.topics.food_safety)return {status:'conditional',answer:row.topics.food_safety.answer,subject:id,topic:'diet',sources:row.topics.food_safety.sources};
 if(hazard)return {status:'conditional',answer:`Do not feed it ${hazard.name}; that interaction applies a harmful effect rather than healing it.`,subject:id,topic:'diet',sources:food.sources};
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
  if(role && ['taming','breeding','growth'].includes(role)) {
   const detail=row.topics[role]?.answer;
   const advice=detail??`For ${role}, use ${alternatives.join(', ')}.`;
   const wolfNote=id==='minecraft:wolf'?' Other foods can feed or heal a wolf after it is tamed.':'';
   return {status:'conditional',answer:`No. ${foodNames.get(requested).replace(/^./,c=>c.toUpperCase())} cannot be used for ${role}. ${advice}${wolfNote}`,subject:id,topic:role,sources:food.sources};
  }
  return {status:'unknown',answer:`I don't have a supported ${role??'feeding'} use for ${foodNames.get(requested)} with this creature. ${alternatives.length?'For that purpose, use '+alternatives.join(', ')+'.':'Ask about another feeding purpose.'}`,subject:id,topic:role??'diet',sources:food.sources};
 }
 const detail=role&&row.topics[role]?.answer;
 if(detail)lines.push(detail);
 else lines.push('The right use depends on its age and state; food for one purpose does not automatically work for another.');
 return {status:'conditional',answer:lines.join(' '),subject:id,topic:role??'diet',sources:food.sources,coverage:'scoped_sample_interactions'};
}
