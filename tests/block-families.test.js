import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const families=JSON.parse(readFileSync('data/blocks/families.json')).rules;
const blocks=Object.values(JSON.parse(readFileSync('data/catalog.json')).records).filter(r=>r.kind==='block');
const prompts={mining:'How do I mine',location:'Where can I find',fire:'Can fire burn',gravity:'Does gravity affect',water:'What happens with water and',stripping:'How do I strip'};
test('all family catalog members route every reviewed facet through conversation',()=>{
 let total=0;
 for(const rule of families) {
  const members=blocks.filter(r=>new RegExp('^(?:'+rule.pattern+')$').test(r.minecraft_id.slice(10)));
  assert.ok(members.length,rule.id);
  for(const r of members)for(const topic of Object.keys(rule.topics)) {
   const q=`${prompts[topic]} block:${r.minecraft_id}?`;
   const a=createConversation().ask(q);
   assert.equal(a.status,'conditional',q);assert.equal(a.topic,topic,q);
   assert.doesNotMatch(a.answer,/Java|registry|supplied|revision|oldid/);total++;
  }
 }
 assert.ok(total>600,`Only ${total} routed questions`);
});
test('colors share mechanics while powder, panes and tinted glass preserve exceptions',()=>{
 const ask=q=>createConversation().ask(q).answer;
 assert.match(ask('Does blue concrete fall?'),/does not fall/);
 assert.match(ask('Does blue concrete powder fall?'),/falls when unsupported/);
 assert.match(ask('Can rain harden red concrete powder?'),/Rain.*do not/);
 assert.match(ask('Can glass panes be waterlogged?'),/can be waterlogged/);
 assert.match(ask('Can glass be waterlogged?'),/cannot be waterlogged/);
 assert.match(ask('How do I mine tinted glass?'),/even when broken by hand/);
 assert.match(ask('How do I mine red stained glass?'),/Without Silk Touch it drops nothing/);
 assert.match(ask('Can crimson planks burn?'),/do not catch fire/);
 assert.match(ask('Can oak planks burn?'),/flammable/);
});
test('family followups and recipe questions remain separate',()=>{
 const c=createConversation();c.ask('What is blue wool?');
 assert.match(c.ask('How do I mine it?').answer,/Shears/);
 assert.match(c.ask('Can it burn?').answer,/flammable/);
 assert.match(c.ask('Does it fall?').answer,/does not fall/);
 c.ask('What are oak planks?');
 assert.match(c.ask('How do I craft it?').answer,/To craft/);
});

test('all wool colors have ingredient-only recipe fallbacks',()=>{
 for(const r of blocks.filter(r=>/:(?:white|orange|magenta|light_blue|yellow|lime|pink|gray|light_gray|cyan|purple|blue|brown|green|red|black)_wool$/.test(r.minecraft_id))) {
  const a=createConversation().ask('How do I craft block:'+r.minecraft_id+'?');
  assert.equal(a.status,'conditional');assert.match(a.answer,r.minecraft_id==='minecraft:white_wool'?/4 strings?/:/1 wool and 1 .* dye/);
  assert.doesNotMatch(a.answer,/grid|shaped|station|top|bottom/i);
 }
});
