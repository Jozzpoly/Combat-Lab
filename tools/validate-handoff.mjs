// Offline, provider-neutral consistency check for the archived research inventory.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const m=JSON.parse(fs.readFileSync(path.join(root,"docs/BRANCH_INVENTORY_2026-11-10.json"),"utf8"));
assert.equal(m.schema,"combat-lab/branch-handoff/v1");
assert.equal(m.repository,"Jozzpoly/Combat-Lab");
assert.match(m.archive.sha,/^[0-9a-f]{40}$/);
assert.equal(m.archive.parents,46);
assert.equal(m.baseline.baseline_branch_count,46);
assert.equal(m.baseline.post_archive_count,47);
assert.deepEqual(m.keep_branches,["archive/all-research-pre-provider-handoff-2026-11-10","main","rehearsal/current"]);
assert.equal(m.prune_branches.length,44);
assert.equal(m.prs_at_capture.length,15);
const unique=new Set();
for(const b of m.prune_branches) {
  assert.match(b.ref,/^(?:experiment|review|probe|archive)\/[a-z0-9_./-]+$/);
  assert.match(b.sha,/^[0-9a-f]{40}$/);
  assert.ok(!m.keep_branches.includes(b.ref));
  assert.ok(!unique.has(b.ref), "duplicate branch ref "+b.ref);
  unique.add(b.ref);
}
assert.equal(unique.size,44);
const allOld=new Set([...unique,"main","rehearsal/current"]);
assert.equal(allOld.size,m.baseline.baseline_branch_count);
for(const pr of m.prs_at_capture) {
  assert.ok(Number.isInteger(pr.number));
  assert.match(pr.head_sha,/^[0-9a-f]{40}$/);
  assert.ok(allOld.has(pr.head)||pr.head==="main");
}
for(const name of ["README.md","AGENTS.md","docs/REPOSITORY_HANDOFF_2026-11-10.md","tools/prune-archived-branches.mjs"]) {
  assert.ok(fs.statSync(path.join(root,name)).isFile());
}
console.log("PASS: 46-branch original snapshot, 44 guarded prune refs, 15 PR refs, recovery files; no network needed");
