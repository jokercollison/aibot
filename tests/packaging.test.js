import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,copyFileSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
test('import addon has immediate pack folders; submission archive keeps Content layout',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'tts-package-'));
 try {
  mkdirSync(path.join(dir,'tools'));mkdirSync(path.join(dir,'dist'));
  copyFileSync('tools/package.py',path.join(dir,'tools/package.py'));
  copyFileSync('package.json',path.join(dir,'package.json'));
  for(const [source,folder] of [['behavior','TimeTrapRobot_BP'],['resource','TimeTrapRobot_RP']]){
   mkdirSync(path.join(dir,'build',folder),{recursive:true});
   copyFileSync(`Content/${source}_packs/AI_Bot/manifest.json`,path.join(dir,'build',folder,'manifest.json'));
   writeFileSync(path.join(dir,'build',folder,'ordinary-file.txt'),'test payload');
  }
  execFileSync('python',[path.join(dir,'tools/package.py')]);
  const result=execFileSync('python',['-c',`
import zipfile,json,pathlib
root=pathlib.Path(${JSON.stringify(dir)})
version=json.loads((root/'package.json').read_text())['version']
with zipfile.ZipFile(root/f'dist/TimeTrapRobot-{version}.mcaddon') as z:
 assert z.testzip() is None
 names=z.namelist()
 assert not any(n.lower().endswith(('.zip','.mcpack','.mcaddon')) for n in names)
 for folder in ['TimeTrapRobot_BP','TimeTrapRobot_RP']:
  assert f'{folder}/manifest.json' in names
  assert z.read(f'{folder}/ordinary-file.txt')==b'test payload'
 assert not any(n.startswith('Content/') for n in names)
with zipfile.ZipFile(root/f'dist/TimeTrapRobot-Content-{version}.zip') as z:
 for kind in ['behavior_packs','resource_packs']:
  assert f'Content/{kind}/AI_Bot/manifest.json' in z.namelist()
 print('folder-layout-ok')
`],{encoding:'utf8'});
  assert.match(result,/folder-layout-ok/);
 } finally {rmSync(dir,{recursive:true,force:true});}
});
