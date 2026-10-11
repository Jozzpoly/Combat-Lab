// P10 is isolated: extra HTML entry does not alter index/public smoke semantics.
import {defineConfig} from "vite";
import {resolve} from "node:path";
export default defineConfig({
 build:{rollupOptions:{input:{
  main:resolve("index.html"),
  workshop:resolve("p10.html")
 }}}
});
