import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createConversation} from '../src/knowledge.js';
import {runAudit} from '../tools/entity_question_audit.mjs';
const read=p=>JSON.parse(fs.readFileSync(p));
const ask=q=>createConversation().ask(q);
test('catalog core question matrix distinguishes answers, partial facts and honest unsupported questions',()=>{
 const report=runAudit();
 assert.equal(Object.keys(report.subjects).length,90);
 assert.equal(Object.keys(report.objects).length,39);assert.equal(report.catalog_entities,129);
 assert.equal(report.questions,5780);
 assert.equal(report.answered,5776);assert.equal(report.partial,4);assert.equal(report.unsupported,0);
 assert.deepEqual(report.failures,[]);
 for(const row of Object.values(report.subjects))for(const [topic,outcome] of Object.entries(row.outcomes)) {
  assert.equal(row.natural_outcomes[topic],outcome);
  if(outcome==='unsupported')assert.equal(topic,'diet');
 }
});
test('remaining core data routes exactly to its reviewed topic without overriding special existing mechanics',()=>{
 const data=read('data/entities/core_editorial.json');
 const questions={growth:'How long does baby SUBJECT take to grow?',lifetime:'Does SUBJECT despawn?',relocation:'How can you move SUBJECT?',attack_style:'How does SUBJECT attack?',provocation:'Why is SUBJECT attacking me?',counterplay:'How can you defeat SUBJECT?'};
 let count=0;
 for(const [id,row] of Object.entries(data.subjects))for(const [topic,fact] of Object.entries(row.topics)) {
  const r=ask(questions[topic].replace('SUBJECT','entity:'+id));
  assert.equal(r.topic,topic,id);assert.equal(r.subject,id,id);assert.equal(r.answer,fact.answer,id);
  assert.ok(r.sources.length,id);count++;
 }
 assert.equal(count,289);
 assert.match(ask('Does a wandering trader despawn?').answer,/name tag|naming/);
 assert.match(ask('Does an endermite despawn?').answer,/2 minutes|two minutes/);
 assert.match(ask('Does a warden despawn?').answer,/dig|burrow/);
});
test('normal baby eligibility and size variants have explicit negative answers',()=>{
 assert.equal(ask('How can you breed a creeper?').answer,'You cannot breed a creeper.');
 for(const name of ['blaze','bogged','warden','wither','silverfish'])assert.match(ask(`How can you breed a ${name}?`).answer,/cannot breed/);
 assert.match(ask('How long does a baby creeper take to grow?').answer,/no normal baby form/);
 assert.match(ask('How long does a baby piglin take to grow?').answer,/do not grow/);
 assert.match(ask('How long does a baby zoglin take to grow?').answer,/never grow/);
 assert.match(ask('How do small slimes grow?').answer,/size variants.*not growing babies/);
 assert.match(ask('How do frogs grow?').answer,/tadpole/);
 for(const name of ['skeleton horse','zombie horse'])assert.match(ask(`How long does baby ${name} take to grow?`).answer,/do not have a growth time/);
});
test('passive mobs and riders do not gain imaginary attacks or taming abilities',()=>{
 assert.match(ask('How does a happy ghast attack?').answer,/do not shoot.*fireballs/);
 assert.match(ask('How does a cow attack?').answer,/do not attack/);
 assert.match(ask('How does a fox attack?').answer,/trusting fox can defend/);
 assert.match(ask('How does a nautilus attack?').answer,/dash/);
 assert.match(ask('How does a sulfur cube attack?').answer,/absorbed block.*hazards/);
 assert.match(ask('How does a zombie horse attack?').answer,/rider.*separate/);
});
test('Bedrock relocation and persistence retain explicit limitations',()=>{
 assert.match(ask('How can you move a creeper?').answer,/minecart.*still be dangerous/);
 assert.match(ask('How can you move a ghast?').answer,/minecart/);
 assert.match(ask('How can you move an iron golem?').answer,/lead/);
 assert.match(ask('How can you move a warden?').answer,/cannot transport.*minecart.*lead/);
 assert.match(ask('Does a cow despawn?').answer,/naturally spawned.*persistent.*name tag/);
 assert.match(ask('Does a copper golem despawn?').answer,/statue.*different/);
 assert.match(ask('Does a breeze despawn?').answer,/persistence/);
});
test('unsupported questions stay honest and the latest subject survives follow-ups',()=>{
 for(const q of ['Can a cow teleport?','Can a zombie teach calculus?']) {
  const r=ask(q);assert.equal(r.status,'unknown',q);assert.ok(r.answer.trim());assert.doesNotMatch(r.answer,/pending_review|spawn_conditions|lifetime/);
 }
 const c=createConversation();c.ask('What is a creeper?');
 assert.equal(c.ask('How can you breed it?').answer,'You cannot breed a creeper.');
 assert.match(c.ask('What does it eat?').answer,/no food for taming or breeding/);
 assert.equal(c.ask('How can you move it?').subject,'minecraft:creeper');
 assert.equal(createConversation().ask('How can you move it?').status,'unknown');
});

test('specialized coverage reports include the broad core layer rather than retaining stale gaps',()=>{
 const combat=read('docs/ENTITY_COMBAT_COVERAGE.json'),movement=read('docs/ENTITY_MOVEMENT_COVERAGE.json');
 assert.equal(combat.reviewed_subjects,90);assert.equal(combat.reviewed_topic_summaries,270);
 assert.equal(movement.reviewed_subjects,90);
 for(const row of Object.values(combat.subjects))for(const status of Object.values(row.topics))assert.equal(status,'reviewed_summary');
 for(const row of Object.values(movement.subjects)) {
  assert.equal(row.topics.lifetime,'reviewed_summary');assert.equal(row.topics.relocation,'reviewed_summary');
 }
});
