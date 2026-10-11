// Build an actual single-file P10b bundle compatible with ordinary classic
// inline scripts, avoiding file:// ES-module origin restrictions.
// Only packaging transformation: import.meta becomes document.baseURI,
// top-level await is wrapped in an async IIFE, no physics or UI logic altered.
// Validate the EXACT bundled file in real Chromium before giving it to Owner.
import {readFileSync,writeFileSync,mkdirSync,statSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {resolve} from "node:path";
const root=resolve("offline-dist");
let html=readFileSync(resolve(root,"p10.html"),"utf8");
let scripts=0,styles=0,sourceJs=null;
function local(asset){
 if(!/^\.?\/?assets\/[A-Za-z0-9_.-]+$/.test(asset))
  throw Error("P10c unexpected asset "+asset);
 return resolve(root,asset.replace(/^\.\//,""));
}
html=html.replace(/<script\b[^>]*><\/script>/gi,tag=>{
 const src=tag.match(/\bsrc="([^"]+)"/);
 if(!src)return tag;
 const type=tag.match(/\btype="([^"]+)"/)?.[1];
 if(type!=="module")throw Error("Expected original emitted Vite module");
 if(sourceJs)throw Error("More than one source bundle entry");
 sourceJs=readFileSync(local(src[1]),"utf8");scripts++;
 return ""; // Move boot script after body DOM exists.
});
html=html.replace(/<link\b[^>]*>/gi,tag=>{
 const href=tag.match(/\bhref="([^"]+)"/);
 if(!href||!tag.includes('rel="stylesheet"'))return tag;
 const css=readFileSync(local(href[1]),"utf8");styles++;
 return "<style>"+css.replace(/<\/style/gi,"<\\/style")+"</style>";
});
if(scripts!==1||styles<1||!sourceJs)
 throw Error("P10c source module/CSS count mismatch "+scripts+"/"+styles);
// ESM-specific module URI for lazy Vite helper is no longer available.
// Bundle is ONE fully inlined chunk, so document.baseURI is the only
// genuine local base if the helper is ever invoked.
const code=sourceJs.replace(/import\.meta/g,"({url:document.baseURI})");
if(/\bimport\.meta\b/.test(code))throw Error("Unconverted module URI");
const classic="(async()=>{\n"+code+"\n})().catch(error=>{document.body.dataset.p10Error=String(error.stack||error);console.error(error);});";
writeFileSync(resolve(root,"packed-classic.cjs"),classic);
execFileSync(process.execPath,["--check",resolve(root,"packed-classic.cjs")],{stdio:"pipe"});
if(!html.includes("</body>"))throw Error("Missing HTML closing body");
html=html.replace("</body>","<script>"+classic.replace(/<\/script/gi,"<\\/script")+"</script>\n</body>");
if(/(?:src|href)=["'](?:\.\/)?assets\//.test(html)||
   /<link[^>]+rel="modulepreload"/i.test(html)||
   /<script[^>]+type="module"/i.test(html))
 throw Error("P10c unresolved assets or ESM-only script remains");
html=html.replace("</head>",'<meta name="combat-lab-offline-source" content="isolated P10b; real singlefile classic runtime; not Owner-approved gameplay"/>\n</head>');
mkdirSync(resolve("offline-artifact"),{recursive:true});
for(const dest of [resolve(root,"p10.html"),resolve("offline-artifact","Combat-Lab-P10b-Offline.html")])
 writeFileSync(dest,html,"utf8");
console.log(JSON.stringify({offlineFile:"offline-artifact/Combat-Lab-P10b-Offline.html",
 bytes:statSync(resolve("offline-artifact","Combat-Lab-P10b-Offline.html")).size,
 inlinedScripts:scripts,inlinedStyles:styles,
 parserCheck:"node --check classic wrapper PASS",
 source:"Real emitted Rapier/P10b source with packaging-only ESM shim"}));
