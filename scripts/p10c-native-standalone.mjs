// P10 native CDP pointer/keyboard test of emitted Rapier workshop.
// Only human-like INPUT events, no JS mutation of world state.
import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
const url=process.argv[2]||"http://127.0.0.1:4173/";
const bin=process.env.CHROME_BIN||"chromium";
const port=9274,server="http://127.0.0.1:"+port;
const dir=resolve("p10c-evidence");mkdirSync(dir,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const child=spawn(bin,["--headless=new","--no-sandbox","--disable-gpu",
 "--disable-dev-shm-usage","--remote-allow-origins=*","--window-size=1520,970",
 "--remote-debugging-port="+port,"--user-data-dir=/tmp/p10-chrome-"+process.pid,
 "about:blank"],{stdio:"ignore"});
let ws,id=0;const promises=new Map();const requests=[];const browserDiagnostics=[];
function send(method,params={}){
 const n=++id;return new Promise((resolve,reject)=>{
  promises.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));
 });
}
async function js(expr){
 const a=await send("Runtime.evaluate",{expression:expr,returnByValue:true,awaitPromise:true});
 if(a.exceptionDetails)throw Error(JSON.stringify(a.exceptionDetails));
 return a.result?.value;
}
async function down(x,y){
 await send("Input.dispatchMouseEvent",{type:"mouseMoved",x,y});
 await send("Input.dispatchMouseEvent",{type:"mousePressed",x,y,button:"left",buttons:1,clickCount:1});
 await send("Input.dispatchMouseEvent",{type:"mouseReleased",x,y,button:"left",buttons:0,clickCount:1});
}
async function clickButton(name){
 await js('document.getElementById('+JSON.stringify(name)+').scrollIntoView({block:"center",behavior:"instant"})');
 await sleep(100);
 const p=await js('(function(){var r=document.getElementById('+JSON.stringify(name)+').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()');
 await down(p.x,p.y);
}
async function bodyClick(x,y){
 const p=await js('(function(){var c=document.getElementById("world"),r=c.getBoundingClientRect(),view=window.__p10ViewReadOnly(),s=Math.min(c.width/40,c.height/24)*view.zoom;return {x:r.left+(c.width/2+('+x+'-view.x)*s)*r.width/c.width,y:r.top+(c.height/2+('+y+'-view.y)*s)*r.height/c.height};})()');
 await down(p.x,p.y);
}
async function ctrlDragBarrier(x1,y1,x2,y2){
 function expr(x,y){
  return '(function(){var c=document.getElementById("world"),r=c.getBoundingClientRect(),view=window.__p10ViewReadOnly(),s=Math.min(c.width/40,c.height/24)*view.zoom;return {x:r.left+(c.width/2+('+x+'-view.x)*s)*r.width/c.width,y:r.top+(c.height/2+('+y+'-view.y)*s)*r.height/c.height};})()';
 }
 const a=await js(expr(x1,y1)),b=await js(expr(x2,y2));
 await send("Input.dispatchMouseEvent",{type:"mouseMoved",x:a.x,y:a.y,modifiers:2});
 await send("Input.dispatchMouseEvent",{type:"mousePressed",x:a.x,y:a.y,button:"left",buttons:1,modifiers:2,clickCount:1});
 await send("Input.dispatchMouseEvent",{type:"mouseMoved",x:b.x,y:b.y,button:"left",buttons:1,modifiers:2});
 await send("Input.dispatchMouseEvent",{type:"mouseReleased",x:b.x,y:b.y,button:"left",buttons:0,modifiers:2,clickCount:1});
}
async function key(code,on){
 const k=code.slice(3).toLowerCase(),n=code.slice(3).toUpperCase().charCodeAt(0);
 await send("Input.dispatchKeyEvent",{type:on?"keyDown":"keyUp",key:k,code,windowsVirtualKeyCode:n,nativeVirtualKeyCode:n});
}
async function press(code){await key(code,true);await sleep(70);await key(code,false);}
async function snap(){return js("window.__p10ReadOnlyProbe()");}
async function image(file){
 const s=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
 writeFileSync(resolve(dir,file),Buffer.from(s.data,"base64"));
}
try{
 let endpoint=null;
 for(let i=0;i<100;i++){
  try{const t=await (await fetch(server+"/json")).json();
   endpoint=t.find(x=>x.type==="page")?.webSocketDebuggerUrl;}catch{}
  if(endpoint)break;await sleep(90);
 }
 if(!endpoint)throw Error("No true Chrome CDP endpoint");
 ws=new WebSocket(endpoint);
 await new Promise((res,rej)=>{ws.addEventListener("open",res,{once:true});ws.addEventListener("error",rej,{once:true});});
 ws.addEventListener("message",e=>{
  let m;try{m=JSON.parse(e.data)}catch{return;}
  if(["Runtime.exceptionThrown","Runtime.consoleAPICalled","Log.entryAdded"].includes(m.method)){
   browserDiagnostics.push(JSON.stringify(m).slice(0,2500));return;
  }
  if(m.method==="Network.requestWillBeSent"){
   requests.push(m.params?.request?.url||"");return;
  }
  const cb=promises.get(m.id);if(!cb)return;promises.delete(m.id);
  m.error?cb.reject(Error(JSON.stringify(m.error))):cb.resolve(m.result);
 });
 await send("Page.enable");await send("Runtime.enable");await send("Log.enable");await send("Network.enable");
 const navigation=await send("Page.navigate",{url:new URL("p10.html",url).toString()});
 let ready=false;
 for(let i=0;i<150;i++){
  ready=await js('document.body?.dataset?.p10Live==="yes"').catch(()=>false);
  if(ready)break;await sleep(80);
 }
 if(!ready){
  const status=await js("({href:location.href,ready:document.readyState,title:document.title,bodyBytes:document.body?.innerHTML.length,status:document.getElementById('status')?.textContent,dataset:{...document.body?.dataset}})");
  const diagnostic={navigation,status,requests,browserDiagnostics};
  writeFileSync(resolve(dir,"p10c-failed-browser-debug.json"),JSON.stringify(diagnostic,null,2));
  throw Error("P10c executable module not bootstrapped: "+JSON.stringify(diagnostic).slice(0,9000));
 }
 await sleep(150);
 const start=await snap();
 // Native camera actions: no programmatic camera/state mutation.
 await clickButton("view-selected");
 const focused=await js("window.__p10ViewReadOnly()");
 const tracked=start.actors.find(a=>a.id===start.selected);
 if(!tracked||Math.hypot(focused.x-tracked.x,focused.y-tracked.y)>.005||
    focused.zoom<1.91)
  throw Error("P10b real camera focus did not select physical body");
 await image("p10b-native-focused-body.png");

 // Exact native wheel event, ground-truth world point beneath cursor;
 // screen-point anchored zoom must preserve that position.
 const screenPoint=await js('(function(){var r=document.getElementById("world").getBoundingClientRect();return {x:Math.round(r.left+r.width*.64),y:Math.round(r.top+r.height*.54)};})()');
 const inverse='(function(){var c=document.getElementById("world"),r=c.getBoundingClientRect(),cam=window.__p10ViewReadOnly(),scale=Math.min(c.width/40,c.height/24)*cam.zoom;return {x:cam.x+((('+screenPoint.x+'-r.left)*c.width/r.width)-c.width/2)/scale,y:cam.y+((('+screenPoint.y+'-r.top)*c.height/r.height)-c.height/2)/scale,zoom:cam.zoom};})()';
 const beforeWheel=await js(inverse);
 await send("Input.dispatchMouseEvent",{type:"mouseWheel",
  x:screenPoint.x,y:screenPoint.y,deltaX:0,deltaY:-200});
 await sleep(110);
 const afterWheel=await js(inverse);
 const pointError=Math.hypot(afterWheel.x-beforeWheel.x,afterWheel.y-beforeWheel.y);
 if(!(afterWheel.zoom>beforeWheel.zoom)||pointError>.003)
  throw Error("P10b true Chromium wheel zoom broke world cursor anchor "+
   JSON.stringify({beforeWheel,afterWheel,pointError}));

 await clickButton("view-all");
 const overview=await js("window.__p10ViewReadOnly()");
 if(overview.zoom!==1.1||overview.x!==20||overview.y!==12)
  throw Error("P10b actual overview camera command failed");
 await image("p10b-native-whole-world.png");
 await clickButton("reset");
 const resetView=await js("window.__p10ViewReadOnly()");
 if(Math.abs(resetView.x-17.2)>.001||Math.abs(resetView.y-14.25)>.001||
    Math.abs(resetView.zoom-1.57)>.001)
  throw Error("P10b reset did not restore legible opening view");

 if(!start?.finite||start.actors.length!==3||start.cargo.length!==5||start.auto!==false)
  throw Error("P10 native true quiet physical world absent");
 await image("p10-native-world-start.png");
 await clickButton("pause");
 const frozen=await snap();
 await sleep(140);
 if((await snap()).tick!==frozen.tick)throw Error("P10 clock moved while paused");
 const tool=frozen.actors.find(a=>a.kind==="lever");
 await bodyClick(tool.x,tool.y);
 if((await snap()).selected!==tool.id)throw Error("P10 owner pointer failed real body select");
 await press("KeyB");await press("KeyE");
 const command=await snap();
 if(command.actors.find(a=>a.id===tool.id).stance!=="brace")
  throw Error("P10 native B did not change physical stance");
 await clickButton("pause");await sleep(700);
 const limb=await snap();
 if(limb.tick<=command.tick||limb.panelImpulse<=command.panelImpulse)
  throw Error("P10 operator joint did not move under real E");
 await clickButton("pause");
 const pre=await snap();
 await clickButton("open");
 const edited=await snap();
 if(pre.tick!==edited.tick||
    Math.abs(edited.aperture.width-pre.aperture.width-1.3)>.0001||
    JSON.stringify(pre.actors)!==JSON.stringify(edited.actors))
  throw Error("P10 actual live physical authoring corrupted other actors or time");
 await image("p10-native-world-physical-wall-edited.png");

 const beforeDrag=await snap();
 await // Grab a visible physical part of the upper wall in the tighter view.
 await ctrlDragBarrier(28,8.35,28,7.85);
 const afterDrag=await snap();
 if(afterDrag.tick!==beforeDrag.tick||
    Math.abs(afterDrag.aperture.width-beforeDrag.aperture.width-.5)>.025||
    JSON.stringify(afterDrag.actors)!==JSON.stringify(beforeDrag.actors))
  throw Error("P10 real Ctrl+pointer drag failed real fixed collider editing or altered resident states "+
   JSON.stringify({before:beforeDrag.aperture,after:afterDrag.aperture}));
 await image("p10-native-real-ctrl-drag-edited-wall.png");

 const small=edited.actors.find(a=>a.kind==="small");
 await bodyClick(small.x,small.y);
 if((await snap()).selected!==small.id)
  throw Error("P10 native click failed small actor");
 await clickButton("pause");
 const before=await snap();
 await key("KeyD",true);await sleep(1880);await key("KeyD",false);
 const after=await snap();
 const p=before.actors.find(a=>a.id===small.id);
 const q=after.actors.find(a=>a.id===small.id);
 if(after.tick<=before.tick||q.x-p.x<.5||after.rootEffort<=before.rootEffort)
  throw Error("P10 native WASD did not move chosen physical body "+
   JSON.stringify({p,q,before:before.tick,after:after.tick}));
 await press("KeyG");
 const grip=await snap(),linked=grip.grips.some(g=>g.actor===small.id);

 // Test beyond a green grip flag: attempt an ACTUAL operator-driven
 // reciprocal cargo action using the unchanged physical world.
 const physicalLink=grip.grips.find(g=>g.actor===small.id);
 let pullSource=null;
 if(physicalLink){
  const cargo0=grip.cargo.find(e=>e.id===physicalLink.load);
  await key("KeyA",true);await sleep(1800);await key("KeyA",false);
  const afterPull=await snap(),cargo1=afterPull.cargo.find(e=>e.id===physicalLink.load);
  if(!cargo0||!cargo1||!afterPull.finite||afterPull.tick<=grip.tick)
   throw Error("P10b real cargo afteraction source missing");
  pullSource={cargoId:physicalLink.load,startingCargoX:cargo0.x,
   endingCargoX:cargo1.x,cargoMovedX:cargo1.x-cargo0.x,
   linkSurvives:afterPull.grips.some(g=>g.actor===small.id)};
  // Deliberately DO NOT post-hoc assert success: a negative cargo
  // afterstate is material UX evidence, NOT merely a CI failure.
 }

 await image("p10-native-world-after-real-input.png");
 const nonEmbeddedRequests=requests.filter(x=>!x.endsWith("/p10.html")&&!x.startsWith("data:"));
 if(nonEmbeddedRequests.length)throw Error("P10c standalone requires external fetches: "+JSON.stringify(nonEmbeddedRequests));
 const report={source:"Actual native Chrome pointer/key/wheel on one self-contained P10b HTML served over localhost only; NO external requests. No DOM mutation.",
  standalone:{externalRequests:nonEmbeddedRequests,allRequests:requests,
   fileUrlDirectlyTested:false,
   fileReason:"Host Chromium file:// navigation rejected by administrator policy; HTTP self-contained source passed, no claim of direct file:// test."},
  initial:{actors:start.actors.length,cargo:start.cargo.length,auto:start.auto},
  pauseFrozen:true,
  tool:{selectedWithPointer:tool.id,realKeyB:true,realKeyE:true,
   jointImpulseDelta:limb.panelImpulse-command.panelImpulse},
  authoredMaterial:{sameTick:pre.tick===edited.tick,
   oldWidth:pre.aperture.width,newWidth:edited.aperture.width,
   unchangedActors:JSON.stringify(pre.actors)===JSON.stringify(edited.actors)},
  freeAuthoring:{nativeCtrlDrag:true,oldAperture:beforeDrag.aperture.width,
   newAperture:afterDrag.aperture.width,sameTick:true,otherActorsUnchanged:true},
  manualMovement:{actorId:small.id,ticks:after.tick-before.tick,
   dx:q.x-p.x,sourceImpulseDelta:after.rootEffort-before.rootEffort},
  camera:{focusedBody:tracked.id,focusedZoom:focused.zoom,overviewZoom:overview.zoom,resetZoom:resetView.zoom,wheelZoom:afterWheel.zoom,wheelAnchorError:pointError},
  grip:{attemptedWithRealG:true,actuallyLinked:linked,reciprocalPull:pullSource,
   UI:await js('document.getElementById("status").textContent')},
  limits:"Native mechanical input proof, not Owner play/feel or realistic gait."};
 writeFileSync(resolve(dir,"p10c-standalone-native-controls.json"),JSON.stringify(report,null,2));
 console.log("P10c standalone self-contained native operator proof:");
 console.log(JSON.stringify(report));
}finally{try{ws?.close()}catch{}child.kill("SIGKILL");}
