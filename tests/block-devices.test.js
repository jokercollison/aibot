import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const data=JSON.parse(readFileSync('data/blocks/devices.json'));
const blocks=Object.values(JSON.parse(readFileSync('data/catalog.json')).records).filter(r=>r.kind==='block');
const prompts={mining:'How do I mine',operation:'How do I use',storage:'How many slots are in',redstone:'How does redstone affect',oxidation:'How does oxidation affect',gravity:'Does gravity affect'};
test('every reviewed device member routes each authored facet',()=>{
 let count=0;
 for(const rule of data.rules) {
  const members=blocks.filter(r=>new RegExp('^(?:'+rule.pattern+')$').test(r.minecraft_id.slice(10)));
  assert.ok(members.length,rule.id);
  for(const r of members)for(const [topic,text] of Object.entries(rule.topics)) {
   const q=`${prompts[topic]} block:${r.minecraft_id}?`;
   const a=createConversation().ask(q);assert.equal(a.status,'conditional',q);
   assert.equal(a.topic,topic,q);assert.equal(a.answer,text,q);
   assert.doesNotMatch(a.answer,/Java|registry|oldid|supplied/);count++;
  }
 }
 assert.equal(count,623);
});
test('copper device harvesting is not generalized from copper blocks',()=>{
 const ask=q=>createConversation().ask(q).answer;
 assert.match(ask('How do I mine copper doors?'),/by hand/);
 assert.match(ask('How do I mine copper lanterns?'),/by hand/);
 for(const part of ['chest','bulb','trapdoor','grate'])assert.match(ask(`How do I mine copper ${part}?`),/stone pickaxe or better/);
 assert.match(ask('How do I use copper doors?'),/opened by hand/);
 assert.match(ask('How do I use iron doors?'),/cannot be opened directly by hand/);
});
test('storage and workstation mechanics retain functional differences',()=>{
 const ask=q=>createConversation().ask(q).answer;
 assert.match(ask('How do I mine blue shulker boxes?'),/inventory still inside/);
 assert.match(ask('How many slots does a barrel hold?'),/27/);
 assert.match(ask('How do I use a blast furnace?'),/does not cook food/);
 assert.match(ask('How do I use a smoker?'),/does not smelt ores/);
 assert.match(ask('How do I use a fletching table?'),/no player crafting interface/);
 assert.match(ask('How do I use a grindstone?'),/does not remove curses/);
 assert.match(ask('How do I mine a composter?'),/compost is lost/);
});
test('power questions and contextual followups preserve device behavior',()=>{
 const c=createConversation();c.ask('What is a hopper?');
 assert.match(c.ask('Does it need redstone power?').answer,/power is used to stop it/i);
 const ask=q=>createConversation().ask(q).answer;
 assert.match(ask('How does redstone affect a copper bulb?'),/toggles.*keeps that state/);
 assert.match(ask('How does redstone affect a redstone lamp?'),/does not toggle/);
 assert.match(ask('How does redstone affect a crafter?'),/occupied or disabled slots/);
 assert.match(ask('How does redstone affect a lever?'),/stays on|does not automatically/i);
});
