// Offline, deterministic retrieval. Source files are generated from Minecraft Bedrock Samples.
export function normalize(s) { return String(s||'').toLowerCase().replace(/^minecraft:/,'').replace(/[_-]+/g,' ').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim(); }
export function matchId(query, keys) {
  const q=normalize(query);
  const matches=keys.filter(k=>{const n=normalize(k); return q===n || q.endsWith(' '+n) || q.includes(' '+n+' ');});
  matches.sort((a,b)=>normalize(b).length-normalize(a).length || a.localeCompare(b));
  return matches[0] || null;
}
export function answerStructured(question, db) {
  const q=normalize(question);
  const recipeIntent=/\b(craft|make|recipe|ingredients|smelt|smith)\b/.test(q);
  const dropIntent=/\b(drop|drops|loot)\b/.test(q);
  const mobIntent=/\b(mob|entity|breed|tame|fear|afraid|drown|lava|burn|attack|health|creeper|zombie|cow)\b/.test(q);
  if (recipeIntent) { const id=matchId(question,Object.keys(db.recipes)); if(id) return {status:'found',category:'recipes',id,records:db.recipes[id]}; }
  if (mobIntent || dropIntent) { const id=matchId(question,Object.keys(db.entities)); if(id) return {status:'found',category:'entities',id,record:db.entities[id]}; }
  return {status:'unknown',reason:'No sufficiently matched record; do not guess.'};
}
