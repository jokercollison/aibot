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
