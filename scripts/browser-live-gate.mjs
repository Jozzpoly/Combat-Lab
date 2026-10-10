import {execFileSync} from "node:child_process";
const chrome=process.env.CHROME_BIN,url=process.argv[2];
if(!chrome||!url)throw Error("Y1 needs CHROME_BIN and local URL");
function read(path,budget=9000){
 const html=execFileSync(chrome,["--headless=new","--no-sandbox","--disable-gpu",
 "--disable-dev-shm-usage","--virtual-time-budget="+budget,"--dump-dom",path],
 {timeout:95000,encoding:"utf8",maxBuffer:5*1024*1024});
 const get=k=>html.match(new RegExp('data-'+k+'="([^"]*)"'))?.[1];
 if(get("live")!=="yes"||get("live-error"))
   throw Error("Y1 not physically booted: "+get("live-error")+" / "+html.slice(-300));
 return {get};
}
read(url,3500);
const r=read(url+(url.includes("?")?"&":"?")+"relational=1",15000).get("relational");
if(!r)throw Error("Y1 physical observation not emitted");
const x=JSON.parse(r.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
console.log("Y1 WHOLE-COMPOSITION OBSERVATION "+JSON.stringify(x));

const {readFileSync}=await import("node:fs");
for(const [name,suffix] of [["start",""],["t180","?vis180=1"]]){
 const dest="/tmp/y1-"+name+".png";
 execFileSync(chrome,["--headless=new","--no-sandbox","--disable-gpu",
   "--disable-dev-shm-usage","--hide-scrollbars","--window-size=1440,900",
   "--virtual-time-budget=4500","--screenshot="+dest,url+suffix],
   {timeout:95000,maxBuffer:3*1024*1024});
 const encoded=readFileSync(dest).toString("base64");
 console.log("Y1_SCREEN_"+name+"_BEGIN");
 for(let i=0;i<encoded.length;i+=1500)
   console.log("Y1_SCREEN_"+name+"_CHUNK:"+encoded.slice(i,i+1500));
 console.log("Y1_SCREEN_"+name+"_END");
}
