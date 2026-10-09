import test from "node:test";
import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {readFileSync} from "node:fs";
for(const file of ["app.js","src/x0-world.js","src/x0-scene.js","src/x0-probe.js",
  "scripts/browser-live-gate.mjs"])
  test(file+" parses",()=>assert.doesNotThrow(()=>
    execFileSync(process.execPath,["--check",file],{encoding:"utf8"})));
test("X0 intentionally requires shared material / actor controls",()=>{
 const html=readFileSync("index.html","utf8");
 for(const id of ["lab","pause","step","reset","spawn","count","body-type",
  "add-material","material-type","local-response","poke","poke-magnitude",
  "upper","lower","selected-mass","apply-selected","recipe","capture","load"])
  assert.match(html,new RegExp('id="'+id+'"'));
});
test("no global goal or kinematic locomotive velocity overwrite",()=>{
 const source=readFileSync("src/x0-world.js","utf8");
 const motor=source.slice(source.indexOf("  motor(a,command=null){"),
  source.indexOf("  step({manual=null}={}){"));
 assert.ok(motor.length>1400);
 assert.doesNotMatch(motor,/setLinvel|setTranslation|targetWaypoint|findPath/);
 assert.match(motor,/applyTorqueImpulse/);
 assert.match(motor,/observed.parts/);
});
test("research probe never calls Owner PASS from CI",()=>{
 const source=readFileSync("src/x0-probe.js","utf8");
 assert.match(source,/NOT OWNER-QUALIFIED/);
 assert.match(source,/reflex:false/);
 assert.match(source,/reflex:true/);
});
