"""Catalog-wide topic audit. Presence and reviewed summaries never imply completeness."""
from collections import Counter
MOB_TOPICS=['identity','spawning','spawn_conditions','health','diet','taming','breeding','growth','drops','experience','variants','interactions','attack_style','provocation','counterplay','lifetime','relocation']
OBJECT_TOPICS=['identity','spawning','availability','interactions','drops','health']
def compile_audit(catalog,runtime):
 subjects={};counts={}
 for key,subject in sorted(catalog.items()):
  row=runtime[key];topics={}
  for topic in MOB_TOPICS if subject['category']=='mob' else OBJECT_TOPICS:
   fact=row['topics'].get(topic)
   status=fact['coverage'] if fact else 'pending_review'
   if topic=='diet' and not fact and row.get('feeding',{}).get('roles'):
    status='scoped_sample_interactions'
   topics[topic]=status
   counts.setdefault(topic,Counter())[status]+=1
  subjects[key]={'name':subject['name'],'category':subject['category'],'core_topics':topics,
    'other_connected_topics':sorted(set(row['topics'])-set(topics)),
    'pending_core_topics':[t for t,state in topics.items() if state=='pending_review'],
    'complete':False}
 return {'scope':'Every pinned Bedrock catalog entity; additional wiki reference subjects are excluded from this denominator.',
   'catalog_entities':len(catalog),'mobs':sum(r['category']=='mob' for r in catalog.values()),
   'other_entities':sum(r['category']!='mob' for r in catalog.values()),
   'completion_rule':'Reviewed summaries are partial. Basic identity, component facts and missing topics remain distinct. A pending topic may need a sourced not-applicable answer; absence is never proof of impossibility.',
   'topic_counts':{t:dict(sorted(c.items())) for t,c in sorted(counts.items())},
   'subjects':subjects,'complete':False}
