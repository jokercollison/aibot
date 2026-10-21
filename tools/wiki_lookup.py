"""Read-only, network-free search/read interface for preserved wiki databases."""
import argparse,json,sqlite3,zlib
from pathlib import Path
from urllib.parse import quote
BASE=Path('/workspace/reference/minecraft-wiki')
def connect(path):
 if not path.is_file():raise FileNotFoundError('Restore the offline database first: '+str(path))
 return sqlite3.connect('file:'+quote(str(path.resolve()),safe='/')+'?mode=ro',uri=True)
def search(db,source,query,limit):
 if source=='wiki':
  sql='SELECT a.title,a.revision_id,a.revision_timestamp FROM article_search s JOIN articles a ON a.page_id=s.rowid WHERE article_search MATCH ? ORDER BY rank LIMIT ?'
  return [{'source':source,'title':r[0],'revision':r[1],'revision_timestamp':r[2]} for r in db.execute(sql,(query,limit))]
 sql='SELECT e.title,e.path FROM zim_search s JOIN entries e ON e.entry_id=s.rowid WHERE zim_search MATCH ? ORDER BY rank LIMIT ?'
 return [{'source':source,'title':r[0],'path':r[1]} for r in db.execute(sql,(query,limit))]
def read(db,source,title):
 seen=set();target=title
 for _ in range(20):
  if target in seen:raise ValueError('Redirect loop in cached source')
  seen.add(target)
  if source=='wiki':
   r=db.execute('SELECT title,revision_id,revision_timestamp,source,redirect FROM articles WHERE title=?',(target,)).fetchone()
   if r is None:return None
   if r[4]:target=r[4].split('#')[0];continue
   return {'source':source,'title':r[0],'revision':r[1],'revision_timestamp':r[2],'text':zlib.decompress(r[3]).decode()}
  r=db.execute("SELECT title,path,readable_text,redirect FROM entries WHERE path=? OR title=? ORDER BY (mimetype LIKE '%html%') DESC,readable_text IS NOT NULL DESC LIMIT 1",(target,target)).fetchone()
  if r is None:return None
  if r[3]:target=r[3];continue
  if r[2] is None:return None
  return {'source':source,'title':r[0],'path':r[1],'text':zlib.decompress(r[2]).decode()}
 raise ValueError('Too many cached redirects')
def main():
 p=argparse.ArgumentParser(description=__doc__);g=p.add_mutually_exclusive_group(required=True);g.add_argument('--search');g.add_argument('--show');p.add_argument('--source',choices=['wiki','zim','both'],default='both');p.add_argument('--limit',type=int,default=10);p.add_argument('--contains',help='When reading, show passages containing this phrase');p.add_argument('--context',type=int,default=1200);p.add_argument('--wiki-database',type=Path,default=BASE/'full-archive.sqlite');p.add_argument('--zim-database',type=Path,default=BASE/'zim-archive.sqlite');args=p.parse_args()
 available=0
 for source,path in [('wiki',args.wiki_database),('zim',args.zim_database)]:
  if args.source not in ('both',source):continue
  if not path.exists():continue
  available+=1;db=connect(path)
  if args.search is not None:
   for row in search(db,source,args.search,args.limit):print(json.dumps(row,ensure_ascii=False))
  else:
   row=read(db,source,args.show)
   if row:
    text=row.pop('text');print(json.dumps(row,ensure_ascii=False))
    if args.contains:
     needle=args.contains.casefold();folded=text.casefold();start=0;found=0
     while found<8:
      position=folded.find(needle,start)
      if position<0:break
      print(text[max(0,position-args.context):position+len(needle)+args.context]);found+=1;start=position+len(needle)
     if not found:print('No matching passage in this saved article.')
    else:print(text)
  db.close()
 if not available:raise SystemExit('No offline databases found. Restore the backups described in research/wiki-archive/README.md.')
if __name__=='__main__':main()
