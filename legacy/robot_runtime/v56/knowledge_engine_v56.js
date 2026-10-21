// Offline, dependency-free ES module. Generated data is injected at build time.
export function normalize(text) { return String(text || '').toLowerCase().replace(/minecraft:/g,'').replace(/[_-]/g,' ').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim(); }
export function resolve(query, catalog, aliases, category=null) {
 const key=normalize(query); if(!key) return {status:'unknown',records:[]};
 let ids=aliases[key]||[];
 if(category) ids=ids.filter(id=>catalog[id]?.category===category);
 const records=ids.map(id=>catalog[id]).filter(Boolean);
 return {status:records.length===0?'unknown':records.length===1?'found':'ambiguous',records};
}
export function answer(query, catalog, aliases, category=null) {
 const match=resolve(query,catalog,aliases,category);
 if(match.status==='unknown')return {status:'unknown',text:'I do not have that information verified yet.'};
 if(match.status==='ambiguous')return {status:'ambiguous',choices:match.records.map(r=>({id:r.id,category:r.category,label:r.label}))};
 const r=match.records[0],d=r.data;
 if(r.category==='enchantment')return {status:'found',text:`${r.label}: ${d.effect_summary || 'Effect unverified'}. Maximum level: ${d.maximum_level ?? 'unknown'}.`,verifiedInGame:false};
 if(r.category==='recipe')return {status:'found',text:`${r.label} has ${d.variant_count ?? d.variants?.length ?? 0} recorded recipe variation(s).`,variants:d.variants,verifiedInGame:false};
 if(r.category==='loot_item')return {status:'found',text:`${r.label} appears in ${d.possible_sources.length} possible loot source entries. These are not guaranteed drops.`,sources:d.possible_sources,verifiedInGame:false};
 if(r.category==='biome')return {status:'found',text:`${r.label} is recorded in the supplied Bedrock biome definitions.`,climate:d.climate,tags:d.tags,verifiedInGame:false};
 if(r.category==='block'||r.category==='item')return {status:'found',text:`${r.label}: sample definition available.`,components:d.component_names,verifiedInGame:false};
 return {status:'found',record:r,verifiedInGame:false};
}
export function ingredientUses(name, graph) {const key=String(name||'').toLowerCase();return graph[key]||graph['minecraft:'+key.replace(/^minecraft:/,'')]||[];}
