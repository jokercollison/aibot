'use strict';
const assert=require('node:assert/strict');
const {answer,intent,subjects}=require('../scripts/query_engine_v48');
const tests=[
 ['How do I craft a hopper?','recipes'],
 ['What is the recipe for a hopper?','recipes'],
 ['Tell me a joke','dialogue'],
 ['Hello robot','dialogue'],
 ['What is Sharpness enchantment?','enchantments'],
 ['How do I brew weakness?','brewing'],
 ['Where can I find acacia logs?','loot'],
 ['What biome is snowy slopes?','biomes'],
 ['What is a creeper?','mobs'],
 ['Can a drowned drown?','mobs'],
 ['Is a creeper scared of cats?','mobs'],
 ['Can you tame a wolf?','mobs'],
 ['What can I craft with iron ingots?','recipes']
];
let count=0;for(const [q,category] of tests){const r=answer(q);assert.equal(r.category,category,`${q}: ${JSON.stringify(r)}`);assert.ok(r.answer.length>0);count++;}
assert.equal(answer('What is the recipe for a hopper?',{recipeVariant:999}).status,'clarify');count++;
assert.equal(answer('How do I craft a hopper?',{recipeVariant:-1}).status,'clarify');count++;
assert.equal(answer('unknown absolutely fictional block').status,'unknown_subject');count++;
assert.equal(answer(' ').status,'clarify');count++;
assert.equal(intent('How do I craft a hopper?'),'recipes');count++;
assert.ok(subjects('What is a creeper?',['mobs']).some(x=>x.key==='creeper'));count++;
assert.equal(answer('How do I craft a hopper?').source.includes('behavior_pack/recipes'),true);count++;
assert.ok(answer('Tell me a joke',{dialogueIndex:1}).answer!==answer('Tell me a joke',{dialogueIndex:0}).answer);count++;
console.log('PASS',count,'query-engine checks');
