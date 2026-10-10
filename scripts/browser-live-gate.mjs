import {execFileSync} from "node:child_process";
const chrome=process.env.CHROME_BIN,url=process.argv[2];
if(!chrome||!url)throw Error("K1 requires real Chrome and local URL");
const read=(page,budget=9000)=>{
 const html=execFileSync(chrome,["--headless=new","--no-sandbox","--disable-gpu",
   "--disable-dev-shm-usage","--virtual-time-budget="+budget,"--dump-dom",page],
   {encoding:"utf8",timeout:95000,maxBuffer:6*1024*1024});
 const get=key=>html.match(new RegExp('data-'+key+'="([^"]*)"'))?.[1];
 if(get("live")!=="yes"||get("live-error"))
  throw Error("K1 browser boot failed: "+get("live-error"));
 return get;
};
read(url,2500);
const raw=read(url+(url.includes("?")?"&":"?")+"posturek1=1",36000)("posturek1");
if(!raw)throw Error("K1 actual solver control missing");
const data=JSON.parse(raw.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
console.log("K1 POSTURE AND RIGID SURROGATE "+JSON.stringify(data));

const switchRaw=read(url+(url.includes("?")?"&":"?")+"switchk1=1",60000)("switchk1");
if(!switchRaw)throw Error("K1 live posture switch was not observed");
const switchCase=JSON.parse(switchRaw.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
console.log("K1 TIMED POSTURE CONTROLS "+JSON.stringify(switchCase));

const keyRaw=read(url+(url.includes("?")?"&":"?")+"keyk1=1",8000)("keyk1");
if(!keyRaw)throw Error("K1 browser keyboard handoff missing");
console.log("K1 REAL UI POSTURE CONTROL "+JSON.stringify(
  JSON.parse(keyRaw.replaceAll("&quot;",'"').replaceAll("&amp;","&"))));
const {readFileSync}=await import("node:fs");
for(const [label,ending] of [["start",""],["after","?visualk1=1"]]){
 const p="/tmp/k1-"+label+".png";
 execFileSync(chrome,["--headless=new","--no-sandbox","--disable-gpu",
  "--disable-dev-shm-usage","--hide-scrollbars","--window-size=1440,900",
  "--virtual-time-budget=4500","--screenshot="+p,url+ending],
  {timeout:95000,maxBuffer:5*1024*1024});
 const b=readFileSync(p).toString("base64");
 for(let i=0;i<b.length;i+=1800)
  console.log("K1_IMAGE_"+label+"_CHUNK:"+b.slice(i,i+1800));
}
