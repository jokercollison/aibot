import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const ask=q=>createConversation().ask(q);
const data=JSON.parse(fs.readFileSync('data/entities/diet_editorial.json'));
test('reviewed dietary summaries connect every positive feeding profile and additional inventory cases',()=>{
 const runtime=JSON.parse(fs.readFileSync('data/entities/runtime.json'));
 for(const [id,row] of Object.entries(runtime))if(Object.keys(row.feeding.roles).length)assert.ok(data.subjects[id],id);
 assert.equal(Object.keys(data.subjects).length,39);
 for(const [id,row] of Object.entries(data.subjects)) {
  const r=ask(`What does entity:${id} eat?`);
  assert.equal(r.subject,id,id);assert.equal(r.topic,'diet',id);
  assert.equal(r.answer,row.topics.diet.answer,id);assert.equal(r.coverage,'reviewed_summary');
  assert.ok(r.sources.length,id);
 }
});
test('explicit taming and breeding requests take priority over mentioning a baby',()=>{
 for(const q of ['Can I tame a baby wolf with beef?','Can I tame a baby wolf using fish?'])assert.match(ask(q).answer,/No.*cannot be used for taming.*bones/);
 assert.match(ask('Can I tame a baby wolf with bones?').answer,/For taming.*bone/);
 assert.match(ask('Can I breed baby cows with wheat?').answer,/cannot breed/);
 assert.match(ask('Can I grow a baby cow with carrots?').answer,/No.*cannot be used for growth/);
 assert.match(ask('Can I breed wolves with fish?').answer,/No.*cannot be used for breeding/);
 assert.match(ask('Can I heal a wolf with fish?').answer,/For healing.*cod/);
});
test('observed eating is distinct from breeding and from picking up an item',()=>{
 assert.match(ask('Can a panda eat cake?').answer,/Adult pandas.*cake does not breed/);
 assert.match(ask('Can I breed pandas with cake?').answer,/No.*bamboo/);
 assert.match(ask('Can a fox eat chicken?').answer,/edible item.*mouth.*berries/);
 assert.match(ask('Can a piglin eat porkchops?').answer,/not bartering or breeding/);
 assert.match(ask('Can an allay eat sugar?').answer,/hold that item.*not animal breeding/);
 assert.match(ask('Can a villager eat bread?').answer,/3 bread.*spare beds/);
 assert.match(ask('Can a villager eat wheat seeds?').answer,/Farmers.*not the same as ready breeding food/);
});
test('frog prey size is taken from the prey rather than incidental creature words',()=>{
 for(const name of ['slimes','magma cubes']) {
  const yes=ask(`Can frogs eat small ${name}?`);assert.equal(yes.subject,'minecraft:frog');assert.match(yes.answer,/Frogs swallow small/);
  assert.match(ask(`Can frogs eat large ${name}?`).answer,/No.*only swallow the smallest/);
 }
 assert.match(ask('Can small frogs eat large magma cubes?').answer,/No/);
 assert.match(ask('What do frogs swallow?').answer,/slimeballs|small slimes/i);
});
test('diet follow-ups remain private and distinguish generic guidance from a specific unsupported food',()=>{
 const c=createConversation();c.ask('What is a panda?');
 assert.match(c.ask('What does it eat?').answer,/bamboo and cake/);
 assert.match(c.ask('Can it eat cake?').answer,/cake does not breed/);
 c.ask('What is a wolf?');assert.match(c.ask('Can I tame it with beef?').answer,/No.*taming/);
 assert.equal(createConversation().ask('Can it eat cake?').status,'unknown');
 assert.equal(ask('Can a panda eat diamonds?').status,'unknown');
});

test('mentioning a baby does not silently turn an eating question into growth',()=>{
 const r=ask('Can a baby wolf eat fish?');
 assert.equal(r.topic,'diet');assert.match(r.answer,/For healing/);
 assert.doesNotMatch(r.answer,/cannot be used for growth/);
 assert.match(ask('What does a baby cow eat?').answer,/wheat.*calves/);
});
