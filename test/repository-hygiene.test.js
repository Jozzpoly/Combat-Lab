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
  assert.match(readme,/Active Embodied Spatial Ecology \/ Multi-Body Pressure is selected/i);
  assert.doesNotMatch(readme,/no selected next research specimen/i);
  assert.match(readme,/6bd4b4492261b9fe3b8edbca276cf9b7de3d822d/);
  assert.doesNotMatch(readme,/waits for new Owner instruction/i);
  assert.doesNotMatch(readme,/Active refoundation branch:/);
  assert.doesNotMatch(readme,/The active research phase is/);
  assert.doesNotMatch(readme,/intentionally \*\*not deployed for Owner testing yet\*\*/i);

  assert.match(state,/Workbench \+ B0 CLOSED/);
  assert.match(state,/Active Embodied Spatial Ecology hypothesis SELECTED FOR REVERSIBLE IMPLEMENTATION/i);
  assert.match(state,/ACTIVE EMBODIED SPATIAL ECOLOGY \/ MULTI-BODY PRESSURE/);
  assert.match(state,/optional explicit linkage \/ correlated scaling/i);
  assert.match(state,/Feniks, ReflexBrain, Companion and SPC/);
  assert.doesNotMatch(state,/waiting for new Owner instruction/i);
  assert.doesNotMatch(state,/Active branch:/);
  assert.ok(state.length<20000,"canonical state must remain a compact live-truth document");
});

test("append-only historical state is preserved outside canonical truth",()=>{
  assert.ok(exists("docs/archive/RESEARCH_STATE_HISTORY_PRE_CLEANUP_2026-09-25.md"));
  assert.ok(read("docs/archive/RESEARCH_STATE_HISTORY_PRE_CLEANUP_2026-09-25.md").length>70000);
  assert.ok(exists("docs/HISTORY_INDEX.md"));
});

test("all live markdown links resolve inside the repository",()=>{
  const markdown=["README.md"];
  const walk=dir=>{
    for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
      const rel=path.join(dir,entry.name);
      if(entry.isDirectory()){
        if(rel===path.join("docs","archive")) continue;
        walk(rel);
      }else if(entry.isFile() && entry.name.endsWith(".md")){
        markdown.push(rel);
      }
    }
  };
  walk("docs");

  for(const source of markdown){
    const text=read(source);
    const base=path.dirname(source);
    const links=[...text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
      .map(match=>match[1])
      .filter(link=>!/^https?:/i.test(link) && !/^mailto:/i.test(link) && !link.startsWith("#"));

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

test("durable records cannot masquerade as live execution authority",()=>{
  const substrate=read("docs/COMBAT_LAB_VNEXT_EXECUTION_SUBSTRATE.md");
  const workbench=read("docs/COMBAT_LAB_WORKBENCH_REFOUNDATION_2026-09-25.md");
  const history=read("docs/HISTORY_INDEX.md");
  const protocol=read("docs/EXPERIMENT_PROTOCOL.md");
  const closure=read("docs/REPOSITORY_CLOSURE_AUDIT_2026-09-26.md");

  assert.match(substrate,/SUPERSEDED AS EXECUTION GUIDANCE/);
  assert.doesNotMatch(substrate,/^The substrate is not deployed yet/m);
  assert.match(workbench,/Historical immediate execution order — COMPLETED/);
  assert.doesNotMatch(workbench,/\*\*Active implementation baseline:\*\*/);
  assert.match(history,/For live sequencing, \*\*\`docs\/RESEARCH_STATE\.md\` wins\*\*/);
  assert.match(protocol,/## 13\. Cross-project donor recovery/);
  assert.match(closure,/## 8\. Final release gate — PASS/);
  assert.ok(exists("docs/FRONTIER_REASSESSMENT_2026-09-26.md"));
  const frontier=read("docs/FRONTIER_REASSESSMENT_2026-09-26.md");
  assert.match(frontier,/ACTIVE EMBODIED SPATIAL ECOLOGY \/ MULTI-BODY PRESSURE/);
  assert.match(frontier,/Owner correction — population pressure is permissive/i);

  const spatialHypothesis=read("docs/ACTIVE_EMBODIED_SPATIAL_ECOLOGY_HYPOTHESIS_2026-09-26.md");
  assert.match(spatialHypothesis,/READY FOR IMPLEMENTATION AS THE NEXT REVERSIBLE DISCOVERY SPECIMEN/);
  assert.match(spatialHypothesis,/Spawn \+1/);
  assert.match(spatialHypothesis,/Spawn \+5/);
  assert.match(spatialHypothesis,/Spawn \+10/);
  assert.match(spatialHypothesis,/SIM STRESS/);
  assert.doesNotMatch(spatialHypothesis,/small population, not a crowd benchmark/i);
});

test("package identity no longer describes a temporary refoundation substrate",()=>{
  const pkg=JSON.parse(read("package.json"));
  assert.equal(pkg.name,"combat-lab-research-workbench");
});
