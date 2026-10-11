// P10 exact emitted Vite/Chromium/Rapier tests; all source facts, no "feel PASS".
import {execFileSync} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
const base=new URL("p10.html",process.argv[2]||"http://127.0.0.1:4173/");
const bin=process.env.CHROME_BIN||"chromium";
const folder=resolve("p10-evidence");mkdirSync(folder,{recursive:true});
const args=["--headless=new","--no-sandbox","--disable-gpu",
 "--disable-dev-shm-usage","--hide-scrollbars","--window-size=1520,970",
 "--virtual-time-budget=15000"];
function req(params={},flags=[]){
 const url=new URL(base);
 for(const [k,v]of Object.entries(params))url.searchParams.set(k,String(v));
 return execFileSync(bin,[...args,...flags,url.toString()],{
  encoding:"utf8",maxBuffer:15*1024*1024,timeout:170000,
  stdio:["ignore","pipe","pipe"]});
}
function att(dom,k){return (dom.match(new RegExp('data-'+k+'="([^"]*)"'))||[])[1];}
function unesc(s){return s?.replaceAll("&quot;",'"').replaceAll("&amp;","&");}
const basic=req({},["--dump-dom"]);
if(att(basic,"p10-live")!=="yes"||att(basic,"p10-error"))
 throw Error("P10 emitted browser world did not bootstrap: "+att(basic,"p10-error"));
const test=req({p10audit:1},["--dump-dom"]);
if(att(test,"p10-audit")!=="PASS")
 throw Error("P10 emitted real WASM source control FAIL: "+
  (att(test,"p10-audit-error")||att(test,"p10-error")||"missing result"));
const data=JSON.parse(decodeURIComponent(unesc(att(test,"p10-report"))));
if(data.cases!==15)throw Error("P10 full declared physical source count changed: "+data.cases);
writeFileSync(resolve(folder,"p10-real-physical-controls.json"),JSON.stringify(data,null,2));
console.log("P10 SOURCE: "+data.cases+" true quiet/control/material/hinge/topology worlds.");
console.log(JSON.stringify({slots:data.slots,haul:data.haul,tools:data.tools,topology:data.topology,quiet:data.quiet}));
for(const name of ["free","slot","hinge"]){
 const p={p10frame:name},dom=req(p,["--dump-dom"]);
 if(att(dom,"p10-frame-error")||att(dom,"p10-error")||!att(dom,"p10-frame"))
  throw Error("P10 actual visual source "+name+" absent: "+(att(dom,"p10-frame-error")||att(dom,"p10-error")));
 const state=JSON.parse(decodeURIComponent(unesc(att(dom,"p10-frame"))));
 if(!state.finite||state.actors.length!==3||state.cargo.length!==5)
  throw Error("P10 actual preview frame is NOT a complete physics world");
 writeFileSync(resolve(folder,"p10-"+name+"-real-state.json"),JSON.stringify(state,null,2));
 req(p,["--screenshot="+resolve(folder,"p10-"+name+"-real-chromium.png")]);
 console.log("P10 RAW source frame "+name+": "+JSON.stringify({
  tick:state.tick,actors:state.actors.length,cargo:state.cargo.length,
  selected:state.selected,aperture:state.aperture.width,
  joint:state.panelImpulse,effort:state.rootEffort}));
}
