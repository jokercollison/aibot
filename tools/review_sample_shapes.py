"""Recheck all 96 colored wool/concrete shapes against pinned block and loot evidence.

Development-only: needs /workspace/reference/bedrock-samples. Normal builds use
the checked-in editorial data and do not require this research checkout.
"""
import json,hashlib,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'));from entity_evidence import read_jsonc
p=ROOT/'data/blocks/decorative.json';d=json.loads(p.read_text());sample=Path('/workspace/reference/bedrock-samples/behavior_pack');colors='white orange magenta light_blue yellow lime pink gray light_gray cyan purple blue brown green red black'.split();pat='(?:'+'|'.join(colors)+')'
for material in ['wool','concrete']:
 for shape in ['slab','stairs','double_slab']:
  refs=[]
  for color in colors:
   name=f'{color}_{material}_{shape}';file=sample/'blocks'/f'{name}.block.json';b=read_jsonc(file)['minecraft:block'];comp=b['components'];internal=b['description']['internal_vanilla_data']
   assert internal.get('requires_correct_tool_for_drops',False)==(material=='concrete')
   assert ('minecraft:is_pickaxe_item_destructible' if material=='concrete' else 'minecraft:is_shears_item_destructible') in comp['minecraft:tags']
   assert bool(comp.get('minecraft:flammable'))==(material=='wool')
   liquid=any(r.get('can_contain_liquid') for r in comp.get('minecraft:liquid_detection',{}).get('detection_rules',[]));assert liquid==(shape!='double_slab')
   lootfile=sample/comp['minecraft:loot'];loot=read_jsonc(lootfile);entries=loot['pools'][0]['entries'];assert len(entries)==1
   outname=f'{color}_{material}_slab' if shape=='double_slab' else name;assert entries[0]['name']=='minecraft:'+outname
   count=next((f['count'] for f in entries[0].get('functions',[]) if f['function']=='set_count'),1);assert count==(2 if shape=='double_slab' else 1)
   refs.append({'file':'behavior_pack/blocks/'+file.name,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'loot':comp['minecraft:loot'],'loot_sha256':hashlib.sha256(lootfile.read_bytes()).hexdigest()})
  topics={'mining':(('Use any pickaxe; without one the block drops nothing.' if material=='concrete' else 'Break it by hand or with any tool; shears are fastest.')+(' It drops 2 matching slabs, not a double-slab item.' if shape=='double_slab' else ' It drops itself.')+' Silk Touch is unnecessary and Fortune does not increase the drop.'),'water':('Double slabs cannot be waterlogged.' if shape=='double_slab' else 'This shape can be waterlogged.'),'fire':('Wool building shapes are flammable and can burn away.' if material=='wool' else 'Concrete building shapes do not catch fire or burn away.'),'operation':'Use this material as a building shape. It stays in place without support.'}
  d['rules']=[r for r in d['rules'] if r['id']!=material+'_'+shape]
  d['rules'].append({'id':material+'_'+shape,'pattern':pat+'_'+material+'_'+shape,'topics':topics,'evidence':{'source':'https://github.com/Mojang/bedrock-samples/tree/46ba6ea985fb5a92d79a9419198f10dda14c199d/behavior_pack/blocks','sample_commit':'46ba6ea985fb5a92d79a9419198f10dda14c199d','reviewed_components':['requires_correct_tool_for_drops','tags','loot','liquid_detection','flammable'],'members':refs}})
p.write_text(json.dumps(d,indent=2)+'\n')
