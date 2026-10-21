import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const ask=q=>createConversation().ask(q);
test('entity topic extraction tolerates greetings and incidental scenery',()=>{
 const base=ask('What does a creeper drop?');
 for(const q of ['Hey what does a creeper drop when it is out in the middle of a field?','What drops can I get from creepers?','Tell me about creeper drops'])assert.equal(ask(q).answer,base.answer);
 assert.match(base.answer,/0–2 gunpowder/);assert.match(base.answer,/skeleton, stray or bogged/);assert.match(base.answer,/another charged creeper/);
 assert.ok(base.sources.every(s=>s.includes('PermanentLink/')));
});
test('entity topics survive pronouns and mob ambiguity clarification',()=>{
 const c=createConversation();assert.equal(c.ask('What is a slime?').status,'ambiguous');
 c.ask('a mob');assert.match(c.ask('Where can I find it?').answer,/swamp/i);
 assert.match(c.ask('What does it drop?').answer,/slimeball/i);
});
test('Bedrock-specific answers retain edition differences',()=>{
 assert.match(ask('How much health does a wither have?').answer,/300.*450.*600/);
 assert.match(ask('How do I tame a skeleton horse?').answer,/already tamed/i);
 assert.match(ask('How do I ride a skeleton horse?').answer,/without a saddle/i);
 assert.match(ask('How do I breed pandas?').answer,/eight|8/i);
 assert.match(ask('What does a cod drop?').answer,/bones/);
});
test('named wolf variants select biome and retain variant context',()=>{
 const c=createConversation();assert.match(c.ask('Where can I find a snowy wolf?').answer,/grove/);
 assert.match(c.ask('Where does it spawn?').answer,/grove/);
 assert.match(c.ask('Where can I find a black wolf?').answer,/old growth pine taiga/);
 assert.doesNotMatch(c.ask('Where can I find a cow?').answer,/pine taiga/);
});
test('constructed entities are resolved before item recipe lookup',()=>{
 assert.match(ask('How do I build a wither?').answer,/three wither skeleton skulls/);
});
test('coverage records all catalog entities without claiming exhaustive knowledge',()=>{
 const report=JSON.parse(fs.readFileSync(new URL('../docs/ENTITY_KNOWLEDGE_COVERAGE.json',import.meta.url)));
 assert.equal(report.catalog_entities,129);assert.equal(report.additional_reference_subjects,13);assert.equal(report.entities,142);assert.equal(report.complete,false);
 assert.ok(Object.values(report.subjects).some(r=>Object.values(r.topics).includes('pending_review')));
 assert.ok(Object.values(report.subjects).every(r=>r.complete===false));
});
test('color ambiguity keeps the original question while accepting a short clarification',()=>{
 const c=createConversation();assert.equal(c.ask('Where can I find a white wolf?').status,'ambiguous');
 assert.match(c.ask('snowy').answer,/grove/);
 assert.match(c.ask('Where does it spawn?').answer,/grove/);
 assert.match(c.ask('Where do wolves spawn?').answer,/taiga.*forest/);
});
