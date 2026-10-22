import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const ask=q=>createConversation().ask(q);
test('reviewed combat topics route through real questions with preserved sources',()=>{
 const data=JSON.parse(fs.readFileSync('data/entities/combat_editorial.json'));
 const audit=JSON.parse(fs.readFileSync('docs/ENTITY_COMBAT_COVERAGE.json'));
 for(const [id,row] of Object.entries(data.subjects))for(const [topic,fact] of Object.entries(row.topics)) {
  const questions={attack_style:`How does entity:${id} attack?`,provocation:`Why is entity:${id} attacking me?`,counterplay:`How do I defeat entity:${id}?`};
  const r=ask(questions[topic]);assert.equal(r.subject,id,id);assert.equal(r.answer,fact.answer,id+' '+topic);assert.ok(r.sources.length,id);assert.equal(audit.subjects[id].complete,false);
 }
});
test('Bedrock shields do not promise immunity to warden or shulker attacks',()=>{
 assert.match(ask('Can a shield protect me from a warden?').answer,/not protection.*sonic/);
 assert.match(ask('Can a shield protect me from a shulker?').answer,/Levitation still applies/);
 assert.match(ask('Can a shield protect me from a blaze?').answer,/block.*damage and ignition/);
});
test('provocation distinguishes neutral mobs, group anger and gold exceptions',()=>{
 assert.match(ask('Why is an enderman attacking me?').answer,/look directly.*face/);
 assert.match(ask('Why is a piglin brute attacking me?').answer,/do not become friendly.*gold/);
 assert.match(ask('Why is a polar bear attacking me?').answer,/cub/);
 assert.match(ask('Why is a dolphin attacking me?').answer,/does not cancel/);
 assert.match(ask('Why is an iron golem attacking me?').answer,/player-built.*does not attack players/);
});
test('projectile and visual mechanics retain their exceptions',()=>{
 assert.match(ask('How do I defeat a breeze?').answer,/projectiles are deflected/);
 assert.match(ask('How do I defeat a ghast?').answer,/strike.*fireball back/);
 assert.match(ask('How do I defeat a creaking?').answer,/break the heart/);
 assert.match(ask('How does a cave spider attack?').answer,/Poison on Normal and Hard, not Easy/);
 assert.match(ask('How does a magma cube attack?').answer,/small form can hurt/);
});
test('combat follow-ups preserve the subject and switch topic without an extra robot interaction',()=>{
 const c=createConversation();c.ask('What is a warden?');assert.match(c.ask('How does it attack?').answer,/sonic boom/);
 assert.match(c.ask('Can a shield protect me?').answer,/not protection/);
 c.ask('What is a creeper?');assert.match(c.ask('How do I defeat it?').answer,/Back away/);
 assert.match(c.ask('How much XP does it drop?').answer,/5 experience points/);
});
