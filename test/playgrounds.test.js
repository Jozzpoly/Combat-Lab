import test from "node:test";
import assert from "node:assert/strict";
import { PLAYGROUNDS, PLAYGROUND_IDS, playgroundRecipe } from "../src/playgrounds.js";

test("all open-end experiments are editable portable starting conditions",()=>{
 assert.deepEqual(PLAYGROUND_IDS,["relay","crush","hinge","footing"]);
 for(const key of PLAYGROUND_IDS){
  const scene=playgroundRecipe(key);
  assert.equal(scene.format,"combat-lab.initial-scene.v1");
  assert.ok(scene.actors.length>=4,key+" no actors");
  assert.ok(scene.matter.length>0,key+" no movable matter");
  assert.ok(scene.gates.length>0,key+" no real pivot material");
  assert.ok(scene.walls.length>0,key+" no authored world constraints");
  assert.ok(new Set(scene.actors.map(a=>a.kind)).size>=3,
    key+" insufficient independent physical mechanisms");
  assert.equal(Object.hasOwn(scene,"goals"),false,
    "scene cannot steer actor with designer goals");
  assert.equal(Object.hasOwn(scene,"paths"),false,
    "no authored routes in material experiment");
  assert.equal(Object.hasOwn(scene.actors[0],"target"),false,
    "no injected actor destination");
 }
});
test("rebuilding same open physical arrangement has same portable bytes",()=>{
 for(const key of PLAYGROUND_IDS)
  assert.deepEqual(playgroundRecipe(key),playgroundRecipe(key));
});
test("unknown physical situation rejected rather than silently using another",()=>{
 assert.throws(()=>playgroundRecipe("animal-goals"),RangeError);
});
