"""Create/restore verified portable SQLite archive backups without wiki access.

Compressed parts remain below GitHub's individual-file limit. Restoration verifies
part hashes and the database hash before checking SQLite integrity. No network is
used; the restored database lives outside the game source/build inputs.
"""
import argparse,gzip,hashlib,json,os,sqlite3,tempfile
from pathlib import Path
PART_BYTES=24*1024*1024

def digest(path):
 h=hashlib.sha256()
 with path.open('rb') as f:
  for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
 return h.hexdigest()

def create(database,output):
 output.mkdir(parents=True,exist_ok=False)
 # SQLite backup API yields a consistent snapshot even if a reader is active.
 with tempfile.TemporaryDirectory(prefix='wiki-backup-') as temp:
  snap=Path(temp)/'archive.sqlite';src=sqlite3.connect(database);dest=sqlite3.connect(snap);src.backup(dest);src.close()
  assert dest.execute('PRAGMA integrity_check').fetchone()[0]=='ok';dest.close()
  compressed=Path(temp)/'archive.sqlite.gz'
  with snap.open('rb') as inp,compressed.open('wb') as raw,gzip.GzipFile(fileobj=raw,mode='wb',mtime=0,compresslevel=6) as out:
   for block in iter(lambda:inp.read(1024*1024),b''):out.write(block)
  parts=[]
  with compressed.open('rb') as f:
   while block:=f.read(PART_BYTES):
    path=output/f'part-{len(parts)+1:04d}.bin';path.write_bytes(block);parts.append({'name':path.name,'bytes':len(block),'sha256':hashlib.sha256(block).hexdigest()})
  manifest={'format':'tts-wiki-sqlite-gzip-parts-v1','database_bytes':snap.stat().st_size,'database_sha256':digest(snap),'compressed_bytes':compressed.stat().st_size,'parts':parts,'source':'https://minecraft.wiki/','scope':'Development/research reference; never included in Minecraft add-on. See archive metadata and status for snapshot scope.','license_notice':'Source wiki content currently declares CC BY-NC-SA 3.0 unless otherwise noted; preserve this notice and original source/revision attribution.'}
  (output/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps(manifest,indent=2))

def restore(manifest_path,destination):
 manifest=json.loads(manifest_path.read_text());assert manifest['format']=='tts-wiki-sqlite-gzip-parts-v1'
 if destination.exists():raise ValueError('Destination exists; choose a new path to preserve it.')
 destination.parent.mkdir(parents=True,exist_ok=True)
 with tempfile.TemporaryDirectory(prefix='wiki-restore-',dir=destination.parent) as temp:
  combined=Path(temp)/'archive.gz'
  with combined.open('wb') as target:
   for entry in manifest['parts']:
    if Path(entry['name']).name!=entry['name']:raise ValueError('Invalid backup part name')
    path=manifest_path.parent/entry['name']
    if path.stat().st_size!=entry['bytes'] or digest(path)!=entry['sha256']:raise ValueError('Backup part failed verification: '+path.name)
    with path.open('rb') as inp:
     for block in iter(lambda:inp.read(1024*1024),b''):target.write(block)
  restored=Path(temp)/'archive.sqlite'
  with gzip.open(combined,'rb') as inp,restored.open('wb') as out:
   for block in iter(lambda:inp.read(1024*1024),b''):out.write(block)
  if restored.stat().st_size!=manifest['database_bytes'] or digest(restored)!=manifest['database_sha256']:raise ValueError('Restored database hash mismatch')
  db=sqlite3.connect(restored);assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok';db.close();os.replace(restored,destination)
 print('Verified offline database restored:',destination)

def main():
 p=argparse.ArgumentParser(description=__doc__);sub=p.add_subparsers(dest='operation',required=True)
 c=sub.add_parser('create');c.add_argument('database',type=Path);c.add_argument('output_directory',type=Path)
 r=sub.add_parser('restore');r.add_argument('manifest',type=Path);r.add_argument('destination',type=Path)
 a=p.parse_args()
 if a.operation=='create':create(a.database,a.output_directory)
 else:restore(a.manifest,a.destination)
if __name__=='__main__':main()
