#!/usr/bin/env node
// Safe, provider-neutral remote branch pruning. Dry-run unless --apply.
// No API token, Python, GitHub app, private project context or dependencies.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const manifest=JSON.parse(fs.readFileSync(path.join(root,"docs/BRANCH_INVENTORY_2026-11-10.json"),"utf8"));
const apply=process.argv.includes("--apply");
const expectedArchive="archive/all-research-pre-provider-handoff-2026-11-10";
const keep=new Set(["main","rehearsal/current",expectedArchive]);
const run=(args)=>execFileSync("git",args,{cwd:root,encoding:"utf8",stdio:["ignore","pipe","pipe"]}).trim();
const own=(a,b)=>{if(a!==b)throw Error("ABORT: "+a+" != "+b)};
const lsRef=(name)=>{
  const out=run(["ls-remote","--heads","origin",name]);
  const row=out.split("\n").find(x=>x.endsWith("\trefs/heads/"+name));
  return row?row.split("\t")[0]:null;
};
if(manifest.repository!=="Jozzpoly/Combat-Lab"||manifest.archive.branch!==expectedArchive)throw Error("unexpected manifest/repository");
if(manifest.keep_branches.length!==3||keep.size!==3||manifest.prune_branches.length!==44)throw Error("manifest changed: re-audit first");
const remote=run(["remote","get-url","origin"]);
if(!/Jozzpoly\/Combat-Lab(?:\.git)?$/.test(remote))throw Error("ABORT: origin does not end with Jozzpoly/Combat-Lab");
if(run(["rev-parse","--is-shallow-repository"])!=="false")throw Error("ABORT: use a full, non-shallow clone for ancestry checks");
const archiveHead=lsRef(expectedArchive);
own(archiveHead,manifest.archive.sha);
const mainHead=lsRef("main");
if(!mainHead)throw Error("ABORT: main ref missing");
if(!lsRef("rehearsal/current"))throw Error("ABORT: public rehearsal ref missing");
run(["fetch","origin","refs/heads/"+expectedArchive,"refs/heads/main"]);
try{run(["merge-base","--is-ancestor",manifest.baseline.main_commit,mainHead]);}
catch{throw Error("ABORT: current main no longer descends from archived original baseline");}
for(const item of manifest.prune_branches){
  if(keep.has(item.ref)||!item.ref.match(/^(experiment\/|review\/|probe\/|archive\/)[A-Za-z0-9_.\/-]+$/))throw Error("ABORT: forbidden ref "+item.ref);
  try{run(["merge-base","--is-ancestor",item.sha,archiveHead]);}
  catch{throw Error("ABORT: archive does not contain source commit "+item.ref);}
}
const found=manifest.prune_branches.map(x=>({...x,remoteSha:lsRef(x.ref)}));
const mismatched=found.filter(x=>x.remoteSha && x.remoteSha!==x.sha);
if(mismatched.length)throw Error("ABORT: refs have changed since capture: "+mismatched.map(x=>x.ref).join(", "));
console.log((apply?"APPLY":"DRY RUN")+": "+found.filter(x=>x.remoteSha).length+" removable refs, "+found.filter(x=>!x.remoteSha).length+" already absent.");
if(!apply){console.log("Safety checks passed. No remote refs changed. A future authorized agent can run: node tools/prune-archived-branches.mjs --apply");process.exit(0);}
let deleted=0;
for(const item of found){
  if(!item.remoteSha)continue;
  // SHA-locked deletion: if someone committed to the branch, Git rejects the removal.
  run(["push","--force-with-lease=refs/heads/"+item.ref+":"+item.sha,"origin",":refs/heads/"+item.ref]);
  deleted++;
  console.log("PRUNED "+item.ref+" @ "+item.sha);
}
console.log("COMPLETE: "+deleted+" refs pruned; all original commits remain anchored in "+expectedArchive);
