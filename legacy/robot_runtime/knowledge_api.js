// Minecraft Bedrock compatible: pure JS, no Node APIs, networking, or dynamic imports.
// Import generated category modules from your behavior-pack build as needed.
export function normalizeName(value) {
  return String(value || '').toLowerCase().replace(/^minecraft:/, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}
export function findExact(catalog, query, category) {
  const key = normalizeName(query);
  if (!key) return [];
  const matches = [];
  for (const id in catalog) {
    const record = catalog[id];
    if (category && record.category !== category) continue;
    if (normalizeName(record.label) === key || normalizeName(record.key) === key || normalizeName(id.split(':').slice(1).join(':')) === key) matches.push(record);
  }
  return matches;
}
export function evidencePolicy(record) {
  if (!record) return {ok:false, reason:'not_found'};
  if (!record.provenance) return {ok:false, reason:'no_provenance'};
  return {ok:true, verifiedInGame:record.provenance.verified_in_game === true, source:record.provenance.source};
}
export function answerOrUnknown(matches) {
  if (!matches.length) return {kind:'unknown', text:"I don't have a verified answer for that yet."};
  if (matches.length > 1) return {kind:'ambiguous', choices:matches.map(r => r.label)};
  return {kind:'record', record:matches[0], policy:evidencePolicy(matches[0])};
}
