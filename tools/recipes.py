"""Normalize all official recipe result formats; preserve variant provenance."""
import json,collections
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
raw=json.loads((ROOT/'data/official_recipes.json').read_text())
woods=['oak','spruce','birch','jungle','acacia','dark_oak','mangrove','bamboo']
colors=['white','orange','magenta','light_blue','yellow','lime','pink','gray','light_gray','cyan','purple','blue','brown','green','red','black']
dyes=['ink_sac','red_dye','green_dye','cocoa_beans','lapis_lazuli','purple_dye','cyan_dye','light_gray_dye','gray_dye','pink_dye','lime_dye','yellow_dye','light_blue_dye','magenta_dye','orange_dye','bone_meal','black_dye','brown_dye','blue_dye','white_dye']
aliases={'emptymap':'empty_map','carrotonastick':'carrot_on_a_stick','chain':'iron_chain','chorus_fruit_popped':'popped_chorus_fruit','speckled_melon':'glistering_melon_slice','muttonraw':'mutton','muttoncooked':'cooked_mutton','fish':'cod','clownfish':'tropical_fish'}
def stack(value):
    if isinstance(value,str):value={'item':value}
    if not isinstance(value,dict):return None
    if 'tag'in value:return {'tag':value['tag'],'count':value.get('count',1)}
    rawid=value.get('item',value.get('id'))
    if not rawid:return None
    parts=rawid.lower().split(':');data=value.get('data')
    if len(parts)==1:name=parts[0]
    else:
        name=parts[1]
        if len(parts)>2 and parts[-1].lstrip('-').isdigit():data=int(parts[-1])
        elif name=='potion_type':return {'id':rawid.lower(),'count':value.get('count',1)}
    data=int(data) if isinstance(data,(int,float)) else None
    if name=='dye' and data is not None and 0<=data<len(dyes):name=dyes[data]
    elif name in ['boat','chest_boat'] and data is not None and 0<=data<len(woods):
        wood=woods[data];name=wood+('_chest_raft' if wood=='bamboo' and name=='chest_boat' else '_raft' if wood=='bamboo' else '_'+name)
    elif name=='planks' and data is not None and 0<=data<6:name=woods[data]+'_planks'
    elif name in ['log','log2'] and data is not None:
        n=(data%4)+(4 if name=='log2' else 0)
        if n<6:name=woods[n]+'_log'
    elif name in ['wool','carpet','bed'] and data is not None and 0<=data<len(colors):name=colors[data]+'_'+name
    elif name=='banner' and data is not None and 0<=data<len(colors):name=list(reversed(colors))[data]+'_banner'
    elif name=='coal' and data==1:name='charcoal'
    elif name=='bucket' and data==1:name='milk_bucket'
    elif name=='emptymap' and data==2:name='locator_map'
    elif name=='quartz_block' and data==2:name='quartz_pillar'
    elif name=='purpur_block' and data==2:name='purpur_pillar'
    elif name=='banner_pattern' and data is not None:
        patterns=['creeper','skull','flower','mojang','field_masoned','bordure_indented']
        if 0<=data<len(patterns):name=patterns[data]+('_banner_pattern')
    elif name=='skull' and data in [0,1,2,3,4,5]:name=['skeleton_skull','wither_skeleton_skull','zombie_head','player_head','creeper_head','dragon_head'][data]
    name=aliases.get(name,name)
    return {'id':'minecraft:'+name,'count':value.get('count',1)}
index=collections.defaultdict(list);operations=[];errors=[]
for rows in raw.values():
 for row in rows:
    d=row['definition'];method=row['type'].removeprefix('minecraft:recipe_')
    result=d.get('result',d.get('output'));results=result if isinstance(result,list) else [result]
    outputs=[s for v in results if (s:=stack(v))]
    ingredients=[]
    if d.get('pattern'):
        counts=collections.Counter(''.join(d['pattern']));ingredients=[{**stack(v),'count':counts[symbol]*v.get('count',1)} for symbol,v in d['key'].items() if counts[symbol]]
    elif d.get('ingredients'):ingredients=[stack(v) for v in d['ingredients']]
    else:ingredients=[s for key in ['input','template','base','addition','reagent'] if (s:=stack(d.get(key)))]
    normalized={'method':method,'ingredients':ingredients,'stations':d.get('tags',[]),'source':row['source'],'identifier':d['description']['identifier'],'byproducts':outputs[1:]}
    if outputs:
        normalized['result']=outputs[0];index[outputs[0]['id']].append(normalized)
    elif method=='smithing_trim':operations.append(normalized)
    else:errors.append(row['source'])
assert not errors,errors
(ROOT/'data/recipe_index.json').write_text(json.dumps({'by_output':dict(index),'operations':operations,'source_recipe_count':sum(map(len,raw.values()))},indent=2)+'\n')
print(f'Normalized {sum(map(len,raw.values()))} recipes: {len(index)} outputs, {len(operations)} input-dependent operations; no dropped recipe files.')
