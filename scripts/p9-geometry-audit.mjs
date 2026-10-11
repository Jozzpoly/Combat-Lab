// Print and preserve fully executed source-derived geometric A/B, NOT human feel.
import {mkdirSync,writeFileSync} from "node:fs";
import {p9Audit} from "../src/p9-geometry-audit.js";
const result=p9Audit();
if(result.worlds!==40)throw Error("P9 expected 40 actual physical worlds");
mkdirSync("p9-evidence",{recursive:true});
writeFileSync("p9-evidence/40-real-rapier-worlds.json",JSON.stringify(result,null,2));
console.log("P9 REAL RAPIER controlled geometric cases: "+result.worlds);
for(const x of result.summary){
 console.log(JSON.stringify(x));
}
console.log("P9 methodological limit: "+result.limitation);
