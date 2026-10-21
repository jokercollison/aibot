"""Development-only, resumable MediaWiki reference cache. Never a runtime article bundle.

Fetch through the public API in batches, cache revisions and section boundaries,
map every catalog record (including biomes), and report unresolved page mappings.
Raw article text is reference material, NOT an automatically approved game fact.
"""
import argparse, datetime, hashlib, json, re, sqlite3, time, urllib.parse, urllib.request
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
API = 'https://minecraft.wiki/api.php'
SCHEMA = '''
CREATE TABLE IF NOT EXISTS pages(title TEXT PRIMARY KEY, page_id INTEGER, revision_id INTEGER,
 revision_timestamp TEXT, fetched_at TEXT, url TEXT, sha256 TEXT, wikitext TEXT);
CREATE TABLE IF NOT EXISTS mappings(requested_title TEXT PRIMARY KEY, canonical_title TEXT, status TEXT, checked_at TEXT);
CREATE TABLE IF NOT EXISTS subjects(subject_id TEXT PRIMARY KEY, minecraft_id TEXT, kind TEXT, name TEXT, requested_title TEXT);
CREATE TABLE IF NOT EXISTS sections(title TEXT, ordinal INTEGER, heading TEXT, level INTEGER, body TEXT, PRIMARY KEY(title,ordinal));
CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY,value TEXT);
'''
def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
def connect(path):
    path.parent.mkdir(parents=True, exist_ok=True)
    db=sqlite3.connect(path);db.executescript(SCHEMA)
    return db

def ingest(db, requested, response):
    """Store API evidence and resolve normalized names/redirects without inventing pages."""
    query=response.get('query',{}); aliases={}
    for key in ('normalized','converted','redirects'):
        for row in query.get(key,[]): aliases[row['from']]=row['to']
    pages={p['title']:p for p in query.get('pages',[])}
    stamp=now()
    for title in requested:
        target=title;seen=set()
        while target in aliases and target not in seen:seen.add(target);target=aliases[target]
        page=pages.get(target,{})
        revision=(page.get('revisions') or [{}])[0]
        text=revision.get('slots',{}).get('main',{}).get('content')
        status='missing' if page.get('missing') else 'fetched' if text is not None else 'unresolved'
        db.execute('INSERT OR REPLACE INTO mappings VALUES(?,?,?,?)',(title,target,status,stamp))
        if status!='fetched':continue
        url='https://minecraft.wiki/w/'+urllib.parse.quote(target.replace(' ','_'),safe='/:')
        db.execute('INSERT OR REPLACE INTO pages VALUES(?,?,?,?,?,?,?,?)',(target,page.get('pageid'),revision.get('revid'),revision.get('timestamp'),stamp,url,hashlib.sha256(text.encode()).hexdigest(),text))
        db.execute('DELETE FROM sections WHERE title=?',(target,))
        headings=list(re.finditer(r'^(={2,6})\s*(.*?)\s*\1\s*$',text,re.M))
        chunks=[('Introduction',0,0,headings[0].start() if headings else len(text))]
        for i,h in enumerate(headings):chunks.append((h[2],len(h[1]),h.end(),headings[i+1].start() if i+1<len(headings) else len(text)))
        for i,(heading,level,start,end) in enumerate(chunks):
            db.execute('INSERT INTO sections VALUES(?,?,?,?,?)',(target,i,heading,level,text[start:end].strip()))
    db.commit()

def fetch(titles):
    params={'action':'query','prop':'revisions','rvprop':'ids|timestamp|content','rvslots':'main','redirects':'1','format':'json','formatversion':'2','maxlag':'5','titles':'|'.join(titles)}
    url=API+'?'+urllib.parse.urlencode(params)
    for attempt in range(4):
        try:
            request=urllib.request.Request(url,headers={'User-Agent':'TimeTrapStudios-AIBot-Research/0.1 (development reference cache; github.com/jokercollison/aibot)'})
            with urllib.request.urlopen(request,timeout=45) as f: data=json.load(f)
            if 'error' in data:raise RuntimeError(str(data['error']))
            return data
        except Exception:
            if attempt==3:raise
            time.sleep(2**attempt)

def report(db):
    statuses=dict(db.execute('SELECT status,COUNT(*) FROM mappings GROUP BY status'))
    missing=[dict(zip(('subject_id','title','status'),r)) for r in db.execute("SELECT s.subject_id,s.requested_title,COALESCE(m.status,'not_fetched') FROM subjects s LEFT JOIN mappings m USING(requested_title) WHERE COALESCE(m.status,'not_fetched')!='fetched' ORDER BY s.subject_id")]
    return {'generated_at':now(),'source':API,'scope':'Development reference only. Articles contain mixed editions, historical and future information. Page retrieval does not certify any gameplay topic.','license_notice':'Wiki currently lists CC BY-NC-SA 3.0; retain source metadata. No article text is included in this report or the game bundle.','subject_count':db.execute('SELECT COUNT(*) FROM subjects').fetchone()[0],'subject_kinds':dict(db.execute('SELECT kind,COUNT(*) FROM subjects GROUP BY kind')),'unique_pages':db.execute('SELECT COUNT(*) FROM pages').fetchone()[0],'requested_title_statuses':statuses,'mapped_subject_count':db.execute("SELECT COUNT(*) FROM subjects s JOIN mappings m USING(requested_title) WHERE m.status='fetched'").fetchone()[0],'reviewed_gameplay_facts':0,'review_note':'This cache does not auto-approve facts; separately reviewed runtime answers live in data/location_facts.json and data/facts.json.','unresolved_subjects':missing}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--database',type=Path,default=Path('/workspace/reference/minecraft-wiki/reference.sqlite'));p.add_argument('--limit',type=int,default=0);p.add_argument('--refresh',action='store_true');p.add_argument('--search',help='Search locally cached article titles without network access');p.add_argument('--show',help='Read a cached article by exact canonical title without network access');p.add_argument('--report',type=Path,default=ROOT/'docs/WIKI_REFERENCE_COVERAGE.json');args=p.parse_args()
    db=connect(args.database)
    if args.search is not None:
        for row in db.execute('SELECT title,revision_id,url FROM pages WHERE title LIKE ? ORDER BY title LIMIT 100',('%'+args.search+'%',)):
            print(json.dumps(dict(zip(('title','revision_id','url'),row))))
        db.close();return
    if args.show is not None:
        row=db.execute('SELECT url,revision_id,revision_timestamp,wikitext FROM pages WHERE title=?',(args.show,)).fetchone()
        if row is None:raise SystemExit('No cached article with that exact title; use --search.')
        print(json.dumps(dict(zip(('url','revision_id','revision_timestamp'),row[:3]))));print(row[3]);db.close();return
    records=json.loads((ROOT/'data/catalog.json').read_text())['records']
    for key,row in records.items():
        db.execute('INSERT OR REPLACE INTO subjects VALUES(?,?,?,?,?)',(key,row['minecraft_id'],row['kind'],row['name'],row['name'].replace('_',' ')))
    # Explicit display-name corrections; API redirects still verify target existence.
    corrections={
      'Azalea Leaves Flowered':'Flowering Azalea Leaves','Dirt With Roots':'Rooted Dirt',
      'End Brick Stairs':'End Stone Brick Stairs','Silver Glazed Terracotta':'Light Gray Glazed Terracotta',
      'Small Dripleaf Block':'Small Dripleaf','Snow Layer':'Snow','Stonecutter Block':'Stonecutter',
      'Undyed Shulker Box':'Shulker Box','Underwater Tnt':'Underwater TNT',
      'Trip Wire':'Tripwire','Daylight Detector Inverted':'Daylight Detector',
      'Flint And Steel':'Flint and Steel','Heart Of The Sea':'Heart of the Sea',
      'Totem Of Undying':'Totem of Undying','Bane Of Arthropods':'Bane of Arthropods',
      'Bow Infinity':'Infinity','Tnt Minecart':'Minecart with TNT',
      'muttonCooked':'Cooked Mutton','muttonRaw':'Raw Mutton',
      'Villager V2':'Villager','Zombie Villager V2':'Zombie Villager',
      'Evocation Illager':'Evoker','Xp Orb':'Experience','Xp Bottle':"Bottle o' Enchanting",
      'Fireworks Rocket':'Firework Rocket','Fishing Hook':'Fishing Bobber',
      'Eye Of Ender Signal':'Eye of Ender','Darkoak Standing Sign':'Dark Oak Sign',
      'Darkoak Wall Sign':'Dark Oak Sign',
    }
    for before,after in corrections.items():
        db.execute('UPDATE subjects SET requested_title=? WHERE name=?',(after,before))
    db.commit()
    # General mechanics are independent pages, not registry identifiers.
    general=['Biome','Ore','Mob','Block','Item','Crafting','Smelting','Brewing','Trading','Enchanting','Mining','Altitude','Structure','Spawn','Taming','Breeding','Tutorial:Mining']
    requested=sorted({r[0] for r in db.execute('SELECT DISTINCT requested_title FROM subjects')}|set(general))
    if not args.refresh:
        cached={r[0] for r in db.execute('SELECT requested_title FROM mappings')};requested=[t for t in requested if t not in cached]
    if args.limit:requested=requested[:args.limit]
    db.execute('INSERT OR REPLACE INTO metadata VALUES(?,?)',('source',API));db.commit()
    for start in range(0,len(requested),25):
        batch=requested[start:start+25];ingest(db,batch,fetch(batch))
        print(f'Reference titles processed: {min(start+25,len(requested))}/{len(requested)}',flush=True)
        time.sleep(.25)
    result=report(db);args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k!='unresolved_subjects'},indent=2));db.close()
if __name__=='__main__':main()
