import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const data=JSON.parse(readFileSync('data/blocks/utility.json'));
const blocks=Object.values(JSON.parse(readFileSync('data/catalog.json')).records).filter(r=>r.kind==='block');
const prompts={fire:'What happens with fire and',mining:'How do I mine',operation:'How do I use',location:'Where can I find',redstone:'How does redstone affect',gravity:'Does gravity affect',water:'What happens with water and',danger:'Is it dangerous to use',storage:'How many slots are in',oxidation:'How does oxidation affect'};
test('all utility catalog members route all authored facets',()=>{
 let checked=0;
 for(const rule of data.rules) {
  const members=blocks.filter(r=>new RegExp('^(?:'+rule.pattern+')$').test(r.minecraft_id.slice(10)));
  assert.ok(members.length,rule.id);
  for(const r of members)for(const [topic,text] of Object.entries(rule.topics)) {
   const q=`${prompts[topic]} block:${r.minecraft_id}?`;
   const a=createConversation().ask(q);assert.equal(a.status,'conditional',q);
   assert.equal(a.topic,topic,q);assert.equal(a.answer,text,q);checked++;
   assert.doesNotMatch(a.answer,/Java|supplied|registry|oldid/);
  }
 }
 assert.equal(checked,405);
});
test('lighting and campfires preserve ordinary collection and Silk Touch exceptions',()=>{
 const ask=q=>createConversation().ask(q).answer;
 assert.match(ask('How do I mine a lantern?'),/by hand/);
 assert.match(ask('How do I mine a campfire?'),/Silk Touch.*2 charcoal/);
 assert.match(ask('How do I mine a soul campfire?'),/Silk Touch.*soul soil/);
 assert.match(ask('How does redstone affect a torch?'),/does not supply redstone/);
 assert.match(ask('How do I mine copper chains?'),/any pickaxe/);
 assert.match(ask('How do I mine copper bars?'),/any pickaxe/);
});
test('transport controls do not confuse powered, detector and activator rails',()=>{
 const ask=q=>createConversation().ask(q).answer;
 assert.match(ask('How do I use powered rails?'),/accelerat/);
 assert.match(ask('How do I use detector rails?'),/sensors/);
 assert.match(ask('How do I use activator rails?'),/ejecting passengers/);
 assert.match(ask('How do I mine a cobweb?'),/shears.*1 string/);
 assert.match(ask('How do I mine oak double slabs?'),/2 matching slabs/);
});
test('dimension utility and uncollectible blocks retain explicit limits',()=>{
 const ask=q=>createConversation().ask(q).answer;
 assert.match(ask('Is a bed dangerous?'),/Nether or the End/);
 assert.match(ask('Is a respawn anchor dangerous?'),/outside the Nether/);
 assert.match(ask('How do I mine a respawn anchor?'),/diamond or netherite.*loses/);
 assert.match(ask('How do I mine a monster spawner?'),/even with Silk Touch/);
 assert.match(ask('How do I mine a vault?'),/drop nothing|drop.*nothing/i);
 assert.match(ask('How do I use a beacon?'),/iron, gold, emerald, diamond or netherite/);
 assert.match(ask('How do I use a conduit?'),/At least 16/);
});
