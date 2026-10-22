import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createConversation} from '../src/knowledge.js';
const read=p=>JSON.parse(fs.readFileSync(p));
const ask=q=>createConversation().ask(q);
test('finite normal-gameplay scope closes for every catalog entity without claiming full wiki completeness',()=>{
 const report=read('docs/ENTITY_COMPLETION_REPORT.json'),catalog=read('data/entities/subjects.json').subjects;
 assert.deepEqual(Object.keys(report.subjects).sort(),Object.keys(catalog).sort());
 assert.equal(report.catalog_entities,129);assert.equal(report.mobs,90);assert.equal(report.non_mobs,39);
 assert.equal(report.normal_scope_review_complete,true);assert.deepEqual(report.blockers,[]);
 assert.equal(report.full_wiki_complete,false);assert.equal(report.excluded_topic_slots.length,2);
 assert.equal(report.narrow_unknowns.length,8);assert.equal(report.trade_inventory.ready,true);assert.equal(report.trade_inventory.inventory_summaries,66);
 for(const row of Object.values(report.subjects)) {
  assert.equal(row.normal_scope_review_complete,true);assert.equal(row.full_wiki_complete,false);
  assert.ok(!Object.values(row.required_topics).includes('unresolved'));
 }
});
test('all 51 previously unsupported feeding profiles have scoped explanations, not invented breeding foods',()=>{
 const finish=read('data/entities/finish_editorial.json');assert.equal(Object.keys(finish.feeding_closeout).length,51);
 for(const [id,fact] of Object.entries(finish.feeding_closeout)) {
  const r=ask(`What does entity:${id} eat?`);assert.equal(r.subject,id);assert.equal(r.topic,'diet');assert.equal(r.answer,fact.answer);
 }
 assert.match(ask('Can I feed a creeper wheat?').answer,/no food for taming or breeding/);
 assert.match(ask('Can I feed an iron golem iron ingots?').answer,/repair 25 health/);
 assert.match(ask('What does a witch drink?').answer,/their own potions/);
 assert.match(ask('What do polar bears eat?').answer,/cannot be bred or tamed.*feeding does not speed/);
 assert.match(ask('What does a zombie villager eat?').answer,/Weakness.*normal golden apple/);
});
test('normal capabilities distinguish leads, buckets, riding, trades, milk and names',()=>{
 assert.match(ask('Can I leash a creeper?').answer,/cannot attach a normal lead/);
 assert.match(ask('Can I bucket a bat?').answer,/cannot capture/);
 assert.match(ask('Can I bucket a tadpole?').answer,/water bucket/i);
 assert.match(ask('Can I ride a cow?').answer,/not a normal player-ridable mount/);
 assert.match(ask('Can I ride a zombie nautilus?').answer,/pufferfish.*saddle/);
 assert.match(ask('Can I trade with a bat?').answer,/cannot open normal trades/);
 assert.match(ask('Can I milk a cow with a bucket?').answer,/adult cow.*milk/);
 assert.match(ask('Can I milk a witch with a bucket?').answer,/cannot milk a witch/);
 assert.match(ask('How do I name a creeper?').answer,/anvil.*renamed tag/);
 assert.match(ask('How do I name the ender dragon?').answer,/cannot rename.*ordinary name tag/);
});
test('Smite and Bane follow mob classes rather than their appearance',()=>{
 for(const mob of ['zombie','drowned','phantom','camel husk','zombie nautilus'])assert.match(ask(`Does Smite work against a ${mob}?`).answer,/Yes.*undead/);
 for(const mob of ['warden','piglin','creeper'])assert.match(ask(`Does Smite work against a ${mob}?`).answer,/No extra Smite damage/);
 for(const mob of ['bee','spider','cave spider','silverfish','endermite'])assert.match(ask(`Does Bane of Arthropods work against a ${mob}?`).answer,/Yes.*Slowness IV/);
 assert.match(ask('Does Bane of Arthropods work against a zombie?').answer,/does not add/);
 assert.match(ask('Does Impaling work against a zombie?').answer,/water or rain.*not limited to aquatic/);
});
test('potion rules retain undead reversal and important immunity exceptions',()=>{
 assert.match(ask('Does a Healing potion affect a zombie?').answer,/damages zombie.*undead/);
 assert.match(ask('Does a Harming potion affect a zombie?').answer,/heals zombie/);
 assert.match(ask('Does Regeneration work on a wither?').answer,/does not restore/);
 assert.match(ask('Can I poison a spider?').answer,/immune/);
 assert.match(ask('Can I poison a bee?').answer,/If Poison is successfully applied/);
 assert.match(ask('Can I poison a nautilus?').answer,/immune/);
 assert.match(ask('Can I poison a witch?').answer,/95% resistant.*rather than completely immune/);
 assert.match(ask('Does a Harming potion affect a witch?').answer,/95% resistant/);
 assert.match(ask('Does a Harming potion affect the ender dragon?').answer,/source is a player/);
 assert.match(ask('Does a Harming potion affect a creaking?').answer,/heart-linked.*immune/);
 assert.match(ask('Can I feed a wolf pufferfish?').answer,/For healing/);
 assert.match(ask('Can I feed a parrot cookies?').answer,/kill|lethal|fatal/i);
});
test('potion and enchantment follow-ups retain the mob while definitions stay definitions',()=>{
 const c=createConversation();c.ask('What is a zombie?');
 assert.equal(c.ask('Does Smite work on it?').subject,'minecraft:zombie');
 assert.equal(c.ask('what about Poison').topic,'poison_reaction');
 c.ask('What is a warden?');assert.match(c.ask('what about Smite').answer,/not undead/);
 assert.match(ask('What is Smite?').answer,/Increase damage to undead/);
 assert.equal(createConversation().ask('Does Smite work on it?').status,'unknown');
 assert.equal(ask('How does a witch attack with Poison?').topic,'attack_style');
 assert.equal(ask('Does an axolotl give me Regeneration?').topic,'support');
 assert.equal(ask('Does a pufferfish give you Poison?').topic,'attack_style');
 assert.equal(ask('Can a cow build a spaceship?').status,'unknown');
});
test('special mechanic questions reach the actual missing gameplay answers',()=>{
 assert.match(ask('How often does a chicken lay an egg?').answer,/5–10 minutes.*does not need another chicken/);
 assert.match(ask('How many bees fit in a hive?').answer,/three bees.*Silk Touch/);
 assert.match(ask('How do endermen hold blocks?').answer,/selected blocks.*mobGriefing/);
 assert.match(ask('Why does an elder guardian cause Mining Fatigue?').answer,/50 blocks.*five minutes/);
 assert.match(ask('How do I name a rabbit Toast?').answer,/Toast.*black-and-white/);
 assert.match(ask('How do I name a vindicator Johnny?').answer,/capital J.*does not tame/);
 assert.match(ask('How does a llama form a caravan?').answer,/nine nearby.*ten/);
 assert.match(ask('Why can a llama in a caravan not breed?').answer,/must not be part of a caravan/);
 assert.match(ask('What is the chance a zombie infects a villager?').answer,/Easy 0%.*Normal 50%.*Hard 100%/);
 assert.match(ask('How do I cure a witch?').answer,/cannot cure a witch back/);
 assert.match(ask('How do I respawn the ender dragon?').answer,/four End crystals/);
});
test('trade inventories cover 13 professions and a separate rotating wandering trader',()=>{
 const data=read('data/entities/trade_inventory.json'),audit=read('docs/ENTITY_TRADE_INVENTORY_AUDIT.json');
 assert.equal(audit.villager_professions,13);assert.equal(audit.wandering_trader_profiles,1);assert.equal(audit.tiers,66);
 assert.equal(Object.keys(data).length,14);
 assert.match(ask('What does a master armorer sell?').answer,/enchanted diamond chestplate.*enchanted diamond helmet/);
 assert.match(ask('What does a novice librarian sell?').answer,/enchanted book/);
 assert.match(ask('What does an apprentice cleric sell?').answer,/lapis lazuli/);
 assert.match(ask('What does a wandering trader sell?').answer,/milk bucket.*water bottle/);
 for(const levels of Object.values(data))for(const fact of Object.values(levels)) {
  assert.match(fact.answer,/may not offer every listed item/);assert.doesNotMatch(fact.answer,/undefined|muttonraw|minecraft:/);
 }
});
test('trade clarification accepts a short level and does not invent nitwit trades',()=>{
 const c=createConversation();assert.equal(c.ask('What does an armorer sell?').status,'clarify');
 assert.match(c.ask('master').answer,/diamond chestplate/);
 assert.match(c.ask('what about novice').answer,/iron boots|iron helmet|iron leggings/);
 assert.match(ask('What does a master nitwit sell?').answer,/cannot trade|does not trade|do not trade|no trades/i);
 assert.equal(createConversation().ask('master').status,'unknown');
});
test('trade extraction remains reproducible from its checked-in cache without external reference files',()=>{
 const output=execFileSync('python',['-c',"import sys;from pathlib import Path;sys.path.insert(0,'tools');from entity_trade_inventory import compile_inventory;compile_inventory(Path('/tmp/no-trade-reference-required'))"],{encoding:'utf8'});
 assert.match(output,/checked-in verified/);
});
