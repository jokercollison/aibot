// Simulation of our integration code; these tests do not run Minecraft's engine.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const fixture={callbacks:{}, forms:[], messages:[], intervals:[], bodies:[], sounds:[]};
globalThis.__robotTest=fixture;
fixture.world={beforeEvents:{playerInteractWithEntity:{subscribe:cb=>fixture.callbacks.interact=cb}},afterEvents:{playerLeave:{subscribe:cb=>fixture.callbacks.leave=cb}},getAllPlayers:()=>fixture.players??[]};
fixture.system={run:cb=>cb(),runInterval:cb=>fixture.intervals.push(cb),currentTick:0};
const out=await build({entryPoints:['src/main.ts'],bundle:true,write:false,format:'esm',minify:true,plugins:[{name:'simulated-bedrock',setup(b){
 b.onResolve({filter:/^@minecraft\//},a=>({path:a.path,namespace:'fake'}));
 b.onLoad({filter:/.*/,namespace:'fake'},a=>({contents:a.path.endsWith('server-ui')?`
 class Form {title(){return this}body(text){globalThis.__robotTest.bodies.push(text);return this}button(){return this}textField(){return this}toggle(){return this}show(){return Promise.resolve(globalThis.__robotTest.forms.shift() ?? {canceled:true})}}
 export {Form as ActionFormData,Form as ModalFormData};
 `:`export const world=globalThis.__robotTest.world;export const system=globalThis.__robotTest.system;`,loader:'js'}));
}}]});
await import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'));
function setup() {
 const properties=new Map(),events=[];
 const dimension={id:'minecraft:overworld',getEntities:()=>[],getBlock:()=>({typeId:'minecraft:air'})};
 const player={id:'owner',isValid:true,dimension,location:{x:0,y:64,z:0},sendMessage:s=>fixture.messages.push(s),playSound:(name,options)=>fixture.sounds.push({name,options}),getComponent:()=>({currentValue:20})};
 const bot={id:'robot',isValid:true,typeId:'tts:robot',location:{x:0,y:64,z:1},dimension,nameTag:'',getDynamicProperty:k=>properties.get(k),setDynamicProperty:(k,v)=>properties.set(k,v),getComponent:()=>({tame:()=>true}),triggerEvent:e=>events.push(e),tryTeleport:()=>false};
 fixture.messages=[];fixture.forms=[];fixture.players=[];fixture.bodies=[];fixture.sounds=[];
 return {player,bot,properties,events};
}
async function click(player,bot){fixture.callbacks.interact({player,target:bot});await new Promise(r=>setImmediate(r));}
test('first interaction claims once and introduces companion',async()=>{
 const {player,bot,properties}=setup();await click(player,bot);
 assert.equal(properties.get('tts:owner'),'owner');assert.equal(properties.get('tts:mode'),'stay');assert.equal(properties.get('tts:warnings'),true);assert.match(fixture.messages[0],/AI companion/);
 assert.doesNotMatch(fixture.messages[0],/offline|database|supports/i);
 const greetingCount=fixture.messages.length;await click(player,bot);assert.equal(fixture.messages.length,greetingCount);
});
test('non-owner cannot execute menu command or retame robot',async()=>{
 const {player,bot,properties,events}=setup();properties.set('tts:owner','someone-else');fixture.forms=[{selection:1}];await click(player,bot);
 assert.equal(properties.get('tts:owner'),'someone-else');assert.deepEqual(events,[]);assert.match(fixture.messages[0],/Only the robot owner/);
});
test('follow then stay updates both native behavior and persistent mode',async()=>{
 const {player,bot,properties,events}=setup();properties.set('tts:owner',player.id);
 fixture.forms=[{selection:1}];await click(player,bot);assert.equal(properties.get('tts:mode'),'follow');assert.ok(events.includes('tts:follow_on'));
 fixture.forms=[{selection:2}];await click(player,bot);assert.equal(properties.get('tts:mode'),'stay');assert.ok(events.includes('tts:follow_off'));
});
test('settings save name and defense without using untrusted commands',async()=>{
 const {player,bot,properties,events}=setup();properties.set('tts:owner',player.id);
 fixture.forms=[{selection:5},{formValues:['§cBolt',true,false]}];await click(player,bot);
 assert.equal(bot.nameTag,'Bolt');assert.equal(properties.get('tts:defend'),true);assert.equal(properties.get('tts:warnings'),false);assert.ok(events.includes('tts:defend_on'));
});
test('question form reaches real offline knowledge engine',async()=>{
 const {player,bot,properties}=setup();properties.set('tts:owner',player.id);
 fixture.forms=[{selection:0},{formValues:['How do I craft a hopper?']}];await click(player,bot);assert.match(fixture.messages[0],/5 iron ingots/);
});
test('blocked home leaves follow state unchanged and reports failure',async()=>{
 const {player,bot,properties,events}=setup();properties.set('tts:owner',player.id);properties.set('tts:mode','follow');properties.set('tts:home',JSON.stringify({dimension:'minecraft:overworld',x:2,y:64,z:2}));
 fixture.forms=[{selection:4}];await click(player,bot);assert.equal(properties.get('tts:mode'),'follow');assert.deepEqual(events,[]);assert.match(fixture.messages[0],/blocked or unloaded/);
});
test('nearby creeper warning obeys per-robot cooldown',()=>{
 const {player,bot,properties}=setup();properties.set('tts:owner',player.id);
 player.dimension.getEntities=q=>q.families?.includes('tts_ai_bot')?[bot]:[{typeId:'minecraft:creeper'}];fixture.players=[player];
 fixture.system.currentTick=100;fixture.intervals[0]();fixture.intervals[0]();assert.equal(fixture.messages.length,1);
 fixture.system.currentTick=1300;fixture.intervals[0]();assert.equal(fixture.messages.length,2);
});

test('Things to try menu shows examples and honest warning coverage',async()=>{
 const {player,bot,properties}=setup();properties.set('tts:owner',player.id);
 fixture.forms=[{selection:6},{selection:0}];await click(player,bot);
 assert.match(fixture.bodies.at(-1),/How do I craft a stone pickaxe/);
 assert.match(fixture.bodies.at(-1),/haven't learned warnings for other mobs/);
});

test('new namespaced robot identity and old saved robots are both recognized',async()=>{
 const {player,bot,properties}=setup();bot.typeId='tts_ai_bot:robot';await click(player,bot);assert.equal(properties.get('tts:owner'),player.id);
});
test('sound test uses the registered project sound at an audible gain',async()=>{
 const {player,bot,properties}=setup();properties.set('tts:owner',player.id);fixture.forms=[{selection:7}];await click(player,bot);
 assert.equal(fixture.sounds[0].name,'tts_ai_bot.robot.chirp');assert.ok(fixture.sounds[0].options.volume>=0.5);
});
