// Source-bound Chromium gate. This is a live browser/actual WASM check, not
// product-level evidence, FPS, Owner playtest, or a rendered mockup.
import {execFileSync} from "node:child_process";
import {writeFileSync,mkdirSync} from "node:fs";
import {resolve} from "node:path";
const base=process.argv[2]??"http://127.0.0.1:4173/";
const chrome=process.env.CHROME_BIN??"google-chrome";
const out=resolve("k1-evidence");mkdirSync(out,{recursive:true});
const common=["--headless=new","--no-sandbox","--disable-gpu",
 "--disable-dev-shm-usage","--hide-scrollbars","--window-size=1440,940",
 "--virtual-time-budget=8000"];
const run=(url,extra=[])=>execFileSync(chrome,[...common,...extra,url],
 {encoding:"utf8",timeout:95000,maxBuffer:12*1024*1024,stdio:["ignore","pipe","pipe"]});
const query=new URL(base);
query.searchParams.set("k1probe","");
const dom=run(query.toString(),["--dump-dom"]);
if(!/data-k1-probe="PASS"/.test(dom)||!/data-k1-cases="9"/.test(dom)||!/data-k1-runtime="ready"/.test(dom)){
 const error=(dom.match(/data-k1-(?:boot-error|error)="([^"]*)"/)||[])[1];
 const body=(dom.match(/<body[^>]*>/)||[])[0];
 throw Error("K1 live WASM/browser failed: "+(error??body??dom.slice(-1100)));
}
const raw=(dom.match(/data-k1-report="([^"]*)"/)||[])[1];
if(!raw)throw Error("K1 no actual source report");
const report=JSON.parse(decodeURIComponent(raw));
if(report.cases.length!==9||report.cases.some(c=>
 !c.after.finite||c.after.externalShots!==1||c.after.driveImpulse!==0||
 c.after.boundedPanelImpulse!==0||c.before.witnessTravel!==0||
 c.after.shotStates.length!==1))
 throw Error("Invalid K1 sourced counterfactual");
writeFileSync(resolve(out,"k1-sourced-counterfactual.json"),JSON.stringify(report,null,2));
for(const tick of [0,65,100]){
 const url=new URL(base);url.searchParams.set("k1frame",String(tick));
 run(url.toString(),["--screenshot="+resolve(out,"k1-source-t"+tick+".png")]);
}
const summary=report.cases.map(c=>({
 kind:c.kind,sourceY:c.interceptY,
 witnessTravel:c.after.witnessTravel,
 projectile:c.after.shotStates[0].p,
 panelAngle:c.after.panelAngle
}));
console.log("K1 actual deterministic Rapier2D: 9/9 physics cases (source mechanics only).");
console.log(JSON.stringify(summary));
console.log("Raw source-bound screenshots and full source JSON: k1-evidence/");


const k2url=new URL(base);k2url.searchParams.set("k2probe","");
const k2dom=run(k2url.toString(),["--dump-dom"]);
const k2err=(k2dom.match(/data-k2-error="([^"]*)"/)||[])[1];
if(!/data-k2-probe="PASS"/.test(k2dom)||!/data-k2-cases="30"/.test(k2dom))
 throw Error("K2 true Chromium source failed: "+(k2err||k2dom.match(/<body[^>]*>/)?.[0]||"no body"));
const encoded=(k2dom.match(/data-k2-report="([^"]*)"/)||[])[1];
if(!encoded)throw Error("K2 no actual source report");
const k2=JSON.parse(decodeURIComponent(encoded));
if(k2.cases.length!==30||k2.cases.some(x=>
 !x.finite||x.shootSource!==1||x.rootDrive!==0||
 x.kind==="hinged"&&x.policy==="passive"&&x.hingeTorqueTotal!==0||
 x.kind==="rigid"&&x.policy==="passive"&&x.rigidTorqueTotal!==0))
 throw Error("K2 source physical provenance failed");
const passive=k2.cases.filter(x=>x.policy==="passive");
for(const x of passive){
 const twin=passive.find(y=>y.kind===x.kind&&y.lineY===x.lineY&&y.angle===-x.angle);
 if(!twin||twin.witnessTravelFromShot!==x.witnessTravelFromShot||
 twin.projectileAfter.p.x!==x.projectileAfter.p.x||
 twin.rearMatterTravelTotal!==x.rearMatterTravelTotal)
  throw Error("K2 action-off negative null not invariant: "+JSON.stringify(x));
}
writeFileSync(resolve(out,"k2-actual-action-counterfactual.json"),JSON.stringify(k2,null,2));
console.log("K2 true Chromium source completed: 30/30 cases (does NOT imply morphology wins).");
console.log(JSON.stringify(k2.cases.map(x=>({
 kind:x.kind,policy:x.policy,angle:x.angle,lineY:x.lineY,
 shield:x.panelAngleAtShot,rootAngle:x.rootAngleAtShot,
 rear:x.rearMatterTravelTotal,witness:x.witnessTravelFromShot,
 shotX:x.projectileAfter.p.x
}))));
