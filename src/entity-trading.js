import inventory from '../data/entities/trade_inventory.json' with {type:'json'};
const levels=['novice','apprentice','journeyman','expert','master'];
export function tradeLevel(q) {
 const named=levels.find(level=>new RegExp(`\\b${level}\\b`).test(q));
 if(named)return named;
 const numeric=q.match(/\blevel ([1-5])\b/);return numeric?levels[Number(numeric[1])-1]:undefined;
}
export function tradeInventoryAnswer(id,q,variant) {
 if(!['minecraft:villager','minecraft:villager_v2','minecraft:wandering_trader'].includes(id))return null;
 if(['nitwit','unemployed'].includes(variant))return null;
 const level=tradeLevel(q);
 if(!level&&!/\b(?:sell|sells|buy|buys|offer|offers|stock|items|for sale)\b/.test(q))return null;
 const profile=id==='minecraft:wandering_trader'?'wandering trader':variant;
 if(!profile||!inventory[profile])return {status:'clarify',subject:id,topic:'trading',answer:'Which villager profession do you mean, such as farmer, armorer or librarian?'};
 if(id==='minecraft:wandering_trader')return {status:'conditional',subject:id,topic:'trading',...inventory[profile].rotating};
 if(!level)return {status:'clarify',subject:id,topic:'trading',answer:`Which ${profile} level: novice, apprentice, journeyman, expert or master? You can reply with just the level.`};
 return {status:'conditional',subject:id,topic:'trading',...inventory[profile][level]};
}
