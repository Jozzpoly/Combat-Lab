// Bundle current P10b Vite HTML + source JS/CSS into a standalone owner file.
// Never publish or replace public pages. Keep all code unmodified, inline only.
// The Chrome file:// test is essential: generating bytes alone is NOT success.
import {readFileSync,writeFileSync,mkdirSync,statSync} from "node:fs";
import {resolve,dirname} from "node:path";
const root=resolve("offline-dist");
let html=readFileSync(resolve(root,"p10.html"),"utf8");
let scripts=0,styles=0;
function local(p){
 if(!/^\.?\/?assets\/[A-Za-z0-9_.-]+$/.test(p))
  throw Error("P10c unresolved or unsafe external local asset "+p);
 return resolve(root,p.replace(/^\.\//,""));
}
html=html.replace(/<script\b[^>]*>\s*<\/script>/gi,m=>m);
html=html.replace(/<script\b[^>]*><\/script>/gi,m=>{
 const src=m.match(/\bsrc="([^"]+)"/);
 if(!src)return m;
 const kind=m.match(/\btype="([^"]+)"/)?.[1];
 if(kind!=="module")throw Error("P10c unexpected external nonmodule script");
 const js=readFileSync(local(src[1]),"utf8");
 scripts++;
 // Closing script literal inside JS must not terminate HTML parser.
 return "<script type=\"module\">"+js.replace(/<\/script/gi,"<\\/script")+"</script>";
});
html=html.replace(/<link\b[^>]*>/gi,m=>{
 const href=m.match(/\bhref="([^"]+)"/);
 if(!href||!m.includes('rel="stylesheet"'))return m;
 const css=readFileSync(local(href[1]),"utf8");styles++;
 return "<style>"+css.replace(/<\/style/gi,"<\\/style")+"</style>";
});
if(scripts!==1||styles<1)throw Error("P10c expected exactly one bundled module script and at least one stylesheet; got "+scripts+"/"+styles);
if(/(?:src|href)=["'](?:\.\/)?assets\//.test(html)||/<link[^>]+rel="modulepreload"/i.test(html))
 throw Error("P10c unresolved asset reference/modulepreload remains");
if(/\bimport\s*\(\s*["'](?:\.\/|\/)assets\//.test(html))
 throw Error("P10c dynamic chunk escaped bundling");
// The experiment uses no network service, but do NOT assert this check
// catches every possible dynamically constructed URL; real file:// test must.
html=html.replace("</head>",'<meta name="combat-lab-offline-source" content="P10b isolated offline candidate; no deployment; not Owner-qualified"/>\n</head>');
mkdirSync(resolve("offline-artifact"),{recursive:true});
for(const dest of [resolve(root,"p10.html"),resolve("offline-artifact","Combat-Lab-P10b-Offline.html")])
 writeFileSync(dest,html,"utf8");
console.log(JSON.stringify({offlineFile:"offline-artifact/Combat-Lab-P10b-Offline.html",
 bytes:statSync(resolve("offline-artifact","Combat-Lab-P10b-Offline.html")).size,
 inlinedModules:scripts,inlinedCss:styles,source:"real Vite-built P10b, no fake UI"}));
