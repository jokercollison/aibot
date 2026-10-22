import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const completion=JSON.parse(readFileSync('docs/BLOCK_CORE_COMPLETION.json'));
test('normal block baseline reconciles every subject without hiding in-scope unknowns',()=>{
 assert.equal(Object.keys(completion.subjects).length,1463);
 assert.equal(completion.normal_blocks,1268);assert.equal(completion.other_blocks,195);
 assert.equal(completion.normal_core_complete,true);assert.equal(completion.full_wiki_complete,false);
 assert.deepEqual(completion.blockers,[]);
 for(const row of Object.values(completion.subjects))if(row.role==='normal'){
  for(const t of ['identity','uses','mining','location','recipe'])assert.ok(row.required_topics.includes(t));
  assert.equal(row.baseline_complete,true);
 }
});
test('acquisition questions use known recipes without inventing natural generation',()=>{
 const ask=q=>createConversation().ask(q);
 assert.match(ask('Where can I get a crafting table?').answer,/4 wooden planks/);
 assert.match(ask('Where can I find a red candle cake?').answer,/candle on an untouched cake/);
 assert.match(ask('Where can I find exposed copper trapdoors?').answer,/oxidize/);
 assert.match(ask('Where can I find a blue shulker box?').answer,/dye/);
});
test('recipe fallbacks preserve exact wood and distinguish world acquisition from crafting',()=>{
 const ask=q=>createConversation().ask(q);
 assert.match(ask('How do I craft an acacia button?').answer,/1 acacia plank/);
 assert.match(ask('How do I craft a spruce trapdoor?').answer,/6 spruce planks/);
 assert.match(ask('How do I craft a sea lantern?').answer,/4 prismarine shards and 5 prismarine crystals/);
 assert.match(ask('How do I craft a bed?').answer,/3 matching wool and 3 wooden planks/);
 const a=ask('How do I craft oak leaves?');assert.equal(a.topic,'acquisition');assert.match(a.answer,/Here's how to get/);
 assert.match(ask('How do I craft bedrock?').answer,/cannot craft/);
});
test('new redstone and sign followups keep their subject',()=>{
 const c=createConversation();c.ask('What is a sculk sensor?');
 assert.match(c.ask('How does redstone affect it?').answer,/comparator.*frequency/);
 c.ask('What is a sign?');assert.match(c.ask('How do I wax it?').answer,/honeycomb/i);
});

test('ender chest inventory remains personal and cannot be hopper automated',()=>{
 const c=createConversation();c.ask('What is an ender chest?');
 assert.match(c.ask('How many slots does it hold?').answer,/27 personal slots/);
 assert.match(c.ask('How does redstone affect it?').answer,/Hoppers cannot.*comparators do not/);
 assert.match(createConversation().ask('Can I craft a monster spawner?').answer,/cannot craft/);
});
