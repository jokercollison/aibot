"""Compile shared, reviewed normal-gameplay rules without inventing absent mechanics.

The authoring file enumerates explicit capabilities reconciled against complete
wiki lists and sample interaction scopes. Generated rule applications are counted
separately from individually written summaries.
"""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CAPABILITY_TOPICS=['leashing','bucketing','transport','trading','milking','naming']
AFFINITY_TOPICS=['smite','bane_of_arthropods','impaling','poison_reaction','regeneration_reaction','healing_magic','harming_magic']
def extend(runtime):
 data=json.loads((ROOT/'data/entities/finish_editorial.json').read_text());refs=data['references'];counts={'feeding_summaries_added':0,'capability_answers_added':0,'effect_rule_answers_added':0,'interaction_summaries_added':0}
 def add(id,topic,answer,titles,coverage):
  if topic in runtime[id]['topics']:return
  source=data['capabilities'][id]['wiki']
  runtime[id]['topics'][topic]={'answer':answer,'coverage':coverage,'sources':list(dict.fromkeys([source,*[refs[t]['url'] for t in titles]]))}
 for id,fact in data['feeding_closeout'].items():
  assert 'diet' not in runtime[id]['topics'],id
  runtime[id]['topics']['diet']={k:fact[k] for k in ['answer','coverage','sources']};counts['feeding_summaries_added']+=1
 counts['special_summaries_added']=0
 for id,row in data['special_topics'].items():
  for topic,fact in row.items():
   if topic not in runtime[id]['topics']:
    runtime[id]['topics'][topic]=fact;counts['special_summaries_added']+=1
 for id,cap in data['capabilities'].items():
  name=cap['name'].lower();article='an' if name[0] in 'aeiou' else 'a'
  if cap['leashable']:
   leash=f'You can attach a lead to {article} {name}. Guide it along a safe route; the lead can break if stretched too far.'
   if cap['leash_requires_calm']:leash+=' It must not be angry when you attach the lead.'
   if cap['leash_requires_no_hostile_rider']:leash+=' Remove hostile riders before attaching the lead.'
  else:leash=f'You cannot attach a normal lead to {article} {name} in ordinary gameplay. Another transport method, where supported, is a separate interaction.'
  bucket=f'You cannot capture {article} {name} as a mob-in-a-bucket item. Milking a mob or using a bucket nearby is a different action.'
  if cap['bucketable']:assert 'bucketing' in runtime[id]['topics'],id
  ride=f'A {name} is not a normal player-ridable mount. Taming, leashing or another mob riding it does not make it a mount you can saddle and steer.'
  if article=='an':ride='An '+ride[2:]
  if cap['player_mount']:
   known={
    'minecraft:camel_husk':'A camel husk can carry two riders and can be ridden with a saddle. Deal with hostile passengers first; the mount and its riders are separate entities. It does not require ordinary animal taming.',
    'minecraft:skeleton_horse':'A skeleton horse obtained from a triggered skeleton trap can be ridden after you deal with its rider. In Bedrock you can control it without a saddle. It can travel underwater; that does not let the player breathe indefinitely.',
    'minecraft:zombie_nautilus':'Deal with a hostile drowned rider first. Tame the zombie nautilus with pufferfish or a bucket of pufferfish, equip a saddle, then mount it for underwater travel. Armor is separate equipment; another kind of fish being accepted for healing does not make it taming food.',
    'minecraft:zombie_horse':'Remove the hostile rider, then tame the zombie horse by mounting it and equip a saddle to control riding. A red mushroom can heal it. Horse armor is equipment, not breeding food.'}
   assert id in known or 'transport' in runtime[id]['topics'],id
   ride=known.get(id,'')
  trade=f'You cannot open normal trades with {article} {name}. Villagers and wandering traders use trading menus; adult piglin bartering is a separate gold-ingot interaction.'
  if cap['merchant'] or cap['bartering']:assert 'trading' in runtime[id]['topics'],id
  milk=f'You cannot milk {article} {name}. Empty-bucket milking works on adult cows, mooshrooms and goats; capturing a bucketable mob is a different action.'
  if cap['milkable']:assert 'milking' in runtime[id]['topics'],id
  naming=f'Rename a name tag in an anvil, then use that renamed tag on {article} {name}. Naming does not tame it or cancel every special despawn timer.'
  if not cap['nameable']:naming='You cannot rename the Ender Dragon with an ordinary name tag. Command-based naming is a separate creator action.'
  for topic,answer,titles in [('naming',naming,['Name Tag']),('leashing',leash,['Lead']),('bucketing',bucket,['Bucket of mob']),('transport',ride,['Riding']),('trading',trade,['Trading']),('milking',milk,['Milk Bucket'])]:
   if topic not in runtime[id]['topics']:
    add(id,topic,answer,titles,'reviewed_capability');counts['capability_answers_added']+=1
 for id,aff in data['affinities'].items():
  name=aff['name'].lower();undead=aff['undead'];arthropod=aff['arthropod'];special=aff['special']
  smite=(f'Yes. A {name} is undead, so Smite adds damage against it.' if undead else f'No extra Smite damage applies to {name}: it is not undead. The weapon can still deal its ordinary damage.')
  bane=(f'Yes. A {name} is an arthropod, so Bane of Arthropods adds damage and Slowness IV against it.' if arthropod else f'Bane of Arthropods does not add its arthropod damage bonus against {name}. It only applies to bees, spiders, cave spiders, silverfish and endermites.')
  if undead and name[0] in 'aeiou':smite=smite.replace('A ','An ',1)
  if arthropod and name[0] in 'aeiou':bane=bane.replace('A ','An ',1)
  impaling=f'In Bedrock, Impaling can add damage against {name} when the target is in water or rain. It is not limited to aquatic mobs, and it applies to melee and thrown trident hits that actually damage the target.'
  if special=='rare_family_variant':smite+=' Rare zombified piglins may not take the usual extra Smite damage.'
  poison=(f'{aff["name"]} is immune to the Poison effect; a Poison potion is not an effective damage method.' if aff['poison_immune'] else f'If Poison is successfully applied to {name}, it can damage it over time. Ordinary Poison stops at 1 health point rather than finishing the kill by itself.')
  regen=(f'Regeneration does not restore health to {name}; this mob is immune to that effect.' if aff['regeneration_immune'] else f'If Regeneration is successfully applied to {name}, it restores health over time. It does not tame the mob or prevent other damage.')
  heal=(f'Instant Health from a Healing potion damages {name} because it is undead. Instant Damage from a Harming potion has the reverse interaction and heals it.' if undead else f'Instant Health heals {name} when the effect is successfully applied. To affect a mob use a suitable splash or lingering potion; drinking the potion yourself affects you instead.')
  harm=(f'Instant Damage from a Harming potion heals {name} because it is undead. Use Instant Health to damage undead rather than assuming a Harming potion will hurt them.' if undead else f'Instant Damage from a Harming potion hurts {name} when the effect is successfully applied. It is not a healing method for this mob.')
  if special=='witch':
   poison='Witches are 95% resistant to Poison damage in Bedrock, rather than completely immune. Poison is therefore a poor damage method against a witch.'
   harm='Witches are 95% resistant to Instant Damage in Bedrock. A Harming potion is therefore a poor damage method against one; resistance is not complete immunity.'
  if special=='dragon':
   heal='The Ender Dragon is immune to ordinary Healing effects; nearby End crystals are its normal fight-healing mechanic.'
   harm='The Ender Dragon can take Instant Damage when the source is a player, such as a player-thrown Harming potion. It is immune when that effect does not come from a player.'
   impaling+=' A perched dragon is immune to arrows and thrown tridents, so an enchantment does not make that projectile hit effective.'
  if special=='heart_linked':
   poison='A naturally heart-linked creaking does not take ordinary direct damage. Poison is not a way to defeat that heart-linked encounter; locate and break the active creaking heart.'
   heal='A Healing potion does not remove a naturally spawned creaking’s link to its heart or turn it into a tame companion. Heart interactions control that encounter.'
   harm='A heart-linked creaking is immune to ordinary direct damage, including Instant Damage. Break its active creaking heart rather than relying on Harming potions.'
   regen='Regeneration is not a way to manage the naturally heart-linked creaking encounter. Its heart link, rather than a normal damage-and-heal cycle, is what you need to address.'
   smite+=' Weapon enchantments do not bypass the protection of a naturally heart-linked creaking.'
   bane+=' Weapon enchantments do not bypass the protection of a naturally heart-linked creaking.'
   impaling+=' This does not bypass a naturally heart-linked creaking’s direct-damage protection.'
  if special=='rare_family_variant':
   note=' This describes ordinary zombified piglins; rare individuals can react differently.'
   poison+=note;regen+=note;heal+=note;harm+=note
  facts={
   'smite':(smite,['Smite','Undead']), 'bane_of_arthropods':(bane,['Bane of Arthropods']), 'impaling':(impaling,['Impaling']),
   'poison_reaction':(poison,['Poison','Undead']), 'regeneration_reaction':(regen,['Regeneration','Undead']),
   'healing_magic':(heal,['Instant Health','Undead']), 'harming_magic':(harm,['Instant Damage','Undead'])}
  for topic,(answer,titles) in facts.items():
   add(id,topic,answer,titles,'reviewed_rule');counts['effect_rule_answers_added']+=1
  if 'healing' not in runtime[id]['topics']:
   answer=harm if undead else heal
   if undead:answer='For undead healing, use the Instant Damage interaction rather than Instant Health. '+harm
   if id=='minecraft:iron_golem':answer=runtime[id]['topics']['repair']['answer']
   add(id,'healing',answer,['Instant Health','Instant Damage','Undead'],'reviewed_rule');counts['effect_rule_answers_added']+=1
 # Connect a concise general interaction summary where one was previously absent.
 # Reuse connected species facts, not a claim of newly discovered mechanics.
 for id,cap in data['capabilities'].items():
  row=runtime[id]['topics']
  if 'interactions' in row:continue
  parts=[row['diet'],row['counterplay']]
  sources=list(dict.fromkeys(s for p in parts for s in p['sources']))
  row['interactions']={'answer':' '.join(p['answer'] for p in parts),'coverage':'reviewed_capability','sources':sources}
  counts['interaction_summaries_added']+=1
 return counts
