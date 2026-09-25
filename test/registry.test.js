import test from "node:test";
import assert from "node:assert/strict";
import {ExperimentRegistry} from "../src/core/registry.js";

function definition(id="x") {
  return {
    id,
    title:"Example",
    create:()=>({
      step(){},
      render(){},
      reset(){}
    })
  };
}

test("registry owns lifecycle without combat verbs",()=>{
  const registry=new ExperimentRegistry();
  registry.register(definition());
  const created=registry.create("x");
  assert.equal(created.definition.id,"x");
  assert.deepEqual(
    Object.keys(created.instance).sort(),
    ["render","reset","step"]
  );
});

test("registry rejects duplicate ids",()=>{
  const registry=new ExperimentRegistry();
  registry.register(definition("same"));
  assert.throws(()=>registry.register(definition("same")),/duplicate/);
});
