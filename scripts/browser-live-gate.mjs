// Source/provenance gate: real emitted Vite bundle + Chromium/WASM fixed-step world.
// A green run does NOT establish playability, Owner feel, NPC autonomy or FPS.
import {execFileSync} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
const base=process.argv[2]||"http://127.0.0.1:4173/";
const binary=process.env.CHROME_BIN||"chromium";
const folder=resolve("p0-evidence");mkdirSync(folder,{recursive:true});
const baseArgs=["--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage",
 "--hide-scrollbars","--window-size=1500,950","--virtual-time-budget=11000"];
function run(url,other=[]){
 return execFileSync(binary,[...baseArgs,...other,url],{
  encoding:"utf8",maxBuffer:20*1024*1024,timeout:160000,stdio:["ignore","pipe","pipe"]});
}
function request(obj,other=[]){
 const url=new URL(base);
 for(const [k,v]of Object.entries(obj))url.searchParams.set(k,String(v));
 return run(url.toString(),other);
}
function attr(dom,key){return (dom.match(new RegExp('data-'+key+'="([^"]*)"'))||[])[1];}
function validPage(dom,name){
 const error=attr(dom,"p0-error");
 if(error||!dom.includes('data-p0-live="yes"'))
  throw Error(name+" emitted browser/WASM not ready: "+
  (error||dom.match(/<body[^>]*>/)?.[0]||dom.slice(-800)));
}
const plain=run(base,["--dump-dom"]);
validPage(plain,"P0 bootstrap");
if(!plain.includes("COMBAT LAB")||!plain.includes("Wspólny świat materii"))
 throw Error("Not P0 actual branch runtime");
const probe=request({p0probe:1},["--dump-dom"]);
validPage(probe,"P0 probe");
if(attr(probe,"p0-probe")!=="PASS"||attr(probe,"p0-cases")!=="32")
 throw Error("P0 source test failed: "+(attr(probe,"p0-probe-error")||"missing 32 cases"));
const encoded=attr(probe,"p0-result");
if(!encoded)throw Error("P0 missing actual source outcomes");
const trials=JSON.parse(decodeURIComponent(encoded));
if(trials.samples!==32||trials.gates.length!==6||trials.anatomy.length!==18||
 trials.interventions.length!==8)
 throw Error("P0 unexpected case source count");
writeFileSync(resolve(folder,"p0-actual-causal-worlds.json"),JSON.stringify(trials,null,2));
console.log("P0 actual-browser source: 32 counterfactual worlds completed.");
console.log(JSON.stringify({
 torques:trials.anatomy.map(x=>({s:x.support,p:x.stance,t:x.target,
  root:x.rootYaw,arm:x.relativePanel,groundYaw:x.effort.terrainAngularImpulse})),
 gate:trials.gates.map(x=>({support:x.support,pulse:x.withPulse,
  gate:x.afterAngle,contacts:x.events.gateContacts,loads:x.loadMoves})),
 actors:trials.interventions.map(x=>({kind:x.kind,support:x.support,
  gate:x.gateAngle,gateContact:x.gateContacts,effort:x.operatorRootEffort}))
}));
const owner=request({p0ownercheck:1},["--dump-dom"]);
validPage(owner,"P0 DOM operations");
if(attr(owner,"p0-ownercheck")!=="PASS")
 throw Error("P0 source DOM handler check failed: "+attr(owner,"p0-ownercheck-error"));
for(const scene of [
 {p0frame:0},
 {p0frame:240,drive:1},
 {p0frame:540,drive:1},
 {p0frame:300,poke:1}
]){
 const slug=Object.entries(scene).map(([k,v])=>k+"-"+v).join("-");
 const dom=request(scene,["--dump-dom"]);
 validPage(dom,"P0 source frame "+slug);
 const raw=attr(dom,"p0-frame");
 if(!raw)throw Error("Missing actual solver-frame state "+slug);
 const trace=JSON.parse(raw.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
 if(trace.tick!==Number(scene.p0frame)||!trace.finite)throw Error("Invalid physical frame "+slug);
 writeFileSync(resolve(folder,"p0-"+slug+".json"),JSON.stringify(trace,null,2));
 request(scene,["--screenshot="+resolve(folder,"p0-"+slug+".png")]);
}
console.log("P0 true emitted-source Chromium temporal PNG + JSON samples saved.");


const chain=request({p0chain:1},["--dump-dom"]);
validPage(chain,"P0 separate-world causal material continuation");
if(attr(chain,"p0-chain")!=="PASS"||attr(chain,"p0-chain-cases")!=="16")
 throw Error("P0 material causal continuation failed: "+(attr(chain,"p0-chain-error")||"no source"));
const rawChain=attr(chain,"p0-chain-result");
if(!rawChain)throw Error("P0 missing paired material afterstates");
const material=JSON.parse(decodeURIComponent(rawChain));
if(material.cases.length!==16||material.cases.some(x=>!x.finite||x.rootDriveInSecond!==0))
 throw Error("P0 invalid material route cause/false motor source");
writeFileSync(resolve(folder,"p0-actual-second-body-afterstate.json"),JSON.stringify(material,null,2));
console.log("P0 16 second-body material continuation counterfactuals (NOT product approval).");
console.log(JSON.stringify(material.cases.map(x=>({
 support:x.worldSupport,firstAction:x.changed,kind:x.kind,
 speed:x.speed,firstGate:x.gateAfterOpener,
 laterX:x.runnerAfter.x,passed:x.runnerCrossed,
 runnerGate:x.runnerGateImpulse,firstStage:x.openerGateImpulse
}))));


for(const axis of ["spatial","opener"]){
 const red=request({p0redteam:axis},["--dump-dom"]);
 validPage(red,"P0 red-team "+axis);
 if(attr(red,"p0-redteam")!=="PASS"||attr(red,"p0-redteam-axis")!==axis)
  throw Error("P0 post-hoc red team failed "+axis+": "+(attr(red,"p0-redteam-error")||"no result"));
 const raw=attr(red,"p0-redteam-result");
 const results=JSON.parse(decodeURIComponent(raw));
 const desired=axis==="spatial"?9:8;
 if(results.cases!==desired)throw Error("P0 redteam incorrect axis count "+axis);
 writeFileSync(resolve(folder,"p0-posthoc-"+axis+".json"),JSON.stringify(results,null,2));
 console.log("P0 post-hoc robustness "+axis+" "+desired+" matched pairs:");
 console.log(JSON.stringify({totals:results.count,comparisons:results.data.map(x=>({
   key:x.key,
   openedGate:x.compare.openedGate,
   access:x.compare.changedCross,
   deltaX:x.compare.deltaX,
   firstGateImpulse:x.compare.firstActionGateContact,
   opened:x.opened.runnerCrossed,
   closed:x.closed.runnerCrossed
 }))}));
}


for(const changed of [false,true]){
 const mode=changed?"opened":"closed";
 const url={p0pairframe:mode};
 const dom=request(url,["--dump-dom"]);
 validPage(dom,"P0 true paired world "+mode);
 const raw=attr(dom,"p0-pairframe");
 if(!raw||attr(dom,"p0-pairframe-error"))
  throw Error("P0 pair frame did not reproduce exact material world "+mode);
 const state=JSON.parse(raw.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
 if(state.changed!==changed||!state.finite||state.speed!==5.5)
  throw Error("P0 paired source trace invalid "+mode);
 writeFileSync(resolve(folder,"p0-paired-"+mode+".json"),JSON.stringify(state,null,2));
 request(url,["--screenshot="+resolve(folder,"p0-paired-"+mode+".png")]);
 console.log("P0 paired honest source frame "+mode+": "+JSON.stringify({
  gate:state.gateAfterOpener,secondActorX:state.runnerAfter.x,
  secondBodyCrossed:state.runnerCrossed,
  physicalContact:state.runnerGateImpulse
 }));
}

console.log("P0 owner-style real input: launching independent Chrome DevTools protocol run.");
execFileSync(process.execPath,["scripts/p0-real-input.mjs",base],{
  timeout:120000,stdio:"inherit"
});


const transport=request({p2probe:1},["--dump-dom"]);
validPage(transport,"P2 actual WASM contact cargo");
if(attr(transport,"p2-probe")!=="PASS"||attr(transport,"p2-cases")!=="12")
 throw Error("P2 contact-cargo source invalid: "+(attr(transport,"p2-error")||"missing"));
const result=JSON.parse(decodeURIComponent(attr(transport,"p2-result")));
if(result.cases!==12||result.results.some(x=>!x.finite||!x.loadStillPhysics))
 throw Error("P2 physical source invalid");
writeFileSync(resolve(folder,"p2-contact-cargo-source.json"),JSON.stringify(result,null,2));
console.log("P2 actually contacted cargo 12-source cases:");
console.log(JSON.stringify(result.results.map(x=>({
 kind:x.kind,support:x.support,grip:x.grip,
 cargoDX:x.cargoDXAfterPull,actorDX:x.bodyDXAfterPull,
 gripPairs:x.gripImpulsePairs,impulse:x.actualGripImpulse,
 breaks:x.gripBreaks,cap:x.cap,contactTick:x.approachTick,
 lastLink:x.linkedBeforeRelease,momentumResidual:x.sourceResidual
}))));

console.log("P2 owner-like interaction gate: native Chromium G acquire-release, physical transport.");
execFileSync(process.execPath,["scripts/p2-real-input.mjs",base],{
 timeout:150000,stdio:"inherit"
});


const p2Matched=request({p2red:1},["--dump-dom"]);
validPage(p2Matched,"P2 equal speed adversarial cargo transport");
if(attr(p2Matched,"p2-red")!=="PASS"||attr(p2Matched,"p2-red-cases")!=="24")
 throw Error("P2 policy/strength redteam failed: "+(attr(p2Matched,"p2-red-error")||"no result"));
const p2R=JSON.parse(decodeURIComponent(attr(p2Matched,"p2-red-result")));
if(p2R.cases!==24||p2R.results.some(x=>!x.finite||!x.loadStillPhysics||x.sourceResidual>1e-6))
 throw Error("P2 physically invalid matched speed source");
writeFileSync(resolve(folder,"p2-matched-speed-strength-redteam.json"),JSON.stringify(p2R,null,2));
console.log("P2 actual 24-world equal-speed falsifier:");
console.log(JSON.stringify(p2R.comparisons));


const p3=request({p3probe:1},["--dump-dom"]);
validPage(p3,"P3 real two-body opposed cargo contention");
if(attr(p3,"p3-probe")!=="PASS"||attr(p3,"p3-count")!=="24")
 throw Error("P3 source failure: "+(attr(p3,"p3-error")||"missing 24 cases"));
const p3Data=JSON.parse(decodeURIComponent(attr(p3,"p3-result")));
if(p3Data.cases!==24||p3Data.results.some(x=>!x.finite||x.momentumResidual>1e-5))
 throw Error("P3 not physically source-grounded");
writeFileSync(resolve(folder,"p3-two-bodied-actual-wasm.json"),JSON.stringify(p3Data,null,2));
console.log("P3 24 actual solver bilateral-cargo worlds:");
console.log("P3 isolated LINK-RELEASE matched-command contrasts:",JSON.stringify(p3Data.releaseContrasts));
console.log(JSON.stringify(p3Data.results.map(x=>({
 kind:x.leftKind,support:x.support,mode:x.mode,approach:x.approached,
 first:x.initialCargoX,duel:x.cargoAtContest,after:x.cargoAfter,
 duelLinks:x.activeAfterContest,lateLinks:x.activeEnd,
 gripImpulse:x.gripImpulse,breaks:x.breaks,
 deliberateRelease:x.didRelease
}))));
for(const mode of ["dual","off","release"]){
 const p={p3frame:mode};
 const dom=request(p,["--dump-dom"]);
 validPage(dom,"P3 source screenshot "+mode);
 const v=attr(dom,"p3-frame");
 if(!v||attr(dom,"p3-frame-error"))
  throw Error("P3 real dual source frame missing "+mode+": "+attr(dom,"p3-frame-error"));
 const trace=JSON.parse(v.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
 if(!trace.finite||trace.mode!==mode)throw Error("P3 invalid screenshot source "+mode);
 writeFileSync(resolve(folder,"p3-frame-"+mode+".json"),JSON.stringify(trace,null,2));
 request(p,["--screenshot="+resolve(folder,"p3-frame-"+mode+".png")]);
}


console.log("P3 native independent two-operator contact force confrontation...");
execFileSync(process.execPath,["scripts/p3-real-dual-input.mjs",base],{
  timeout:120000,stdio:"inherit"
});


const p4=request({p4probe:1},["--dump-dom"]);
validPage(p4,"P4 real locally observed contact reflex");
if(attr(p4,"p4-probe")!=="PASS"||attr(p4,"p4-cases")!=="32")
 throw Error("P4 source probe failed: "+(attr(p4,"p4-error")||"missing 32"));
const p4Result=JSON.parse(decodeURIComponent(attr(p4,"p4-report")));
if(p4Result.cases!==32||p4Result.results.some(x=>!x.finite||x.touchTick<0))
 throw Error("P4 source physically invalid");
writeFileSync(resolve(folder,"p4-reflex-32-real-wasm.json"),JSON.stringify(p4Result,null,2));
console.log("P4 32 true contact reflex vs cheap null physical source worlds:");
console.log(JSON.stringify(p4Result.comparisons));
for(const mode of ["off","brake","follow","conditional"]){
 const arg={p4frame:mode};
 const dom=request(arg,["--dump-dom"]);
 validPage(dom,"P4 source frame "+mode);
 const raw=attr(dom,"p4-frame");
 if(!raw||attr(dom,"p4-frame-error"))
  throw Error("P4 source missing "+mode+": "+attr(dom,"p4-frame-error"));
 const data=JSON.parse(raw.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
 if(!data.finite||data.mode!==mode)throw Error("P4 frame source mismatch");
 writeFileSync(resolve(folder,"p4-"+mode+"-source.json"),JSON.stringify(data,null,2));
 request(arg,["--screenshot="+resolve(folder,"p4-"+mode+"-real-chromium.png")]);
}

console.log("P4 native operator source: real Chrome preset and external physical shove...");
execFileSync(process.execPath,["scripts/p4-real-input.mjs",base],{
 timeout:120000,stdio:"inherit"
});


const p4stress=request({p4hard:1},["--dump-dom"]);
validPage(p4stress,"P4 actual extreme pressure 48");
if(attr(p4stress,"p4-hard")!=="PASS"||attr(p4stress,"p4-hard-cases")!=="48")
 throw Error("P4 adversarial source failed: "+(attr(p4stress,"p4-hard-error")||"missing"));
const pressure=JSON.parse(decodeURIComponent(attr(p4stress,"p4-hard-data")));
if(pressure.cases!==48)throw Error("P4 missing actual true hard-source worlds");
writeFileSync(resolve(folder,"p4-48-real-pressure-stress.json"),JSON.stringify(pressure,null,2));
console.log("P4 grip survival vs cheap reflex rivals under real high-impact 48 worlds:");
console.log(JSON.stringify(pressure.comparisons));


const conservation=request({p4momentum:1},["--dump-dom"]);
validPage(conservation,"P4 source torque conservation forensic");
if(attr(conservation,"p4-momentum")!=="PASS"||attr(conservation,"p4-momentum-cases")!=="9")
 throw Error("P4 physically measured momentum source fail: "+
  (attr(conservation,"p4-momentum-error")||"missing"));
const conservationData=JSON.parse(decodeURIComponent(attr(conservation,"p4-momentum-report")));
if(conservationData.cases!==9)throw Error("P4 source momentum count missing");
writeFileSync(resolve(folder,"p4-actual-angular-momentum-audit.json"),JSON.stringify(conservationData,null,2));
console.log("P4 conservation off/grip/axial actual WASM:");
console.log(JSON.stringify(conservationData.results.map(x=>({
 model:x.model,pulse:x.pulse,dL:x.angularDrift,peakL:x.peakAngularDrift,
 dP:x.linearDrift,peakP:x.peakLinearDrift,dK:x.energyChange
}))));


const axial=request({p4axial:1},["--dump-dom"]);
validPage(axial,"P4 axial donor old-vs-new P2/P3 physical regression");
if(attr(axial,"p4-axial")!=="PASS"||attr(axial,"p4-axial-count")!=="96")
 throw Error("P4 axial 96-world source failed: "+(attr(axial,"p4-axial-error")||"missing"));
const axialReport=JSON.parse(decodeURIComponent(attr(axial,"p4-axial-report")));
if(axialReport.actuallySimulatedPhysicalWorlds!==96)
 throw Error("P4 actual donor count invalid");
writeFileSync(resolve(folder,"p4-central-axial-vs-original-p2-p3.json"),JSON.stringify(axialReport,null,2));
console.log("P4 AXIAL grip physical donor A/B P2 transport and P3 contested matter:");
console.log(JSON.stringify({
 p2:axialReport.p2,
 p3:axialReport.p3.filter(x=>["dual","release","left","off"].includes(x.mode)),
 speed:axialReport.speedMatchedAxial
}));


const commons=request({p5probe:1},["--dump-dom"]);
validPage(commons,"P5 source actual multi-body free-run");
if(attr(commons,"p5-probe")!=="PASS"||attr(commons,"p5-cases")!=="64")
 throw Error("P5 free commons source failed: "+(attr(commons,"p5-error")||"not 40"));
const commonsData=JSON.parse(decodeURIComponent(attr(commons,"p5-report")));
if(commonsData.cases!==64)throw Error("P5 missing actual free-run world cases");
writeFileSync(resolve(folder,"p5-40-physical-free-commons.json"),JSON.stringify(commonsData,null,2));
console.log("P5 64 actual WASM physically free-running worlds:");
console.log(JSON.stringify(commonsData.regular.map(x=>({
 p:x.policy,s:x.support,seed:x.seed,shock:x.intervention,
 actorContacts:x.contactActor,loadContacts:x.contactCargo,
 localGrips:x.localGrips,activeGrips:x.activeGrips,
 movements:x.loadMotion,rootEffort:x.autonomousImpulse
}))));
console.log(JSON.stringify(commonsData.opened.map(x=>({
 topology:x.topology,policy:x.policy,support:x.support,seed:x.seed,
 shock:x.intervention,grips:x.localGrips,liveLinks:x.activeGrips,
 cargoContacts:x.contactCargo,changes:x.loadMotion
}))));
for(const policy of ["constant","touch","attach","material"]){
 const q={p5frame:policy,shock:"pulse",seed:1},dom=request(q,["--dump-dom"]);
 validPage(dom,"P5 raw actual material commons frame "+policy);
 const raw=attr(dom,"p5-frame");
 if(!raw||attr(dom,"p5-frame-error"))throw Error("P5 frame missing "+
  policy+" "+attr(dom,"p5-frame-error"));
 const v=JSON.parse(raw.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
 if(v.policy!==policy||!v.finite)throw Error("P5 real visual source mismatch");
 writeFileSync(resolve(folder,"p5-"+policy+"-frame.json"),JSON.stringify(v,null,2));
 request(q,["--screenshot="+resolve(folder,"p5-"+policy+"-real-chromium.png")]);
}

console.log("P5 native actual operator interruption with independent solver continuity...");
execFileSync(process.execPath,["scripts/p5-native-real.mjs",base],{
 timeout:120000,stdio:"inherit"
});


const p6=request({p6probe:1},["--dump-dom"]);
validPage(p6,"P6 actual matched body envelope physical pressure");
if(attr(p6,"p6-probe")!=="PASS"||attr(p6,"p6-cases")!=="76")
 throw Error("P6 body envelope WASM failed: "+(attr(p6,"p6-error")||"not 76"));
const p6Data=JSON.parse(decodeURIComponent(attr(p6,"p6-report")));
if(p6Data.cases!==76)throw Error("P6 incomplete source physical controls");
writeFileSync(resolve(folder,"p6-76-body-envelope-real-rapier.json"),JSON.stringify(p6Data,null,2));
console.log("P6 matched shape-only narrow/broad pressure actual source:");
console.log(JSON.stringify(p6Data.matchedGeometryPairs));
console.log("P6 same-world edited fixed-collider passage physical source:");
console.log(JSON.stringify(p6Data.editedPairs.map(x=>({kind:x.kind,area:x.width,
 support:x.support,edit:x.edit,crossed:x.crossed,tick:x.crossedAt,
 endX:x.end.x,effort:x.totalEffort,geom:x.bodyShape}))));
console.log("P6 physically inhabited multi-actor room:");
console.log(JSON.stringify(p6Data.inhabited.map(x=>({
 support:x.support,policy:x.policy,contact:x.barrierContacts,
 actor:x.displacement,cargo:x.cargoDisplacement}))));
const p6Frame=request({p6frame:1},["--dump-dom"]);
validPage(p6Frame,"P6 actual four body room screenshot source");
const raw6=attr(p6Frame,"p6-frame");
if(!raw6||attr(p6Frame,"p6-frame-error"))
 throw Error("P6 missing physical 4-body frame: "+attr(p6Frame,"p6-frame-error"));
const f6=JSON.parse(raw6.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
if(!f6.finite||f6.actorCount!==4||f6.loadCount!==2)
 throw Error("P6 raw source not a full real corridor world");
writeFileSync(resolve(folder,"p6-four-body-room-frame-source.json"),
 JSON.stringify(f6,null,2));
request({p6frame:1},["--screenshot="+resolve(folder,
 "p6-four-body-material-corridors-real-chromium.png")]);

console.log("P6 real native pointer edits narrow passage while physical 4-body world persists...");
execFileSync(process.execPath,["scripts/p6-native-real.mjs",base],{
 timeout:120000,stdio:"inherit"
});

const spin=request({p6orientation:1},["--dump-dom"]);
validPage(spin,"P6 real rigid shape reorientation mechanical controls");
if(attr(spin,"p6-orientation")!=="PASS"||attr(spin,"p6-orientation-cases")!=="30")
 throw Error("P6 rotation source failed: "+(attr(spin,"p6-orientation-error")||"not 24"));
const spinData=JSON.parse(decodeURIComponent(attr(spin,"p6-orientation-report")));
if(spinData.cases!==30)throw Error("P6 missing 30 source rotation worlds");
writeFileSync(resolve(folder,"p6-30-real-orientation-same-shape.json"),
 JSON.stringify(spinData,null,2));
console.log("P6 physically oriented rigid envelope vs torque/no torque/cheap power:");
console.log(JSON.stringify(spinData.summary));
for(const mode of ["passive","active","turn-first"]){
 const q={p6pose:mode},dom=request(q,["--dump-dom"]);
 validPage(dom,"P6 actual elongated body "+mode);
 const src=attr(dom,"p6-pose");
 if(!src||attr(dom,"p6-pose-error"))
  throw Error("P6 no raw pose "+mode+": "+attr(dom,"p6-pose-error"));
 const f=JSON.parse(src.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
 if(!f.finite||f.mode!==mode)throw Error("P6 visual source wrong physical body");
 writeFileSync(resolve(folder,"p6-"+mode+"-actual-shape-source.json"),JSON.stringify(f,null,2));
 request(q,["--screenshot="+resolve(folder,
  "p6-"+mode+"-real-elongated-body-chromium.png")]);
}

const autoRecovery=request({p6recovery:1},["--dump-dom"]);
validPage(autoRecovery,"P6 true contact-reactive anti-jam source");
if(attr(autoRecovery,"p6-recovery")!=="PASS"||
 attr(autoRecovery,"p6-recovery-cases")!=="18")
 throw Error("P6 real touch/jam source error: "+
  (attr(autoRecovery,"p6-recovery-error")||"not18"));
const rawRecovery=attr(autoRecovery,"p6-recovery-report");
if(!rawRecovery)throw Error("P6 missing physical source recovery JSON");
const recoveryData=JSON.parse(decodeURIComponent(rawRecovery));
if(recoveryData.cases!==18)throw Error("P6 actual pressure cases wrong");
writeFileSync(resolve(folder,"p6-18-real-contact-jam-recovery.json"),
 JSON.stringify(recoveryData,null,2));
console.log("P6 actual physics jam recovery from manifold pressure:");
console.log(JSON.stringify(recoveryData.comparisons));
for(const policy of ["stubborn","recover","stabilized"]){
 const q={p6recoverframe:policy},dom=request(q,["--dump-dom"]);
 validPage(dom,"P6 actual jam source frame "+policy);
 const val=attr(dom,"p6-recovery-frame");
 if(!val||attr(dom,"p6-recovery-frame-error"))
  throw Error("P6 physical recovery frame missing "+policy+" "+
    attr(dom,"p6-recovery-frame-error"));
 const rec=JSON.parse(val.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
 if(!rec.finite||rec.policy!==policy)throw Error("P6 source rescue frame invalid");
 writeFileSync(resolve(folder,"p6-"+policy+"-jam-frame.json"),JSON.stringify(rec,null,2));
 request(q,["--screenshot="+resolve(folder,
  "p6-"+policy+"-after-jam-real-chromium.png")]);
}


const p7=request({p7probe:1},["--dump-dom"]);
validPage(p7,"P7 actual crowd/contact physical WASM source");
if(attr(p7,"p7-probe")!=="PASS"||attr(p7,"p7-cases")!=="98")
 throw Error("P7 controlled pressure source failure: "+(attr(p7,"p7-error")||"not98"));
const p7data=JSON.parse(decodeURIComponent(attr(p7,"p7-report")));
if(p7data.worlds!==98)throw Error("P7 missing source worlds");
writeFileSync(resolve(folder,"p7-98-real-crowd-pressure.json"),
 JSON.stringify(p7data,null,2));
console.log("P7 fully dynamic pressure shape A/B with 90kg matched defender:");
console.log(JSON.stringify(p7data.geometry));
console.log("P7 same actual preintervention pressure world; real operator action A/B:");
console.log(JSON.stringify(p7data.comparisons));
console.log("P7 controlled flank access with equal driver and guard source:");
console.log(JSON.stringify(p7data.lateral.map(x=>({width:x.width,
 support:x.support,guardKind:x.guardKind,guardPolicy:x.guardPolicy,
 contacts:x.contacts,pass:x.passedMouth,deflected:x.deflections,
 guardX:x.guard.x,movers:x.movers.filter(a=>a.id===x.movers[1].id)}))));
console.log("P7 owner interference under honest widened physical gap at flank:");
console.log(JSON.stringify(p7data.flankComparisons));
console.log("P7 body crowd pressure selected finite support scenarios:");
console.log(JSON.stringify(p7data.base.filter(x=>x.support==="finite"&&
 x.guardKind==="bulky"&&x.density===6&&x.width===2.85).map(x=>({
 width:x.width,guard:x.guardPolicy,crowd:x.moverPolicy,contacts:x.contacts,
 reacted:x.braceTicks,steered:x.deflections,passed:x.passedMouth,
 displaced:x.guard.x,drive:x.sourceCost.root}))));
for(const policy of ["passive","brace"]){
 const q={p7frame:policy,intervention:"none"},dom=request(q,["--dump-dom"]);
 validPage(dom,"P7 raw actual crowd screenshot "+policy);
 const a=attr(dom,"p7-frame");
 if(!a||attr(dom,"p7-frame-error"))throw Error("P7 source snapshot absent: "+
 (attr(dom,"p7-frame-error")||policy));
 const s=JSON.parse(a.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
 if(!s.finite||s.policy!==policy)throw Error("P7 source mismatch");
 writeFileSync(resolve(folder,"p7-"+policy+"-source-frame.json"),JSON.stringify(s,null,2));
 request(q,["--screenshot="+resolve(folder,
  "p7-"+policy+"-actual-crowd-real-chromium.png")]);
}

console.log("P7 true native Chrome pointer test: same physical crowd, operator perturbation and continuing edited matter...");
execFileSync(process.execPath,["scripts/p7-native-real.mjs",base],{
 timeout:120000,stdio:"inherit"
});


const p8=request({p8probe:1},["--dump-dom"]);
validPage(p8,"P8 real source contact-induced sidestep vs cheaper controls");
if(attr(p8,"p8-probe")!=="PASS"||attr(p8,"p8-cases")!=="57")
 throw Error("P8 actual 57 material scenarios failed: "+(attr(p8,"p8-error")||"not57"));
const p8Data=JSON.parse(decodeURIComponent(attr(p8,"p8-report")));
if(p8Data.cases!==57)throw Error("P8 incomplete A/B source worlds");
writeFileSync(resolve(folder,"p8-57-physical-contact-response.json"),
 JSON.stringify(p8Data,null,2));
console.log("P8 actual Rapier contact slide vs cheap drive / naive yield, physical-stall and source budgets:");
console.log(JSON.stringify(p8Data.triples));
console.log("P8 exactly matched source physical pre-shock and material-intervention states:");
console.log(JSON.stringify(p8Data.actions.map(x=>({policy:x.tactile,
 edit:x.intervention,passthrough:x.passes,slip:x.slipTriggers,
 guard:x.guard,impulses:x.impulses,contact:x.contacts}))));
for(const policy of ["drive","yield","slip"]){
 const dom=request({p8frame:policy},["--dump-dom"]);
 validPage(dom,"P8 actual material source frame "+policy);
 const d=attr(dom,"p8-frame");
 if(!d||attr(dom,"p8-frame-error"))
  throw Error("P8 frame missing: "+(attr(dom,"p8-frame-error")||policy));
 const v=JSON.parse(d.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
 if(!v.finite||v.tactile!==policy)throw Error("P8 physical frame source mismatch");
 writeFileSync(resolve(folder,"p8-"+policy+"-raw-source.json"),
  JSON.stringify(v,null,2));
 request({p8frame:policy},["--screenshot="+resolve(folder,
  "p8-"+policy+"-real-crowd-chromium.png")]);
}
