"""Preserve small behavior classifications from archived entity infoboxes.
Classifications support basic safety replies, not detailed AI or combat rules.
"""
import argparse,json,re,sqlite3,zlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def main(db_path):
 db=sqlite3.connect('file:'+str(db_path)+'?mode=ro',uri=True);subjects=json.loads((ROOT/'data/entities/subjects.json').read_text())['subjects'];result={}
 for key,row in subjects.items():
  if row['category']!='mob':continue
  text=zlib.decompress(db.execute('SELECT source FROM articles WHERE page_id=?',(row['wiki']['page_id'],)).fetchone()[0]).decode()
  intro=re.split(r'^==[^=]',text,maxsplit=1,flags=re.M)[0]
  m=re.search(r'^\|\s*behavior\s*=\s*([\s\S]*?)(?=^\|\s*\w+\s*=|^}})',intro,re.M|re.I)
  if not m:continue
  kinds=sorted({word.lower() for word in re.findall(r'\b(?:Passive|Neutral|Hostile)\b',m[1],re.I)})
  if kinds:result[key]={'classifications':kinds,'source':row['wiki']['url'],'revision_id':row['wiki']['revision_id'],'coverage':'basic_classification_not_complete_combat'}
 (ROOT/'data/entities/behavior_evidence.json').write_text(json.dumps(result,indent=2)+'\n');print('Behavior classifications:',len(result))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--db',type=Path,default=Path('/workspace/reference/minecraft-wiki/full-archive.sqlite'));main(p.parse_args().db)
