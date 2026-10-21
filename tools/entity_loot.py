"""Compile every pinned entity death-loot branch without flattening its conditions.
Refresh evidence from the local pinned samples only; ordinary compile is offline
and uses the committed graph. Unsupported rules remain explicit audit gaps.
"""
from pathlib import Path
import argparse,collections,hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]
CONDITIONS={'killed_by_player','killed_by_player_or_pets','killed_by_entity','damaged_by_entity','passenger_of_entity','is_baby','entity_properties','bool_property','random_chance_with_looting','random_chance','random_difficulty_chance'}
FUNCTIONS={'set_count','looting_enchant','furnace_smelt','set_data','minecraft:set_potion','set_ominous_bottle_amplifier','minecraft:set_data_from_color_index','minecraft:set_count','enchant_with_levels','enchant_random_gear','set_damage'}
def norm(name):return name if name.endswith('.json') else name+'.json'
def read_jsonc(path):
 text=path.read_text(encoding='utf-8-sig');text=re.sub(r'("(?:\\.|[^"\\])*"|//[^\n]*|/\*[\s\S]*?\*/)',lambda m:m[0] if m[0].startswith('"') else '',text)
 return json.loads(text)
def walk(value):
 yield value
 if isinstance(value,dict):
  for child in value.values():yield from walk(child)
 elif isinstance(value,list):
  for child in value:yield from walk(child)
def refresh(samples):
 profiles=json.loads((ROOT/'data/entities/sample_evidence.json').read_text());tables={};queue=[]
 for profile in profiles['subjects'].values():
  queue.extend(profile['loot_tables'])
  for node in walk(profile['scopes']):
   if isinstance(node,dict) and isinstance(node.get('table'),str) and node['table'].startswith('loot_tables/'):queue.append(node['table'])
 missing=[]
 while queue:
  name=norm(queue.pop())
  if name in tables or name in missing:continue
  path=samples/'behavior_pack'/name
  if not path.exists():missing.append(name);continue
  data=read_jsonc(path);tables[name]={'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'data':data}
  for node in walk(data):
   if isinstance(node,dict) and node.get('type')=='loot_table':queue.append(norm(node['name']))
 out={'tag':profiles['tag'],'commit':profiles['commit'],'tables':dict(sorted(tables.items())),'missing':sorted(missing)}
 (ROOT/'data/entities/loot_evidence.json').write_text(json.dumps(out,indent=2)+'\n')
 print(f'Preserved {len(tables)} linked loot/interaction tables; {len(missing)} unresolved references.')
def compile():
 evidence=json.loads((ROOT/'data/entities/loot_evidence.json').read_text());profiles=json.loads((ROOT/'data/entities/sample_evidence.json').read_text())
 tables={name:r['data'] for name,r in evidence['tables'].items()};entities={};gaps=[];counts=collections.Counter();functions=collections.Counter();entries=collections.Counter()
 for name,table in tables.items():
  for node in walk(table):
   if not isinstance(node,dict):continue
   for field,allowed,counter in [('condition',CONDITIONS,counts),('function',FUNCTIONS,functions)]:
    if field in node:
     counter[node[field]]+=1
     if node[field] not in allowed:gaps.append({'table':name,'kind':field,'value':node[field]})
   if 'type' in node:
    entries[node['type']]+=1
    if node['type'] not in {'item','empty','loot_table'}:gaps.append({'table':name,'kind':'entry','value':node['type']})
   if node.get('condition')=='entity_properties' and (node.get('entity')!='this' or set(node.get('properties',{}))-{'on_fire'}):gaps.append({'table':name,'kind':'property_filter','value':node})
   if node.get('condition')=='bool_property' and node.get('domain')!='minecraft:has_flower':gaps.append({'table':name,'kind':'unparsed_property_context','value':node})
 for key,profile in profiles['subjects'].items():
  links=[{'scope':scope,'table':norm(body['minecraft:loot']['table'])} for scope,body in profile['scopes'].items() if 'minecraft:loot' in body]
  entities[key]={'tables':links,'coverage':'conditional_table_graph' if links else 'no_component_table_not_evidence_of_no_drops','source':'https://github.com/Mojang/bedrock-samples/blob/'+profiles['commit']+'/'+profile['source']}
 # Disagreement is recorded, not silently resolved by an engine-table import.
 withheld=[{'subject':'minecraft:creeper','killer':'minecraft:parched','topic':'drops','reason':'Pinned table includes parched as a disc killer; reviewed archived creeper article lists skeleton, stray and bogged. Specific answer withheld pending version review.'}]
 output={'schema_version':1,'entities':entities,'tables':tables,'withheld':withheld}
 (ROOT/'data/entities/loot_runtime.json').write_text(json.dumps(output,indent=2)+'\n')
 report={'sample_entities':len(entities),'entities_with_death_tables':sum(bool(e['tables']) for e in entities.values()),'preserved_tables':len(tables),'pools':sum(len(t.get('pools',[])) for t in tables.values()),'entry_types':dict(entries),'condition_types':dict(counts),'function_types':dict(functions),'missing_table_references':evidence['missing'],'unsupported_or_unparsed_rules':gaps,'withheld_source_conflicts':withheld,'complete_gameplay_knowledge':False,'limits':['Table selection follows component scope; unspecified state remains conditional.','Dynamic equipment, experience, special engine drops and harvesting are separate mechanics.','Random functions and weighted pools retain possible outcomes; no guarantees inferred from a union.','Fishing luck/enchantments and unsupported functions are not evaluated as exact probabilities.']}
 (ROOT/'docs/ENTITY_LOOT_COVERAGE.json').write_text(json.dumps(report,indent=2)+'\n')
 print('Entity loot graph:',report['entities_with_death_tables'],'entities,',len(tables),'tables,',report['pools'],'pools;',len(gaps),'explicit interpretation gaps.')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--refresh-samples',type=Path);a=p.parse_args()
 if a.refresh_samples:refresh(a.refresh_samples)
 compile()
