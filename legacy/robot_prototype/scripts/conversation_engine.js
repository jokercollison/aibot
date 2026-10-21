// Deterministic, offline dialogue router. No cloud AI or unverified game claims.
const {query,eventLine}=require('./knowledge_engine');
const personality=require('../knowledge/personality.json');
const normalize=s=>String(s||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const intentPatterns=[
 ['greeting',/^(hi|hello|hey|good morning|good evening|yo|greetings)( robot| bot| buddy)?[ !.]*$/],
 ['thanks',/^(thanks|thank you|cheers|thx)( robot| bot)?[ !.]*$/],
 ['joke',/\b(joke|something funny|make me laugh)\b/],
 ['identity',/\b(who are you|what are you|your name)\b/],
 ['encouragement',/\b(i am lost|i m lost|i am scared|i m scared|help me survive)\b/]
];
function respond(text,seed=0){
 const q=normalize(text);if(!q)return {status:'clarify',answer:'Ask me a Minecraft question or say hello.'};
 for(const [intent,re] of intentPatterns){if(re.test(q)){
 const lines=personality[intent];return {status:'found',category:'conversation',intent,answer:lines[Math.abs(Math.floor(seed))%lines.length]};
 }}
 return query(text);
}
// Pure scheduling: caller supplies ticks. Does not access Minecraft APIs.
class DialogueScheduler{
 constructor(cooldowns={lava_nearby:600,creeper_nearby:160,nightfall:1200,low_health:400,rain:1200,idle:2400}){this.cooldowns=cooldowns;this.last=new Map();}
 maybe(event,ownerId,tick,seed=0){
  const key=String(ownerId)+'|'+event,delay=this.cooldowns[event]??400;
  const last=this.last.get(key);if(last!==undefined && tick-last<delay)return null;
  const line=eventLine(event,seed);if(!line)return null;
  this.last.set(key,tick);return line;
 }
 forget(ownerId){for(const key of this.last.keys())if(key.startsWith(String(ownerId)+'|'))this.last.delete(key);}
}
module.exports={respond,DialogueScheduler};
