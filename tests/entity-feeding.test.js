import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const ask=q=>createConversation().ask(q);
test('feeding topic keeps the creature as recipient when food has a longer name',()=>{
 for(const q of ['Can I feed tropical fish to an axolotl?','Can I feed an axolotl tropical fish?']) {
  const r=ask(q);assert.equal(r.subject,'minecraft:axolotl');
  assert.match(r.answer,/bucket of tropical fish/);assert.equal(r.status,'unknown');
 }
});
test('healing and breeding food are not interchangeable',()=>{
 const healing=ask('How do I heal a wolf with raw cod?');
 assert.equal(healing.subject,'minecraft:wolf');assert.match(healing.answer,/4 health points/);
 const breeding=ask('Can I breed wolves with raw cod?');
 assert.equal(breeding.status,'unknown');assert.match(breeding.answer,/raw chicken/);
 assert.doesNotMatch(breeding.answer,/For breeding: raw cod/);
 const taming=ask('Can I tame a wolf with beef?');assert.equal(taming.status,'unknown');assert.match(taming.answer,/bone/);
});
test('harmful feeding interactions never become healing suggestions, including plural foods',()=>{
 for(const q of ['Can I feed a parrot a cookie?','Can I feed a parrot cookies?']) {
  const r=ask(q);assert.equal(r.subject,'minecraft:parrot');assert.match(r.answer,/Do not feed.*cookie/);assert.match(r.answer,/harmful/);
 }
});
test('food follow-ups retain creature instead of switching to food item',()=>{
 const c=createConversation();c.ask('What is a cow?');
 assert.match(c.ask('What do they eat?').answer,/wheat/);
 assert.match(c.ask('How do I breed them?').answer,/wheat/);
});
test('fixed component health is current and special states retain curated explanations',()=>{
 assert.match(ask('How many hearts does an allay have?').answer,/20 health points \(10 hearts\)/);
 assert.match(ask('How much health does a wolf have?').answer,/Wild.*8.*tamed.*40/);
 assert.match(ask('How much health does an iron golem have?').answer,/100/);
});
test('food data retains scopes, useful effects, conditions and excluded conflicts',()=>{
 const db=JSON.parse(fs.readFileSync(new URL('../data/entities/runtime.json',import.meta.url)));
 assert.ok(db['minecraft:wolf'].feeding.roles.taming.every(i=>i.scope==='minecraft:wolf_wild'));
 assert.ok(db['minecraft:axolotl'].feeding.roles.breeding.every(i=>i.result_item==='water_bucket:0'));
 assert.ok(db['minecraft:parrot'].feeding.hazards.some(i=>i.id==='minecraft:cookie'));
 assert.ok(!db['minecraft:parrot'].feeding.roles.healing?.some(i=>i.id==='minecraft:cookie'));
 assert.ok(Object.values(db['minecraft:bee'].feeding.roles).every(items=>items.every(i=>i.id!=='minecraft:wither_rose')));
});
test('pronoun feeding with a named food keeps the prior creature',()=>{
 const c=createConversation();c.ask('What is a wolf?');
 for(const q of ['Can I feed raw cod to it?','Can I feed it raw cod?','Can I heal it with raw cod?'])assert.equal(c.ask(q).subject,'minecraft:wolf');
 assert.equal(c.ask('Can I breed them with raw cod?').status,'unknown');
});
test('wiki entity reconciliation accounts for every inventoried page without importing Java or future mobs',()=>{
 const r=JSON.parse(fs.readFileSync(new URL('../docs/ENTITY_WIKI_CLASSIFICATION.json',import.meta.url)));
 assert.equal(r.pages.length,208);assert.equal(r.complete_gameplay_knowledge,false);
 assert.ok(r.pages.every(p=>p.classification!=='pending_classification'&&p.source.includes('PermanentLink/')&&p.sha256.length===64));
 const category=t=>r.pages.find(p=>p.title===t).classification;
 assert.equal(category('Frostbite'),'future_not_target_version');
 assert.equal(category('Mannequin'),'java_only');
 assert.equal(category('Elder Guardian Ghost'),'bedrock_reference_gap');
 assert.equal(category('Map Marker'),'bedrock_editor_only');
 assert.equal(category('Pet Wolf'),'joke_snapshot');
 assert.equal(category('Spider Jockey'),'composite_or_role');
});
test('conflicting source food stays out of affirmative feeding advice',()=>{
 const r=ask('Can I feed a wither rose to a bee?');
 assert.equal(r.subject,'minecraft:bee');assert.equal(r.status,'unknown');
 assert.match(r.answer,/dandelion or poppy/);
});
