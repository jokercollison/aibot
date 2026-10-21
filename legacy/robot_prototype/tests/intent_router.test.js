const assert=require('assert');const k=require('../scripts/intent_router');
const cases=[
 ['How do I craft a hopper?','recipe','hopper'],
 ['What is the recipe for hoppers?','recipe','hopper'],
 ['Can you tell me how to breed cows?','mob_breeding','cow'],
 ['Are creepers scared of anything?','mob_avoidance','creeper'],
 ['Will a zombie drown?','mob_breathing','zombie'],
 ['Does a creeper burn in lava?','mob_fire','creeper'],
 ['What do skeletons drop?','mob_drops','skeleton'],
 ['Where can I find diamonds?','obtainment','diamond']
];
for(const [q,i,s] of cases){let p=k.parse(q);assert.equal(p.intent,i,q);assert.equal(p.subject,s,q);}
let r=k.answer('How do I craft a hopper?');assert.equal(r.status,'found');assert(r.answer.length>25);
let x=k.answer('Will a zombie drown?');assert(['found','unknown'].includes(x.status));
assert.equal(k.answer('').status,'clarify');
console.log('PASS: 11 intent, routing, and abstention checks');
