"""Compile curated entity topics with revision provenance; never infer missing facts."""
import json
from entity_topics import feeding, health, sample_url
from entity_environment import compile as compile_environment
from entity_spawning import compile as compile_spawning
from entity_audit import compile_audit
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def build():
 compile_environment()
 compile_spawning()
 evidence=json.loads((ROOT/'data/entities/subjects.json').read_text())['subjects']
 catalog_entities=len(evidence)
 references=json.loads((ROOT/'data/entities/reference_editorial.json').read_text())['subjects']
 evidence.update({k:{**r,'topics':{name:[] for name in next(iter(evidence.values()))['topics']}} for k,r in references.items()})
 editorial=json.loads((ROOT/'data/entities/editorial.json').read_text())['subjects']
 samples=json.loads((ROOT/'data/entities/sample_evidence.json').read_text())
 descriptions=json.loads((ROOT/'data/descriptions/entities.json').read_text())
 behaviors=json.loads((ROOT/'data/entities/behavior_evidence.json').read_text())
 variant_data=json.loads((ROOT/'data/entities/variant_editorial.json').read_text())['subjects']
 interaction_source=json.loads((ROOT/'data/entities/interaction_editorial.json').read_text())
 interaction_data=interaction_source['subjects']
 core_data=json.loads((ROOT/'data/entities/core_editorial.json').read_text())
 diet_data=json.loads((ROOT/'data/entities/diet_editorial.json').read_text())
 growth_data=json.loads((ROOT/'data/entities/growth_editorial.json').read_text())
 condition_data=json.loads((ROOT/'data/entities/condition_editorial.json').read_text())
 object_data=json.loads((ROOT/'data/entities/object_editorial.json').read_text())
 movement_data=json.loads((ROOT/'data/entities/movement_editorial.json').read_text())
 combat_data=json.loads((ROOT/'data/entities/combat_editorial.json').read_text())
 reward_data=json.loads((ROOT/'data/entities/reward_editorial.json').read_text())
 special_data=json.loads((ROOT/'data/entities/special_editorial.json').read_text())['subjects']
 spawn_data=json.loads((ROOT/'data/entities/spawn_editorial.json').read_text())['subjects']
 environment_data=json.loads((ROOT/'data/entities/environment_components.json').read_text())
 runtime={};audit={};conflicts=[]
 for key,subject in evidence.items():
  row=editorial.get(key,{'topics':{},'variants':[]})
  if key in references:row={'topics':references[key]['topics'],'variants':[]}
  canonical='minecraft:villager' if key=='minecraft:villager_v2' else key
  variants=variant_data.get(canonical,{})
  reviewed={**row['topics'],**variants.get('topics',{}),**interaction_data.get(key,{}).get('topics',{}),**spawn_data.get(key,{}).get('topics',{}),**special_data.get(key,{}).get('topics',{}),**reward_data['subjects'].get(key,{}).get('topics',{}),**combat_data['subjects'].get(key,{}).get('topics',{}),**movement_data['subjects'].get(key,{}).get('topics',{}),**object_data['subjects'].get(key,{}).get('topics',{}),**condition_data['subjects'].get(key,{}).get('topics',{}),**growth_data['subjects'].get(key,{}).get('topics',{}),**diet_data['subjects'].get(key,{}).get('topics',{}),**core_data['subjects'].get(key,{}).get('topics',{})}
  topics={}
  for name,fact in reviewed.items():
   assert fact['answer'].strip(),(key,name)
   topics[name]={'answer':fact['answer'],'sources':fact.get('reference_urls',fact.get('sources',[subject['wiki']['url']])), 'coverage':fact['coverage']}
  description=descriptions.get('entity:'+key)
  if description:
   basic={'answer':description['what']+' '+description['does'],'sources':[subject['wiki']['url']],'coverage':'editorial_basic_summary'}
   topics.setdefault('identity',basic);topics.setdefault('behavior',basic)
  behavior=behaviors.get(key)
  if behavior and 'combat' not in topics and len(behavior['classifications'])==1:
   kind=behavior['classifications'][0]
   answer={'passive':'It does not normally attack players.','neutral':'It can attack under particular conditions, so do not assume it is always harmless.','hostile':'It is a hostile mob and can attack players.'}[kind]
   topics['combat']={'answer':answer+' '+description['does'] if description else answer,'coverage':'basic_behavior_classification','sources':[behavior['source']]}
  sample=samples['subjects'].get(key)
  food={'roles':{},'hazards':[]}
  if sample:
   url=sample_url(samples,sample)
   derived=health(sample,key)
   if derived and 'health' not in topics:topics['health']={**derived,'sources':[url]}
   food=feeding(sample);food['sources']=[url]
   if key=='minecraft:bee':
    food['withheld']=[{'id':'minecraft:wither_rose','name':'wither rose','answer':"I'm not sure whether wither roses are suitable for bees. Use a flower such as a dandelion or poppy instead."}]
    for role,entries in food['roles'].items():
     food['roles'][role]=[i for i in entries if i['id']!='minecraft:wither_rose']
    conflicts.append({'subject':key,'topic':'diet','item':'minecraft:wither_rose','status':'withheld_source_conflict','detail':'Pinned breed/growth component includes wither rose; archived wiki warns against its use. Not offered as food.'})
   if food['roles'] or food['hazards']:topics.setdefault('diet',{'answer':'Food has different uses for breeding, taming, healing and growth.','coverage':'scoped_sample_interactions','sources':[url]})
  for name,fact in environment_data.get(key,{}).get('topics',{}).items():topics.setdefault(name,fact)
  compiled_variants={v['name']:v for v in row.get('variants',[])}
  compiled_variants.update({v['name']:v for v in variants.get('variants',[])})
  for v in compiled_variants.values():
   v['topics']={name:{**fact,'sources':fact.get('sources',fact.get('reference_urls',[subject['wiki']['url']]))} for name,fact in v['topics'].items()}
  runtime[key]={'topics':topics,'feeding':food,'variants':list(compiled_variants.values())}
  for field in ['diet_cases','prey_cases']:
   if diet_data['subjects'].get(key,{}).get(field):runtime[key][field]=diet_data['subjects'][key][field]
  if key in object_data['subjects']:runtime[key]['object_aliases']=object_data['subjects'][key].get('query_aliases',[])
  if subject['category']=='mob' and not key.endswith('_v2') and subject['wiki']['title'].lower()!=subject['name'].lower():runtime[key]['subject_aliases']=[subject['wiki']['title']]
  if key!=canonical:runtime[key]['variant_alias_owner']=canonical
  if key=='minecraft:mooshroom':runtime[key]['flower_effects']=interaction_source['mooshroom_flowers']
  if key in references:runtime[key]['reference']={k:references[key][k] for k in ['id','name','what','does','aliases']}
  audit[key]={'name':subject['name'],'category':subject['category'],'source':subject['wiki']['url'],'topics':{name:(topics[name]['coverage'] if name in topics else 'pending_review') for name in sorted(set(subject['topics'])|set(topics))},'complete':False}
 assert not set(editorial)-set(evidence)
 (ROOT/'data/entities/runtime.json').write_text(json.dumps(runtime,indent=2,ensure_ascii=False)+'\n')
 report={'scope':'Catalog entities; wiki-only candidates require availability reconciliation. Summaries are not exhaustive topic coverage.','entities':len(runtime),'catalog_entities':catalog_entities,'additional_reference_subjects':len(references),'entities_with_curated_topics':sum(bool(r['topics']) for r in runtime.values()),'curated_topic_summaries':sum(sum(t['coverage']=='reviewed_summary' for t in r['topics'].values()) for r in runtime.values()),'component_topic_summaries':sum(sum(t['coverage'] in ['sample_component_summary','scoped_sample_interactions','explicit_sample_environment'] for t in r['topics'].values()) for r in runtime.values()),'basic_topic_summaries':sum(sum(t['coverage'] in ['editorial_basic_summary','basic_behavior_classification'] for t in r['topics'].values()) for r in runtime.values()),'named_variant_records':sum(len(r['variants']) for k,r in runtime.items() if not r.get('variant_alias_owner')),'variant_topic_summaries':sum(sum(len(v['topics']) for v in r['variants']) for r in runtime.values() if not r.get('variant_alias_owner')),'complete':False,'source_conflicts':conflicts,'subjects':audit}
 interaction_audit={'scope':'Reviewed special interaction batch; topic absence is pending review, not proof an action is impossible.','subjects_in_batch':len(special_data),'batch_topic_summaries':sum(len(r['topics']) for r in special_data.values()),'complete':False,'subjects':{key:{'name':subject['name'],'reviewed_batch_topics':sorted(special_data.get(key,{}).get('topics',{})),'complete':False} for key,subject in evidence.items() if subject['category']=='mob'}}
 (ROOT/'docs/ENTITY_INTERACTION_COVERAGE.json').write_text(json.dumps(interaction_audit,indent=2)+'\n')
 reward_audit={'scope':reward_data['scope'],'subjects_in_batch':len(reward_data['subjects']),'reviewed_topic_summaries':sum(len(r['topics']) for r in reward_data['subjects'].values()),'conflicts':reward_data['conflicts'],'complete':False,'subjects':{key:{'topics':sorted(row['topics']),'complete':False} for key,row in reward_data['subjects'].items()}}
 (ROOT/'docs/ENTITY_REWARD_COVERAGE.json').write_text(json.dumps(reward_audit,indent=2)+'\n')
 combat_topics=['attack_style','provocation','counterplay']
 mob_rows={key:runtime[key] for key,row in evidence.items() if row['category']=='mob'}
 combat_audit={'scope':'Current catalog mob combat coverage, including the broad core layer; summaries remain partial.','reviewed_subjects':sum(all(r['topics'].get(t,{}).get('coverage')=='reviewed_summary' for t in combat_topics) for r in mob_rows.values()),'reviewed_topic_summaries':sum(r['topics'].get(t,{}).get('coverage')=='reviewed_summary' for r in mob_rows.values() for t in combat_topics),'complete':False,'subjects':{key:{'topics':{topic:r['topics'].get(topic,{}).get('coverage','pending_detailed_review') for topic in combat_topics},'complete':False} for key,r in mob_rows.items()}}
 (ROOT/'docs/ENTITY_COMBAT_COVERAGE.json').write_text(json.dumps(combat_audit,indent=2)+'\n')
 movement_topics=['lifetime','relocation','teleportation']
 movement_audit={'scope':'Current catalog mob persistence, relocation and teleportation coverage, including the broad core layer; summaries remain partial.','reviewed_subjects':sum(any(r['topics'].get(t,{}).get('coverage')=='reviewed_summary' for t in movement_topics) for r in mob_rows.values()),'reviewed_topic_summaries':sum(r['topics'].get(t,{}).get('coverage')=='reviewed_summary' for r in mob_rows.values() for t in movement_topics),'complete':False,'subjects':{key:{'topics':{topic:r['topics'].get(topic,{}).get('coverage','pending_review') for topic in movement_topics},'complete':False} for key,r in mob_rows.items()}}
 (ROOT/'docs/ENTITY_MOVEMENT_COVERAGE.json').write_text(json.dumps(movement_audit,indent=2)+'\n')
 object_audit={'scope':object_data['scope'],'catalog_non_mobs':sum(s['category']!='mob' for s in json.loads((ROOT/'data/entities/subjects.json').read_text())['subjects'].values()),'reviewed_subjects':len(object_data['subjects']),'reviewed_topic_summaries':sum(len(r['topics']) for r in object_data['subjects'].values()),'complete':False,'subjects':{key:{'topics':sorted(row['topics']),'complete':False} for key,row in object_data['subjects'].items()}}
 (ROOT/'docs/ENTITY_OBJECT_COVERAGE.json').write_text(json.dumps(object_audit,indent=2)+'\n')
 condition_audit={'scope':condition_data['scope'],'reviewed_subjects':len(condition_data['subjects']),'reviewed_topic_summaries':sum(len(r['topics']) for r in condition_data['subjects'].values()),'complete':False,'subjects':{key:{'topics':sorted(row['topics']),'complete':False} for key,row in condition_data['subjects'].items()}}
 (ROOT/'docs/ENTITY_CONDITION_COVERAGE.json').write_text(json.dumps(condition_audit,indent=2)+'\n')
 (ROOT/'docs/ENTITY_CORE_TOPIC_AUDIT.json').write_text(json.dumps(compile_audit(json.loads((ROOT/'data/entities/subjects.json').read_text())['subjects'],runtime),indent=2)+'\n')
 (ROOT/'docs/ENTITY_KNOWLEDGE_COVERAGE.json').write_text(json.dumps(report,indent=2)+'\n')
 print(f"Entity database: {report['entities']} subjects, {report['curated_topic_summaries']} curated topic summaries; completeness remains pending")
if __name__=='__main__':build()
