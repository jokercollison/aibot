import importlib.util,pathlib,sqlite3,tempfile,unittest,zlib
from unittest.mock import patch
ROOT=pathlib.Path(__file__).resolve().parents[1]
def load(name):
 s=importlib.util.spec_from_file_location(name,ROOT/'tools'/f'{name}.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
w=load('wiki_archive');zim=load('wiki_zim');backup=load('wiki_backup')
class ArchiveTests(unittest.TestCase):
 def test_offline_search_source_redirect_and_audit(self):
  with tempfile.TemporaryDirectory() as t:
   db=w.connect(pathlib.Path(t)/'archive.sqlite')
   pages=[{'pageid':1,'ns':0,'title':'Wolf','revisions':[{'revid':99,'timestamp':'2026-10-21T00:00:00Z','slots':{'main':{'contentmodel':'wikitext','content':'== Color variants ==\nChestnut wolf: old growth spruce taiga. {{Wolf variants}} [[Grove]]'}}}]},{'pageid':2,'ns':10,'title':'Template:Wolf variants','revisions':[{'revid':100,'slots':{'main':{'contentmodel':'wikitext','content':'Snowy wolf: grove.'}}}]},{'pageid':3,'ns':0,'title':'Snowy Wolf','revisions':[{'revid':101,'slots':{'main':{'contentmodel':'wikitext','content':'#REDIRECT [[Wolf#Color variants]]'}}}]}]
   for page in pages:
    db.execute('INSERT INTO inventory VALUES(?,?,?)',(page['pageid'],page['ns'],page['title']));w.store(db,page)
   for ns in (0,10):db.execute('INSERT INTO namespace_progress VALUES(?,NULL,1)',(ns,))
   db.commit()
   # Real local SQL works while every network operation is forbidden.
   with patch.object(w,'request',side_effect=AssertionError('network forbidden')):
    self.assertEqual(db.execute("SELECT rowid FROM article_search WHERE article_search MATCH 'chestnut'").fetchone()[0],1)
    self.assertEqual(zlib.decompress(db.execute('SELECT source FROM articles WHERE page_id=2').fetchone()[0]).decode(),'Snowy wolf: grove.')
    self.assertEqual(db.execute('SELECT redirect FROM articles WHERE page_id=3').fetchone()[0],'Wolf#Color variants')
    report=w.audit(db,verify=True);self.assertTrue(report['complete_for_selected_namespaces']);self.assertEqual(report['verified_content_hashes'],3)
   db.execute("INSERT INTO inventory VALUES(4,0,'Missing')")
   self.assertFalse(w.audit(db)['complete_for_selected_namespaces'])
 def test_resumable_inventory_follows_continuation(self):
  with tempfile.TemporaryDirectory() as t:
   db=w.connect(pathlib.Path(t)/'archive.sqlite')
   batches=[{'continue':{'apcontinue':'Wolf'},'query':{'allpages':[{'pageid':1,'ns':0,'title':'Planks'}]}},{'query':{'allpages':[{'pageid':2,'ns':0,'title':'Wolf'}]}}]
   with patch.object(w,'request',side_effect=batches) as request,patch.object(w.time,'sleep'):
    w.inventory(db,[0]);self.assertEqual(request.call_args_list[1].args[0]['apcontinue'],'Wolf')
   with patch.object(w,'request',side_effect=AssertionError('already inventoried')):w.inventory(db,[0])
 def test_backup_restores_without_network_and_detects_corruption(self):
  with tempfile.TemporaryDirectory() as t:
   base=pathlib.Path(t);original=base/'original.sqlite';db=sqlite3.connect(original);db.execute('CREATE TABLE facts(value TEXT)');db.execute("INSERT INTO facts VALUES('wolf variants')");db.commit();db.close()
   with patch.object(backup,'PART_BYTES',512):backup.create(original,base/'backup')
   backup.restore(base/'backup/manifest.json',base/'restored.sqlite')
   db=sqlite3.connect(base/'restored.sqlite');self.assertEqual(db.execute('SELECT value FROM facts').fetchone()[0],'wolf variants');db.close()
   part=next((base/'backup').glob('part-*.bin'));part.write_bytes(b'corrupt')
   with self.assertRaises(ValueError):backup.restore(base/'backup/manifest.json',base/'bad.sqlite')
   self.assertFalse((base/'bad.sqlite').exists())
 def test_zim_tables_remain_readable_and_scripts_are_data_only(self):
  p=zim.ReadableHTML();p.feed('<h2>Variants</h2><table><tr><th>Wolf</th><th>Biome</th></tr><tr><td>Snowy</td><td>Grove</td></tr></table><script>do not execute</script>')
  self.assertIn('Snowy\tGrove',p.text());self.assertNotIn('do not execute',p.text())
if __name__=='__main__':unittest.main()
