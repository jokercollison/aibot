import {normalizeName,findExact,answerOrUnknown} from '../knowledge_api.js';
import {records as entityRecords} from '../generated/entity_data.js';
import {records as recipeRecords} from '../generated/recipe_data.js';
function assert(ok,msg){if(!ok) throw new Error(msg)}
assert(normalizeName('Minecraft:Creeper')==='creeper','normalize');
assert(findExact(entityRecords,'creeper','entity').length===1,'creeper');
assert(findExact(recipeRecords,'hopper','recipe').length>=1,'hopper');
assert(answerOrUnknown([]).kind==='unknown','no hallucinations');
assert(answerOrUnknown(findExact(entityRecords,'creeper')).kind==='record','result');
console.log('5 Bedrock-safe module tests passed');
