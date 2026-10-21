// Version 60: offline, deterministic, source-aware question answering.
// No network or experimental Bedrock APIs required.
export function createKnowledgeEngineV60(db) {
  const records = db.records;
  const norm = s => String(s ?? '').toLowerCase().replace(/^minecraft:/,'').replace(/[_-]/g,' ').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  const articles = /^(?:a|an|the|some) /;
  const index = new Map();
  for (const r of Object.values(records)) {
    if (!['item','block','entity','enchantment','biome','loot_item'].includes(r.kind)) continue;
    const aliases = new Set([norm(r.name),norm(r.minecraft_id)]);
    for (const a of aliases) { if (!a || a.length < 3) continue; if (!index.has(a)) index.set(a,[]); index.get(a).push(r); }
  }
  const aliases=[...index.keys()].sort((a,b)=>b.length-a.length);
  function intent(q) {
    if (/\b(?:craft|crafting|recipe|ingredients|make|create)\b/.test(q)) return 'craft';
    if (/\b(?:brew|brewing|potion|reagent)\b/.test(q)) return 'brew';
    if (/\b(?:enchant|enchantment|maximum level|max level|compatible)\b/.test(q)) return 'enchant';
    if (/\b(?:drop|drops|loot)\b/.test(q)) return 'loot';
    if (/\b(?:fear|scared|avoid|drown|breath|lava|fire|burn|tame|breed|attack|health|hostile)\b/.test(q)) return 'mob';
    if (/\b(?:where|find|locate|obtain|get|spawn)\b/.test(q)) return 'where';
    return 'describe';
  }
  const stop = answer => ({status:'not_established',answer});
  function ask(question) {
    const q=norm(question), mode=intent(q);
    let matches=[];
    for(const a of aliases) if (` ${q} `.includes(` ${a} `)) {
      for(const r of index.get(a)) {
        const pref = mode==='mob'?'entity':mode==='enchant'?'enchantment':mode==='craft'?'item':null;
        const score=a.length*3 + (r.kind===pref?100:0) + (r.kind==='item'?2:0) + (r.technical_profile?25:0);
        matches.push({r,score,matched:a});
      }
    }
    matches.sort((a,b)=>b.score-a.score||a.r.id.localeCompare(b.r.id));
    const chosen=matches[0];
    if (!chosen) return {status:'unknown',intent:mode,answer:'I do not have verified information for that question yet.'};
    const r=chosen.r;
    if (mode==='craft') {
      const ids=r.crafting_recipe_ids||[];
      if (!ids.length) return {...stop(`I do not have a crafting recipe for ${r.name} in the supplied samples. It may be obtained another way.`),intent:mode,entity:r.minecraft_id};
      const variants=ids.flatMap(id=>records[id]?.data?.variants||[]);
      if (!variants.length) return {...stop(`I found recipe references for ${r.name}, but could not resolve the ingredients.`),intent:mode};
      return {status:'found',intent:mode,name:r.name,entity:r.minecraft_id,recipes:variants.map(v=>({method:v.method,station:v.station,pattern:v.pattern,key:v.key,ingredients:v.ingredients,result:v.result,source_file:v.source_file})),answer:`I found ${variants.length} recipe variation${variants.length===1?'':'s'} for ${r.name}.`,source_ids:ids};
    }
    if (mode==='enchant') {
      const er=r.kind==='enchantment'?r:matches.find(x=>x.r.kind==='enchantment')?.r;
      if(!er) return {...stop('Which enchantment do you mean?'),intent:mode};
      const p=er.technical_profile;
      if(!p) return {...stop(`I know the enchantment ${er.name}, but do not have its mechanics verified.`),intent:mode};
      return {status:'reference_pending_verification',intent:mode,name:er.name,max_level:p.maximum_level,equipment:p.equipment_family,effect:p.effect_summary,conflict_groups:p.conflict_groups,source:er.provenance,answer:`${er.name}: ${p.effect_summary||'effect not documented'}. Maximum level listed: ${p.maximum_level??'unknown'}. This reference still needs in-game verification.`};
    }
    if (mode==='mob') {
      const mr=r.kind==='entity'?r:matches.find(x=>x.r.kind==='entity')?.r;
      if(!mr) return {...stop('I could not identify a mob in that question.'),intent:mode};
      const p=mr.technical_profile;
      if(!p) return {...stop(`I know ${mr.name} exists, but I do not have its detailed behavior file.`),intent:mode,entity:mr.minecraft_id};
      return {status:'evidence_only',intent:mode,name:mr.name,entity:mr.minecraft_id,technical_profile:p,answer:`I have Bedrock behavior data for ${mr.name}, but the exact answer needs its conditions checked.`,source:mr.provenance};
    }
    if (mode==='loot' || mode==='where') {
      const loot=records['loot_item:'+norm(r.minecraft_id).replace(/ /g,'_')] || matches.find(x=>x.r.kind==='loot_item')?.r;
      const possible=loot?.data?.possible_sources||[];
      if(!possible.length) return {...stop(`I cannot verify where to obtain ${r.name} from this database yet.`),intent:mode,entity:r.minecraft_id};
      return {status:'possible_sources',intent:mode,name:r.name,possible_sources:possible,answer:`I found ${possible.length} possible loot-table source${possible.length===1?'':'s'} for ${r.name}; these are not guaranteed drops.`};
    }
    if (mode==='brew') return {...stop('Please specify a potion or brewing ingredient. Brewing transformations are stored, but the question needs a dedicated recipe matcher.'),intent:mode};
    return {status:'registry_only',intent:mode,name:r.name,kind:r.kind,entity:r.minecraft_id,answer:`${r.name} is recorded as a Minecraft ${r.kind}. I need more evidence for detailed gameplay claims.`};
  }
  return {ask,stats:()=>({records:Object.keys(records).length,indexTerms:index.size})};
}
