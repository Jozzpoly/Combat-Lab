import test from "node:test";
import assert from "node:assert/strict";
import { validateScene } from "../src/scene-recipe.js";
import { MORPHS } from "../src/organism-law.js";
const recipe=()=>({
 format:"combat-lab.initial-scene.v1",
 actors:[{kind:"crawler",pos:{x:12,y:8},heading:.2,length:1,width:1,
   profile:{mass:88,speed:2.5,acceleration:12,braking:14,
    turnRate:1.65,turnTorque:280,gripReach:2.3,gripForce:330,
    rearDrive:.55}}],
 matter:[{x:15,y:11,hx:.5,hy:.7,mass:40,angle:.4}],
 walls:[{x:19,y:10,hx:.3,hy:3}],
 gates:[{x:5,y:5,length:3,mass:60,angle:.7}]
});
test("valid scene is normalized into a portable starting recipe",()=>{
 const r=validateScene(recipe());
 assert.equal(r.actors[0].profile.rearDrive,.55);
 assert.equal(r.gates[0].angle,.7);
 assert.equal(r.matter[0].angle,.4);
});
test("unknown versions, invalid values and negative forces fail before world edits",()=>{
 const examples=[];
 let r=recipe();r.format="other";examples.push(r);
 r=recipe();r.matter[0].angle=Infinity;examples.push(r);
 r=recipe();r.actors[0].profile.gripForce=-1;examples.push(r);
 r=recipe();r.actors[0].length=.001;examples.push(r);
 r=recipe();r.actors[0].profile.rearDrive=1.1;examples.push(r);
 r=recipe();r.gates[0].length=.001;examples.push(r);
 r=recipe();r.walls[0].hy=0;examples.push(r);
 for(const x of examples)assert.throws(()=>validateScene(x),{name:/RangeError|TypeError/});
});
test("permissive representable odd profiles remain possible",()=>{
 const r=recipe();
 r.actors[0].profile.mass=1e5;
 r.actors[0].profile.turnRate=0;
 r.actors[0].profile.gripForce=0;
 assert.equal(validateScene(r).actors[0].profile.mass,1e5);
});
test("scene validator does not depend on runtime solver identity",()=>{
 const r=validateScene(recipe());
 assert.equal(r.actors[0].kind,"crawler");
 assert.equal(Object.hasOwn(r.actors[0],"id"),false);
 assert.equal(Object.hasOwn(r.matter[0],"collider"),false);
});
