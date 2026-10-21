import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
const read=p=>JSON.parse(readFileSync(p));
test('test release has recorded new identities and a matching resource dependency',()=>{
 const bp=read('Content/behavior_packs/AI_Bot/manifest.json'),rp=read('Content/resource_packs/AI_Bot/manifest.json');
 const identities=read('tools/pack_identities.json'),current=identities[read('package.json').version];
 assert.equal(rp.header.uuid,current.resources.header);assert.equal(bp.header.uuid,current.behavior.header);
 assert.notEqual(rp.header.uuid,identities['0.2.0'].resources.header);assert.notEqual(bp.header.uuid,identities['0.2.0'].behavior.header);
 const all=[bp.header.uuid,rp.header.uuid,...bp.modules.map(m=>m.uuid),...rp.modules.map(m=>m.uuid)];assert.equal(new Set(all).size,5);
 for(const id of all)assert.match(id,/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/);
 assert.deepEqual(bp.dependencies.find(d=>d.uuid),{uuid:rp.header.uuid,version:rp.header.version});
 const version=read('package.json').version.split('.').map(Number);
 for(const pack of [bp,rp]){assert.deepEqual(pack.header.version,version);for(const m of pack.modules)assert.deepEqual(m.version,version);}
});
test('base body shape is retained and every cube face samples a bounded texture swatch',()=>{
 const geo=read('Content/resource_packs/AI_Bot/models/entity/tts/ai_bot/robot.geo.json')['minecraft:geometry'][0];
 const base={body:[8,8,4],head:[8,7,6],left_arm:[3,8,4],right_arm:[3,8,4],left_leg:[3,6,4],right_leg:[3,6,4]};
 for(const bone of geo.bones){
  assert.deepEqual(bone.cubes[0].size,base[bone.name]);
  for(const cube of bone.cubes){
   assert.deepEqual(Object.keys(cube.uv).sort(),['down','east','north','south','up','west']);
   for(const f of Object.values(cube.uv)){
    assert.ok(f.uv[0]>=0&&f.uv[1]>=0);assert.ok(f.uv[0]+f.uv_size[0]<=geo.description.texture_width);assert.ok(f.uv[1]+f.uv_size[1]<=geo.description.texture_height);
   }
  }
 }
 assert.equal(geo.bones.find(b=>b.name==='head').cubes.length,4);
});
test('mapped face details use cyan and steel swatches from the existing image',()=>{
 const png=readFileSync('Content/resource_packs/AI_Bot/textures/tts/ai_bot/entity/robot.png'),chunks=[];
 let i=8;while(i<png.length){const n=png.readUInt32BE(i);if(png.toString('ascii',i+4,i+8)==='IDAT')chunks.push(png.subarray(i+8,i+8+n));i+=n+12;}
 const raw=inflateSync(Buffer.concat(chunks));
 // This palette PNG uses unfiltered RGBA rows; no image editing is involved.
 const pixel=(x,y)=>{assert.equal(raw[y*129],0);return [...raw.subarray(y*129+1+x*4,y*129+5+x*4)];};
 assert.deepEqual(pixel(1,1),[25,225,205,255]);assert.deepEqual(pixel(5,1),[70,90,110,255]);
});

test('project asset references resolve under tts/ai_bot without overriding vanilla entities',()=>{
 const bp='Content/behavior_packs/AI_Bot',rp='Content/resource_packs/AI_Bot';
 const behavior=read(bp+'/entities/tts/ai_bot/robot.json')['minecraft:entity'];
 const client=read(rp+'/entity/tts/ai_bot/robot.entity.json')['minecraft:client_entity'].description;
 assert.equal(behavior.description.identifier,'tts_ai_bot:robot');assert.equal(client.identifier,behavior.description.identifier);
 assert.ok(readFileSync(rp+'/'+client.textures.default+'.png'));
 assert.match(client.textures.default,/^textures\/tts\/ai_bot\//);
 assert.equal(read(bp+'/manifest.json').modules.find(m=>m.type==='script').entry,'scripts/tts/ai_bot/main.js');
 const sounds=read(rp+'/sounds/sound_definitions.json').sound_definitions;
 const sound=sounds['tts_ai_bot.robot.chirp'];assert.ok(sound);assert.match(sound.sounds[0].name,/^sounds\/tts\/ai_bot\//);
 const ogg=readFileSync(rp+'/'+sound.sounds[0].name+'.ogg');assert.equal(ogg.toString('ascii',0,4),'OggS');
});

test('both visible pack names and descriptions contain the exact release number',()=>{
 const version=read('package.json').version;
 for(const kind of ['behavior','resource']){
  const manifest=read(`Content/${kind}_packs/AI_Bot/manifest.json`);
  assert.ok(manifest.header.name.includes(version));assert.ok(manifest.header.description.includes(version));
 }
});
