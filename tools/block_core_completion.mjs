// A bounded normal-play milestone; not a claim of every wiki mechanic.
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const audit=JSON.parse(fs.readFileSync(new URL('docs/BLOCK_QUESTION_AUDIT.json',root)));
// Explicitly reviewed audience classes; never infer exclusion from a failed answer.
const education=/^minecraft:(?:element_(?:\d|[1-9]\d|1[01]\d)|hard_(?:(?:white|orange|magenta|light_blue|yellow|lime|pink|gray|light_gray|cyan|purple|blue|brown|green|red|black)_stained_)?glass(?:_pane)?|allow|deny|border_block|camera|chemical_heat|colored_torch_(?:blue|green|purple|red)|compound_creator|element_constructor|lab_table|material_reducer|underwater_tnt|underwater_torch)$/;
const creator=/^minecraft:(?:(?:chain_|repeating_)?command_block|structure_block|structure_void|jigsaw|barrier|light_block_(?:\d|1[0-5]))$/;
const internal=/^minecraft:(?:air|unknown|(?:sticky_)?piston_arm_collision)$/;
const report={scope:'Normal block baseline: identity, use, mining, acquisition and a recipe OR explicitly labeled acquisition alternative, plus every reviewed family-specific facet. Education chemistry, creator command workflows and internal representation blocks are separately inventoried. This does not close every wiki topic or every possible phrasing.',full_wiki_complete:false,normal_core_complete:false,normal_blocks:0,other_blocks:0,required_checks:0,blockers:[],subjects:{}};
for(const [id,row] of Object.entries(audit.subjects)) {
 const role=education.test(id)?'education':creator.test(id)?'creator':internal.test(id)?'internal':'normal';
 const required=role==='normal'?[...new Set(['identity','uses','mining','location','recipe',...row.reviewed_topics])]:[];
 const unresolved=required.filter(topic=>!row.topics[topic]||row.topics[topic].status==='unresolved');
 report.required_checks+=required.length;
 if(role==='normal')report.normal_blocks++;else report.other_blocks++;
 if(unresolved.length)report.blockers.push({id,topics:unresolved});
 report.subjects[id]={role,required_topics:required,unresolved_required:unresolved,baseline_complete:role==='normal'&&!unresolved.length,remaining_probe_topics:Object.keys(row.topics).filter(t=>!required.includes(t)&&row.topics[t].status==='unresolved')};
}
report.normal_core_complete=report.normal_blocks>0&&!report.blockers.length;
fs.writeFileSync(new URL('docs/BLOCK_CORE_COMPLETION.json',root),JSON.stringify(report,null,2)+'\n');
console.log(`Block normal baseline: ${report.normal_blocks} normal blocks; ${report.other_blocks} separately inventoried; ${report.required_checks} required checks; ${report.blockers.length} blockers.`);
if(report.blockers.length){console.error(JSON.stringify(report.blockers,null,2));process.exitCode=1;}
