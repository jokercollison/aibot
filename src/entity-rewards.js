export function rewardTopic(q) {
 if(/^(?:what (?:is|are)|describe|tell me about)\b/.test(q))return null;
 if(/\b(?:xp|experience|experience points|experience orbs)\b/.test(q)) {
  if(/\b(?:breed|breeding|bred)\b/.test(q))return 'experience_breeding';
  if(/\bbab(?:y|ies)\b/.test(q))return 'experience_baby';
  return 'experience';
 }
 if(/\b(?:drop|drops|loot|looting)\b/.test(q)&&(/\b(?:equipment|picked up|pickedup|naturally held|naturally spawned gear|carried|held item|chest contents)\b/.test(q)||/\b(?:drop|drops)\b.*\b(?:armor|armour|weapon|bow|crossbow|trident|saddle|harness|potion|axe|sword|carpet)\b/.test(q)))return 'equipment_drops';
 return null;
}
export const rewardTopics=['experience','experience_baby','experience_breeding','equipment_drops'];
