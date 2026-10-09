import { execFileSync } from "node:child_process";
const chrome=process.env.CHROME_BIN, url=process.argv[2];
if(!chrome||!url)throw Error("Need CHROME_BIN and emitted artifact URL");
function visit(location,budget=null){
 const args=["--headless=new","--no-sandbox","--disable-gpu",
   "--disable-dev-shm-usage"];
 if(budget!==null)args.push("--virtual-time-budget="+budget);
 args.push("--dump-dom",location);
 const dom=execFileSync(chrome,args,
   {timeout:75000,encoding:"utf8",maxBuffer:12*1024*1024});
 const grab=(name)=>dom.match(new RegExp('data-'+name+'="([^"]*)"'))?.[1];
 if(grab("lab-ready")!=="true" || grab("lab-error")){
   throw Error("Browser runtime not ready: ready="+grab("lab-ready")+
     " error="+grab("lab-error")+" bytes="+dom.length);
 }
 return {dom,grab};
}
const ready=visit(url,4800);
console.log("Integrated Organism Field emitted browser boot PASS; bytes="+ready.dom.length);
const ui=visit(url+(url.includes("?")?"&":"?")+"uiProbe=1",4500);
if(ui.grab("ui-probe")!=="pass")
  throw Error("Selected morphology UI FAIL: "+ui.grab("lab-error"));
console.log("SELECTABLE ORGANISM UI: "+ui.grab("ui-evidence"));
console.log("AUTONOMY/POSSESSION UI: "+(ui.grab("possession-ui")||"not exposed"));
const probe=visit(url+(url.includes("?")?"&":"?")+"pressureProbe=1",9000);
if(probe.grab("pressure-probe")!=="pass")
  throw Error("Physical pressure FAIL: "+probe.grab("pressure-probe")+
    " detail="+probe.grab("pressure-detail"));
console.log("Integrated physical pressure PASS: "+probe.grab("pressure-detail"));

console.log("Matched-drive morphology OBSERVATION: "+(probe.grab("morph-evidence")||"not exposed"));
console.log("Paired-world CAUSAL NULL: "+(probe.grab("causal-null")||"not exposed"));
console.log("Reciprocal MATERIAL GRIP: "+(probe.grab("grip-evidence")||"not exposed"));
console.log("PHYSICAL GATE: "+(probe.grab("gate-evidence")||"not exposed"));
console.log("DISTRIBUTED DRIVE CONTRAST: "+(probe.grab("segment-evidence")||"not exposed"));
console.log("INTERNAL-STROKE CRAWL CONTRAST: "+(probe.grab("inchworm-evidence")||"not exposed"));
console.log("PORTABLE POSED SCENE: "+(probe.grab("scene-evidence")||"not exposed"));
console.log("SHARED-WORLD WORM CAUSAL NULL: "+(probe.grab("integrated-worm")||"not exposed"));
console.log("NONDESTRUCTIVE LIVE UNDO: "+(probe.grab("live-undo")||"not exposed"));
console.log("MIXED PHYSICAL CROWD: "+(probe.grab("crowd-evidence")||"not exposed"));
console.log("PHYSICAL SOMATIC CONTACT A/B: "+(probe.grab("somatic-evidence")||"not exposed").replaceAll("&quot;",'"'));
console.log("FINITE GROUNDED BRACING A/B: "+(probe.grab("brace-evidence")||"not exposed").replaceAll("&quot;",'"'));
console.log("PAUSED WORLD REPOSITION A/B: "+(probe.grab("pose-evidence")||"not exposed").replaceAll("&quot;",'"'));
console.log("OPEN MATERIAL FIELD OBSERVATION: "+(probe.grab("playground-evidence")||"not exposed").replaceAll("&quot;",'"'));
console.log("AUTONOMOUS BODY BRACE A/B: "+(probe.grab("spontaneous-brace")||"not exposed").replaceAll("&quot;",'"'));


// TEMPORARY VISUAL AUDIT (isolated draft branch only).
// Browser images are captured after WASM boot with headless Chrome, then
// encoded into the Actions log solely for immediate agent review. Remove
// this block after actual image inspection; no screenshots or private state
// should become a permanent CI obligation.
if(process.env.CI){
  const {readFileSync}=await import("node:fs");
  for(const [label,suffix] of [
    ["original",""],
    ["footing","?uiProbe=1"]
  ]){
    const file="/tmp/combat-lab-visual-"+label+".png";
    const dest=url+suffix;
    execFileSync(chrome,["--headless=new","--no-sandbox","--disable-gpu",
      "--disable-dev-shm-usage","--window-size=1440,900",
      "--force-device-scale-factor=1",
      "--virtual-time-budget=7000","--screenshot="+file,dest],
      {timeout:75000,encoding:"utf8",maxBuffer:6*1024*1024});
    console.log("VISUAL_AUDIT_"+label.toUpperCase()+":"+
      readFileSync(file).toString("base64"));
  }
}
