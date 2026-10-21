import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createKnowledgeEngine} from './knowledge_engine_v59.mjs';
const db=JSON.parse(readFileSync(new URL('./knowledge_bundle_v59.json',import.meta.url)));
const engine=createKnowledgeEngine(db);
for(const q of ['how to craft hopper','hopper recipe','what is a creeper','how do i breed a cow','what is a bamboo jungle','how to make an acacia boat']){
 const result=engine.lookup(q); assert.notEqual(result.status,'unknown',`${q}: ${JSON.stringify(result)}`);
}
const h=engine.lookup('how to craft hopper');assert.equal(h.status,'found');assert.ok(h.recipes.length>0);
const cow=engine.lookup('how do i breed cow');assert.ok(['evidence_only','not_established'].includes(cow.status));
const unknown=engine.lookup('what is a blorbaflump');assert.equal(unknown.status,'unknown');
const noCraft=engine.lookup('how to craft bedrock');assert.ok(['not_established','ambiguous'].includes(noCraft.status));
console.log('PASS: 10 retrieval/uncertainty checks');
