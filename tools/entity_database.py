"""Compile curated entity topics with revision provenance; never infer missing facts."""
import json
from entity_topics import feeding, health, sample_url
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def build():
 evidence=json.loads((ROOT/'data/entities/subjects.json').read_text())['subjects']
 editorial=json.loads((ROOT/'data/entities/editorial.json').read_text())['subjects']
 samples=json.loads((ROOT/'data/entities/sample_evidence.json').read_text())
 runtime={};audit={};conflicts=[]
 for key,subject in evidence.items():
  row=editorial.get(key,{'topics':{},'variants':[]})
  topics={}
  for name,fact in row['topics'].items():
   assert fact['answer'].strip(),(key,name)
   topics[name]={'answer':fact['answer'],'sources':[subject['wiki']['url']], 'coverage':fact['coverage']}
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
  runtime[key]={'topics':topics,'feeding':food,'variants':row.get('variants',[])}
  audit[key]={'name':subject['name'],'category':subject['category'],'source':subject['wiki']['url'],'topics':{name:(topics[name]['coverage'] if name in topics else 'pending_review') for name in subject['topics']},'complete':False}
 assert not set(editorial)-set(evidence)
 (ROOT/'data/entities/runtime.json').write_text(json.dumps(runtime,indent=2,ensure_ascii=False)+'\n')
 report={'scope':'Catalog entities; wiki-only candidates require availability reconciliation. Summaries are not exhaustive topic coverage.','entities':len(runtime),'entities_with_curated_topics':sum(bool(r['topics']) for r in runtime.values()),'curated_topic_summaries':sum(sum(t['coverage']=='reviewed_summary' for t in r['topics'].values()) for r in runtime.values()),'component_topic_summaries':sum(sum(t['coverage']!='reviewed_summary' for t in r['topics'].values()) for r in runtime.values()),'complete':False,'source_conflicts':conflicts,'subjects':audit}
 (ROOT/'docs/ENTITY_KNOWLEDGE_COVERAGE.json').write_text(json.dumps(report,indent=2)+'\n')
 print(f"Entity database: {report['entities']} subjects, {report['curated_topic_summaries']} curated topic summaries; completeness remains pending")
if __name__=='__main__':build()
