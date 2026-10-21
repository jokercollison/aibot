import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createConversation} from '../src/knowledge.js';
import {entityTopic} from '../src/entities.js';
const ask=q=>createConversation().ask(q);
const db=JSON.parse(fs.readFileSync('data/entities/runtime.json'));
test('every authored named variant reaches its identity and habitat through the real conversation',()=>{
 for(const [id,row] of Object.entries(db)) {
  if(row.variant_alias_owner)continue;
  for(const variant of row.variants) {
   const alias=variant.aliases[0];
   for(const [topic,q] of [['identity',`What is a ${alias}?`],['spawning',`Where can I find a ${alias}?`]]) {
    if(!variant.topics[topic])continue;
    const result=ask(q);assert.equal(result.subject,id,id+' '+alias);assert.equal(result.status,'conditional',alias);
    if(topic==='identity')assert.ok(result.answer.startsWith(variant.topics[topic].answer),alias+' '+topic);else assert.equal(result.answer,variant.topics[topic].answer,alias+' '+topic);
    assert.ok(result.sources.length,alias);
   }
  }
 }
});
test('variant-aware follow-ups preserve the topic and change only the requested variant',()=>{
 const c=createConversation();assert.match(c.ask('Where can I find a red fox?').answer,/taigas/);
 assert.match(c.ask('and the snow one').answer,/snowy taigas and groves/);
 assert.match(c.ask('Can it breathe underwater?').answer,/can drown/);
 c.ask('Where can I find a pink axolotl?');assert.match(c.ask('what about blue').answer,/do not spawn naturally/);
 assert.match(c.ask('Does the blue one need water?').answer,/underwater|water/);
 assert.match(c.ask('Where can I find a cow?').answer,/grass/);
 assert.doesNotMatch(c.ask('What is it?').answer,/blue axolotl/);
});
test('frog color, habitat and froglight output use the variant instead of the parent summary',()=>{
 for(const [color,light] of [['orange','ochre'],['white','pearlescent'],['green','verdant']])assert.match(ask(`Which froglight does a ${color} frog produce?`).answer,new RegExp(light));
 assert.match(ask('Where can I find a cold frog?').answer,/Raise a tadpole/);
 assert.match(ask('Where can I find a white frog?').answer,/mangrove/);
});
test('climate coats do not fabricate biome-only breeds or change breeding inheritance',()=>{
 assert.match(ask('Where can I find a cold cow?').answer,/taiga/);
 assert.match(ask('Where can I find a warm pig?').answer,/savanna/);
 assert.match(ask('What variants do chickens have?').answer,/breeding inherits a parent/i);
 assert.match(ask('Where can I find a brown llama?').answer,/not separate biome-exclusive/);
 assert.match(ask('Where can I find a chestnut horse?').answer,/not confined to a separate biome/);
});
test('personality-specific health and behavior retain Bedrock exceptions',()=>{
 assert.match(ask('How much health does a weak panda have?').answer,/10 health points/);
 assert.match(ask('What does a lazy panda do?').answer,/In Bedrock.*get up/);
 assert.match(ask('What does a worried panda do?').answer,/avoids non-panda/);
});
test('villager profession and biome are distinct, with correct job-site blocks',()=>{
 assert.match(ask('How do I make a librarian villager?').answer,/lectern/);
 assert.match(ask('What does a toolsmith trade?').answer,/tools/);
 assert.match(ask('Where can I find a swamp villager?').answer,/do not naturally generate/);
 assert.match(ask('Can a nitwit trade?').answer,/do not trade/);
});
test('fire, sunlight and conditional protection never collapse to one immunity',()=>{
 assert.match(ask('Can a cow survive lava?').answer,/fire and lava damage and die/);
 assert.match(ask('Does a cow burn in sunlight?').answer,/does not.*burn/);
 assert.match(ask('Does a magma cube burn in sunlight?').answer,/fire-immune/);
 assert.match(ask('Can a blaze survive lava?').answer,/immune/);
 assert.match(ask('Can a piglin survive lava?').answer,/not fire-immune/);
 assert.match(ask('Does a zombie horse burn in sunlight?').answer,/body armor/);
 assert.match(ask('Does a husk burn in sunlight?').answer,/do not burn/);
});
test('breathing rules distinguish amphibians, fish, dolphins, undead and golems',()=>{
 assert.match(ask('Can a dolphin drown?').answer,/need both water and access to air/);
 assert.match(ask('Can a frog breathe underwater?').answer,/breathe underwater.*breathe air/);
 assert.match(ask('Can an iron golem drown?').answer,/do not drown/);
 assert.match(ask('Can a salmon breathe air?').answer,/needs water/);
 assert.match(ask('Can an enderman swim?').answer,/Water damages/);
 const c=createConversation();c.ask('What is a wolf?');
 assert.match(c.ask('Can it survive in lava?').answer,/fire and lava damage/);
 assert.match(c.ask('Can it breathe underwater?').answer,/can drown/);
});
test('powder snow, conversions and lightning stay distinct from future Freezing-effect content',()=>{
 assert.match(ask('Can a polar bear freeze in powder snow?').answer,/immune/);
 assert.match(ask('Can a goat freeze in powder snow?').answer,/can take freezing damage/);
 assert.match(ask('What happens to a pig when struck by lightning?').answer,/zombified piglin/);
 assert.match(ask('What does a husk turn into in water?').answer,/first convert into a normal zombie/);
 assert.match(ask('Can a skeleton convert in powder snow?').answer,/stray/);
 assert.doesNotMatch(ask('What does a zombie turn into in powder snow?').answer,/frostbite/i);
});
test('harvesting and flower-stew effects are interaction loot rather than death loot',()=>{
 assert.match(ask('How do I brush an armadillo?').answer,/scute/);
 assert.match(ask('How do I shear a mooshroom?').answer,/five.*mushrooms.*cow/);
 assert.match(ask('What stew do I get from a brown mooshroom with an allium?').answer,/Fire Resistance.*3 seconds/);
 assert.match(ask('What stew do I get from a brown mooshroom with an open eyeblossom?').answer,/Blindness.*7 seconds/);
 assert.match(ask('Can I feed a dandelion to a red mooshroom?').answer,/Red mooshrooms do not make suspicious stew/);
 assert.match(ask('What happens when I shear a rainbow sheep?').answer,/underlying wool color/);
});
test('baby growth, egg hatching and armor repair use their own mechanics',()=>{
 assert.match(ask('How long does a baby sniffer take to grow?').answer,/40 minutes/);
 assert.match(ask('How long does a sniffer egg take to hatch?').answer,/20 minutes.*10 minutes/);
 assert.match(ask('Can I stop a baby cow growing with a golden dandelion?').answer,/pause its aging/);
 assert.match(ask('Can I stop a baby villager growing with a golden dandelion?').answer,/do not pause villager/);
 assert.match(ask('How do I heal an iron golem?').answer,/iron ingots/);
 assert.match(ask('How do I repair wolf armor?').answer,/armadillo scutes/);
});
test('new facet words do not hide food questions with incidental scene descriptions',()=>{
 const food=ask('What do cows eat?').answer;
 for(const q of ['cows eat','What do cows eat when near water?','What do cows eat when it is raining?','What do cows eat in the plains when they are 200 years old?'])assert.equal(ask(q).answer,food,q);
 assert.equal(ask('Can a cow teleport?').status,'unknown');
 assert.equal(ask('Why does a cow know quantum physics?').status,'unknown');
});
test('mob form questions separate ages, roles, equipment and changing states',()=>{
 const cases=[['allay',/rather than producing a baby/],['piglin brute',/no baby/],['iron golem',/cracks/i],['strider',/temperature/],['pufferfish',/inflated/],['vex',/red/],['skeleton',/distinct/],['mule',/cannot breed/],['dolphin',/does not breed/]];
 for(const [name,expected] of cases) {
  const r=ask(`What variants does a ${name} have?`);assert.equal(r.topic,'variants',name);assert.match(r.answer,expected,name);
 }
});
test('shulker coloring retains Bedrock Creative restriction',()=>{
 assert.match(ask('What variants does a shulker have?').answer,/Creative mode/);
 assert.match(ask('What equipment can a shulker use?').answer,/not a Survival dye interaction/);
});
test('cube drowning is distinct from fire immunity and vex lifetime is scoped',()=>{
 assert.match(ask('Can a magma cube drown underwater?').answer,/15 seconds/);
 assert.match(ask('Can a slime drown underwater?').answer,/can drown/);
 const c=createConversation();assert.match(c.ask('Do vexes live forever?').answer,/30 to 119 seconds/);
 assert.match(c.ask('Do they disappear?').answer,/spawn eggs or commands/);
});
test('every catalog mob now has a sourced form/state summary without claiming completeness',()=>{
 const subjects=JSON.parse(fs.readFileSync('data/entities/subjects.json')).subjects;
 const coverage=JSON.parse(fs.readFileSync('docs/ENTITY_KNOWLEDGE_COVERAGE.json'));
 const mobs=Object.entries(subjects).filter(([,s])=>s.category==='mob');
 assert.equal(mobs.length,90);
 for(const [id] of mobs) {
  assert.ok(db[id].topics.variants?.answer,id);
  assert.ok(db[id].topics.variants.sources.length,id);
  assert.equal(coverage.subjects[id].complete,false,id);
 }
});
