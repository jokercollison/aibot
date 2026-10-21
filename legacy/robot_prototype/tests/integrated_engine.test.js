const assert=require('node:assert/strict');const {resolve}=require('../scripts/integrated_engine');
const cases=[
 ['How do I craft a hopper?','recipes','hopper'],['What is the recipe for hoppers?','recipes','hopper'],['How do I make a bookshelf?','recipes','bookshelf'],
 ['Tell me about creepers','mobs','creeper'],['What is a cow?','mobs','cow'],['What is sharpness enchantment?','enchantments','sharpness'],
 ['What is the maximum level of mending enchantment?','enchantments','mending'],['Where can I find diamond?','loot','diamond'],
 ['How do I breed cows?','profiles','cow'],['Are creepers afraid of anything?','profiles','creeper'],['Will a cow drown?','profiles','cow'],
 ['Will a creeper burn in lava?','profiles','creeper']
];
for(const [q,category,subj] of cases){const r=resolve(q);assert.equal(r.category,category,JSON.stringify({q,r}));assert.equal(r.subject,subj);assert.ok(r.answer.length>15);}
for(const q of ['','Tell me about unicorns','How do I craft an imaginary warp rocket?']){const r=resolve(q);assert.ok(!['found','technical_evidence'].includes(r.status),JSON.stringify(r));}
const r=resolve('How do I craft a hopper?');assert.match(r.answer,/iron ingot/);assert.match(r.answer,/chest/);
console.log('PASS '+(cases.length+4)+' integrated resolver checks');
