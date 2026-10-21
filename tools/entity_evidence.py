"""Inventory entity topic evidence from the preserved wiki and pinned samples.
No network access. Raw article text stays in the development-only SQLite archive.
Outputs source pointers/structured sample values, never article prose as answers.
"""
from pathlib import Path
import argparse,json,re,sqlite3,zlib,hashlib,urllib.parse
ROOT=Path(__file__).resolve().parents[1]
TOPICS=['identity','spawning','biomes','variants','behavior','health','combat','drops','diet','taming','breeding','interactions','construction','transport','trading','version','additional_mechanics']
TITLES={'tropicalfish':'Tropical Fish','evocation_illager':'Evoker','eye_of_ender_signal':'Eye of Ender','xp_bottle':"Bottle o' Enchanting",'xp_orb':'Experience','villager_v2':'Villager','zombie_villager_v2':'Zombie Villager','zombie_pigman':'Zombified Piglin','ender_crystal':'End Crystal','ender_pearl':'Ender Pearl','chest_minecart':'Minecart with Chest','hopper_minecart':'Minecart with Hopper','command_block_minecart':'Minecart with Command Block','tnt_minecart':'Minecart with TNT','chest_boat':'Boat with Chest','wind_charge_projectile':'Wind Charge','breeze_wind_charge_projectile':'Wind Charge','fireworks_rocket':'Firework Rocket','fishing_hook':'Fishing Bobber','thrown_trident':'Trident','wither_skull_dangerous':'Wither Skull','tripod_camera':'Camera','npc':'NPC','tnt':'TNT','fireball':'Fireball','small_fireball':'Small Fireball'}
PATTERNS={
 'spawning':r'spawn|generation|summon|obtaining','biomes':r'spawn|habitat|biome|generation','variants':r'variant|color|colour|type|appearance|baby|size|mutation',
 'behavior':r'behavior|behaviour|movement|attack|idle|neutral|hostile|passive', 'health':r'health|healing|damage|armor','combat':r'attack|combat|defen|damage|fight|explosion|immun|weak|death',
 'drops':r'drop|death|loot|experience|shear|brush|milk','diet':r'feed|food|diet|eat|taming|breeding|heal', 'taming':r'tam|trust','breeding':r'breed|reproduc|duplication|offspring',
 'interactions':r'interact|behavior|conversion|lightning|charging|curing|shear|brush|milk|leash|dye|water|sunlight|snow|rain|fire|light|vibrat|danc|pollinat|digg|oxid|sleep|play|name|armou?r|equip',
 'construction':r'obtain|construct|creat|summon|spawn|craft','transport':r'ride|riding|saddl|mount|transport|control|carpet|harness|storage|inventory','trading':r'trad|barter|profession|job|reputation','version':r'history|edition|availability|unused|removed|experimental'}
NONMOBS=set('agent area_effect_cloud armor_stand arrow boat breeze_wind_charge_projectile chest_boat chest_minecart command_block_minecart cushion dragon_fireball egg ender_crystal ender_pearl eye_of_ender_signal fireball fireworks_rocket fishing_hook hopper_minecart lightning_bolt lingering_potion llama_spit minecart npc ominous_item_spawner player shulker_bullet small_fireball snowball splash_potion thrown_trident tnt tnt_minecart tripod_camera wind_charge_projectile wither_skull wither_skull_dangerous xp_bottle xp_orb'.split())
PROJECTILES=set('arrow breeze_wind_charge_projectile dragon_fireball egg ender_pearl fireball fireworks_rocket fishing_hook lingering_potion llama_spit shulker_bullet small_fireball snowball splash_potion thrown_trident wind_charge_projectile wither_skull wither_skull_dangerous xp_bottle'.split())
VEHICLES=set('boat chest_boat chest_minecart command_block_minecart hopper_minecart minecart tnt_minecart'.split())
def read_jsonc(path):
 text=path.read_text(encoding='utf-8-sig');text=re.sub(r'("(?:\\.|[^"\\])*"|//[^\n]*|/\*[\s\S]*?\*/)',lambda m:m[0] if m[0].startswith('"') else '',text)
 return json.loads(text)
def find_page(db,title):
 seen=set();chain=[]
 while title not in seen:
  seen.add(title)
  rows=db.execute('SELECT page_id,title,revision_id,revision_timestamp,sha256,source,redirect FROM articles WHERE title=? COLLATE NOCASE ORDER BY title=? DESC LIMIT 1',(title,title)).fetchall()
  if not rows:return None
  r=rows[0]
  if r[6]:chain.append(r[1]);title=r[6].split('#')[0];continue
  return {'page_id':r[0],'title':r[1],'revision_id':r[2],'revision_timestamp':r[3],'sha256':r[4],'text':zlib.decompress(r[5]).decode(),'redirect_chain':chain,'url':'https://minecraft.wiki/w/Special:PermanentLink/'+str(r[2])}
 return None

def sections(text):
 matches=list(re.finditer(r'^(={2,6})\s*(.*?)\s*\1\s*$',text,re.M));rows=[{'heading':'Introduction','start':0,'end':matches[0].start() if matches else len(text),'level':1}]
 for i,m in enumerate(matches):
  # Each section owns its text; hierarchical paths retain parent context.
  parents=[n for n in matches[:i] if len(n[1])<len(m[1])]
  path=[]
  for level in range(2,len(m[1])):
   parent=next((n for n in reversed(parents) if len(n[1])==level),None)
   if parent:path.append(parent[2].strip())
  rows.append({'heading':m[2].strip(),'path':path+[m[2].strip()],'start':m.start(),'end':matches[i+1].start() if i+1<len(matches) else len(text),'level':len(m[1])})
 return rows

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--archive',type=Path,default=Path('/workspace/reference/minecraft-wiki/full-archive.sqlite'));p.add_argument('--samples',type=Path,default=Path('/workspace/reference/bedrock-samples'));a=p.parse_args()
 db=sqlite3.connect('file:'+str(a.archive)+'?mode=ro',uri=True);records=json.loads((ROOT/'data/catalog.json').read_text())['records'];subjects={};sample_profiles={}
 selected={'minecraft:health','minecraft:attack','minecraft:projectile','minecraft:behavior.ranged_attack','minecraft:behavior.melee_attack','minecraft:breathable','minecraft:fire_immune','minecraft:burns_in_daylight','minecraft:tameable','minecraft:tamemount','minecraft:breedable','minecraft:offspring','minecraft:loot','minecraft:interact','minecraft:rideable','minecraft:inventory','minecraft:equippable','minecraft:variant','minecraft:mark_variant','minecraft:color','minecraft:type_family','minecraft:trusting','minecraft:damage_sensor','minecraft:transformation','minecraft:trade_table','minecraft:economy_trade_table','minecraft:behavior.barter','minecraft:leashable','minecraft:scale','minecraft:ageable','minecraft:healable','minecraft:experience_reward','minecraft:behavior.tempt','minecraft:behavior.avoid_mob_type','minecraft:environment_sensor'}
 sample_by_id={}
 for path in sorted((a.samples/'behavior_pack/entities').glob('*.json')):
  raw=read_jsonc(path);body=raw.get('minecraft:entity',{});identifier=body.get('description',{}).get('identifier')
  if identifier:sample_by_id[identifier]=(path,body,raw.get('format_version'))
 for r in records.values():
  if r['kind']!='entity':continue
  id=r['minecraft_id'];name=id.split(':')[1];title=TITLES.get(name,r['name']);page=find_page(db,title)
  row={'id':id,'name':r['name'],'category':'projectile' if name in PROJECTILES else 'vehicle' if name in VEHICLES else 'mob' if name not in NONMOBS else 'other_entity','wiki':None,'topics':{t:[] for t in TOPICS},'topic_status':{t:'unresolved' for t in TOPICS}}
  if page:
   row['wiki']={k:v for k,v in page.items() if k!='text'}
   for section in sections(page['text']):
    path='/'.join(section.get('path',[section['heading']])).lower();assigned=[]
    if section['heading']=='Introduction':assigned=['identity','health','spawning','biomes','behavior','variants']
    elif not any(x in path for x in ['sounds','gallery','advancements','achievements','data values','videos','references','trivia','navigation','external links','issues']):
     assigned=[topic for topic,pattern in PATTERNS.items() if re.search(pattern,path)]
     if not assigned:assigned=['additional_mechanics']
    for topic in assigned:row['topics'][topic].append({**section,'revision_id':page['revision_id'],'source':page['url']})
   row['topic_status']={t:'source_evidence_pending_interpretation' if row['topics'][t] else 'unresolved' for t in TOPICS}
  if id in sample_by_id:
   path,body,version=sample_by_id[id];source=str(path.relative_to(a.samples));scopes={'base':{k:v for k,v in body.get('components',{}).items() if k in selected}}
   scopes.update({scope:{k:v for k,v in values.items() if k in selected} for scope,values in body.get('component_groups',{}).items()});scopes={k:v for k,v in scopes.items() if v}
   spawn_path=a.samples/'behavior_pack/spawn_rules'/path.name
   profile={'source':source,'source_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'format_version':version,'description':body.get('description',{}),'scopes':scopes,'events':body.get('events',{}),'spawn_rules':read_jsonc(spawn_path) if spawn_path.exists() else None,'spawn_source':str(spawn_path.relative_to(a.samples)) if spawn_path.exists() else None,'loot_tables':{}}
   for components in scopes.values():
    table=components.get('minecraft:loot',{}).get('table')
    if table and (a.samples/'behavior_pack'/table).exists():profile['loot_tables'][table]=read_jsonc(a.samples/'behavior_pack'/table)
   sample_profiles[id]=profile;row['sample_source']=source
  subjects[id]=row
 out={'schema_version':1,'target_game_version':'1.26.52','scope':'All catalog entities, including non-mobs and experimental entries. Evidence pointers are NOT approved answer coverage.','subjects':subjects}
 (ROOT/'data/entities/subjects.json').write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n');(ROOT/'data/entities/sample_evidence.json').write_text(json.dumps({'tag':'v1.26.50.4','commit':'46ba6ea985fb5a92d79a9419198f10dda14c199d','subjects':sample_profiles},indent=2)+'\n')
 report={'subject_count':len(subjects),'wiki_mapped':sum(r['wiki'] is not None for r in subjects.values()),'sample_mapped':len(sample_profiles),'wiki_unresolved':[id for id,r in subjects.items() if not r['wiki']],'topics':TOPICS,'complete_gameplay_subjects':0}
 (ROOT/'docs/ENTITY_EVIDENCE_COVERAGE.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
if __name__=='__main__':main()
