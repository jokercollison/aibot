export function prerequisiteTopic(q) {
 return /\b(?:breed|breeding|mate)\b/.test(q)&&/\b(?:health|injured|wounded|hurt)\b/.test(q)?'breeding_conditions':null;
}
export function conditionalEntityTopic(id,q,topic,topics) {
 const available=name=>topics[name]?name:null;
 if(['breeding','breeding_conditions'].includes(topic)) {
  const baby=/\b(?:baby|babies|foal|foals|snifflet|snifflets)\b.*\b(?:breed|breeding|mate)\b|\b(?:breed|breeding|mate)\s+(?:(?:a|an|the|my|two)\s+)?(?:baby|babies|foal|foals|snifflet|snifflets)\b/.test(q);
  if(baby)return available('breeding_age');
  if(/\b(?:untamed|not tamed|wild)\b/.test(q)&&topics.breeding_ownership)return 'breeding_ownership';
  if(/\b(?:health|injured|wounded|hurt)\b/.test(q)&&topics.breeding_health)return 'breeding_health';
 }
 if(topic==='digging'&&/\b(?:baby|snifflet|snifflets)\b/.test(q))return available('digging_age');
 if(!['drops','equipment_drops'].includes(topic))return null;
 if(/\blooting\s*(?:iv|[4-9]|[1-9][0-9]+)\b/.test(q))return null;
 if(id==='minecraft:fox') {
  if(/\btotem of undying\b/.test(q))return available('drops_totem');
  if(/\b(?:eaten|ate|already ate|consumed|eats)\b/.test(q)&&/\b(?:food|meat|chicken|rabbit|fish|berry|berries|apple)\b/.test(q))return available('drops_consumed_food');
 }
 if(id==='minecraft:piglin') {
  if(/\b(?:gold ingot|gold ingots|admiring|examining)\b/.test(q))return available('drops_gold');
  if(/\bporkchops?\b/.test(q))return available('drops_pork');
 }
 if(id==='minecraft:drowned') {
  if(/\btridents?\b/.test(q)&&/\b(?:converted|conversion|turning|turned|zombie farm)\b/.test(q))return available('drops_conversion');
  if(/\bnautilus shells?\b/.test(q))return available('drops_shell');
 }
 return null;
}
