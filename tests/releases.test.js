import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,copyFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
test('preparing another release changes every UUID, links only its own pair and is repeatable',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'tts-release-'));
 try {
  for(const file of ['tools/new_release.py','tools/pack_identities.json','package.json','package-lock.json',...['behavior','resource'].flatMap(k=>[`Content/${k}_packs/AI_Bot/manifest.json`,`Content/${k}_packs/AI_Bot/texts/en_US.lang`])]){
   const dest=path.join(dir,file);mkdirSync(path.dirname(dest),{recursive:true});copyFileSync(file,dest);
  }
  const read=p=>JSON.parse(readFileSync(path.join(dir,p)));
  execFileSync('python',[path.join(dir,'tools/new_release.py'),'99.98.97']);
  const identities=read('tools/pack_identities.json');
  const next=identities['99.98.97'];
  const all=r=>[...Object.values(r.behavior),...Object.values(r.resources)];
  const old=new Set(Object.entries(identities).filter(([v])=>v!=='99.98.97').flatMap(([,r])=>all(r)));
  for(const id of all(next))assert.equal(old.has(id),false);
  const bp=read('Content/behavior_packs/AI_Bot/manifest.json'),rp=read('Content/resource_packs/AI_Bot/manifest.json');
  assert.deepEqual(bp.dependencies.find(d=>d.uuid),{uuid:rp.header.uuid,version:[99,98,97]});
  for(const p of [bp,rp]){assert.ok(p.header.name.includes('99.98.97'));assert.ok(p.header.description.includes('99.98.97'));}
  execFileSync('python',[path.join(dir,'tools/new_release.py'),'99.98.97']);
  assert.deepEqual(read('tools/pack_identities.json')['99.98.97'],next);
 } finally {rmSync(dir,{recursive:true,force:true});}
});
