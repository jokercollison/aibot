import {blockAnswer, blockTopic, blockRecipe, blockRecipeId} from './blocks.js';
import {affinityTopics} from './entity-affinities.js';
import {objectTopics} from './entity-objects.js';
import {movementTopics} from './entity-movement.js';
import {combatTopics} from './entity-combat.js';
import {rewardTopics} from './entity-rewards.js';
import {specialInteractionTopics} from './entity-facets.js';
import {entityAnswer, entityTopic, entityVariant, shortVariant, entityVariantAliases, entitySubjectAliases, entityObjectAliases, entityReferences, relatedEntityAnswer} from './entities.js';
import acquisitionIndex from '../data/acquisition_index.json' with {type:'json'};
import entityKnowledge from '../data/entity_knowledge.json' with {type:'json'};
import locationFacts from '../data/location_facts.json' with {type:'json'};
import descriptions from '../data/description_runtime.json' with {type:'json'};
import bundle from '../data/catalog.json' with { type: 'json' };
import aliases from '../data/aliases_v64.json' with { type: 'json' };
import facts from '../data/facts.json' with { type: 'json' };
import recipeIndex from '../data/recipe_index.json' with { type: 'json' };
import banter from '../data/banter.json' with { type: 'json' };

const records = {...bundle.records};
for(const [id,ref] of Object.entries(entityReferences)) {
 if(!Object.values(records).some(r=>r.minecraft_id===id)) {
  const key='entity:'+id;records[key]={id:key,minecraft_id:id,kind:'entity',name:ref.name,aliases:ref.aliases};
  descriptions[key]={what:ref.what,does:ref.does,coverage:'editorial_basic_summary'};
 }
}
const clean = s => String(s ?? '').toLowerCase().replace(/minecraft:/g, '').replace(/[_-]/g, ' ').replace(/\bpick axe\b/g, 'pickaxe').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const label = s => clean(s).replace(/\b\w/g, c => c.toUpperCase());
const unknown = "I'm not sure about that one yet. Try asking me how to craft something, or ask for a joke.";
const aliasIndex = new Map(Object.entries(aliases));
const byMinecraftId = new Map();
for (const record of Object.values(records)) {
  const id = record.minecraft_id.toLowerCase();
  if (!byMinecraftId.has(id)) byMinecraftId.set(id, []);
  byMinecraftId.get(id).push(record);
}
for (const record of Object.values(records)) {
  for (const term of [clean(record.name),clean(record.minecraft_id),...(record.aliases??[])]) {
    aliasIndex.set(term,[...new Set([...(aliasIndex.get(term) ?? []),record.id])]);
  }
}
for(const {id,alias} of [...entitySubjectAliases,...entityVariantAliases]) {
 const targets=(byMinecraftId.get(id)??[]).filter(r=>r.kind==='entity').map(r=>r.id);
 if(targets.length)aliasIndex.set(clean(alias),targets);
}
for(const [alias,id] of [['small dripleaf','minecraft:small_dripleaf_block'],['lily pad','minecraft:waterlily'],['powered rail','minecraft:golden_rail'],['slime block','minecraft:slime'],['monster spawner','minecraft:mob_spawner'],['cobweb','minecraft:web']]) {
  const targets=(byMinecraftId.get(id)??[]).map(r=>r.id);
  if(targets.length)aliasIndex.set(alias,targets);
}
const maxAliasWords = Math.max(...[...aliasIndex.keys()].map(a=>a.split(' ').length));
function subjects(text) {
  const words = clean(text).split(' '), found = [];
  for (let i = 0; i < words.length; i++) {
    for (let size = Math.min(maxAliasWords, words.length - i); size > 0; size--) {
      const term = words.slice(i, i + size).join(' ');
      const singular = term.endsWith('boxes') ? term.slice(0,-2) : term.endsWith('ies') ? term.slice(0, -3) + 'y' : term.endsWith('s') ? term.slice(0, -1) : term;
      const irregular = {wolves:'wolf',vexes:'vex',foxes:'fox',witches:'witch',endermen:'enderman',nautiluses:'nautilus','zombie nautiluses':'zombie nautilus','zombified pigmen':'zombified piglin','zombie pigmen':'zombified piglin'};
      const ids = aliasIndex.get(term) ?? aliasIndex.get(irregular[term] ?? singular) ?? aliasIndex.get(term + 's') ?? [];
      for (const id of ids) if (records[id]) found.push({record: records[id], size, start: i});
    }
  }
  return found.sort((a,b) => b.size - a.size || a.start - b.start);
}
const byOutput = new Map(Object.entries(recipeIndex.by_output));
const allRecipes = [...byOutput.values()].flat();
const uses = new Map();
const ingredientLabels = {
  'minecraft:stone_tool_materials': 'cobblestone',
  'minecraft:stone_crafting_materials': 'cobblestone',
  'minecraft:planks': 'wooden planks',
  'minecraft:wooden_slabs': 'wooden slabs',
  'minecraft:coals': 'coal or charcoal',
  'minecraft:logs': 'logs',
  'minecraft:wool': 'wool',
  'minecraft:egg': 'egg',
  'minecraft:mushrooms_for_stew': 'mushrooms',
  'minecraft:metal_nuggets': 'metal nugget',
  'minecraft:soul_fire_base_blocks': 'soul sand or soul soil'
};
function display(id) {
  if(id.startsWith('minecraft:potion_type:')) {
    let effect=id.slice('minecraft:potion_type:'.length);
    if(effect==='water') return 'water bottle';
    effect=effect.replace(/^long_/,'extended ').replace(/^strong_/,'strong ').replace('nightvision','night vision');
    return clean(effect)+' potion';
  }
  return clean(id);
}
const ingredientName = i => i.tag ? ingredientLabels[i.tag] ?? clean(i.tag) : display(i.id);
const plural = (name, count) => {
  if (count === 1 || /(?:s|wool|wheat|cobblestone|stone|deepslate|bread|sand|soil|coal|charcoal|quartz|glass|ice|sugar|paper|leather|beef|porkchop|mutton|chicken|fish|kelp|dye|redstone|copper|iron|gold|lapis lazuli)$/.test(name) || name.includes(' or ')) return name;
  return name.endsWith('ch') ? name + 'es' : name + 's';
};
const joinList = entries => entries.length < 3 ? entries.join(' and ') : entries.slice(0,-1).join(', ') + ', and ' + entries.at(-1);
function amounts(entries) {
  const grouped = new Map();
  for (const ingredient of entries) {
    const name = ingredientName(ingredient);
    grouped.set(name, (grouped.get(name) ?? 0) + ingredient.count);
  }
  return joinList([...grouped].sort((a,b) => b[1]-a[1]).map(([name,count]) => `${count} ${plural(name,count)}`));
}
for(const [output,recipes] of byOutput) for(const recipe of recipes) {
  for(const i of recipe.ingredients) {
    if(!i.id) continue;
    if(!uses.has(i.id)) uses.set(i.id,new Set());
    uses.get(i.id).add(display(output));
  }
}
// Create query subjects for source-backed recipe variants not represented as
// separate registry items (for example potion effects and locator maps).
for(const id of byOutput.keys()) {
  if(byMinecraftId.has(id.toLowerCase())) continue;
  const name=display(id),record={id:'recipe_subject:'+id,minecraft_id:id,kind:'item',name,source:'official_recipes'};
  records[record.id]=record;byMinecraftId.set(id.toLowerCase(),[record]);
  for(const term of [name,clean(id),...(id.startsWith('minecraft:potion_type:') ? ['potion of '+name.replace(/ potion$/,'')] : [])]) {
    aliasIndex.set(term,[...new Set([...(aliasIndex.get(term)??[]),record.id])]);
  }
}
function presentationRecipes(recipes) {
  // Only replace a concrete wood choice when an actual generic-planks recipe
  // for the SAME output has the same remaining ingredients and quantities.
  const signature=r=>r.method+'|'+r.ingredients.map(i=>{
    const id=i.tag==='minecraft:planks'||i.id?.endsWith('_planks')?'tag:planks':i.id??'tag:'+i.tag;
    return id+':'+i.count;
  }).sort().join('|');
  const generic=new Set(recipes.filter(r=>r.ingredients.some(i=>i.tag==='minecraft:planks')).map(signature));
  return recipes.filter(r=>!r.ingredients.some(i=>i.id?.endsWith('_planks'))||!generic.has(signature(r)));
}
export function recipeText(record) {
  const canonical=blockRecipeId(record.minecraft_id);
  if(canonical!==record.minecraft_id)return recipeText({...record,minecraft_id:canonical});
  const recipes=byOutput.get(record.minecraft_id.toLowerCase())??[];
  if(!recipes.length && record.kind==='block') {const fallback=blockRecipe(record.minecraft_id);if(fallback)return fallback;}
  if(!recipes.length)return {status:'unknown',answer:`I'm not sure how to craft ${clean(record.name)} yet. You might be able to get it another way.`};
  const lines=presentationRecipes(recipes).map(r=>{
    const name=display(record.minecraft_id);
    if(r.method==='shaped'||r.method==='shapeless')return `To craft ${name}, you'll need ${amounts(r.ingredients)}.`;
    if(r.method==='smithing_transform')return `To upgrade to ${name}, you'll need ${amounts(r.ingredients)} at a smithing table.`;
    if(r.method.startsWith('brewing_'))return `To brew ${name}, combine ${amounts(r.ingredients)} in a brewing stand fueled with blaze powder.`;
    if(r.method==='furnace')return `To make ${name}, process ${amounts(r.ingredients)} using ${joinList(r.stations.map(clean))}.`;
    return `I still need to learn the steps for ${name}.`;
  });
  return {status:'conditional',answer:[...new Set(lines)].join('\n'),sources:recipes.map(r=>r.source)};
}
function followup(record) {
  const name = clean(record.name);
  const topics = facts[record.minecraft_id] ?? {};
  const suggestions = [];
  if (byOutput.has(record.minecraft_id)) suggestions.push('How do I craft it?');
  if (topics.fear) suggestions.push('What scares it?');
  if (topics.danger) suggestions.push('Is it dangerous?');
  if (topics.breed) suggestions.push('How do I breed them?');
  return suggestions.length ? ` You can also ask: ${suggestions.slice(0,2).map(q => '"' + q + '"').join(' or ')}` : '';
}
export function createConversation() {
  let previous;
  let pendingChoice;
  let previousVariant;
  let previousEntityTopic;
  let pendingVariant;
  const engine = {
    ask(input) {
      const q = clean(input);
      if (!q) return {status: 'clarify', answer: 'What would you like to know about Minecraft?'};
      if (q.length > 240) return {status: 'clarify', answer: 'Please ask a shorter question (up to 240 characters).'};
      if(pendingVariant) {
        const picked=pendingVariant.options.find(v=>q===v || q===v+' wolf' || q==='the '+v+' one');
        if(picked) {
          const question=pendingVariant.question;pendingVariant=undefined;
          return this.ask(question.replace(/\b(?:white|brown) (?:wolf|wolves)\b/,picked+' wolf'));
        }
        pendingVariant=undefined;
      }
      if(previous?.kind==='entity'&&['minecraft:villager','minecraft:villager_v2'].includes(previous.minecraft_id)&&previousEntityTopic==='trading') {
        const level=q.match(/^(?:and |what about |how about )?(?:a |an |the )?(novice|apprentice|journeyman|expert|master|level [1-5])$/);
        if(level&&previousVariant)return this.ask(`What does ${level[1]} ${previousVariant} sell?`);
      }
      if(previous?.kind==='entity') {
        const effect=q.match(/^(?:and |what about |how about )(smite|bane of arthropods|impaling|poison|regeneration|regen)(?: then)?$/);
        if(effect)return this.ask(`Does ${effect[1]} work against entity:${previous.minecraft_id}?`);
      }
      if(previous?.kind==='entity'&&['breeding','breeding_conditions'].includes(previousEntityTopic)) {
        const age=q.match(/^(?:and |what about |how about )?(?:the )?(adults?|bab(?:y|ies))(?: then)?$/);
        if(age)return this.ask(`Can ${age[1]} entity:${previous.minecraft_id} breed?`);
      }
      if(previous?.kind==='entity'&&['experience','experience_baby'].includes(previousEntityTopic)) {
        const age=q.match(/^(?:and |what about |how about )?(?:a |an |the )?(adults?|bab(?:y|ies))(?: then)?$/);
        if(age)return this.ask(`How much XP does ${age[1]} entity:${previous.minecraft_id} drop?`);
      }
      if(previous?.kind==='entity') {
        const chosen=shortVariant(previous.minecraft_id,q);
        const relative=q.match(/\b(?:the )?([a-z]+) one\b/);
        const relativeChoice=relative&&shortVariant(previous.minecraft_id,relative[1]);
        if(relativeChoice)return this.ask(q.replace(relative[0],relativeChoice.aliases[0]));
        if(chosen) {
          const alias=chosen.aliases[0];
          const questions={
            spawning:`Where can I find ${alias}?`,
            spawn_conditions:`What conditions does ${alias} need to spawn?`,
            variants:`What variants does ${alias} have?`,
            health:`How much health does ${alias} have?`,
            drops:`What does ${alias} drop?`,
            experience:`How much XP does ${alias} drop?`,
            experience_baby:`How much XP does baby ${alias} drop?`,
            experience_breeding:`How much XP does breeding ${alias} give?`,
            equipment_drops:`What equipment does ${alias} drop?`,
            breeding:`How do I breed ${alias}?`,
            breeding_conditions:`What health conditions does ${alias} need for breeding?`,
            taming:`How do I tame ${alias}?`,
            diet:`What does ${alias} eat?`,
            healing:`How do I heal ${alias}?`,
            growth:`How does ${alias} grow?`,
            transport:`How do I ride ${alias}?`,
            trading:`How do I trade with ${alias}?`,
            lifetime:`Does ${alias} despawn?`,
            relocation:`How can I move ${alias}?`,
            teleportation:`Can ${alias} teleport?`,
            fire:`Can ${alias} survive lava?`,
            water:`Can ${alias} breathe underwater?`,
            sunlight:`Does ${alias} burn in sunlight?`,
            froglights:`Which froglight does ${alias} produce?`,
            milking:`What can I get by milking ${alias}?`,
            attack_style:`How does ${alias} attack?`,
            provocation:`Why is ${alias} attacking me?`,
            counterplay:`How do I defeat ${alias}?`,
            combat:`Is ${alias} dangerous?`
          };
          return this.ask(questions[previousEntityTopic]??`What is ${alias}?`);
        }
      }
      if(previous?.kind==='entity' && previousEntityTopic==='drops' && /^(?:and )?(?:with(?:out)? looting\b|when (?:killed|slain|shot|burning|on fire|a .+ (?:kills|shoots))\b|while burning\b|for (?:a )?(?:baby|babies|adults|small|medium|large)\b|on (?:easy|normal|hard)\b)/.test(q)) return this.ask(`What does entity:${previous.minecraft_id} drop ${q}?`);
      const choice=q.match(/^(?:a |an |the )?(mob|entity|animal|creature|block|item)(?: please)?$/);
      if(pendingChoice && choice) {
        const kind=['mob','entity','animal','creature'].includes(choice[1])?'entity':choice[1];
        if(!pendingChoice.candidates.some(r=>r.kind===kind)) return {status:'clarify',answer:'That was not one of the choices. Please choose one of the options I listed.'};
        const question=pendingChoice.question;pendingChoice=undefined;
        return this.ask(String(question)+' '+(kind==='entity'?'mob':kind));
      }
      if (/^(hi|hello|hey|greetings)$/.test(q)) return {status: 'dialogue', answer: banter.greeting[0]};
      if (/\b(joke|funny)\b/.test(q)) return {status: 'dialogue', answer: banter.idle[0]};
      if (/^(bye|goodbye|see you)$/.test(q)) return {status: 'dialogue', answer: 'Circuits on standby. See you on the next adventure!'};
      const definitionRequest = /^(?:what (?:is|are)|describe|tell me about)\b/.test(q) && !/\b(recipe|craft|make|ingredients|breeding|fear)\b/.test(q);
      const intent = /\b(health|hearts)\b/.test(q) ? 'health' : /\b(tame|taming)\b/.test(q) ? 'taming' : definitionRequest ? 'describe' : /\b(what can i (make|craft)|can i make with)\b/.test(q) ? 'uses' :
        /\b(scared|scares|afraid|fear|avoid)\b/.test(q) ? 'fear' :
        /\b(breed|breeding|mate)\b/.test(q) ? 'breed' :
        /\b(dangerous|danger|explode)\b/.test(q) ? 'danger' :
        /\b(make|craft|recipe|ingredients|build|brew|smelt|cook|upgrade)\b/.test(q) ? 'recipe' :
        /\b(where|find|obtain|spawn|drops|drop|get|deep|depth|height|biome|biomes)\b/.test(q) ? 'acquisition' :
        /\b(what is|what are|tell me about|describe|what does|what do|used for|uses for|how does|how do i use)\b/.test(q) ? 'describe' :
        /\b(drown|underwater|lava|fire|sunlight|eat|tame|kill|health|attack|damage)\b/.test(q) ? 'mechanic' : 'describe';
      if (intent === 'uses' && /\bwith iron$/.test(q)) return {status:'ambiguous',answer:'Do you mean iron ingots, raw iron, or iron blocks? Please include the material in your question.'};
      const matches = subjects(q).filter(x => intent === 'uses' ? ['item','block'].includes(x.record.kind) : ['entity','block','item','enchantment','biome'].includes(x.record.kind));
      if(!['recipe','uses'].includes(intent)) {
        const queryWords=q.split(' ');
        for(const {id,alias} of entityObjectAliases) {
          const term=clean(alias),start=queryWords.findIndex((_,i)=>queryWords.slice(i,i+term.split(' ').length).join(' ')===term);
          if(start<0)continue;
          for(const record of byMinecraftId.get(id)??[])if(record.kind==='entity')matches.push({record,size:term.split(' ').length,start});
        }
        matches.sort((a,b)=>b.size-a.size||a.start-b.start);
      }
      if(blockTopic(q) && blockTopic(q)!=='location' && !['recipe','uses'].includes(intent) && !/\b(?:mob|entity|animal|creature)\b/.test(q) && (!matches.some(m=>m.record.kind==='entity') || (blockTopic(q)==='mining' && /\b(?:mine|mining|break|breaking|harvest)\b/.test(q)))) {
        const blocks=matches.filter(m=>m.record.kind==='block');
        if(blocks.length)matches.splice(0,matches.length,...blocks);
      }
      if(previous?.kind==='block' && blockTopic(q) && /\b(?:it|its|them|they)\b/.test(q)) matches.splice(0,matches.length,{record:previous,size:1,start:0});
      let inheritedSubject=false;
      let scopedSpawnSubject=false;
      let scopedInteraction=false;
      if(previous?.kind!=='entity'&&affinityTopics.includes(entityTopic(q))&&/\b(?:on|against|to|hurt|heal|poison) (?:it|them)\b/.test(q))return {status:'unknown',answer:unknown};
      if(previous?.kind==='entity'&&affinityTopics.includes(entityTopic(q))&&/\b(?:on|against|to|hurt|heal|poison) (?:it|them)\b/.test(q)) {
        matches.splice(0,matches.length,{record:previous,size:1,start:0});inheritedSubject=true;
      }
      const shieldFollowup=previous?.kind==='entity'&&entityTopic(q)==='counterplay'&&/^(?:can|will|does) (?:a |my |the )?shield (?:protect me|help|block (?:it|that|its attack))$/.test(q);
      if(shieldFollowup){matches.splice(0,matches.length,{record:previous,size:1,start:0});inheritedSubject=true;}

      if(['trading','naming',...affinityTopics,...specialInteractionTopics,...rewardTopics,...combatTopics,...movementTopics,...objectTopics].includes(entityTopic(q))) {
        if(previous&&/\b(?:can|does|do|will|won t|doesn t|don t) (?:it|they)\b|\b(?:leash|bucket|feed|trust|collect|help|move|transport|relocate|bring) (?:it|them)\b/.test(q)) {matches.splice(0,matches.length);inheritedSubject=true;}
        else {
          const entities=matches.filter(m=>m.record.kind==='entity');
          if(entities.length) {
            const first=Math.min(...entities.map(m=>m.start));
            matches.splice(0,matches.length,...entities.filter(m=>m.start===first));scopedInteraction=true;
          }
        }
      }
      if(['spawning','spawn_conditions'].includes(entityTopic(q))) {
        const clause=q.match(/\b(?:won t|can t|doesn t|don t|does|do|can|will|would)\s+(.+?)\s+(?:(?:not|naturally|never|still|ever)\s+)*spawn\b/);
        if(clause) {
          if(previous&&/^(?:it|they|them)$/.test(clause[1].trim())) {matches.splice(0,matches.length);inheritedSubject=true;}
          else {
            const entities=subjects(clause[1]).filter(x=>x.record.kind==='entity');
            if(entities.length){matches.splice(0,matches.length,...entities);scopedSpawnSubject=true;}
          }
        }
      }
      if(entityTopic(q)==='drops') {
        const subjectClause=q.match(/\b(?:does|do|will|would|can)\s+(.+?)\s+(?:drop|drops|give|leave)\b/);
        const killedObject=q.match(/\b(?:kills?|killed(?! by)|slays?|shoots?)\s+(?:a |an |the )?(.+?)(?=\s+(?:what|when|if|with|using|and|does|do)\b|$)/);
        const fromClause=q.match(/\b(?:drops?|loot)\s+(?:from|of)\s+(.+?)(?=\s+(?:when|if|after|with)\b|$)/);
        for(const span of [subjectClause?.[1],killedObject?.[1],fromClause?.[1]]) {
          if(!span)continue;
          if(previous&&/^(?:it|they|them|its)$/.test(span.trim())) {matches.splice(0,matches.length);inheritedSubject=true;break;}
          const identified=subjects(span);
          if(identified.length) {matches.splice(0,matches.length,...identified);break;}
        }
      }
      if(['spawn_conditions','diet','healing','taming','breeding','transport','combat','fire','water','land','sunlight','rain','powder_snow','conversion','temperature','growth','age_lock','hatching','music','oxidation','naming','harvesting','storage','equipment','repair','milking','shearing','brushing'].includes(entityTopic(q))) {
        const actor=q.match(/\b(?:does|do|can|will|would|should|could|is|are)\s+(.+?)\s+(?:eat|eats|breed|heal|tame|ride|attack|survive|burn|burns|drown|freeze|breathe|live|grow|melt|immune|convert|converts|turn|transform|spawn)\b/);
        const object=q.match(/\b(?:tame|breed|heal|ride|brush|shear|repair|milk|equip|name|stop)\s+(?:a |an |the |my )?(.+?)(?=\s+(?:with|using|when|while|in|at|near)\b|$)/);
        const shorthand=q.match(/^(.+?)\s+(?:eat|eats)\b/);
        for(const span of [actor?.[1],object?.[1],shorthand?.[1]]) {
          if(!span)continue;
          if(previous&&/^(?:it|they|them|its)$/.test(span.trim())) {matches.splice(0,matches.length);inheritedSubject=true;break;}
          const identified=subjects(span);
          if(identified.length) {matches.splice(0,matches.length,...identified);break;}
        }
      }
      // In a feeding question, the food can have a longer catalog name than
      // the creature. Use the grammatical recipient before alias length.
      const feedTo=q.match(/\bfeed(?:ing)?\b.*?\bto\s+(.+)$/);
      const feedFirst=q.match(/\bfeed(?:ing)?\s+(?:a |an |the |my )?(.+)$/);
      const growthRecipient=entityTopic(q)==='growth'&&q.match(/\b(?:grow|mature|speed up|accelerate)\s+(.+?)(?=\s+(?:with|using)\b|$)/);
      const foodSubject=feedTo?.[1] ?? feedFirst?.[1] ?? growthRecipient?.[1];
      if(previous && entityTopic(q) && /\b(?:happens?|happen) to (?:it|them)\b|\b(?:turn|convert|shear|brush|milk|name|equip|repair) (?:it|them)\b/.test(q)) {matches.splice(0,matches.length);inheritedSubject=true;}
      if(foodSubject && !inheritedSubject) {
        const recipients=subjects(foodSubject).filter(x=>x.record.kind==='entity');
        if(recipients.length) {
          const first=recipients.reduce((a,b)=>a.start<b.start?a:b);
          matches.splice(0,matches.length,...recipients.filter(x=>x.start===first.start));
        }
      }
      if(previous && (/\b(?:feed|heal|breed|tame|grow|mature)\s+(?:it|them)\b/.test(q) || feedTo && /^(?:it|them)\b/.test(feedTo[1]))) matches.splice(0,matches.length);
      const exact = String(input).toLowerCase().match(/\b(?:(block|item|entity):)?(minecraft:(?:potion_type:)?[a-z0-9_]+)\b/);
      let candidates = matches.length ? matches.filter(m => m.size === matches[0].size && m.start === matches[0].start).map(m => m.record) : [];
      if (exact) candidates = (byMinecraftId.get(exact[2]) ?? []).filter(r => !exact[1] || r.kind === exact[1]);
      const kindHint = (scopedSpawnSubject||scopedInteraction) ? 'entity' : /\b(?:mob|animal|creature)\b/.test(q) && !/\bmob spawner\b/.test(q) ? 'entity' : /\bblock\b/.test(q) ? 'block' : /\bitem\b/.test(q) ? 'item' : null;
      if(!['block','item'].includes(kindHint) && (/\b(drop|drops|loot|dangerous)\b/.test(q) || ['spawn_conditions','health','variants','breeding','taming','diet','healing','transport','combat','brushing','shearing','age_lock','growth','fire','water','sunlight','rain','powder_snow','conversion','fall_damage','land'].includes(entityTopic(q))) && candidates.some(r=>r.kind==='entity'))candidates=candidates.filter(r=>r.kind==='entity');
      if (!exact && kindHint && candidates.some(r=>r.kind===kindHint)) candidates=candidates.filter(r=>r.kind===kindHint);
      candidates = [...new Map(candidates.map(r => [r.id,r])).values()];
      if (!candidates.length && /\b(it|they|them|its)\b/.test(q) && previous) candidates = [previous];
      if(!candidates.length&&previous?.kind==='entity'&&['breeding','breeding_conditions'].includes(entityTopic(q))&&/\b(?:baby|babies|adult|adults)\b/.test(q))candidates=[previous];
      if (!candidates.length) return {status: 'unknown', answer: unknown};
      // Block/item pairs with the same Minecraft id are the same subject for basic lookup.
      const ids = new Set(candidates.map(r => r.minecraft_id));
      if (ids.size > 1) {
        pendingChoice={question:input,candidates};
        return {status: 'ambiguous', answer: 'Which do you mean: ' + candidates.map(r => `${r.name} (${r.kind})`).join(', ') + '?'};
      }
      if (!exact && candidates.some(r=>r.kind==='entity') && new Set(candidates.map(r=>descriptions[r.id]?.what)).size>1) {
        pendingChoice={question:input,candidates};
        return {status:'ambiguous',answer:'Do you mean the mob, or the block/item with that name? Please include which one in your question.'};
      }
      const r = candidates.find(r => r.recipes?.length) ?? candidates[0];
      if(r.minecraft_id==='minecraft:wolf' && /\b(?:white|brown) (?:wolf|wolves)\b/.test(q)) {
        const options=/\bwhite\b/.test(q)?['snowy','pale']:['chestnut','woods','rusty'];
        pendingVariant={question:q,options};
        return {status:'ambiguous',answer:'Do you mean the '+options.join(', or ')+' wolf?'};
      }
      previousVariant = matches.length ? entityVariant(r.minecraft_id,q)?.name : r.minecraft_id === previous?.minecraft_id ? previousVariant : undefined;
      previous = r;
      previousEntityTopic=r.kind==='entity'?(intent==='danger'&&!entityTopic(q)?'combat':entityTopic(q)):undefined;
      pendingChoice=undefined;
      if((r.kind==='block' || ['minecraft:sugar_cane','minecraft:glow_berries'].includes(r.minecraft_id)) && intent!=='recipe' && intent!=='uses') {
        const answer=blockAnswer(r.minecraft_id,q);
        const existingLocation=locationFacts[r.minecraft_id]??Object.values(locationFacts).find(f=>f.related_ids?.includes(r.minecraft_id));
        if(answer && !(answer.topic==='location' && existingLocation))return answer;
      }
      if(r.kind!=='entity') {const related=relatedEntityAnswer(r.minecraft_id,q);if(related)return related;}
      if((r.kind==='entity' || entityReferences[r.minecraft_id]) && intent!=='fear' && (r.kind==='entity' || !['identity','behavior'].includes(entityTopic(q)))) {
        const answer=entityAnswer(r.minecraft_id,q,previousVariant,intent==='danger'&&!entityTopic(q)?'combat':undefined);
        if(answer)return ['identity','behavior'].includes(answer.topic)?{...answer,answer:answer.answer+followup(r)}:answer;
      }
      if (intent === 'recipe') return {...recipeText(r), subject: r.minecraft_id};
      if (intent === 'uses') {
        const results = [...(uses.get(r.minecraft_id) ?? [])];
        return {status: results.length ? 'conditional' : 'unknown', answer: results.length ? `Here are some things you can make with ${clean(r.name)}: ${results.slice(0,12).map(clean).join(', ')}.` : unknown};
      }
      if(intent==='acquisition') {
        const location=locationFacts[r.minecraft_id]??Object.values(locationFacts).find(f=>f.related_ids?.includes(r.minecraft_id));
        if(location)return {status:'conditional',subject:r.minecraft_id,topic:'location',answer:location.answer,sources:location.reference_urls};
        if(r.kind==='entity'&&/\b(drop|drops|loot)\b/.test(q)) {
          const drops=acquisitionIndex.entities[r.minecraft_id];
          if(drops?.length)return {status:'conditional',answer:`Depending on its form and the loot conditions, ${clean(r.name)} can drop ${joinList([...new Set(drops.flatMap(d=>d.possible_items))].map(display))}. These are possible drops, not a guaranteed list from every kill.`,sources:drops.map(d=>d.source)};
        }
        const entries=acquisitionIndex.items[r.minecraft_id];
        if(entries?.length && r.kind!=='entity') {
          const types=[...new Set(entries.map(e=>e.kind))];
          const options=types.map(t=>t==='chests'?'loot chests':t==='entities'?'certain mob drops':'certain block drops');
          return {status:'conditional',answer:`${clean(r.name)} can appear in ${joinList(options)}. The exact source and chance depend on the location and loot conditions; I do not yet know all of those details.`,sources:entries.map(e=>e.source)};
        }

      }
      const technical=entityKnowledge[r.minecraft_id]?.facts[intent==='breed'?'breeding':intent];
      if(r.kind==='entity'&&technical)return {status:'conditional',answer:technical.answer,sources:[entityKnowledge[r.minecraft_id].source]};
      const f = facts[r.minecraft_id]?.[intent];
      if (f) return {status: f.status, answer: f.text, sources: [f.source]};
      if(r.kind==='entity' && entityTopic(q)) return {status:'unknown',subject:r.minecraft_id,topic:entityTopic(q),answer:`I'm not sure about that yet. Could you ask me something else about ${clean(r.name)}?`};
      if(r.kind==='entity' && !entityTopic(q) && /^(?:can|could|will|would|does|do|is|are|why|when|how|what (?:does|do|can))\b/.test(q)) return {status:'unknown',subject:r.minecraft_id,answer:unknown};
      if(r.kind==='block' && blockTopic(q) && blockTopic(q)!=='operation') return {status:'unknown',subject:r.minecraft_id,topic:blockTopic(q),answer:`I'm still learning about that part of ${clean(r.name)}. Could you ask me something else about it?`};
      if (intent !== 'describe') return {status: 'unknown', answer: unknown};
      if (r.kind === 'enchantment' && r.effect) {
        const equipment = (r.equipment ?? []).map(e => e === 'durable_equipment' ? 'items with durability' : clean(e));
        return {status:'conditional',answer:`${r.name}: ${r.effect.replace(/[.!]+$/,'')}.${r.maximum_level ? ` Its highest level is ${r.maximum_level}.` : ''}${equipment.length ? ` It works on ${joinList(equipment)}.` : ''}`,sources:[r.source]};
      }
      const description = descriptions[r.id];
      if (description) {
        const hint = followup(r);
        return {status:'conditional',answer:description.what + ' ' + description.does + hint,sources:['descriptions:'+r.id],coverage:description.coverage};
      }
      return {status:'partial',answer:`I'm still learning about ${clean(r.name)} and don't have a dependable explanation yet.`,sources:[r.source]};
    }
  };
  return {ask(input) {
    const result=engine.ask(input);
    if(result.status==='unknown' && !result.answer.startsWith('Hmm, ')) return {...result,answer:'Hmm, '+result.answer};
    return result;
  }};
}
export const knowledgeStats = {records: bundle.originalRecordCount, recipes: allRecipes.length};
