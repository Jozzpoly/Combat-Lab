import {CommonsWorld,BODY_PRESETS,V,DT,clamp,norm,safe} from "./src/x0-world.js";
import {capture,restore} from "./src/x0-scene.js";
const el=id=>document.querySelector("#"+id);
const canvas=el("lab"),ctx=canvas.getContext("2d");
const keys=new Set();
let field=null,paused=false,last=performance.now(),acc=0;
let selected=null,mode=null,saved=null;
let mouse=V(16,12),pan=null,author=null,arrow=null,wall=null;
const camera={x:21,y:13,zoom:1.30},SIZE={w:1,h:1,scale:1};
function message(text){el("message").textContent=text;}
function fail(fn){try{return fn()}catch(e){message("NOT APPLIED: "+e.message);console.error(e);return null}}
function dimensions(){
 const rect=canvas.getBoundingClientRect(),dpr=Math.min(3,devicePixelRatio||1);
 SIZE.w=Math.max(1,rect.width);SIZE.h=Math.max(1,rect.height);
 const pw=Math.round(SIZE.w*dpr),ph=Math.round(SIZE.h*dpr);
 if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph;}
 SIZE.scale=Math.min(SIZE.w/42,SIZE.h/26)*camera.zoom;
 ctx.setTransform(dpr,0,0,dpr,0,0);
}
function project(point){
 return V(SIZE.w/2+(point.x-camera.x)*SIZE.scale,
   SIZE.h/2+(point.y-camera.y)*SIZE.scale);
}
function worldPoint(event){
 const r=canvas.getBoundingClientRect();
 return V(camera.x+(event.clientX-r.left-SIZE.w/2)/SIZE.scale,
   camera.y+(event.clientY-r.top-SIZE.h/2)/SIZE.scale);
}
function rectangle(body,hx,hy,color,{line="#20343e",alpha=1}={}){
 const p=body.translation();
 ctx.save();ctx.translate(p.x,p.y);ctx.rotate(body.rotation());
 ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.strokeStyle=line;
 ctx.lineWidth=.055;ctx.fillRect(-hx,-hy,2*hx,2*hy);
 ctx.strokeRect(-hx,-hy,2*hx,2*hy);ctx.restore();
}
function disk(point,r,color){
 ctx.beginPath();ctx.arc(point.x,point.y,r,0,Math.PI*2);
 ctx.fillStyle=color;ctx.fill();
}
function render(){
 dimensions();ctx.fillStyle="#142831";ctx.fillRect(0,0,SIZE.w,SIZE.h);
 ctx.save();
 ctx.translate(SIZE.w/2,SIZE.h/2);ctx.scale(SIZE.scale,SIZE.scale);
 ctx.translate(-camera.x,-camera.y);
 ctx.lineWidth=.018;ctx.strokeStyle="#25404c";
 for(let x=0;x<=42;x+=2){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,26);ctx.stroke();}
 for(let y=0;y<=26;y+=2){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(42,y);ctx.stroke();}
 ctx.fillStyle="#203c47";ctx.fillRect(5,4,7,4);
 ctx.fillStyle="#20323e";ctx.fillRect(29,16,8,5);
 ctx.fillStyle="#1b343f";ctx.fillRect(18,4,8,5);
 for(const w of field.walls)rectangle(w.body,w.hx,w.hy,"#586978");
 for(const m of field.matter){
   const selectedItem=selected===m.id;
   if(m.kind==="free")rectangle(m.body,m.hx,m.hy,
     m.form==="beam"?"#b2a689":"#a2b2b5",
     {line:selectedItem?"#fff3ae":"#344852"});
   else {
     rectangle(m.body,m.length/2,m.kind==="rail"?.20:.15,
       m.kind==="rail"?"#cba6b1":"#dbad78",
       {line:selectedItem?"#fff2a0":"#515260"});
     disk(V(m.x,m.y),.18,"#f1d193");
     if(m.kind==="rail"){
       ctx.strokeStyle="#b5a0a4";ctx.lineWidth=.07;
       ctx.beginPath();ctx.moveTo(m.x-3,m.y);ctx.lineTo(m.x+3,m.y);ctx.stroke();
     }
   }
 }
 for(const a of field.actors){
   const active=a.id===field.selected,sel=selected===a.id;
   for(const limb of a.arms){
     rectangle(limb.body,limb.half,.13,a.color,
       {line:active?"#f5d9a7":"#364e53"});
     const body=limb.body.translation(),angle=limb.body.rotation();
     const tip=V(body.x+(limb.half-.18)*Math.cos(angle)+limb.sign*.13*Math.sin(angle),
       body.y+(limb.half-.18)*Math.sin(angle)-limb.sign*.13*Math.cos(angle));
     disk(tip,.13,"#e9deae");
   }
   rectangle(a.root,a.spec.hx,a.spec.hy,a.color,
     {line:sel?"#fff1aa":active?"#eef0a6":"#41515d"});
   const p=a.root.translation(),theta=a.root.rotation();
   const nose=V(p.x+Math.cos(theta)*(a.spec.hx+.16),
     p.y+Math.sin(theta)*(a.spec.hx+.16));
   disk(nose,.10,"#21333b");
   if(a.form==="bulk")rectangle(a.root,a.spec.hx,a.spec.hy,a.color,
     {alpha:.12,line:"transparent"});
   if(a.observed.load>.1){
     ctx.lineWidth=.08;ctx.strokeStyle=active?"#ffe4b1":"#d7ae87";
     ctx.beginPath();ctx.arc(p.x,p.y,Math.max(a.spec.hx,a.spec.hy)+.2,0,Math.PI*2);
     ctx.stroke();
   }
 }
 if(field.hold){
   const link=field.holdPoints();
   ctx.strokeStyle="#7cf0cb";ctx.lineWidth=.075;
   ctx.beginPath();ctx.moveTo(link.actor.x,link.actor.y);
   ctx.lineTo(link.object.x,link.object.y);ctx.stroke();
   disk(link.actor,.10,"#a6ffe0");disk(link.object,.10,"#a6ffe0");
 }
 if(wall){
   ctx.fillStyle="rgba(222,195,138,.20)";ctx.strokeStyle="#efd89d";
   const x=Math.min(wall.x,mouse.x),y=Math.min(wall.y,mouse.y);
   const hx=Math.max(.05,Math.abs(mouse.x-wall.x))/2,
     hy=Math.max(.05,Math.abs(mouse.y-wall.y))/2;
   ctx.lineWidth=.06;ctx.fillRect(x,y,2*hx,2*hy);ctx.strokeRect(x,y,2*hx,2*hy);
 }
 if(arrow){
   ctx.strokeStyle="#ffa864";ctx.fillStyle="#ffa864";ctx.lineWidth=.12;
   ctx.beginPath();ctx.moveTo(arrow.x,arrow.y);ctx.lineTo(mouse.x,mouse.y);ctx.stroke();
   const angle=Math.atan2(mouse.y-arrow.y,mouse.x-arrow.x);
   ctx.save();ctx.translate(mouse.x,mouse.y);ctx.rotate(angle);ctx.beginPath();
   ctx.moveTo(0,0);ctx.lineTo(-.42,-.20);ctx.lineTo(-.42,.20);ctx.fill();ctx.restore();
 }
 if(mode==="matter")disk(mouse,.14,"#fff4b9");
 ctx.restore();
 el("state").textContent=paused?"PAUSED":"RUNNING";
 el("time").textContent=(field.ticks*DT).toFixed(1)+" s";
 el("counts").textContent=field.actors.length+" bodies · "+field.matter.length+" matter";
 el("activity").textContent=field.counts.contacts+" contacts · "+
    field.counts.reflex+" local responses · "+field.holdBreaks+" contact holds slipped"+
    (field.hold?" · body-contact hold ACTIVE":"");
 const a=field.actor(selected),m=field.item(selected);
 el("selection").textContent=a?
   a.form+" | "+a.arms.length+" actual limb(s) | local load "+a.observed.load.toFixed(2):
   m?m.kind+" | "+m.mass.toFixed(1)+" kg | physically movable":
   "Click any actual collider.";
 if(a){
   if(document.activeElement!==el("selected-mass"))el("selected-mass").value=a.spec.mass;
   if(document.activeElement!==el("selected-motor"))el("selected-motor").value=a.spec.motor;
   if(document.activeElement!==el("selected-hold"))el("selected-hold").value=a.spec.holdForce;
   if(document.activeElement!==el("upper"))el("upper").value=a.target[0];
   if(document.activeElement!==el("lower"))el("lower").value=a.target[1];
   el("local-response").checked=a.control==="sense";
 }else if(m && document.activeElement!==el("selected-mass"))el("selected-mass").value=m.mass;
}
function controller(){
 const dx=+keys.has("KeyD")-+keys.has("KeyA"),
   dy=+keys.has("KeyS")-+keys.has("KeyW");
 const n=Math.hypot(dx,dy)||1;
 return {move:V(dx/n,dy/n),aim:mode==="poke"||pan||author||arrow||wall?null:mouse};
}
function stepOne(){field.step({manual:controller()});}
function frame(t){
 const dt=Math.max(0,Math.min(.05,(t-last)/1000));last=t;
 if(!paused){acc+=dt;let n=0;
   while(acc>=DT&&n++<4){stepOne();acc-=DT;}
   if(n>=4)acc=Math.min(acc,DT*2);
 }
 render();
 requestAnimationFrame(frame);
}
function replaceWorld(next){
 const old=field;field=next;old?.dispose();
 selected=field.selected;mode=null;pan=null;author=null;arrow=null;wall=null;
 acc=0;last=performance.now();
 window.__X0=field;render();
}
function activate(){
 el("pause").onclick=()=>{paused=!paused;el("pause").textContent=paused?"Resume":"Pause";
   acc=0;last=performance.now();};
 el("step").onclick=()=>fail(()=>{if(!paused)throw Error("Pause before single-stepping");
   stepOne();render();});
 el("reset").onclick=()=>fail(()=>{replaceWorld(saved?restore(saved):new CommonsWorld());
   message("Restored authored starting state; running solver history intentionally reset.");});
 el("local-response").onchange=()=>fail(()=>{
   if(!field.setLocalResponse(selected,el("local-response").checked))
     throw Error("Select a physical organism");
   message("Local bodily response "+(el("local-response").checked?"enabled":"disabled")+
     " on selected organism; only affects it when not piloted.");
 });
 el("apply-selected").onclick=()=>fail(()=>{
   const m=safe(Number(el("selected-mass").value),"mass");
   const actor=field.actor(selected),obj=field.item(selected);
   if(actor){
     field.setSpec(selected,"holdForce",safe(Number(el("selected-hold").value),"hold force"));
     field.setSpec(selected,"mass",m);
     field.setSpec(selected,"motor",safe(Number(el("selected-motor").value)));
   }else if(obj)field.setMaterialMass(selected,m);
   else throw Error("Select an actor or dynamic material");
   message("Physical mass/finite motor updated without resetting other matter.");
 });
 for(const [index,input] of [[0,"upper"],[1,"lower"]])
   el(input).oninput=()=>fail(()=>{if(!field.setActiveArm(selected,index,Number(el(input).value)))
      throw Error("Select a body with this physical arm");});
 const fillBodyPreset=()=>{
   const p=BODY_PRESETS[el("body-type").value];
   for(const [key,value] of [["new-hx",p.hx],["new-hy",p.hy],
      ["new-arms",p.arms],["new-arm-length",p.armLength],
      ["new-mass",p.mass],["new-motor",p.motor],["new-hold",p.holdForce]])
     el(key).value=String(value);
 };
 el("body-type").onchange=fillBodyPreset;
 fillBodyPreset();
 el("spawn").onclick=()=>fail(()=>{
   const count=Number(el("count").value),form=el("body-type").value;
   if(!Number.isInteger(count)||count<1||count>100)
     throw RangeError("Use 1..100 bodies per action; repeated spawns allowed");
   const shape={hx:safe(Number(el("new-hx").value),"hull half length"),
     hy:safe(Number(el("new-hy").value),"hull half width"),
     arms:safe(Number(el("new-arms").value),"real appendage count"),
     armLength:safe(Number(el("new-arm-length").value),"real arm length"),
     mass:safe(Number(el("new-mass").value),"root physical mass"),
     motor:safe(Number(el("new-motor").value),"finite root drive"),
     holdForce:safe(Number(el("new-hold").value),"finite contact hold authority")};
   for(let i=0;i<count;i++){
     const angle=i*2.39996,r=.50*Math.sqrt(i);
     field.addActor(form,V(mouse.x+r*Math.cos(angle),mouse.y+r*Math.sin(angle)),angle,shape);
   }
   selected=field.actors.at(-1).id;field.select(selected);
   message("Added "+count+" real dynamic bodies to same solver, no population cap.");
 });
 el("add-material").onclick=()=>{mode=mode==="matter"?null:"matter";
   message(mode?"Click to place actual material; type and size are editable.":"Placement cancelled.");};
 el("undo").onclick=()=>fail(()=>{
   if(!field.undo())throw Error("Nothing user-authored to undo");
   message("Last authored body of matter removed without resetting world.");
 });
 el("poke").onclick=()=>{mode=mode==="poke"?null:"poke";arrow=null;
   message(mode?"Drag from any physical collider; arrow direction specifies outside impulse.":"Force probe cancelled.");};
 el("capture").onclick=()=>fail(()=>{
   saved=capture(field);
   el("recipe").value=JSON.stringify(saved,null,2);
   el("recipe").closest("details").open=true;
   message("Captured posed initial condition. Velocities and running contact state excluded.");
 });
 el("load").onclick=()=>fail(()=>{
   const data=JSON.parse(el("recipe").value),candidate=restore(data);
   const canonical=capture(candidate);replaceWorld(candidate);saved=canonical;
   paused=true;el("pause").textContent="Resume";
   message("Validated & loaded. Paused for physical inspection; all contacts reset.");
 });
 canvas.addEventListener("contextmenu",event=>event.preventDefault());
 canvas.addEventListener("pointerdown",event=>fail(()=>{
   mouse=worldPoint(event);
   if(event.button===2){
     event.preventDefault();
     if(field.hold){
       field.endHold();message("Released body-held material; solver motion continues.");
     }else if(!field.beginHold(mouse)){
       message("Contact hold unavailable: touch material with the selected organism hull/limb first.");
     }else{
       message("Body-contact hold: finite reciprocal force on "+
         field.hold.actorPart+". Right click again to release.");
     }
     return;
   }
   if(event.button===1){pan={screen:V(event.clientX,event.clientY),
     camera:V(camera.x,camera.y)};return;}
   if(event.button!==0)return;
   if(mode==="poke"){if(!field.pick(mouse))throw Error("Drag from a real dynamic collider");
     arrow={...mouse};return;}
   if(mode==="matter"){
     const kind=el("material-type").value,mass=safe(Number(el("material-mass").value)),
       span=safe(Number(el("span").value));
     if(kind==="block")field.addMatter(mouse,{mass,hx:Math.max(.15,span/5),hy:.42});
     else if(kind==="beam")field.addMatter(mouse,{mass,hx:span/2,hy:.18,form:"beam"});
     else if(kind==="hinge")field.addHinge(mouse,{mass,length:span});
     else if(kind==="rail")field.addRail(mouse,{mass,length:span});
     else throw Error("Unknown material");
     mode=null;message("Real material authored; resume or disturb with an external force.");
     return;
   }
   if(event.shiftKey){
     if(!paused)throw Error("Pause before authoring a fixed wall");
     wall={...mouse};return;
   }
   const id=field.pick(mouse);
   if(event.ctrlKey||event.altKey){
     if(!paused)throw Error("Pause before editing physical poses");
     if(!id)throw Error("Start dragging on a real body or crate");
     const a=field.actor(id),m=field.item(id);
     const anchor=m?.kind==="hinge"?V(m.x,m.y):
       a?.root.translation()||m?.body.translation();
     author={id,anchor:V(anchor.x,anchor.y),origin:V(mouse.x,mouse.y),
       angle:a?.root.rotation()??m?.body.rotation()??0,
       rotating:event.altKey,
       bearing:Math.atan2(mouse.y-anchor.y,mouse.x-anchor.x)};
     return;
   }
   selected=id;field.select(field.actor(id)?id:null);
 }));
 canvas.addEventListener("pointermove",event=>fail(()=>{
   mouse=worldPoint(event);
   if(pan){
     camera.x=pan.camera.x-(event.clientX-pan.screen.x)/SIZE.scale;
     camera.y=pan.camera.y-(event.clientY-pan.screen.y)/SIZE.scale;
   }
   if(author&&paused){
     const p=author;
     if(p.rotating){
       const theta=p.angle+Math.atan2(mouse.y-p.anchor.y,mouse.x-p.anchor.x)-p.bearing;
       field.pose(p.id,p.anchor,theta);
     }else{
       if(field.item(p.id)?.kind==="hinge"||field.item(p.id)?.kind==="rail")
         throw Error("Material pivot fixed; use Alt-rotate a hinge");
       const d=V(mouse.x-p.origin.x,mouse.y-p.origin.y);
       field.pose(p.id,V(p.anchor.x+d.x,p.anchor.y+d.y));
     }
   }
 }));
 canvas.addEventListener("pointerup",event=>fail(()=>{
   mouse=worldPoint(event);
   if(arrow){
     const d=V(mouse.x-arrow.x,mouse.y-arrow.y),len=norm(d),
       magnitude=safe(Number(el("poke-magnitude").value),"point impulse");
     if(len>.08&&magnitude>0){
       const r=field.poke(arrow,V(d.x/len*magnitude,d.y/len*magnitude));
       if(!r)throw Error("Physical collision target moved; impulse not applied");
       message("Outside "+magnitude+" N·s force applied to "+r.part+
         "; changes carried by solver, not organism policy.");
     }
     arrow=null;mode=null;
   }
   if(wall){
     const hx=Math.max(.05,Math.abs(mouse.x-wall.x)/2),
       hy=Math.max(.05,Math.abs(mouse.y-wall.y)/2);
     const mid=V((mouse.x+wall.x)/2,(mouse.y+wall.y)/2);
     if(hx>.08||hy>.08)field.addWall(mid,{hx,hy});
     wall=null;
   }
   pan=null;author=null;
 }));
 canvas.addEventListener("pointercancel",()=>{pan=null;author=null;arrow=null;wall=null;});
 canvas.addEventListener("wheel",event=>{
   event.preventDefault();
   const before=worldPoint(event);
   camera.zoom=clamp(camera.zoom*Math.exp(-event.deltaY*.0011),.55,4.6);
   dimensions();const after=worldPoint(event);
   camera.x+=before.x-after.x;camera.y+=before.y-after.y;
 },{passive:false});
 addEventListener("keydown",event=>{
   if(event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement)return;
   keys.add(event.code);
   if(event.code==="Space"){event.preventDefault();el("pause").click();}
   if(event.code==="Escape"){field.endHold();mode=null;}
   if(event.code==="KeyE"||event.code==="KeyQ"){
     field.setActiveArm(selected,0,event.code==="KeyE"?0:1);
     field.setActiveArm(selected,1,event.code==="KeyE"?0:1);
   }
 });
 addEventListener("keyup",event=>keys.delete(event.code));
 addEventListener("blur",()=>{keys.clear();field?.endHold();});
}
async function start(){
 replaceWorld(new CommonsWorld());
 activate();
 message("Live Rapier world. Alter bodies or materials; local responses are not goal agents.");
 el("health").textContent="PHYSICS LIVE · Owner quality unverified";
 document.body.dataset.live="yes";
 if(new URLSearchParams(location.search).has("probe")){
   const {runX0Probe}=await import("./src/x0-probe.js");
   document.body.dataset.probe=JSON.stringify(runX0Probe(CommonsWorld,capture,restore));
   const uiCheck=()=>{
     const verify=(ok,msg)=>{if(!ok)throw Error("X0 actual UI: "+msg);};
     const loc=p=>{
       dimensions();const v=project(p),r=canvas.getBoundingClientRect();
       return {clientX:r.left+v.x,clientY:r.top+v.y};
     };
     const pointer=(type,pos,extra={})=>
       canvas.dispatchEvent(new PointerEvent(type,{
         ...loc(pos),bubbles:true,button:0,pointerId:71,...extra
       }));
     const initial=field.snapshot();
     el("pause").click();verify(paused,"pause button did not pause");
     const driven=field.actor(field.selected),beforeDriven=V(
       driven.root.translation().x,driven.root.translation().y);
     dispatchEvent(new KeyboardEvent("keydown",{code:"KeyE",bubbles:true}));
     verify(driven.target.every(x=>x===0),
       "E did not command actual physical appendages");
     dispatchEvent(new KeyboardEvent("keydown",{code:"KeyQ",bubbles:true}));
     verify(driven.target.every(x=>x===1),
       "Q did not reopen actual physical appendages");
     dispatchEvent(new KeyboardEvent("keydown",{code:"KeyD",bubbles:true}));
     for(let i=0;i<45;i++)el("step").click();
     dispatchEvent(new KeyboardEvent("keyup",{code:"KeyD",bubbles:true}));
     const moved=norm(V(driven.root.translation().x-beforeDriven.x,
       driven.root.translation().y-beforeDriven.y));
     verify(moved>.20,"WASD motor did not move actual physical selected body");
     el("local-response").checked=false;
     el("local-response").dispatchEvent(new Event("change",{bubbles:true}));
     verify(field.actor(field.selected).control==="quiet",
       "UI did not disable organism-local response");
     el("local-response").checked=true;
     el("local-response").dispatchEvent(new Event("change",{bubbles:true}));
     verify(field.actor(field.selected).control==="sense",
       "UI did not restore material response");
     const lever=field.actors.find(a=>a.form==="lever");
     pointer("pointerdown",lever.root.translation());
     verify(selected===lever.id,"click did not select physical second body");
     el("count").value="5";el("body-type").value="bulk";
     el("body-type").dispatchEvent(new Event("change",{bubbles:true}));
     el("new-arms").value="1";el("new-arm-length").value="2.15";
     el("new-hx").value=".68";el("new-mass").value="165";
     el("spawn").click();
     verify(field.actors.length===initial.actors+5,
       "batch spawn did not add real bodies");
     verify(field.actors.at(-1).arms.length===1 &&
       Math.abs(field.actors.at(-1).arms[0].half-1.075)<.001 &&
       Math.abs(field.actors.at(-1).spec.hx-.68)<.001,
       "Owner edited morphology is only a visual setting");
     const initialMatter=field.matter.length;
     el("material-type").value="beam";el("material-mass").value="95";
     el("span").value="3.2";el("add-material").click();
     pointer("pointerdown",V(37,8));
     verify(field.matter.length===initialMatter+1&&mode===null,
       "direct material authoring failed");
     el("capture").click();
     const captured=JSON.parse(el("recipe").value);
     verify(captured.actors.length===field.actors.length,
       "UI capture omitted new physical actors");
     const m=field.matter.find(x=>x.kind==="free"),body=m.body;
     const before=V(body.linvel().x,body.linvel().y);
     el("poke-magnitude").value="330";el("poke").click();
     const p=body.translation();
     pointer("pointerdown",p);pointer("pointermove",V(p.x+1,p.y+.45));
     pointer("pointerup",V(p.x+1,p.y+.45));
     verify(norm(V(body.linvel().x-before.x,body.linvel().y-before.y))>.1,
       "actual arrow drag did not add external impulse to matter");
     el("load").click();
     verify(paused&&field.ticks===0&&field.matter.length===captured.matter.length,
       "UI load did not atomically restore initial material condition");
     const restoredCustom=field.actors.at(-1);
     verify(restoredCustom.arms.length===1 &&
       Math.abs(restoredCustom.arms[0].half-1.075)<.001 &&
       Math.abs(restoredCustom.spec.hx-.68)<.001,
       "custom actual body topology not preserved on scene reload");
     verify(field.matter.some(m=>m.form==="beam"),
       "free beam shape identity lost on portable scene reload");
     const g=field.matter.find(x=>x.kind==="hinge"),angle=g.body.rotation();
     const gp=g.body.translation();
     pointer("pointerdown",gp,{altKey:true});
     pointer("pointermove",V(gp.x-.3,gp.y+.85),{altKey:true});
     pointer("pointerup",V(gp.x-.3,gp.y+.85),{altKey:true});
     verify(Math.abs(g.body.rotation()-angle)>.03,
       "Alt-drag failed to rotate actual pinned hinge");
     const free=field.matter.find(x=>x.kind==="free"),origin=free.body.translation();
     const prev=V(origin.x,origin.y);
     pointer("pointerdown",prev,{ctrlKey:true});
     pointer("pointermove",V(prev.x+.7,prev.y+.65),{ctrlKey:true});
     pointer("pointerup",V(prev.x+.7,prev.y+.65),{ctrlKey:true});
     verify(norm(V(free.body.translation().x-prev.x,
       free.body.translation().y-prev.y))>.20,
       "Ctrl-drag failed to move physical crate without reset");
     replaceWorld(new CommonsWorld({empty:true}));
     const hActor=field.addActor("reach",V(10,12),0);
     selected=hActor.id;field.select(hActor.id);
     const hLimb=hActor.arms[0],hRot=hLimb.body.rotation(),hPos=hLimb.body.translation();
     const hTip=V(hPos.x+Math.cos(hRot)*(hLimb.half-.18)-Math.sin(hRot)*(-hLimb.sign*.13)+.16*Math.cos(hRot),
       hPos.y+Math.sin(hRot)*(hLimb.half-.18)+Math.cos(hRot)*(-hLimb.sign*.13)+.16*Math.sin(hRot));
     const hLoad=field.addMatter(hTip,{mass:18,hx:.23,hy:.22});
     pointer("pointerdown",hTip,{button:2});
     verify(field.hold?.objectId===hLoad.id,"RMB contact acquisition failed");
     pointer("pointerdown",hTip,{button:2});
     verify(!field.hold,"RMB material release failed");
     return {pause:true,directMotorTravel:+moved.toFixed(3),
       materialAuthoring:true,bodySpawn:5,
       toggle:true,pointImpulse:true,hingeRotation:true,
       bodyReposition:true,portablePose:true};
   };
   document.body.dataset.uiProbe=JSON.stringify(uiCheck());

 }
 if(new URLSearchParams(location.search).has("holdprobe")){
   const {holdMaterialProbe}=await import("./src/x0-hold-probe.js");
   document.body.dataset.holdProbe=JSON.stringify(holdMaterialProbe(CommonsWorld));
 }
 if(new URLSearchParams(location.search).has("pressure")){
   const {sharedMaterialPressure}=await import("./src/x0-field-pressure.js");
   document.body.dataset.pressure=JSON.stringify(sharedMaterialPressure(CommonsWorld));
 }
 requestAnimationFrame(frame);
}
start().catch(error=>{
 document.body.dataset.liveError=String(error.stack||error);
 el("health").textContent="PHYSICS FAILED";message(String(error));console.error(error);
});
