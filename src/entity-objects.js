export const objectTopics=['projectile_use','projectile_effects','retrieval','propulsion','posing','activation','availability','interactions'];
export function objectTopic(q) {
 if(/^(?:what (?:is|are)|describe|tell me about)\b/.test(q))return null;
 if(/\b(?:interact|interaction|interactions)\b/.test(q))return 'interactions';
 if(/\b(?:retrieve|retrieval|recover|recovery|pick up|pickup|pick it up|collect it|collect them|return to me)\b/.test(q))return 'retrieval';
 if(/\b(?:steer|steering|propel|propulsion|paddle|paddling|powered activator|activator rail|power a minecart|power the minecart)\b/.test(q))return 'propulsion';
 if(/\b(?:pose|poses|posing)\b/.test(q))return 'posing';
 if(/\b(?:ignite|ignition|prime|priming|activate|activation|detonate|detonation)\b/.test(q))return 'activation';
 if(/\b(?:available in survival|obtain in survival|survival recipe|education only|creator only)\b/.test(q))return 'availability';
 if(/\b(?:throw|shoot|fire|launch|cast)\b/.test(q)&&!/\b(?:drop|drops|burn|burning|immune|immunity|lava|on fire)\b/.test(q))return 'projectile_use';
 if(/\b(?:projectile effects|on impact|when it hits|when they hit|what happens.*hits)\b/.test(q))return 'projectile_effects';
 return null;
}
