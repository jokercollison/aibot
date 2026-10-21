const assert=require('node:assert/strict');const {resolve,classify}=require('../scripts/resolver_v45');
const checks=[
 ['How do I craft a hopper?','recipes','hopper'],['What is the recipe for hoppers?','recipes','hopper'],
 ['How do I make a bookshelf?','recipes','bookshelf'],['What is sharpness enchantment?','enchantments','sharpness'],
 ['How do I breed cows?','profiles','cow'],['Are creepers afraid of anything?','profiles','creeper'],
 ['Will a cow drown?','profiles','cow'],['Will a creeper burn in lava?','profiles','creeper'],
 ['Where can I find diamond?','loot','diamond']
];
for(const [q,c,s] of checks){let r=resolve(q);assert.equal(r.category,c,JSON.stringify({q,r}));assert.equal(r.subject,s);assert.ok(r.answer.length>10);}
let x=resolve('What can I craft with iron ingots?');assert.equal(x.intent,'ingredient_uses');assert.equal(x.status,'found');assert.ok(x.total_outputs>0);
let y=resolve('How do I make a hopper?');assert.match(y.answer,/iron ingot/);assert.match(y.answer,/chest/);
let z=resolve('How do I brew nightvision potion?');assert.equal(z.category,'brewing');assert.ok(z.variant_count>=1);
for(let q of ['','How do I craft a unicorn spaceship?','What is the health of imaginary monster?']){let r=resolve(q);assert.ok(!['found','evidence_with_caveat'].includes(r.status));}
assert.equal(classify('What can I make with diamonds?'),'ingredient_uses');
console.log('PASS '+(checks.length+7)+' v45 checks');
