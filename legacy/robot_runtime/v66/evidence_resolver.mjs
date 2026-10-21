// Offline acquisition and spawning evidence resolver. Generated from Bedrock Samples.
// Does not use Node APIs, network, eval or runtime file reads. Import the JSON bundle at build time.
export function normalizeMinecraftId(value) {
  if (typeof value !== 'string') return null;
  let s=value.toLowerCase().trim().replace(/\s+/g,'_');
  if (!/^(minecraft:)?[a-z0-9_]+$/.test(s)) return null;
  return s.startsWith('minecraft:') ? s : `minecraft:${s}`;
}
export function createEvidenceResolver(data) {
  const acquisitions=data?.acquisitions ?? {};
  const spawning=data?.spawning ?? {};
  const lootTables=data?.lootTables ?? {};
  const byId=new Map();
  for (const [key, record] of Object.entries(acquisitions)) {
    const id=record.minecraft_id;
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push({...record, record_key:key});
  }
  return {
    acquisition(query, kind=null) {
      const id=normalizeMinecraftId(query);
      if (!id) return {status:'invalid_input'};
      let results=byId.get(id)??[];
      if (kind) results=results.filter(x=>x.kind===kind);
      if (!results.length) return {status:'unknown',minecraft_id:id};
      return {status:'found',minecraft_id:id,records:results,uncertainty:'Evidence only; do not claim all acquisition methods are known.'};
    },
    spawn(query) {
      const id=normalizeMinecraftId(query);
      if (!id) return {status:'invalid_input'};
      const result=spawning[id];
      return result ? {status:'found',...result} : {status:'unknown',minecraft_id:id};
    },
    lootTable(path) {
      if (typeof path!=='string' || !Object.hasOwn(lootTables,path)) return {status:'unknown'};
      return {status:'found',...lootTables[path]};
    }
  };
}
