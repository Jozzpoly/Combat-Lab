#!/usr/bin/env node
// Portable Git bundle export, verified in a clean mirror clone.
// This creates a downloadable archive but NEVER changes refs or deploys.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const manifest=JSON.parse(fs.readFileSync(path.join(root,"docs/BRANCH_INVENTORY_2026-11-10.json"),"utf8"));
const out=path.resolve(process.argv[2]||path.join(root,"_pre-prune-backup"));
const git=(cwd,...args)=>execFileSync("git",["-C",cwd,...args],{encoding:"utf8",timeout:180000,stdio:["ignore","pipe","pipe"]}).trim();
const names=()=>git(root,"for-each-ref","--format=%(refname) %(objectname)","refs/remotes/origin").split("\n").filter(Boolean);
assert.equal(manifest.repository,"Jozzpoly/Combat-Lab");
assert.equal(git(root,"rev-parse","--is-shallow-repository"),"false");
assert.equal(git(root,"rev-parse",manifest.archive.sha+"^{tree}"),manifest.archive.tree_sha);
const original=new Map(manifest.prune_branches.map(x=>["refs/remotes/origin/"+x.ref,x.sha]));
const expected=new Map([
 ...original,
 ["refs/remotes/origin/"+manifest.archive.branch,manifest.archive.sha],
 ["refs/remotes/origin/main",git(root,"rev-parse","refs/remotes/origin/main")],
 ["refs/remotes/origin/rehearsal/current",git(root,"rev-parse","refs/remotes/origin/rehearsal/current")]
]);
const current=new Map(names().map(row=>row.split(" ")));
assert.equal(expected.size,47,"do not silently ignore new branch refs");
assert.deepEqual([...current.keys()].sort(),[...expected.keys()].sort(),
  "remote branch list changed or unaccounted for; re-audit before export");
for(const [name,sha] of expected){
 assert.equal(current.get(name),sha,"ref changed: "+name);
}
fs.mkdirSync(out,{recursive:true});
const bundle=path.join(out,"Combat-Lab-full-git-before-prune-2026-11-10.bundle");
execFileSync("git",["bundle","create",bundle,"--all"],{cwd:root,stdio:["ignore","pipe","pipe"],timeout:180000});
git(root,"bundle","verify",bundle);
const recovered=fs.mkdtempSync(path.join(os.tmpdir(),"combat-verified-bundle-"));
try {
 execFileSync("git",["clone","--quiet","--mirror",bundle,recovered],{encoding:"utf8",timeout:180000});
 for(const [ref,sha] of expected)assert.equal(git(recovered,"rev-parse",ref),sha,"bundle recovery mismatch: "+ref);
 for(const item of manifest.prune_branches)
   assert.equal(git(recovered,"cat-file","-t",item.sha),"commit");
 for(const sha of [
  "bae859f2058a20599051c0c80d7c1f96497b0c48",
  "f45a620c2d43f26c0264c82a6c128192176bfc51",
  "06585c0bfa74a458cc4111cac522f45450182774"
 ])assert.equal(git(recovered,"cat-file","-t",sha),"commit","deleted historic report must survive bundle");
}finally{fs.rmSync(recovered,{recursive:true,force:true})}
const digest=crypto.createHash("sha256").update(fs.readFileSync(bundle)).digest("hex");
fs.writeFileSync(path.join(out,"SHA256.txt"),digest+"  "+path.basename(bundle)+"\n");
const readme=[
 "Combat Lab — exact Git backup before historical branch-reference pruning.",
 "Created from full remote-tracking checkout; all 47 branch heads checked.",
 "Contains the 44 old research refs, neutral main, rehearsal/current, archive",
 "and Git tags reachable to this checkout. It is NOT a gameplay release.",
 "This Git bundle was verified by a separate git clone --mirror and 47 ref SHA comparisons.",
 "Keep the downloaded ZIP/bundle on a separate disk or storage account.",
 "GitHub Actions artifacts expire; the bundle only becomes off-GitHub backup",
 "once YOU download and store it independently.",
 "To recover: git clone --mirror Combat-Lab-full-git-before-prune-2026-11-10.bundle restored.git",
 "Do not merge the archive's 46-parent synthetic commit into main.",
 "Bundle SHA256: "+digest,
 "Original archive commit: "+manifest.archive.sha,
 "Original main tip (pre-cleanup): "+manifest.baseline.main_commit,
 "Captured live main tip: "+git(root,"rev-parse","refs/remotes/origin/main")
].join("\n")+"\n";
fs.writeFileSync(path.join(out,"RESTORE_AND_LIMITS.txt"),readme);
console.log("PASS: full Git bundle produced; fresh mirror clone recovered all 47 original remote refs");
console.log("PASS: all original 44 experiment refs and three buried Owner-evidence commits exist");
console.log("BACKUP_NAME "+path.basename(bundle)+" SHA256 "+digest+" BYTES "+fs.statSync(bundle).size);
