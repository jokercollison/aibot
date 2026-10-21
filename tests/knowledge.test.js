import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createConversation,knowledgeStats} from '../src/knowledge.js';
import {owns,safeName,decodeHome,canWarn} from '../src/state.js';
import {readFileSync} from 'node:fs';
const ask=q=>createConversation().ask(q);
test('substantial original knowledge is available',()=>assert.ok(knowledgeStats.records>4000));
test('hopper ingredients and positions retain official symbol mapping',()=>{
 const r=ask('How do I make a hopper?');assert.equal(r.status,'conditional');
 assert.match(r.answer,/5 × Iron Ingot \(I\)/);assert.match(r.answer,/1 × Chest \(C\)/);assert.match(r.answer,/\[I I\]|\[I·I\]/);assert.match(r.answer,/\[ICI\]/);
 assert.ok(r.sources.includes('behavior_pack/recipes/hopper.json'));
});
test('different recipe phrasings retrieve same result',()=>assert.equal(ask("What's the recipe for a hopper?").answer,ask('How do I craft a hopper?').answer));
test('creeper plurals and conditional avoidance',()=>{const r=ask('What scares creepers?');assert.match(r.answer,/cats and ocelots/);assert.equal(r.status,'conditional');});
test('adult cow breeding',()=>assert.match(ask('How do I breed cows?').answer,/wheat/));
test('follow-up retains the identified subject',()=>{const c=createConversation();c.ask('What is a creeper?');assert.match(c.ask('What scares it?').answer,/cats/);});
test('unknown questions do not fabricate',()=>assert.equal(ask('How do I craft a flibbertigibbet?').status,'unknown'));
test('unknown mob mechanics do not become generic fact claims',()=>assert.equal(ask('Can a cow survive lava?').status,'unknown'));
test('location questions do not return misleading registry descriptions',()=>assert.equal(ask('Where can I find diamonds?').status,'unknown'));
test('enchantment returns effect',()=>assert.match(ask('What does Mending do?').answer,/Mending/));
test('reverse ingredient queries',()=>assert.match(ask('What can I make with iron ingot?').answer,/Some recipes/));
test('blank and excessive questions request clarification',()=>{assert.equal(ask('').status,'clarify');assert.equal(ask('x'.repeat(241)).status,'clarify');});
test('banter is preserved byte for byte',()=>assert.deepEqual(readFileSync('data/banter.json'),readFileSync('legacy/robot_prototype/knowledge/banter.json')));
test('owner permission fails closed',()=>{assert.equal(owns('one','two'),false);assert.equal(owns('one',undefined),false);assert.equal(owns('one','one'),true);});
test('name removes formatting, controls and excess length',()=>{assert.equal(safeName('§cA\nB'),'AB');assert.equal(safeName('x'.repeat(100)).length,24);assert.equal(safeName(''),'TTR-1');});
test('home input validation rejects corrupted or invalid saved state',()=>{assert.equal(decodeHome('oops'),null);assert.equal(decodeHome('{"dimension":"minecraft:overworld","x":null,"y":1,"z":2}'),null);assert.ok(decodeHome('{"dimension":"minecraft:overworld","x":0,"y":64,"z":0}'));});
test('warning cooldown is enforced',()=>{assert.equal(canWarn(100,99),false);assert.equal(canWarn(1300,100),true);assert.equal(canWarn(0,undefined),true);});

test('ambiguous material asks for clarification',()=>assert.equal(ask('What can I make with iron?').status,'ambiguous'));
