"""Track gameplay topic completeness for every catalog subject, not definition counts."""
from pathlib import Path
import json,collections,re
ROOT=Path(__file__).resolve().parents[1]
def load(name):return json.loads((ROOT/name).read_text())
records=load('data/catalog.json')['records'];descriptions=load('data/description_catalog.json');recipes=load('data/recipe_index.json')['by_output'];loot=load('legacy/database/structured/v65/loot_sources_by_item.json');spawn=load('legacy/database/structured/v66/spawn_evidence_compact.json');locations=load('data/location_facts.json');facts=load('data/facts.json');entity_topics=load('data/entity_knowledge.json');acquisition=load('data/acquisition_index.json');current_entities=load('data/entities/runtime.json');current_entities=load('data/entities/runtime.json')
block_rules=[rule for path in (ROOT/'data/blocks').glob('*.json') for rule in json.loads(path.read_text()).get('rules',[])]
block_terrain=load('data/blocks/terrain.json')['subjects']
block_supplemental=load('data/blocks/supplemental.json')['subjects']
location_ids={id for key,row in locations.items() for id in [key]+row.get('related_ids',[])}
topics={
 'block':['identity','uses','recipe_or_acquisition','location','biomes','mining_tool','drops','properties','redstone'],
 'item':['identity','uses','recipe_or_acquisition','location','biomes','equipment_properties','special_interactions'],
 'biome':['identity','location','terrain','climate','blocks','mobs','structures','resources'],
 'entity':['identity','behavior','spawn_conditions','biomes','health','attacks','drops','diet','taming','breeding','environmental_reactions','construction_or_summoning']}
result={};counts=collections.Counter()
for id,r in records.items():
 kind=r['kind']
 if kind not in topics:continue
 row={topic:{'status':'unresolved','answer_connected':False} for topic in topics[kind]}
 if id in descriptions:
  row['identity']={'status':'editorial_basic_summary','answer_connected':True}
  if kind in ('block','item','entity'):row['uses' if kind!='entity' else 'behavior']={'status':'editorial_basic_summary','answer_connected':True}
 name=r['minecraft_id']
 if kind in ('block','item'):
  if name.lower() in recipes:row['recipe_or_acquisition']={'status':'sample_recipe_indexed','answer_connected':True}
  elif name in loot:row['recipe_or_acquisition']={'status':'conditional_loot_category_answer','answer_connected':True}
 if name in location_ids:row['location']={'status':'live_article_reviewed_not_in_game_verified','answer_connected':True}
 if kind=='block':
  matched=next((rule for rule in block_rules if re.fullmatch(rule['pattern'],name.split(':',1)[1])),None)
  detail={**block_supplemental.get(name,{}).get('topics',{}),**(matched or {}).get('topics',{}),**block_terrain.get(name,{}).get('topics',{})}
  mapping={'mining':['mining_tool','drops'],'operation':['uses'],'location':['location'],'redstone':['redstone']}
  for facet,public_topics in mapping.items():
   if facet in detail:
    for topic in public_topics:row[topic]={'status':'reviewed_block_facet_summary','answer_connected':True,'exhaustive':False}
  for facet in ['growth','storage','water','fire','gravity','oxidation','stripping','danger']:
   row[facet]={'status':'reviewed_block_facet_summary' if facet in detail else 'unresolved','answer_connected':facet in detail,'exhaustive':False}
  if any(f in detail for f in ['water','fire','gravity']):row['properties']={'status':'reviewed_property_subset','answer_connected':True,'exhaustive':False}
 if kind=='entity':
  if name in spawn:row['spawn_conditions']={'status':'conditional_sample_evidence_not_yet_interpreted','answer_connected':False}
  if name in loot:row['drops']={'status':'conditional_source_evidence','answer_connected':False}
  for topic in ['health','taming','breeding']:
   if topic in entity_topics.get(name,{}).get('facts',{}):row[topic]={'status':'component_derived_with_state_caveats','answer_connected':True}
  if name in acquisition['entities']:row['drops']={'status':'conditional_loot_profile','answer_connected':True}
  if 'breed' in facts.get(name,{}):row['breeding']={'status':'conditional_fact','answer_connected':True}
  topic_map={'spawn_conditions':'spawning','attacks':'combat','environmental_reactions':'interactions','construction_or_summoning':'construction'}
  for public_topic in row:
   connected=current_entities.get(name,{}).get('topics',{}).get(topic_map.get(public_topic,public_topic))
   if connected:row[public_topic]={'status':connected['coverage'],'answer_connected':True,'exhaustive':False}
  if row.get('biomes',{}).get('answer_connected') is False and current_entities.get(name,{}).get('topics',{}).get('spawning'):
   row['biomes']={'status':'spawning_summary_partial_biome_guidance','answer_connected':True,'exhaustive':False}
  topic_map={'spawn_conditions':'spawning','attacks':'combat','environmental_reactions':'interactions','construction_or_summoning':'construction'}
  for public_topic in row:
   connected=current_entities.get(name,{}).get('topics',{}).get(topic_map.get(public_topic,public_topic))
   if connected:row[public_topic]={'status':connected['coverage'],'answer_connected':True,'exhaustive':False}
  if row.get('biomes',{}).get('answer_connected') is False and current_entities.get(name,{}).get('topics',{}).get('spawning'):
   row['biomes']={'status':'spawning_summary_partial_biome_guidance','answer_connected':True,'exhaustive':False}
 for topic,value in row.items():counts[topic+':'+value['status']]+=1
 result[id]={'kind':kind,'topics':row,'complete':False}
report={'purpose':'Full gameplay-topic coverage per subject. A basic description does not establish complete knowledge.','subject_count':len(result),'complete_subject_count':0,'reference_source':'Preserved offline wiki text databases; archive availability is distinct from runtime topic completeness','topic_counts':dict(counts),'subjects':result,'completion_rule':'Each topic needs source-backed connected answers or an explicit source-backed not-applicable result; missing data is never silently not-applicable.'}
(ROOT/'docs/GAMEPLAY_COVERAGE.json').write_text(json.dumps(report,indent=2)+'\n')
print('Full gameplay audit:',len(result),'subjects; zero claimed complete; missing topics tracked explicitly.')
