import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const ask=q=>createConversation().ask(q);
const data=JSON.parse(fs.readFileSync('data/entities/growth_editorial.json'));
test('all explicit ageable profiles have reviewed species-specific growth answers',()=>{
 const samples=JSON.parse(fs.readFileSync('data/entities/sample_evidence.json'));
 const ids=Object.entries(samples.subjects).filter(([,r])=>Object.values(r.scopes).some(s=>s['minecraft:ageable'])).map(([id])=>id).sort();
 assert.deepEqual(Object.keys(data.subjects).sort(),ids);
 for(const [id,row] of Object.entries(data.subjects)) {
  const r=ask(`How long does baby entity:${id} take to grow up?`);
  assert.equal(r.topic,'growth',id);assert.equal(r.answer,row.topics.growth.answer,id);
  assert.equal(r.coverage,'reviewed_summary');assert.ok(r.sources.length>=2);
  assert.match(r.answer,new RegExp(`${row.evidence.duration_seconds/60} minutes`));
 }
});
test('non-feedable growth and special Bedrock times stay distinct',()=>{
 for(const name of ['squid','glow squid','polar bear','villager']) {
  const r=ask(`Can I speed up a baby ${name} with food?`);
  assert.equal(r.topic,'growth',name);assert.match(r.answer,/Feeding does not speed up/);
 }
 assert.match(ask('How long does a sniffer take to mature?').answer,/40 minutes.*Egg hatching is a separate timer/);
 assert.match(ask('How long does a ghastling take to grow?').answer,/10 snowballs/);
 assert.match(ask('How long does a baby nautilus take to grow?').answer,/10 suitable fish/);
 assert.match(ask('How long does a baby bee take to grow?').answer,/pauses.*nest or hive/);
 assert.match(ask('How long does a baby turtle take to grow?').answer,/scute.*adult/);
 assert.match(ask('How long does a small sulfur cube take to grow?').answer,/large sulfur cube/);
});
test('growth food questions retain food validity rather than implying any item works',()=>{
 assert.match(ask('Can I grow a baby cow with carrots?').answer,/No.*cannot be used for growth.*wheat/);
 assert.match(ask('Can I grow a baby wolf with fish?').answer,/No.*cannot be used for growth/);
 assert.match(ask('Can I grow a baby cow with wheat?').answer,/wheat.*20 minutes/);
 assert.match(ask('Can I grow a baby axolotl with tropical fish?').answer,/No.*buckets of tropical fish/);
 assert.match(ask('How does a baby zombie grow up?').answer,/do not normally grow/);
});
test('growth questions support follow-ups without changing food, breeding or age-lock questions',()=>{
 const c=createConversation();c.ask('What is a sniffer?');
 assert.match(c.ask('How long does it take to mature?').answer,/40 minutes/);
 assert.equal(c.ask('What does it eat?').topic,'diet');
 assert.equal(ask('How do I breed cows?').topic,'breeding');
 assert.equal(ask('How do I stop a cow growing with a golden dandelion?').topic,'age_lock');
 assert.equal(ask('What is a growth potion?').topic,undefined);
});
