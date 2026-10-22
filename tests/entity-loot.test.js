import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createConversation} from '../src/knowledge.js';
import {evaluateLoot,lootContext,conditionalLootAnswer} from '../src/entity-loot.js';
const ask=q=>createConversation().ask(q);
const graph=JSON.parse(fs.readFileSync(new URL('../data/entities/loot_runtime.json',import.meta.url)));
test('all sample entity scopes and all recursively preserved loot tables are accounted for',()=>{
 const report=JSON.parse(fs.readFileSync(new URL('../docs/ENTITY_LOOT_COVERAGE.json',import.meta.url)));
 assert.equal(Object.keys(graph.entities).length,128);assert.equal(report.entities_with_death_tables,78);
 assert.equal(Object.keys(graph.tables).length,91);assert.equal(report.complete_gameplay_knowledge,false);
 assert.deepEqual(report.missing_table_references,['loot_tables/entities/fox.json','loot_tables/entities/piglin.json']);
 for(const [id,row] of Object.entries(graph.entities)) {
  const result=evaluateLoot(id,{});
  assert.ok(result.missing.every(path=>report.missing_table_references.includes(path)),id);
  if(row.tables.length&&!result.missing.length) {
   const answer=ask(`What does entity:${id} drop with Looting III?`);
   assert.equal(answer.subject,id,id);assert.equal(typeof answer.answer,'string',id);
   assert.ok(!/NaN|undefined|\[object Object\]/.test(answer.answer),id);
  }
 }
});
test('killer names do not steal the victim subject even with a longer alias',()=>{
 for(const q of ['What does a creeper drop when killed by a wither skeleton?','What does a creeper drop when a wither skeleton kills it?','If a wither skeleton kills a creeper what does it drop?'])assert.equal(ask(q).subject,'minecraft:creeper',q);
});
test('blaze rods require an eligible player or tamed-wolf kill',()=>{
 for(const q of ['What does a blaze drop when killed by a skeleton?','What does a blaze drop when killed by lava?'])assert.doesNotMatch(ask(q).answer,/0–.*blaze rod/);
 assert.match(ask('What does a blaze drop when killed by a tamed wolf without Looting?').answer,/0–1 blaze rod/);
 assert.match(ask('What does a blaze drop when I kill it with Looting III?').answer,/0–4 blaze rod/);
});
test('Bedrock skull probability uses two percentage points per Looting level',()=>{
 for(const [level,expected] of [['I','4.5%'],['II','6.5%'],['III','8.5%']])assert.ok(ask(`What does a wither skeleton drop when I kill it with Looting ${level}?`).answer.includes(expected));
 const nonplayer=ask('What does a wither skeleton drop when killed by a skeleton with Looting III?');
 assert.doesNotMatch(nonplayer.answer,/1 wither skeleton skull/);
});
test('weighted rare zombie choices are alternatives, not three guaranteed rare items',()=>{
 const r=ask('What does a zombie drop when I kill it without Looting?');
 assert.match(r.answer,/one of: 1 iron ingot, 1 carrot, 1 potato/);assert.match(r.answer,/2.5%/);
});
test('burning and Looting modify eligible meat rather than replacing unrelated loot',()=>{
 const r=ask('What does an adult cow drop while burning with Looting III?');
 assert.match(r.answer,/0–5 leather/);assert.match(r.answer,/1–6 steak/);assert.doesNotMatch(r.answer,/raw beef/);
 const cold=ask('What does an adult cow drop when not burning without Looting?');
 assert.match(cold.answer,/1–3 raw beef/);assert.doesNotMatch(cold.answer,/steak/);
 const baby=ask('What does a baby cow drop without Looting?');assert.equal(baby.status,'unknown');assert.doesNotMatch(baby.answer,/leather/);
});
test('baby chicken jockey disc requires its rider state and player kill together',()=>{
 const positive=ask('What does a baby zombie riding a chicken drop when I kill it without Looting?');assert.match(positive.answer,/music disc lava chicken/);
 assert.doesNotMatch(ask('What does an adult zombie drop when I kill it without Looting?').answer,/music disc lava chicken/);
 assert.doesNotMatch(ask('What does a baby zombie riding a chicken drop when killed by a skeleton?').answer,/music disc lava chicken/);
});
test('disc and head drops remain separate conditional mechanisms',()=>{
 const skeleton=ask('What does a creeper drop when killed by a skeleton?');assert.match(skeleton.answer,/one music disc/);assert.doesNotMatch(skeleton.answer,/creeper head/);
 const charged=ask('What does a creeper drop when killed by a charged creeper?');assert.match(charged.answer,/creeper head/);assert.doesNotMatch(charged.answer,/one music disc/);
 const piglin=ask('What does a piglin drop when killed by a charged creeper?');assert.match(piglin.answer,/piglin head/);
 assert.equal(ask('What does a creeper drop when killed by a parched?').status,'unknown');
});
test('sheared and woolly sheep do not merge mutually exclusive death tables',()=>{
 assert.doesNotMatch(ask('What does a sheared sheep drop without Looting?').answer,/1 wool/);
 assert.match(ask('What does an unsheared sheep drop without Looting?').answer,/1 wool/);
 assert.match(ask('What does a sheep that is not sheared drop without Looting?').answer,/1 wool/);
});
test('Looting above normal Survival limits is clarified',()=>assert.equal(ask('What does a cow drop with Looting IV?').status,'unknown'));
test('user-tested food shorthand and incidental wording continue to agree',()=>{
 const baseline=ask('What do cows eat?').answer;
 for(const q of ['cows eat','What do cows eat when they are 200 years old and in the plains?','What do cows eat when near iron blocks?'])assert.equal(ask(q).answer,baseline);
});
test('condition-only drop follow-ups preserve victim and original topic',()=>{
 const c=createConversation();c.ask('What does a wither skeleton drop?');
 assert.match(c.ask('with Looting III').answer,/8.5%/);
 const filtered=c.ask('when killed by a skeleton');assert.equal(filtered.subject,'minecraft:wither_skeleton');assert.doesNotMatch(filtered.answer,/1 wither skeleton skull/);
});
test('reviewed breeding and taming eligibility is answered across mob groups',()=>{
 for(const name of ['creeper','zombie','blaze','warden','wither','silverfish','bogged']) {
  assert.match(ask(`Can I breed a ${name}?`).answer,/cannot be bred/);
  assert.match(ask(`Can I tame a ${name}?`).answer,/cannot be tamed/);
 }
 assert.match(ask('How do I breed sulfur cubes?').answer,/splits into two small/);
 assert.match(ask('How much health does an ocelot have?').answer,/10 health points/);
 assert.doesNotMatch(ask('How much health does a creaking have?').answer,/normal maximum health is 1 /);
});
test('new wiki references are distinct from natural mob spawning and retain follow-ups',()=>{
 const c=createConversation();assert.match(c.ask('What is an elder guardian ghost?').answer,/technical entity/);
 assert.match(c.ask('Where does it spawn?').answer,/commands/);
 assert.match(ask('What is a dropped item?').answer,/outside an inventory/);
 assert.match(ask('What is a falling block?').answer,/gravity/);
 assert.match(ask('Where do map markers spawn?').answer,/Bedrock Editor/);
 assert.match(ask('What is a spider jockey?').answer,/several skeleton/);
 assert.match(ask('Where does a ravager jockey spawn?').answer,/wave 5/);
 assert.match(ask('What does a spider jockey drop?').answer,/separate health and loot/);
});
test('each catalog mob has connected core topics, with basic classification kept distinct from complete rules',()=>{
 const report=JSON.parse(fs.readFileSync(new URL('../docs/ENTITY_KNOWLEDGE_COVERAGE.json',import.meta.url)));
 for(const [id,row] of Object.entries(report.subjects))if(row.category==='mob') {
  for(const topic of ['identity','behavior','spawning','health','drops','breeding','taming','combat'])assert.notEqual(row.topics[topic],'pending_review',id+' '+topic);
  assert.equal(row.complete,false,id);
 }
 assert.match(ask('Are cows dangerous?').answer,/does not normally attack players/);
 assert.match(ask('Are wolves dangerous?').answer,/provoked/);
 assert.match(ask('Are rabbits dangerous?').answer,/passive/);
});
test('new wiki references are distinct from natural mob spawning and retain follow-ups',()=>{
 const c=createConversation();assert.match(c.ask('What is an elder guardian ghost?').answer,/technical entity/);
 assert.match(c.ask('Where does it spawn?').answer,/commands/);
 assert.match(ask('What is a dropped item?').answer,/outside an inventory/);
 assert.match(ask('What is a falling block?').answer,/gravity/);
 assert.match(ask('Where do map markers spawn?').answer,/Bedrock Editor/);
 assert.match(ask('What is a spider jockey?').answer,/several skeleton/);
 assert.match(ask('Where does a ravager jockey spawn?').answer,/wave 5/);
 assert.match(ask('What does a spider jockey drop?').answer,/separate health and loot/);
});
test('each catalog mob has connected core topics, with basic classification kept distinct from complete rules',()=>{
 const report=JSON.parse(fs.readFileSync(new URL('../docs/ENTITY_KNOWLEDGE_COVERAGE.json',import.meta.url)));
 for(const [id,row] of Object.entries(report.subjects))if(row.category==='mob') {
  for(const topic of ['identity','behavior','spawning','health','drops','breeding','taming','combat'])assert.notEqual(row.topics[topic],'pending_review',id+' '+topic);
  assert.equal(row.complete,false,id);
 }
 assert.match(ask('Are cows dangerous?').answer,/does not normally attack players/);
 assert.match(ask('Are wolves dangerous?').answer,/provoked/);
 assert.match(ask('Are rabbits dangerous?').answer,/passive/);
});
test('withheld special-killer conditions cannot leak through a general Looting question',()=>{
 assert.doesNotMatch(ask('What does a creeper drop with Looting III?').answer,/parched/);
});
