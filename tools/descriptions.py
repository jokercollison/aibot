"""Compile explicit what/does explanations and report every missing subject.

No unknown subject is filled with a guessed fact, a recipe, or a generic
registry label. Family rules are inspectable editorial content, not AI inference.
"""
from pathlib import Path
import json,re,collections
ROOT=Path(__file__).resolve().parents[1]
def load(p):return json.loads((ROOT/p).read_text())
core=load('data/descriptions/core.json')
entities=load('data/descriptions/entities.json')
families=load('data/descriptions/families.json')
records=load('data/catalog.json')['records']
aliases={
 'lit_furnace':'furnace','lit_blast_furnace':'blast_furnace','lit_smoker':'smoker',
 'powered_comparator':'comparator','unpowered_comparator':'comparator',
 'powered_repeater':'repeater','unpowered_repeater':'repeater',
 'unlit_redstone_torch':'redstone_torch','lit_redstone_lamp':'redstone_lamp',
 'lit_redstone_ore':'redstone_ore','lit_deepslate_redstone_ore':'deepslate_redstone_ore',
 'flowing_water':'water','flowing_lava':'lava','tropical_fish':'tropicalfish',
 'end_crystal':'ender_crystal','experience_bottle':'xp_bottle',
 'firework_rocket':'fireworks_rocket','slime_ball':'slime_ball',
 'muttonRaw':'mutton','carrots':'carrot','potatoes':'potato','cocoa':'cocoa_beans','melon':'melon_slice','lodestone_compass':'compass','daylight_detector_inverted':'daylight_detector','netherbrick':'nether_brick','torchflower_crop':'torchflower','pitcher_crop':'pitcher_plant','sweet_berry_bush':'sweet_berries','frame':'item_frame','glow_frame':'glow_item_frame','fish':'cod','clownfish':'tropical_fish',
}
compiled={};missing=[];counts=collections.Counter();by_kind=collections.defaultdict(collections.Counter)
for id,r in sorted(records.items()):
 if r['kind'] not in ['block','item','entity']:continue
 name=r['minecraft_id'].split(':',1)[1]
 canonical='minecraft:'+aliases.get(name,name)
 entity=entities.get('entity:'+r['minecraft_id']) or entities.get('entity:'+canonical)
 # Item/entity overlap can mean different things (slime mob versus slime block).
 definition=entity if r['kind']=='entity' else core.get(r['minecraft_id']) or core.get(canonical)
 method='specific'
 if definition is None and r['kind']=='item' and name in ['armor_stand','arrow','chest_minecart','hopper_minecart','minecart','tnt','tnt_minecart','command_block_minecart','egg','end_crystal','experience_bottle','firework_rocket','snowball']:
  definition=entity
 if definition is None and r['kind']!='entity':
  for rule in families:
   if r['kind'] not in rule['kinds']:continue
   match=re.fullmatch(rule['pattern'],name)
   if not match:continue
   label=r['name']
   variant=(match.group(1) or '').replace('_',' ') if match.groups() else ''
   definition={k:rule[k] for k in ['what','does','verification','reference_urls']}
   definition['what']=definition['what'].replace('{name}',label).replace('{variant}',variant)
   definition['family']=rule['id'];method='family';break
 if definition:
  assert definition.get('what') and definition.get('does'),id
  compiled[id]={**definition,'kind':r['kind'],'minecraft_id':r['minecraft_id'],'coverage':method}
 else:
  method='missing'
  missing.append({'id':id,'name':r['name'],'kind':r['kind'],'reason':'No reviewed what/does explanation yet; do not generate a guessed answer.'})
 counts[method]+=1;by_kind[r['kind']][method]+=1
(ROOT/'data/description_catalog.json').write_text(json.dumps(compiled,indent=2,ensure_ascii=False)+'\n')
runtime={id:{k:d[k] for k in ['what','does','coverage']} for id,d in compiled.items()}
(ROOT/'data/description_runtime.json').write_text(json.dumps(runtime,indent=2,ensure_ascii=False)+'\n')
report={'scope':'every block, item and entity in the supplied catalog, including legacy and non-retail identifiers','totals':dict(counts),'by_kind':{k:dict(v) for k,v in by_kind.items()},'verification':'Editorial/family explanations are not a claim of target-version game verification. Referenced pages are research targets, not fetched-page verification records.','missing':missing}
(ROOT/'docs/KNOWLEDGE_COVERAGE.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print('What/does coverage:',dict(counts),dict(by_kind))
