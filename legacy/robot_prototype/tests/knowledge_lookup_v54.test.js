const assert=require('node:assert/strict');
const kb=require('../scripts/knowledge_lookup_v54');
const cases=[
 ()=>assert.ok(kb.entity('cow').length),
 ()=>assert.ok(kb.entity('minecraft:creeper').length),
 ()=>assert.ok(kb.recipe('hopper').length),
 ()=>assert.ok(kb.recipe('acacia boat').length),
 ()=>assert.ok(kb.recipe('acacia_boat')[0].variants.length),
 ()=>assert.ok(kb.usages('diorite').length),
 ()=>assert.ok(kb.find('not_a_real_minecraft_entity').length===0),
 ()=>assert.ok(kb.find('cow','recipe').length===0),
 ()=>assert.equal(kb.normalize('minecraft:Iron_Ingot'),'iron_ingot'),
 ()=>assert.ok(kb.answer('How do I craft a hopper?').intent==='recipe'),
 ()=>assert.ok(kb.answer('What is a creeper?').intent==='entity'),
 ()=>assert.ok(kb.answer('Please sing an opera').confidence==='unresolved'),
 ];
for (const [i,test] of cases.entries()) {test();console.log('PASS',i+1);}
console.log('Passed',cases.length,'checks');
