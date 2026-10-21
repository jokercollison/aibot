import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const ask=q=>createConversation().ask(q);
const read=p=>JSON.parse(fs.readFileSync(p));
test('all 90 catalog mobs have sourced spawn troubleshooting without completeness claims',()=>{
 const s=read('data/entities/subjects.json').subjects,db=read('data/entities/runtime.json'),audit=read('docs/ENTITY_SPAWNING_COVERAGE.json');
 const mobs=Object.entries(s).filter(([,r])=>r.category==='mob');assert.equal(mobs.length,90);
 for(const [id] of mobs) {
  assert.ok(db[id].topics.spawn_conditions.answer,id);assert.ok(db[id].topics.spawn_conditions.sources.length,id);
  assert.equal(audit.subjects[id].complete,false,id);
  const r=ask(`Why does entity:${id} not spawn?`);assert.equal(r.subject,id,id);assert.equal(r.topic,'spawn_conditions',id);
 }
});
test('natural location and troubleshooting are separate, including short follow-ups',()=>{
 const c=createConversation();assert.match(c.ask('Where can I find an iron golem?').answer,/villages/);
 assert.match(c.ask('Why won’t it spawn?').answer,/20 beds and 10 villagers/);
 assert.match(c.ask('Where can I find an elder guardian?').answer,/three elder guardians/);
 assert.match(c.ask('Why doesn’t it spawn again?').answer,/will not naturally replace/);
});
test('biome, moon and height restrictions remain connected',()=>{
 assert.match(ask('Why do slimes not spawn?').answer,/Y=51–69/);
 assert.match(ask('Why do slimes not spawn?').answer,/new moon/);
 assert.match(ask('Why do glow squid not spawn?').answer,/Y=-64 through 30/);
 assert.match(ask('Why do turtles not spawn?').answer,/Y=60–67/);
 assert.match(ask('Why do bats not spawn?').answer,/level 4 or less/);
});
test('triggered, generated and constructed creatures do not receive generic dark-floor advice',()=>{
 for(const [name,expected] of [['warden',/warning level.*four/],['creaking',/creaking heart/],['sniffer',/hatch from an egg/],['mule',/horse and donkey/],['piglin brute',/do not replenish/],['vex',/evoker/],['happy ghast',/dried ghast/],['zoglin',/15 seconds/]])assert.match(ask(`Why does a ${name} not spawn?`).answer,expected,name);
});
test('Bedrock exceptions exclude Java spawning shortcuts and future biomes',()=>{
 assert.match(ask('Why does a guardian not spawn?').answer,/25 predetermined columns/);
 assert.match(ask('Why does a bogged not spawn?').answer,/surface-only/);
 assert.match(ask('Why does a phantom not spawn?').answer,/daytime/);
 assert.match(ask('Why does a pufferfish not spawn?').answer,/warm-ocean/);
 assert.doesNotMatch(ask('Where do drowned spawn?').answer,/ice caves|frostbite/i);
 assert.doesNotMatch(ask('Why does a creeper not spawn?').answer,/light (?:level )?[07]\b/);
});
test('specific variant constraints survive spawning troubleshooting',()=>{
 const c=createConversation();c.ask('Where can I find a blue axolotl?');assert.match(c.ask('Why won’t it spawn?').answer,/Blue axolotls do not naturally spawn/);
 assert.match(ask('Why does a brown mooshroom not spawn?').answer,/Brown mooshrooms do not naturally spawn/);
});
test('spawn subjects are retained when the question mentions blocks or another mob',()=>{
 const r=ask('Why won’t cows spawn on grass blocks?');assert.equal(r.subject,'minecraft:cow');assert.match(r.answer,/grass block/);
 const c=createConversation();c.ask('Where can I find a piglin?');const follow=c.ask('Can it spawn on magma blocks?');assert.equal(follow.subject,'minecraft:piglin');assert.match(follow.answer,/do not naturally spawn on.*magma blocks/);
});
test('pinned evidence preserves full branches without entering the playable runtime',()=>{
 const evidence=read('data/entities/spawn_evidence.json');assert.equal(Object.keys(evidence.files).length,60);
 const creeper=evidence.files['behavior_pack/spawn_rules/creeper.json'].document['minecraft:spawn_rules'];assert.equal(creeper.conditions.length,2);
 assert.notEqual(creeper.conditions[0]['minecraft:weight'].default,creeper.conditions[1]['minecraft:weight'].default);
 assert.equal(read('data/entities/runtime.json')['minecraft:creeper'].document,undefined);
});
