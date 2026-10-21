// V61: canonical identity resolver. Pure JS, offline, no Node-only dependencies.
export function createResolver(bundle, aliases) {
  const records=bundle.records;
  const normalize=s=>String(s??'').toLowerCase().replace(/^minecraft:/,'').replace(/[_-]/g,' ').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  function resolve(name, kind) {
    const query=normalize(name);
    const ids=aliases[query]||[];
    const matches=ids.map(id=>records[id]).filter(Boolean).filter(r=>!kind||r.kind===kind);
    if(!matches.length)return {status:'unknown',query,matches:[]};
    if(matches.length>1)return {status:'ambiguous',query,matches:matches.map(r=>({id:r.id,kind:r.kind,name:r.name}))};
    return {status:'found',query,record:matches[0]};
  }
  function recipeFor(name,kind) {
    const result=resolve(name,kind);
    if(result.status!=='found')return result;
    const recipeIds=result.record.crafting_recipe_ids||[];
    const recipes=recipeIds.map(id=>records[id]).filter(Boolean);
    return {...result,recipes,craftable:recipes.length>0, note:recipes.length?'Recipe data available; verify edition and recipe unlock conditions.':'No crafting recipe linked in supplied sample; does not imply unobtainable.'};
  }
  return {resolve,recipeFor};
}
