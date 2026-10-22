import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const locations=JSON.parse(readFileSync('data/location_facts.json'));
const data=JSON.parse(readFileSync('data/blocks/terrain.json'));
const ask=q=>createConversation().ask(q);
test('reviewed block facets answer through the real conversation engine',()=>{
 for(const [id,entry] of Object.entries(data.subjects)) {
  for(const [topic,q] of [['mining',`How do I mine block:${id}?`],['location',`Where can I find block:${id}?`]]) {
   const result=ask(q);
   if(topic==='location' && (locations[id] || Object.values(locations).some(f=>f.related_ids?.includes(id)))) {assert.equal(result.status,'conditional',q);continue;}
   assert.equal(result.topic,topic,q);
   assert.equal(result.answer,entry.topics[topic],q);
   assert.doesNotMatch(result.answer,/Java|registry|supplied|oldid|revision/);
  }
 }
});
test('mining questions preserve important drop and enchantment exceptions',()=>{
 for(const [q,pattern] of [
  ['Can I use Silk Touch on budding amethyst?',/nothing, even with Silk Touch/],
  ['What tool do I need for obsidian?',/diamond or netherite pickaxe/],
  ['Does Fortune work on clay?',/does not increase/],
  ['What drops when I break glass?',/drops nothing unless/],
  ['Does Fortune III work on gravel?',/100%/],
  ['How do I mine ancient debris?',/Fortune does not multiply/],
  ['Where is packed ice found?',/ice spikes/]
 ])assert.match(ask(q).answer,pattern,q);
});
test('block facet follow-ups retain subject and keep recipe presentation intact',()=>{
 const c=createConversation();c.ask('What is obsidian?');
 assert.match(c.ask('How do I mine it?').answer,/diamond or netherite/);
 assert.match(c.ask('Where can I find it?').answer,/lava source/);
 assert.match(ask('How do I craft glass?').answer,/sand/);
 assert.doesNotMatch(ask('How do I craft a bookshelf?').answer,/Grid|shaped|Station/);
});
test('unreviewed mining mechanics do not masquerade as definitions',()=>{
 assert.equal(ask('How do I mine reinforced deepslate?').status,'unknown');
 assert.match(ask('What is a hopper?').answer,/collects and moves/);
});
