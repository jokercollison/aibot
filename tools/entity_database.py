"""Compile curated entity topics with revision provenance; never infer missing facts."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def build():
 evidence=json.loads((ROOT/'data/entities/subjects.json').read_text())['subjects']
 editorial=json.loads((ROOT/'data/entities/editorial.json').read_text())['subjects']
 runtime={};audit={}
 for key,subject in evidence.items():
  row=editorial.get(key,{'topics':{},'variants':[]})
  topics={}
  for name,fact in row['topics'].items():
   assert fact['answer'].strip(),(key,name)
   topics[name]={'answer':fact['answer'],'sources':[subject['wiki']['url']], 'coverage':fact['coverage']}
  runtime[key]={'topics':topics,'variants':row.get('variants',[])}
  audit[key]={'name':subject['name'],'category':subject['category'],'source':subject['wiki']['url'],'topics':{name:('reviewed_summary' if name in topics else 'pending_review') for name in subject['topics']},'complete':False}
 assert not set(editorial)-set(evidence)
 (ROOT/'data/entities/runtime.json').write_text(json.dumps(runtime,indent=2,ensure_ascii=False)+'\n')
 report={'scope':'Catalog entities; wiki-only candidates require availability reconciliation. Summaries are not exhaustive topic coverage.','entities':len(runtime),'entities_with_curated_topics':sum(bool(r['topics']) for r in runtime.values()),'curated_topic_summaries':sum(len(r['topics']) for r in runtime.values()),'complete':False,'subjects':audit}
 (ROOT/'docs/ENTITY_KNOWLEDGE_COVERAGE.json').write_text(json.dumps(report,indent=2)+'\n')
 print(f"Entity database: {report['entities']} subjects, {report['curated_topic_summaries']} curated topic summaries; completeness remains pending")
if __name__=='__main__':build()
