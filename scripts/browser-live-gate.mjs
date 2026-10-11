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
