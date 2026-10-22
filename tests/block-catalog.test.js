import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const audit=JSON.parse(readFileSync('docs/BLOCK_QUESTION_AUDIT.json'));
test('full catalog audit separates connected facets from unresolved questions',()=>{
 assert.equal(audit.catalog_blocks,1463);assert.equal(audit.questions,21945);
 assert.equal(audit.detailed_subjects,1463);assert.equal(audit.definition_only_subjects,0);
 assert.deepEqual(audit.expected_facet_failures,[]);assert.equal(audit.full_block_phase_complete,false);
 assert.ok(audit.topic_counts.growth.unresolved>0);
 for(const row of Object.values(audit.subjects)){assert.ok(row.reviewed_topics.length);assert.equal(row.complete,false);}
});
test('new decoration, mining and acquisition exceptions answer natural questions',()=>{
 const ask=q=>createConversation().ask(q).answer;
 assert.match(ask('How do I mine a cake?'),/cannot be collected/);
 assert.match(ask('How do I mine a candle cake?'),/returns the candle/);
 assert.match(ask('How do I mine a decorated pot?'),/by hand.*Silk Touch/);
 assert.match(ask('How do I mine a sculk shrieker?'),/Silk Touch/);
 assert.match(ask('How do I use a sculk shrieker?'),/cannot summon/);
 assert.match(ask('How do I mine suspicious sand?'),/Brush it in place/);
 assert.match(ask('How do I mine reinforced deepslate?'),/drops nothing/);
 assert.match(ask('Where is bedrock?'),/bottom boundary of the Overworld/);
 assert.match(ask('How do I mine a bee nest?'),/Without Silk Touch.*drops nothing/);
 assert.match(ask('How do I mine a beehive?'),/drops itself/);
});
test('named fluids and fire do not override the requested topic',()=>{
 const ask=q=>createConversation().ask(q);
 assert.equal(ask('How do I mine water?').topic,'mining');
 assert.match(ask('How do I mine water?').answer,/bucket on a source/);
 assert.equal(ask('Is fire dangerous?').topic,'danger');
 assert.equal(ask('How do I use lava?').topic,'operation');
});
test('sign aliases and decorated pot fallback keep recipes ingredient-only',()=>{
 const ask=q=>createConversation().ask(q).answer;
 assert.match(ask('How do I craft block:minecraft:acacia_wall_sign?'),/6 acacia planks.*1 stick/);
 assert.match(ask('How do I craft a decorated pot?'),/4 bricks/);
 for(const q of ['How do I craft a decorated pot?','How do I craft block:minecraft:birch_standing_sign?'])assert.doesNotMatch(ask(q),/grid|shaped|station|top row/i);
});

test('reviewed uncraftable blocks say so without treating absent files as proof',()=>{
 const ask=q=>createConversation().ask(q);
 assert.match(ask('Can I craft bedrock?').answer,/cannot craft bedrock/);
 assert.match(ask('How do I craft a bee nest?').answer,/cannot craft bee nest/);
 assert.match(ask('How do I get calcite?').answer,/amethyst geodes/);
 assert.equal(ask('How do I craft a flibbertigibbet?').status,'unknown');
});
