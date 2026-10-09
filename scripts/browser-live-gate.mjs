import {execFileSync} from "node:child_process";
const chrome=process.env.CHROME_BIN,url=process.argv[2];
if(!chrome||!url)throw Error("Emitted Chrome X0 gate needs CHROME_BIN and URL");
function visit(path,budget=10000){
 const dom=execFileSync(chrome,["--headless=new","--no-sandbox","--disable-gpu",
   "--disable-dev-shm-usage","--virtual-time-budget="+budget,
   "--dump-dom",path],{timeout:95000,encoding:"utf8",
     maxBuffer:12*1024*1024});
 const get=name=>dom.match(new RegExp('data-'+name+'="([^"]*)"'))?.[1];
 if(get("live")!=="yes"||get("live-error")){
   throw Error("X0 emitted browser FAIL: "+get("live-error")+" boot="+get("live")+
     " dom last="+dom.slice(-700));
 }
 return {dom,get};
}
const normal=visit(url,4500);
console.log("X0 ACTUAL BROWSER PHYSICS BOOT PASS · DOM "+normal.dom.length);
const probe=visit(url+(url.includes("?")?"&":"?")+"probe=1",23000);
const raw=probe.get("probe");
if(!raw)throw Error("X0 whole-world Rapier control probe missing");
const value=JSON.parse(raw.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
console.log("X0 WHOLE WORLD CAUSAL EVIDENCE: "+JSON.stringify(value));
if(!value.portedStartScene||!value.invalidSceneRejected)
  throw Error("X0 initial-world authoring claim failed");
if(value.defaultActors<3||value.defaultMatter<5)
  throw Error("X0 is only a staged object fixture, not a material commons");
