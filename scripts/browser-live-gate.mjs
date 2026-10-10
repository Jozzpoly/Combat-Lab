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

const rawOwner=read(url+(url.includes("?")?"&":"?")+"ownercheck=1",9500)("ownercheck");
if(!rawOwner)throw Error("Owner review UI flow did not emit results");
const owner=JSON.parse(rawOwner.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
if(!owner.pass)throw Error("Owner review UI flow FAILED");
console.log("OWNER REVIEW ACTUAL UI CHECK "+JSON.stringify(owner));
