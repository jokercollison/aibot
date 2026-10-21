import test from 'node:test';
import assert from 'node:assert/strict';
import {createConversation} from '../src/knowledge.js';
import locations from '../data/location_facts.json' with {type:'json'};
test('reviewed mining answers are connected through the player question path with revision sources',()=>{
 for(const [id,row] of Object.entries(locations)){
  assert.equal(row.edition,'bedrock');assert.equal(row.live_wiki_checked,true);
  assert.ok(Number.isInteger(row.source_revision));assert.equal(row.target_version_runtime_verified,false);
  const result=createConversation().ask('Where can I find '+id+'?');
  assert.equal(result.answer,row.answer,id);assert.ok(result.sources[0].includes('oldid='));
 }
});
test('Bedrock ancient debris and slime guidance retains edition-specific distinctions',()=>{
 assert.match(createConversation().ask('Where can I find ancient debris?').answer,/Y=8 to Y=23/);
 const c=createConversation();c.ask('What is a slime?');c.ask('a mob');
 const result=c.ask('Where does it spawn?');assert.match(result.answer,/same across world seeds/);assert.match(result.answer,/below Y=40/);
});
