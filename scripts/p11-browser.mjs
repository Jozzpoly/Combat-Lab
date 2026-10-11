// P11 actual bundled Vite/Rapier WASM causal test and raw Chrome frames.
// No standalone bare Node simulation, no DOM-synthetic physics manipulation.
import {execFileSync} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
const bin=process.env.CHROME_BIN||"chromium";
const base=new URL("p10.html",process.argv[2]||"http://139.0.0.1:4173/");
const dir=resolve("p11-evidence");mkdirSync(dir,{recursive:true});
const flags=["--headless=new","--no-sandbox","--disable-gpu",
 "--disable-dev-shm-usage","--hide-scrollbars","--window-size=3920,970",
 "--virtual-time-budget=18000"];
function invoke(query={},others=[]){
 const url=new URL(base);
 for(const [k,v]of Object.entries(query))url.searchParams.set(k,String(v));
 return execFileSync(bin,[...flags,...others,url.toString()],{
  encoding:"utf8",timeout:170000,maxBuffer:22*1024*1024,
  stdio:["ignore","pipe","pipe"]});
}
const attr=(text,k)=>(text.match(new RegExp('data-'+k+'="([^"]*)"'))||[])[1];
const decode=x=>decodeURIComponent(x.replaceAll("&amp;","&").replaceAll("&quot;",'"'));
const dataHtml=invoke({p11audit:1},["--dump-dom"]);
if(attr(dataHtml,"p11-audit")!=="PASS")
 throw Error("P11 exact real Rapier source FAIL: "+(attr(dataHtml,"p11-error")||"missing marker"));
if(attr(dataHtml,"p11-worlds")!=="39")throw Error("P11 expected 39 material source worlds");
const report=JSON.parse(decode(attr(dataHtml,"p11-report")));
if(report.worlds!==39||report.scenarios.some(x=>!x.finite)||report.cargoFrictionScan.length!==12)
 throw Error("P11 scenario source nonfinite or missing");
writeFileSync(resolve(dir,"p11-real-39-material-contact-cases.json"),JSON.stringify(report,null,2));
console.log("P11 actual 39 240-step Rapier source backing and external rival:");
for(const row of report.summary)console.log(JSON.stringify(row));
console.log('P11 PREDECLARED CARGO-FRICTION-SCAN:');
for(const row of report.cargoFrictionScan)console.log('SCAN '+JSON.stringify(row));
for(const [name,backing,actuation] of [
 ["unsupported","none","hinge"],
 ["backed","fixed","hinge"],
 ["movable","movable","hinge"],
 ["noMotor","fixed","off"]
]){
 const html=invoke({p11frame:name},["--dump-dom"]);
 if(attr(html,"p11-frame-error")||!attr(html,"p11-frame"))
  throw Error("P11 raw Chromium frame absent: "+name+" "+attr(html,"p11-frame-error"));
 const state=JSON.parse(decode(attr(html,"p11-frame")));
 const expected=report.scenarios.find(x=>x.backing===backing&&x.support==="finite"&&
  x.actuation===actuation&&x.kind==="lever");
 if(!expected||state.tick!==expected.ticks||!state.endCargo||
    Math.abs(state.endCargo.x-expected.finalLoad.x)>.0003||
    Math.abs(state.endCargo.y-expected.finalLoad.y)>.0003||
    state.actors!==3||state.rootEffort!==0)
  throw Error("P11 visual source and true physical matrix disagree "+name);
 writeFileSync(resolve(dir,"p11-"+name+"-actual-state.json"),JSON.stringify(state,null,2));
 invoke({p11frame:name},["--screenshot="+resolve(dir,"p11-"+name+"-real-chromium.png")]);
 console.log("P11 verified unretouched Chrome frame "+name+" "+JSON.stringify(state));
}
console.log(report.limitations);
