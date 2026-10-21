"""Preserve a broad, resumable Minecraft Wiki text snapshot for offline research.

Inventories every page in game-content and supporting namespaces, rather than
starting from the add-on catalog. Stores complete current revision source,
redirects, templates/modules/data, headings, links, and a full-text search index.
No source text is automatically approved for player-facing answers.
"""
import argparse, datetime, hashlib, json, re, sqlite3, time, urllib.error, urllib.parse, urllib.request, zlib
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
API='https://minecraft.wiki/api.php'
# All game-content namespaces plus documentation, templates, modules, data and categories.
NAMESPACES=[0,4,8,10,12,14,828,9592,10000,10002,10004,10006,10010,10012,10014]
DEFAULT=Path('/workspace/reference/minecraft-wiki/full-archive.sqlite')
SCHEMA='''
CREATE TABLE IF NOT EXISTS inventory(page_id INTEGER PRIMARY KEY,namespace INTEGER NOT NULL,title TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS inventory_title ON inventory(title);
CREATE TABLE IF NOT EXISTS namespace_progress(namespace INTEGER PRIMARY KEY,continuation TEXT,complete INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS articles(page_id INTEGER PRIMARY KEY,title TEXT,namespace INTEGER,revision_id INTEGER,revision_timestamp TEXT,fetched_at TEXT,content_model TEXT,sha256 TEXT,source BLOB,redirect TEXT,headings TEXT,links TEXT);
CREATE TABLE IF NOT EXISTS errors(page_id INTEGER PRIMARY KEY,message TEXT,checked_at TEXT);
CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY,value TEXT);
CREATE VIRTUAL TABLE IF NOT EXISTS article_search USING fts5(title,body,content='');
'''
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def connect(path):
 path.parent.mkdir(parents=True,exist_ok=True)
 db=sqlite3.connect(path,timeout=60);db.executescript(SCHEMA);return db

def request(params):
 params={'format':'json','formatversion':'2','maxlag':'5',**params}
 url=API+'?'+urllib.parse.urlencode(params)
 for attempt in range(5):
  try:
   req=urllib.request.Request(url,headers={'User-Agent':'TimeTrapStudios-AIBot-ReferenceArchive/1.0 (github.com/jokercollison/aibot; offline research)'})
   with urllib.request.urlopen(req,timeout=45) as response:data=json.load(response)
   if 'error' in data:raise RuntimeError(json.dumps(data['error']))
   return data
  except (urllib.error.URLError,TimeoutError,RuntimeError):
   if attempt==4:raise
   time.sleep(min(2**attempt,16))

def metadata(db,key,value):db.execute('INSERT OR REPLACE INTO metadata VALUES(?,?)',(key,json.dumps(value)))

def inventory(db,namespaces):
 for ns in namespaces:
  old=db.execute('SELECT continuation,complete FROM namespace_progress WHERE namespace=?',(ns,)).fetchone()
  if old and old[1]:continue
  continuation=old[0] if old else None
  while True:
   params={'action':'query','list':'allpages','apnamespace':str(ns),'aplimit':'500'}
   if continuation:params['apcontinue']=continuation
   data=request(params)
   if 'allpages' not in data.get('query',{}):raise RuntimeError('API did not supply allpages inventory')
   for row in data['query']['allpages']:
    db.execute('INSERT OR REPLACE INTO inventory VALUES(?,?,?)',(row['pageid'],row['ns'],row['title']))
   continuation=data.get('continue',{}).get('apcontinue')
   db.execute('INSERT OR REPLACE INTO namespace_progress VALUES(?,?,?)',(ns,continuation,int(continuation is None)));db.commit()
   count=db.execute('SELECT COUNT(*) FROM inventory WHERE namespace=?',(ns,)).fetchone()[0]
   print(f'Inventory namespace {ns}: {count} pages'+(' COMPLETE' if continuation is None else ''),flush=True)
   if continuation is None:break
   time.sleep(.15)

def store(db,page):
 revisions=page.get('revisions',[])
 if not revisions:return False
 rev=revisions[0];slot=rev.get('slots',{}).get('main',{});text=slot.get('content')
 if text is None:return False
 page_id=page['pageid']
 if db.execute('SELECT 1 FROM articles WHERE page_id=?',(page_id,)).fetchone():return True
 headings=[{'level':len(m[1]),'heading':m[2].strip(),'offset':m.start()} for m in re.finditer(r'^(={2,6})\s*(.*?)\s*\1\s*$',text,re.M)]
 links=sorted(set(m[1].split('|')[0].split('#')[0].strip() for m in re.finditer(r'\[\[([^\]\n]+)\]\]',text) if m[1].split('|')[0].split('#')[0].strip()))
 redirect=re.match(r'^\s*#redirect\s*\[\[([^\]]+)\]\]',text,re.I)
 db.execute('INSERT INTO articles VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',(page_id,page['title'],page['ns'],rev['revid'],rev.get('timestamp'),now(),slot.get('contentmodel'),hashlib.sha256(text.encode()).hexdigest(),zlib.compress(text.encode(),9),redirect[1] if redirect else None,json.dumps(headings),json.dumps(links)))
 db.execute('INSERT INTO article_search(rowid,title,body) VALUES(?,?,?)',(page_id,page['title'],text));db.execute('DELETE FROM errors WHERE page_id=?',(page_id,));return True

def seed(db,old_path):
 if not old_path.exists():return
 old=sqlite3.connect(old_path);known={r[0]:r[1] for r in db.execute('SELECT page_id,namespace FROM inventory')};count=0
 for pid,title,rid,stamp,text in old.execute('SELECT page_id,title,revision_id,revision_timestamp,wikitext FROM pages'):
  if pid not in known:continue
  page={'pageid':pid,'title':title,'ns':known[pid],'revisions':[{'revid':rid,'timestamp':stamp,'slots':{'main':{'contentmodel':'wikitext','content':text}}}]}
  if store(db,page):count+=1
 db.commit();old.close();print(f'Reused {count} previously cached page revisions',flush=True)

def capture(db,limit=0,workers=4):
 done=0
 with ThreadPoolExecutor(max_workers=workers) as pool:
  while True:
   rows=db.execute('SELECT i.page_id FROM inventory i LEFT JOIN articles a USING(page_id) LEFT JOIN errors e USING(page_id) WHERE a.page_id IS NULL AND e.page_id IS NULL ORDER BY i.page_id LIMIT ?',(50*workers,)).fetchall()
   if not rows or (limit and done>=limit):break
   ids=[r[0] for r in rows]
   if limit:ids=ids[:limit-done]
   batches=[ids[i:i+50] for i in range(0,len(ids),50)]
   def download(batch):
    return request({'action':'query','prop':'revisions','rvprop':'ids|timestamp|content','rvslots':'main','pageids':'|'.join(map(str,batch))})
   # Only independent HTTP reads run concurrently; SQLite writes remain serial.
   futures=[pool.submit(download,batch) for batch in batches]
   for batch,future in zip(batches,futures):
    data=future.result()
    if 'pages' not in data.get('query',{}):raise RuntimeError('API did not supply revision pages')
    supplied=set()
    for page in data['query']['pages']:
     if store(db,page):supplied.add(page['pageid'])
    for pid in set(batch)-supplied:db.execute('INSERT OR REPLACE INTO errors VALUES(?,?,?)',(pid,'Revision missing/hidden/deleted or response truncated; needs retry',now()))
    db.commit();done+=len(batch)
   count=db.execute('SELECT COUNT(*) FROM articles').fetchone()[0];total=db.execute('SELECT COUNT(*) FROM inventory').fetchone()[0]
   print(f'Archived revisions: {count}/{total}',flush=True);time.sleep(.25)

def audit(db,verify=False):
 counts=[]
 for ns,total in db.execute('SELECT namespace,COUNT(*) FROM inventory GROUP BY namespace'):
  archived=db.execute('SELECT COUNT(*) FROM articles WHERE namespace=?',(ns,)).fetchone()[0]
  progress=db.execute('SELECT complete FROM namespace_progress WHERE namespace=?',(ns,)).fetchone()
  counts.append({'namespace':ns,'inventory':total,'archived':archived,'enumeration_complete':bool(progress and progress[0])})
 total=sum(r['inventory'] for r in counts);archived=sum(r['archived'] for r in counts)
 errors=[{'page_id':r[0],'title':r[1],'error':r[2]} for r in db.execute('SELECT e.page_id,i.title,e.message FROM errors e LEFT JOIN inventory i USING(page_id)')]
 hashes=0
 if verify:
  assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
  for body,digest in db.execute('SELECT source,sha256 FROM articles'):
   assert hashlib.sha256(zlib.decompress(body)).hexdigest()==digest;hashes+=1
 return {'generated_at':now(),'source':API,'scope':'Current revision text of all enumerated game-content/support namespaces; no private/user/talk pages, binary media or full revision histories. Not an atomic site snapshot.','namespaces':counts,'inventoried_pages':total,'archived_revisions':archived,'complete_for_selected_namespaces':bool(counts) and all(r['enumeration_complete'] for r in counts) and archived==total and not errors,'missing_revision_count':total-archived,'errors':errors,'verified_content_hashes':hashes,'cached_articles_are_not_runtime_answers':True}

def search(db,query):
 for pid,title in db.execute('SELECT a.page_id,a.title FROM article_search s JOIN articles a ON a.page_id=s.rowid WHERE article_search MATCH ? ORDER BY rank LIMIT 30',(query,)):
  print(json.dumps({'page_id':pid,'title':title},ensure_ascii=False))

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--database',type=Path,default=DEFAULT);p.add_argument('--namespaces',default=','.join(map(str,NAMESPACES)));p.add_argument('--limit',type=int,default=0);p.add_argument('--search');p.add_argument('--show');p.add_argument('--section');p.add_argument('--inventory-only',action='store_true');p.add_argument('--audit-only',action='store_true');p.add_argument('--verify',action='store_true');p.add_argument('--retry-errors',action='store_true');p.add_argument('--report',type=Path,default=Path('/workspace/aibot/docs/WIKI_ARCHIVE_STATUS.json'));args=p.parse_args();db=connect(args.database)
 if args.search is not None:search(db,args.search);return
 if args.show is not None:
  row=db.execute('SELECT revision_id,revision_timestamp,source,redirect FROM articles WHERE title=?',(args.show,)).fetchone()
  if not row:raise SystemExit('Article not found; use --search.')
  text=zlib.decompress(row[2]).decode()
  print(json.dumps({'title':args.show,'revision':row[0],'timestamp':row[1],'redirect':row[3]}))
  if args.section:
   matches=list(re.finditer(r'^(={2,6})\s*(.*?)\s*\1\s*$',text,re.M));found=False
   for i,m in enumerate(matches):
    if args.section.casefold() in m[2].casefold():
     end=next((n.start() for n in matches[i+1:] if len(n[1])<=len(m[1])),len(text));print(text[m.start():end]);found=True
   if not found:raise SystemExit('No matching heading in this article.')
  else:print(text)
  return
 if not args.audit_only:
  metadata(db,'source',API);metadata(db,'license_notice','Minecraft Wiki text currently lists CC BY-NC-SA 3.0 unless otherwise specified. Preserve article attribution/revision URLs. Research archive, not game content.');metadata(db,'started_at',now());db.commit()
  inventory(db,[int(n) for n in args.namespaces.split(',')])
  if not args.inventory_only:
   seed(db,args.database.parent/'reference.sqlite')
   if args.retry_errors:db.execute('DELETE FROM errors');db.commit()
   capture(db,args.limit)
 result=audit(db,args.verify);args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2));db.close()
if __name__=='__main__':main()
