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

const stageTwo=read(url+(url.includes("?")?"&":"?")+"secondaction=1",27000).get("secondaction");
if(!stageTwo)throw Error("Y1 second-actor action follow-up not emitted");
const parsed=JSON.parse(stageTwo.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
console.log("Y1 FOLLOW-UP SECOND-ACTOR ACTION "+JSON.stringify(parsed));

const rivalRaw=read(url+(url.includes("?")?"&":"?")+"rivals=1",35000).get("rivals");
if(!rivalRaw)throw Error("Y1 rival physical actions did not execute");
const rivals=JSON.parse(rivalRaw.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
console.log("Y1 RIVAL MATERIAL ACTIONS "+JSON.stringify(rivals));
