import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const descriptions=JSON.parse(readFileSync('data/description_catalog.json'));
const catalog=JSON.parse(readFileSync('data/catalog.json')).records;
const ask=q=>createConversation().ask(q);
test('every catalog block/item/entity has separate what and does content, with provenance',()=>{
 const subjects=Object.values(catalog).filter(r=>['block','item','entity'].includes(r.kind));
 assert.equal(subjects.length,3222);assert.equal(Object.keys(descriptions).length,subjects.length);
 for(const r of subjects){
  const d=descriptions[r.id];assert.ok(d,r.id);assert.ok(d.what.trim()&&d.does.trim(),r.id);assert.notEqual(d.what,d.does,r.id);
  assert.doesNotMatch(d.what+' '+d.does,/\{(?:name|variant)\}|is listed|supplied registry/,r.id);
  assert.ok(d.reference_urls.length);assert.ok(d.verification);
 }
});
test('public question path serves every catalog description, rather than recipe redirects',()=>{
 for(const [id,d] of Object.entries(descriptions)){
  const r=ask('What is '+id+'?');
  assert.equal(r.status,'conditional',id);assert.ok(r.answer.startsWith(d.what),id);assert.ok(r.answer.includes(d.does),id);
  assert.doesNotMatch(r.answer,/supplied|registry|not.*checked|editorial|verification|source_files/,id);
 }
});
test('hopper identity and function questions explain collection, transfer direction and locking',()=>{
 for(const q of ['What is a hopper?','What does a hopper do?','How do hoppers work?','What is a hopper used for?']){
  const r=ask(q);assert.match(r.answer,/collects and moves items/);assert.match(r.answer,/container above/);assert.match(r.answer,/spout points/);assert.match(r.answer,/redstone/);
 }
});
test('descriptions preserve per-conversation follow-ups and change subject correctly',()=>{
 const one=createConversation(),two=createConversation();
 one.ask('What is a hopper?');two.ask('What is a creeper?');
 assert.match(one.ask('What does it do?').answer,/collects and moves/);
 assert.match(two.ask('What scares it?').answer,/cats and ocelots/);
 assert.match(one.ask('How do I craft it?').answer,/5 iron ingots/);
 one.ask('What is a cow?');assert.match(one.ask('How do I breed them?').answer,/wheat/);
});
test('regular natural names work across blocks, items, equipment, fluids and entities',()=>{
 for(const q of ['What is a chest?','What is a furnace?','What is a diamond pickaxe?','What is a zombie?','What is a creeper?','What is an arrow?','What is lava?','What is an oak stair?','What are wolves?'])assert.equal(ask(q).status,'conditional',q);
});
test('unsupported special mechanics still admit uncertainty rather than using basic descriptions as an answer',()=>{
 assert.equal(ask('Can a cow teleport?').status,'unknown');
 assert.equal(ask('Where can I find a flibbertigibbet?').status,'unknown');
 assert.match(ask('What is a flibbertigibbet?').answer,/not sure/);
});
test('family matching does not mistake crop/mushroom stems for wood or double slabs for half blocks',()=>{
 for(const name of ['melon_stem','pumpkin_stem'])assert.match(ask('What is minecraft:'+name+'?').answer,/crop plant/);
 assert.match(ask('What is minecraft:mushroom_stem?').answer,/huge mushroom/);
 assert.match(ask('What is minecraft:double_cut_copper_slab?').answer,/full-height/);
});
test('mob versus item meaning is clarified and can be selected naturally',()=>{
 assert.equal(ask('What is a slime?').status,'ambiguous');
 assert.match(ask('What is a slime mob?').answer,/bouncing hostile mob/);
 assert.match(ask('What is a slime block?').answer,/bouncy block/);
});
test('short clarification answers resolve remembered choices and retain the selected subject',()=>{
 for(const reply of ['a mob','mob','the mob','an entity']){
  const c=createConversation();assert.equal(c.ask('What is a slime?').status,'ambiguous');
  assert.match(c.ask(reply).answer,/bouncing hostile mob/);
  assert.match(c.ask('What does it do?').answer,/divides into smaller slimes/);
 }
 const c=createConversation();c.ask('What is a slime?');assert.match(c.ask('a block').answer,/bouncy block/);
 assert.match(c.ask('How do I craft it?').answer,/9 slime balls/);
});
test('pending clarification is private to a conversation and an unrelated resolved subject clears it',()=>{
 const a=createConversation(),b=createConversation();a.ask('What is a slime?');assert.equal(b.ask('a mob').status,'unknown');
 a.ask('What is a hopper?');assert.equal(a.ask('a mob').status,'unknown');
});
