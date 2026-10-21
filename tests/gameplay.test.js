// Simulation of our integration code; these tests do not run Minecraft's engine.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {VERSION,SCOPE,ROBOT_ID,SOUND_ID} from '../src/build-info.js';
const fixture={callbacks:{}, forms:[], messages:[], intervals:[], bodies:[], sounds:[], titles:[], labels:[], fields:[], submitButtons:[], formsShown:0};
globalThis.__robotTest=fixture;
fixture.world={beforeEvents:{playerInteractWithEntity:{subscribe:cb=>fixture.callbacks.interact=cb}},afterEvents:{playerLeave:{subscribe:cb=>fixture.callbacks.leave=cb}},getAllPlayers:()=>fixture.players??[]};
fixture.system={run:cb=>cb(),runInterval:cb=>fixture.intervals.push(cb),currentTick:0};
const out=await build({entryPoints:['src/main.ts'],bundle:true,write:false,format:'esm',minify:true,plugins:[{name:'simulated-bedrock',setup(b){
 b.onResolve({filter:/^@minecraft\//},a=>({path:a.path,namespace:'fake'}));
 b.onLoad({filter:/.*/,namespace:'fake'},a=>({contents:a.path.endsWith('server-ui')?`
 class Form {title(text){globalThis.__robotTest.titles.push(text);return this}body(text){globalThis.__robotTest.bodies.push(text);return this}button(){return this}label(text){globalThis.__robotTest.labels.push(text);return this}submitButton(text){globalThis.__robotTest.submitButtons.push(text);return this}textField(text){globalThis.__robotTest.fields.push(text);return this}toggle(){return this}show(){globalThis.__robotTest.formsShown++;const response=globalThis.__robotTest.forms.shift() ?? {canceled:true};return Promise.resolve(typeof response==='function'?response():response)}}
 export {Form as ActionFormData,Form as ModalFormData};export const FormCancelationReason={UserBusy:'UserBusy',UserClosed:'UserClosed'};
 `:`export const world=globalThis.__robotTest.world;export const system=globalThis.__robotTest.system;`,loader:'js'}));
}}]});
await import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'));
function setup() {
 fixture.callbacks.leave({playerId:'owner'});
 const properties=new Map(),events=[];
 const dimension={id:'minecraft:overworld',getEntities:()=>[],getBlock:()=>({typeId:'minecraft:air'})};
 const player={id:'owner',isValid:true,dimension,location:{x:0,y:64,z:0},sendMessage:s=>fixture.messages.push(s),playSound:(name,options)=>fixture.sounds.push({name,options}),getComponent:()=>({currentValue:20})};
 const bot={id:'robot',isValid:true,typeId:ROBOT_ID,location:{x:0,y:64,z:1},dimension,nameTag:'',getDynamicProperty:k=>properties.get(k),setDynamicProperty:(k,v)=>properties.set(k,v),getComponent:()=>({tame:()=>true}),triggerEvent:e=>events.push(e),tryTeleport:()=>false};
 fixture.messages=[];fixture.forms=[];fixture.players=[];fixture.bodies=[];fixture.sounds=[];fixture.titles=[];fixture.labels=[];fixture.fields=[];fixture.submitButtons=[];fixture.formsShown=0;
 return {player,bot,properties,events};
}
async function click(player,bot){fixture.callbacks.interact({player,target:bot});await new Promise(r=>setImmediate(r));}
test('first interaction claims once and introduces companion',async()=>{
 const {player,bot,properties}=setup();await click(player,bot);
 assert.equal(properties.get(`${SCOPE}:owner`),'owner');assert.equal(properties.get(`${SCOPE}:mode`),'stay');assert.equal(properties.get(`${SCOPE}:warnings`),true);assert.match(fixture.messages[0],/AI companion/);
 assert.doesNotMatch(fixture.messages[0],/offline|database|supports/i);
 const greetingCount=fixture.messages.length;await click(player,bot);assert.equal(fixture.messages.length,greetingCount);
});
test('non-owner cannot execute menu command or retame robot',async()=>{
 const {player,bot,properties,events}=setup();properties.set(`${SCOPE}:owner`,'someone-else');fixture.forms=[{selection:1}];await click(player,bot);
 assert.equal(properties.get(`${SCOPE}:owner`),'someone-else');assert.deepEqual(events,[]);assert.match(fixture.messages[0],/Only the robot owner/);
});
test('follow then stay updates both native behavior and persistent mode',async()=>{
 const {player,bot,properties,events}=setup();properties.set(`${SCOPE}:owner`,player.id);
 fixture.forms=[{selection:1}];await click(player,bot);assert.equal(properties.get(`${SCOPE}:mode`),'follow');assert.ok(events.includes(`${SCOPE}:follow_on`));
 fixture.forms=[{selection:2}];await click(player,bot);assert.equal(properties.get(`${SCOPE}:mode`),'stay');assert.ok(events.includes(`${SCOPE}:follow_off`));
});
test('settings save name and defense without using untrusted commands',async()=>{
 const {player,bot,properties,events}=setup();properties.set(`${SCOPE}:owner`,player.id);
 fixture.forms=[{selection:5},{formValues:['§cBolt',true,false]}];await click(player,bot);
 assert.equal(bot.nameTag,'Bolt');assert.equal(properties.get(`${SCOPE}:defend`),true);assert.equal(properties.get(`${SCOPE}:warnings`),false);assert.ok(events.includes(`${SCOPE}:defend_on`));
});
test('question form reaches real offline knowledge engine',async()=>{
 const {player,bot,properties}=setup();properties.set(`${SCOPE}:owner`,player.id);
 fixture.forms=[{selection:0},{formValues:['How do I craft a hopper?']}];await click(player,bot);assert.match(fixture.labels.at(-1),/5 iron ingots/);assert.deepEqual(fixture.messages,[]);
});
test('blocked home leaves follow state unchanged and reports failure',async()=>{
 const {player,bot,properties,events}=setup();properties.set(`${SCOPE}:owner`,player.id);properties.set(`${SCOPE}:mode`,'follow');properties.set(`${SCOPE}:home`,JSON.stringify({dimension:'minecraft:overworld',x:2,y:64,z:2}));
 fixture.forms=[{selection:4}];await click(player,bot);assert.equal(properties.get(`${SCOPE}:mode`),'follow');assert.deepEqual(events,[]);assert.match(fixture.messages[0],/blocked or unloaded/);
});
test('nearby creeper warning obeys per-robot cooldown',()=>{
 const {player,bot,properties}=setup();properties.set(`${SCOPE}:owner`,player.id);
 player.dimension.getEntities=q=>q.families?.includes(SCOPE)?[bot]:[{typeId:'minecraft:creeper'}];fixture.players=[player];
 fixture.system.currentTick=100;fixture.intervals[0]();fixture.intervals[0]();assert.equal(fixture.messages.length,1);
 fixture.system.currentTick=1300;fixture.intervals[0]();assert.equal(fixture.messages.length,2);
});

test('Things to try menu shows examples and honest warning coverage',async()=>{
 const {player,bot,properties}=setup();properties.set(`${SCOPE}:owner`,player.id);
 fixture.forms=[{selection:6},{selection:0}];await click(player,bot);
 assert.match(fixture.bodies.at(-1),/How do I craft a stone pickaxe/);
 assert.match(fixture.bodies.at(-1),/haven't learned warnings for other mobs/);
});

test('other releases and old unversioned robots are ignored',async()=>{
 const {player,bot,properties}=setup();bot.typeId='tts:robot';await click(player,bot);assert.equal(properties.size,0);
 bot.typeId='tts_ai_bot_v0_2_0:robot';await click(player,bot);assert.equal(properties.size,0);
 bot.typeId=ROBOT_ID;await click(player,bot);assert.equal(properties.get(`${SCOPE}:owner`),player.id);
});
test('sound test uses the registered project sound at an audible gain',async()=>{
 const {player,bot,properties}=setup();properties.set(`${SCOPE}:owner`,player.id);fixture.forms=[{selection:7}];await click(player,bot);
 assert.equal(fixture.sounds[0].name,SOUND_ID);assert.ok(fixture.sounds[0].options.volume>=0.5);
});

test('menu identifies the executing build and keeps example entry available',async()=>{
 const {player,bot,properties}=setup();properties.set(`${SCOPE}:owner`,player.id);await click(player,bot);
 assert.ok(fixture.titles[0].includes('v'+VERSION));
});

test('one interaction supports consecutive questions and shows answers beside the next input',async()=>{
 const {player,bot,properties}=setup();properties.set(`${SCOPE}:owner`,player.id);
 fixture.forms=[{selection:0},{formValues:['What is a hopper?']},{formValues:[undefined,'How do I craft it?']},{canceled:true,cancelationReason:'UserClosed'}];
 await click(player,bot);
 assert.equal(fixture.formsShown,4);assert.match(fixture.labels[1],/You: What is a hopper/);
 assert.match(fixture.labels[1],/collects/);assert.match(fixture.labels[2],/5 iron ingots/);
 assert.equal(fixture.sounds.length,2);assert.deepEqual(fixture.messages,[]);
 assert.ok(fixture.submitButtons.every(text=>text==='Send'));
});
test('slime clarification and a spawning follow-up work inside one conversation',async()=>{
 const {player,bot,properties}=setup();properties.set(`${SCOPE}:owner`,player.id);
 fixture.forms=[{selection:0},{formValues:['What is a slime?']},{formValues:['a mob']},{formValues:['Where does it spawn?']},{canceled:true}];await click(player,bot);
 assert.match(fixture.labels[1],/mob/);assert.match(fixture.labels.at(-1),/below Y=40/);
 assert.equal(fixture.formsShown,5);
});
test('explicit close stops auto-opening and a later interaction resumes recent history',async()=>{
 const {player,bot,properties}=setup();properties.set(`${SCOPE}:owner`,player.id);
 fixture.forms=[{selection:0},{formValues:['What is a hopper?']},{canceled:true,cancelationReason:'UserClosed'}];await click(player,bot);
 assert.equal(fixture.formsShown,3);
 fixture.forms=[{selection:0},{formValues:['How do I craft it?']},{canceled:true}];await click(player,bot);
 assert.match(fixture.labels[2],/You: What is a hopper/);assert.match(fixture.labels.at(-1),/5 iron ingots/);
});
test('blank and overlong messages keep the conversation open without losing context',async()=>{
 const {player,bot,properties}=setup();properties.set(`${SCOPE}:owner`,player.id);
 fixture.forms=[{selection:0},{formValues:['What is a hopper?']},{formValues:['   ']},{formValues:['x'.repeat(241)]},{formValues:['How do I craft it?']},{canceled:true}];await click(player,bot);
 assert.ok(fixture.fields.some(text=>text.includes('Type a question')));assert.ok(fixture.fields.some(text=>text.includes('240 characters')));
 assert.match(fixture.labels.at(-1),/5 iron ingots/);assert.equal(fixture.sounds.length,2);
});
test('a temporary busy UI is retried but an explicit cancellation is never retried',async()=>{
 const {player,bot,properties}=setup();properties.set(`${SCOPE}:owner`,player.id);
 fixture.forms=[{selection:0},{canceled:true,cancelationReason:'UserBusy'},{formValues:['How do I make bread?']},{canceled:true,cancelationReason:'UserClosed'}];await click(player,bot);
 assert.match(fixture.labels.at(-1),/3 wheat/);assert.equal(fixture.formsShown,4);
});
test('ownership and distance are rechecked after each conversation submission',async()=>{
 const {player,bot,properties}=setup();properties.set(`${SCOPE}:owner`,player.id);
 fixture.forms=[{selection:0},()=>{properties.set(`${SCOPE}:owner`,'someone-else');return {formValues:['What is a hopper?']}}];await click(player,bot);
 assert.match(fixture.messages.at(-1),/Only the robot owner/);assert.equal(fixture.formsShown,2);
 properties.set(`${SCOPE}:owner`,player.id);
 fixture.forms=[{selection:0},()=>{player.location={x:100,y:64,z:0};return {formValues:['What is a hopper?']}}];await click(player,bot);
 assert.match(fixture.messages.at(-1),/Move closer/);assert.equal(fixture.formsShown,4);
});
test('recent on-screen history is bounded and kept separate for different robots',async()=>{
 const {player,bot,properties}=setup();properties.set(`${SCOPE}:owner`,player.id);
 fixture.forms=[{selection:0},...['What is a hopper?','What is a furnace?','What is a chest?','What is a zombie?','What is a creeper?'].map(q=>({formValues:[q]})),{canceled:true}];await click(player,bot);
 assert.doesNotMatch(fixture.labels.at(-1),/You: What is a hopper/);assert.match(fixture.labels.at(-1),/What is a creeper/);
 const next=fixture.labels.length;fixture.forms=[{selection:0},{canceled:true}];await click(player,{...bot,id:'other-robot'});
 assert.doesNotMatch(fixture.labels[next],/What is a creeper/);
 fixture.forms=[{selection:0},{canceled:true}];await click(player,bot);assert.match(fixture.labels.at(-1),/What is a creeper/);
});
