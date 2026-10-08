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
  const error = html.match(/data-combat-lab-error="([^"]*)"/)?.[1];
  const summary = html.match(/<span id="runtime-summary">([^<]*)<\/span>/)?.[1];
  const state = html.match(/data-combat-lab-ready="([^"]*)"/)?.[1];
  throw new Error("runtime never reached ready state; state=" + String(state) +
    "; runtimeError=" + (error ?? "not reported") +
    "; hud=" + (summary ?? "not rendered") +
    "; documentBytes=" + html.length);
}
const match = html.match(/data-active-bodies="(\d+)"/);
if (!match || Number(match[1]) < 5) {
  throw new Error("expected persistent material bodies were not created");
}
const physicsSteps = html.match(/data-physics-steps="(\d+)"/);
if (!physicsSteps || Number(physicsSteps[1]) < 1) {
  throw new Error("world booted but did not complete a physical step; recorded=" +
    (physicsSteps?.[1] ?? "absent"));
}
console.log("Material Agency Yard browser gate PASS; bodies=" + match[1] +
  "; physicsSteps=" + physicsSteps[1]);

const pressureHtml = execFileSync(chrome, [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--virtual-time-budget=6500",
  "--dump-dom",
  url + (url.includes("?") ? "&" : "?") + "pressureProbe=1"
], {
  encoding: "utf8",
  timeout: 30000,
  maxBuffer: 8 * 1024 * 1024
});
const state = pressureHtml.match(/data-pressure-probe="([^"]*)"/)?.[1];
const failure = pressureHtml.match(/data-pressure-failure="([^"]*)"/)?.[1];
const count = pressureHtml.match(/data-pressure-case-count="(\d+)"/)?.[1];
if (state !== "pass") {
  throw new Error("material pressure " + String(state ?? "not reached") +
    "; failures=" + (failure ?? "not reported") +
    "; cases=" + (count ?? "unknown"));
}
console.log("Material Agency Yard live physics pressure PASS; cases=" + count);
