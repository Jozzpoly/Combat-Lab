// P0 genuine OS-like owner interactions via Chrome DevTools Protocol, NOT
// dispatched synthetic DOM PointerEvent. Works on emitted production bundle.
// It cannot judge feel or replace a human. Screenshots are raw Chromium pixels.
import {spawn} from "node:child_process";
import {writeFileSync,mkdirSync} from "node:fs";
import {resolve} from "node:path";
const base=process.argv[2]??"http://127.0.0.1:4173/";
const bin=process.env.CHROME_BIN||"chromium";
const port=9258,endpoint="http://127.0.0.1:"+port;
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
  if(!m.id)return;const cb=responses.get(m.id);if(!cb)return;
  responses.delete(m.id);m.error?cb.reject(Error(JSON.stringify(m.error))):cb.resolve(m.result);
 });
 await send("Page.enable");await send("Runtime.enable");
 const page=new URL(base);page.searchParams.set("p6native","1");
 await send("Page.navigate",{url:page.toString()});
 for(let i=0;i<145;i++){
  const ready=await evalJS('document.body?.dataset?.p0Live==="yes" && !!window.__p6ReadOnlyProbe').catch(()=>false);
  if(ready)break;
  if(i===144)throw Error("P6 actual browser did not load physical WASM source");
  await wait(70);
 }
 await clickElement("p6-preset");await wait(1800);
 const pre=await evalJS("window.__p6ReadOnlyProbe()");
 if(!pre||!pre.finite||pre.actorCount!==4||pre.loadCount!==2||
    pre.barriers.length!==3||pre.activity.autonomousEffort<=0||pre.opened)
  throw Error("P6 native source preset did not create 4 physical bodies / walls");
 const first=(await send("Page.captureScreenshot",{
  format:"png",captureBeyondViewport:false})).data;
 writeFileSync(resolve(folder,"p6-native-physical-tight-wide-before.png"),
  Buffer.from(first,"base64"));
 await clickElement("pause");await wait(95);
 const paused=await evalJS("window.__p6ReadOnlyProbe()");
 const target=paused.barriers[0];
 if(!target)throw Error("P6 source had no real fixed collider");
 await clickElement("p6-open");
 const opened=await evalJS("window.__p6ReadOnlyProbe()");
 const moved=opened.barriers.find(x=>x.id===target.id);
 if(!opened.opened||Math.abs(moved.y-target.y+1.6)>.0001||
    opened.tick!==paused.tick||
    JSON.stringify(opened.actors)!==JSON.stringify(paused.actors))
  throw Error("P6 browser clicked material edit but solver and/or actors were teleported");
 const middle=(await send("Page.captureScreenshot",{
  format:"png",captureBeyondViewport:false})).data;
 writeFileSync(resolve(folder,"p6-native-real-pause-widen-material.png"),
  Buffer.from(middle,"base64"));
 await clickElement("pause");await wait(1250);
 const resumed=await evalJS("window.__p6ReadOnlyProbe()");
 if(!resumed.finite||resumed.tick<=opened.tick||!resumed.opened||
    resumed.activity.autonomousEffort<=pre.activity.autonomousEffort)
  throw Error("P6 source did not continue same physical world after aperture widened");
 const finalImg=(await send("Page.captureScreenshot",{
  format:"png",captureBeyondViewport:false})).data;
 writeFileSync(resolve(folder,"p6-native-resumed-after-real-material-edit.png"),
  Buffer.from(finalImg,"base64"));
 const report={
  source:"Real native Chromium pointer: start 4 organisms+2 independent cargo, pause solver, widen actual collider 1.6m, resume same embodied world",
  original:{tick:pre.tick,actors:pre.actorCount,loads:pre.loadCount,
   barrier:target, effort:pre.activity.autonomousEffort},
  edit:{tick:opened.tick,barrier:moved,
   deltaY:moved.y-target.y,
   actorsUnmovedWhilePaused:JSON.stringify(opened.actors)===JSON.stringify(paused.actors)},
  continued:{tick:resumed.tick,actors:resumed.actors,
   loads:resumed.loads,bodyContacts:resumed.activity.contactActor,
   obstacleContacts:resumed.activity.contactFixed},
  genuineNoReset:resumed.tick>pre.tick&&opened.tick===paused.tick,
  caveat:"Actual browser+Rapier shape, but autonomous movement is bounded virtual root impulse; scene is authored. No human Owner feel or morphological gameplay quality measured."
 };
 writeFileSync(resolve(folder,"p6-native-material-edit-source.json"),
  JSON.stringify(report,null,2));
 console.log("P6 actual native mouse edit persisted same multi-body material world:");
 console.log(JSON.stringify(report));
}finally{try{ws?.close()}catch{}child.kill("SIGKILL");}
