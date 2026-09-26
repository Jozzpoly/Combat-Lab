import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const exists=p=>fs.existsSync(path.join(root,p));

test("canonical entrypoints contain one current project state",()=>{
  const readme=read("README.md");
  const state=read("docs/RESEARCH_STATE.md");

  assert.match(readme,/Canonical live branch/);
  assert.match(readme,/Workbench foundation — QUALIFIED FOR CURRENT RESEARCH USE/);
  assert.match(readme,/next research direction is deliberately \*\*OPEN\*\*/i);
  assert.doesNotMatch(readme,/Active refoundation branch:/);
  assert.doesNotMatch(readme,/The active research phase is/);
  assert.doesNotMatch(readme,/intentionally \*\*not deployed for Owner testing yet\*\*/i);

  assert.match(state,/Workbench \+ B0 CLOSED/);
  assert.match(state,/NEXT RESEARCH DIRECTION — OPEN/);
  assert.doesNotMatch(state,/Active branch:/);
  assert.ok(state.length<20000,"canonical state must remain a compact live-truth document");
});

test("append-only historical state is preserved outside canonical truth",()=>{
  assert.ok(exists("docs/archive/RESEARCH_STATE_HISTORY_PRE_CLEANUP_2026-09-25.md"));
  assert.ok(read("docs/archive/RESEARCH_STATE_HISTORY_PRE_CLEANUP_2026-09-25.md").length>70000);
  assert.ok(exists("docs/HISTORY_INDEX.md"));
});

test("canonical markdown links resolve inside the repository",()=>{
  for(const source of ["README.md","docs/RESEARCH_STATE.md","docs/HISTORY_INDEX.md"]){
    const text=read(source);
    const base=path.dirname(source);
    const links=[...text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
      .map(match=>match[1])
      .filter(link=>!/^https?:/i.test(link) && !link.startsWith("#"));

    for(const link of links){
      const clean=link.split("#")[0];
      const target=path.normalize(path.join(base,clean));
      assert.ok(exists(target),`${source} -> missing ${target}`);
    }
  }
});

test("Pages deployment has one canonical workflow contract",()=>{
  assert.ok(exists(".github/workflows/pages.yml"));
  const pages=read(".github/workflows/pages.yml");
  assert.match(pages,/branches:\s*\n\s*- main/);
  assert.doesNotMatch(pages,/refoundation\/combat-lab-vnext/);
  assert.match(pages,/contains\(github\.event\.workflow_run\.head_commit\.message, '\[deploy\]'\)/);

  const protocol=read("docs/EXPERIMENT_PROTOCOL.md");
  assert.match(protocol,/automatic deployment from a successful checked `main` commit/i);
  assert.match(protocol,/no whitelisted active experiment branch auto-deploy path/i);
  assert.doesNotMatch(protocol,/currently whitelisted active experiment branch/i);

  assert.equal(exists(".github/workflows/pages-r0.yml"),false,"legacy pages-r0 workflow must stay removed");
});

test("package identity no longer describes a temporary refoundation substrate",()=>{
  const pkg=JSON.parse(read("package.json"));
  assert.equal(pkg.name,"combat-lab-research-workbench");
});
