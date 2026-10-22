// Exercise the real conversation engine, not just the data inventory.
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {createConversation} from '../src/knowledge.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../data/entities/subjects.json',import.meta.url))).subjects;
const runtime=JSON.parse(fs.readFileSync(new URL('../data/entities/runtime.json',import.meta.url)));
export const questions={
 identity:id=>`What is entity:${id}?`,
 spawning:id=>`Where can I find entity:${id}?`,
 spawn_conditions:id=>`What conditions does entity:${id} need to spawn?`,
 health:id=>`How much health does entity:${id} have?`,
 breeding:id=>`How can you breed entity:${id}?`,
 taming:id=>`How can you tame entity:${id}?`,
 variants:id=>`What variants does entity:${id} have?`,
 drops:id=>`What does entity:${id} drop?`,
 experience:id=>`How much XP does entity:${id} drop?`,
 growth:id=>`How long does baby entity:${id} take to grow?`,
 lifetime:id=>`Does entity:${id} despawn?`,
 relocation:id=>`How can you move entity:${id}?`,
 attack_style:id=>`How does entity:${id} attack?`,
 provocation:id=>`Why is entity:${id} attacking me?`,
 counterplay:id=>`How can you defeat entity:${id}?`,
 diet:id=>`What does entity:${id} eat?`,
 interactions:id=>`How do I interact with entity:${id}?`,
 leashing:id=>`Can I leash entity:${id}?`,
 bucketing:id=>`Can I bucket entity:${id}?`,
 transport:id=>`Can I ride entity:${id}?`,
 trading:id=>`Can I trade with entity:${id}?`,
 milking:id=>`Can I milk entity:${id}?`,
 smite:id=>`Does Smite work against entity:${id}?`,
 bane_of_arthropods:id=>`Does Bane of Arthropods work against entity:${id}?`,
 impaling:id=>`Does Impaling work against entity:${id}?`,
 poison_reaction:id=>`Can I poison entity:${id}?`,
 regeneration_reaction:id=>`Does Regeneration work on entity:${id}?`,
 healing_magic:id=>`Does a Healing potion affect entity:${id}?`,
 harming_magic:id=>`Does a Harming potion affect entity:${id}?`,
 healing:id=>`How do I heal entity:${id}?`,
 naming:id=>`How do I name entity:${id}?`
};
export function runAudit() {
 const report={scope:'90 catalog mobs x 31 representative normal-gameplay questions x explicit-ID and natural-name forms through the real conversation engine. Plus 112 reviewed mechanics across all 39 non-mob catalog entities, the final special-mechanic summaries, and trade inventories. This is not every wording, complete factual validation, or Minecraft execution.',questions:0,answered:0,partial:0,unsupported:0,failures:[],subjects:{},objects:{}};
 for(const [id,subject] of Object.entries(catalog).filter(([,r])=>r.category==='mob')) {
  const outcomes={};
  for(const [topic,buildQuestion] of Object.entries(questions)) {
   const question=buildQuestion(id),answer=createConversation().ask(question);
   const expected=runtime[id].topics[topic];
   let outcome;
   if(!expected)outcome=answer.status==='unknown'?'unsupported':'failure';
   else if(answer.status==='unknown'||answer.subject!==id||!(answer.topic===topic||topic==='healing'&&answer.topic==='repair')||!answer.answer?.trim()||!answer.sources?.length)outcome='failure';
   else outcome=expected.coverage==='partial_summary'?'partial':'answered';
   outcomes[topic]=outcome;report.questions++;
   if(outcome==='failure')report.failures.push({id,topic,question,actual:answer});
   else report[outcome]++;
  }
  const naturalOutcomes={};
  const name=subject.wiki.title.toLowerCase()+' mob';
  const canonical=id.endsWith('_v2')?id.slice(0,-3):id;
  for(const [topic,buildQuestion] of Object.entries(questions)) {
   const question=buildQuestion(name).replace('entity:',''),answer=createConversation().ask(question);
   const expected=runtime[id].topics[topic];
   let outcome;
   if(!expected)outcome=answer.status==='unknown'?'unsupported':'failure';
   else if(answer.status==='unknown'||![id,canonical].includes(answer.subject)||!(answer.topic===topic||topic==='healing'&&answer.topic==='repair')||!answer.answer?.trim()||!answer.sources?.length)outcome='failure';
   else outcome=expected.coverage==='partial_summary'?'partial':'answered';
   naturalOutcomes[topic]=outcome;report.questions++;
   if(outcome==='failure')report.failures.push({id,topic,question,actual:answer});
   else report[outcome]++;
  }
  report.subjects[id]={name:subject.name,outcomes,natural_outcomes:naturalOutcomes};
 }
 const objects=JSON.parse(fs.readFileSync(new URL('../data/entities/object_editorial.json',import.meta.url))).subjects;
 const objectQuestions={storage:'How much inventory storage does SUBJECT have?',propulsion:'How do I steer SUBJECT?',retrieval:'How do I retrieve SUBJECT?',projectile_use:'How do I throw SUBJECT?',projectile_effects:'What happens to SUBJECT on impact?',posing:'How do I change SUBJECT poses?',activation:'How do I activate SUBJECT?',availability:'Is SUBJECT available in Survival?',equipment:'What equipment can SUBJECT use?',interactions:'How do I interact with SUBJECT?',transport:'Can I ride SUBJECT?',experience:'How much XP does SUBJECT give?'};
 for(const [id,row] of Object.entries(objects)) {
  const outcomes={};
  for(const [topic,fact] of Object.entries(row.topics)) {
   const question=objectQuestions[topic].replace('SUBJECT','entity:'+id),answer=createConversation().ask(question);
   const outcome=answer.subject===id&&answer.topic===topic&&answer.answer===fact.answer&&answer.sources?.length?'answered':'failure';
   outcomes[topic]=outcome;report.questions++;
   if(outcome==='failure')report.failures.push({id,topic,question,actual:answer});else report.answered++;
  }
  report.objects[id]={outcomes};
 }
 const finish=JSON.parse(fs.readFileSync(new URL('../data/entities/finish_editorial.json',import.meta.url)));
 const specialPrompts={nesting:'How often does SUBJECT lay an egg?',housing:'How many SUBJECT fit in a hive?',item_holding:'How does SUBJECT hold blocks?',support:'Why does SUBJECT cause Mining Fatigue?',naming:'How do I name SUBJECT?',infestation:'How does SUBJECT infest blocks?',caravan:'How does SUBJECT form a caravan?',breeding_conditions:'Why can SUBJECT not breed?',infection:'What is the chance SUBJECT infects a villager?',curing:'How do I cure SUBJECT?'};
 report.special_questions=0;report.trade_questions=0;
 for(const [id,row] of Object.entries(finish.special_topics))for(const [topic,fact] of Object.entries(row)) {
  const question=specialPrompts[topic].replace('SUBJECT','entity:'+id),answer=createConversation().ask(question);
  report.questions++;report.special_questions++;
  if(answer.subject===id&&answer.topic===topic&&answer.answer===fact.answer)report.answered++;
  else report.failures.push({id,topic,question,actual:answer});
 }
 const trades=JSON.parse(fs.readFileSync(new URL('../data/entities/trade_inventory.json',import.meta.url)));
 for(const [profession,levels] of Object.entries(trades))for(const [level,fact] of Object.entries(levels)) {
  const id=profession==='wandering trader'?'minecraft:wandering_trader':'minecraft:villager';
  const question=profession==='wandering trader'?'What does a wandering trader sell?':`What does a ${level} ${profession} sell?`;
  const answer=createConversation().ask(question);report.questions++;report.trade_questions++;
  if(answer.subject===id&&answer.topic==='trading'&&answer.answer===fact.answer)report.answered++;
  else report.failures.push({id,topic:'trading',question,actual:answer});
 }
 report.catalog_entities=Object.keys(report.subjects).length+Object.keys(report.objects).length;
 return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
 const report=runAudit();
 fs.writeFileSync(new URL('../docs/ENTITY_QUESTION_AUDIT.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 console.log(`Entity question audit: ${report.questions} questions; ${report.answered} answered, ${report.partial} partial, ${report.unsupported} explicitly unsupported, ${report.failures.length} failures.`);
 if(report.failures.length){console.log(JSON.stringify(report.failures,null,2));process.exitCode=1;}
}
