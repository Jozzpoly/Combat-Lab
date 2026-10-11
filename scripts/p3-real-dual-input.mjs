// P0 genuine OS-like owner interactions via Chrome DevTools Protocol, NOT
// dispatched synthetic DOM PointerEvent. Works on emitted production bundle.
// It cannot judge feel or replace a human. Screenshots are raw Chromium pixels.
import {spawn} from "node:child_process";
import {writeFileSync,mkdirSync} from "node:fs";
import {resolve} from "node:path";
const base=process.argv[2]??"http://127.0.0.1:4173/";
const bin=process.env.CHROME_BIN||"chromium";
const port=9234,endpoint="http://127.0.0.1:"+port;
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
 const mappings={KeyG:["g",71],KeyH:["h",72],KeyA:["a",65],KeyL:["l",76]};
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
  const cb=responses.get(msg.id);if(!cb)return;responses.delete(msg.id);
  msg.error?cb.reject(Error(JSON.stringify(msg.error))):cb.resolve(msg.result);
 });
 await send("Page.enable");await send("Runtime.enable");
 const u=new URL(base);u.searchParams.set("p3native","1");
 await send("Page.navigate",{url:u.toString()});
 for(let i=0;i<130;i++){
  const ok=await evalJS('document.body?.dataset?.p3NativeReady&&!!window.__p3ReadOnlyProbe').catch(()=>false);
  if(ok)break;
  if(i===129)throw Error("P3 bilateral real contact scenario unavailable");
  await wait(75);
 }
 const evalWorld=()=>evalJS("window.__p3ReadOnlyProbe()");
 const first=await evalWorld();
 if(first.grips.length!==0||first.actorCount!==2||first.loads.length!==1)
  throw Error("P3 initial state already has magic link");
 const cargoX=first.loads[0].x;
 async function press(code){await key(code,true);await key(code,false);}
 await press("KeyG");await press("KeyH");
 await wait(90);
 const held=await evalWorld();
 if(held.grips.length!==2||Math.abs(held.loads[0].x-cargoX)>1e-7)
  throw Error("Native G and H did not both acquire physical grip without cargo snap");
 await clickElement("pause");await wait(95);
 await key("KeyA",true);await key("KeyL",true);
 await wait(850);
 const tug=await evalWorld();
 if(tug.grips.length!==2||tug.gripEvidence.pairedImpulseSum<=0)
  throw Error("P3 actual native two-body tug broke/was fictitious "+JSON.stringify({
   links:tug.grips.length,effort:tug.gripEvidence.pairedImpulseSum}));
 const image1=(await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false})).data;
 writeFileSync(resolve(folder,"p3-native-two-grips-contested.png"),Buffer.from(image1,"base64"));
 // Keep BOTH movement keys continuously held. Only H changes link state.
 await press("KeyH");
 const released=await evalWorld();
 if(released.grips.length!==1||released.gripEvidence.manualReleases!==1)
  throw Error("P3 native second independent release was not honored");
 await wait(1400);
 await key("KeyA",false);await key("KeyL",false);
 const after=await evalWorld();
 if(!after.finite||after.gripEvidence.pairedImpulseSum<=tug.gripEvidence.pairedImpulseSum)
  throw Error("P3 real follow-up physical towing source invalid");
 const image2=(await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false})).data;
 writeFileSync(resolve(folder,"p3-native-after-opponent-releases.png"),Buffer.from(image2,"base64"));
 const report={
  source:"Native Chrome G/H grip, independent continuously held A/L, real H release only",
  loadStart:cargoX,loadWhileContested:tug.loads[0].x,
  loadAfterRelease:after.loads[0].x,
  simultaneousRealLinks:held.grips.length,linksAfterRelease:released.grips.length,
  forceDuring:tug.gripEvidence.pairedImpulseSum,
  forceAfter:after.gripEvidence.pairedImpulseSum,
  userReleaseCount:after.gripEvidence.manualReleases,
  physicallyFinite:after.finite,
  limitations:"Both initial contacts reached by declared deterministic body motion; NOT autonomous NPC and NOT human feel/latency test"
 };
 writeFileSync(resolve(folder,"p3-native-two-actor-controls.json"),JSON.stringify(report,null,2));
 console.log("P3 TWO ACTUAL CHROMIUM OPERATOR CHANNELS PASS:");
 console.log(JSON.stringify(report));
}finally{
 try{ws?.close()}catch{}
 child.kill("SIGKILL");
}
