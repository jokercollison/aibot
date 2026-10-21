const assert=require('assert');const {query,eventLine}=require('../scripts/knowledge_engine');
let r=query('How do I craft a hopper?');assert.equal(r.status,'found');assert(r.answer.includes('chest'));assert(r.answer.includes('iron ingot'));
assert.equal(query('How do I craft a definitely_not_real_item?').status,'unknown');
assert(eventLine('lava_nearby',1).includes('lava'));
console.log('PASS: hopper crafting, unknown-answer handling, contextual dialogue');
