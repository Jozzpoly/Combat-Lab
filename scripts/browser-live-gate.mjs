import {execFileSync} from "node:child_process";
const bin=process.env.CHROME_BIN,url=process.argv[2];
if(!bin||!url)throw Error("Need actual Chromium and locally served built app");
function open(flag,budget=18000){
 const dom=execFileSync(bin,["--headless=new","--no-sandbox","--disable-gpu",
  "--disable-dev-shm-usage","--virtual-time-budget="+budget,"--dump-dom",
  url+(url.includes("?")?"&":"?")+flag],{encoding:"utf8",timeout:110000,maxBuffer:20*1024*1024});
 const fetch=n=>dom.match(new RegExp('data-'+n+'="([^"]*)"'))?.[1];
 if(fetch("live")!=="yes"||fetch("live-error"))
  throw Error("B1 real-browser source failed: live="+fetch("live")+" error="+fetch("live-error"));
 return fetch;
}
const decode=s=>JSON.parse(s.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
const combined=[];
for(const batch of ["A","B","C","D","E","F","G"]){
 const data=open("b1probe="+batch,45000)("b1-probe");
 if(!data)throw Error("B1 batch "+batch+" not emitted");
 const result=decode(data);
 if(result.part!==batch||result.scenes.length!==3)
  throw Error("B1 incomplete physical source matrix "+batch);
 combined.push(...result.scenes);
}
if(combined.some(x=>x.nonfinite||x.samples?.length!==6))
 throw Error("B1 incomplete physical time trace");
const by=Object.fromEntries(combined.map(c=>[c.name,c]));
if(by["hinges-no-actuators"].hingeTorque!==0||
 by["cheap-rigid-wide"].hingeTorque!==0||by["cheap-rigid-small"].hingeTorque!==0)
 throw Error("B1 null controller generated internal torques");
console.log("B1 FULL CAUSAL MATRIX "+JSON.stringify(combined.map(x=>({
 name:x.name,gate:x.withGate,crossed:x.crossedGate,when:x.firstPassageTick,
 x:x.rootDX,y:x.rootFinalY,gateContacts:x.wallContactSteps,
 hingeTorque:x.hingeTorque,headingTorque:x.headingTorque,
 impulse:x.outsideRootImpulse,hingeError:x.hingeError,objectDX:x.movedMatter}))));
console.log("B1 FULL RAW "+JSON.stringify(combined));
const timelineRaw=open("b1frames=1",10000)("b1-frames");
if(!timelineRaw)throw Error("B1 actual same-world frames missing");
const f=decode(timelineRaw);
if(f.length!==5||f[0].tick!==0||f[4].tick!==720)
 throw Error("B1 timeline incorrect");
console.log("B1 SOURCE TIMELINE "+JSON.stringify(f.map(x=>({
 tick:x.tick,root:x.source.chassis,extent:x.source.physicalExtent,
 hingeError:x.source.hingeError,wall:x.source.gateContacts}))));
console.log("B1 RAW FRAME-0 "+f[0].png);
console.log("B1 RAW FRAME-720 "+f[4].png);
const ui=open("b1ownercheck=1",5000)("b1-ownercheck");
if(!ui)throw Error("B1 UI actual events failed");
const u=decode(ui);
if(!u.pass)throw Error("B1 UI not qualified");
console.log("B1 CHROMIUM ACTUAL UI "+JSON.stringify(u));

const dualRaw=open("b1dual=1",60000)("b1-dual");
if(!dualRaw)throw Error("B1 dual-action real browser pressure scenes absent");
const dual=decode(dualRaw);
if(dual.scenarios.length!==4||dual.scenarios.some(x=>!x.stages||x.stages.length!==7))
 throw Error("B1 dual-action matrix incomplete");
console.log("B1 DUAL ACTION EVIDENCE "+JSON.stringify(dual.scenarios.map(x=>({
 name:x.name,crossedRoot:x.crossedRoot,
 fullBodyBeyond:x.fullBodyBeyond,firstFullExit:x.firstFullExit,
 sideContacts:x.contactStepsWithLateralMatter,
 sidePropDisplacements:x.props,
 hinge:x.final.hingeTorqueImpulse,
 stem:x.stages.map(y=>({tick:y.tick,root:y.rootX,width:y.width,
    props:y.sideX}))}))));
console.log("B1 DUAL FULL "+JSON.stringify(dual));
