import test from "node:test";
import assert from "node:assert/strict";
import {SCENE_FORMAT,validateScene} from "../src/scene-contract.js";
const scene={format:SCENE_FORMAT,
 actors:[{kind:"pincer",x:7,y:9,angle:0,clawTorque:780,reach:1.53,aperture:.2,
   armAngles:[-.3,.25]},
   {kind:"ram",x:21,y:10,angle:3.14,clawTorque:0,reach:0,aperture:1,
   armAngles:[]}],
 matter:[{x:10,y:8,hx:.44,hy:.66,mass:12,angle:.13}],
 gates:[{x:16,y:11,length:2.6,mass:110,angle:.2}],
 walls:[{x:17,y:5,hx:.4,hy:1.1}]};
test("real morphology and posed world can be represented in portable starting condition",()=>{
 const data=validateScene(scene);
 assert.deepEqual(data,scene);
 assert.notStrictEqual(data,scene);
});
test("unknown body/format cannot smuggle arbitrary behavior",()=>{
 assert.throws(()=>validateScene({...scene,format:"old-case-v0"}));
 assert.throws(()=>validateScene({...scene,
   actors:[{...scene.actors[0],kind:"omniscientAgent"}]}));
});
test("malformed mass/joint/angle/position rejected prior to import",()=>{
 assert.throws(()=>validateScene({...scene,
   matter:[{...scene.matter[0],mass:-50}]}));
 assert.throws(()=>validateScene({...scene,
   actors:[{...scene.actors[0],armAngles:[1]}]}));
 assert.throws(()=>validateScene({...scene,
   walls:[{...scene.walls[0],x:Infinity}]}));
 assert.throws(()=>validateScene({...scene,
   gates:[{...scene.gates[0],angle:NaN}]}));
});

test("older v1 recipe without authored jaw reach restores its previous real default",()=>{
 const older=structuredClone(scene);
 delete older.actors[0].reach;
 const result=validateScene(older);
 assert.equal(result.actors[0].reach,1.53);
});
test("extreme physically invalid jaw span fails prior to changing scene",()=>{
 const invalid=structuredClone(scene);
 invalid.actors[0].reach=Infinity;
 assert.throws(()=>validateScene(invalid),RangeError);
 invalid.actors[0].reach=-2;
 assert.throws(()=>validateScene(invalid),RangeError);
});
