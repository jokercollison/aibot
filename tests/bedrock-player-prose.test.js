import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createConversation} from '../src/knowledge.js';
test('player-facing entity and description text excludes Java comparisons',()=>{
 function check(row,path='') {
  if(Array.isArray(row))return row.forEach((v,i)=>check(v,path+'.'+i));
  if(row&&typeof row==='object')for(const [k,v] of Object.entries(row)) {
   if(['answer','what','does'].includes(k)&&typeof v==='string')assert.doesNotMatch(v,/\bjava\b/i,path+'.'+k);
   else if(!['references','conflicts'].includes(k))check(v,path+'.'+k);
  }
 }
 for(const p of ['data/entities/runtime.json','data/description_runtime.json'])check(JSON.parse(fs.readFileSync(p)),p);
});
test('baby piglin XP gives the applicable amount without an edition comparison',()=>{
 const answer=createConversation().ask('How much XP does a baby piglin drop?').answer;
 assert.match(answer,/1 experience point/);assert.doesNotMatch(answer,/\bjava\b|value of 5/i);
});
