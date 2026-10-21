import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createConversation,recipeText} from '../src/knowledge.js';
const load=p=>JSON.parse(readFileSync(p));
const index=load('data/recipe_index.json'),raw=load('data/official_recipes.json');
const ask=q=>createConversation().ask(q);
test('every source recipe is indexed or explicitly represented as an input-dependent operation',()=>{
 const sources=new Set([...Object.values(index.by_output).flat(),...index.operations].map(r=>r.source));
 const official=new Set(Object.values(raw).flat().map(r=>r.source));
 assert.deepEqual(sources,official);assert.equal(sources.size,1892);
});
test('every official block/item/entity is present and classified, not guessed uncraftable',()=>{
 const inventory=load('data/sample_inventory.json'),catalog=load('data/catalog.json').records,audit=load('docs/CRAFTING_COVERAGE.json');
 for(const [kind,ids] of Object.entries(inventory.by_kind)){
  const local=new Set(Object.values(catalog).filter(r=>r.kind===kind).map(r=>r.minecraft_id));
  for(const id of ids){assert.ok(local.has(id),id);assert.ok(audit.records.some(r=>r.kind===kind&&r.minecraft_id===id),id);}
 }
 assert.equal(audit.wiki.complete_wiki_imported,false);
 assert.ok(audit.records.some(r=>r.classification==='no_sample_recipe_acquisition_unresolved'));
});
test('list outputs recover cake and beehive recipes without treating byproducts as target recipes',()=>{
 assert.match(ask('How do I craft cake?').answer,/3 milk buckets, 3 wheat, 2 sugar, and 1 egg/);
 assert.equal(ask('How do I craft a beehive?').answer,"To craft beehive, you'll need 6 wooden planks and 3 honeycombs.");
 assert.ok(!index.by_output['minecraft:bucket'].some(r=>r.source.endsWith('/cake.json')));
});
test('netherite upgrades include the template, base equipment and addition',()=>{
 const r=ask('How do I craft a netherite sword?');assert.equal(r.status,'conditional');
 for(const phrase of ['netherite upgrade smithing template','diamond sword','netherite ingot','smithing table'])assert.ok(r.answer.includes(phrase));
});
test('legacy color/wood variants route to their actual modern item rather than a generic old ID',()=>{
 assert.match(ask('How do I craft a birch chest boat?').answer,/1 birch boat/);
 assert.ok(index.by_output['minecraft:orange_dye'].length>0);assert.ok(index.by_output['minecraft:charcoal'].length>0);
 assert.doesNotMatch(ask('How do I make orange dye?').answer,/minecraft:|data:|metadata/);
});
test('interchangeable planks produce one wooden sword answer, while wood-specific boats keep their wood',()=>{
 const r=ask('How do I craft a wooden sword?');assert.equal(r.answer,"To craft wooden sword, you'll need 2 wooden planks and 1 stick.");
 assert.doesNotMatch(r.answer,/crimson|warped|mangrove/);
 assert.match(ask('How do I craft a birch boat?').answer,/5 birch planks/);
 assert.match(ask('How do I craft an oak boat?').answer,/5 oak planks/);
});
test('brewing is not mislabeled as cooking',()=>{
 const r=ask('How do I brew a strength potion?');assert.equal(r.status,'conditional');assert.match(r.answer,/awkward potion/);assert.match(r.answer,/brewing stand/);assert.doesNotMatch(r.answer,/cook|furnace/);
});
test('each normalized output can be reached by its exact subject ID through the real question engine',()=>{
 for(const id of Object.keys(index.by_output)){
  const r=ask('How do I craft '+id+'?');assert.equal(r.status,'conditional',id);
  assert.doesNotMatch(r.answer,/still need to learn the steps|Grid rows|top to bottom/,id);
 }
});
test('mining-location examples answer depth and retain the subject in follow-ups',()=>{
 const c=createConversation();const r=c.ask('Where can I find diamonds?');assert.equal(r.status,'conditional');assert.match(r.answer,/Y=-59/);assert.match(r.answer,/iron pickaxe/);
 assert.match(c.ask('What biome can I find them in?').answer,/not restricted to one Overworld biome/);
 assert.match(ask('How deep in the ground is coal?').answer,/above Y=0/);
});
test('entity component topics provide health and taming with state qualifications',()=>{
 assert.match(ask('How much health does a creeper have?').answer,/health points/);
 assert.match(ask('How do I tame a wolf?').answer,/bone/);
});
