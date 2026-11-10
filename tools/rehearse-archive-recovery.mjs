#!/usr/bin/env node
// Cold recovery rehearsal: prove old experiment commits and their actual files
// are reachable when the ONLY imported ref is the one forensic archive.
// No GitHub API, token, original branch ref, ChatGPT memory or cloud service.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const m=JSON.parse(fs.readFileSync(path.join(root,"docs/BRANCH_INVENTORY_2026-11-10.json"),"utf8"));
const git=(cwd,...args)=>execFileSync("git",["-C",cwd,...args],{
  encoding:"utf8",stdio:["ignore","pipe","pipe"],timeout:120000
}).trim();
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"combat-lab-archive-recovery-"));
const original=new Map(m.prune_branches.map(x=>[x.ref,x.sha]));
const cases=[
  ["P7 crowd", "experiment/p7-contested-doorway-crowd", "docs/P7_CONTESTED_DOORWAY_CROWD_2026-10-11.md"],
  ["P8 negative", "experiment/p8-tactile-slip-human-control", "docs/P8_TACTILE_SIDESTEP_NEGATIVE_2026-10-11.md"],
  ["P10b workshop", "experiment/p10b-affordance-legibility", "docs/P10B_NATIVE_AFFORDANCE_AND_STRESS_2026-10-11.md"],
  ["P10c portability", "experiment/p10c-offline-owner-firstlook", "docs/P10C_PORTABLE_FIRST_LOOK_2026-10-11.md"],
  ["P12b confound", "experiment/p12b-momentum-integrity", "docs/P12B_SLEEPING_MOMENTUM_CAUSE_2026-10-11.md"],
  ["W2 embodied", "experiment/w2-embodied-material-commons", "docs/W2_INTEGRATED_MATERIAL_COMMONS.md"],
  ["Jaskinia donor", "experiment/gpt6-worldbench-witness-2026-11-06", "docs/P10D_JASKINIA_WORLDBENCH_2026-11-06.md"]
];
try {
  assert.equal(m.schema,"combat-lab/branch-handoff/v1");
  assert.equal(m.archive.parents,46);
  assert.equal(m.prune_branches.length,44);
  git(tmp,"init","--quiet");
  // Import ONE named archive ref from a full local checkout. None of the old
  // 44 branch references are imported into the fresh destination.
  // Actions checkout keeps this ref under refs/remotes/origin/, not
  // refs/heads/. Fetch by the exact captured object SHA instead of any name.
  git(tmp,"fetch","--quiet","--no-tags",root,m.archive.sha);
  const imported=git(tmp,"rev-parse","FETCH_HEAD");
  assert.equal(imported,m.archive.sha);
  assert.equal(git(tmp,"for-each-ref","--format=%(refname)"),"",
    "a blank recovery clone must not depend on imported old branch refs");
  assert.equal(git(tmp,"rev-parse",imported+"^{tree}"),m.archive.tree_sha);
  assert.equal(git(tmp,"rev-parse",m.baseline.main_commit+"^{tree}"),m.archive.tree_sha);
  const parents=git(tmp,"show","-s","--format=%P",imported).split(" ");
  assert.equal(parents.length,46);
  assert.equal(new Set(parents).size,46);
  const expected=[m.baseline.main_commit,...m.prune_branches.map(x=>x.sha)];
  for(const sha of expected){
    assert.ok(parents.includes(sha),"missing archived direct parent "+sha);
    assert.equal(git(tmp,"cat-file","-t",sha),"commit");
    git(tmp,"merge-base","--is-ancestor",sha,imported);
  }
  const remaining=parents.filter(sha=>!expected.includes(sha));
  assert.equal(remaining.length,1,"the other original parent must represent rehearsal/current");
  for(const [label,branch,sourcePath] of cases){
    const sha=original.get(branch);
    assert.ok(sha,"missing inventoried case "+branch);
    const type=git(tmp,"cat-file","-t",sha+":"+sourcePath);
    assert.equal(type,"blob",label+" report must be retrievable at exact original commit");
    const bytes=Number(git(tmp,"cat-file","-s",sha+":"+sourcePath));
    assert.ok(bytes>100,label+" report suspiciously small");
    console.log("RECOVERABLE "+label+": "+sha.slice(0,12)+" / "+sourcePath+" ("+bytes+" bytes)");
  }
  // These three owner-experience records were deleted from later branch tips.
  // They are NOT represented by checking only current file trees. Prove
  // reachability of their earlier exact Git commits through archive ancestry.
  const buried=[
    ["B0 actual owner workbench recording","bae859f2058a20599051c0c80d7c1f96497b0c48","docs/B0_WORKBENCH_OWNER_RECORDING_FEEDBACK_2026-09-25.md"],
    ["Second owner crowd recording","f45a620c2d43f26c0264c82a6c128192176bfc51","docs/ACTIVE_SECOND_OWNER_REHEARSAL_RECORDING_FEEDBACK_2026-09-27.md"],
    ["L0 owner rejection","06585c0bfa74a458cc4111cac522f45450182774","docs/LIVING_MOVEMENT_L0_FIRST_OWNER_REHEARSAL_FAIL_2026-10-06.md"]
  ];
  for(const [label,sha,sourcePath] of buried){
    git(tmp,"merge-base","--is-ancestor",sha,imported);
    assert.equal(git(tmp,"cat-file","-t",sha+":"+sourcePath),"blob",
      label+": historic deleted report is not recoverable from archive only");
    const bytes=Number(git(tmp,"cat-file","-s",sha+":"+sourcePath));
    assert.ok(bytes>100);
    console.log("RECOVERABLE DELETED OWNER RECORD "+label+": "+sha.slice(0,12)+" ("+bytes+" bytes)");
  }
  // 148 converted branch-based doc links are of little use if their target
  // paths do not exist at the pinned commit. Verify actual blobs/trees in the
  // archive-only clone, never by depending on the retired named branch.
  const oldTips=new Set(m.prune_branches.map(x=>x.sha));
  const docs=[];
  function walk(d){
    for(const f of fs.readdirSync(d,{withFileTypes:true})){
      const p=path.join(d,f.name);
      if(f.isDirectory())walk(p);
      else if(f.name.endsWith(".md"))docs.push(p);
    }
  }
  walk(path.join(root,"docs"));
  docs.push(path.join(root,"README.md"),path.join(root,"AGENTS.md"));
  const broken=[];let checked=0;
  const link=/https:\/\/github\.com\/Jozzpoly\/Combat-Lab\/(blob|tree|raw)\/([0-9a-f]{40})(?:\/([^\s)>"']+))?/g;
  for(const p of docs){
    const text=fs.readFileSync(p,"utf8");
    for(const x of text.matchAll(link)){
      if(!oldTips.has(x[2]))continue;
      checked++;
      const raw=(x[3]||"").split(/[?#]/)[0];
      let sourcePath;
      try { sourcePath=decodeURIComponent(raw); }
      catch { broken.push(path.relative(root,p)+": malformed URL"); continue; }
      const object=x[2]+(sourcePath?":"+sourcePath:"");
      try {
        const type=git(tmp,"cat-file","-t",object);
        const expected=x[1]==="tree"?(sourcePath?"tree":"commit"):"blob";
        if(type!==expected)broken.push(path.relative(root,p)+": "+object+" expected "+expected+" got "+type);
      }catch{broken.push(path.relative(root,p)+": missing "+object);}
    }
  }
  assert.ok(checked>=148,"expected at least the 148 converted historical branch links");
  assert.deepEqual(broken,[],"pinned research links did not resolve in archive-only clone");
  console.log("PASS: "+checked+" original-branch research links resolve as actual Git blobs/trees with only archived source objects");
    console.log("PASS: archive-only cold recovery: 46 original tips, 7 tip reports, 3 formerly deleted owner-experience reports, zero old refs");
} finally {
  fs.rmSync(tmp,{recursive:true,force:true});
}
