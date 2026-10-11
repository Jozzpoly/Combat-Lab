// P12: actual emitted Chromium Rapier WASM solver, never a Node source mock.
import {execFileSync} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
const base=new URL("p10.html",process.argv[2]||"http://127.0.0.1:4173/");
const chrome=process.env.CHROME_BIN||"chromium";
const out=resolve("p12-evidence");mkdirSync(out,{recursive:true});
const opts=["--headless=new","--no-sandbox","--disable-gpu",
 "--disable-dev-shm-usage","--hide-scrollbars",
 "--window-size=1520,970","--virtual-time-budget=20000"];
function page(query,options=[]){
 const u=new URL(base);
 for(const [k,v]of Object.entries(query))u.searchParams.set(k,String(v));
 return execFileSync(chrome,[...opts,...options,u.toString()],{
  encoding:"utf8",timeout:180000,maxBuffer:25*1024*1024,
  stdio:["ignore","pipe","pipe"]});
}
function get(s,k){return (s.match(new RegExp('data-'+k+'="([^"]*)"'))||[])[1];}
const decode=s=>decodeURIComponent(s.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
const html=page({p12audit:1},["--dump-dom"]);
if(get(html,"p12-audit")!=="PASS"||get(html,"p12-worlds")!=="21")
 throw Error("P12 actual solver source FAIL: "+(get(html,"p12-error")||"missing 21 completed worlds"));
const data=JSON.parse(decode(get(html,"p12-report")));
if(data.worlds!==21||data.cases.length!==21||data.cases.some(x=>!x.finite))
 throw Error("P12 source world completeness");
writeFileSync(resolve(out,"p12-21-real-worlds.json"),JSON.stringify(data,null,2));
console.log("P12 actual 21 worlds, COM/root-ground/material tests");
for(const s of data.summary)console.log(JSON.stringify(s));
for(const [mode,b,drive]of[
 ["noContact","absent","sweep"],
 ["solidContact","fixed","sweep"],
 ["movingContact","movable","sweep"],
 ["passive","fixed","off"]
]){
 const q={p12frame:mode},dom=page(q,["--dump-dom"]);
 const err=get(dom,"p12-frame-error");
 if(err||!get(dom,"p12-frame"))throw Error("P12 actual screenshot scene absent "+mode+" "+err);
 const state=JSON.parse(decode(get(dom,"p12-frame")));
 const expected=data.cases.find(x=>x.support==="none"&&x.backing===b&&x.drive===drive&&x.kind==="lever");
 if(!expected||!state.finite||state.tick!==300||state.actors!==3||
    state.sourceImpulse!==0||
    Math.abs(state.root.x-expected.rootEnd.x)>.0002||
    Math.abs(state.root.y-expected.rootEnd.y)>.0002)
  throw Error("P12 visual actual solver afterstate disagrees with source case "+mode);
 writeFileSync(resolve(out,"p12-"+mode+"-raw-state.json"),JSON.stringify(state,null,2));
 page(q,["--screenshot="+resolve(out,"p12-"+mode+"-real-chromium.png")]);
 console.log("P12 raw source screenshot "+mode+": "+JSON.stringify({root:state.root,backer:state.backer}));
}
console.log(data.limits);
