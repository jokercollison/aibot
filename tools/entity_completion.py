"""Track the agreed finite entity phase separately from exhaustive wiki completeness."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def compile_report(catalog,runtime):
 scope=json.loads((ROOT/'data/entities/completion_scope.json').read_text())
 excluded={(row['subject'],row['topic']):row['reason'] for row in scope['excluded_topic_slots']}
 subjects={};blockers=[]
 for id,record in catalog.items():
  required=list(dict.fromkeys((scope['mob_topics']+scope['mob_special_topics'][id]) if record['category']=='mob' else scope['non_mob_topics'][id]))
  states={}
  for topic in required:
   fact=runtime[id]['topics'].get(topic)
   if (id,topic) in excluded:states[topic]='excluded_command_only_timer'
   elif fact and fact['answer'].strip() and fact.get('sources') and fact['coverage']!='partial_summary':states[topic]=fact['coverage']
   else:
    states[topic]='unresolved';blockers.append({'subject':id,'topic':topic})
  subjects[id]={'name':record['name'],'category':record['category'],'normal_scope_review_complete':all(v!='unresolved' for v in states.values()),'required_topics':states,'full_wiki_complete':False}
 trades=json.loads((ROOT/'data/entities/trade_inventory.json').read_text())
 trade_ready=len(trades)==14 and sum(len(levels) for levels in trades.values())==66 and all(f.get('answer') and f.get('sources') for levels in trades.values() for f in levels.values())
 if not trade_ready:blockers.append({'subject':'villager_and_wandering_trader','topic':'trade_inventory'})
 return {'trade_inventory':{'villager_professions':13,'wandering_trader_profiles':1,'inventory_summaries':sum(len(levels) for levels in trades.values()),'ready':trade_ready},'scope':scope['milestone'],'target_game_version':scope['target_game_version'],'catalog_entities':len(catalog),'mobs':sum(r['category']=='mob' for r in catalog.values()),'non_mobs':sum(r['category']!='mob' for r in catalog.values()),'normal_scope_review_complete':not blockers,'full_wiki_complete':False,'blockers':blockers,'excluded_topic_slots':scope['excluded_topic_slots'],'narrow_unknowns':scope['narrow_unknowns'],'scope_limits':scope['scope_limits'],'subjects':subjects}
