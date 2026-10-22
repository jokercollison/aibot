import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const ask=q=>createConversation().ask(q);
test('reviewed movement topics route with sources without claiming completeness',()=>{
 const data=JSON.parse(fs.readFileSync('data/entities/movement_editorial.json'));
 const coverage=JSON.parse(fs.readFileSync('docs/ENTITY_MOVEMENT_COVERAGE.json'));
 for(const [id,row] of Object.entries(data.subjects))for(const [topic,fact] of Object.entries(row.topics)) {
  const questions={lifetime:`Can entity:${id} despawn?`,relocation:`How do I transport entity:${id}?`,teleportation:`Can entity:${id} teleport?`};
  const r=ask(questions[topic]);assert.equal(r.subject,id,id);assert.equal(r.answer,fact.answer,id+' '+topic);assert.ok(r.sources.length,id);assert.equal(coverage.subjects[id].complete,false);
 }
});
test('names and boats do not override special lifetime behavior',()=>{
 assert.match(ask('Can I keep a wandering trader forever with a name tag?').answer,/even if named.*boat/);
 assert.match(ask('Can an endermite despawn in a boat?').answer,/two minutes/);
 assert.match(ask('Can a vex despawn in a minecart?').answer,/lifetime damage/);
 assert.match(ask('Can a named skeleton horse despawn?').answer,/15-minute timer even if named/);
 assert.match(ask('Can a shulker despawn?').answer,/including in Peaceful/);
});
test('Bedrock-specific persistence and rider/mount separation are kept explicit',()=>{
 assert.match(ask('Can a zombie villager despawn?').answer,/In Bedrock.*converting villagers are persistent/);
 assert.match(ask('Can a trader llama despawn?').answer,/In Bedrock.*removing its lead/);
 assert.match(ask('Can a zombie nautilus despawn?').answer,/rider is a separate mob/);
 assert.match(ask('Can a sulfur cube despawn?').answer,/small cubes can despawn/);
 assert.match(ask('Can a dolphin despawn?').answer,/named dolphin.*can drown/);
});
test('moving is separate from riding, taming and preventing despawning',()=>{
 assert.match(ask('How do I move a villager?').answer,/cannot attach an ordinary lead/);
 assert.match(ask('How do I transport a llama?').answer,/does not give direct.*steering/);
 assert.match(ask('How do I move a pig?').answer,/carrot on a stick/);
 assert.match(ask('How do I move a strider?').answer,/warped fungus on a stick/);
 assert.match(ask('How do I move a turtle?').answer,/home beach/);
 assert.match(ask('How do I move a sniffer?').answer,/cannot dig while leashed/);
});
test('pronoun follow-ups retain the creature across movement and other topics',()=>{
 const c=createConversation();c.ask('What is a cat?');assert.match(c.ask('Can it disappear?').answer,/tamed cat does not naturally despawn/);
 assert.match(c.ask('Can it teleport?').answer,/standing/);
 assert.match(c.ask('How do I move it?').answer,/tell it to stand/);
 c.ask('What is a villager?');assert.match(c.ask('How do I transport it in a boat?').answer,/safe housing/);
 assert.match(c.ask('Why won’t it restock?').answer,/claimed workstation/);
});
