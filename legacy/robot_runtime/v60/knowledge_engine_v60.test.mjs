import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createKnowledgeEngineV60} from './knowledge_engine_v60.mjs';
const db=JSON.parse(readFileSync(new URL('./knowledge_bundle_v60.json',import.meta.url)));
const e=createKnowledgeEngineV60(db);
const cases=[
 ['how do i craft a hopper','craft'],['what is the recipe for acacia boat','craft'],
 ['what does aqua affinity enchantment do','enchant'],['will a cow drown','mob'],
 ['where do i find acacia log','where'],['what is a creeper','describe'],
 ['what can i craft with cobblestone','craft'],['tell me about silk touch','describe']
];
for (const [q,mode] of cases){const r=e.ask(q);assert.equal(r.intent,mode,`${q}: ${JSON.stringify(r)}`);assert.ok(r.status);console.log(q,'=>',r.status);}
assert.equal(e.ask('how do i craft a hopper').status,'found');
assert.equal(e.ask('what does aqua affinity enchantment do').status,'reference_pending_verification');
assert.equal(e.ask('what is a flibbertygibbetxyz').status,'unknown');
console.log('PASS',cases.length+3,'checks');
