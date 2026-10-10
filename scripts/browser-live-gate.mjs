import {execFileSync} from "node:child_process";
const chrome=process.env.CHROME_BIN,url=process.argv[2];
if(!chrome||!url)throw Error("Need Chromium binary and built URL");
const run=(query,budget=25000)=>{
 const html=execFileSync(chrome,["--headless=new","--no-sandbox","--disable-gpu",
  "--disable-dev-shm-usage","--virtual-time-budget="+budget,"--dump-dom",
  url+(url.includes("?")?"&":"?")+query],
  {encoding:"utf8",timeout:150000,maxBuffer:20*1024*1024});
 const get=n=>html.match(new RegExp('data-'+n+'="([^"]*)"'))?.[1];
 if(get("live")!=="yes"||get("live-error"))throw Error("G0 browser boot/solver failed: "+get("live-error")+
  " live="+get("live"));
 return {get,html};
};
const out=run("g0probe=1",60000);
const data=out.get("g0-probe");
if(!data)throw Error("No grounded-drive matrix emitted");
const j=JSON.parse(data.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
if(j.results?.length!==9)throw Error("Incomplete G0 predeclared matrix");
if(j.results.some(x=>!Number.isFinite(x.chassis.dx)))throw Error("Nonfinite result");
if(j.results.filter(x=>x.mode==="wheels").some(x=>x.rootImpulseSum!==0))
 throw Error("wheel branch contains illicit root force");
console.log("G0 CONTACT-SOURCED DRIVE PHYSICAL MATRIX "+JSON.stringify(j));
const raw=run("g0frames=1",8000),st=raw.get("g0-frames");
if(!st)throw Error("No real Chromium timeline");
const frames=JSON.parse(st.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
if(frames.length!==4||frames[0].tick!==0||frames[3].tick!==240)
 throw Error("Non-continuous G0 timeline");
console.log("G0 ONE-WORLD TIMELINE "+JSON.stringify(frames.map(x=>({
 tick:x.tick,x:x.source.chassis.x,groundImpulse:x.source.groundImpulse,
 rootForce:x.source.rootImpulseSum,bodyY:x.source.chassis.y,
 obstacleDX:x.source.obstacleDX}))));
console.log("G0 TRUE FRAME-0 "+frames[0].png);
console.log("G0 TRUE FRAME-240 "+frames[3].png);
