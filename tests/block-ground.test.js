import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const ground=JSON.parse(readFileSync('data/blocks/ground.json'));
const catalog=JSON.parse(readFileSync('data/catalog.json')).records;
const locations=JSON.parse(readFileSync('data/location_facts.json'));
const terrain=JSON.parse(readFileSync('data/blocks/terrain.json')).subjects;
const prompts={mining:'How do I mine',location:'Where can I find',fire:'Can fire burn',gravity:'Does gravity affect',water:'What happens with water and'};
test('all ground-family members answer reviewed facets through public conversation',()=>{
 let count=0;
 for(const rule of ground.rules) {
  const members=Object.values(catalog).filter(r=>r.kind==='block'&&new RegExp('^(?:'+rule.pattern+')$').test(r.minecraft_id.slice(10)));
  assert.ok(members.length,rule.id);
  for(const r of members)for(const [topic,text] of Object.entries(rule.topics)) {
   const q=`${prompts[topic]} block:${r.minecraft_id}?`;
   const a=createConversation().ask(q);
   assert.equal(a.status,'conditional',q);
   const oldLocation=locations[r.minecraft_id]??Object.values(locations).find(f=>f.related_ids?.includes(r.minecraft_id));
   if(topic==='location'&&oldLocation)assert.equal(a.answer,oldLocation.answer,q);
   else {assert.equal(a.topic,topic,q);assert.equal(a.answer,terrain[r.minecraft_id]?.topics[topic]??text,q);}
   assert.doesNotMatch(a.answer,/Java|registry|oldid|supplied/);count++;
  }
 }
 assert.ok(count>250,`Only ${count} ground facet checks`);
});
test('ore tool tiers and Silk Touch rules keep important distinctions',()=>{
 const ask=q=>createConversation().ask(q).answer;
 assert.match(ask('What does diamond ore drop?'),/1 diamond.*Fortune/);
 assert.match(ask('How do I mine diamond ore?'),/iron pickaxe or better/);
 assert.match(ask('How do I mine copper ore?'),/stone pickaxe or better.*2–5 raw copper/);
 assert.match(ask('Does Fortune work on deepslate iron ore?'),/raw iron.*Fortune can increase/);
 assert.match(ask('How do I mine Nether gold ore?'),/2–6 gold nuggets.*gold ingot/);
 assert.match(ask('How do I mine quartz ore?'),/1 Nether quartz/);
 assert.match(ask('How do I mine deepslate?'),/cobbled deepslate.*Silk Touch/);
 assert.match(ask('How do I mine packed mud?'),/even by hand/);
 assert.match(ask('How do I mine mud bricks?'),/Without a pickaxe it drops nothing/);
});
test('soil exceptions and shared family followups stay attached to their block',()=>{
 const c=createConversation();c.ask('What is podzol?');
 assert.match(c.ask('How do I mine it?').answer,/Silk Touch.*otherwise it drops dirt/);
 assert.match(c.ask('Where can I find it?').answer,/old growth taiga/);
 assert.match(createConversation().ask('What happens with water and red sand?').answer,/cannot replace ordinary sand/);
 assert.match(createConversation().ask('Does red sandstone fall?').answer,/does not fall/);
});
test('unrelated reinforced and infested deepslate do not inherit ordinary drops',()=>{
 for(const id of ['reinforced_deepslate','infested_deepslate']) {
  const a=createConversation().ask(`How do I mine block:minecraft:${id}?`);
  assert.equal(a.status,'unknown');
 }
});
