"""Compile positive environmental evidence without inventing default immunities.
Only explicit base components become broad facts; scoped components remain scoped.
"""
from pathlib import Path
import json
from entity_topics import sample_url
ROOT=Path(__file__).resolve().parents[1]
def compile():
 samples=json.loads((ROOT/'data/entities/sample_evidence.json').read_text());out={}
 for key,row in samples['subjects'].items():
  base=row['scopes'].get('base',{});facts={};source=sample_url(samples,row)
  if 'minecraft:fire_immune' in base:facts['fire']={'answer':'It is immune to ordinary fire and lava damage. That does not protect it from every other kind of damage.','coverage':'explicit_sample_environment','sources':[source]}
  if 'minecraft:fire_immune' in base:facts['sunlight']={'answer':'Ordinary sunlight does not make it take burning damage. It is fire-immune, although other environmental hazards can still matter.','coverage':'explicit_sample_environment','sources':[source]}
  if 'minecraft:burns_in_daylight' in base:
   if 'minecraft:fire_immune' in base:answer='It is fire-immune, so sunlight does not make it take ordinary burning damage.'
   else:answer='It can burn in direct sunlight when unprotected. Shade, water and applicable armor protection can prevent that; sunlight protection does not make it immune to lava.'
   if base.get('minecraft:burns_in_daylight',{}).get('protection_slot')=='slot.armor.body':answer='It can burn in direct sunlight when unprotected. Suitable body armor can protect it from sunlight; that is different from fire or lava immunity.'
   facts['sunlight']={'answer':answer,'coverage':'explicit_sample_environment','sources':[source]}
  breath=base.get('minecraft:breathable',{})
  if breath.get('breathes_water') is True:
   answer='It can breathe underwater.'
   if breath.get('breathes_air') is True:answer+=' It can also breathe air.'
   elif breath.get('breathes_air') is False:answer+=' It cannot breathe air normally, so keep it in water.'
   facts['water']={'answer':answer,'coverage':'explicit_sample_environment','sources':[source]}
  elif breath.get('breathes_water') is False and breath.get('breathes_air') is True:
   facts['water']={'answer':'It needs access to air and cannot breathe underwater indefinitely.','coverage':'explicit_sample_environment','sources':[source]}
  if breath.get('breathes_air') is False and breath.get('breathes_water') is True:facts['land']={'answer':'It needs water to breathe normally. Keeping it out of water can cause suffocation damage.','coverage':'explicit_sample_environment','sources':[source]}
  babies=[body['minecraft:ageable'] for scope,body in row['scopes'].items() if 'baby' in scope and 'minecraft:ageable' in body]
  durations={b['duration'] for b in babies if isinstance(b.get('duration'),(int,float)) and b['duration']>0}
  if len(durations)==1:
   seconds=next(iter(durations));time=f'{seconds/60:g} minutes' if seconds%60==0 else f'{seconds:g} seconds'
   facts['growth']={'answer':f'A baby normally grows up after about {time} of active game time. Suitable feeding interactions can accelerate growth; paused or unloaded conditions can change elapsed real time.','coverage':'explicit_sample_environment','sources':[source]}
  triggers=base.get('minecraft:damage_sensor',{}).get('triggers',[])
  if isinstance(triggers,dict):triggers=[triggers]
  if any(t.get('cause')=='fall' and t.get('deals_damage')=='no' and not t.get('on_damage',{}).get('filters') for t in triggers):facts['fall_damage']={'answer':'It does not take ordinary fall damage. Other damage sources can still hurt it.','coverage':'explicit_sample_environment','sources':[source]}
  scoped=[]
  for scope,body in row['scopes'].items():
   if scope=='base':continue
   for component in ['minecraft:breathable','minecraft:fire_immune','minecraft:burns_in_daylight','minecraft:transformation']:
    if component in body:scoped.append({'scope':scope,'component':component,'value':body[component]})
  if facts or scoped:out[key]={'topics':facts,'scoped_evidence':scoped,'source':source}
 (ROOT/'data/entities/environment_components.json').write_text(json.dumps(out,indent=2)+'\n')
 print('Environment evidence:',len(out),'profiles;',sum(len(r['topics']) for r in out.values()),'positive component summaries')
if __name__=='__main__':compile()
