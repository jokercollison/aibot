import test from 'node:test';
import assert from 'node:assert/strict';
import {createConversation} from '../src/knowledge.js';
const ask=q=>createConversation().ask(q);
test('negative age descriptions do not turn adult breeding questions into baby rejections',()=>{
 for(const q of ['Can cows that are not babies breed?','Can I breed a cow that is not a baby?','Can a cow that is no longer a baby breed?','Can cows that aren’t babies breed?']) {
  const r=ask(q);assert.notEqual(r.topic,'breeding_age',q);assert.match(r.answer,/wheat/i,q);
 }
 assert.equal(ask('Can baby cows breed?').topic,'breeding_age');
});
test('mentioning existing offspring does not classify an adult parent as a baby',()=>{
 for(const q of ['Can cows with babies breed?','Can a cow with a baby breed?','How do I breed cows to make a baby?']) {
  const r=ask(q);assert.notEqual(r.topic,'breeding_age',q);assert.match(r.answer,/wheat/i,q);
 }
});
test('short age follow-ups preserve the species and breeding topic',()=>{
 const c=createConversation();assert.equal(c.ask('Can baby cows breed?').topic,'breeding_age');
 assert.match(c.ask('what about adults').answer,/wheat/i);
 assert.equal(c.ask('and babies').topic,'breeding_age');
 const other=createConversation();assert.equal(other.ask('what about adults').status,'unknown');
});

test('negative ages and existing offspring do not select baby XP',()=>{
 for(const q of ['How much XP does a cow that is not a baby drop?','How much XP do cows that aren’t babies drop?','How much XP does a cow that is no longer a baby drop?','How much XP do cows with babies drop?']) {
  const r=ask(q);assert.equal(r.topic,'experience',q);assert.equal(r.answer,ask('How much XP does a cow drop?').answer,q);
 }
 assert.equal(ask('How much XP does a baby cow drop?').topic,'experience_baby');
});
test('short reward age follow-ups retain subject and switch between adult and baby XP',()=>{
 for(const name of ['cow','zombie','piglin','hoglin']) {
  const c=createConversation();c.ask(`How much XP does a baby ${name} drop?`);
  const adult=c.ask('what about adults');assert.equal(adult.subject,`minecraft:${name}`);assert.equal(adult.topic,'experience');
  assert.equal(c.ask('and babies').answer,ask(`How much XP does a baby ${name} drop?`).answer);
 }
 const c=createConversation();c.ask('How much XP does a cow drop?');c.ask('Can baby cows breed?');
 assert.equal(c.ask('what about adults').topic,'breeding');
 assert.equal(createConversation().ask('and babies').status,'unknown');
});

test('short variant choices preserve gameplay topics instead of becoming descriptions',()=>{
 const cases=[
  ['How do I tame a wolf?','ashen','taming'],
  ['What does a cow eat?','warm','diet'],
  ['How do I breed a panda?','brown','breeding'],
  ['How much XP does a slime mob drop?','small','experience'],
  ['How much XP does a baby cow drop?','cold','experience_baby'],
  ['How much XP does breeding cows give?','warm','experience_breeding'],
  ['What equipment does a llama drop?','gray','equipment_drops'],
  ['Does a cat despawn?','calico','lifetime'],
  ['Can a wolf teleport?','ashen','teleportation'],
  ['How can I move a cat?','calico','relocation'],
  ['What conditions does a chicken need to spawn?','cold','spawn_conditions'],
  ['How do I heal a wolf?','ashen','healing'],
  ['How does a cow grow?','cold','growth'],
  ['How do I ride a horse?','white','transport'],
  ['How do I trade with a villager?','farmer','trading']
 ];
 for(const [question,variant,topic] of cases) {
  const c=createConversation();const initial=c.ask(question);
  assert.equal(initial.topic,topic,question);
  const next=c.ask(`what about the ${variant} one`);
  assert.equal(next.subject,initial.subject,question);
  assert.equal(next.topic,topic,`${question}: ${variant}`);
  assert.notEqual(next.status,'unknown',question);
 }
});

test('variant follow-ups use the latest topic and remain conversation-local',()=>{
 const c=createConversation();c.ask('How do I tame a wolf?');
 assert.equal(c.ask('what about ashen').topic,'taming');
 c.ask('Where can I find wolves?');
 const next=c.ask('what about woods');assert.equal(next.topic,'spawning');
 assert.match(next.answer,/forest/i);
 assert.equal(createConversation().ask('what about ashen').status,'unknown');
});
