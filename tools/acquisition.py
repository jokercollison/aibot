"""Index possible loot sources and mob drops without promising guaranteed loot."""
import json,collections
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def load(p):return json.loads((ROOT/p).read_text())
by_item=load('legacy/database/structured/v65/loot_sources_by_item.json')
profiles=load('legacy/database/vanilla/v52_all_original_entity_components.json')
tables=load('legacy/database/structured/v66/loot_table_reverse_index.json')
items={}
for id,entries in by_item.items():
    rows=[]
    for entry in entries:
        table=entry['table'];kind=entry.get('type','other')
        if kind not in ['chests','entities','blocks']:continue
        label=Path(table).stem.replace('_',' ')
        # Preserve the source table as development provenance, not a claimed
        # generated location or guaranteed drop.
        rows.append({'kind':kind,'name':label,'source':table,'conditional':bool(entry.get('conditional'))})
    if rows:items[id]=rows
entities={}
for id,p in profiles.items():
    scopes=[('base',p.get('base',{}))]+list(p.get('component_groups',p.get('groups',{})).items())
    linked=[]
    for scope,components in scopes:
        table=components.get('minecraft:loot',{}).get('table')
        if table in tables:
            linked.append({'scope':scope,'source':table,'possible_items':tables[table]['items']})
    if linked:entities[id]=linked
(ROOT/'data/acquisition_index.json').write_text(json.dumps({'items':items,'entities':entities},indent=2)+'\n')
print('Acquisition evidence indexed:',len(items),'item IDs;',len(entities),'entity drop profiles.')
