export const affinityTopics=['smite','bane_of_arthropods','impaling','poison_reaction','regeneration_reaction','healing_magic','harming_magic'];
// Recognize a requested effect on a mob, not a definition of the enchantment or
// an incidental potion name in an unrelated breeding/drop question.
export function affinityTopic(q) {
 if(/^(?:what (?:is|are)|describe|tell me about)\b/.test(q))return null;
 if(/\b(?:breed|breeding|tame|taming|drop|drops|loot|craft|recipe|brew|cure|curing|feed|feeding|eat|eats|eating)\b/.test(q))return null;
 if(/\b(?:instant health|healing potions?|potions? of healing)\b/.test(q))return 'healing_magic';
 if(/\b(?:instant damage|harming potions?|potions? of harming)\b/.test(q))return 'harming_magic';
 if(/\bhow (?:does|do)\b.*\b(?:attack|fight)\b/.test(q))return null;
 if(/\b(?:poison me|poison you|poisons me|poisons you|poison players|(?:inflict|give|gives) (?:(?:me|you|players) )?poison)\b/.test(q))return 'attack_style';
 if(/\b(?:poison|poisoned|poisoning)\b/.test(q))return 'poison_reaction';
 if(/\b(?:regeneration|regen)\b/.test(q))return /\b(?:give|gives|grant|grants|help me)\b/.test(q)?null:'regeneration_reaction';
 if(!/\b(?:work|works|effective|affect|affects|against|damage|hurt|hurts|kill|kills|weak|bonus)\b/.test(q))return null;
 if(/\bsmite\b/.test(q))return 'smite';
 if(/\bbane of arthropods\b/.test(q))return 'bane_of_arthropods';
 if(/\bimpaling\b/.test(q))return 'impaling';
 return null;
}
