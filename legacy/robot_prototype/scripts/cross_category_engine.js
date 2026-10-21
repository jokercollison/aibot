// Offline cross-category resolver. Works with Node tests; bundle can be compiled into a Bedrock script module.
const data=require('../knowledge/cross_category_v43.json');
const norm=s=>String(s||'').toLowerCase().replace(/minecraft:/g,'').replace(/[_-]/g,' ').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const label=s=>String(s||'').replace(/^minecraft:/,'').replace(/_/g,' ');
const keys={};for(const [cat,entries] of Object.entries(data))keys[cat]=Object.keys(entries).sort((a,b)=>b.length-a.length);
function subject(q,cat){let n=norm(q).replace(/\blogs\b/g,'log').replace(/\bpotions\b/g,'potion');for(const k of keys[cat])if(new RegExp('(^| )'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'( |$)').test(n))return k;return null;}
function intent(q){const n=norm(q);
 if(/enchant|enchantment|maximum level|max level|compatible/.test(n))return 'enchantments';
 if(/brew|brewing|potion/.test(n))return 'brewing';
 if(/drop|loot|chest|where can i find|where do i find|obtain|source/.test(n))return 'loot';
 if(/biome|climate|temperature/.test(n))return 'biomes';
 if(/craft|recipe|smelt|smith|make/.test(n))return 'methods';
 return null;}
function query(q){let cat=intent(q);if(!cat)return {status:'unsupported_intent',answer:'Could you ask about an enchantment, brewing recipe, biome, crafting method, or loot source?'};
 let k=subject(q,cat);if(!k)return {status:'unknown_subject',category:cat,answer:'Which '+cat.replace(/s$/,'')+' do you mean?'};
 let v=data[cat][k];
 if(cat==='enchantments')return {status:'found',category:cat,subject:k,answer:label(v.id)+' — '+(v.effect||'Effect not verified')+'. Maximum level: '+(v.max_level??'unverified')+'. Equipment: '+(v.equipment.join(', ')||'unverified')+'.',verification:v.level_status,source:'Bedrock enchantment reference v35'};
 if(cat==='brewing')return {status:'found',category:cat,subject:k,answer:'Known brewing route for '+k+': '+label(v[0].input)+' + '+label(v[0].reagent)+'.'+(v.length>1?' '+v.length+' transformations indexed.':''),source:v[0].source,possible_routes:v.length};
 if(cat==='loot')return {status:'found',category:cat,subject:k,answer:k+' appears in '+v.length+' loot-table entries, including '+v.slice(0,3).map(x=>x.table).join('; ')+'. These are possible loot sources, not guaranteed drops or locations.',possible_sources:v.length,source:'Bedrock loot tables'};
 if(cat==='biomes')return {status:'found',category:cat,subject:k,answer:'Biome '+k+'. Tags: '+v.tags.slice(0,10).join(', ')+'. This is biome metadata, not a verified route to locate it.',source:v.source};
 return {status:'found',category:cat,subject:k,answer:k+' has '+v.length+' recipe-method entries: '+[...new Set(v.map(x=>x.method))].join(', ')+'. For exact ingredient layout, consult the detailed recipe index.',source:'Bedrock recipe methods'};}
module.exports={query,intent,subject};
