import {execFileSync} from "node:child_process";
const chrome=process.env.CHROME_BIN,url=process.argv[2];
if(!chrome||!url)throw Error("M0 requires Chrome & a real built local URL");
const href=url+(url.includes("?")?"&":"?")+"probe=1";
const html=execFileSync(chrome,["--headless=new","--no-sandbox","--disable-gpu",
 "--disable-dev-shm-usage","--virtual-time-budget=45000","--dump-dom",href],
 {encoding:"utf8",timeout:130000,maxBuffer:16*1024*1024});
const get=name=>html.match(new RegExp('data-'+name+'="([^"]*)"'))?.[1];
if(get("live")!=="yes"||get("live-error"))
 throw Error("M0 emitted Chromium/WASM runtime FAIL: "+get("live-error")+" live="+get("live"));
const data=get("m0-probe");
if(!data)throw Error("M0 physical probe not executed in browser");
const values=JSON.parse(data.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
if(values.cases.length!==18||values.passive.length!==3||values.poke.length!==3)
 throw Error("M0 incomplete morphology × offset × control matrix");
if(values.cases.some(x=>!x.numericFinite))throw Error("Nonfinite physics result");
if(values.passive.some(x=>x.rootMotorTicks||x.externalImpulse||x.responseEvents))
 throw Error("Passive-body contamination");
const contacts=values.cases.filter(x=>x.contactTicks>0).length;
const pokeContacts=values.poke.filter(x=>x.contactTicks>0).length;
const generated=get("m0-frame");
if(!generated||!generated.startsWith("data:image/png;base64,"))
 throw Error("M0 actual unretouched canvas frame missing");
console.log("M0 BROWSER PHYSICAL SOURCE CHECK: PASS; contact cases="+contacts+
 " of 18; external impulse contacts="+pokeContacts+" of 3");
console.log("M0 PHYSICAL TRIAL "+JSON.stringify(values));
// No Owner-level feel/creature-life PASS. PNG data stays in browser DOM;
// never claim screenshot content was inspected merely because bytes exist.
console.log("M0 FIRST REAL FRAME PNG base64 bytes="+generated.length);
console.log("M0 FRAME-DATA "+generated);

const movie=execFileSync(chrome,["--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage",
 "--virtual-time-budget=3500","--dump-dom",
 url+(url.includes("?")?"&":"?")+"frames=1"],
 {encoding:"utf8",timeout:75000,maxBuffer:16*1024*1024});
const frameRaw=movie.match(/data-m0-frames="([^"]*)"/)?.[1];
if(!frameRaw||movie.includes("data-live-error="))throw Error("M0 live same-world temporal capture failed");
const series=JSON.parse(frameRaw.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
if(series.length!==4||series[0].tick!==0||series[3].tick!==240)throw Error("M0 time-series source not valid");
console.log("M0 FRAMES REAL TICKS "+JSON.stringify(series.map(p=>({tick:p.tick,
 actorPositions:p.actors.map(a=>({kind:a.kind,x:a.x,y:a.y})),bytes:p.frame.length}))));
console.log("M0 FRAME-240 "+series[3].frame);

const fairDom=execFileSync(chrome,["--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage",
 "--virtual-time-budget=30000","--dump-dom",
 url+(url.includes("?")?"&":"?")+"fairm0=1"],
 {encoding:"utf8",timeout:100000,maxBuffer:16*1024*1024});
const fairRaw=fairDom.match(/data-m0-fair="([^"]*)"/)?.[1];
if(!fairRaw||fairDom.includes("data-live-error="))throw Error("M0 matched-mass rigid control failed");
const fair=JSON.parse(fairRaw.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
if(fair.cases.length!==12)throw Error("M0 incomplete matched-envelope control");
console.log("M0 RIGID SURROGATE "+JSON.stringify(fair));
