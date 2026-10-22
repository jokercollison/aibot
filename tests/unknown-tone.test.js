import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createConversation} from '../src/knowledge.js';
test('unknown answers keep a friendly uncertainty opening and retain contextual guidance',()=>{
 const c=createConversation();
 assert.match(c.ask('What is a flibbertigibbet?').answer,/^Hmm, I'm not sure about that one yet/);
 const r=c.ask('How do I mine a hopper?');
 assert.equal(r.status,'unknown');assert.match(r.answer,/^Hmm, .*hopper/);
 assert.match(c.ask('How do I craft it?').answer,/5 iron ingots/);
});
test('known negative answers and clarifications remain distinct from missing knowledge',()=>{
 const c=createConversation();
 assert.doesNotMatch(c.ask('Can I breed a creeper?').answer,/^Hmm,/);
 assert.equal(c.ask('What is a slime?').status,'ambiguous');
 assert.doesNotMatch(c.ask('a mob').answer,/^Hmm,/);
});
