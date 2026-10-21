// Offline, Bedrock-compatible knowledge evidence accessor. No imports or network calls.
export function createEvidenceAPI(records, profiles) {
  const byName = new Map();
  for (const [id, p] of Object.entries(profiles)) byName.set(p.name.toLowerCase(), id);
  function entity(name) {
    const id = byName.get(String(name).trim().toLowerCase());
    if (!id) return {status:'unknown', message:'I do not have an entity profile for that name.'};
    return {status:'found', ...profiles[id]};
  }
  function mechanic(name, topic) {
    const found = entity(name);
    if (found.status !== 'found') return found;
    const evidence = found.extracted_facts.filter(f => f.topic === topic);
    return {status:evidence.length?'evidence_found':'not_documented', entity_id:found.entity_id, topic, evidence,
      caution:'Source components may be conditional; missing evidence does not mean the mechanic is absent.'};
  }
  function crafting(id) {
    const key = id.includes(':') && /^(item|block):/.test(id) ? id : 'item:minecraft:' + id.replace(/^minecraft:/,'');
    const r = records[key] || records[key.replace(/^item:/,'block:')];
    if (!r) return {status:'unknown'};
    const refs = (r.recipes || []).filter(x => records[x]);
    return {status:refs.length?'found':'not_documented', item_id:r.minecraft_id, recipe_ids:refs,
      variants:refs.flatMap(x => records[x].variants || []),
      caution:'No recipe in supplied samples does not mean the item is unobtainable.'};
  }
  return {entity,mechanic,crafting};
}
