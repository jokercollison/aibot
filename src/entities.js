import {conditionalLootAnswer} from './entity-loot.js';
import {feedingAnswer} from './entity-feeding.js';
import database from '../data/entities/runtime.json' with {type:'json'};

// Detect the requested gameplay topic independently of subject identification.
export function entityTopic(q) {
  if (/\b(drop|drops|loot|looting)\b/.test(q)) return 'drops';
  if (/\b(heal|healing|restore|recover)\b/.test(q)) return 'healing';
  if (/\b(health|hearts|hit points)\b/.test(q)) return 'health';
  if (/\b(breed|breeding|mate|babies|reproduce|duplicate)\b/.test(q)) return 'breeding';
  if (/\b(tame|taming|befriend)\b/.test(q)) return 'taming';
  if (/\b(where|find|found|spawn|spawns|spawning|biome|biomes|habitat)\b/.test(q)) return 'spawning';
  if (/\b(variant|variants|types|colors|colours)\b/.test(q)) return 'variants';
  if (/\b(make|build|construct|summon|create)\b/.test(q)) return 'construction';
  if (/\b(trade|trades|trading|barter)\b/.test(q)) return 'trading';
  if (/\b(ride|riding|saddle|control|mount)\b/.test(q)) return 'transport';
  if (/\b(fight|defeat|attack|attacks|combat)\b/.test(q)) return 'combat';
  if (/\b(eat|eats|food|diet|feed|feeding|grow|growth)\b/.test(q)) return 'diet';
  if (/\b(cure|curing|convert|heal|shear|brush|milk|scare|scares|afraid|fear)\b/.test(q)) return 'interactions';
  if(/^(?:what (?:is|are)|describe|tell me about)\b/.test(q))return 'identity';
  if(/\b(?:what (?:does|do).*\bdo|how (?:does|do).*\bbehave|behavio[u]?r)\b/.test(q))return 'behavior';
  return null;
}
export function entityAnswer(id, q, variant, requestedTopic) {
  const row=database[id],topic=requestedTopic??entityTopic(q);
  if(!row||!topic)return null;
  if(['diet','healing'].includes(topic) || ['taming','breeding'].includes(topic) && /\b(with|using|feed|eat|food)\b/.test(q)) {
    const answer=feedingAnswer(id,q,topic);
    if(answer)return answer;
  }
  if(topic==='drops') {
    const answer=conditionalLootAnswer(id,q,row.topics.drops);
    if(answer)return answer;
  }
  const special=variant && row.variants.find(v=>v.name===variant)?.topics[topic];
  const fact=special ?? row.topics[topic];
  if(!fact)return null;
  return {status:'conditional',answer:fact.answer,subject:id,topic,sources:row.topics[topic]?.sources??[],coverage:fact.coverage};
}
export function wolfVariant(q) {
  return database['minecraft:wolf'].variants.find(v=>v.aliases.some(a=>new RegExp('\\b'+a+'s?\\b').test(q)))?.name;
}

export const entityReferences=Object.fromEntries(Object.entries(database).filter(([,row])=>row.reference).map(([id,row])=>[id,row.reference]));
