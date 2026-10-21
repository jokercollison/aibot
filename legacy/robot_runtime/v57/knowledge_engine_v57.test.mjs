import assert from 'node:assert/strict';import fs from 'node:fs';import {answer,classify,findEntities} from './knowledge_engine_v57.mjs';
const c=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const a=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
const cases=[['How do I craft a hopper?','recipe'],['What is a creeper?','mob'],['How do I brew a potion?','brewing'],['Tell me a joke','conversation'],['How do I enchant a sword?','enchantment'],['Where do I find diamonds?','sources'],['What is a snowy slopes biome?','biome'],['Will a cow drown?','mob']];
for(const [q,expected] of cases){assert.equal(classify(q).intent,expected,q);const result=answer(q,c,a);assert.ok(result.status,q);console.log(q,'=>',result.status,result.record_id??'');}
const r=answer('How do I craft a hopper?',c,a);assert.equal(r.record_id,'recipe:hopper');assert.match(r.text,/Crafting grid|Ingredients:/);
assert.equal(answer('Tell me a joke',c,a).status,'conversation');
assert.equal(answer('Where can I find a completely nonexistent item?',c,a).status,'unknown');
assert.equal(answer('Does an allay burn in lava?',c,a).intent,'mob');
console.log('V57 tests passed');
