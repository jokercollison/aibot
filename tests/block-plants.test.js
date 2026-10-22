import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const data=JSON.parse(readFileSync('data/blocks/plants.json'));
const blocks=Object.values(JSON.parse(readFileSync('data/catalog.json')).records).filter(r=>r.kind==='block');
const locations=JSON.parse(readFileSync('data/location_facts.json'));
const prompts={mining:'How do I harvest',location:'Where can I find',growth:'How do I grow',water:'What happens with water and'};
test('every reviewed plant catalog member routes every authored facet',()=>{
 let count=0;
 for(const rule of data.rules) {
  const members=blocks.filter(r=>new RegExp('^(?:'+rule.pattern+')$').test(r.minecraft_id.slice(10)));
  assert.ok(members.length,rule.id);
  for(const r of members)for(const [topic,text] of Object.entries(rule.topics)) {
   const q=`${prompts[topic]} block:${r.minecraft_id}?`;
   const a=createConversation().ask(q);assert.equal(a.status,'conditional',q);
   const old=locations[r.minecraft_id]??Object.values(locations).find(f=>f.related_ids?.includes(r.minecraft_id));
   if(topic==='location'&&old)assert.equal(a.answer,old.answer,q);
   else {assert.equal(a.topic,topic,q);assert.equal(a.answer,text,q);}
   assert.doesNotMatch(a.answer,/Java|registry|oldid|supplied/);count++;
  }
 }
 assert.ok(count>=319);
});
test('sapling sizes, propagules and planted foliage retain their exceptions',()=>{
 const ask=q=>createConversation().ask(q).answer;
 assert.match(ask('How do I grow dark oak saplings?'),/4 matching saplings.*2-by-2/);
 assert.match(ask('How do I grow spruce saplings?'),/single saplings can grow smaller/);
 assert.match(ask('How do I harvest mangrove propagules?'),/Immature hanging propagules drop nothing/);
 assert.match(ask('Does Fortune work on oak leaves?'),/apples/);
 assert.doesNotMatch(ask('Does Fortune work on birch leaves?'),/apples/);
});
test('crop questions distinguish farmland, water and bone meal requirements',()=>{
 const ask=q=>createConversation().ask(q).answer;
 assert.match(ask('How do I grow wheat?'),/farmland.*Light level 9/);
 assert.match(ask('How do I grow Nether wart?'),/soul sand, not soul soil.*Bone meal does not/);
 assert.match(ask('How do I grow sugar cane?'),/Bone meal speeds/);
 assert.match(ask('How do I grow cactus?'),/bone meal does not/i);
 assert.match(ask('Does Fortune work on cocoa?'),/does not increase/);
 assert.match(ask('How do I mine farmland?'),/Silk Touch does not/);
});
test('aquatic harvesting and coral survival keep Bedrock distinctions',()=>{
 const ask=q=>createConversation().ask(q).answer;
 assert.match(ask('How do I harvest seagrass?'),/shears/);
 assert.match(ask('How do I harvest vines?'),/Silk Touch.*does not/);
 assert.match(ask('How do I harvest twisting vines?'),/Fortune III.*top/);
 assert.match(ask('How do I harvest weeping vines?'),/Fortune III.*bottom/);
 assert.match(ask('How do I harvest brain coral blocks?'),/Silk Touch pickaxe/);
 assert.match(ask('How do I harvest dead brain coral blocks?'),/Silk Touch is unnecessary/);
 assert.match(ask('What happens with water and dead brain coral?'),/cannot be revived/);
});
test('plant followups keep subject and unrelated definitions retain meaning',()=>{
 const c=createConversation();c.ask('What is a cherry sapling?');
 assert.match(c.ask('How do I grow it?').answer,/Bone meal/);
 assert.match(c.ask('Where can I find it?').answer,/cherry groves/);
 assert.match(c.ask('How do I harvest it?').answer,/Saplings drop themselves/);
 assert.match(createConversation().ask('How do I mine chorus plant?').answer,/chorus fruit/);
 assert.match(createConversation().ask('What is chorus plant?').answer,/chorus/i);
});

test('new root, moss and fruit exceptions answer natural questions',()=>{
 const ask=q=>createConversation().ask(q).answer;
 assert.match(ask('How do I harvest hanging roots?'),/shears or a Silk Touch/);
 assert.match(ask('How do I grow small dripleaf?'),/does not multiply/);
 assert.match(ask('How do I grow pale hanging moss?'),/does not naturally.*bone meal/i);
 assert.match(ask('How do I grow crimson fungus?'),/crimson nylium/);
 assert.match(ask('How do I harvest glow berries?'),/Fortune does not increase/);
 assert.match(ask('What does a melon block drop?'),/3–7 melon slices.*capped at 9/);
 assert.match(ask('How do I grow pumpkin stems?'),/does not instantly create the fruit/);
});
