"""Conservative typed feeding and health facts from pinned Bedrock components.

Keep purposes and component scopes separate. A healing item is not automatically
breeding food; a harmful interaction is never described as healing.
"""
LABELS={'fish':'raw cod','salmon':'raw salmon','clownfish':'tropical fish','cooked_fish':'cooked cod','cooked_salmon':'cooked salmon','hay_block':'hay bale','appleEnchanted':'enchanted golden apple','muttonRaw':'raw mutton','muttonCooked':'cooked mutton','slime_ball':'slimeball','tropical_fish_bucket':'bucket of tropical fish','pufferfish_bucket':'bucket of pufferfish','cod_bucket':'bucket of cod','salmon_bucket':'bucket of salmon','porkchop':'raw porkchop','beef':'raw beef','chicken':'raw chicken','rabbit':'raw rabbit'}
ROLES={'breeding':('minecraft:breedable','breed_items'),'taming':('minecraft:tameable','tame_items'),'healing':('minecraft:healable','items'),'growth':('minecraft:ageable','feed_items')}
# Exclude numeric engine health where it would misrepresent invulnerability,
# destructible objects or unreachable legacy component groups.
HEALTH_EXCLUDE={'minecraft:creaking','minecraft:ender_crystal','minecraft:xp_orb','minecraft:tripod_camera','minecraft:ocelot'}

def item_id(value):
 value=value.removeprefix('minecraft:')
 return 'minecraft:'+value

def sample_url(evidence,record):
 return 'https://github.com/Mojang/bedrock-samples/blob/'+evidence['commit']+'/'+record['source']

def feeding(record):
 roles={};hazards=[]
 for scope,body in record.get('scopes',{}).items():
  for role,(component,field) in ROLES.items():
   settings=body.get(component,{})
   items=settings.get(field,[])
   if isinstance(items,str):items=[items]
   if isinstance(items,dict):items=[items]
   for entry in items:
    item=entry if isinstance(entry,str) else entry.get('item')
    if not item:continue
    normalized=item_id(item)
    detail={'id':normalized,'name':LABELS.get(item.removeprefix('minecraft:'),item.removeprefix('minecraft:').replace('_',' ')),'scope':scope}
    if isinstance(entry,dict):
     for field_name in ['heal_amount','growth','result_item','effects']:
      if field_name in entry:detail[field_name]=entry[field_name]
     if entry.get('effects'):
      hazards.append(detail);continue
    for restriction in ['require_tame','love_filters','interact_filters','breed_cooldown']:
     if restriction in settings:detail[restriction]=settings[restriction]
    roles.setdefault(role,[]).append(detail)
 return {'roles':roles,'hazards':hazards}

def health(record,key):
 if key in HEALTH_EXCLUDE:return None
 values=[]
 for scope,body in record.get('scopes',{}).items():
  settings=body.get('minecraft:health',{})
  number=settings.get('max',settings.get('value'))
  if isinstance(number,(int,float)) and number>0:values.append((scope,number))
 if not values or len({v for _,v in values})!=1:return None
 value=values[0][1]
 return {'answer':f'Its normal maximum health is {value:g} health points ({value/2:g} hearts). Effects can change its health during play.','coverage':'sample_component_summary','scoped_values':[{'scope':s,'maximum':v} for s,v in values]}
