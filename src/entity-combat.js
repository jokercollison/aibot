export const combatTopics=['attack_style','provocation','counterplay'];
export function combatTopic(q) {
 if(/^(?:what (?:is|are)|describe|tell me about)\b/.test(q))return null;
 if(/\b(?:shield|shields|counter|counterplay|protect myself|protect me|avoid getting hit|block its attacks|block their attacks)\b/.test(q)||/\bhow (?:do i|can i|to)\b.*\b(?:fight|defeat|escape|avoid|survive)\b/.test(q))return 'counterplay';
 if(/\b(?:provoke|provokes|provoking|provocation|aggravate|aggravated)\b/.test(q)||/\bwhy\b.*\b(?:attack|attacks|attacking|angry|hostile|hitting|chasing)\b/.test(q))return 'provocation';
 if(/\bhow (?:does|do|will|can)\b.*\b(?:attack|attacks|fight|fights|hurt|hit)\b/.test(q))return 'attack_style';
 return null;
}
