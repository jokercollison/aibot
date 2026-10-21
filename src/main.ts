import {world, system, Entity, Player, EntityTameableComponent} from '@minecraft/server';
import {ActionFormData, ModalFormData, FormCancelationReason} from '@minecraft/server-ui';
import {VERSION,SCOPE,ROBOT_ID,SOUND_ID} from './build-info.js';
import {HELP} from './help.js';
import {createConversation} from './knowledge.js';
import banter from '../data/banter.json';
import {owns, safeName, decodeHome, canWarn} from './state.js';
const ROBOT = ROBOT_ID;
const ROBOT_TYPES = new Set([ROBOT]);
let soundFailureLogged = false;
const key = (k: string) => `${SCOPE}:${k}`;
const owner = (bot: Entity) => bot.getDynamicProperty(key('owner')) as string | undefined;
type ConversationSession = {engine: ReturnType<typeof createConversation>; turns: {question:string;answer:string}[]};
const conversations = new Map<string, ConversationSession>();
const busy = new Set<string>();
const lastWarning = new Map<string, number>();
function assertOwner(player: Player, bot: Entity) {
  if (!player.isValid || !bot.isValid || !owns(player.id, owner(bot))) throw new Error('Only the robot owner can use this control.');
  if (bot.dimension.id !== player.dimension.id || distance2(bot.location, player.location) > 144) throw new Error('Move closer to your robot.');
}
function distance2(a: {x:number;y:number;z:number}, b: {x:number;y:number;z:number}) {return (a.x-b.x)**2+(a.y-b.y)**2+(a.z-b.z)**2;}
function say(player: Player, bot: Entity, text: string) {
  player.sendMessage(`§b[${safeName(bot.nameTag)}]§r ${text}`);
  playChirp(player);
}
function playChirp(player: Player) {
  try {player.playSound(SOUND_ID, {volume: 0.7, pitch: 1});}
  catch (error) {
    if (!soundFailureLogged) {console.warn(`AI Bot sound playback failed: ${String(error)}`);soundFailureLogged=true;}
  }
}
function mode(bot: Entity, following: boolean) {
  bot.triggerEvent(`${SCOPE}:follow_${following?'on':'off'}`);
  bot.setDynamicProperty(key('mode'), following ? 'follow' : 'stay');
}
// Forms submit once, so present the next turn automatically after the UI closes.
const nextTick = () => new Promise<void>(resolve => system.run(resolve));
async function talk(player: Player, bot: Entity) {
  const sessionKey = `${player.id}:${bot.id}`;
  if (!conversations.has(sessionKey)) conversations.set(sessionKey, {engine:createConversation(),turns:[]});
  const session = conversations.get(sessionKey)!;
  let busyRetries = 0;
  let prompt = '';
  while (player.isValid && bot.isValid) {
    assertOwner(player, bot);
    const transcript = session.turns.map(turn => `§bYou: ${turn.question.replace(/§./g,'')}§r\n§e${safeName(bot.nameTag)}: ${turn.answer.replace(/§./g,'')}§r`).join('\n\n');
    const response = await new ModalFormData().title(`${safeName(bot.nameTag)} — v${VERSION}`)
      .label(transcript || 'Ask me about Minecraft. You can keep asking follow-up questions here. Close this window whenever you are done.')
      .textField(prompt || 'Your message', session.turns.length ? 'Ask a follow-up or a new question' : 'What is a hopper?')
      .submitButton('Send').show(player);
    // Explicit close/Back/Escape ends the loop. Only retry a temporary UI conflict.
    if (response.canceled) {
      if (response.cancelationReason === FormCancelationReason.UserBusy && busyRetries++ < 3) {await nextTick();continue;}
      return;
    }
    busyRetries = 0;
    assertOwner(player, bot);
    // Static labels can be represented differently across clients; only one text input exists.
    const question = String(response.formValues?.find(value => typeof value === 'string') ?? '').trim();
    if (!question || question.length > 240) {
      prompt = question ? 'Please keep your message to 240 characters or fewer.' : 'Type a question, or close the window to finish.';
      await nextTick();continue;
    }
    prompt = '';
    const answer = session.engine.ask(question).answer;
    session.turns.push({question,answer});
    // Bound recent history while always keeping the entire latest answer visible.
    while (session.turns.length > 4 || (session.turns.length > 1 && session.turns.reduce((n,t) => n+t.question.length+t.answer.length,0) > 6000)) session.turns.shift();
    playChirp(player);
    await nextTick();
  }
}
async function interact(player: Player, bot: Entity) {
  if (busy.has(player.id)) return;
  busy.add(player.id);
  try {
    if (!bot.isValid || !player.isValid) return;
    if (!owner(bot)) {
      // Claim synchronously, before any form await: competing players cannot both claim.
      const tame = bot.getComponent('minecraft:tameable') as EntityTameableComponent | undefined;
      if (!tame || !tame.tame(player)) throw new Error('Robot ownership could not be established.');
      bot.setDynamicProperty(key('owner'), player.id);
      bot.setDynamicProperty(key('name'), 'TTR-1');
      bot.setDynamicProperty(key('warnings'), true);
      bot.setDynamicProperty(key('defend'), false);
      bot.setDynamicProperty(key('home'), JSON.stringify({...bot.location, dimension:bot.dimension.id}));
      bot.nameTag = 'TTR-1';
      mode(bot, false);
      say(player, bot, `${banter.greeting[0]} I'm your AI companion! Use Talk to me for questions, Things to try for examples, or Settings to give me a name.`);
    }
    assertOwner(player, bot);
    const form = await new ActionFormData().title(`${bot.nameTag || 'TTR-1'} — v${VERSION}`).body('Your AI companion. Ask me a question or choose what we do next.')
      .button('Talk to me').button('Follow me').button('Stay here').button('Set home here').button('Return home').button('Settings').button('Things to try').button('Test robot sound').show(player);
    if (form.canceled) return;
    assertOwner(player, bot);
    switch (form.selection) {
      case 0: await talk(player, bot); break;
      case 1: mode(bot, true); say(player, bot, "I'm right behind you!"); break;
      case 2: mode(bot, false); say(player, bot, "I'll wait here for you."); break;
      case 3:
        bot.setDynamicProperty(key('home'), JSON.stringify({...bot.location, dimension:bot.dimension.id}));
        say(player, bot, 'Home position saved.'); break;
      case 4: {
        const home = decodeHome(String(bot.getDynamicProperty(key('home')) ?? ''));
        if (!home) {say(player, bot, 'No usable home position saved.'); break;}
        if (home.dimension !== bot.dimension.id) {say(player, bot, 'Home is in another dimension. Bring me there first.'); break;}
        // Collision checking and a loaded destination are required; never force into blocks.
        const arrived = bot.tryTeleport({x:home.x,y:home.y,z:home.z}, {checkForBlocks:true});
        if (arrived) mode(bot, false);
        say(player, bot, arrived ? 'Home sweet charging station.' : 'Home is blocked or unloaded. Move nearer or set a new home.');
        break;
      }
      case 7: {
        playChirp(player);
        player.sendMessage('Robot sound test sent. If it was silent, check your sound volume and that the AI Bot resource pack is active.');
        break;
      }
      case 6: {
        await new ActionFormData().title('Things to try').body(HELP).button('Got it!').show(player);
        break;
      }
      case 5: {
        const settings = await new ModalFormData().title('Robot settings')
          .textField('Name (24 characters)', 'TTR-1', {defaultValue: String(bot.getDynamicProperty(key('name')) ?? 'TTR-1')})
          .toggle('Defend owner when attacked', {defaultValue: bot.getDynamicProperty(key('defend')) === true})
          .toggle('Nearby danger warnings', {defaultValue: bot.getDynamicProperty(key('warnings')) !== false}).show(player);
        if (settings.canceled) break;
        assertOwner(player, bot);
        const name = safeName(settings.formValues?.[0]);
        bot.setDynamicProperty(key('name'),name);bot.nameTag=name;
        const defend = settings.formValues?.[1] === true;
        bot.triggerEvent(`${SCOPE}:defend_${defend?'on':'off'}`);
        bot.setDynamicProperty(key('defend'),defend);
        bot.setDynamicProperty(key('warnings'),settings.formValues?.[2] === true);
        say(player,bot,'Settings saved.'); break;
      }
    }
  } catch (error) {
    if (player.isValid) player.sendMessage(`Robot: ${error instanceof Error ? error.message : 'Please try again.'}`);
  } finally {busy.delete(player.id);}
}
world.beforeEvents.playerInteractWithEntity.subscribe(event => {
  if (!ROBOT_TYPES.has(event.target.typeId)) return;
  event.cancel = true;
  system.run(() => {void interact(event.player,event.target);});
});
world.afterEvents.playerLeave.subscribe(event => {
  busy.delete(event.playerId);
  for (const id of conversations.keys()) if (id.startsWith(event.playerId + ':')) conversations.delete(id);
});
// One bounded scan per second. Only nearby loaded robots; deduplicate multiplayer overlap.
system.runInterval(() => {
  const seen = new Set<string>();
  for (const player of world.getAllPlayers()) {
    for (const bot of player.dimension.getEntities({families:[SCOPE], location:player.location, maxDistance:24, closest:8})) {
      if (!ROBOT_TYPES.has(bot.typeId) || seen.has(bot.id) || !owns(player.id,owner(bot))) continue;
      seen.add(bot.id);
      try {
        if (bot.getDynamicProperty(key('warnings')) === false || !canWarn(system.currentTick,lastWarning.get(bot.id))) continue;
        let line: string | undefined;
        if (player.dimension.getEntities({type:'minecraft:creeper',location:player.location,maxDistance:10,closest:1}).length) line=banter.creeper_nearby[0];
        if (!line) {
          const p=player.location;
          scan: for (let x=-2;x<=2;x++) for (let z=-2;z<=2;z++) {
            if (player.dimension.getBlock({x:Math.floor(p.x)+x,y:Math.floor(p.y)-1,z:Math.floor(p.z)+z})?.typeId === 'minecraft:lava') {line=banter.lava_nearby[0];break scan;}
          }
        }
        const health=player.getComponent('minecraft:health');
        if (!line && health && health.currentValue <= 6) line=banter.low_health[0];
        if (line) {say(player,bot,line);lastWarning.set(bot.id,system.currentTick);}
      } catch (error) {console.warn(`Robot scan: ${String(error)}`);}
    }
  }
  // Bound transient memory even when robots are removed or chunks unload.
  for (const id of lastWarning.keys()) if (!seen.has(id)) lastWarning.delete(id);
  if (conversations.size > 128) conversations.clear();
},20);
console.info('Time Trap Robot development build loaded.');
