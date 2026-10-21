import {build} from 'esbuild';
import {cp, mkdir, readFile, readdir, rm, stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('..',import.meta.url));
process.chdir(root);
// Only generated directories owned by this project are replaced.
execFileSync('python',['tools/catalog.py'],{stdio:'inherit'});
await rm('build',{recursive:true,force:true});
await mkdir('build',{recursive:true});
await mkdir('dist',{recursive:true});
await cp('packs/behavior','build/TimeTrapRobot_BP',{recursive:true});
await cp('packs/resource','build/TimeTrapRobot_RP',{recursive:true});
await build({entryPoints:['src/main.ts'],bundle:true,minify:true,format:'esm',target:'es2022',outfile:'build/TimeTrapRobot_BP/scripts/main.js',external:['@minecraft/server','@minecraft/server-ui'],legalComments:'none'});
async function validateJson(dir) {
  for (const entry of await readdir(dir,{withFileTypes:true})) {
    const p=path.join(dir,entry.name);
    if(entry.isDirectory()) await validateJson(p);
    else if(p.endsWith('.json')) JSON.parse(await readFile(p,'utf8'));
  }
}
await validateJson('build');
const bp=JSON.parse(await readFile('build/TimeTrapRobot_BP/manifest.json'));
const rp=JSON.parse(await readFile('build/TimeTrapRobot_RP/manifest.json'));
if(bp.dependencies.find(d=>d.uuid)?.uuid!==rp.header.uuid) throw new Error('Resource-pack dependency mismatch');
for (const d of bp.dependencies.filter(d=>d.module_name)) {
  const pkg=JSON.parse(await readFile(`node_modules/${d.module_name}/package.json`));
  if(pkg.version!==d.version || /beta|preview/.test(d.version)) throw new Error('API dependency mismatch');
}
const source=await readFile('build/TimeTrapRobot_BP/scripts/main.js','utf8');
if (/from ["']node:|require\(|fetch\(|eval\(/.test(source)) throw new Error('Unsupported runtime dependency');
execFileSync('python',['tools/package.py'],{stdio:'inherit'});
console.log(`Bundled offline script: ${(await stat('build/TimeTrapRobot_BP/scripts/main.js')).size} bytes`);
