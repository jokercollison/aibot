import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createConversation,knowledgeStats,recipeText} from '../src/knowledge.js';
import {owns,safeName,decodeHome,canWarn} from '../src/state.js';
import {readFileSync} from 'node:fs';
const ask=q=>createConversation().ask(q);
test('substantial original knowledge is available',()=>assert.ok(knowledgeStats.records>4000));
test('hopper recipe gives amounts without positions or technical notes',()=>{
 const r=ask('How do I make a hopper?');assert.equal(r.status,'conditional');
 assert.equal(r.answer,"To craft hopper, you'll need 5 iron ingots and 1 chest.");
 assert.ok(r.sources.includes('behavior_pack/recipes/hopper.json'));
});
test('different recipe phrasings retrieve same result',()=>assert.equal(ask("What's the recipe for a hopper?").answer,ask('How do I craft a hopper?').answer));
test('creeper plurals and conditional avoidance',()=>{const r=ask('What scares creepers?');assert.match(r.answer,/cats and ocelots/);assert.equal(r.status,'conditional');});
test('adult cow breeding',()=>assert.match(ask('How do I breed cows?').answer,/wheat/));
test('follow-up retains the identified subject',()=>{const c=createConversation();c.ask('What is a creeper?');assert.match(c.ask('What scares it?').answer,/cats/);});
test('unknown questions do not fabricate',()=>assert.equal(ask('How do I craft a flibbertigibbet?').status,'unknown'));
test('unknown mob mechanics do not become generic fact claims',()=>assert.equal(ask('Can a cow teleport?').status,'unknown'));
test('location questions return useful mining guidance rather than registry descriptions',()=>assert.match(ask('Where can I find diamonds?').answer,/Overworld.*Y=16/));
test('enchantment returns effect',()=>assert.match(ask('What does Mending do?').answer,/Mending/));
test('reverse ingredient queries',()=>assert.match(ask('What can I make with iron ingot?').answer,/some things you can make/));
test('blank and excessive questions request clarification',()=>{assert.equal(ask('').status,'clarify');assert.equal(ask('x'.repeat(241)).status,'clarify');});
test('banter is preserved byte for byte',()=>assert.deepEqual(readFileSync('data/banter.json'),readFileSync('legacy/robot_prototype/knowledge/banter.json')));
test('owner permission fails closed',()=>{assert.equal(owns('one','two'),false);assert.equal(owns('one',undefined),false);assert.equal(owns('one','one'),true);});
test('name removes formatting, controls and excess length',()=>{assert.equal(safeName('§cA\nB'),'AB');assert.equal(safeName('x'.repeat(100)).length,24);assert.equal(safeName(''),'TTR-1');});
test('home input validation rejects corrupted or invalid saved state',()=>{assert.equal(decodeHome('oops'),null);assert.equal(decodeHome('{"dimension":"minecraft:overworld","x":null,"y":1,"z":2}'),null);assert.ok(decodeHome('{"dimension":"minecraft:overworld","x":0,"y":64,"z":0}'));});
test('warning cooldown is enforced',()=>{assert.equal(canWarn(100,99),false);assert.equal(canWarn(1300,100),true);assert.equal(canWarn(0,undefined),true);});

test('ambiguous material asks for clarification',()=>assert.equal(ask('What can I make with iron?').status,'ambiguous'));

test('stone pickaxe uses three cobblestone and TWO sticks, including spaced spelling',()=>{
 const expected="To craft stone pickaxe, you'll need 3 cobblestone and 2 sticks.";
 assert.equal(ask('How do I craft a stone pickaxe?').answer.split('\n')[0],expected);
 assert.equal(ask('How do I craft a stone pick axe?').answer.split('\n')[0],expected);
});
test('block recognition gives a supported follow-up and retains context',()=>{
 const c=createConversation();const intro=c.ask('What is a hopper?');
 assert.match(intro.answer,/collects and moves items automatically/);assert.match(intro.answer,/How do I craft it/);
 assert.match(c.ask('How do I craft it?').answer,/5 iron ingots/);
});
test('mob recognition suggests supported follow-ups',()=>{
 assert.match(ask('What is a creeper?').answer,/What scares it/);
 assert.match(ask('What is a cow?').answer,/How do I breed them/);
});
test('mob definitions explain behavior rather than redirecting to crafting',()=>assert.match(ask('What is a zombie?').answer,/hostile undead mob/));
test('all crafting answers omit grid positions and technical source language',()=>{
 const outputs=Object.keys(JSON.parse(readFileSync('data/recipe_index.json')).by_output);
 let answered=0;
 for(const name of outputs){
  const id=name.includes(':')?name:'minecraft:'+name;
  const r=recipeText({minecraft_id:id,name:name.replace('minecraft:','').replaceAll('_',' ')});
  if(r.status==='conditional') answered++;
  assert.doesNotMatch(r.answer,/Grid|Station:|shaped|shapeless|supplied|registry|minecraft:|in the .* tag|not yet checked|unlock|\([A-Z#]\)/i,name);
 }
 assert.equal(answered,outputs.length,'Every indexed output must produce a recipe answer');
});
test('player-facing factual and fallback answers keep development notes internal',()=>{
 for(const q of ['What scares creepers?','How do I breed cows?','What does Mending do?','What is a hopper?','What is a zombie?','Where can I find diamonds?','What can I make with iron ingot?']){
  assert.doesNotMatch(ask(q).answer,/supplied|registry|sample|verified|not.*checked|durable_equipment|minecraft:/i);
 }
 assert.match(ask('What does Mending do?').answer,/items with durability/);
});

test('diamond sword answer is exactly ingredient quantities, without station or grid prose',()=>{
 assert.equal(ask('How do I craft a diamond sword?').answer,"To craft diamond sword, you'll need 2 diamonds and 1 stick.");
});
