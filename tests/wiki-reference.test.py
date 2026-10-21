"""Test redirects, missing articles and cache boundaries without network access."""
import importlib.util, pathlib, tempfile, unittest
spec=importlib.util.spec_from_file_location('wiki_reference',pathlib.Path(__file__).resolve().parents[1]/'tools/wiki_reference.py')
w=importlib.util.module_from_spec(spec);spec.loader.exec_module(w)
class ReferenceTests(unittest.TestCase):
 def test_redirect_revision_sections_and_missing_are_retained(self):
  with tempfile.TemporaryDirectory() as temp:
   db=w.connect(pathlib.Path(temp)/'reference.sqlite')
   response={'query':{'normalized':[{'from':'diamond_ore','to':'Diamond ore'}],'redirects':[{'from':'Diamond ore','to':'Diamond Ore'}],'pages':[{'title':'Diamond Ore','pageid':1,'revisions':[{'revid':123,'timestamp':'2026-10-01T00:00:00Z','slots':{'main':{'content':'Intro\n== Obtaining ==\nEvidence\n=== Bedrock ===\nEdition note'}}}]},{'title':'Missing','missing':True}]}}
   w.ingest(db,['diamond_ore','Missing'],response)
   self.assertEqual(db.execute('SELECT canonical_title,status FROM mappings WHERE requested_title=?',('diamond_ore',)).fetchone(),('Diamond Ore','fetched'))
   self.assertEqual(db.execute('SELECT revision_id FROM pages').fetchone()[0],123)
   self.assertEqual(db.execute('SELECT heading FROM sections ORDER BY ordinal').fetchall(),[('Introduction',),('Obtaining',),('Bedrock',)])
   self.assertEqual(db.execute("SELECT status FROM mappings WHERE requested_title='Missing'").fetchone()[0],'missing')
   w.ingest(db,['diamond_ore'],response)
   self.assertEqual(db.execute('SELECT COUNT(*) FROM pages').fetchone()[0],1)
   self.assertEqual(db.execute('SELECT COUNT(*) FROM sections').fetchone()[0],3)
   self.assertEqual(w.report(db)['reviewed_gameplay_facts'],0)
if __name__=='__main__':unittest.main()
