export function createKnowledgeEngine(db) {
  const normalize = s => String(s ?? '').toLowerCase().replace(/^minecraft:/, '').replace(/[_-]/g, ' ').replace(/[^a-z0-9: ]/g, ' ').replace(/\s+/g, ' ').trim();
  const aliasMap = new Map(Object.entries(db.aliases).map(([k,v]) => [normalize(k),v]));
  const kinds = ['entity','block','item','enchantment','biome','recipe','brewing','loot_item'];
  const classify = q => {
    if (/\b(craft|make|recipe|ingredients|build)\b/.test(q)) return 'craft';
    if (/\b(drops?|loot|obtains?|find|where|locat|spawn)\b/.test(q)) return 'source';
    if (/\b(breed|tame|fear|scared|lava|burn|drown|attack|health|damage)\b/.test(q)) return 'mob_behavior';
    if (/\b(enchant|level|compatible)\b/.test(q)) return 'enchantment';
    return 'describe';
  };
  function lookup(question, {kind=null}={}) {
    const q=normalize(question),intent=classify(q);
    const candidates=[];
    for (const [alias, ids] of aliasMap) {
      if (alias.length < 3 || !(` ${q} `).includes(` ${alias} `)) continue;
      for (const id of ids) {
        const record=db.records[id];
        if (!record || (kind && record.kind!==kind)) continue;
        const kindBoost=(intent==='craft' && ['item','block'].includes(record.kind)) || (intent==='mob_behavior' && record.kind==='entity') || (intent==='enchantment' && record.kind==='enchantment');
        candidates.push({id,record,score:alias.length+(kindBoost?12:0)});
      }
    }
    candidates.sort((a,b)=>b.score-a.score || a.id.localeCompare(b.id));
    if (!candidates.length) return {status:'unknown',intent,answer:'I do not have enough verified information to answer that yet.'};
    const best=candidates[0];
    const competing=candidates.filter(c=>c.score===best.score && c.record.minecraft_id!==best.record.minecraft_id);
    if (competing.length) return {status:'ambiguous',intent,candidates:[best,...competing].map(x=>({id:x.id,name:x.record.name,kind:x.record.kind}))};
    const r=best.record;
    if (intent==='craft') {
      const ids=r.crafting_recipe_ids||[];
      if (!ids.length) return {status:'not_established',intent,id:r.id,answer:`I don't have a verified crafting recipe for ${r.name}. That doesn't mean it is unobtainable.`};
      const variants=ids.flatMap(id => db.records[id]?.data?.variants || []);
      return {status:'found',intent,id:r.id,recipes:variants,source_ids:ids,answer:variants.length?`${r.name} has ${variants.length} recipe variation(s) in the supplied Bedrock samples.`:`A recipe reference exists for ${r.name}, but its details need review.`};
    }
    if (intent==='mob_behavior') {
      if (r.kind!=='entity') return {status:'needs_clarification',intent,id:r.id};
      const facts=r.technical_profile?.facts;
      if (!facts) return {status:'not_established',intent,id:r.id,answer:`I have ${r.name} in the registry, but its behavior isn't verified here.`};
      return {status:'evidence_only',intent,id:r.id,facts,answer:`I found technical behavior evidence for ${r.name}, but conditional effects need interpretation before a definite gameplay answer.`};
    }
    if (intent==='source') return {status:'evidence_only',intent,id:r.id,possible_loot_ids:r.possible_loot_record_ids||[],answer:`I have a registry record for ${r.name}, but not a complete verified list of where to find it.`};
    return {status:'found',intent,id:r.id,kind:r.kind,name:r.name,source:r.source,answer:`${r.name} is listed as a Minecraft ${r.kind} in the supplied Bedrock data.`};
  }
  return {lookup};
}
