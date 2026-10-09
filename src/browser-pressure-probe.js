// Research-only executable browser probe. Not part of the normal organism runtime.
import { OrganismField } from "./organism-field.js";
import { createInchwormProbe } from "./inchworm-probe.js";

function writePressureResult(status,message) {
  document.body.dataset.pressureProbe=status;
  document.body.dataset.pressureDetail=message;
}
export async function pressureProbe(field) {
  try {
    const assert=(ok,message)=>{if(!ok)throw Error(message);};
    const {observePlaygrounds}=await import("./playgrounds-research-probe.js");
    document.body.dataset.playgroundEvidence=JSON.stringify(
      observePlaygrounds(OrganismField));
    const {spontaneousBraceAB}=await import("./spontaneous-brace-ab.js");
    document.body.dataset.spontaneousBrace=JSON.stringify(
      spontaneousBraceAB(OrganismField));
    const {somaticProbe}=await import("./somatic-research-probe.js");
    const {poseProbe}=await import("./pose-research-probe.js");
    document.body.dataset.poseEvidence=JSON.stringify(poseProbe(OrganismField));
    const {braceProbe}=await import("./brace-research-probe.js");
    const bodyPressure=braceProbe(OrganismField);
    document.body.dataset.braceEvidence=JSON.stringify(bodyPressure);
    const bodyContacts=somaticProbe(OrganismField);
    document.body.dataset.somaticEvidence=JSON.stringify(bodyContacts);
    assert(field.actors.length===4,"missing four different physical morphologies");
    assert(field.actors.find(a=>a.kind==="crawler")?.joint,
      "crawler is not physically articulated");
    assert(new Set(field.actors.map(a=>a.kind)).size===4,"morphology missing");
    for(let i=0;i<220;i++)field.step(null);
    for(const a of field.actors){
      const p=a.root.translation();
      assert(Number.isFinite(p.x)&&Number.isFinite(p.y)&&
        Number.isFinite(a.root.angvel()),"unstable organism");
    }
    const candidate=field.addBox({x:5,y:17,hx:.45,hy:.4,mass:22},false);
    const start={...candidate.body.translation()};
    field.kick(candidate.id,{x:start.x+0.3,y:start.y+0.2},45);
    for(let i=0;i<50;i++)field.step(null);
    const p=candidate.body.translation();
    assert(Math.hypot(p.x-start.x,p.y-start.y)>0.2,
      "physical impulse failed to move matter");
    assert(field.tractionAt({x:15,y:11})<field.tractionAt({x:5,y:11}),
      "ground proxy not spatially material");
    // Scene composition must remain reversible without killing unrelated
    // physical history. These are live removals, not a disguised reset.
    {
      const editWorld=new OrganismField();
      try{
        for(let i=0;i<34;i++)editWorld.step(null);
        const tick=editWorld.ticks,remaining=editWorld.matter[0];
        const p0={...remaining.body.translation()},
          actorPos={...editWorld.actors[0].root.translation()};
        const walls=editWorld.walls.length,matter=editWorld.matter.length,
          gates=editWorld.gates.length;
        editWorld.addWall({x:3,y:19,hx:.7,hy:.12});
        editWorld.addBox({x:7,y:19,hx:.5,hy:.5,mass:44});
        editWorld.addGate({x:23,y:19,length:2.1,mass:78});
        assert(editWorld.authored.length===3&&
          editWorld.authoredRuntimeIds.length===3,"authoring provenance lost");
        assert(editWorld.undoLastAuthored()&&editWorld.gates.length===gates,
          "live gate undo did not remove physical hinge and pivot");
        assert(editWorld.undoLastAuthored()&&editWorld.matter.length===matter,
          "live box undo did not remove only the authored matter");
        assert(editWorld.undoLastAuthored()&&editWorld.walls.length===walls,
          "live wall undo did not remove only the authored obstacle");
        assert(editWorld.ticks===tick&&
          remaining.body.translation().x===p0.x&&
          remaining.body.translation().y===p0.y&&
          editWorld.actors[0].root.translation().x===actorPos.x,
          "undo secretly reset the unrelated live physical world");
        editWorld.addGate({x:24,y:18,length:2.2,mass:45});
        editWorld.addBox({x:12,y:18,hx:.45,hy:.35,mass:12});
        assert(editWorld.clearEdits()===2 &&
          editWorld.ticks===tick &&
          editWorld.walls.length===walls &&
          editWorld.gates.length===gates &&
          editWorld.matter.length===matter,
          "clear violated physical continuity or default contents");
        for(let i=0;i<120;i++)editWorld.step(null);
        assert(editWorld.actors.every(a=>
          Number.isFinite(a.root.translation().x+a.root.translation().y)),
          "live undo left unstable solver afterstate");
        document.body.dataset.liveUndo="3 one-step undo+2 clear; afterstate preserved";
      }finally{editWorld.world.free();}
    }
    // Integrate new physical body in the real shared OrganismField, not
    // merely a separate Rapier model. Null controls preserve no-ghost motion.
    function sharedWormTrial({muscleForce=850,supportForce=900}={}){
      const w=new OrganismField();
      try{
        for(const actor of [...w.actors])w.remove(actor.id);
        const worm=w.spawn("worm",{x:4.2,y:4.2},0);
        w.select(worm.id);
        w.setActorProfile(worm.id,{muscleForce,supportForce});
        const initial=(worm.root.translation().x*worm.root.mass()+
          worm.tail.translation().x*worm.tail.mass())/
          (worm.root.mass()+worm.tail.mass());
        let lastSpan=0,minSpan=Infinity,maxSpan=-Infinity;
        for(let i=0;i<330;i++){
          w.step({x:1,y:0});
          const p=worm.root.translation(),q=worm.tail.translation();
          const span=p.x-q.x;
          minSpan=Math.min(minSpan,span);maxSpan=Math.max(maxSpan,span);
          assert(Number.isFinite(p.x+p.y+q.x+q.y),
            "integrated worm nonfinite under live material world");
          lastSpan=span;
        }
        const com=(worm.root.translation().x*worm.root.mass()+
          worm.tail.translation().x*worm.tail.mass())/
          (worm.root.mass()+worm.tail.mass());
        return {dx:com-initial,sweep:maxSpan-minSpan,span:lastSpan};
      }finally{w.world.free();}
    }
    const integratedGround=sharedWormTrial();
    const integratedNoMuscle=sharedWormTrial({muscleForce:0});
    const integratedNoSupport=sharedWormTrial({supportForce:0});
    assert(integratedGround.dx>.35&&integratedGround.sweep>.22,
      "integrated worm has no actual reciprocal-stroke locomotion");
    assert(Math.abs(integratedNoMuscle.dx)<.035,
      "integrated worm moves without internal muscle");
    assert(Math.abs(integratedNoSupport.dx)<.035,
      "integrated worm moves without external ground reaction");
    document.body.dataset.integratedWorm=[
      "supported="+integratedGround.dx.toFixed(3),
      "noMuscle="+integratedNoMuscle.dx.toFixed(3),
      "noSupport="+integratedNoSupport.dx.toFixed(3),
      "stroke="+integratedGround.sweep.toFixed(3)
    ].join(";");
    // Different body types under actual mixed contact pressure. The timing
    // sample is observational; a cloud runner is not a performance budget.
    {
      const w=new OrganismField();
      try{
        const varieties=["dart","crawler","broad","worm"];
        for(let i=0;i<72;i++){
          const angle=i*2.399963229728653,r=.38*Math.sqrt(i);
          w.spawn(varieties[i%4],{x:17+Math.cos(angle)*r,
            y:11+Math.sin(angle)*r},angle);
        }
        assert(w.actors.length===76,
          "mixed batch did not create all live physics bodies");
        let peakContact=0,peakMs=0,sumMs=0;
        for(let tick=0;tick<130;tick++){
          w.step(null);
          peakContact=Math.max(peakContact,w.activeContactCount);
          peakMs=Math.max(peakMs,w.lastFrameMs);
          sumMs+=w.lastFrameMs;
          for(const actor of w.actors){
            const p=actor.root.translation();
            assert(Number.isFinite(p.x+p.y+actor.root.rotation()) &&
              (!actor.tail||Number.isFinite(actor.tail.translation().x+
                actor.tail.translation().y)),
              "physical crowd created nonfinite articulated afterstate");
          }
        }
        assert(peakContact>0,"crowded mixed bodies had no solver-active contact");
        document.body.dataset.crowdEvidence="actors=76;steps=130"+
          ";maxContactIncidences="+peakContact+
          ";timing=not qualified (virtual browser clock)";
      }finally{w.world.free();}
    }
    // A live arrangement is an authored *starting condition*, not a
    // concealed recording of velocity/joint memory. Verify physical positions,
    // actor morphology and gate angle, and reject corrupt files atomically.
    {
      const source=new OrganismField(),reconstructed=new OrganismField();
      try{
        source.spawn("crawler",{x:12,y:15},.4);
        const chosen=source.actors.at(-1);
        source.setActorProfile(chosen.id,{
          mass:145,speed:2.9,rearDrive:.35,gripForce:400
        });
        source.resizeMorphology(chosen.id,{length:1.3,width:.88});
        source.addWall({x:8,y:18,hx:.55,hy:.35});
        source.addBox({x:9.7,y:18.4,hx:.6,hy:.44,mass:74});
        source.addGate({x:23,y:5,length:3.1,mass:95});
        const moving=source.matter.find(m=>m.kind!=="gate");
        moving.body.setTranslation({x:8,y:13},true);
        moving.body.setRotation(.49,true);
        const gate=source.gates[0];
        const theta=.33,pin=gate.pivotPoint;
        gate.body.setRotation(theta,true);
        gate.body.setTranslation({x:pin.x+gate.hx*Math.cos(theta),
          y:pin.y+gate.hx*Math.sin(theta)},true);
        const recipe=source.exportScene();
        assert(recipe.actors.length===5&&recipe.walls.length===1&&
          recipe.gates.length===2&&recipe.matter.length===6,
          "posed scene capture omitted live world authoring");
        const before=reconstructed.snapshot(),invalid=structuredClone(recipe);
        invalid.actors[0].profile.mass=-2;
        let blocked=false;
        try{reconstructed.importScene(invalid);}
        catch(e){blocked=e instanceof RangeError;}
        assert(blocked&&reconstructed.ticks===before.tick&&
          reconstructed.actors.length===before.count,
          "invalid import modified live physical scene");
        reconstructed.importScene(recipe);
        assert(reconstructed.actors.length===5&&
          reconstructed.gates.length===2&&
          reconstructed.walls.length===10,
          "import lost physical components");
        const imported=reconstructed.matter.find(m=>m.kind!=="gate");
        assert(Math.hypot(imported.body.translation().x-8,
          imported.body.translation().y-13)<.0001,
          "import lost displaced matter position");
        assert(Math.abs(imported.body.rotation()-.49)<.0001,
          "import lost material orientation");
        assert(Math.abs(reconstructed.gates[0].body.rotation()-theta)<.0001,
          "import lost physical hinge angle");
        const importedCrawler=reconstructed.actors.at(-1);
        assert(importedCrawler.spec.mass===145&&
          importedCrawler.spec.rearDrive===.35&&
          Math.abs(importedCrawler.shapeScale.length-1.3)<.00001,
          "import lost actor's independent profile or envelope");
        const initial=reconstructed.exportScene();
        reconstructed.reset();
        const again=reconstructed.exportScene();
        assert(JSON.stringify(initial)===JSON.stringify(again),
          "reset failed to reproduce same posed starting scene");
        for(let i=0;i<150;i++)reconstructed.step(null);
        assert(reconstructed.actors.every(a=>
          Number.isFinite(a.root.translation().x+a.root.translation().y)),
          "imported physical scene destabilized under solver steps");
        document.body.dataset.sceneEvidence="actors="+recipe.actors.length+
          ";matter="+recipe.matter.length+";gates="+recipe.gates.length+
          ";walls="+recipe.walls.length+";validRoundTrip=1";
      }finally{source.world.free();reconstructed.world.free();}
    }
    // Probe an entirely different source of translation: internal reciprocal
    // extension/retraction plus alternating finite world support.
    function crawlTrial({groundForce,muscleForce,tractionAt=()=>1}){
      const probe=createInchwormProbe({groundForce,muscleForce,tractionAt});
      try{
        let last,maxSpan=0,minSpan=Infinity,maxDeviation=0;
        for(let i=0;i<450;i++){
          last=probe.step();
          assert(last.jointValid,"prismatic body joint was lost");
          assert(Number.isFinite(last.deltaX+last.span+last.com.y),
            "inchworm simulation generated nonfinite state");
          maxSpan=Math.max(maxSpan,last.span);
          minSpan=Math.min(minSpan,last.span);
          maxDeviation=Math.max(maxDeviation,Math.abs(last.com.y-8));
        }
        return {progress:last.deltaX,maxSpan,minSpan,maxDeviation,
          headX:last.head.x,rearX:last.rear.x};
      }finally{probe.free();}
    }
    const noGround=crawlTrial({groundForce:0,muscleForce:850});
    const normal=crawlTrial({groundForce:900,muscleForce:850});
    const noMuscle=crawlTrial({groundForce:900,muscleForce:0});
    const weak=crawlTrial({groundForce:35,muscleForce:850});
    assert(Math.abs(noGround.progress)<.03,
      "reciprocal internal stroke incorrectly creates free-space net propulsion");
    assert(Math.abs(noMuscle.progress)<.03,
      "ground attachment without internal actuator creates phantom travel");
    assert(normal.progress>.25,
      "alternating world anchoring failed to turn reciprocal stroke into locomotion");
    assert(normal.maxSpan-normal.minSpan>.25,
      "physical prismatic muscle does not change body length");
    assert(Math.abs(normal.progress-weak.progress)>.12,
      "support strength did not affect locomotion; observed="+
        [noGround.progress,normal.progress,noMuscle.progress,weak.progress].join(","));
    document.body.dataset.inchwormEvidence=[
      "noGround="+noGround.progress.toFixed(3),
      "noMuscle="+noMuscle.progress.toFixed(3),
      "weak="+weak.progress.toFixed(3),
      "supported="+normal.progress.toFixed(3),
      "lengthSweep="+(normal.maxSpan-normal.minSpan).toFixed(3),
      "sideDrift="+normal.maxDeviation.toFixed(4)
    ].join(";");
    // Author the actual organ's finite grip; establish two independent
    // zero-vs-finite Worlds rather than interpreting a static icon as grip.
    function gripTrial(force,mass=28,offset=0){
      const w=new OrganismField();
      try{
        const actor=w.actors.find(a=>a.kind==="dart");
        w.select(actor.id);
        actor.root.setTranslation({x:5,y:19},true);
        actor.root.setLinvel({x:0,y:0},true);
        w.setActorProfile(actor.id,{braking:0,gripForce:force,gripReach:2.4});
        const box=w.addBox({x:6.2,y:19,hx:.50,hy:.50,mass},false);
        const pick={x:6.2,y:19+offset};
        assert(w.beginGrip(pick),"finite grip missed the real crate collider");
        w.setGripTarget({x:8.2,y:19+offset});
        const before=box.body.translation().x;
        let maxDx=0,maxAngle=0,maxReaction=0;
        for(let i=0;i<90;i++){
          w.step({x:0,y:0});
          const pos=box.body.translation();
          maxDx=Math.max(maxDx,pos.x-before);
          maxAngle=Math.max(maxAngle,Math.abs(box.body.rotation()));
          maxReaction=Math.max(maxReaction,Math.hypot(
            w.gripImpulse.x,w.gripImpulse.y));
          assert(Number.isFinite(pos.x+pos.y+box.body.angvel()+
            actor.root.translation().x),"grip generated nonfinite motion");
        }
        const actorDelta=actor.root.translation().x-5;
        const finalX=box.body.translation().x;
        w.releaseGrip();
        assert(w.grip===null,"grip release left an actuator attached");
        for(let i=0;i<15;i++)w.step({x:0,y:0});
        return {maxDx,maxAngle,maxReaction,actorDelta,
          continuedAfterRelease:box.body.translation().x-finalX};
      } finally {w.world.free();}
    }
    const zero=gripTrial(0),light=gripTrial(210),
      heavy=gripTrial(210,280),off=gripTrial(210,28,.37);
    assert(zero.maxDx<.00001&&zero.maxReaction===0,
      "zero grip authority moved matter or generated force");
    assert(light.maxDx>.25 && light.maxReaction>0,
      "finite point actuator did not move dynamic matter");
    assert(light.actorDelta<-.01,
      "reciprocal grip reaction did not actually displace organism");
    assert(heavy.maxDx<light.maxDx,
      "physical object mass did not resist same grip authority");
    assert(off.maxAngle>.015,
      "offcentre physical grip did not rotate object");
    document.body.dataset.gripEvidence=[
      "zero="+zero.maxDx.toFixed(3),
      "light="+light.maxDx.toFixed(3),
      "heavy="+heavy.maxDx.toFixed(3),
      "recoil="+light.actorDelta.toFixed(3),
      "offAngle="+off.maxAngle.toFixed(3)
    ].join(";");
    // A genuine gate: its pin is fixed while the dynamic lever has
    // off-axis angular afterstate from impulse. This is material, not
    // an authored "door open" boolean or a traffic permission.
    {
      const w=new OrganismField();
      try{
        const gate=w.gates[0],pin={...gate.pivotPoint};
        const before=gate.body.rotation();
        const at=gate.body.translation();
        assert(w.kick(gate.id,{x:at.x+gate.hx*.8,y:at.y},90,"tangential"),
          "tangential gate actuator not applied");
        let largest=0,pinError=0;
        for(let t=0;t<110;t++){
          w.step({x:0,y:0});
          const angle=gate.body.rotation(),p=gate.body.translation();
          const anchor={x:p.x-Math.cos(angle)*gate.hx,
            y:p.y-Math.sin(angle)*gate.hx};
          largest=Math.max(largest,Math.abs(angle-before));
          pinError=Math.max(pinError,Math.hypot(anchor.x-pin.x,anchor.y-pin.y));
        }
        assert(largest>.08,"material gate failed to rotate under offaxis impulse");
        assert(pinError<.12,"hinge anchor detached from its authored world pin");
        document.body.dataset.gateEvidence="maxAngle="+largest.toFixed(3)+
          ",pinError="+pinError.toFixed(4);
        const startId=w.actors[0].id;
        const authored=w.addGate({x:8,y:19,length:2.4,mass:43});
        assert(w.gates.length===2,"authored physical gate missing");
        w.reset();
        assert(w.actors[0].id===startId,
          "reset changed stable starting-scene actor identity");
        assert(w.gates.length===2&&w.gates.some(g=>g.pivotPoint.x===8),
          "authored gate did not reconstruct its physical pivot");
      }finally{w.world.free();}
    }
    // Morphological authoring changes actual colliders, including joint
    // anchors, without resetting the remaining physics/world afterstate.
    for(const kind of ["dart","crawler","broad","worm"]){
      const probe=new OrganismField();
      try{
        const actor=probe.actors.find(a=>a.kind===kind);
        const original=actor.parts[0].shape.hx;
        const fixedObject=probe.matter[0];
        const before={...fixedObject.body.translation()};
        let rejected=false;
        try{probe.resizeMorphology(actor.id,{length:.001,width:1});}
        catch(e){rejected=e instanceof RangeError;}
        assert(rejected&&actor.parts[0].shape.hx===original,
          kind+": unsafe edit was partially accepted");
        probe.resizeMorphology(actor.id,{length:1.3,width:.75});
        assert(Math.abs(actor.parts[0].shape.hx-original*1.3)<.0001,
          kind+": collider was not actually resized");
        if(kind==="crawler")assert(Boolean(actor.joint)&&
          Math.hypot(actor.root.translation().x-actor.tail.translation().x,
            actor.root.translation().y-actor.tail.translation().y)>1.3,
            "articulated morphology reanchor failed");
        const after=fixedObject.body.translation();
        assert(after.x===before.x&&after.y===before.y,
          kind+": morphology authoring reset unrelated world material");
        for(let i=0;i<70;i++)probe.step(null);
        const p=actor.root.translation();
        assert(Number.isFinite(p.x+p.y+actor.root.angvel()),
          kind+": unstable after shape authoring");
      }finally{probe.world.free();}
    }
    const change=field.actors[0];
    const oldMass=change.spec.mass;
    field.setActorProfile(change.id,{mass:oldMass*2,speed:1.8});
    assert(Math.abs(change.root.mass()-oldMass*2)<1e-2,
      "physical mass authoring failed");
    // Three independent worlds: all motor/turn/mass axes equal; actual
    // physical envelope and articulation are the remaining interventions.
    const controlled = [];
    for (const kind of ["dart","crawler","broad"]) {
      const trial = new OrganismField();
      try {
        for (const resident of [...trial.actors]) trial.remove(resident.id);
        const actor = trial.spawn(kind,{x:4.5,y:3},0);
        trial.select(actor.id);
        trial.setActorProfile(actor.id,{mass:100,speed:3,acceleration:12,
          braking:12,turnRate:1.5,turnTorque:350});
        const object=trial.addBox({x:7.25,y:3,hx:.55,hy:.55,mass:55},false);
        let firstContact=-1;
        for(let frame=0;frame<180;frame++){
          trial.step({x:1,y:0});
          if(firstContact<0&&actor.contactCount>0)firstContact=frame+1;
          const p=actor.root.translation();
          assert(Number.isFinite(p.x+p.y+actor.root.rotation()),
            kind+": nonfinite under matched-authority encounter");
        }
        const displacement=object.body.translation().x-7.25;
        controlled.push({kind,firstContact,displacement});
      } finally {trial.world.free();}
    }
    assert(controlled.every(o=>o.firstContact>0),
      "one morphology never entered any contact");
    const signatures=new Set(controlled.map(o=>
      o.firstContact+":"+o.displacement.toFixed(3)));
    assert(signatures.size>1,
      "identical physical outcomes under matched-motor different shapes");
    document.body.dataset.morphEvidence=controlled.map(o=>
      o.kind+"@tick"+o.firstContact+":boxDx"+o.displacement.toFixed(3)).join("; ");
    // Does moving *actual* power delivery between a crawler's physically
    // separated supports create an intervention beyond a color/size change?
    function drivePlacement(startX,rearDrive) {
      const w=new OrganismField();
      try {
        for(const a of [...w.actors])w.remove(a.id);
        const actor=w.spawn("crawler",{x:startX,y:11},0);
        w.select(actor.id);
        w.setActorProfile(actor.id,{rearDrive,acceleration:12,
          braking:12,speed:3});
        const first={...actor.root.translation()};
        const tractionStart=[
          w.tractionAt(actor.root.translation()),
          w.tractionAt(actor.tail.translation())
        ];
        for(let i=0;i<55;i++){
          w.step({x:1,y:0});
          const p=actor.root.translation();
          assert(Number.isFinite(p.x+p.y+actor.root.angvel()),
            "articulated drive produced nonfinite body");
        }
        return {dx:actor.root.translation().x-first.x,tractionStart};
      } finally {w.world.free();}
    }
    const dryFront=drivePlacement(5,0),dryRear=drivePlacement(5,1),
      splitFront=drivePlacement(13.35,0),splitRear=drivePlacement(13.35,1);
    assert(splitFront.tractionStart[0] < splitFront.tractionStart[1],
      "two physical segments did not begin on separate ground regimes");
    assert(Math.abs(splitRear.dx-splitFront.dx)>.05,
      "changing real drive allocation did not affect travel on mixed footing");
    const groundEffect=(splitRear.dx-splitFront.dx)-
      (dryRear.dx-dryFront.dx);
    assert(Math.abs(groundEffect)>.04,
      "mixed footing failed to change relative front/rear drive consequences");
    document.body.dataset.segmentEvidence=[
      "dryFront="+dryFront.dx.toFixed(3),
      "dryRear="+dryRear.dx.toFixed(3),
      "mixedFront="+splitFront.dx.toFixed(3),
      "mixedRear="+splitRear.dx.toFixed(3),
      "groundContrast="+groundEffect.toFixed(3)
    ].join(";");
    // Matched paired-world causality: a crate may alter a trajectory only
    // after physical contact. This is not a whole-organism quality test.
    const causal = [];
    for(const kind of ["dart","crawler","broad"]){
      const trialWorlds = [new OrganismField(), new OrganismField()];
      try{
        const actors=[];
        for(const w of trialWorlds){
          for(const resident of [...w.actors])w.remove(resident.id);
          const a=w.spawn(kind,{x:4.5,y:3},0);
          w.select(a.id);
          w.setActorProfile(a.id,{mass:100,speed:3,acceleration:12,
            braking:12,turnRate:1.5,turnTorque:350});
          actors.push(a);
        }
        trialWorlds[1].addBox({x:7.25,y:3,hx:.55,hy:.55,mass:55},false);
        let firstDelta=-1,maxDelta=0,firstCollision=-1;
        for(let frame=0;frame<180;frame++){
          trialWorlds[0].step({x:1,y:0});
          trialWorlds[1].step({x:1,y:0});
          const p=actors[0].root.translation(),q=actors[1].root.translation();
          const d=Math.hypot(p.x-q.x,p.y-q.y);
          maxDelta=Math.max(maxDelta,d);
          if(d>.01&&firstDelta<0)firstDelta=frame+1;
          if(actors[1].contactCount>0&&firstCollision<0)firstCollision=frame+1;
          // Source snapshots start identical: deviation before actual
          // solver-active collision would invalidate a causal attribution.
          if(firstCollision<0) assert(d<.01,
            kind+": diverged before contact with differing matter");
        }
        assert(firstCollision>0&&firstDelta>=firstCollision,
          kind+": physical contact did not precede trajectory divergence");
        assert(maxDelta>.03,
          kind+": no meaningful physical trajectory response to real crate");
        causal.push(kind+"@first-contact"+firstCollision+
          "/first-diff"+firstDelta+"/max-diff"+maxDelta.toFixed(3));
      } finally {for(const w of trialWorlds)w.world.free();}
    }
    document.body.dataset.causalNull=causal.join("; ");
    // Deliberate contact/actor-count pressure; never evidence of scale capacity.
    for(let i=0;i<18;i++){
      field.spawn(["dart","crawler","broad"][i%3],
        {x:13+(i%6)*.40,y:10+Math.floor(i/6)*.60},i*.31);
    }
    for(let i=0;i<100;i++)field.step(null);
    assert(field.actors.length===22,"pressure run lost actors");
    for(const actor of field.actors){
      const p=actor.root.translation();
      assert(Number.isFinite(p.x+p.y+actor.root.angvel()),
        "nonfinite actor under crowded physical pressure");
    }
    field.addWall({x:3,y:3,hx:.5,hy:.1});
    const authored=field.authored.length;
    field.reset();
    assert(field.authored.length===authored &&
      field.walls.length>=10,"authored world reset failed");
    for(let i=0;i<130;i++)field.step(null);
    for(const a of field.actors) {
      const p=a.root.translation();assert(Number.isFinite(p.x+p.y),
        "post-reset actor numerical failure");
    }
    writePressureResult("pass","4 physical forms + matched-motor contrast + 22 bodies under contact pressure + mass editing/reset");
  } catch(e) {
    writePressureResult("fail",String(e?.message??e).slice(0,250));
    throw e;
  }
}
