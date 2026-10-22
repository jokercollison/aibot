"""Extract possible selected offers from pinned standard Bedrock economy tables.

Inventory summaries are component-backed, not fixed-price promises. Random
selection is retained in wording; experiments and restocking prices are separate.
"""
from pathlib import Path
import hashlib,json,sys
from entity_evidence import read_jsonc
from entity_topics import LABELS
ROOT=Path(__file__).resolve().parents[1]
PROFILES={'armorer':'armorer','butcher':'butcher','cartographer':'cartographer','cleric':'cleric','farmer':'farmer','fisherman':'fisherman','fletcher':'fletcher','leatherworker':'leather_worker','librarian':'librarian','mason':'stone_mason','shepherd':'shepherd','toolsmith':'tool_smith','weaponsmith':'weapon_smith','wandering trader':'wandering_trader'}
LEVELS=['novice','apprentice','journeyman','expert','master']
def item_name(item):
 parts=item['item'].removeprefix('minecraft:').split(':');value=parts[0];meta=parts[1] if len(parts)>1 else None
 special={('dye','0'):'ink sac',('dye','4'):'lapis lazuli',('bucket','2'):'bucket of cod',('bucket','10'):'lava bucket',('potion','0'):'water bottle',('potion','8'):'Invisibility potion'}
 if (value,meta) in special:return special[(value,meta)]
 if value=='banner' and meta is not None:
  colors=['black','red','green','brown','blue','purple','cyan','light gray','gray','pink','lime','yellow','light blue','magenta','orange','white'];return colors[int(meta)]+' banner'
 value={'muttonraw':'mutton','muttoncooked':'cooked mutton','emptymap':'empty map'}.get(value,value)
 functions=item.get('functions',[])
 if any(f.get('function')=='enchant_book_for_trading' for f in functions):return 'enchanted book'
 for f in functions:
  if f.get('function')=='exploration_map':
   dest=f.get('destination','');names={'mansion':'woodland explorer map','monument':'ocean explorer map','trial_chambers':'trial explorer map','swamp_hut':'swamp explorer map','jungle_temple':'jungle explorer map'}
   return names.get(dest,(dest.removeprefix('village_').replace('_',' ')+' village map') if dest.startswith('village_') else 'exploration map')
 name=LABELS.get(value,value.replace('_',' '))
 if value=='enchanted_book':name='enchanted book'
 if any(f.get('function') in ['enchant_with_levels','specific_enchants','enchant_randomly'] for f in functions):name='enchanted '+name
 return name

def flatten(entries):
 result=[]
 for entry in entries:
  if 'item' in entry:result.append(entry)
  else:
   assert set(entry)=={'choice'},entry
   result.extend(flatten(entry['choice']))
 return result

def compile_inventory(reference_root=Path('/workspace/reference/bedrock-samples')):
 if not (reference_root/'behavior_pack/trading/economy_trades/armorer_trades.json').exists():
  payload=(ROOT/'data/entities/trade_inventory.json').read_bytes()
  audit=json.loads((ROOT/'docs/ENTITY_TRADE_INVENTORY_AUDIT.json').read_text())
  assert hashlib.sha256(payload).hexdigest()==audit['runtime_sha256'],'Cached trade inventory hash mismatch'
  assert set(json.loads(payload))==set(PROFILES),'Cached trade profiles mismatch'
  assert audit['sample_commit']==json.loads((ROOT/'data/entities/sample_evidence.json').read_text())['commit'],'Cached sample revision mismatch'
  print('Using checked-in verified standard trade inventory; pinned source files are not present.')
  return
 samples=json.loads((ROOT/'data/entities/sample_evidence.json').read_text());result={};evidence={}
 for profession,file in PROFILES.items():
  relative=f'behavior_pack/trading/economy_trades/{file}_trades.json';path=reference_root/relative
  table=read_jsonc(path);tiers=table['tiers'];assert len(tiers)==(1 if profession=='wandering trader' else 5),(profession,len(tiers))
  source=f'https://github.com/Mojang/bedrock-samples/blob/{samples["commit"]}/{relative}'
  levels={}
  for level,tier in zip(['rotating'] if profession=='wandering trader' else LEVELS,tiers):
   buys=set();sells=set();extras=set();trade_count=0
   for group in tier['groups']:
    if 'num_to_select' in group:assert isinstance(group['num_to_select'],int) and (group['num_to_select']==-1 or 0<group['num_to_select']<=len(group['trades'])),profession
    for trade in group['trades']:
     trade_count+=1;wants=flatten(trade['wants']);gives=flatten(trade['gives'])
     assert all('item' in i for i in wants+gives),profession
     if any(i['item'].split(':')[1]=='emerald' for i in gives):buys.update(item_name(i) for i in wants if i['item'].split(':')[1]!='emerald')
     if any(i['item'].split(':')[1]=='emerald' for i in wants):
      sells.update(item_name(i) for i in gives);extras.update(item_name(i) for i in wants if i['item'].split(':')[1]!='emerald')
   parts=[f'Possible {level} {profession} offers, chosen from its available trade groups:']
   if buys:parts.append('Buys: '+', '.join(sorted(buys))+'.')
   if sells:parts.append('Sells: '+', '.join(sorted(sells))+'.')
   if extras:parts.append('Some offers also require: '+', '.join(sorted(extras))+'.')
   parts.append('An individual trader may not offer every listed item. Prices and available uses can change; some offers depend on world settings.')
   levels[level]={'answer':' '.join(parts),'coverage':'sample_trade_inventory','sources':[source]}
   evidence[profession+':'+level]={'groups':len(tier['groups']),'candidate_trades':trade_count,'buys':sorted(buys),'sells':sorted(sells),'additional_inputs':sorted(extras)}
  result[profession]=levels
 report={'scope':'Possible item inventories by profession/level from pinned standard economy trade tables; not fixed prices or guaranteed selections.','sample_commit':samples['commit'],'profiles':len(result),'villager_professions':13,'wandering_trader_profiles':1,'tiers':sum(len(v) for v in result.values()),'complete_price_simulation':False,'table_sha256':{profession:hashlib.sha256((reference_root/f'behavior_pack/trading/economy_trades/{file}_trades.json').read_bytes()).hexdigest() for profession,file in PROFILES.items()},'evidence':evidence}
 (ROOT/'data/entities/trade_inventory.json').write_text(json.dumps(result,indent=2)+'\n')
 report['runtime_sha256']=hashlib.sha256((ROOT/'data/entities/trade_inventory.json').read_bytes()).hexdigest()
 (ROOT/'docs/ENTITY_TRADE_INVENTORY_AUDIT.json').write_text(json.dumps(report,indent=2)+'\n')
 print(f'Standard trades: 13 villager professions plus wandering trader; {report["tiers"]} inventory summaries')
if __name__=='__main__':compile_inventory()
