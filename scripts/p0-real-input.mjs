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
 const mappings={KeyD:["d",68],ControlLeft:["Control",17]};
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
 const url=await available();
 ws=new WebSocket(url);
 await new Promise((res,rej)=>{ws.addEventListener("open",res,{once:true});
  ws.addEventListener("error",rej,{once:true});});
 ws.addEventListener("message",event=>{
  let msg;try{msg=JSON.parse(event.data)}catch{return;}
  if(!msg.id)return;
  const next=responses.get(msg.id);if(!next)return;
  responses.delete(msg.id);
  if(msg.error)next.reject(Error(JSON.stringify(msg.error)));
  else next.resolve(msg.result);
 });
 await send("Page.enable");await send("Runtime.enable");
 const url2=new URL(base);url2.searchParams.set("p0realinput","1");
 await send("Page.navigate",{url:url2.toString()});
 for(let n=0;n<130;n++){
  const ok=await evalJS('document.body?.dataset?.p0Live==="yes"&&!!window.__p0ReadOnlyProbe').catch(()=>false);
  if(ok)break;
  if(n===129)throw Error("P0 boot failed to expose real input test surface");
  await wait(75);
 }
 const initial=await snap();if(!initial?.finite||initial.actorCount!==4)
  throw Error("P0 actual scene invalid before owner-like input");
 const p=await coords(15.9,16);
 await mouse(p.x,p.y);
 await wait(130);
 const chosen=await snap();
 if(chosen.selected?.kind!=="small")
  throw Error("Real pointer click did not select intended physical small body: "+
   JSON.stringify(chosen.selected));
 const oldX=chosen.selected.pos.x;
 await key("KeyD",true);await wait(520);await key("KeyD",false);await wait(160);
 const moved=await snap();
 if(moved.selected?.pos.x<=oldX+.08||moved.events.rootEffort<=0)
  throw Error("Real held-key did not drive physics forward: "+JSON.stringify(moved.selected));
 await clickElement("pause");await wait(90);
 if(!(await evalJS('document.getElementById("pause").textContent==="Wznów"')))
  throw Error("Real click did not pause material world");
 const loadBefore=(await snap()).loads.find(x=>Math.abs(x.x-9)<.1);
 if(!loadBefore)throw Error("Material edit source box missing");
 const a=await coords(9,17.5),b=await coords(10.2,17.5);
 await key("ControlLeft",true);
 await mouse(a.x,a.y,"press",2);
 for(let i=1;i<=5;i++){
  const x=a.x+(b.x-a.x)*i/5,y=a.y+(b.y-a.y)*i/5;
  await send("Input.dispatchMouseEvent",{type:"mouseMoved",x,y,
    button:"left",buttons:1,modifiers:2});
 }
 await mouse(b.x,b.y,"release",2);
 await key("ControlLeft",false);
 await wait(100);
 const edited=(await snap()).loads.find(x=>x.id===loadBefore.id);
 if(!edited||edited.x<loadBefore.x+.65)
  throw Error("Real Ctrl+mouse drag failed physical authoring "+JSON.stringify({loadBefore,edited}));
 const screenshot=(await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false})).data;
 writeFileSync(resolve(folder,"p0-source-real-owner-pointer.png"),Buffer.from(screenshot,"base64"));
 const result={source:"Real CDP mouse, keyboard and Ctrl+drag through Chromium emitted bundle",
  initialCount:initial.actorCount,pickedKind:chosen.selected.kind,
  smallXBefore:+oldX.toFixed(3),smallXAfter:+moved.selected.pos.x.toFixed(3),
  materialBefore:loadBefore.x,materialAfter:edited.x,
  support:moved.support,pause:true,notes:"Source handler + physical state, NOT human feel test"};
 writeFileSync(resolve(folder,"p0-source-real-owner-input.json"),JSON.stringify(result,null,2));
 console.log("P0 REAL pointer, held keyboard, finite body movement, pause and physical Ctrl+drag PASS:");
 console.log(JSON.stringify(result));
}finally{
 try{ws?.close()}catch{}
 child.kill("SIGKILL");
}
