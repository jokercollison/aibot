const assert=require('assert');const {query}=require('../scripts/cross_category_engine');
const checks=[['What does sharpness enchantment do?','enchantments'],['How do I brew a long nightvision potion?','brewing'],['Where can I find acacia logs in loot?','loot'],['Tell me about snowy slopes biome','biomes'],['How do I craft a bookshelf?','methods']];
for(const [q,c] of checks){const r=query(q);assert.equal(r.category,c,q);assert.equal(r.status,'found',JSON.stringify(r));}
assert.equal(query('what is the meaning of life').status,'unsupported_intent');console.log('v43 cross-category: 6 tests passed');
