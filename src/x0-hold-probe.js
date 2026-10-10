// Experimental physical possibility, not an Owner/organism qualification.
// Actual contact-qualified hold vs same-world no-hold and rigid anatomy controls.
import {V,norm,rot} from "./x0-world.js";
const near=(a,b)=>norm(V(a.x-b.x,a.y-b.y));
export function holdMaterialProbe(World){
  const armShape=()=>{
    const temp=new World({empty:true});
    try{
      const a=temp.addActor("reach",V(10,12),0);
      const arm=a.arms[0],b=arm.body,p=b.translation();
      const local=V(arm.half-.18,-arm.sign*.13),r=rot(local,b.rotation());
      return V(p.x+r.x+.16*Math.cos(b.rotation()),
        p.y+r.y+.16*Math.sin(b.rotation()));
    }finally{temp.dispose();}
  };
  const contactPosition=armShape();
  const run=({arms=2,hold=true,holdForce=680,mass=18,drive=true}={})=>{
    const w=new World({empty:true});
    try{
      const a=w.addActor("reach",V(10,12),0,{arms,holdForce});
      w.select(a.id);
      const crate=w.addMatter(contactPosition,{mass,hx:.23,hy:.22,created:false});
      const systemBodies=[a.root,...a.arms.map(part=>part.body),crate.body];
      const centerOfMass=()=>{
        let mass=0,x=0,y=0;
        for(const part of systemBodies){
          const m=part.mass(),p=part.translation();
          mass+=m;x+=m*p.x;y+=m*p.y;
        }
        return V(x/mass,y/mass);
      };
      const centerBefore=centerOfMass();
      const initial=V(crate.body.translation().x,crate.body.translation().y);
      const acquired=hold ? w.beginHold(initial):false;
      const mount=w.hold?.actorPart||null;
      let errors=0;
      for(let i=0;i<105;i++){
        w.step({manual:{move:drive?V(-1,0):V(),aim:null}});
        for(const b of systemBodies){
          const p=b.translation();
          if(!Number.isFinite(p.x+p.y+b.rotation()))errors++;
        }
      }
      const end=crate.body.translation(),root=a.root.translation();
      const result={arms,hold,holdForce,mass,acquired,mount,
        crateX:+(end.x-initial.x).toFixed(4),
        crateDistance:+near(end,initial).toFixed(4),
        rootX:+(root.x-10).toFixed(4),
        holdImpulse:+w.holdImpulse.toFixed(3),
        holdBreaks:w.holdBreaks,stillHeld:Boolean(w.hold),
        centerDrift:+near(centerOfMass(),centerBefore).toFixed(4),
        nonfinite:errors};
      w.endHold();
      return result;
    }finally{w.dispose();}
  };
  // A separate material relation: a world-pinned bar must rotate by actual
  // reciprocal contact/torque, not by a scripted 'open gate' transition.
  const hingeRun=held=>{
    const w=new World({empty:true});
    try{
      const a=w.addActor("reach",V(10,12),0);
      w.select(a.id);
      const hinge=w.addHinge(V(contactPosition.x+1.75,contactPosition.y),
        {length:1.9,mass:52,angle:Math.PI,created:false});
      const click=V(contactPosition.x-.10,contactPosition.y);
      const acquired=held&&w.beginHold(click);
      const initial=hinge.body.rotation();
      for(let i=0;i<95;i++)
        w.step({manual:{move:V(0,-1),aim:null}});
      return {acquired,angleChange:+Math.atan2(
        Math.sin(hinge.body.rotation()-initial),
        Math.cos(hinge.body.rotation()-initial)).toFixed(4),
        released:w.holdBreaks};
    }finally{w.dispose();}
  };
  const hingeWithHold=hingeRun(true),hingeControl=hingeRun(false);
  const light=run({}),unheld=run({hold:false}),
    rigid=run({arms:0}),unpowered=run({holdForce:0}),
    heavy=run({mass:400}),noDrive=run({drive:false});
  if(!light.acquired)throw Error("Actual arm did not make touch-qualified hold");
  if(rigid.acquired)throw Error("Rigid hull reached the same remote material without touching");
  if(unpowered.acquired)throw Error("Zero-strength body could hold material");
  if(light.nonfinite||unheld.nonfinite||heavy.nonfinite)
    throw Error("Non-finite contact hold mechanics");
  if(light.holdImpulse<=.01)throw Error("Body-origin finite hold never delivered physical impulse");
  if(light.holdBreaks!==0 || heavy.holdBreaks<1)
    throw Error("Physical load hold and overload release no longer separate");
  if(light.crateX>=unheld.crateX-1)
    throw Error("Physical hold did not create a different object action in this fixture");
  if(Math.abs(light.crateX)<=Math.abs(heavy.crateX)+.5)
    throw Error("Heavy matter no longer resists finite hold distinctly");
  if(noDrive.centerDrift>.02)
    throw Error("Unpowered reciprocal hold generated spurious system travel");
  return {scope:"touch-qualified finite reciprocal body/matter hold; no actor agency/Owner feel",
    contactPosition,light,unheld,rigid,unpowered,heavy,noDrive,
    hingeWithHold,hingeControl,
    contrastX:+Math.abs(light.crateX-unheld.crateX).toFixed(4)};
}
