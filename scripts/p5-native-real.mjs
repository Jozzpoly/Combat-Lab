// P0 genuine OS-like owner interactions via Chrome DevTools Protocol, NOT
// dispatched synthetic DOM PointerEvent. Works on emitted production bundle.
// It cannot judge feel or replace a human. Screenshots are raw Chromium pixels.
import {spawn} from "node:child_process";
import {writeFileSync,mkdirSync} from "node:fs";
import {resolve} from "node:path";
const base=process.argv[2]??"http://127.0.0.1:4173/";
const bin=process.env.CHROME_BIN||"chromium";
const port=9254,endpoint="http://127.0.0.1:"+port;
const folder=resolve("p0-evidence");mkdirSync(folder,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const child=spawn(bin,["--headless=new","--no-sandbox","--disable-gpu",
 "--disable-dev-shm-usage","--remote-allow-origins=*",
 "--remote-debugging-port="+port,"--window-size=1500,950",
 "--user-data-dir=/tmp/p0-cdp-"+process.pid,"about:blank"],{stdio:"ignore"});
let ws;
async function available(){
 for(let i=0;i<80;i++){
  try{const json=await (await fetch(endpoint+"/json")).json();
    const page=json.find(x=>x.type==="page");
    if(page?.webSocketDebuggerUrl)return page.webSocketDebuggerUrl;
  }catch{}
  await wait(100);
 }
 throw Error("P0 real input Chromium websocket unavailable");
}
let seq=0;const responses=new Map();
async function send(method,params={}){
 const id=++seq;
 return new Promise((resolve,reject)=>{
  responses.set(id,{resolve,reject});
  ws.send(JSON.stringify({id,method,params}));
 });
}
async function evalJS(expression){
 const a=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
 if(a.exceptionDetails)throw Error("Browser expression: "+JSON.stringify(a.exceptionDetails));
 return a.result?.value;
}
async function mouse(x,y,kind="click",modifiers=0){
 await send("Input.dispatchMouseEvent",{type:"mouseMoved",x,y,modifiers});
 if(kind==="click"||kind==="press")
  await send("Input.dispatchMouseEvent",{type:"mousePressed",x,y,
    button:"left",buttons:1,modifiers,clickCount:1});
 if(kind==="click"||kind==="release")
  await send("Input.dispatchMouseEvent",{type:"mouseReleased",x,y,
    button:"left",buttons:0,modifiers,clickCount:1});
}
async function key(code,down){
 const mappings={KeyG:["g",71],KeyA:["a",65]};
 const [key,num]=mappings[code];
 await send("Input.dispatchKeyEvent",{type:down?"keyDown":"keyUp",
   key,code,windowsVirtualKeyCode:num,nativeVirtualKeyCode:num});
}
async function coords(x,y){
 return evalJS(`(()=>{const c=document.getElementById("world"),r=c.getBoundingClientRect(),
 dpr=Math.min(2,window.devicePixelRatio||1),
 scale=Math.min(Math.round(r.width*dpr)/40,Math.round(r.height*dpr)/24)/dpr;
 return {x:r.left+r.width/2+( ${x}-20)*scale,
 y:r.top+r.height/2+( ${y}-12)*scale};})()`);
}
async function clickElement(id){
 const p=await evalJS(`(()=>{const r=document.getElementById("${id}").getBoundingClientRect();
 return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
 await mouse(p.x,p.y);
}
async function snap(){return evalJS("window.__p0ReadOnlyProbe?.()");}


try{
 const endpointUrl=await available();ws=new WebSocket(endpointUrl);
 await new Promise((res,rej)=>{ws.addEventListener("open",res,{once:true});
  ws.addEventListener("error",rej,{once:true});});
 ws.addEventListener("message",event=>{
  let m;try{m=JSON.parse(event.data)}catch{return;}
  if(!m.id)return;const cb=responses.get(m.id);if(!cb)return;
  responses.delete(m.id);m.error?cb.reject(Error(JSON.stringify(m.error))):cb.resolve(m.result);
 });
 await send("Page.enable");await send("Runtime.enable");
 const src=new URL(base);src.searchParams.set("p5native","1");
 await send("Page.navigate",{url:src.toString()});
 for(let i=0;i<145;i++){
  const ready=await evalJS('document.body?.dataset?.p0Live==="yes" && !!window.__p5ReadOnlyProbe').catch(()=>false);
  if(ready)break;if(i===144)throw Error("P5 native source UI never became live");
  await wait(75);
 }
 // Real pointer through the public browser control, not direct source setup.
 await clickElement("p5-preset");
 await wait(1800);
 const pre=await evalJS("window.__p5ReadOnlyProbe()");
 if(!pre||pre.actorCount!==6||pre.loadCount!==3||!pre.finite||
    pre.auto!==true||pre.policy!=="material"||
    pre.activity.autonomousEffort<=0||pre.activity.externalImpulses!==0)
  throw Error("P5 native preset/source motor not truly running "+JSON.stringify({
   actors:pre?.actorCount,loads:pre?.loadCount,effort:pre?.activity?.autonomousEffort}));
 const preImage=(await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false})).data;
 writeFileSync(resolve(folder,"p5-native-six-body-before-operator.png"),
  Buffer.from(preImage,"base64"));
 const cargoX=pre.loads[0].x,cargoY=pre.loads[0].y;
 await clickElement("p5-pulse");
 await wait(1800);
 const after=await evalJS("window.__p5ReadOnlyProbe()");
 if(!after||!after.finite||after.activity.externalImpulses!==1||
    after.activity.externalImpulseSum<90||
    (Math.hypot(after.loads[0].x-cargoX,after.loads[0].y-cargoY)<.02))
  throw Error("P5 native physical operator shock not sourced "+JSON.stringify(after?.activity));
 const postImage=(await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false})).data;
 writeFileSync(resolve(folder,"p5-native-six-body-after-operator.png"),
  Buffer.from(postImage,"base64"));
 // Actual user freeze for LOCAL control, not a Pause of physics.
 await clickElement("p5-motor");await wait(160);
 const frozen=await evalJS("window.__p5ReadOnlyProbe()");
 if(frozen.auto!==false)throw Error("P5 native local motor did not switch off");
 const frozenEffort=frozen.activity.autonomousEffort;
 await wait(280);
 const observed=await evalJS("window.__p5ReadOnlyProbe()");
 if(!observed.finite||observed.activity.autonomousEffort!==frozenEffort||
  observed.tick<=frozen.tick)
   throw Error("P5 motor pause wrongly also stopped physical solver");
 const report={
  source:"Real CDP Chrome mouse clicking P5 start, push 95+25 N.s into independent load and stop local motor while solver stays on",
  initial:{actors:pre.actorCount,loads:pre.loadCount,
   contacts:pre.activity.contactActor,cargoContacts:pre.activity.contactCargo,
   localGrips:pre.activity.localGrips,effort:pre.activity.autonomousEffort,
   firstCargoX:cargoX,firstCargoY:cargoY},
  after:{contacts:after.activity.contactActor,cargoContacts:after.activity.contactCargo,
   localGrips:after.activity.localGrips,firstCargoX:after.loads[0].x,
   firstCargoY:after.loads[0].y,externalPulse:after.activity.externalImpulseSum,
   actualGripLinks:after.grips.length},
  motorOffPhysicsContinues:observed.tick>frozen.tick&&
    observed.activity.autonomousEffort===frozenEffort,
  finite:observed.finite,
  caveat:"Simple seeded local trajectories and source-authored entry; NOT autonomous cognition, articulated gait, human feel or Owner acceptance."};
 writeFileSync(resolve(folder,"p5-native-real-operator.json"),
  JSON.stringify(report,null,2));
 console.log("P5 real Chromium user-like start, material impact and independent local-motor stop:");
 console.log(JSON.stringify(report));
}finally{try{ws?.close()}catch{}child.kill("SIGKILL");}
