import { execFileSync } from "node:child_process";

const url = process.argv[2];
const chrome = process.env.CHROME_BIN;
if (!url) throw new Error("browser gate requires URL");
if (!chrome) throw new Error("CHROME_BIN is required");

const html = execFileSync(chrome, [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--virtual-time-budget=3500",
  "--dump-dom",
  url
], {
  encoding: "utf8",
  timeout: 20000,
  maxBuffer: 8 * 1024 * 1024
});

if (!html.includes("Material Agency Yard")) {
  throw new Error("Material Agency Yard title missing from emitted artifact");
}
if (!html.includes('data-combat-lab-ready="true"')) {
  throw new Error("runtime never reached ready state");
}
const match = html.match(/data-active-bodies="(\d+)"/);
if (!match || Number(match[1]) < 5) {
  throw new Error("expected persistent material bodies were not created");
}
console.log("Material Agency Yard browser gate PASS; bodies=" + match[1]);
