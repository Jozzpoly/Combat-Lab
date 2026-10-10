import {execFileSync} from "node:child_process";
const chrome=process.env.CHROME_BIN,url=process.argv[2];
if(!chrome||!url)throw Error("S2 needs real headless Chromium + local URL");
function read(page,budget=25000){
 let diagnostic="";
 for(let attempt=0;attempt<3;attempt++){
   const html=execFileSync(chrome,["--headless=new","--no-sandbox",
     "--disable-gpu","--disable-dev-shm-usage",
     "--virtual-time-budget="+(budget+attempt*6000),"--dump-dom",page],
     {encoding:"utf8",maxBuffer:8*1024*1024,timeout:95000});
   const get=name=>html.match(new RegExp('data-'+name+'="([^"]*)"'))?.[1];
   if(get("live-error"))throw Error("S2 actual app error: "+get("live-error"));
   if(get("live")==="yes")return get;
   diagnostic="attempt "+(attempt+1)+" body="+
     (html.match(/<body[^>]*>/i)?.[0]||"(missing body)").slice(0,350)+
     " length="+html.length;
   console.log("S2 BROWSER STARTUP NOT YET READY: "+diagnostic);
 }
 throw Error("S2 browser never indicated real WASM-ready state: "+diagnostic);
}
read(url,5500);
const raw=read(url+(url.includes("?")?"&":"?")+"probe=1")("support");
if(!raw)throw Error("S2 comparative friction/normal-force probes missing");
const result=JSON.parse(raw.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
console.log("S2 GROUNDED SUPPORT ABLA­TION "+JSON.stringify(result));

const ui=read(url+(url.includes("?")?"&":"?")+"uiprobe=1",9500)("uiprobe");
if(!ui)throw Error("S2 UI physical controls missing");
console.log("S2 REAL UI CHECK "+JSON.stringify(
  JSON.parse(ui.replaceAll("&quot;",'"').replaceAll("&amp;","&"))));

const {readFileSync}=await import("node:fs");
for(const [label,part] of [["start",""],["operated","?visual=1"]]){
 const where="/tmp/combat-s2-"+label+".png";
 execFileSync(chrome,["--headless=new","--no-sandbox","--disable-gpu",
   "--disable-dev-shm-usage","--hide-scrollbars","--window-size=1440,900",
   "--virtual-time-budget=11000","--screenshot="+where,url+part],
   {encoding:"utf8",timeout:95000,maxBuffer:5*1024*1024});
 const b64=readFileSync(where).toString("base64");
 for(let j=0;j<b64.length;j+=1900)
   console.log("S2_IMAGE_"+label+"_CHUNK:"+b64.slice(j,j+1900));
}
