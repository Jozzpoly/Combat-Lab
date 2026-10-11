// P10 native CDP pointer/keyboard test of emitted Rapier workshop.
// Only human-like INPUT events, no JS mutation of world state.
import {spawn} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
const url=process.argv[2]||"http://127.0.0.1:4173/";
const bin=process.env.CHROME_BIN||"chromium";
const port=9274,server="http://127.0.0.1:"+port;
const dir=resolve("p10-evidence");mkdirSync(dir,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const child=spawn(bin,["--headless=new","--no-sandbox","--disable-gpu",
 "--disable-dev-shm-usage","--remote-allow-origins=*","--window-size=1520,970",
 "--remote-debugging-port="+port,"--user-data-dir=/tmp/p10-chrome-"+process.pid,
 "about:blank"],{stdio:"ignore"});
let ws,id=0;const promises=new Map();
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
 const p=await js('(function(){var c=document.getElementById("world"),r=c.getBoundingClientRect(),s=Math.min(c.width/40,c.height/24)*1.22;return {x:r.left+(c.width/2+('+x+'-20)*s)*r.width/c.width,y:r.top+(c.height/2+('+y+'-12)*s)*r.height/c.height};})()');
 await down(p.x,p.y);
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
  const cb=promises.get(m.id);if(!cb)return;promises.delete(m.id);
  m.error?cb.reject(Error(JSON.stringify(m.error))):cb.resolve(m.result);
 });
 await send("Page.enable");await send("Runtime.enable");
 await send("Page.navigate",{url:new URL("p10.html",url).toString()});
 let ready=false;
 for(let i=0;i<150;i++){
  ready=await js('document.body?.dataset?.p10Live==="yes"').catch(()=>false);
  if(ready)break;await sleep(80);
 }
 if(!ready)throw Error("P10 native browser not initialized");
 await sleep(150);
 const start=await snap();
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
 await image("p10-native-world-after-real-input.png");
 const report={source:"Real native Chromium CDP pointer/key events, Vite emitted Rapier. No synthetic DOM dispatch or scripted state edits.",
  initial:{actors:start.actors.length,cargo:start.cargo.length,auto:start.auto},
  pauseFrozen:true,
  tool:{selectedWithPointer:tool.id,realKeyB:true,realKeyE:true,
   jointImpulseDelta:limb.panelImpulse-command.panelImpulse},
  authoredMaterial:{sameTick:pre.tick===edited.tick,
   oldWidth:pre.aperture.width,newWidth:edited.aperture.width,
   unchangedActors:JSON.stringify(pre.actors)===JSON.stringify(edited.actors)},
  manualMovement:{actorId:small.id,ticks:after.tick-before.tick,
   dx:q.x-p.x,sourceImpulseDelta:after.rootEffort-before.rootEffort},
  grip:{attemptedWithRealG:true,actuallyLinked:linked,
   UI:await js('document.getElementById("status").textContent')},
  limits:"Native mechanical input proof, not Owner play/feel or realistic gait."};
 writeFileSync(resolve(dir,"p10-native-operator-source.json"),JSON.stringify(report,null,2));
 console.log("P10 native real operator proof:");
 console.log(JSON.stringify(report));
}finally{try{ws?.close()}catch{}child.kill("SIGKILL");}
