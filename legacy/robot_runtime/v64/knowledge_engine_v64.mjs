// Minecraft AI V64: deterministic, dependency-free offline knowledge retrieval.
// Pass data from generated bundle; do not fetch, eval, or assume Node APIs.
export function createKnowledgeEngine(records, aliases, evidence) {
  const clean = s => String(s ?? '').toLowerCase().replace(/^minecraft:/,'').replace(/[_-]/g,' ').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  const kinds = new Set(['entity','block','item','recipe','enchantment','biome','brewing','loot_item']);
  function resolve(name, kind) {
    const key=clean(name);
    let ids=(aliases[key]||[]).filter(id=>records[id]&&(!kind||records[id].kind===kind));
    if (!ids.length && key.endsWith('s')) ids=(aliases[key.slice(0,-1)]||[]).filter(id=>records[id]&&(!kind||records[id].kind===kind));
    return ids.length ? {status:ids.length===1?'found':'ambiguous', ids, records:ids.map(id=>records[id])} : {status:'unknown', ids:[], records:[]};
  }
  function ask(question) {
    const q=clean(question);
    if (!q) return {status:'clarify',answer:'What would you like to know?'};
    const wantsRecipe=/\b(craft|recipe|ingredients|make|build)\b/.test(q);
    const wantsFear=/\b(scared|scares|afraid|fear|avoid)\b/.test(q);
    const wantsWater=/\b(drown|breathe|underwater|water)\b/.test(q);
    const wantsLava=/\b(lava|fire|burn|flame)\b/.test(q);
    const wantsBreeding=/\b(breed|breeding|baby|mate)\b/.test(q);
    const wantsEnchantment=/\b(enchant|enchantment|maximum level|max level)\b/.test(q);
    const kindsWanted=wantsRecipe?['block','item']:wantsFear||wantsWater||wantsLava||wantsBreeding?['entity']:wantsEnchantment?['enchantment']:['entity','block','item','enchantment','biome'];
    let matches=[];
    for(const [alias,ids] of Object.entries(aliases)) {
      if(alias.length<3 || !q.includes(alias) || (q.indexOf(alias)>0&&/[a-z0-9]/.test(q[q.indexOf(alias)-1])) || (q.indexOf(alias)+alias.length<q.length&&/[a-z0-9]/.test(q[q.indexOf(alias)+alias.length])))continue;
      for(const id of ids){const rec=records[id];if(rec&&kindsWanted.includes(rec.kind))matches.push({id,rec,length:alias.length});}
    }
    matches.sort((a,b)=>b.length-a.length || a.id.localeCompare(b.id));
    if(!matches.length)return {status:'unknown',answer:"I don't have enough verified information to answer that yet."};
    const longest=matches[0].length;const candidates=[...new Map(matches.filter(x=>x.length===longest).map(x=>[x.id,x])).values()];
    if(wantsRecipe){
      const linkIds=[...new Set(candidates.flatMap(x=>x.rec.recipes||[]))];
      const found=linkIds.map(id=>records[id]).filter(Boolean);
      if(!found.length)return {status:'unknown',subject:candidates[0].rec.name,answer:'I do not have a confirmed crafting recipe for that. It may be obtained another way.'};
      return {status:'found',intent:'recipe',subject:candidates[0].rec.name,recipes:found,source:found.map(r=>r.source)};
    }
    if(wantsFear||wantsWater||wantsLava||wantsBreeding){
      const entity=candidates.find(x=>x.rec.kind==='entity');if(!entity)return {status:'unknown',answer:'I could not identify the mob.'};
      const p=evidence[entity.id];const topics=wantsFear?['avoidance','fear']:wantsWater?['breathing_component','breathing']:wantsLava?['environmental_damage','fire_lava']:['breeding'];
      const facts=(p?.extracted_facts||[]).filter(f=>topics.some(t=>f.topic.includes(t)));
      return {status:facts.length?'evidence':'unknown',intent:'mob_mechanics',subject:entity.rec.name,topic:topics[0],evidence:facts,answer:facts.length?'I found technical behavior data, but its exact gameplay outcome needs verification.':'I do not have enough verified data to answer that.'};
    }
    if(candidates.length>1 && new Set(candidates.map(x=>x.rec.kind)).size>1)return {status:'ambiguous',options:candidates.map(x=>({id:x.id,kind:x.rec.kind,name:x.rec.name}))};
    return {status:'found',record:candidates[0].rec};
  }
  return {resolve,ask,recordCount:Object.keys(records).length,allowedKinds:[...kinds]};
}
