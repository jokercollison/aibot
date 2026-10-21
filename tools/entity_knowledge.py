"""Connect conservative component-derived mob facts without flattening states."""
from pathlib import Path
import json,collections
ROOT=Path(__file__).resolve().parents[1]
profiles=json.loads((ROOT/'legacy/database/vanilla/v52_all_original_entity_components.json').read_text())
def labels(items):
    if isinstance(items,str):items=[items]
    if not isinstance(items,list):return []
    result=[]
    for value in items:
        if isinstance(value,dict):value=value.get('item',value.get('item_type'))
        if isinstance(value,str):
            result.append(value.removeprefix('minecraft:').replace('_',' '))
    return sorted(set(result))
compiled={}
for id,p in profiles.items():
    base=p.get('base',{});groups=p.get('component_groups',p.get('groups',{}));scopes=[('base',base)]+[(name,body) for name,body in groups.items()]
    facts={};health=[]
    for scope,body in scopes:
        component=body.get('minecraft:health',{});number=component.get('max',component.get('value'))
        if isinstance(number,(int,float)) and number>0:health.append((scope,number))
    if health:
        values=sorted({v for scope,v in health})
        if len(values)==1:answer=f'Its listed maximum health is {values[0]:g} health points ({values[0]/2:g} hearts). Effects and special states can change health during play.'
        else:answer='Its health depends on its form or state. Listed maximum-health values include '+', '.join(f'{v:g} health points ({v/2:g} hearts)' for v in values)+'. These are alternatives, not values that apply simultaneously.'
        facts['health']={'answer':answer,'scoped_values':[{'scope':s,'maximum':v} for s,v in health]}
    for topic,component,field in [('taming','minecraft:tameable','tame_items'),('breeding','minecraft:breedable','breed_items')]:
        variants=[]
        for scope,body in scopes:
            c=body.get(component,{})
            food=labels(c.get(field))
            if food:variants.append({'scope':scope,'items':food,'require_tame':c.get('require_tame')})
        if variants:
            options=sorted({food for v in variants for food in v['items']})
            if topic=='taming':answer='For an eligible wild animal, use '+', '.join(options)+'. Taming can require more than one attempt; not every form or state is eligible.'
            else:answer='Eligible adults can breed using '+', '.join(options)+'. Bring two suitable adults close together'+(' and make sure both are tamed' if any(v['require_tame'] is True for v in variants) else '')+'. Breeding cooldowns and species-specific conditions still apply.'
            facts[topic]={'answer':answer,'scoped_variants':variants}
    if facts:compiled[id]={'source':p.get('source_file'),'status':'component_derived_with_state_caveats_not_full_gameplay_verification','facts':facts}
(ROOT/'data/entity_knowledge.json').write_text(json.dumps(compiled,indent=2)+'\n')
print('Connected conservative entity topics:',dict(collections.Counter(topic for p in compiled.values() for topic in p['facts'])))
