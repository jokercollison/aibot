import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const ask=q=>createConversation().ask(q);
test('every catalog non-mob has reviewed mechanics that route through real questions',()=>{
 const data=JSON.parse(fs.readFileSync('data/entities/object_editorial.json'));
 const audit=JSON.parse(fs.readFileSync('docs/ENTITY_OBJECT_COVERAGE.json'));
 assert.equal(audit.catalog_non_mobs,39);assert.equal(Object.keys(data.subjects).length,39);
 const prompts={storage:'How much inventory storage does SUBJECT have?',propulsion:'How do I steer SUBJECT?',retrieval:'How do I retrieve SUBJECT?',projectile_use:'How do I throw SUBJECT?',projectile_effects:'What happens to SUBJECT on impact?',posing:'How do I change SUBJECT poses?',activation:'How do I activate SUBJECT?',availability:'Is SUBJECT available in Survival?',equipment:'What equipment can SUBJECT use?',interactions:'How do I interact with SUBJECT?',transport:'Can I ride SUBJECT?',experience:'How much XP does SUBJECT give?'};
 for(const [id,row] of Object.entries(data.subjects))for(const [topic,fact] of Object.entries(row.topics)) {
  assert.ok(prompts[topic],topic);const q=prompts[topic].replace('SUBJECT','entity:'+id);
  const r=ask(q);assert.equal(r.subject,id,q);assert.equal(r.topic,topic,q);assert.equal(r.answer,fact.answer,q);assert.ok(r.sources.length,q);
  assert.equal(audit.subjects[id].complete,false);
 }
});
test('vehicle controls and storage distinguish rails, seats and collection states',()=>{
 assert.match(ask('How much storage does a boat with chest have?').answer,/one rider/);
 assert.match(ask('How much storage does a minecart with hopper have?').answer,/five slots/);
 assert.match(ask('How do I steer a hopper minecart?').answer,/powered activator rail disables/);
 assert.match(ask('How do I steer a TNT minecart?').answer,/four-second fuse/);
});
test('projectile recovery preserves Bedrock and possession restrictions',()=>{
 assert.match(ask('How do I retrieve an arrow?').answer,/pickup restrictions/);
 assert.match(ask('How do I retrieve a trident?').answer,/do not ordinarily despawn in Bedrock/);
 assert.match(ask('How do I retrieve an eye of ender?').answer,/Some eyes break/);
 assert.match(ask('How much XP does a bottle o enchanting give?').answer,/3–11/);
});
test('object follow-ups remain with the projectile rather than reverting to recipes',()=>{
 const c=createConversation();c.ask('What is a snowball?');assert.match(c.ask('What happens when it hits?').answer,/blazes/);
 assert.match(c.ask('How do I retrieve it?').answer,/not arrows/);
 c.ask('What is a boat with chest?');assert.match(c.ask('How much storage does it have?').answer,/single-chest/);
});
test('explosives, clouds and displays keep their distinct entity mechanics',()=>{
 assert.match(ask('How do I activate an end crystal?').answer,/obsidian or bedrock/);
 assert.match(ask('How do I retrieve primed TNT?').answer,/not an item you can mine/);
 assert.match(ask('How do I change an armor stand poses?').answer,/Sneak and interact/);
 assert.match(ask('What happens to a shulker bullet on impact?').answer,/Levitation/);
});
