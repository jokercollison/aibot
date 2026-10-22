import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const ask=q=>createConversation().ask(q);
const data=JSON.parse(fs.readFileSync('data/entities/reward_editorial.json'));
test('death experience routes for every catalog mob and retains reviewed provenance',()=>{
 assert.equal(Object.keys(data.subjects).length,90);
 for(const [id,row] of Object.entries(data.subjects)) {
  const r=ask(`How much experience does entity:${id} drop?`);
  assert.equal(r.subject,id,id);assert.equal(r.topic,'experience',id);
  assert.equal(r.answer,row.topics.experience.answer,id);
  assert.ok(r.sources.length,id);
 }
});
test('baby rewards preserve animal, undead and Bedrock-specific exceptions',()=>{
 for(const [name,expected] of [['cow',/does not give experience/],['hoglin',/5 experience/],['zoglin',/5 experience/],['zombie',/12 experience/],['piglin',/1 experience point in Bedrock/],['wolf',/no experience/]])assert.match(ask(`How much XP does a baby ${name} drop?`).answer,expected,name);
 assert.match(ask('How much XP does a small sulfur cube drop?').answer,/Small sulfur cubes give no experience/);
});
test('boss, evoker and no-XP rewards remain separate from ordinary item drops',()=>{
 assert.match(ask('How much XP does the Ender Dragon drop?').answer,/12,000.*500/);
 assert.match(ask('How much experience does a wither drop when killed by lava?').answer,/50.*regardless/);
 assert.match(ask('How much experience does an evoker drop when killed by an iron golem?').answer,/10.*regardless/);
 for(const n of ['allay','bat','iron golem','villager','tadpole'])assert.match(ask(`How much XP does a ${n} drop?`).answer,/no experience/,n);
});
test('breeding experience is distinct from death rewards and unsupported sample hooks',()=>{
 assert.match(ask('How much XP does breeding cows give?').answer,/1–7/);
 assert.match(ask('How much XP does breeding villagers give?').answer,/does not give/);
 assert.match(ask('How much XP does breeding llamas give?').answer,/not sure of the exact/);
 assert.equal(ask('How much XP does breeding a warden give?').status,'unknown');
});
test('reward follow-ups retain the creature rather than the killer or equipment',()=>{
 const c=createConversation();c.ask('What is a zombie?');assert.match(c.ask('How much XP does it drop?').answer,/5.*12/);
 assert.match(c.ask('How much XP does it drop when killed by a wither skeleton?').answer,/base reward/);
 assert.equal(c.ask('What does a creeper drop?').topic,'drops');
 assert.equal(c.ask('How much XP does it drop?').subject,'minecraft:creeper');
});
test('gear-specific rewards use Bedrock rates without promising every mob carries them',()=>{
 for(const [name,item] of [['drowned','trident'],['piglin brute','axe'],['piglin','armor'],['witch','potion'],['wandering trader','potion']]) {
  const r=ask(`Does a ${name} drop its ${item} with Looting III?`);assert.equal(r.topic,'equipment_drops',name);assert.match(r.answer,/25%/);assert.match(r.answer,/28%/);
 }
 assert.match(ask('Does a vex drop its sword with Looting III?').answer,/does not drop/);
 assert.match(ask('Does a vex drop its sword with Looting III?').answer,/Looting does not change/);
 assert.match(ask('Does a donkey drop its chest contents?').answer,/chest contents/);
 assert.match(ask('Does a zombie nautilus drop its armor?').answer,/rider.*separate/);
});
test('exact disputed rewards remain withheld instead of silently choosing a source',()=>{
 assert.match(ask('How much XP does an axolotl drop?').answer,/not sure of the exact/);
 const audit=JSON.parse(fs.readFileSync('docs/ENTITY_REWARD_COVERAGE.json'));
 assert.equal(audit.conflicts.length,3);assert.equal(audit.complete,false);
});
