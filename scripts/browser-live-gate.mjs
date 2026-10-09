import {execFileSync} from "node:child_process";
const chrome=process.env.CHROME_BIN,url=process.argv[2];
if(!chrome||!url)throw Error("Browser check needs CHROME_BIN and built URL");
function visit(path,budget=9000){
 const dom=execFileSync(chrome,["--headless=new","--no-sandbox",
   "--disable-gpu","--disable-dev-shm-usage",
   "--virtual-time-budget="+budget,"--dump-dom",path],
   {encoding:"utf8",timeout:75000,maxBuffer:12*1024*1024});
 const get=name=>dom.match(new RegExp('data-'+name+'="([^"]*)"'))?.[1];
 if(get("live")!=="yes"||get("live-error"))
   throw Error("EMITTED BROWSER BOOT FAILED "+get("live-error")+
     " live="+get("live"));
 return {dom,get};
}
const ready=visit(url,4000);
console.log("NEW INDEPENDENT EMBODIED FIELD boot PASS, DOM="+ready.dom.length);
const probe=visit(url+(url.includes("?")?"&":"?")+"probe=1",12000);
if(probe.get("scene-ui")!=="actual capture/load/reset PASS")
  throw Error("Live Owner-style capture/import/reset UI FAIL");
console.log("PORTABLE MATERIAL WORLD: "+probe.get("scene-ui"));
const json=probe.get("probe-result");
if(!json)throw Error("PHYSICAL FIELD PROBE MISSING (maybe WASM failure)");
const parsed=JSON.parse(json.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
console.log("REAL EFFECTOR BODY / MATERIAL CAUSAL OBSERVATION: "+
  JSON.stringify(parsed));
const sweep=probe.get("affordance-sweep");
if(!sweep)throw Error("missing independent physical affordance sweep");
const contrast=JSON.parse(sweep.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
console.log("ARTICULATED TRANSPORT MATERIAL EDGE-CASES: "+JSON.stringify(contrast));
const arms=probe.get("independent-arms");
if(!arms)throw Error("missing independent physical arm outcomes");
const independent=JSON.parse(arms.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
console.log("INDEPENDENT PHYSICAL ARM OUTCOMES: "+JSON.stringify(independent));
if(probe.get("poke-ui")!=="finite impulse delivered via actual pointer drag")
  throw Error("physical research impulse pointer UI did not apply");
const impulse=probe.get("impulse-evidence");
if(!impulse)throw Error("missing physically observed point impact evidence");
console.log("EXPERIMENTER POINT IMPULSE: "+JSON.stringify(
 JSON.parse(impulse.replaceAll("&quot;",'"').replaceAll("&amp;","&"))));




// TEMPORARY rendering review: remove immediately after reading actual image.
if(process.env.CI){
  const {readFileSync}=await import("node:fs");
  const file="/tmp/combat-effector-new-ui.png";
  execFileSync(chrome,["--headless=new","--no-sandbox","--disable-gpu",
    "--disable-dev-shm-usage","--window-size=1440,900",
    "--force-device-scale-factor=1","--virtual-time-budget=6200",
    "--screenshot="+file,url],{timeout:75000,encoding:"utf8",
     maxBuffer:6*1024*1024});
  console.log("EFF_INDEPENDENT_VISUAL_AUDIT:"+readFileSync(file).toString("base64"));
}
