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
if(!plain.includes("COMBAT LAB")||!plain.includes("Dziedziniec nacisku"))
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
