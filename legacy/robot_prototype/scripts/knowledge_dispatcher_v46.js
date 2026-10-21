// Offline query dispatcher: preserves provenance and avoids unsupported certainty.
'use strict';
const {resolve:legacy}=require('./resolver_v45');
const data=require('../knowledge/integrated_v44.json');
const banter=require('../knowledge/banter.json');
const norm=s=>String(s||'').toLowerCase().replace(/minecraft:/g,'').replace(/[_-]/g,' ').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const nice=s=>String(s||'').replace(/^minecraft:/,'').replace(/_/g,' ');
const topics={breeding:/\b(breed|breeding|babies|baby)\b/,taming:/\b(tame|taming|pet)\b/,avoidance:/\b(scared|afraid|fear|flee|avoid|runs away)\b/,breathing:/\b(drown|drowning|breathe|breathing|underwater)\b/,fire:/\b(lava|fire|burn|burning)\b/,combat:/\b(hostile|friendly|attack|damage|health|fight)\b/};
const mobNames=[...new Set([...Object.keys(data.profiles),...Object.keys(data.mobs)])].sort((a,b)=>b.length-a.length);
function hasName(question,name){let q=' '+norm(question)+' ',n=norm(name);return q.includes(' '+n+' ')||q.includes(' '+n+'s ');}
function findMob(q){return mobNames.find(n=>hasName(q,n));}
function componentsFor(profile,kind){let components=profile?.components||{};let groups=profile?.component_groups||{};let matches=[];
 const patterns={breeding:/breed/,taming:/tame|trust/,avoidance:/avoid|panic|flee/,breathing:/breath|underwater/,fire:/fire|lava|damage_sensor|hurt_on_condition/,combat:/attack|health|damage|type_family/};
 let pattern=patterns[kind];if(!pattern)return [];
 for(const [key,val] of Object.entries(components))if(pattern.test(key))matches.push({scope:'base',component:key,value:val});
 for(const [group,values] of Object.entries(groups))for(const [key,val] of Object.entries(values))if(pattern.test(key))matches.push({scope:'conditional',group,component:key,value:val});
 return matches;
}
function mobQuery(question){const n=norm(question),kind=Object.entries(topics).find(([k,re])=>re.test(n))?.[0];if(!kind)return null;
 const name=findMob(question);if(!name)return null;
 const profile=data.profiles[name];const records=data.mobs[name]||[];
 const patterns={breeding:/breed/i,taming:/tame/i,avoidance:/avoid|fear|panic/i,breathing:/breath|water/i,fire:/fire|lava/i,combat:/attack|health|famil/i};
 const matching=records.filter(x=>patterns[kind].test(x.topic||''));
 const evidence=componentsFor(profile,kind);
 // An evidence record alone does not prove fire immunity, drowning, or fear: preserve the conditional scope.
 if(matching.length&&matching[0].answer)return {status:'evidence_with_caveat',intent:kind,category:'mobs',subject:name,answer:matching[0].answer,warning:matching[0].caveat||'Behavior can depend on conditions and Bedrock engine rules.',evidence_count:evidence.length,source:profile?.source||'Bedrock sample entity data'};
 return {status:evidence.length?'technical_evidence':'insufficient_evidence',intent:kind,category:'mobs',subject:name,answer:evidence.length?'I found '+evidence.length+' relevant behavior components for '+nice(name)+', but they do not establish a simple yes/no answer without evaluating conditions.':'I have no verified '+kind+' answer for '+nice(name)+' yet.',evidence:evidence.map(x=>({scope:x.scope,group:x.group||null,component:x.component})),source:profile?.source||null};
}
function conversation(question,context={}){const q=norm(question);let key=null;
 if(/\b(joke|funny|make me laugh)\b/.test(q))key='idle';
 else if(/\b(hello|hi|hey|greetings|good morning)\b/.test(q))key='greeting';
 else if(/\b(thanks|thank you)\b/.test(q))return {status:'conversation',intent:'thanks',answer:'You are welcome. My circuits appreciate good manners.'};
 if(!key)return null;
 const lines=banter[key]||[];if(!lines.length)return null;
 const index=(Number.isInteger(context.dialogueIndex)?context.dialogueIndex:0)%lines.length;
 return {status:'conversation',intent:key,answer:lines[index],nextDialogueIndex:(index+1)%lines.length};
}
function answer(question,context={}){
 const q=norm(question);if(!q)return {status:'clarify',answer:'What would you like to know?'};
 // Game knowledge takes precedence over banter if the question contains a factual intent.
 const mob=mobQuery(question);if(mob)return mob;
 const casual=conversation(question,context);if(casual)return casual;
 const result=legacy(question,context);
 if(result.status==='found'&&result.category==='recipes'&&result.variant_count>1)result.warning='Multiple recipes exist. The first variant is shown; choose a variant for an exact alternative.';
 if(result.category==='loot')result.warning='A loot-table entry is not proof of a guaranteed drop or a survival-obtainable source.';
 return result;
}
module.exports={answer,mobQuery,componentsFor,conversation};
