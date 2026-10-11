// P0 genuine OS-like owner interactions via Chrome DevTools Protocol, NOT
// dispatched synthetic DOM PointerEvent. Works on emitted production bundle.
// It cannot judge feel or replace a human. Screenshots are raw Chromium pixels.
import {spawn} from "node:child_process";
import {writeFileSync,mkdirSync} from "node:fs";
import {resolve} from "node:path";
const base=process.argv[2]??"http://127.0.0.1:4173/";
const bin=process.env.CHROME_BIN||"chromium";
const port=9268,endpoint="http://127.0.0.1:"+port;
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
 const sourceUrl=await available();ws=new WebSocket(sourceUrl);
 await new Promise((res,rej)=>{ws.addEventListener("open",res,{once:true});
  ws.addEventListener("error",rej,{once:true});});
 ws.addEventListener("message",event=>{
  let m;try{m=JSON.parse(event.data)}catch{return;}
  if(!m.id)return;const cb=responses.get(m.id);if(!cb)return;
  responses.delete(m.id);m.error?cb.reject(Error(JSON.stringify(m.error))):cb.resolve(m.result);
 });
 await send("Page.enable");await send("Runtime.enable");
 const page=new URL(base);page.searchParams.set("p8native","1");
 await send("Page.navigate",{url:page.toString()});
 for(let i=0;i<145;i++){
  const ready=await evalJS('document.body?.dataset?.p0Live==="yes" && !!window.__p8ReadOnlyProbe').catch(()=>false);
  if(ready)break;if(i===144)throw Error("P8 actual emitted WASM page not live");
  await wait(80);
 }
 await clickElement("p8-preset");await wait(1350);
 const before=await evalJS("window.__p8ReadOnlyProbe()");
 if(!before||!before.finite||before.actorCount!==7||before.loadCount!==2||
    before.p8.tactile!=="slip"||before.guard.mass!==90||
    before.pressure.moveImpulse<=0)
  throw Error("P8 true scene absent, wrong body/motor source");
 const firstPng=(await send("Page.captureScreenshot",{
  format:"png",captureBeyondViewport:false})).data;
 writeFileSync(resolve(folder,"p8-native-human-control-before.png"),
  Buffer.from(firstPng,"base64"));
 // Pause the real world to select the SMALL tail actor by native pointer,
 // then resume and test that the owner's own real key input moves that
 // same physical actor, independent of local crowd autothrust.
 await clickElement("pause");
 const atPause=await evalJS("window.__p8ReadOnlyProbe()");
 const target=atPause.movers[atPause.movers.length-1];
 const point=await evalJS(`(()=>{
  const r=document.getElementById("world").getBoundingClientRect();
  const dpr=Math.min(2,devicePixelRatio||1),
   width=Math.round(r.width*dpr),height=Math.round(r.height*dpr),
   scale=Math.min(width/40,height/24)*1.85;
  return {
   x:r.left+(width/2+(${target.x}-14.2)*scale)*r.width/width,
   y:r.top+(height/2+(${target.y}-12)*scale)*r.height/height
  };
 })()`);
 await mouse(point.x,point.y);
 const selected=await evalJS("window.__p8ReadOnlyProbe()");
 if(selected.selected?.id!==target.id)
  throw Error("P8 real owner click did not select actual trailing body");
 const freeze=selected.tick;
 await wait(180);
 const persisted=await evalJS("window.__p8ReadOnlyProbe()");
 if(persisted.tick!==freeze)throw Error("P8 pause source time advanced");
 await clickElement("pause");
 const preKey=await evalJS("window.__p8ReadOnlyProbe()");
 await send("Input.dispatchKeyEvent",{type:"keyDown",key:"s",code:"KeyS",
  windowsVirtualKeyCode:83,nativeVirtualKeyCode:83});
 await wait(530);
 await send("Input.dispatchKeyEvent",{type:"keyUp",key:"s",code:"KeyS",
  windowsVirtualKeyCode:83,nativeVirtualKeyCode:83});
 const postKey=await evalJS("window.__p8ReadOnlyProbe()");
 const a=preKey.movers.find(x=>x.id===target.id),
       b=postKey.movers.find(x=>x.id===target.id);
 if(!a||!b||postKey.tick<=preKey.tick||
    postKey.selected?.id!==target.id||
    b.y-a.y<.11)
  throw Error("P8 real Owner KeyS physically failed to change independent body Y "+
   JSON.stringify({pre:a,post:b,step:postKey.tick-preKey.tick}));
 // Ensure direct human selection suppresses exactly that actor's local
 // automatic steering while leaving other independent contacts alive.
 if(postKey.p8.ownerSteps<=0||postKey.pressure.moveImpulse<=preKey.pressure.moveImpulse)
  throw Error("P8 local autonomy not properly split from Owner-selected actor");
 await clickElement("pause");
 const preShock=await evalJS("window.__p8ReadOnlyProbe()");
 await clickElement("p7-poke");
 const postShock=await evalJS("window.__p8ReadOnlyProbe()");
 if(postShock.activity.externalImpulses!==preShock.activity.externalImpulses+1||
    postShock.tick!==preShock.tick)
  throw Error("P8 actual native operator cannot physically poke guard on pause");
 await clickElement("p7-open");
 const widened=await evalJS("window.__p8ReadOnlyProbe()");
 if(Math.abs(widened.mouth.width-preShock.mouth.width-1.3)>.0001||
    widened.tick!==preShock.tick||
    JSON.stringify(widened.actors)!==JSON.stringify(postShock.actors))
  throw Error("P8 physical door edit source did not preserve actor positions/time");
 await clickElement("pause");await wait(620);
 const continued=await evalJS("window.__p8ReadOnlyProbe()");
 if(!continued.finite||continued.tick<=widened.tick||!continued.mouth.changed)
  throw Error("P8 resumed source lacked physically continuous history");
 const lastPng=(await send("Page.captureScreenshot",{
  format:"png",captureBeyondViewport:false})).data;
 writeFileSync(resolve(folder,"p8-native-owner-selected-crowd-after.png"),
  Buffer.from(lastPng,"base64"));
 const evidence={source:"True native CDP mouse+keyboard, actual emitted Rapier2D 7 actor crowd; direct selected body WASD from paused user control, shock/edit and resume without reset",
  before:{tick:before.tick,actors:before.actorCount,contacts:before.pressure.guardContacts,
   slide:before.p8.contactActivations,mode:before.p8.tactile},
  owner:{id:target.id,initialY:a.y,afterKeyY:b.y,deltaY:b.y-a.y,
   inputTicks:postKey.tick-preKey.tick,ownerSteps:postKey.p8.ownerSteps},
  intervention:{beforeTick:preShock.tick,afterTick:widened.tick,
   gapBefore:preShock.mouth.width,gapAfter:widened.mouth.width,
   physicalPokes:postShock.activity.externalImpulses,
   bodyPositionsUnchanged:JSON.stringify(widened.actors)===JSON.stringify(postShock.actors)},
  continuation:{tick:continued.tick,contact:continued.pressure.guardContacts,
   contactsUnderSlide:continued.p8.contactTimes,finite:continued.finite},
  limits:"Driver is a physical root traction proxy, not gait or measured Owner feel. Native Chrome is mechanical control evidence only."};
 writeFileSync(resolve(folder,"p8-native-human-control-real-source.json"),
  JSON.stringify(evidence,null,2));
 console.log("P8 actual native human-input, physical force, no-reset source:");
 console.log(JSON.stringify(evidence));
}finally{try{ws?.close()}catch{}child.kill("SIGKILL");}
