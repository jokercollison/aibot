// Reconcile every catalog block and exercise its actual question paths.
import fs from 'node:fs';
import {createConversation} from '../src/knowledge.js';
const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(fs.readFileSync(new URL(p,root)));
const catalog=Object.values(read('data/catalog.json').records).filter(r=>r.kind==='block');
const files=fs.readdirSync(new URL('data/blocks/',root)).filter(f=>f.endsWith('.json'));
const rules=files.flatMap(f=>(read('data/blocks/'+f).rules??[]).map(r=>({...r,file:f,regex:new RegExp('^(?:'+r.pattern+')$')})));
const terrain=read('data/blocks/terrain.json').subjects;
const prompts={identity:s=>`What is ${s}?`,uses:s=>`What is ${s} used for?`,recipe:s=>`How do I craft ${s}?`,mining:s=>`How do I mine ${s}?`,location:s=>`Where can I find ${s}?`,growth:s=>`How do I grow ${s}?`,operation:s=>`How do I use ${s}?`,storage:s=>`How many slots are in ${s}?`,redstone:s=>`How does redstone affect ${s}?`,water:s=>`What happens with water and ${s}?`,fire:s=>`What happens with fire and ${s}?`,gravity:s=>`Does gravity affect ${s}?`,oxidation:s=>`How does oxidation affect ${s}?`,stripping:s=>`How do I strip ${s}?`,danger:s=>`Is it dangerous to use ${s}?`};
const report={scope:'Every pinned catalog block, including internal and Education identifiers. Basic descriptions, detailed facets, recipes and unresolved topics are counted separately. No unknown is silently not-applicable. This audit is not complete factual validation or Minecraft execution.',catalog_blocks:catalog.length,questions:0,expected_facet_questions:0,expected_facet_failures:[],detailed_subjects:0,definition_only_subjects:0,topic_counts:{},subjects:{},full_block_phase_complete:false};
for(const r of catalog) {
 const matching=rules.filter(rule=>rule.regex.test(r.minecraft_id.slice(10)));
 const expected=new Set([...matching.flatMap(rule=>Object.keys(rule.topics)),...Object.keys(terrain[r.minecraft_id]?.topics??{})]);
 const row={name:r.name,reviewed_families:matching.map(rule=>rule.file+':'+rule.id),reviewed_topics:[...expected].sort(),topics:{},complete:false};
 if(expected.size)report.detailed_subjects++;else report.definition_only_subjects++;
 for(const [topic,question] of Object.entries(prompts)) {
  const q=question('block:'+r.minecraft_id),answer=createConversation().ask(q);
  report.questions++;
  const detailed=answer.topic===topic&&answer.status==='conditional';
  const basic=['identity','uses'].includes(topic)&&answer.status==='conditional';
  const recipe=topic==='recipe'&&answer.status==='conditional'&&!/still need to learn|not sure/i.test(answer.answer);
  const status=detailed?'connected_facet':basic?'basic_summary':recipe?'connected_recipe':'unresolved';
  row.topics[topic]={status,answer_status:answer.status};
  report.topic_counts[topic]??={connected_facet:0,basic_summary:0,connected_recipe:0,unresolved:0};
  report.topic_counts[topic][status]++;
  if(expected.has(topic)) {
   report.expected_facet_questions++;
   if(!detailed)report.expected_facet_failures.push({id:r.minecraft_id,topic,question:q,actual:answer});
  }
 }
 report.subjects[r.minecraft_id]=row;
}
fs.writeFileSync(new URL('docs/BLOCK_QUESTION_AUDIT.json',root),JSON.stringify(report,null,2)+'\n');
console.log(`Block catalog audit: ${report.catalog_blocks} blocks; ${report.questions} question paths; ${report.detailed_subjects} with detailed facets; ${report.definition_only_subjects} without; ${report.expected_facet_failures.length} reviewed-facet routing failures.`);
if(report.expected_facet_failures.length){console.error(JSON.stringify(report.expected_facet_failures.slice(0,12),null,2));process.exitCode=1;}
