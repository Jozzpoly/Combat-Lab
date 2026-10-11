// P0 genuine OS-like owner interactions via Chrome DevTools Protocol, NOT
// dispatched synthetic DOM PointerEvent. Works on emitted production bundle.
// It cannot judge feel or replace a human. Screenshots are raw Chromium pixels.
import {spawn} from "node:child_process";
import {writeFileSync,mkdirSync} from "node:fs";
import {resolve} from "node:path";
const base=process.argv[2]??"http://127.0.0.1:4173/";
const bin=process.env.CHROME_BIN||"chromium";
const port=9246,endpoint="http://127.0.0.1:"+port;
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
 const url=await available();ws=new WebSocket(url);
 await new Promise((res,rej)=>{ws.addEventListener("open",res,{once:true});
  ws.addEventListener("error",rej,{once:true});});
 ws.addEventListener("message",event=>{
  let m;try{m=JSON.parse(event.data)}catch{return;}
  if(!m.id)return;const wait=responses.get(m.id);if(!wait)return;responses.delete(m.id);
  m.error?wait.reject(Error(JSON.stringify(m.error))):wait.resolve(m.result);
 });
 await send("Page.enable");await send("Runtime.enable");
 const start=new URL(base);start.searchParams.set("p4native","1");
 await send("Page.navigate",{url:start.toString()});
 for(let i=0;i<160;i++){
  const ok=await evalJS('document.body?.dataset?.p0Live==="yes" && !!window.__p4ReadOnlyProbe').catch(()=>false);
  if(ok)break;
  if(i===159)throw Error("Native P4 app not loaded");
  await wait(70);
 }
 await clickElement("p4-preset");await wait(130);
 const source=await evalJS("window.__p4ReadOnlyProbe()");
 if(source.actors.length!==1||source.loads.length!==1||
    source.grips.length!==1||source.reflexPolicy[source.actors[0].id]!=="conditional")
  throw Error("P4 real preset failed to prepare solver-contact grip/reflex");
 const t0=(await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false})).data;
 writeFileSync(resolve(folder,"p4-real-native-before-shock.png"),Buffer.from(t0,"base64"));
 const px=source.loads[0].x;
 await clickElement("p4-shock-right");await wait(1250);
 const end=await evalJS("window.__p4ReadOnlyProbe()");
 if(!end.finite||end.reflexEvents.active<=0||end.reflexEvents.proxyImpulse<=0||
   end.events.operatorPokes!==source.events.operatorPokes)
  throw Error("P4 source physical reflex did not activate after real operator click");
 const shot=(await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false})).data;
 writeFileSync(resolve(folder,"p4-real-native-reacting-to-shock.png"),Buffer.from(shot,"base64"));
 const report={source:"Chromium native mouse click to real P4 source-contact preset, then actual physical off-center cargo shove",
 initialCargoX:px,afterCargoX:end.loads[0].x,
 cargoShift:end.loads[0].x-px,
 perceivedEvents:end.reflexEvents.sensed,activeTicks:end.reflexEvents.active,
 rootSourceImpulse:end.reflexEvents.proxyImpulse,
 gripBreaks:end.gripEvidence.breaks,
 retainedMaterial:end.loads.length===1,
 stillFinite:end.finite,
 caveat:"Mouse input and real browser/WASM source only; no human playability/feel and no cognition"};
 writeFileSync(resolve(folder,"p4-real-native-shove-reflex.json"),JSON.stringify(report,null,2));
 console.log("P4 actual native mouse-driven shock triggers independently sensed material response:");
 console.log(JSON.stringify(report));
}finally{try{ws?.close()}catch{}child.kill("SIGKILL");}
