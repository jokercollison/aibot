import {conditionalLootAnswer} from './entity-loot.js';
import {feedingAnswer} from './entity-feeding.js';
import {entityFacet,flowerStewAnswer} from './entity-facets.js';
import database from '../data/entities/runtime.json' with {type:'json'};

export function entityTopic(q) {
  if (/\b(drop|drops|loot|looting)\b/.test(q) && !/\bfroglights?\b/.test(q)) return 'drops';
  if (/\b(?:repair|heal).*\b(?:armor|armour)\b/.test(q))return 'repair';
  if (/\b(heal|healing|restore|recover)\b/.test(q)) return 'healing';
  if (/\b(health|hearts|hit points)\b/.test(q)) return 'health';
  if (/\b(breed|breeding|mate|reproduce|duplicate)\b/.test(q)) return 'breeding';
  if (/\b(tame|taming|befriend)\b/.test(q)) return 'taming';
  if (/\b(where|find|found|spawn|spawns|spawning|biome|biomes|habitat)\b/.test(q)) return 'spawning';
  if (/\b(variant|variants|types|colors|colours|personalities)\b/.test(q)) return 'variants';
  if (/\b(trade|trades|trading|barter)\b/.test(q)) return 'trading';
  if (/\b(ride|riding|saddle|control|mount)\b/.test(q)) return 'transport';
  if(/\b(?:golden dandelion|pause aging|stop growing|stay a baby|stop aging|resume aging)\b/.test(q))return 'age_lock';
  if (/\b(eat|eats|food|diet|feed|feeding)\b/.test(q)) return 'diet';
  if (/^(?:what (?:is|are)|describe|tell me about)\b/.test(q)) return 'identity';
  const facet=entityFacet(q);if(facet)return facet;
  if (/\b(make|build|construct|summon|create)\b/.test(q)) return 'construction';
  if (/\b(fight|defeat|attack|attacks|combat)\b/.test(q)) return 'combat';
  if (/\b(grow|growth)\b/.test(q))return 'growth';
  if (/\b(scared|scare|scares|afraid|fear)\b/.test(q)) return 'interactions';
  if(/\b(?:what (?:does|do|can).*\bdo|how (?:does|do).*\bbehave|behavio[u]?r)\b/.test(q))return 'behavior';
  return null;
}
export function entityAnswer(id,q,variant,requestedTopic) {
  const row=database[id];let topic=requestedTopic??entityTopic(q);
  if(!row)return null;
  if(!topic&&variant)topic='identity';
  if(!topic)return null;
  if(topic==='healing'&&id==='minecraft:iron_golem')topic='repair';
  if(['milking','diet','interactions','age_lock'].includes(topic)) {
    const stew=flowerStewAnswer(id,q,variant);if(stew)return stew;
  }
  if(['diet','healing'].includes(topic) || ['taming','breeding'].includes(topic) && /\b(with|using|feed|eat|food)\b/.test(q)) {
    const answer=feedingAnswer(id,q,topic);if(answer)return answer;
  }
  const special=variant && row.variants.find(v=>v.name===variant)?.topics[topic];
  if(topic==='drops') {
    const answer=conditionalLootAnswer(id,q,row.topics.drops);
    if(answer) {
      if(answer.status==='unknown'&&special&&!/\blooting (?:iv|[4-9])\b/.test(q))return {status:'conditional',answer:special.answer,subject:id,topic,sources:special.sources,coverage:special.coverage};
      return special?{...answer,answer:answer.answer+' '+special.answer}:answer;
    }
  }
  const fact=special??row.topics[topic];if(!fact)return null;
  return {status:'conditional',answer:fact.answer,subject:id,topic,sources:fact.sources??row.topics[topic]?.sources??[],coverage:fact.coverage};
}
const contains=(q,term)=>(' '+q+' ').includes(' '+term+' ');
export function entityVariant(id,q) {
  return (database[id]?.variants??[]).flatMap(v=>v.aliases.filter(a=>contains(q,a)||contains(q,a.endsWith('wolf')?a.slice(0,-4)+'wolves':a+'s')).map(a=>({variant:v,length:a.length}))).sort((a,b)=>b.length-a.length)[0]?.variant;
}
export function shortVariant(id,q) {
  const short=q.replace(/^(?:and |what about |how about )?(?:the )?/,'').replace(/ ones?$/,'');
  return database[id]?.variants.find(v=>v.name===short||v.aliases.includes(short));
}
export const entityVariantAliases=Object.entries(database).filter(([,r])=>!r.variant_alias_owner).flatMap(([id,r])=>r.variants.flatMap(v=>v.aliases.map(alias=>({id,alias}))));
export const entityReferences=Object.fromEntries(Object.entries(database).filter(([,row])=>row.reference).map(([id,row])=>[id,row.reference]));

const relatedEggs={'minecraft:sniffer_egg':'minecraft:sniffer','minecraft:turtle_egg':'minecraft:turtle','minecraft:frog_spawn':'minecraft:frog','minecraft:egg':'minecraft:egg'};
export function relatedEntityAnswer(id,q) {
 if(id==='minecraft:wolf_armor'&&entityTopic(q)==='repair') {
  const answer=entityAnswer('minecraft:wolf',q,undefined,'repair');
  return answer?{...answer,subject:id,entity_reference:'minecraft:wolf'}:null;
 }
 if(entityTopic(q)!=='hatching'||!relatedEggs[id])return null;
 const answer=entityAnswer(relatedEggs[id],q,undefined,'hatching');
 return answer?{...answer,subject:id,entity_reference:relatedEggs[id]}:null;
}
