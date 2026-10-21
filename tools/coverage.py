"""Exhaustive catalog/recipe/evidence reconciliation; absence is never uncraftable."""
import json,collections,hashlib,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
import sys
SAMPLES=Path(sys.argv[1]) if len(sys.argv)>1 else Path('/workspace/reference/bedrock-samples')
def load(path):return json.loads(path.read_text())
records=load(ROOT/'data/catalog.json')['records'];recipes=load(ROOT/'data/recipe_index.json')
acquisitions=load(ROOT/'legacy/database/structured/v66/acquisition_provenance.json')
loot=load(ROOT/'legacy/database/structured/v65/loot_sources_by_item.json')
spawn=load(ROOT/'legacy/database/structured/v66/spawn_evidence_compact.json')
identity={};inventory={}
for kind in ['block','item','entity']:
    path=SAMPLES/'metadata/vanilladata_modules'/{'block':'mojang-blocks.json','item':'mojang-items.json','entity':'mojang-entities.json'}[kind]
    if path.exists():official={r['name'] for r in load(path)['data_items']}
    else:official=set(load(ROOT/'data/sample_inventory.json')['by_kind'][kind])
    local={r['minecraft_id'] for r in records.values() if r['kind']==kind}
    identity[kind]={'official_count':len(official),'catalog_count':len(local),'missing_from_catalog':sorted(official-local),'extra_legacy_aliases':sorted(local-official),'source':str(path.relative_to(SAMPLES))}
    inventory[kind]=sorted(official)
by_output=recipes['by_output'];rows=[]
for id,record in sorted(records.items()):
    if record['kind'] not in ['block','item','entity']:continue
    name=record['minecraft_id'];found=by_output.get(name.lower(),[])
    evidence=loot.get(name,[])
    if record['kind']=='entity':classification='entity_not_crafting_inventory_item'
    elif found:classification='recipe_indexed'
    elif evidence:classification='acquisition_evidence_only_no_sample_recipe'
    else:classification='no_sample_recipe_acquisition_unresolved'
    rows.append({'record':id,'name':record['name'],'minecraft_id':name,'kind':record['kind'],'classification':classification,'recipe_methods':sorted({r['method'] for r in found}),'recipe_sources':[r['source'] for r in found],'loot_source_count':len(evidence),'spawn_evidence_available':name in spawn})
research=[]
for path in sorted((ROOT/'legacy/database').glob('*wiki*.json')):
    data=load(path);research.append({'file':str(path.relative_to(ROOT)),'top_level_entries':len(data) if isinstance(data,(dict,list)) else 0,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'status':'inherited_research_not_a_complete_live_wiki_copy'})
all_sources={r['source'] for recipes_for_output in by_output.values() for r in recipes_for_output}|{r['source'] for r in recipes['operations']}
report={'scope':'Every official identifier from pinned Bedrock samples plus all local legacy aliases; acquisition gaps remain explicit.','samples':{'tag':'v1.26.50.4','commit':'46ba6ea985fb5a92d79a9419198f10dda14c199d'},'catalog_reconciliation':identity,'recipes':{'source_files':recipes['source_recipe_count'],'accounted_for_files':len(all_sources),'normalized_output_subjects':len(by_output),'input_dependent_operations':len(recipes['operations']),'methods':dict(collections.Counter(r['method'] for rs in by_output.values() for r in rs)+collections.Counter(r['method'] for r in recipes['operations']))},'counts':dict(collections.Counter(r['classification'] for r in rows)),'wiki':{'live_access':'blocked_by_environment_proxy_403','complete_wiki_imported':False,'inherited_research':research},'rules':['No sample recipe does not prove an item is uncraftable.','Some mechanics are engine-driven or version-dependent; explicit unresolved entries must stay unresolved until checked.','Entities can have drops/spawn/breeding/building mechanics without an inventory crafting recipe.','Source-file/index coverage does not prove factual correctness or target-game runtime behavior.'],'records':rows}
assert all(not d['missing_from_catalog'] for d in identity.values())
assert len(all_sources)==recipes['source_recipe_count']
(ROOT/'docs/CRAFTING_COVERAGE.json').write_text(json.dumps(report,indent=2)+'\n')
(ROOT/'data/sample_inventory.json').write_text(json.dumps({'samples':report['samples'],'by_kind':inventory},indent=2)+'\n')
print('Catalog reconciliation complete:',{k:v['official_count'] for k,v in identity.items()})
print('Recipe accounting:',report['recipes'])
print('Knowledge states:',report['counts'])
