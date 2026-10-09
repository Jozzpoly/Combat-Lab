// Open-ended material starting arrangements, not scripted objectives.
// No paths, goals, AI hints, invisible force fields or per-scene physics laws.
// These are user-replaceable authoring recipes; every actor runs exactly the
// same primitive somatic controller as it does in any imported scene.
import { MORPHS } from "./organism-law.js";
import { validateScene } from "./scene-recipe.js";

const PHYSICAL_FIELDS = [
  "mass","speed","acceleration","braking","turnRate",
  "turnTorque","gripForce","gripReach","contactYield","braceForce"
];
const body=(kind,x,y,heading=0,changes={})=>{
  const base=MORPHS[kind];
  if(!base)throw new TypeError("unknown body archetype");
  const profile=Object.fromEntries(PHYSICAL_FIELDS.map(k=>[k,base[k]]));
  if(kind==="crawler")profile.rearDrive=base.rearDrive;
  if(kind==="worm"){
    profile.muscleForce=base.muscleForce;
    profile.supportForce=base.supportForce;
  }
  const {length=1,width=1,...patch}=changes;
  return {kind,pos:{x,y},heading,length,width,profile:{...profile,...patch}};
};
const crate=(x,y,mass,hx=.48,hy=.48,angle=0)=>
  ({x,y,hx,hy,mass,angle});
const wall=(x,y,hx,hy)=>({x,y,hx,hy});
const gate=(x,y,length,mass,angle=0)=>({x,y,length,mass,angle});
const built=(actors,matter,gates=[],walls=[])=>
  validateScene({format:"combat-lab.initial-scene.v1",actors,matter,gates,walls});

export const PLAYGROUNDS=Object.freeze({
  relay:{
    label:"Push & jam",
    caption:"Same shape, different mass. Push, intervene, then follow where the resistance comes from.",
    recipe:()=>built(
      [body("dart",3.3,9.4,0,{contactYield:.9}),
       body("dart",3.3,13.1,0,{contactYield:.9}),
       body("crawler",17.2,10.9,Math.PI),
       body("worm",19.5,14.1,Math.PI),
       body("broad",27,10.3,Math.PI)],
      [crate(6.1,9.4,12,.44,.52),
       crate(6.1,13.1,220,.44,.52),
       crate(17.1,12.7,40,.55,.7),
       crate(24,11,80,.75,.48),
       crate(28.3,7.9,16,.55,.48)],
      [gate(21,17.3,2.6,90,-.6)],
      [wall(11.6,9.4,.22,1.4),wall(11.6,13.1,.22,1.4),
       wall(31.2,11.1,.22,4.3)])
  },
  crush:{
    label:"Bodies under pressure",
    caption:"A crowd of different physical bodies meets other bodies, bottlenecks and a movable barrier.",
    recipe:()=>{
      const actors=[
        body("broad",8.2,11,0,{contactYield:.08}),
        body("crawler",11.5,10.4,0,{contactYield:.4}),
        body("worm",12.4,14,0),
        body("dart",10.9,12.6,0),
        body("broad",26.7,9.1,Math.PI,{contactYield:.15}),
        body("crawler",25,12.0,Math.PI),
        body("worm",28.3,14.1,Math.PI),
        body("dart",30,10.5,Math.PI)
      ];
      for(let row=0;row<3;row++){
        actors.push(body(["dart","crawler","dart"][row],14.8+row*.36,
          8.2+row*3.4,0));
        actors.push(body(["dart","worm","dart"][row],22.7-row*.4,
          8.2+row*3.4,Math.PI));
      }
      return built(actors,[
        crate(18.6,9.2,44,.60,.56),
        crate(18.6,13.1,180,.68,.48),
        crate(19.7,16.4,32,.50,.55),
        crate(21.3,10.9,20,.45,.45)],
        [gate(19,11.1,2.4,105,.4)],
        [wall(18.8,7.2,.25,1.0),wall(18.8,18.2,.25,1.6),
         wall(31.2,11,.26,3.5)]);
    }
  },
  hinge:{
    label:"Living doorway",
    caption:"One world-pinned moving arm. Who can swing it, hold it, crowd behind it or slip around it?",
    recipe:()=>built([
       body("dart",11.9,11.1,0),
       body("broad",15.3,13.1,0,{contactYield:.08}),
       body("crawler",25.3,11.2,Math.PI),
       body("worm",27.6,14.2,Math.PI),
       body("dart",14.2,15.4,0),
       body("dart",28.6,9.4,Math.PI)],
      [crate(17.2,13.4,22,.50,.5),crate(24,12,150,.65,.7),
       crate(13.0,8.2,34,.60,.55)],
      [gate(19.0,11.2,3.35,110,.25),
       gate(24.5,7.6,2.6,48,1.3)],
      [wall(19,8.25,.23,1.5),wall(19,15.1,.23,1.8)])
  },
  footing:{
    label:"Mixed footing",
    caption:"The pale ground patch changes real support. Swap front/rear drive and disturb the moving crates.",
    recipe:()=>built([
      body("crawler",13.35,11,0,{rearDrive:0}),
      body("crawler",13.35,16,0,{rearDrive:1}),
      body("worm",17,11.3,0,{muscleForce:850,supportForce:900}),
      body("worm",17,17,0,{muscleForce:850,supportForce:450}),
      body("broad",27.7,12,Math.PI),
      body("dart",7,11,0)],
      [crate(23.5,11,45,.56,.51),crate(23.5,16,45,.56,.51),
       crate(10,11,25,.4,.48)],
      [gate(28.2,16.8,2.3,110,-.7)],
      [wall(29.5,10.2,.20,2.7)])
  }
});
export const PLAYGROUND_IDS=Object.freeze(Object.keys(PLAYGROUNDS));
export function playgroundRecipe(key){
  if(!Object.hasOwn(PLAYGROUNDS,key))throw new RangeError("unknown experimental situation");
  return PLAYGROUNDS[key].recipe();
}
