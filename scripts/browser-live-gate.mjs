import {execFileSync} from "node:child_process";
const chrome=process.env.CHROME_BIN,url=process.argv[2];
if(!chrome||!url)throw Error("Z1 needs Chrome and local URL");
function read(address,budget=9000){
 const html=execFileSync(chrome,["--headless=new","--no-sandbox","--disable-gpu",
  "--disable-dev-shm-usage","--virtual-time-budget="+budget,"--dump-dom",address],
  {encoding:"utf8",timeout:95000,maxBuffer:5*1024*1024});
 const get=name=>html.match(new RegExp('data-'+name+'="([^"]*)"'))?.[1];
 if(get("live")!=="yes"||get("live-error"))
   throw Error("Z1 could not boot: "+get("live-error"));
 return get;
}
read(url,2800);
const raw=read(url+(url.includes("?")?"&":"?")+"contactz1=1",23000)("contactz1");
if(!raw)throw Error("Z1 contact-only observation missing");
const result=JSON.parse(raw.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
console.log("Z1 CONTACT-ONLY WHOLE TEST "+JSON.stringify(result));

const neighborhoodRaw=read(url+(url.includes("?")?"&":"?")+"stabilityz1=1",26000)("stabilityz1");
if(!neighborhoodRaw)throw Error("Z1 cross-position counterfactual not emitted");
const neighborhood=JSON.parse(neighborhoodRaw.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
console.log("Z1 ROBUST CONTACT NEIGHBORHOOD "+JSON.stringify(neighborhood));

const chainRaw=read(url+(url.includes("?")?"&":"?")+"chainz1=1",37000)("chainz1");
if(!chainRaw)throw Error("Z1 continuous two-body contact chain not emitted");
const chain=JSON.parse(chainRaw.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
console.log("Z1 TWO-BODY CONTACT-ONLY CONTINUATION "+JSON.stringify(chain));

const {readFileSync}=await import("node:fs");
for(const [label,suffix] of [["initial",""],["pushed","?reviewz1=1"]]){
 const file="/tmp/z1-"+label+".png";
 execFileSync(chrome,["--headless=new","--no-sandbox","--disable-gpu",
   "--disable-dev-shm-usage","--hide-scrollbars","--window-size=1440,900",
   "--virtual-time-budget=3500","--screenshot="+file,url+suffix],
   {timeout:95000,maxBuffer:5*1024*1024});
 const png=readFileSync(file).toString("base64");
 for(let i=0;i<png.length;i+=1700)
   console.log("Z1_FRAME_"+label+"_CHUNK:"+png.slice(i,i+1700));
}
