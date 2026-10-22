import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p));
test('core topic audit reconciles every catalog entity with explicit unresolved states',()=>{
 const catalog=read('data/entities/subjects.json').subjects;
 const audit=read('docs/ENTITY_CORE_TOPIC_AUDIT.json');
 assert.deepEqual(Object.keys(audit.subjects).sort(),Object.keys(catalog).sort());
 assert.equal(audit.catalog_entities,129);assert.equal(audit.mobs,90);assert.equal(audit.other_entities,39);
 const totals={};
 for(const [id,row] of Object.entries(audit.subjects)) {
  assert.equal(row.complete,false,id);
  assert.deepEqual(row.pending_core_topics,Object.entries(row.core_topics).filter(([,s])=>s==='pending_review').map(([t])=>t));
  for(const [topic,status] of Object.entries(row.core_topics)) {
   totals[topic]??={};totals[topic][status]=(totals[topic][status]??0)+1;
  }
 }
 assert.deepEqual(totals,audit.topic_counts);
 assert.equal(audit.complete,false);
 assert.equal(audit.subjects['minecraft:cow'].core_topics.diet,'reviewed_summary');
 assert.equal(audit.subjects['minecraft:creeper'].core_topics.diet,'reviewed_summary');
});
