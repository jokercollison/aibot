import test from 'node:test';
import assert from 'node:assert/strict';
import {createConversation} from '../src/knowledge.js';
import locations from '../data/location_facts.json' with {type:'json'};

const resources = [
  ['diamond','diamond'], ['coal','coal'], ['iron','raw_iron'],
  ['copper','raw_copper'], ['gold','raw_gold'], ['redstone','redstone'],
  ['lapis','lapis_lazuli'], ['emerald','emerald'], ['ancient debris','ancient_debris']
];
test('natural resource locations reuse reviewed depth, dimension, biome and tool guidance', () => {
  for (const [name,key] of resources) {
    for (const question of [
      `Where can I find ${name}?`, `Where can I find ${name} blocks?`,
      `What level are ${name} blocks at?`, `How deep should I look for ${name}?`,
      `Which biome can I find ${name} blocks in?`
    ]) {
      const answer=createConversation().ask(question);
      assert.equal(answer.answer,locations['minecraft:'+key].answer,question);
      assert.deepEqual(answer.sources,locations['minecraft:'+key].reference_urls);
    }
  }
  assert.match(createConversation().ask('Where can I find netherite blocks?').answer,/mining ancient debris.*Nether/s);
  assert.match(createConversation().ask('Where can I find lapis lazuli blocks?').answer,/Y=0/);
  for (const name of ['quartz', 'quartz blocks', 'quartz ore'])
    assert.match(createConversation().ask('Where can I find '+name+'?').answer,/netherrack.*Nether/);
});
test('loose resource location retains ore context for follow-up mining questions', () => {
  const c=createConversation();
  c.ask('Where can I find diamond blocks?');
  assert.match(c.ask('What tool do I need to mine it?').answer,/iron.*pickaxe/i);
  assert.match(c.ask('How deep can I find it?').answer,/Y=-59/);
  assert.match(c.ask('Where can I find iron blocks?').answer,/Y=16/);
});
test('resource routing preserves storage, recipes, equipment, mobs and ordinary terrain', () => {
  for(const question of ['Where can I find solid diamond blocks?',
    'Where can I find storage diamond blocks?', 'Where can I find blocks of diamond?',
    'Where can I find block:minecraft:diamond_block?']) {
    assert.doesNotMatch(createConversation().ask(question).answer,/Y=-59/,question);
  }
  assert.match(createConversation().ask('How do I craft diamond blocks?').answer,/9 diamonds/);
  for(const question of ['Where can I find diamond swords?', 'Where can I find iron golems?',
    'Where can I find copper bulbs?', 'Where can I find nether gold ore?',
    'Where can I find dirt?']) {
    const answer=createConversation().ask(question);
    assert.notEqual(answer.topic==='location' && answer.subject,'minecraft:diamond_ore',question);
    assert.ok(!Object.values(locations).some(row=>row.answer===answer.answer),question);
  }
});
