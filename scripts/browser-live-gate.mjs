// E1 real browser/WASM acceptance of a WHOLE source state, not creature quality.
import {execFileSync} from "node:child_process";
const chrome=process.env.CHROME_BIN,url=process.argv[2];
if(!chrome||!url)throw Error("Missing actual Chromium binary and served build");
const visit=(query,budget=18000)=>{
 const href=url+(url.includes("?")?"&":"?")+query;
 const dom=execFileSync(chrome,["--headless=new","--no-sandbox","--disable-gpu",
  "--disable-dev-shm-usage","--virtual-time-budget="+budget,"--dump-dom",href],
  {encoding:"utf8",timeout:115000,maxBuffer:24*1024*1024});
 const val=n=>dom.match(new RegExp('data-'+n+'="([^"]*)"'))?.[1];
 const raw=val("live-error");
 if(val("live")!=="yes"||raw)throw Error("E1 browser execution FAIL: live="+val("live")+
  " error="+raw+" dump="+dom.slice(-200));
 return {val,dom};
};
const decode=s=>JSON.parse(s.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
const sections=[];
for(const batch of ["A","B"]){
 const v=visit("e1probe="+batch,60000).val("e1-probe");
 if(!v)throw Error("Missing E1 full-scene physical matrix batch "+batch);
 const j=decode(v);
 if(j.part!==batch||(batch==="A"&&j.cases.length!==3)||
   (batch==="B"&&j.cases.length!==2))
  throw Error("E1 physical matrix incomplete "+batch);
 sections.push(...j.cases);
}
for(const c of sections){
 if(!c.numericOK||c.actors!==18||c.sample.length!==6)
  throw Error("E1 nonfinite/partial physical scene "+c.kind);
}
const map=Object.fromEntries(sections.map(c=>[c.kind,c]));
if(map.passive.autonomousTicks!==0||map.passive.autoImpulse!==0)
 throw Error("Passive E1 source got an invisible motor");
if(map.full.autonomousTicks<100||
 map.full.autoImpulse<=0||map.full.avgTravel<=.25)
 throw Error("E1 local decision system generated no actual body action");
if(map["no-odor"].cues!==0||map["shifted-odor"].stagedEditCount!==1)
 throw Error("E1 local sensation / editor intervention not actually changed");
console.log("E1 FULL WORLD ADVERSES "+JSON.stringify(sections.map(c=>({
 kind:c.kind,physicalActorCount:c.actors,physicalContacts:c.frameContacts,
 meanMotion:c.avgTravel,localRootTicks:c.autonomousTicks,
 contactDecisionCount:c.reactiveChanges,selectedCueCount:c.attended,
 edited:c.stagedEditCount}))));
console.log("E1 MATRIX RAW "+JSON.stringify(sections));
const framesRaw=visit("e1frames=1",16000).val("e1-frames");
if(!framesRaw)throw Error("Real same-world visual evidence absent");
const frames=decode(framesRaw);
if(frames.length!==5||frames[0].tick!==0||frames[4].tick!==480)
 throw Error("E1 broken consecutive real physics timeline");
console.log("E1 ONE-WORLD HISTORY "+JSON.stringify(frames.map(a=>({
 tick:a.tick,states:a.actors.map(x=>({kind:x.kind,role:x.role,x:x.x,y:x.y,
    status:x.state})),contactEvents:a.contactEvents,actions:a.actionTicks}))));
console.log("E1 TRUE FRAME-T0 "+frames[0].frame);
console.log("E1 TRUE FRAME-T480 "+frames[4].frame);
const uiRaw=visit("e1ownercheck=1",7500).val("e1-ownercheck");
if(!uiRaw)throw Error("Real browser E1 editor/controls smoke missing");
const ui=decode(uiRaw);
if(!ui.pass)throw Error("Source editor/controls not operating in actual page");
console.log("E1 REAL UI "+JSON.stringify(ui));

for(const batch of ["C","D"]){
 const raw=visit("e1causal="+batch,35000).val("e1-causal");
 if(!raw)throw Error("E1 source-exact causal/density batch "+batch+" missing");
 const result=decode(raw);
 if(result.batch!==batch)throw Error("E1 causal batch mismatch");
 if(batch==="C"){
  if(result.pressure.sourceMotorTicksOn!==result.pressure.sourceMotorTicksOff||
    !result.pressure.first)
   throw Error("E1 does not causally distinguish pressure steering");
  if(result.edit.initialMismatch||!result.edit.firstChangedDecision)
   throw Error("E1 physical cue intervention did not change later decisions");
  if(result.signalOnly.prefixDifference||
    !result.signalOnly.firstSignalCommandDifference||
    result.signalOnly.firstSignalCommandDifference.preStepBodyDisparity>1e-5||
    result.signalOnly.firstSignalCommandDifference.tick<=160)
   throw Error("E1 local signal did not causally change action after sensing");

 }else if(result.stress.actors!==30||result.stress.nonfinite!==0)
  throw Error("E1 dense mixed-body world numerically unstable or incomplete");
 console.log("E1 SOURCE CAUSAL "+JSON.stringify(result));
}


// W2 isolated branch; exact emitted Chrome source alongside E1 regression.
function visitW2(query,budget=55000){
 const href=url+"w2.html?"+query;
 const dom=execFileSync(chrome,["--headless=new","--no-sandbox","--disable-gpu",
  "--disable-dev-shm-usage","--virtual-time-budget="+budget,
  "--dump-dom",href],{encoding:"utf8",timeout:115000,maxBuffer:20*1024*1024});
 const val=n=>dom.match(new RegExp('data-'+n+'="([^"]*)"'))?.[1];
 if(val("live")!=="yes"||val("live-error"))
  throw Error("W2 emitted browser FAIL "+query+": "+val("live-error")+" "+dom.slice(-700));
 return val;
}
for(const batch of ["A","B","C","D","E"]){
 const raw=visitW2("w2probe="+batch)("w2-probe");
 if(!raw)throw Error("W2 missing live physical probe batch "+batch);
 const data=decode(raw);
 if(data.batch!==batch)throw Error("W2 wrong physical probe batch");
 if(batch==="A"){
  if(data.cases.length!==5||data.cases.some(c=>!c.numericOK)||
    data.cases[0].connectedContacts.some(x=>!x)||
    data.cases[0].realJoints!==2)
   throw Error("W2 real anatomy and rivals incomplete");
 } else if(batch==="B"){
  if(!data.result.numericOK||data.result.widthAt300>=1.5||
   data.result.connectedContacts.some(x=>!x))
   throw Error("W2 real connected body cannot fold inside material gate");
 } else if(batch==="C"){
  if(data.result.initialActors!==20||data.result.nonfinite!==0)throw Error("W2 heterogeneous local world corrupted");
 }else if(batch==="D"){
  if(data.results.length!==8||data.results.some(x=>x.nonfinite))throw Error("W2 missing eight opportunity cases");
 }else if(data.results.length!==4||data.results.some(x=>x.nonfinite))
  throw Error("W2 missing four matched actuation-null cases");
 console.log("W2 PHYSICAL "+JSON.stringify(data));
}
const w2UiRaw=visitW2("w2ownercheck=1",28000)("w2-ownercheck");
if(!w2UiRaw||!decode(w2UiRaw).pass)throw Error("W2 actual UI gate missing");
console.log("W2 TRUE BROWSER UI "+JSON.stringify(decode(w2UiRaw)));

// True raw canvas pixels at exact solver ticks from ONE persistent W2 world.
// Large images are chunked in CI log strictly to allow post-CI source inspection.
const frameRaw=visitW2("w2frames=1",60000)("w2-frames");
if(!frameRaw)throw Error("W2 one-world visual capture missing");
const w2Frames=decode(frameRaw);
if(w2Frames.length!==3||w2Frames[0].tick!==0||
 w2Frames[2].tick!==420||w2Frames.some(x=>x.source.actorCount!==20))
 throw Error("W2 screenshot timeline is not the expected true physical world");
for(const frame of w2Frames){
 console.log("W2 FRAME PROVENANCE "+JSON.stringify({
  tick:frame.tick,actorCount:frame.source.actorCount,
  foldables:frame.source.foldables.map(x=>({id:x.id,
   spanY:x.actualExtent.spanY,foldTarget:x.foldTarget,policy:x.policy,
   root:x.root})),events:frame.source.pressurePolicySwitches}));
 if(frame.tick===180)continue; // intermediate measured but no need to save pixels
 const base64=frame.png.replace(/^data:image\/png;base64,/,"");
 for(let i=0;i<base64.length;i+=16000)
  console.log("W2PNG:"+frame.tick+":"+(i/16000)+":"+base64.slice(i,i+16000));
}
