// Small static integrity gate only. Physical claims come from the
// emitted-Chromium WASM gate, never from source-inspection assertions.
import test from "node:test";
import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {readFileSync} from "node:fs";
for(const path of ["app.js","src/effector-world.js","src/physical-probe.js",
  "scripts/browser-live-gate.mjs"]){
 test(path+" parses as an ES module",()=>{
   execFileSync(process.execPath,["--check",path],{encoding:"utf8"});
 });
}
test("experiment declares physical interaction controls before first browser run",()=>{
 const html=readFileSync("index.html","utf8");
 for(const tag of ["lab","pause","step","reset","torque","apply-torque",
   "matter-mass","apply-mass","add-box","spawn-pincer","spawn-ram"])
   assert.match(html,new RegExp('id="'+tag+'"'));
});
test("whole-boundary new field does not use direct velocity overwrite as motor",()=>{
 const source=readFileSync("src/effector-world.js","utf8");
 const motor=source.slice(source.indexOf("  motor(a,control){"),
   source.indexOf("  step(controls={}){"));
 assert.ok(motor.length>200);
 assert.doesNotMatch(motor,/setLinvel|setTranslation|setAngvel/);
 assert.match(motor,/applyTorqueImpulse/);
 assert.match(motor,/applyImpulse/);
});
