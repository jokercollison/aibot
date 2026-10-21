"""Inspect/import a local ZIM into a searchable, development-only SQLite archive.
Requires libzim==3.13.1; the Minecraft add-on does not use this dependency.
The original ZIM remains unchanged. HTML and readable table text are preserved;
binary media remain in the original ZIM instead of inflating the research index.
"""
import argparse, hashlib, json, sqlite3, zlib
from html.parser import HTMLParser
from pathlib import Path
from email.message import Message

class ReadableHTML(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.parts=[];self.hidden=0
 def handle_starttag(self,tag,attrs):
  if tag in ('script','style','noscript'):self.hidden+=1
  if not self.hidden:
   if tag in ('p','div','section','h1','h2','h3','h4','h5','h6','tr','li','br','table'):self.parts.append('\n')
   elif tag in ('td','th'):self.parts.append('\t')
 def handle_endtag(self,tag):
  if tag in ('script','style','noscript') and self.hidden:self.hidden-=1
  elif not self.hidden and tag in ('p','div','section','tr','li','table'):self.parts.append('\n')
 def handle_data(self,text):
  if not self.hidden:self.parts.append(text)
 def text(self):return '\n'.join(line.strip() for line in ''.join(self.parts).splitlines() if line.strip())

def decode_text(raw,mimetype):
 message=Message();message['Content-Type']=mimetype
 encoding=message.get_content_charset('utf-8')
 try:return raw.decode(encoding,errors='replace')
 except LookupError:return raw.decode('utf-8',errors='replace')

def readable_html(text):
 # Native HTML parsing accelerates a full ZIM; the standard-library fallback
 # remains available. Neither parser executes scripts or loads linked resources.
 try:from lxml import html
 except ImportError:
  parser=ReadableHTML();parser.feed(text);return parser.text()
 try:
  document=html.fromstring(text,parser=html.HTMLParser(no_network=True,recover=True))
 except (ValueError,html.etree.ParserError):return ''
 for node in document.xpath('//script|//style|//noscript'):node.drop_tree()
 for node in document.iter():
  if node.tag in ('td','th'):node.text='\t'+(node.text or '')
  elif node.tag in ('p','div','section','h1','h2','h3','h4','h5','h6','tr','li','br','table'):
   node.text='\n'+(node.text or '');node.tail='\n'+(node.tail or '')
 return '\n'.join(line.strip() for line in ''.join(document.itertext()).splitlines() if line.strip())

def inspect(archive):
 metadata={}
 for key in archive.metadata_keys:
  try:
   raw=bytes(archive.get_metadata(key));mime=archive.get_metadata_item(key).mimetype
   if mime.startswith('text/') or mime in ('application/json','application/xml'):metadata[key]=raw.decode('utf-8',errors='replace')
   else:metadata[key]={'mimetype':mime,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
  except Exception as exc:metadata[key]={'error':str(exc)}
 return {'uuid':str(archive.uuid),'bytes':archive.filesize,'articles':archive.article_count,'user_entries':archive.entry_count,'all_entries':archive.all_entry_count,'metadata':metadata,'has_checksum':archive.has_checksum}

def connect_database(path):
 path.parent.mkdir(parents=True,exist_ok=True);db=sqlite3.connect(path)
 schema="CREATE TABLE IF NOT EXISTS entries(entry_id INTEGER PRIMARY KEY,path TEXT,title TEXT,mimetype TEXT,redirect TEXT,sha256 TEXT,source BLOB,readable_text BLOB);"
 db.executescript("CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY,value TEXT);"+schema+"CREATE VIRTUAL TABLE IF NOT EXISTS zim_search USING fts5(title,body,content='');")
 # ZIM internal metadata can share a path with a public article (e.g. Counter).
 # Entry IDs remain distinct; path alone must never be treated as unique.
 if any(row[2] for row in db.execute('PRAGMA index_list(entries)')):
  db.executescript('ALTER TABLE entries RENAME TO old_unique_entries;'+schema+'INSERT INTO entries SELECT * FROM old_unique_entries;DROP TABLE old_unique_entries;')
 db.execute('CREATE INDEX IF NOT EXISTS entries_path ON entries(path)');db.execute('CREATE INDEX IF NOT EXISTS entries_title ON entries(title)');db.commit();return db

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('zim',type=Path);p.add_argument('--database',type=Path,default=Path('/workspace/reference/minecraft-wiki/zim-archive.sqlite'));p.add_argument('--inspect',action='store_true');p.add_argument('--verify',action='store_true');p.add_argument('--limit',type=int,default=0);args=p.parse_args()
 try:from libzim.reader import Archive
 except ImportError:raise SystemExit('Install research-only tools: python -m pip install --target /workspace/reference/zim-tools libzim==3.13.1; then set PYTHONPATH=/workspace/reference/zim-tools')
 archive=Archive(args.zim);info=inspect(archive)
 if args.verify:
  if not archive.check():raise SystemExit('ZIM checksum verification failed; file may be incomplete.')
  info['checksum_verified']=True
 print(json.dumps(info,indent=2,ensure_ascii=False),flush=True)
 if args.inspect:return
 db=connect_database(args.database)
 old=db.execute("SELECT value FROM metadata WHERE key='zim_uuid'").fetchone()
 if old and json.loads(old[0])!=info['uuid']:raise SystemExit('Database belongs to another ZIM snapshot. Use a different --database path.')
 for key,value in info.items():db.execute('INSERT OR REPLACE INTO metadata VALUES(?,?)',(key,json.dumps(value)))
 db.execute('INSERT OR REPLACE INTO metadata VALUES(?,?)',('zim_uuid',json.dumps(info['uuid'])));db.commit()
 done={r[0] for r in db.execute('SELECT entry_id FROM entries')};stored=0
 for idx in range(archive.all_entry_count):
  if idx in done:continue
  entry=archive._get_entry_by_id(idx) # Version-pinned libzim's index enumeration API.
  if entry.is_redirect:
   db.execute('INSERT INTO entries VALUES(?,?,?,?,?,?,?,?)',(idx,entry.path,entry.title,None,entry.get_redirect_entry().path,None,None,None))
  else:
   item=entry.get_item();mime=item.mimetype
   if not (mime.startswith('text/') or mime in ('application/json','application/xml','application/xhtml+xml')):continue
   raw=bytes(item.content);text=decode_text(raw,mime)
   if 'html' in mime:
    readable=readable_html(text)
   else:readable=text
   db.execute('INSERT INTO entries VALUES(?,?,?,?,?,?,?,?)',(idx,entry.path,entry.title,mime,None,hashlib.sha256(raw).hexdigest(),zlib.compress(raw,6),zlib.compress(readable.encode(),6)))
   if idx<archive.entry_count and mime not in ('text/css','text/javascript','application/javascript'):
    db.execute('INSERT INTO zim_search(rowid,title,body) VALUES(?,?,?)',(idx,entry.title,readable))
  stored+=1
  if stored%500==0:db.commit();print(f'Indexed {stored} additional text/redirect entries; scanned {idx+1}/{archive.all_entry_count}',flush=True)
  if args.limit and stored>=args.limit:break
 db.execute('INSERT OR REPLACE INTO metadata VALUES(?,?)',('entry_scan_complete',json.dumps(not args.limit or stored<args.limit or idx+1==archive.all_entry_count)))
 db.commit();print('Archive integrity:',db.execute('PRAGMA integrity_check').fetchone()[0]);print('Saved entries:',db.execute('SELECT COUNT(*) FROM entries').fetchone()[0]);db.close()
if __name__=='__main__':main()
