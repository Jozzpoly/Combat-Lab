import {execFileSync} from "node:child_process";
const chrome=process.env.CHROME_BIN,url=process.argv[2];
if(!chrome||!url)throw Error("Emitted Chrome X0 gate needs CHROME_BIN and URL");
function visit(path,budget=10000){
 const dom=execFileSync(chrome,["--headless=new","--no-sandbox","--disable-gpu",
   "--disable-dev-shm-usage","--virtual-time-budget="+budget,
   "--dump-dom",path],{timeout:95000,encoding:"utf8",
     maxBuffer:12*1024*1024});
 const get=name=>dom.match(new RegExp('data-'+name+'="([^"]*)"'))?.[1];
 if(get("live")!=="yes"||get("live-error")){
   throw Error("X0 emitted browser FAIL: "+get("live-error")+" boot="+get("live")+
     " dom last="+dom.slice(-700));
 }
 return {dom,get};
}
const normal=visit(url,4500);
console.log("X0 ACTUAL BROWSER PHYSICS BOOT PASS · DOM "+normal.dom.length);
const probe=visit(url+(url.includes("?")?"&":"?")+"probe=1",23000);
const raw=probe.get("probe");
if(!raw)throw Error("X0 whole-world Rapier control probe missing");
const value=JSON.parse(raw.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
console.log("X0 WHOLE WORLD CAUSAL EVIDENCE: "+JSON.stringify(value));
const UI=probe.get("ui-probe");
if(!UI)throw Error("X0 actual operator UI validation missing");
const ui=JSON.parse(UI.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
if(!ui.materialAuthoring||!ui.bodyReposition||!ui.pointImpulse||!ui.hingeRotation)
  throw Error("X0 UI pathways failed");
console.log("X0 ACTUAL BROWSER OWNER WORKBENCH INPUT: "+JSON.stringify(ui));

if(!value.portedStartScene||!value.invalidSceneRejected)
  throw Error("X0 initial-world authoring claim failed");
if(value.defaultActors<3||value.defaultMatter<5)
  throw Error("X0 is only a staged object fixture, not a material commons");

// True multiple-body material stress. Does not infer agentic ecology or FPS.
const broad=visit(url+(url.includes("?")?"&":"?")+"pressure=1",26000);
const rawPressure=broad.get("pressure");
if(!rawPressure)throw Error("X0 whole-field pressure absent");
const fieldTrial=JSON.parse(rawPressure.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
if(fieldTrial.trials?.length!==3)throw Error("Incomplete three-seed heterogeneous world observation");
console.log("X0 MULTI-BODY MATERIAL PRESSURE: "+JSON.stringify(fieldTrial));

const grip=visit(url+(url.includes("?")?"&":"?")+"holdprobe=1",14000);
const hold=grip.get("hold-probe");
if(!hold)throw Error("X0 physical body-contact hold test was not emitted");
const holdTrial=JSON.parse(hold.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
console.log("X0 CONTACT-HOLD COUNTERFACTUAL: "+JSON.stringify(holdTrial));

const kinetic=visit(url+(url.includes("?")?"&":"?")+"energy=1",21000);
const materialPower=kinetic.get("energy");
if(!materialPower)throw Error("X0 material energy pair not produced");
console.log("X0 ACTIVE-MATTER WHOLE COUNTERFACTUAL: "+
  JSON.stringify(JSON.parse(materialPower.replaceAll("&quot;",'"').replaceAll("&amp;","&"))));

const relayF2page=visit(url+(url.includes("?")?"&":"?")+"relayf2=1",28000);
const rawRelayF2=relayF2page.get("relayf2");
if(!rawRelayF2)throw Error("Selective inter-actor tactile relay observation absent");
console.log("X0 SELECTIVE ACTOR-TO-ACTOR REFLEX ABLATION: "+
  JSON.stringify(JSON.parse(rawRelayF2.replaceAll("&quot;",'"').replaceAll("&amp;","&"))));

const f2page=visit(url+(url.includes("?")?"&":"?")+"f2=1",27000);
const f2data=f2page.get("f2");
if(!f2data)throw Error("F2 reflex ON/OFF shared-world counterfactual absent");
const f2=JSON.parse(f2data.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
console.log("X0 LOCAL-RESPONSE GENERALIZATION: "+JSON.stringify(f2));

const articulated=visit(url+(url.includes("?")?"&":"?")+"sweep=1",18000);
const armResult=articulated.get("sweep");
if(!armResult)throw Error("Self-actuated arm counterfactual did not emit evidence");
console.log("X0 PHYSICAL ARM-ACTION DIFFERENTIAL: "+
  JSON.stringify(JSON.parse(armResult.replaceAll("&quot;",'"').replaceAll("&amp;","&"))));

const reconfigured=visit(url+(url.includes("?")?"&":"?")+"rerig=1",22000);
const rr=reconfigured.get("rerig");
if(!rr)throw Error("X0 live body rebuild test did not emit evidence");
const changed=JSON.parse(rr.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
if(!changed.continuity?.otherWorldPreserved ||
   !changed.ability?.rerigged?.acquired)
  throw Error("Live body morphology didn't preserve world or change physical action");
console.log("X0 LIVE-BODY RECONFIGURATION: "+JSON.stringify(changed));

const relay=visit(url+(url.includes("?")?"&":"?")+"cascade=1",11000);
const chain=relay.get("cascade");
if(!chain)throw Error("Second actor opportunity counterfactual not executed");
console.log("X0 TWO-ACTOR OPPORTUNITY OBSERVATION: "+
  JSON.stringify(JSON.parse(chain.replaceAll("&quot;",'"').replaceAll("&amp;","&"))));


