export function rewardTopic(q) {
 if(/^(?:what (?:is|are)|describe|tell me about)\b/.test(q))return null;
 if(/\b(?:throw|shoot|cast|launch)\b/.test(q)&&!/\b(?:much|many|give|gives|drop|drops)\b/.test(q))return null;
 const question=q.replace(/\b(?:xp bottle|xp orb|experience bottle|experience orb|bottle o enchanting)\b/g,'');
 if(/\b(?:xp|experience|experience points|experience orbs)\b/.test(question)) {
  if(/\b(?:breed|breeding|bred)\b/.test(q))return 'experience_breeding';
  const ageQuestion=q
   .replace(/\b(?:not|no longer|isn t|aren t) (?:(?:a|an|the) )?bab(?:y|ies)\b/g,'adult')
   .replace(/\b(?:with|has|have|having|producing|raising) (?:(?:a|an|the|their|two) )?bab(?:y|ies)\b/g,'with offspring');
  if(/\bbab(?:y|ies)\b/.test(ageQuestion))return 'experience_baby';
  return 'experience';
 }
 if(/\b(?:drop|drops|loot|looting)\b/.test(q)&&(/\b(?:equipment|picked up|pickedup|naturally held|naturally spawned gear|carried|held item|chest contents)\b/.test(q)||/\b(?:drop|drops)\b.*\b(?:armor|armour|weapon|bow|crossbow|trident|saddle|harness|potion|axe|sword|carpet)\b/.test(q)))return 'equipment_drops';
 return null;
}
export const rewardTopics=['experience','experience_baby','experience_breeding','equipment_drops'];
