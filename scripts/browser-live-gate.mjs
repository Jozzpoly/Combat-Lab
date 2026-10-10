import {execFileSync} from "node:child_process";
const chrome=process.env.CHROME_BIN,url=process.argv[2];
if(!chrome||!url)throw Error("S2 needs real headless Chromium + local URL");
function read(page,budget=25000){
 const html=execFileSync(chrome,["--headless=new","--no-sandbox","--disable-gpu",
   "--disable-dev-shm-usage","--virtual-time-budget="+budget,"--dump-dom",page],
   {encoding:"utf8",maxBuffer:8*1024*1024,timeout:95000});
 const get=name=>html.match(new RegExp('data-'+name+'="([^"]*)"'))?.[1];
 if(get("live")!=="yes"||get("live-error"))
  throw Error("S2 physical browser did not boot: "+get("live-error"));
 return get;
}
read(url,5500);
const raw=read(url+(url.includes("?")?"&":"?")+"probe=1")("support");
if(!raw)throw Error("S2 comparative friction/normal-force probes missing");
const result=JSON.parse(raw.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
console.log("S2 GROUNDED SUPPORT ABLA­TION "+JSON.stringify(result));

const ui=read(url+(url.includes("?")?"&":"?")+"uiprobe=1",7500)("uiprobe");
if(!ui)throw Error("S2 UI physical controls missing");
console.log("S2 REAL UI CHECK "+JSON.stringify(
  JSON.parse(ui.replaceAll("&quot;",'"').replaceAll("&amp;","&"))));
