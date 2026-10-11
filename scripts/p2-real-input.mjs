// P0 genuine OS-like owner interactions via Chrome DevTools Protocol, NOT
// dispatched synthetic DOM PointerEvent. Works on emitted production bundle.
// It cannot judge feel or replace a human. Screenshots are raw Chromium pixels.
import {spawn} from "node:child_process";
import {writeFileSync,mkdirSync} from "node:fs";
import {resolve} from "node:path";
const base=process.argv[2]??"http://127.0.0.1:4173/";
const bin=process.env.CHROME_BIN||"chromium";
const port=9228,endpoint="http://127.0.0.1:"+port;
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
 const wsUrl=await available();
 ws=new WebSocket(wsUrl);
 await new Promise((res,rej)=>{
  ws.addEventListener("open",res,{once:true});
  ws.addEventListener("error",rej,{once:true});
 });
 ws.addEventListener("message",event=>{
  let msg;try{msg=JSON.parse(event.data)}catch{return;}
  if(!msg.id)return;
  const next=responses.get(msg.id);if(!next)return;
  responses.delete(msg.id);
  if(msg.error)next.reject(Error(JSON.stringify(msg.error)));
  else next.resolve(msg.result);
 });
 await send("Page.enable");await send("Runtime.enable");
 const u=new URL(base);u.searchParams.set("p2input","1");
 await send("Page.navigate",{url:u.toString()});
 for(let n=0;n<130;n++){
  const ok=await evalJS('document.body?.dataset?.p2ContactReady&&!!window.__p2ReadOnlyProbe').catch(()=>false);
  if(ok)break;
  if(n===129)throw Error("P2 real solver contact scene never prepared");
  await wait(75);
 }
 const before=await evalJS("window.__p2ReadOnlyProbe()");
 if(before.grips.length!==0||before.loads.length!==1||
  before.selected?.kind!=="bulky")
   throw Error("P2 before G contaminated contact source");
 const x=before.loads[0].x;
 // Native CDP keyboard events exercise the real user-facing G binding.
 await key("KeyG",true);await key("KeyG",false);
 await wait(90);
 const held=await evalJS("window.__p2ReadOnlyProbe()");
 if(held.grips.length!==1||held.loads[0].x!==x)
  throw Error("P2 real G failed to contact-attach without teleport");
 // Exercise genuine release while the actor is STILL in contact. This
 // avoids mistaking a naturally snapped high-load tether for user release.
 await key("KeyG",true);await key("KeyG",false);
 await wait(70);
 const released=await evalJS("window.__p2ReadOnlyProbe()");
 if(released.grips.length!==0||released.gripEvidence.manualReleases!==1)
  throw Error("P2 native G release did not actually remove the physical link");
 await key("KeyG",true);await key("KeyG",false);
 await wait(70);
 const reacquired=await evalJS("window.__p2ReadOnlyProbe()");
 if(reacquired.grips.length!==1||reacquired.loads[0].x!==x)
  throw Error("P2 real repeat contact grip failed");
 // The app is intentionally paused after real physical contact preparation.
 await clickElement("pause");
 await wait(90);
 await key("KeyA",true);
 await wait(3200);
 await key("KeyA",false);
 await wait(110);
 const after=await evalJS("window.__p2ReadOnlyProbe()");
 if(after.gripEvidence.pairedImpulseSum<=0||after.loads[0].x>=x-.08)
  throw Error("P2 true operator key failed physical transport: "+
   JSON.stringify({start:x,end:after.loads[0].x,grip:after.gripEvidence}));
 const png=(await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false})).data;
 writeFileSync(resolve(folder,"p2-real-g-grip-transport.png"),Buffer.from(png,"base64"));
 const result={source:"Native Chromium CDP real KeyG acquire/release/reacquire, mouse Pause, held KeyA",
  initialCargoX:x,afterCargoX:after.loads[0].x,
  cargoTravelAfterContact:after.loads[0].x-x,
  sumGripImpulse:after.gripEvidence.pairedImpulseSum,
  physicalGripInitially:held.grips.length,
  actualDynamicMaterialPreserved:after.loads.length===1,
  linksAfterManualRelease:released.grips.length,
  manualReleases:released.gripEvidence.manualReleases,
  naturalGripBreaksDuringTransport:after.gripEvidence.breaks,
  actorXBefore:before.selected.pos.x,actorXAfter:after.selected.pos.x,
  finite:after.finite,
  caveat:"Synthetic predetermined contact scene, but real Chrome user events; NOT human Owner feel"};
 writeFileSync(resolve(folder,"p2-real-g-grip-transport.json"),JSON.stringify(result,null,2));
 console.log("P2 actual keyboard and mouse contact-linked cargo transport PASS:");
 console.log(JSON.stringify(result));
}finally{
 try{ws?.close()}catch{}
 child.kill("SIGKILL");
}
