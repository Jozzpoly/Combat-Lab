import {EffectorField,DT,V,clamp} from "./src/effector-world.js";

const $=selector=>document.querySelector(selector);
const canvas=$("#lab"),ctx=canvas.getContext("2d");
const keys=new Set();
let field=null,paused=false,armedBox=false,armedPoke=false,savedScene=null;
let selectedTarget=null,mouse=V(10,11),camera={x:17,y:12,zoom:1.32};
let pan=null,dragPose=null,rotatePose=null,wallDraft=null,pokeDraft=null;
let debt=0,last=performance.now(),lastReport=0;

function info(message){$("#notice").textContent=message;}
function selected(){
  return field?.actor(selectedTarget) ||
    field?.matter.find(m=>m.id===selectedTarget)||null;
}
function resize(){
  const rect=canvas.getBoundingClientRect(),dpr=devicePixelRatio||1;
  const w=Math.max(1,Math.round(rect.width*dpr)),
    h=Math.max(1,Math.round(rect.height*dpr));
  if(w!==canvas.width||h!==canvas.height){canvas.width=w;canvas.height=h;}
  return {w,h};
}
function cameraScale(){
  return Math.min(canvas.width/36,canvas.height/24)*camera.zoom;
}
function worldPoint(event){
  const rect=canvas.getBoundingClientRect(),s=cameraScale();
  const px=(event.clientX-rect.left)*canvas.width/rect.width,
    py=(event.clientY-rect.top)*canvas.height/rect.height;
  return V(camera.x+(px-canvas.width/2)/s,
    camera.y+(py-canvas.height/2)/s);
}
function roundedBox(x,y,hx,hy,a,fill,outline="#182938"){
  ctx.save();ctx.translate(x,y);ctx.rotate(a);
  ctx.beginPath();ctx.rect(-hx,-hy,hx*2,hy*2);
  ctx.fillStyle=fill;ctx.fill();
  ctx.strokeStyle=outline;ctx.lineWidth=.048;ctx.stroke();
  ctx.restore();
}
function disk(x,y,r,fill){
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fillStyle=fill;ctx.fill();
}
function draw(){
  const {w,h}=resize(),s=cameraScale();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle="#15222d";ctx.fillRect(0,0,w,h);
  ctx.setTransform(s,0,0,s,w/2-camera.x*s,h/2-camera.y*s);
  ctx.fillStyle="#293a43";ctx.fillRect(0,0,36,24);
  ctx.strokeStyle="#334952";ctx.lineWidth=.025;
  for(let i=0;i<=36;i+=2){
    ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,24);ctx.stroke();
  }
  for(let i=0;i<=24;i+=2){
    ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(36,i);ctx.stroke();
  }
  // No shaded box is a gameplay obstacle unless Rapier owns its collider.
  for(const wall of field.walls)
    roundedBox(wall.x,wall.y,wall.hx,wall.hy,0,"#778995");
  for(const item of field.matter){
    const p=item.body.translation(),a=item.body.rotation();
    const color=item.type==="gate"?"#d3a765":"#a8aa89";
    roundedBox(p.x,p.y,item.type==="gate"?item.length/2:item.hx,
      item.type==="gate"?.14:item.hy,a,color,
      selectedTarget===item.id?"#fcdea3":"#374047");
    if(item.type==="gate")disk(item.pivot.x,item.pivot.y,.19,"#d7eceb");
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);
    ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillStyle="#1d303a";
    ctx.font="bold .28px system-ui";
    ctx.fillText(item.mass+"kg",0,0,item.type==="gate"?item.length*.78:item.hx*1.8);
    ctx.restore();
  }
  for(const actor of field.actors){
    const p=actor.root.translation(),a=actor.root.rotation();
    if(actor.kind==="ram"){
      roundedBox(p.x,p.y,1.04,.80,a,"#d6a882");
      const n=V(Math.cos(a),Math.sin(a));
      const prow=V(p.x+n.x*.94,p.y+n.y*.94);
      roundedBox(prow.x,prow.y,.48,.28,a,"#e1bb89");
    }else{
      for(const arm of actor.arms){
        const t=arm.body.translation(),r=arm.body.rotation();
        const half=actor.spec.clawReach-.72,hookPosition=half-.11;
        roundedBox(t.x,t.y,half,.13,r,"#84cfb7");
        const hx=t.x+hookPosition*Math.cos(r)+arm.sign*.20*Math.sin(r);
        const hy=t.y+hookPosition*Math.sin(r)-arm.sign*.20*Math.cos(r);
        roundedBox(hx,hy,.115,.26,r,"#b5ecd1");
        const shoulder=V(p.x+.39*Math.cos(a)-arm.sign*.72*Math.sin(a),
          p.y+.39*Math.sin(a)+arm.sign*.72*Math.cos(a));
        disk(shoulder.x,shoulder.y,.17,"#f5d39a");
      }
      roundedBox(p.x,p.y,.64,.48,a,"#6fbab3");
    }
    const forward=V(Math.cos(a),Math.sin(a));
    ctx.strokeStyle="#e1f4fa";ctx.lineWidth=.05;
    ctx.beginPath();ctx.moveTo(p.x,p.y);
    ctx.lineTo(p.x+forward.x*.66,p.y+forward.y*.66);ctx.stroke();
    if(selectedTarget===actor.id){
      ctx.strokeStyle="#efcd89";ctx.lineWidth=.06;
      ctx.beginPath();ctx.arc(p.x,p.y,actor.kind==="ram"?1.35:1.12,
        0,Math.PI*2);ctx.stroke();
      if(actor.contactCount){
        ctx.strokeStyle="#ff847b";
        ctx.beginPath();ctx.arc(p.x,p.y,1.5,0,Math.PI*2);ctx.stroke();
      }
    }
  }
  if(wallDraft){
    const x=(wallDraft.x+mouse.x)/2,y=(wallDraft.y+mouse.y)/2;
    roundedBox(x,y,Math.max(.04,Math.abs(wallDraft.x-mouse.x)/2),
      Math.max(.04,Math.abs(wallDraft.y-mouse.y)/2),
      0,"rgba(226,198,143,.45)");
  }
  if(rotatePose){
    ctx.save();
    ctx.strokeStyle="#ffe2a4";ctx.lineWidth=.055;
    ctx.beginPath();ctx.moveTo(rotatePose.pivot.x,rotatePose.pivot.y);
    ctx.lineTo(mouse.x,mouse.y);ctx.stroke();
    disk(rotatePose.pivot.x,rotatePose.pivot.y,.13,"#ffe2a4");
    ctx.restore();
  }
  if(armedBox)disk(mouse.x,mouse.y,.12,"#e3d6a5");
  if(pokeDraft){
    ctx.save();ctx.strokeStyle="#ffba73";ctx.fillStyle="#ffba73";
    ctx.lineWidth=.09;ctx.beginPath();
    ctx.moveTo(pokeDraft.point.x,pokeDraft.point.y);
    ctx.lineTo(mouse.x,mouse.y);ctx.stroke();
    const angle=Math.atan2(mouse.y-pokeDraft.point.y,mouse.x-pokeDraft.point.x);
    ctx.translate(mouse.x,mouse.y);ctx.rotate(angle);
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-.36,-.17);
    ctx.lineTo(-.36,.17);ctx.closePath();ctx.fill();ctx.restore();
  }
}
function ui(){
  const chosen=selected(),actor=field.actor(selectedTarget);
  $("#health").textContent=(paused?"PAUSED · ":"RUNNING · ")+
    field.actors.length+" bodies · "+field.ticks+" steps";
  $("#metrics").textContent=field.contactReadout.count+
    " actor contact incidences · impulse "+
    field.contactReadout.impulse.toFixed(1)+" N·s";
  if(!chosen){
    $("#subject").textContent="No selected physical body";
    $("#readout").textContent="Click a collider; create any physical encounter.";
    $("#entity").textContent="Nothing selected";
    return;
  }
  if(actor){
    $("#entity").textContent=actor.kind==="pincer"?
      "Pincer: one dynamic trunk + two separately jointed arms and real solid inward hooks.":
      "Ram: wide rigid material pusher; no independent manipulators.";
    $("#subject").textContent=actor.kind.toUpperCase()+" · "+actor.id;
    $("#readout").textContent="Speed "+
      Math.hypot(actor.root.linvel().x,actor.root.linvel().y).toFixed(2)+
      " m/s · real contacts "+actor.contactCount+
      " · load "+actor.contactImpulse.toFixed(1)+" N·s"+
      (actor.kind==="pincer"?
        " · upper "+Math.round(actor.targetApertures[0]*100)+"% open"+
        " / lower "+Math.round(actor.targetApertures[1]*100)+"% open":"");
    // Do not overwrite numeric fields while Owner is typing.
    if(document.activeElement!==$("#torque"))$("#torque").value=actor.spec.clawTorque;
    if(document.activeElement!==$("#reach"))$("#reach").value=actor.spec.clawReach;
    for(const [index,id,label] of [[0,"#upper-jaw","#upper-percent"],[1,"#lower-jaw","#lower-percent"]]){
      const input=$(id),value=actor.targetApertures[index];
      if(document.activeElement!==input)input.value=value;
      $(label).textContent=Math.round(value*100)+"%";
    }
  }else{
    const vel=chosen.body.linvel();
    $("#entity").textContent=chosen.type==="gate"?
      "World-pinned swinging barrier — no invented position lock beyond the real joint.":
      "Free dynamic crate; movement, mass and torque belong to Rapier. Select an organism again before driving.";
    $("#subject").textContent=chosen.type.toUpperCase()+
      " · "+chosen.mass+" kg";
    $("#readout").textContent="Material speed "+
      Math.hypot(vel.x,vel.y).toFixed(2)+" m/s · spin "+
      chosen.body.angvel().toFixed(2)+" rad/s";
    if(document.activeElement!==$("#matter-mass"))$("#matter-mass").value=chosen.mass;
  }
}
function reset(){
  const replacement=savedScene?EffectorField.fromScene(savedScene):new EffectorField();
  field?.dispose();
  field=replacement;
  window.__effectorResearch=field;
  selectedTarget=field.selected;
  paused=false;debt=0;last=performance.now();
  $("#pause").textContent="Pause";
  ui();info("Fresh physical initial arrangement; earlier material afterstate cleared.");
}
function guard(callback){
  try{callback();}catch(error){info(error.message);console.error(error);}
}
function updateKeys(){
  if(!field||paused)return;
  const x=(keys.has("KeyD")||keys.has("ArrowRight")?1:0)-
    (keys.has("KeyA")||keys.has("ArrowLeft")?1:0);
  const y=(keys.has("KeyS")||keys.has("ArrowDown")?1:0)-
    (keys.has("KeyW")||keys.has("ArrowUp")?1:0);
  // Operating an editor/force tool must not silently rotate the selected body.
  field.step({move:V(x,y),aim:(armedPoke||pokeDraft||pan||dragPose||rotatePose||wallDraft)?null:mouse});
}
function frame(now){
  if(!field)return;
  const dt=Math.min(.04,Math.max(0,(now-last)/1000));
  last=now;
  if(!paused){
    debt=Math.min(.16,debt+dt);
    for(let i=0;i<9&&debt>=DT;i++){
      updateKeys();debt-=DT;
    }
  }
  draw();
  if(now-lastReport>160){ui();lastReport=now;}
  requestAnimationFrame(frame);
}
async function start(){
  field=await EffectorField.create();
  selectedTarget=field.selected;
  window.__effectorResearch=field; // research-only, no secret Actor cognition
  $("#health").textContent="Live Rapier 2D material world";
  $("#pause").onclick=()=>{paused=!paused;debt=0;
    $("#pause").textContent=paused?"Resume":"Pause";};
  $("#step").onclick=()=>guard(()=>{if(!paused)throw Error("Pause first");
    field.step({move:V(),aim:mouse});draw();ui();});
  $("#reset").onclick=()=>reset();
  $("#spawn-pincer").onclick=()=>guard(()=>{
    const a=field.spawn("pincer",mouse);field.select(a.id);selectedTarget=a.id;ui();
  });
  $("#spawn-ram").onclick=()=>guard(()=>{
    const a=field.spawn("ram",mouse);field.select(a.id);selectedTarget=a.id;ui();
  });
  $("#add-box").onclick=()=>{armedBox=!armedBox;
    armedPoke=false;$("#poke").textContent="Impulse probe";
    info(armedBox?"Click in the material world to add a real movable crate.":
      "Crate placement cancelled.");};
  $("#poke").onclick=()=>{armedPoke=!armedPoke;armedBox=false;
    if(!armedPoke)pokeDraft=null;
    $("#poke").textContent=armedPoke?"Cancel impulse probe":"Impulse probe";
    info(armedPoke?
      "Drag from an actual dynamic collider. Arrow direction sets impulse direction; numeric N·s sets strength.":
      "Point impulse cancelled.");
  };
  $("#undo").onclick=()=>guard(()=>{
    if(!field.undo())throw Error("No user-authored matter to undo");
    ui();
  });
  $("#capture").onclick=()=>guard(()=>{
    savedScene=field.exportScene();
    $("#scene-json").value=JSON.stringify(savedScene,null,2);
    $("#scene-details").open=true;
    info("Captured a portable posed starting condition; Reset now restores this.");
  });
  $("#load-scene").onclick=()=>guard(()=>{
    const recipe=JSON.parse($("#scene-json").value);
    const staged=EffectorField.fromScene(recipe);
    const canonical=staged.exportScene();
    field.dispose();field=staged;savedScene=canonical;
    window.__effectorResearch=field;
    selectedTarget=field.selected;
    armedBox=false;paused=true;debt=0;last=performance.now();
    $("#pause").textContent="Resume";
    ui();
    info("Validated and loaded physical initial scene. Paused for inspection.");
  });

  for(const [index,id] of [[0,"#upper-jaw"],[1,"#lower-jaw"]]){
    $(id).oninput=()=>guard(()=>{
      if(!field.setArmAperture(selectedTarget,index,Number($(id).value)))
        throw Error("Select a pincer to drive its actual arm");
      $("#"+(index===0?"upper-percent":"lower-percent")).textContent=
        Math.round(Number($(id).value)*100)+"%";
    });
  }
  $("#apply-torque").onclick=()=>guard(()=>{
    if(!field.setClawTorque(selectedTarget,Number($("#torque").value)))
      throw Error("Select an articulated pincer");
    info("Real reciprocal joint torque authority changed.");
  });
  $("#apply-reach").onclick=()=>guard(()=>{
    if(!field.setClawReach(selectedTarget,Number($("#reach").value)))
      throw Error("Select an articulated pincer");
    info("Actual appendage collision envelope and inertia rebuilt, no world reset.");
  });
  $("#apply-mass").onclick=()=>guard(()=>{
    if(!field.setObjectMass(selectedTarget,Number($("#matter-mass").value)))
      throw Error("Select a movable crate");
    info("Actual collider mass and inertia changed.");
  });
  addEventListener("keydown",event=>{
    if(["INPUT","TEXTAREA"].includes(document.activeElement?.tagName))return;
    keys.add(event.code);
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(event.code))
      event.preventDefault();
    if(event.code==="Space")$("#pause").click();
    if(event.code==="KeyE"||event.code==="KeyQ")field.setAperture(
      selectedTarget,event.code==="KeyE"?0:1);
    if(event.code==="KeyZ"||event.code==="KeyX")
      field.setArmAperture(selectedTarget,0,event.code==="KeyZ"?0:1);
    if(event.code==="KeyC"||event.code==="KeyV")
      field.setArmAperture(selectedTarget,1,event.code==="KeyC"?0:1);
  });
  addEventListener("keyup",event=>keys.delete(event.code));
  addEventListener("blur",()=>keys.clear());
  canvas.addEventListener("contextmenu",event=>event.preventDefault());
  canvas.addEventListener("wheel",event=>{
    event.preventDefault();
    camera.zoom=clamp(camera.zoom*Math.exp(-event.deltaY*.0012),.32,4.0);
  },{passive:false});
  canvas.addEventListener("pointerdown",event=>guard(()=>{
    mouse=worldPoint(event);
    if(event.button===1){pan={x:event.clientX,y:event.clientY,
      cx:camera.x,cy:camera.y};canvas.setPointerCapture(event.pointerId);
      return;}
    if(event.button!==0)return;
    if(event.shiftKey){
      if(!paused)throw Error("Pause before drawing a fixed wall.");
      wallDraft={...mouse};canvas.setPointerCapture(event.pointerId);return;
    }
    if(event.altKey){
      if(!paused)throw Error("Pause before rotating physical world bodies.");
      const id=field.pick(mouse),actor=field.actor(id),
        matter=field.matter.find(item=>item.id===id);
      if(!actor&&!matter)throw Error("Rotate from a physical actor or movable object");
      const pivot=matter?.type==="gate"?matter.pivot:
        actor?.root.translation()||matter.body.translation();
      const original=actor?.root.rotation()||matter.body.rotation();
      const bearing=Math.atan2(mouse.y-pivot.y,mouse.x-pivot.x);
      rotatePose={id,pivot:V(pivot.x,pivot.y),offset:original-bearing};
      if(event.isTrusted&&Number.isInteger(event.pointerId))
        canvas.setPointerCapture(event.pointerId);
      return;
    }
    if(event.ctrlKey){
      if(!paused)throw Error("Pause before authoring a new body pose.");
      const id=field.pick(mouse),entity=field.actor(id)||
        field.matter.find(x=>x.id===id);
      if(!entity)return;
      const target=entity.root||entity.body;
      const p=target.translation();
      dragPose={id,dx:p.x-mouse.x,dy:p.y-mouse.y};
      canvas.setPointerCapture(event.pointerId);return;
    }
    if(armedPoke){
      const id=field.pick(mouse);
      if(!id)throw Error("Impulse must begin on a real dynamic collider");
      pokeDraft={id,point:{...mouse}};
      if(event.isTrusted && Number.isInteger(event.pointerId))
        canvas.setPointerCapture(event.pointerId);
      return;
    }
    if(armedBox){
      const mass=Number($("#crate-mass").value),width=Number($("#crate-width").value);
      const b=field.addBox({x:mouse.x,y:mouse.y,mass,hx:width/2,hy:width/2});
      selectedTarget=b.id;armedBox=false;ui();return;
    }
    const id=field.pick(mouse);
    if(id){
      selectedTarget=id;
      // Never keep invisibly piloting another body while inspecting matter.
      field.select(field.actor(id)?id:null);
      ui();
    }
  }));
  canvas.addEventListener("pointermove",event=>guard(()=>{
    mouse=worldPoint(event);
    if(pan){
      const scale=cameraScale(),rect=canvas.getBoundingClientRect();
      camera.x=pan.cx-(event.clientX-pan.x)*(canvas.width/rect.width)/scale;
      camera.y=pan.cy-(event.clientY-pan.y)*(canvas.height/rect.height)/scale;
    }
    if(dragPose && paused)
      field.reposition(dragPose.id,V(mouse.x+dragPose.dx,mouse.y+dragPose.dy));
    if(rotatePose&&paused && Math.hypot(
      mouse.x-rotatePose.pivot.x,mouse.y-rotatePose.pivot.y)>.15)
      field.setAuthoredAngle(rotatePose.id,rotatePose.offset+Math.atan2(
        mouse.y-rotatePose.pivot.y,mouse.x-rotatePose.pivot.x));
  }));
  canvas.addEventListener("pointerup",event=>guard(()=>{
    mouse=worldPoint(event);
    if(pokeDraft){
      const start=pokeDraft.point,dir=V(mouse.x-start.x,mouse.y-start.y);
      const length=Math.hypot(dir.x,dir.y);
      const magnitude=Number($("#poke-strength").value);
      if(!Number.isFinite(magnitude)||magnitude<0)
        throw RangeError("Impulse strength must be finite and nonnegative");
      if(length>.08 && magnitude>0){
        const answer=field.pokeAt(start,V(
          dir.x/length*magnitude,dir.y/length*magnitude));
        if(!answer)throw Error("Collider moved; no physical target received impulse");
        selectedTarget=answer.owner;
        field.select(field.actor(answer.owner)?answer.owner:null);
        info("Actual "+magnitude+" N·s impulse at "+
          answer.part+" of "+answer.owner+". Matter afterstate not reset.");
      }else info("No impulse applied; drag a directional arrow across the material world.");
      pokeDraft=null;armedPoke=false;$("#poke").textContent="Impulse probe";
    }
    if(wallDraft&&paused){
      const p=wallDraft;
      field.addWall({x:(p.x+mouse.x)/2,y:(p.y+mouse.y)/2,
        hx:Math.max(.06,Math.abs(mouse.x-p.x)/2),
        hy:Math.max(.06,Math.abs(mouse.y-p.y)/2)});
    }
    pan=null;wallDraft=null;dragPose=null;rotatePose=null;
    if(canvas.hasPointerCapture(event.pointerId))
      canvas.releasePointerCapture(event.pointerId);
  }));
  canvas.addEventListener("pointercancel",()=>{pan=null;dragPose=null;rotatePose=null;wallDraft=null;pokeDraft=null;});
  ui();
  document.body.dataset.live="yes";
  if(new URLSearchParams(location.search).has("probe")){
    paused=true;
    const {physicalProbe}=await import("./src/physical-probe.js");
    $("#reach").value="2.31";
    $("#apply-reach").click();
    if(Math.abs(field.actor(selectedTarget).spec.clawReach-2.31)>.0001)
      throw Error("Actual UI did not change physical jaw geometry");
    for(const key of ["KeyZ","KeyC"]){
      dispatchEvent(new KeyboardEvent("keydown",{code:key,bubbles:true}));
      dispatchEvent(new KeyboardEvent("keyup",{code:key,bubbles:true}));
    }
    if(field.actor(selectedTarget).targetApertures.some(x=>x!==0))
      throw Error("Physical jaw keyboard command did not close arms separately");
    dispatchEvent(new KeyboardEvent("keydown",{code:"KeyQ",bubbles:true}));
    dispatchEvent(new KeyboardEvent("keyup",{code:"KeyQ",bubbles:true}));
    if(field.actor(selectedTarget).targetApertures.some(x=>x!==1))
      throw Error("Coupled open key failed after independent commands");
    $("#upper-jaw").value="0.18";
    $("#upper-jaw").dispatchEvent(new Event("input",{bubbles:true}));
    $("#lower-jaw").value="0.77";
    $("#lower-jaw").dispatchEvent(new Event("input",{bubbles:true}));
    const arms=field.actor(selectedTarget).targetApertures;
    if(Math.abs(arms[0]-.18)>.00001||Math.abs(arms[1]-.77)>.00001)
      throw Error("Actual independent appendage sliders failed to alter physical commands");
    $("#capture").click();
    const setupText=$("#scene-json").value;
    if(!setupText.includes("combat-lab.effectors.initial.v1"))
      throw Error("Actual UI failed to capture posed physical starting scene");
    const previous=field;
    $("#load-scene").click();
    if(field===previous || !paused ||
       field.actors.length!==previous.actors.length)
      throw Error("Actual UI failed to restore validated physical starting scene");
    const beforeReset=field.exportScene();
    $("#reset").click();
    if(field.ticks!==0 || field.actors.length!==beforeReset.actors.length)
      throw Error("Capture did not become reset-stable starting condition");
    if(Math.abs(field.actors[0].spec.clawReach-2.31)>.0001)
      throw Error("Reset did not preserve edited physical jaw span");
    if(Math.abs(field.actors[0].targetApertures[0]-.18)>.0001||
       Math.abs(field.actors[0].targetApertures[1]-.77)>.0001)
      throw Error("Scene capture/reset incorrectly fused independent jaw commands");
    document.body.dataset.sceneUi="actual capture/load/reset PASS";
    document.body.dataset.probeResult=JSON.stringify(physicalProbe(EffectorField));
    const {affordanceSweep}=await import("./src/affordance-sweep.js");
    // Test actual drag-release input, not just helper invocation.
    resize();
    const target=field.matter.find(m=>m.type==="box");
    const point=target.body.translation(),speed=target.body.linvel();
    const rect=canvas.getBoundingClientRect(),scale=cameraScale();
    const client=p=>{
      const px=canvas.width/2+(p.x-camera.x)*scale;
      const py=canvas.height/2+(p.y-camera.y)*scale;
      return {clientX:rect.left+px*rect.width/canvas.width,
        clientY:rect.top+py*rect.height/canvas.height};
    };
    $("#poke-strength").value="275";
    $("#poke").click();
    const startPt=client(point),endPt=client({x:point.x+1,y:point.y+.55});
    canvas.dispatchEvent(new PointerEvent("pointerdown",
      {...startPt,button:0,bubbles:true,pointerId:123}));
    canvas.dispatchEvent(new PointerEvent("pointermove",
      {...endPt,button:0,bubbles:true,pointerId:123}));
    canvas.dispatchEvent(new PointerEvent("pointerup",
      {...endPt,button:0,bubbles:true,pointerId:123}));
    const after=target.body.linvel();
    if(Math.hypot(after.x-speed.x,after.y-speed.y)<.05 ||
       armedPoke || pokeDraft)
      throw Error("Actual UI impulse drag did not affect dynamic matter");
    document.body.dataset.pokeUi="finite impulse delivered via actual pointer drag";
    const {impulseInterventionProbe}=await import("./src/impulse-intervention-probe.js");
    document.body.dataset.impulseEvidence=JSON.stringify(
      impulseInterventionProbe(EffectorField));
    document.body.dataset.affordanceSweep=JSON.stringify(affordanceSweep(EffectorField));
    const {independentArmsProbe}=await import("./src/independent-arms-probe.js");
    document.body.dataset.independentArms=JSON.stringify(independentArmsProbe(EffectorField));
  }
  if(new URLSearchParams(location.search).has("campaign")){
    paused=true;
    const {disturbedWorldCampaign}=await import("./src/disturbed-world-campaign.js");
    document.body.dataset.worldCampaign=JSON.stringify(disturbedWorldCampaign(EffectorField));
  }
  requestAnimationFrame(frame);
}
start().catch(error=>{
  $("#health").textContent="PHYSICS BOOT ERROR";
  document.body.dataset.liveError=String(error.stack||error);
  info(String(error));console.error(error);
});
