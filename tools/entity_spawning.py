"""Preserve pinned spawn rules and audit reviewed answers; do not flatten branches.

Refresh developer evidence explicitly with --refresh-samples PATH. Compilation
uses committed facts offline, without turning a missing spawn file into a claim
that an entity cannot spawn. Engine/structure/trigger rules also matter.
"""
from pathlib import Path
import argparse,json,hashlib
from entity_evidence import read_jsonc
ROOT=Path(__file__).resolve().parents[1]
def compile():
 subjects=json.loads((ROOT/'data/entities/subjects.json').read_text())['subjects']
 facts=json.loads((ROOT/'data/entities/spawn_editorial.json').read_text())['subjects']
 evidence=json.loads((ROOT/'data/entities/spawn_evidence.json').read_text())
 rows={key:{'name':s['name'],'location_reviewed':bool(facts.get(key,{}).get('topics',{}).get('spawning')),'conditions_reviewed':bool(facts.get(key,{}).get('topics',{}).get('spawn_conditions')),'pinned_rule_files':evidence['subjects'].get(key,[]),'status':'reviewed_summary_not_exhaustive' if key in facts else 'pending_detailed_review','complete':False} for key,s in subjects.items() if s['category']=='mob'}
 report={'scope':'Mob spawning: raw branches are evidence, not a complete engine simulator. Missing files are not proof of unavailability.','catalog_mobs':len(rows),'subjects_with_reviewed_conditions':sum(r['conditions_reviewed'] for r in rows.values()),'sample_rule_files':len(evidence['files']),'complete':False,'conflicts':[{'subject':'minecraft:creeper','detail':'Pinned brightness filters permit 0–7; archived wiki describes light 0. Numeric natural-spawn light threshold is withheld from player troubleshooting pending reconciliation.'}],'subjects':rows}
 (ROOT/'docs/ENTITY_SPAWNING_COVERAGE.json').write_text(json.dumps(report,indent=2)+'\n')
 print(f"Spawn audit: {report['subjects_with_reviewed_conditions']}/{len(rows)} detailed summaries; {len(evidence['files'])} preserved rule files; no completeness claim")
def refresh(path):
 files={};subjects={}
 for p in sorted((path/'behavior_pack/spawn_rules').glob('*.json')):
  payload=read_jsonc(p);identifier=payload['minecraft:spawn_rules']['description']['identifier'];rel=p.relative_to(path).as_posix()
  files[rel]={'source_sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'document':payload}
  subjects.setdefault(identifier,[]).append(rel)
 out={'tag':'v1.26.50.4','commit':'46ba6ea985fb5a92d79a9419198f10dda14c199d','scope':'Developer-only raw spawn branches; engine and structure spawning not fully represented.','files':files,'subjects':subjects}
 (ROOT/'data/entities/spawn_evidence.json').write_text(json.dumps(out,indent=2)+'\n')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--refresh-samples',type=Path);args=p.parse_args()
 if args.refresh_samples:refresh(args.refresh_samples)
 compile()
