import database from '../data/entities/runtime.json' with {type:'json'};
const flowers=database['minecraft:mooshroom'].flower_effects;
// These predicates identify a question's requested mechanic, not every noun it mentions.
export function entityFacet(q) {
 if(/\b(?:despawn|despawning|lifetime|live forever|last forever|disappear)\b/.test(q))return 'lifetime';
 if(/\bfroglights?\b/.test(q))return 'froglights';
 if(/\b(?:milking|milk|stew|stews)\b/.test(q))return 'milking';
 if(/\b(?:shear|shearing|sheared)\b/.test(q)&&!(/\b(?:drop|drops|loot)\b/.test(q)))return 'shearing';
 if(/\b(?:brush|brushing|scutes)\b/.test(q))return 'brushing';
 if(/\b(?:repair|repairing)\b/.test(q))return 'repair';
 if(/\b(?:oxidiz|oxidis|oxidation|wax|waxing|unwax|statue)\w*\b/.test(q))return 'oxidation';
 if(/\b(?:lightning|struck by lightning)\b/.test(q))return 'lightning';
 if(/\b(?:sunlight|sunburn|daylight|burn in (?:the )?sun)\b/.test(q))return 'sunlight';
 if(/\b(?:powder snow|freez(?:e|es|ing)|frozen)\b/.test(q))return 'powder_snow';
 if(/\b(?:turn into|turns into|convert|converts|conversion|transform|zombif(?:y|ies|ication))\b/.test(q))return 'conversion';
 if(/\b(?:cure|curing)\b/.test(q))return 'curing';
 if(/\b(?:rain|raining)\b/.test(q))return 'rain';
 if(/\b(?:lava|fireproof|fire immune|fire immunity|on fire|fire resistance)\b/.test(q))return 'fire';
 if(/\b(?:out of water|on land|dry out|drying out|breathe air)\b/.test(q))return 'land';
 if(/\b(?:water|underwater|drown|drowning|swim|swimming)\b/.test(q))return 'water';
 if(/\b(?:warmth|hot biome|hot biomes|temperature|shiver|shivering)\b|\bwhy.*\bcold\b/.test(q))return 'temperature';
 if(/\b(?:fall damage|falling damage|survive a fall|fall from)\b/.test(q))return 'fall_damage';
 if(/\b(?:golden dandelion|pause aging|stop growing|stay a baby|stop aging|resume aging)\b/.test(q))return 'age_lock';
 if(/\b(?:hatch|hatches|hatching|incubat(?:e|ion))\b/.test(q))return 'hatching';
 if(/\b(?:how long|time).*\b(?:grow|growth|adult)\b|\b(?:stop growing|stay a baby)\b/.test(q))return 'growth';
 if(/\b(?:jukebox|music|dance|dancing)\b/.test(q))return 'music';
 if(/\b(?:inventory|storage|carry items|chest storage)\b/.test(q))return 'storage';
 if(/\b(?:equip|equipment|armor|armour|harness|carpet)\b/.test(q))return 'equipment';
 if(/\b(?:horn|horns|ram|ramming)\b/.test(q))return 'horns';
 if(/\b(?:name tag|rename|naming|jeb|toast)\b/.test(q))return 'naming';
 if(/\b(?:dig|digs|digging)\b/.test(q))return 'digging';
 if(/\b(?:sleep|sleeping|gifts)\b/.test(q))return 'sleeping';
 if(/\b(?:teleport|teleportation)\b/.test(q))return 'teleportation';
 if(/\b(?:anger|angry|provoke|provoked)\b/.test(q))return 'anger';
 if(/\b(?:vibration|vibrations|hear|hearing|smell|sneak|sneaking)\b/.test(q))return 'vibrations';
 return null;
}
export function flowerStewAnswer(id,q,variant) {
 if(id!=='minecraft:mooshroom'||/\bbaby\b/.test(q))return null;
 const flower=Object.keys(flowers.effects).sort((a,b)=>b.length-a.length).find(f=>(' '+q+' ').includes(' '+f+' '));
 if(!flower)return null;
 if(variant==='red')return {status:'conditional',answer:'Red mooshrooms do not make suspicious stew from flowers. Use a brown mooshroom instead.',subject:id,topic:'milking',sources:[flowers.source]};
 const effect=flowers.effects[flower],duration=flowers.bedrock_duration_seconds?.[flower];
 return {status:'conditional',answer:`Feed ${flower} to an adult brown mooshroom, then use a bowl for suspicious stew with ${effect}${duration!==undefined?' for '+duration+' seconds in Bedrock':''}. It gives ordinary mushroom stew again until fed another flower.`,subject:id,topic:'milking',sources:[flowers.source]};
}
