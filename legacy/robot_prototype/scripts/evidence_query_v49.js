"use strict";
// Data extracted from user-supplied Bedrock Samples. No network required.
const entities = require('../knowledge/v49_entity_evidence.json');
const recipes = require('../knowledge/v49_recipe_relations.json');
const ingredientUses = require('../knowledge/v49_ingredient_uses.json');
const normalize = s => String(s ?? '').toLowerCase().replace(/^minecraft:/,'').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
const display = s => String(s).replace(/^minecraft:/,'').replace(/_/g,' ');
function lookupRecipe(id) {
 const key=normalize(id), records=recipes[key];
 if(!records)return {status:'unknown',subject:key,answer:'I do not have a verified recipe for that item. It might be obtained without crafting.'};
 return {status:'found',subject:key,variants:records.length,recipes:records};
}
function lookupIngredientUses(id) {
 const key=normalize(id), uses=ingredientUses[key];
 return uses ? {status:'found',ingredient:key,outputs:uses} : {status:'unknown',ingredient:key,outputs:[]};
}
function lookupMob(id,topic) {
 const key=normalize(id), mob=entities[key];
 if(!mob)return {status:'unknown',subject:key,answer:'I do not have a verified entity profile for that name.'};
 if(!topic)return {status:'found',subject:key,profile:mob};
 const category=normalize(topic);
 const aliases={drown:'breathing',drowning:'breathing',water:'breathing',lava:'fire_and_lava',fire:'fire_and_lava',afraid:'fear_and_avoidance',scared:'fear_and_avoidance',breed:'breeding',tame:'taming',fight:'combat',drop:'drops'};
 const field=aliases[category]||category;
 const evidence=mob.evidence[field];
 if(!evidence)return {status:'unsupported_topic',subject:key,topic:field};
 return {status:evidence.length?'evidence_found':'unverified',subject:key,topic:field,evidence,mechanics:mob.mechanics,source:mob.source,note:mob.interpretation_rule};
}
module.exports={lookupRecipe,lookupIngredientUses,lookupMob,normalize,display};
