import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const data=JSON.parse(readFileSync('data/blocks/masonry.json'));
const blocks=Object.values(JSON.parse(readFileSync('data/catalog.json')).records).filter(r=>r.kind==='block');
const loc=JSON.parse(readFileSync('data/location_facts.json'));
const prompts={mining:'How do I mine',location:'Where can I find',fire:'Can fire burn',gravity:'Does gravity affect',water:'What happens with water and',oxidation:'How does oxidation affect'};
test('every masonry catalog member routes all reviewed facets',()=>{
 let checked=0;
 for(const rule of data.rules) {
  const members=blocks.filter(r=>new RegExp('^(?:'+rule.pattern+')$').test(r.minecraft_id.slice(10)));
  assert.ok(members.length,rule.id);
  for(const r of members)for(const [topic,text] of Object.entries(rule.topics)) {
   const q=`${prompts[topic]} block:${r.minecraft_id}?`;
   const a=createConversation().ask(q);assert.equal(a.status,'conditional',q);
   const existing=loc[r.minecraft_id]??Object.values(loc).find(f=>f.related_ids?.includes(r.minecraft_id));
   if(topic==='location'&&existing)assert.equal(a.answer,existing.answer,q);
   else {assert.equal(a.topic,topic,q);assert.equal(a.answer,text,q);}
   assert.doesNotMatch(a.answer,/Java|registry|supplied|oldid/);checked++;
  }
 }
 assert.equal(checked,1145);
});
test('shape questions preserve double-slab drops and waterlogging',()=>{
 const ask=q=>createConversation().ask(q).answer;
 assert.match(ask('How do I mine a cobbled deepslate double slab?'),/2 matching slabs/);
 assert.match(ask('Can sandstone slabs be waterlogged?'),/can be waterlogged/);
 assert.match(ask('Can sandstone double slabs be waterlogged?'),/cannot be waterlogged/);
 assert.match(ask('How do I mine waxed oxidized cut copper stairs?'),/stone pickaxe or better/);
 assert.match(ask('How do I mine waxed exposed double cut copper slabs?'),/2 matching slabs/);
});
test('storage block requirements are distinct from corresponding ore requirements',()=>{
 const ask=q=>createConversation().ask(q).answer;
 for(const [name,tier] of [['iron','stone'],['gold','iron'],['diamond','iron'],['emerald','iron'],['lapis','stone'],['netherite','diamond'],['redstone','wooden'],['coal','wooden']]) {
  assert.match(ask(`How do I mine block:minecraft:${name}_block?`),new RegExp(tier+' pickaxe or better'));
 }
});
test('luminous blocks and amethyst retain Bedrock drop exceptions',()=>{
 const ask=q=>createConversation().ask(q).answer;
 assert.match(ask('Does Fortune work on sea lanterns?'),/Fortune does not increase/);
 assert.match(ask('Does Fortune work on glowstone?'),/cannot exceed 4/);
 assert.match(ask('How do I mine gilded blackstone?'),/10%.*100% at Fortune III/);
 assert.match(ask('How do I mine an amethyst cluster?'),/4 amethyst shards.*Fortune/);
 assert.match(ask('How do I mine a small amethyst bud?'),/buds drop nothing/);
 assert.match(ask('What happens with water and soul sand?'),/upward bubble column/);
 assert.match(ask('What happens with water and soul soil?'),/does not create bubble columns/);
});
test('copper oxidation followups preserve the selected subject',()=>{
 const c=createConversation();c.ask('What is weathered cut copper?');
 assert.match(c.ask('How do I wax it?').answer,/honeycomb/);
 assert.match(c.ask('How do I scrape it?').answer,/one stage/);
 assert.match(createConversation().ask('Can waxed copper oxidize?').answer,/does not oxidize further/);
});
