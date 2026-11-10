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
  git(tmp,"fetch","--quiet","--no-tags",root,
      "refs/heads/"+m.archive.branch);
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
  console.log("PASS: archive-only cold recovery: 46 independent tip commits, correct neutral tree, no old refs, 7 research source reports");
} finally {
  fs.rmSync(tmp,{recursive:true,force:true});
}
