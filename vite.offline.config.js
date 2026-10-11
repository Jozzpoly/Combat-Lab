// P10c: independent single-input OFFLINE packaging experiment only.
// Does not change production/index multipage output or public branch.
import {defineConfig} from "vite";
import {resolve} from "node:path";
export default defineConfig({
 base:"./",
 build:{
  outDir:"offline-dist",
  emptyOutDir:true,
  assetsInlineLimit:100*1024*1024,
  rollupOptions:{
   input:resolve("p10.html"),
   output:{
    inlineDynamicImports:true,
    entryFileNames:"assets/workshop.js",
    assetFileNames:"assets/[name][extname]"
   }
  }
 }
});
