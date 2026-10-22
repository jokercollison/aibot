import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const ask=q=>createConversation().ask(q);
const data=JSON.parse(fs.readFileSync('data/entities/special_editorial.json'));
test('all authored special interaction facts compile with preserved revision pointers',()=>{
 const runtime=JSON.parse(fs.readFileSync('data/entities/runtime.json'));
 for(const [id,row] of Object.entries(data.subjects))for(const [topic,fact] of Object.entries(row.topics)) {
  assert.equal(runtime[id].topics[topic].answer,fact.answer,id+' '+topic);
  assert.match(fact.sources[0],/Special:PermanentLink\/\d+/);
 }
});
test('lead eligibility is explicit, including anger, hostile riders and non-leashable mobs',()=>{
 for(const [id,row] of Object.entries(data.subjects))if(row.topics.leashing) {
  const r=ask(`Can I leash entity:${id}?`);assert.equal(r.subject,id,id);assert.equal(r.answer,row.topics.leashing.answer,id);
 }
 assert.match(ask('Can I put a lead on a wolf?').answer,/not angry/);
 assert.match(ask('Can I leash a zombie nautilus?').answer,/not be angry or ridden/);
 assert.match(ask('Can I leash a turtle?').answer,/No/);
});
test('bucket transport preserves age/state restrictions and does not become feeding advice',()=>{
 for(const n of ['axolotl','cod','salmon','pufferfish','tadpole'])assert.equal(ask(`Can I put a ${n} in a bucket?`).topic,'bucketing',n);
 assert.match(ask('Can I bucket a small sulfur cube?').answer,/Small sulfur cubes cannot be bucketed/);
 assert.match(ask('Can I bucket a sulfur cube with ignited TNT?').answer,/ignited TNT/);
 const c=createConversation();c.ask('What is an axolotl?');assert.match(c.ask('Can I bucket it?').answer,/water bucket/);
 assert.match(ask('Can I breed axolotls with buckets of tropical fish?').answer,/tropical fish/i);
});
test('allay deliveries and copper-golem sorting retain the correct creature',()=>{
 const c=createConversation();assert.match(c.ask('Can an allay collect items from a copper chest?').answer,/does not.*take them from chests/);
 assert.match(c.ask('Can it deliver to a note block?').answer,/30 seconds/);
 assert.match(ask('Can a copper golem sort items into a trapped chest?').answer,/up to 16/);
 assert.match(ask('How do I take back an allay held item?').answer,/empty hand/);
});
test('panda and sniffer breeding checks survive explicit food and pronoun follow-ups',()=>{
 const c=createConversation();c.ask('What is a panda?');assert.match(c.ask('Why won’t it breed?').answer,/eight bamboo plants within five blocks/);
 assert.match(ask('Can I breed a panda with bamboo?').answer,/eight bamboo plants/);
 assert.match(ask('Can I breed sniffers with torchflower seeds?').answer,/full health/);
 assert.match(ask('Why won’t villagers breed?').answer,/mobGriefing/);
});
test('villager job changes, restocking and curing retain important exclusions',()=>{
 assert.match(ask('Why won’t my villager change profession?').answer,/Once you trade/);
 const c=createConversation();c.ask('What is a villager?');assert.match(c.ask('Why won’t it restock?').answer,/own claimed workstation/);
 assert.match(ask('How do I cure a zombie villager?').answer,/not an enchanted golden apple/);
 assert.match(ask('How do I cure a zombie villager?').answer,/three to five minutes/);
});
test('trust, sitting, collars and shoulders are separate actions',()=>{
 assert.match(ask('How do I gain a fox trust?').answer,/resulting baby trusts/);
 assert.match(ask('How do I gain an ocelot trust?').answer,/does not turn into a pet cat/);
 assert.match(ask('How do I make my wolf sit?').answer,/owner/);
 assert.match(ask('How do I dye my wolf collar?').answer,/does not change.*coat/);
 assert.match(ask('How do I put my parrot on my shoulder?').answer,/not commanded to sit/);
});
test('practical interaction topics do not leak Java-only or lethal-food advice',()=>{
 assert.match(ask('How does a dolphin help me find treasure?').answer,/shipwreck or ocean ruin/);
 assert.match(ask('How does a dolphin help me swim faster?').answer,/not displayed as a Dolphin’s Grace/);
 assert.match(ask('Can bees pollinate crops?').answer,/nectar/);
 assert.match(ask('How do I harvest honey from bees?').answer,/campfire/);
 assert.match(ask('Why is my sniffer not digging?').answer,/eight minutes/);
 assert.match(ask('Why won’t a turtle lay eggs?').answer,/home beach/);
 assert.match(ask('Can I feed my parrot a cookie?').answer,/kill|poison/i);
});
