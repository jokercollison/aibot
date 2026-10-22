import {build} from 'esbuild';
import {cp, mkdir, readFile, readdir, rm, stat, writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('..',import.meta.url));
process.chdir(root);
// Only generated directories owned by this project are replaced.
execFileSync('python',['tools/catalog.py'],{stdio:'inherit'});
execFileSync('python',['tools/recipes.py'],{stdio:'inherit'});
execFileSync('python',['tools/entity_knowledge.py'],{stdio:'inherit'});
execFileSync('python',['tools/acquisition.py'],{stdio:'inherit'});
execFileSync('python',['tools/entity_database.py'],{stdio:'inherit'});
execFileSync('python',['tools/entity_loot.py'],{stdio:'inherit'});
execFileSync('python',['tools/topics.py'],{stdio:'inherit'});
execFileSync('python',['tools/descriptions.py'],{stdio:'inherit'});
execFileSync('python',['tools/block_family_audit.py'],{stdio:'inherit'});
execFileSync(process.execPath,['tools/block_question_audit.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['tools/entity_question_audit.mjs'],{stdio:'inherit'});
await rm('build',{recursive:true,force:true});
await mkdir('build',{recursive:true});
await mkdir('dist',{recursive:true});
const version=JSON.parse(await readFile('package.json','utf8')).version;
const scope=`tts_ai_bot_v${version.replaceAll('.','_')}`;
const segment=`v${version.replaceAll('.','_')}`;
const convert=s=>s.replaceAll('tts_ai_bot',scope).replaceAll('tts/ai_bot/',`tts/ai_bot/${segment}/`);
// Preserve engine root files while namespacing all custom payload paths and IDs.
async function emitTree(src,dest,relative='') {
  for(const entry of await readdir(path.join(src,relative),{withFileTypes:true})) {
    const rel=path.join(relative,entry.name),from=path.join(src,rel);
    if(entry.isDirectory()) await emitTree(src,dest,rel);
    else {
      const to=path.join(dest,convert(rel));await mkdir(path.dirname(to),{recursive:true});
      if(/\.(json|lang)$/.test(from)) await writeFile(to,convert(await readFile(from,'utf8')));
      else await cp(from,to);
    }
  }
}
await emitTree('Content/behavior_packs/AI_Bot','build/TimeTrapRobot_BP');
await emitTree('Content/resource_packs/AI_Bot','build/TimeTrapRobot_RP');
await build({entryPoints:['src/main.ts'],bundle:true,minify:false,format:'esm',target:'es2022',outfile:`build/TimeTrapRobot_BP/scripts/tts/ai_bot/${segment}/main.js`,external:['@minecraft/server','@minecraft/server-ui'],legalComments:'none'});
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
const source=await readFile(`build/TimeTrapRobot_BP/scripts/tts/ai_bot/${segment}/main.js`,'utf8');
const lines=source.split('\n');
const longestLine=lines.reduce((longest,line)=>Math.max(longest,line.length),0);
if(longestLine>10000)throw new Error('Generated script contains an oversized line; keep output readable.');
console.log(`Readable script: ${lines.length} lines; longest line ${longestLine} characters`);
if (/from ["']node:|require\(|fetch\(|eval\(/.test(source)) throw new Error('Unsupported runtime dependency');
await import('./validate-built.mjs');
execFileSync('python',['tools/package.py'],{stdio:'inherit'});
console.log(`Bundled offline script: ${(await stat(`build/TimeTrapRobot_BP/scripts/tts/ai_bot/${segment}/main.js`)).size} bytes`);
