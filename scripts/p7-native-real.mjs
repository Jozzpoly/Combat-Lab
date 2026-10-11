// P0 genuine OS-like owner interactions via Chrome DevTools Protocol, NOT
// dispatched synthetic DOM PointerEvent. Works on emitted production bundle.
// It cannot judge feel or replace a human. Screenshots are raw Chromium pixels.
import {spawn} from "node:child_process";
import {writeFileSync,mkdirSync} from "node:fs";
import {resolve} from "node:path";
const base=process.argv[2]??"http://127.0.0.1:4173/";
const bin=process.env.CHROME_BIN||"chromium";
const port=9264,endpoint="http://127.0.0.1:"+port;
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
 const page=new URL(base);page.searchParams.set("p7native","1");
 await send("Page.navigate",{url:page.toString()});
 for(let i=0;i<145;i++){
  const ready=await evalJS('document.body?.dataset?.p0Live==="yes" && !!window.__p7ReadOnlyProbe').catch(()=>false);
  if(ready)break;if(i===144)throw Error("P7 actual emitted WASM site did not load");
  await wait(75);
 }
 await clickElement("p7-preset");await wait(2100);
 const pre=await evalJS("window.__p7ReadOnlyProbe()");
 if(!pre||!pre.finite||pre.actorCount!==7||pre.loadCount!==2||
    pre.guard.mass!==90||pre.pressure.density!==6||
    pre.pressure.guardPolicy!=="brace"||pre.pressure.guardPokes!==0||
    pre.pressure.moveImpulse<=0||pre.barriers.length!==2)
   throw Error("P7 source seven free moving actual shapes invalid "+
    JSON.stringify(pre?.pressure));
 const prePng=(await send("Page.captureScreenshot",{
   format:"png",captureBeyondViewport:false})).data;
 writeFileSync(resolve(folder,"p7-native-real-crowd-before-operator.png"),
   Buffer.from(prePng,"base64"));
 await clickElement("p7-poke");await wait(850);
 const after=await evalJS("window.__p7ReadOnlyProbe()");
 if(!after||!after.finite||after.pressure.guardPokes!==1||
    after.activity.externalImpulses!==1||
    after.pressure.steps<=pre.pressure.steps)
   throw Error("P7 actual owner external impulse not reflected in physical source");
 const pokePng=(await send("Page.captureScreenshot",{
  format:"png",captureBeyondViewport:false})).data;
 writeFileSync(resolve(folder,"p7-native-real-crowd-after-guard-shock.png"),
  Buffer.from(pokePng,"base64"));
 await clickElement("pause");await wait(125);
 const paused=await evalJS("window.__p7ReadOnlyProbe()");
 const original=paused.barriers[1];
 await clickElement("p7-open");
 const altered=await evalJS("window.__p7ReadOnlyProbe()");
 const target=altered.barriers.find(x=>x.id===original.id);
 if(!altered.finite||!altered.mouth.changed||
    Math.abs(target.y-original.y+1.3)>.0001||
    altered.tick!==paused.tick||
    JSON.stringify(paused.actors)!==JSON.stringify(altered.actors)||
    JSON.stringify(paused.loads)!==JSON.stringify(altered.loads))
  throw Error("P7 pause/edit changed actor history or did not move actual barrier");
 await clickElement("pause");await wait(950);
 const resumed=await evalJS("window.__p7ReadOnlyProbe()");
 if(!resumed.finite||resumed.tick<=altered.tick||
    !resumed.mouth.changed||resumed.pressure.sourceEdits!==1)
   throw Error("P7 physical world did not continue unchanged history");
 const postPng=(await send("Page.captureScreenshot",{
  format:"png",captureBeyondViewport:false})).data;
 writeFileSync(resolve(folder,"p7-native-resumed-after-physical-crowd-edit.png"),
  Buffer.from(postPng,"base64"));
 const report={source:"Actual native Chromium mouse pointer: P7 multi-actor crowd start, real dynamic guard poke, pause and translate actual fixed blocker, unpause same solver",
  before:{tick:pre.tick,actors:pre.actorCount,loads:pre.loadCount,
   guard:pre.guard,contacts:pre.pressure.guardContacts,
   pressure:pre.pressure.guardImpulse,drive:pre.pressure.moveImpulse},
  realPoke:{tick:after.tick,guard:after.guard,operatorPokes:after.pressure.guardPokes,
   globalPhysicalImpulses:after.activity.externalImpulses},
  pauseEdit:{tick:altered.tick,deltaY:target.y-original.y,
   actorsRemainSame:JSON.stringify(paused.actors)===JSON.stringify(altered.actors)},
  resume:{tick:resumed.tick,guard:resumed.guard,passed:resumed.crossings.mouth,
   contactEvents:resumed.pressure.guardContacts,
   allWorldEntitiesRemainLive:resumed.actorCount===7&&resumed.loadCount===2},
  caveat:"Real physics, 90kg guard, 6 constant-drive rigid crowd bodies. Initial motion/approach author-defined. No footstep biomechanics, no real NPC goal or human gameplay judgment."};
 writeFileSync(resolve(folder,"p7-native-crowd-real-pointer-source.json"),
  JSON.stringify(report,null,2));
 console.log("P7 native mouse pressure/shock/edit world continuity:");
 console.log(JSON.stringify(report));
}finally{try{ws?.close()}catch{}child.kill("SIGKILL");}
