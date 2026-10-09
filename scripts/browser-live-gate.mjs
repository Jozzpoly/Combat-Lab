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
if(probe.get("rotate-ui")!=="paused physical crate rotated by actual Alt-pointer path")
  throw Error("direct physical pause rotation UI failed");
const pose=probe.get("pose-evidence");
if(!pose)throw Error("physical body/gate pose probe missing");
console.log("EDITABLE WORLD BODY & GATE POSES: "+JSON.stringify(
 JSON.parse(pose.replaceAll("&quot;",'"').replaceAll("&amp;","&"))));



// A bounded, randomized-by-seed whole-world material pressure run.
// It runs ONLY when requested, and is separate from narrow actuation fixtures.
// No measured frame time or human experience quality is inferred from this.
const trial=visit(url+(url.includes("?")?"&":"?")+"campaign=1",22000);
const report=trial.get("world-campaign");
if(!report)throw Error("material pressure campaign did not produce evidence");
const output=JSON.parse(report.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
if(output.results?.length!==6)throw Error("partial campaign data");
console.log("FREE-WORLD MATERIAL PRESSURE: "+JSON.stringify(output));


// ISOLATED FUTURE-WORLD HYPOTHESIS: no new environment, no product claim.
// A matched contact-responsive on/off test in *real emitted Rapier/WASM*.
const local=visit(url+(url.includes("?")?"&":"?")+"loopProbe=1",16000);
const payload=local.get("loop-evidence");
if(!payload)throw Error("contact-continuation preflight missing");
const observations=JSON.parse(payload.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
console.log("X0 LOCAL RESPONSE PREFLIGHT: "+JSON.stringify(observations));
