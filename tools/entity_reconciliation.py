"""Reconcile wiki entity pages against the sample catalog, without adding mobs.
Classification is evidence bookkeeping, not complete gameplay interpretation.
"""
import json,re,sqlite3,zlib,argparse,collections
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
GROUPS={
 'java_only':set('Minecart with Furnace|Giant|Minecart with Monster Spawner|Spectral Arrow|Illusioner|Marker|Display|Interaction|Mannequin'.split('|')),
 'joke_snapshot':set('Pink Wither|Obsidian Boat|Diamond Chicken|Redstone Bug|Nerd Creeper|Love Golem|Smiling Creeper|Moon Cow|Ray Tracing (mob)|Batato|Toxifin Slab|Plaguewhale Slab|Mega Spud|Poisonous Potato Zombie|Angry Ghast|Spectator Villager|Spectator Witch|Warden (April Fools\' joke)|Stencil Display|Crafting Grid|Hovering Item|Living Block'.split('|')),
 'proposed_or_scrapped':set('Vulture|Moobloom|Iceologer|Termite|Ostrich|Meerkat|Wildfire|Barnacle|The Great Hunger|Glare|Firefly (mob)|Rascal|Tuff Golem|Crab|Penguin'.split('|')),
 'removed_or_unreleased_legacy':set('Mob (entity)|Monster (entity)|MD3 Test Mob|Builder|Villager (old)|Zombie Villager (old)'.split('|')),
 'future_not_target_version':{'Frostbite','Ice Ball','Blub'},
 'bedrock_reference_gap':{'Painting','Item (entity)','Falling Block','Elder Guardian Ghost'},
 'bedrock_editor_only':{'Map Marker'},
 'education_feature':{'Balloon'},
 'china_edition':{'Pet (China Edition)'},
 'marketplace_custom_content':{'Ben 10'},
 'composite_or_role':set('Spider Jockey|Chicken Jockey|Strider Jockey|Ravager Jockey|Hoglin Jockey|Baby Strider Jockey|Raid captain'.split('|')),
 'related_item_or_block_page':{'Fire Charge','Dragon Egg','Lead','Anvil','Tipped Arrow'},
}
NOTES={
 'bedrock_reference_gap':'Not a separately mapped catalog subject; add reviewed gameplay topics or explicit technical-subject handling.',
 'composite_or_role':'Combination or role of existing entities, not a new species. Rider and mount have separate health and loot. Bedrock/version rules need per-topic checks.',
 'future_not_target_version':'Archived page marks planned or in-development content. Do not offer future spawning rules as current 1.26.52 advice.',
 'java_only':'Not an ordinary Bedrock entity; retain reference so Java behavior is not imported as Bedrock advice.',
 'education_feature':'Requires Education-related features; do not present as ordinary Survival content.',
 'bedrock_editor_only':'Only available through Bedrock Editor, not ordinary Survival spawning.',
 'related_item_or_block_page':'Overlaps a block/item or projectile topic; presence of an entity infobox is not a new mob.',
}
def build(path):
 inventory=json.loads((ROOT/'docs/WIKI_ENTITY_RECONCILIATION.json').read_text())
 subjects=json.loads((ROOT/'data/entities/subjects.json').read_text())['subjects']
 mapped=collections.defaultdict(list)
 for key,row in subjects.items():mapped[row['wiki']['title']].append(key)
 db=sqlite3.connect('file:'+str(path)+'?mode=ro',uri=True);rows=[]
 for entry in inventory['pages']:
  title=entry['title'];source=db.execute('SELECT page_id,revision_id,sha256,source FROM articles WHERE title=?',(title,)).fetchone()
  assert source is not None,title
  intro=re.split(r'^==[^=]',zlib.decompress(source[3]).decode(),maxsplit=1,flags=re.M)[0]
  category='mapped_catalog' if title in mapped else next((k for k,v in GROUPS.items() if title in v),None)
  if title.startswith('Pet ') and '25w14craftmine' in intro:category='joke_snapshot'
  category=category or 'pending_classification'
  rows.append({'title':title,'page_id':source[0],'revision_id':source[1],'sha256':source[2],'source':'https://minecraft.wiki/w/Special:PermanentLink/'+str(source[1]),'classification':category,'catalog_ids':mapped[title],'note':NOTES.get(category,'Reference retained; classification does not establish complete topic coverage.'),'gameplay_complete':False})
 report={'scope':'All preserved main-namespace entity-infobox pages in the reconciliation inventory; not a claim that all wiki gameplay subjects use infoboxes.','target_game_version':'1.26.52','counts':dict(collections.Counter(r['classification'] for r in rows)),'pages':rows,'complete_gameplay_knowledge':False}
 (ROOT/'docs/ENTITY_WIKI_CLASSIFICATION.json').write_text(json.dumps(report,indent=2)+'\n')
 print('Wiki entity classification:',report['counts'])
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--db',type=Path,default=Path('/workspace/reference/minecraft-wiki/full-archive.sqlite'));args=parser.parse_args();build(args.db)
