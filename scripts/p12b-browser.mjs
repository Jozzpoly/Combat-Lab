// P12b actual emitted Chromium/WASM solver, no bare Node simulation.
import {execFileSync} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
const base=new URL("p10.html",process.argv[2]||"http://127.0.0.1:4173/");
const u=new URL(base);u.searchParams.set("p12baudit","1");
const bin=process.env.CHROME_BIN||"chromium";
const html=execFileSync(bin,["--headless=new","--no-sandbox","--disable-gpu",
 "--disable-dev-shm-usage","--window-size=1520,970","--virtual-time-budget=18000",
 "--dump-dom",u.toString()],{encoding:"utf8",timeout:180000,
 maxBuffer:22*1024*1024,stdio:["ignore","pipe","pipe"]});
function get(name){return (html.match(new RegExp('data-'+name+'="([^"]*)"'))||[])[1];}
if(get("p12b-audit")!=="PASS"||get("p12b-worlds")!=="18")
 throw Error("P12b source error: "+(get("p12b-error")||"missing full 18-world witness"));
const decode=x=>decodeURIComponent(x.replaceAll("&quot;",'"').replaceAll("&amp;","&"));
const report=JSON.parse(decode(get("p12b-report")));
if(report.worlds!==18||report.contrast.length!==18)
 throw Error("P12b source matrix incomplete");
mkdirSync("p12b-evidence",{recursive:true});
writeFileSync(resolve("p12b-evidence/p12b-source-momentum-accounting.json"),
 JSON.stringify(report,null,2));
console.log("P12b 18 exact source worlds true Rapier: contact vs CCD/solver:");
for(const row of report.contrast)console.log("P12B "+JSON.stringify(row));
console.log(report.interpretation);
