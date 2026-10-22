import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const ask=q=>createConversation().ask(q);
test('reviewed baby constraints block breeding without blocking adult offspring questions',()=>{
 const data=JSON.parse(fs.readFileSync('data/entities/condition_editorial.json'));
 for(const [id,row] of Object.entries(data.subjects))if(row.topics.breeding_age) {
  const r=ask(`Can baby entity:${id} breed?`);assert.equal(r.topic,'breeding_age',id);assert.match(r.answer,/No.*baby cannot breed/);assert.ok(r.sources.length);
 }
 assert.match(ask('Can I breed baby cows with wheat?').answer,/must grow into an adult/);
 assert.match(ask('How do I breed cows to make a baby?').answer,/wheat/);
});
test('ownership and health requirements precede ordinary feeding suggestions',()=>{
 assert.match(ask('Can I breed untamed horses with golden carrots?').answer,/must be tamed/);
 assert.match(ask('Can I breed wild wolves with beef?').answer,/must be tamed/);
 assert.match(ask('Can injured wolves breed?').answer,/full health/);
 assert.match(ask('Do sniffers need full health to breed?').answer,/full health/);
 assert.match(ask('Can a baby sniffer dig?').answer,/cannot dig/);
});
test('short baby questions retain the last subject and do not leak between conversations',()=>{
 const a=createConversation(),b=createConversation();a.ask('What is a cow?');
 assert.match(a.ask('Can a baby breed?').answer,/No/);assert.equal(b.ask('Can a baby breed?').status,'unknown');
 assert.match(a.ask('What do they eat?').answer,/wheat/);
});
test('fox totems and already eaten food are not ordinary recoverable held items',()=>{
 assert.match(ask('What does a fox drop while holding a totem of undying?').answer,/consumes the totem and survives/);
 assert.match(ask('Does a fox drop the chicken it already ate?').answer,/already eaten is gone/);
 assert.match(ask('What does a fox drop?').answer,/holding|holds|held|carrying/i);
});
test('piglin gold and pork exceptions do not replace unrelated loot answers',()=>{
 assert.match(ask('Does a piglin drop its gold ingot when killed?').answer,/one hit.*examining/);
 assert.match(ask('Does a piglin drop cooked porkchops it picked up?').answer,/do not return/);
 assert.equal(ask('How much XP does a piglin drop?').topic,'experience');
});
test('conversion and shell questions distinguish drowned equipment and body loot',()=>{
 assert.match(ask('Does a converted drowned drop a trident?').answer,/does not generate.*trident/);
 assert.match(ask('Does a drowned drop a nautilus shell?').answer,/holding a shell drop that shell/);
 assert.match(ask('Does a drowned drop its trident with Looting III?').answer,/28%/);
});
