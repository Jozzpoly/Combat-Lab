import {spawn} from "node:child_process";
import {writeFile} from "node:fs/promises";
import {setTimeout as sleep} from "node:timers/promises";

const target=process.argv[2] || "http://127.0.0.1:4173/";
const chromeBin=process.env.CHROME_BIN;
const screenshotPath=process.env.SCREENSHOT_PATH || "";
const extremeScreenshotPath=process.env.EXTREME_SCREENSHOT_PATH || "";
const compactScreenshotPath=process.env.COMPACT_SCREENSHOT_PATH || "";
if(!chromeBin) throw new Error("CHROME_BIN is required");

const port=9222;
const profile=`/tmp/combat-lab-chrome-${process.pid}`;
const chrome=spawn(chromeBin,[
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  "about:blank"
],{stdio:["ignore","ignore","pipe"]});

let stderr="";
chrome.stderr.on("data",chunk=>{ stderr+=chunk.toString(); });

async function waitForJsonList(){
  for(let i=0;i<220;i++){
    try{
      const r=await fetch(`http://127.0.0.1:${port}/json/list`);
      if(r.ok){
        const pages=await r.json();
        const page=pages.find(p=>p.type==="page");
        if(page?.webSocketDebuggerUrl) return page;
      }
    }catch{}
    await sleep(100);
  }
  throw new Error("Chrome DevTools endpoint did not become ready");
}

function createCdp(wsUrl){
  const ws=new WebSocket(wsUrl);
  let nextId=1;
  const pending=new Map();

  ws.addEventListener("message",event=>{
    const msg=JSON.parse(event.data);
    if(!msg.id) return;
    const p=pending.get(msg.id);
    if(!p) return;
    pending.delete(msg.id);
    if(msg.error) p.reject(new Error(JSON.stringify(msg.error)));
    else p.resolve(msg.result);
  });

  const opened=new Promise((resolve,reject)=>{
    ws.addEventListener("open",resolve,{once:true});
    ws.addEventListener("error",reject,{once:true});
  });

  return {
    async send(method,params={}){
      await opened;
      const id=nextId++;
      const promise=new Promise((resolve,reject)=>pending.set(id,{resolve,reject}));
      ws.send(JSON.stringify({id,method,params}));
      return promise;
    },
    close(){ ws.close(); }
  };
}

let cdp;
async function captureScreenshot(path=screenshotPath){
  if(!cdp || !path) return;
  const shot=await cdp.send("Page.captureScreenshot",{format:"png",fromSurface:true});
  await writeFile(path,Buffer.from(shot.data,"base64"));
}

try{
  const page=await waitForJsonList();
  cdp=createCdp(page.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride",{
    width:1600,height:1000,deviceScaleFactor:1,mobile:false
  });
  await cdp.send("Page.navigate",{url:target});

  async function evaluate(expression){
    const result=await cdp.send("Runtime.evaluate",{
      expression,returnByValue:true,awaitPromise:true
    });
    if(result.exceptionDetails){
      throw new Error(`browser evaluation failed: ${JSON.stringify(result.exceptionDetails)}`);
    }
    return result.result?.value;
  }

  async function waitFor(label,predicate,{timeout=5000,interval=80}={}){
    const deadline=Date.now()+timeout;
    let lastValue;
    while(Date.now()<deadline){
      lastValue=await predicate();
      if(lastValue) return lastValue;
      await sleep(interval);
    }
    throw new Error(`${label} timed out; last=${JSON.stringify(lastValue)}`);
  }

  await waitFor("live B0 Workbench heartbeat",async()=>{
    return evaluate(`(()=>{
      const r=window.__combatLabRuntime;
      return !!r && r.state==="RUNNING" && r.frames>=8 && r.elapsed>0.03 && !r.error &&
        r.activeExperimentId==="load-envelope-field-b0" &&
        !!document.querySelector('[data-param-id="envelope"]') &&
        !!document.querySelector('[data-param-id="bodyMass"]') &&
        !!document.querySelector('[data-param-id="loadMass"]') &&
        !!document.querySelector('[data-param-id="forceMultiplier"]');
    })()`);
  });

  const first=await evaluate(`({
    title:document.querySelector("#experiment-title")?.textContent,
    state:window.__combatLabRuntime?.state,
    frames:window.__combatLabRuntime?.frames,
    elapsed:window.__combatLabRuntime?.elapsed,
    experiment:window.__combatLabRuntime?.activeExperimentId,
    player:window.__combatLabRuntime?.snapshot?.player,
    source:document.querySelector("#build-id")?.textContent
  })`);

  if(first.title!=="Load / Envelope Field B0") throw new Error(`wrong B0 title: ${first.title}`);

  // Focus isolation: typing a parameter shortcut-like key while editing must not drive the world.
  await evaluate(`document.querySelector('[data-param-id="bodyMass"] .parameter-number').focus()`);
  const beforeFocusedKey=await evaluate("window.__combatLabRuntime?.snapshot?.player?.x");
  await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",code:"KeyD",key:"d",windowsVirtualKeyCode:68});
  await sleep(140);
  await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",code:"KeyD",key:"d",windowsVirtualKeyCode:68});
  const afterFocusedKey=await evaluate("window.__combatLabRuntime?.snapshot?.player?.x");
  if(Math.abs(Number(afterFocusedKey)-Number(beforeFocusedKey))>0.5){
    throw new Error(`focused Inspector leaked movement: before=${beforeFocusedKey} after=${afterFocusedKey}`);
  }
  await evaluate("document.activeElement?.blur?.()");

  async function setNumber(id,value){
    await evaluate(`(()=>{
      const input=document.querySelector('[data-param-id="${id}"] .parameter-number');
      input.value="${value}";
      input.dispatchEvent(new Event("change",{bubbles:true}));
    })()`);
  }

  // Owner recording regression: force=42 must be accepted and displayed truthfully.
  await setNumber("forceMultiplier",42);
  await waitFor("Owner force 42 remains applied and visible",async()=>{
    return evaluate(`(()=>{
      const p=window.__combatLabRuntime.snapshot.player;
      const field=document.querySelector('[data-param-id="forceMultiplier"] .parameter-number');
      const extreme=document.querySelector('[data-param-id="forceMultiplier"] .extreme-badge');
      const safety=document.querySelector('[data-param-id="forceMultiplier"] .safety-badge');
      return Math.abs(p.forceMultiplier-42)<1e-9 &&
        Math.abs(Number(field.value)-42)<1e-9 &&
        !extreme.hidden &&
        safety.hidden;
    })()`);
  });

  // A request beyond the real numerical safety rail must immediately show applied truth.
  await setNumber("forceMultiplier",9999);
  await waitFor("safety clamp is immediate and truthful",async()=>{
    return evaluate(`(()=>{
      const p=window.__combatLabRuntime.snapshot.player;
      const field=document.querySelector('[data-param-id="forceMultiplier"] .parameter-number');
      const safety=document.querySelector('[data-param-id="forceMultiplier"] .safety-badge');
      return Math.abs(p.forceMultiplier-100)<1e-9 &&
        Math.abs(Number(field.value)-100)<1e-9 &&
        !safety.hidden;
    })()`);
  });

  // A = same actor, no load.
  await setNumber("envelope",1.00);
  await setNumber("bodyMass",1.00);
  await setNumber("loadMass",0.00);
  await setNumber("forceMultiplier",1.00);

  await waitFor("A parameter state propagated to runtime snapshot",async()=>{
    const p=await evaluate("window.__combatLabRuntime.snapshot.player");
    return Math.abs(p.envelope-1)<1e-9 &&
      Math.abs(p.bodyMass-1)<1e-9 &&
      Math.abs(p.loadMass-0)<1e-9 &&
      Math.abs(p.forceMultiplier-1)<1e-9;
  });
  await evaluate('document.querySelector("#capture-a").click()');

  const a=await evaluate("window.__combatLabRuntime.snapshot.player");

  // B = same actor/force, heavy load only.
  await setNumber("loadMass",4.00);
  await waitFor("heavy load propagated to runtime snapshot",async()=>{
    const p=await evaluate("window.__combatLabRuntime.snapshot.player");
    return Math.abs(p.loadMass-4)<1e-9 && Math.abs(p.totalMass-5)<1e-9;
  });
  await evaluate('document.querySelector("#capture-b").click()');

  const b=await evaluate("window.__combatLabRuntime.snapshot.player");

  if(Math.abs(a.r-b.r)>1e-9) throw new Error("load changed body envelope");
  if(!(b.totalMass>a.totalMass)) throw new Error("load did not increase total mass");
  if(!(b.acceleration<a.acceleration)) throw new Error("load did not reduce acceleration under equal force");
  if(Math.abs(b.maxSpeed-a.maxSpeed)>1e-9) throw new Error("B0 load unexpectedly changed max speed");

  await evaluate('document.querySelector("#apply-a").click()');
  await waitFor("Apply A restores no-load body",async()=>{
    const p=await evaluate("window.__combatLabRuntime.snapshot.player");
    return Math.abs(p.loadMass-0)<1e-9 && Math.abs(p.envelope-1)<1e-9;
  });

  await evaluate('document.querySelector("#apply-b").click()');
  await waitFor("Apply B restores heavy-load body",async()=>{
    const p=await evaluate("window.__combatLabRuntime.snapshot.player");
    return Math.abs(p.loadMass-4)<1e-9 && Math.abs(p.envelope-1)<1e-9;
  });

  async function matchedDriveFromReset(slotSelector){
    await evaluate(`document.querySelector("${slotSelector}").click()`);
    await sleep(100);
    await evaluate('document.querySelector("#reset-world").click()');
    await sleep(100);

    await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",code:"KeyD",key:"d",windowsVirtualKeyCode:68});
    await sleep(420);
    await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",code:"KeyD",key:"d",windowsVirtualKeyCode:68});
    await sleep(80);

    return evaluate(`({
      x:window.__combatLabRuntime.snapshot.player.x,
      speed:Math.hypot(
        window.__combatLabRuntime.snapshot.player.vx,
        window.__combatLabRuntime.snapshot.player.vy
      )
    })`);
  }

  const motionA=await matchedDriveFromReset("#apply-a");
  const motionB=await matchedDriveFromReset("#apply-b");

  if(!(motionA.speed>motionB.speed*1.8)){
    throw new Error(`matched A/B movement did not separate strongly enough: A=${JSON.stringify(motionA)} B=${JSON.stringify(motionB)}`);
  }
  if(!(motionA.x>motionB.x+20)){
    throw new Error(`matched A/B travel did not separate: A=${JSON.stringify(motionA)} B=${JSON.stringify(motionB)}`);
  }

  // World reset preserves B parameters.
  await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",code:"KeyD",key:"d",windowsVirtualKeyCode:68});
  await sleep(320);
  await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",code:"KeyD",key:"d",windowsVirtualKeyCode:68});
  await evaluate('document.querySelector("#reset-world").click()');

  await waitFor("Reset World preserves B0 authored state",async()=>{
    const p=await evaluate("window.__combatLabRuntime.snapshot.player");
    return Math.abs(p.x-165)<1e-9 && Math.abs(p.loadMass-4)<1e-9 && Math.abs(p.envelope-1)<1e-9;
  });

  await evaluate('document.querySelector("#restore-defaults").click()');
  await waitFor("Restore Defaults resets B0 parameters",async()=>{
    const p=await evaluate("window.__combatLabRuntime.snapshot.player");
    return Math.abs(p.envelope-1)<1e-9 &&
      Math.abs(p.bodyMass-1)<1e-9 &&
      Math.abs(p.loadMass-0)<1e-9 &&
      Math.abs(p.forceMultiplier-1)<1e-9;
  });

  // Orthogonality in real browser.
  const baseline=await evaluate("window.__combatLabRuntime.snapshot.player");
  await setNumber("envelope",1.70);
  await waitFor("envelope edit propagated",async()=>{
    const p=await evaluate("window.__combatLabRuntime.snapshot.player");
    return Math.abs(p.envelope-1.70)<1e-9;
  });
  const large=await evaluate("window.__combatLabRuntime.snapshot.player");
  if(!(large.r>baseline.r)) throw new Error("envelope did not change radius");
  if(Math.abs(large.totalMass-baseline.totalMass)>1e-9) throw new Error("envelope leaked into mass");
  if(Math.abs(large.acceleration-baseline.acceleration)>1e-9) throw new Error("envelope leaked into acceleration");

  await setNumber("envelope",1.00);
  await setNumber("forceMultiplier",2.00);
  await waitFor("force edit propagated",async()=>{
    const p=await evaluate("window.__combatLabRuntime.snapshot.player");
    return Math.abs(p.envelope-1)<1e-9 && Math.abs(p.forceMultiplier-2)<1e-9;
  });
  const strong=await evaluate("window.__combatLabRuntime.snapshot.player");
  if(!(strong.acceleration>baseline.acceleration)) throw new Error("force did not change acceleration");
  if(Math.abs(strong.totalMass-baseline.totalMass)>1e-9) throw new Error("force leaked into mass");

  await evaluate('document.querySelector("#restore-defaults").click()');

  const selectorGroups=await evaluate(`[...document.querySelectorAll("#experiment-select optgroup")].map(g=>({
    label:g.label,
    values:[...g.querySelectorAll("option")].map(o=>o.value)
  }))`);
  const researchGroup=selectorGroups.find(g=>g.label==="Research experiments");
  const diagnosticGroup=selectorGroups.find(g=>g.label==="Internal diagnostics");
  if(
    !researchGroup?.values.includes("load-envelope-field-b0") ||
    !researchGroup?.values.includes("embodied-scale-field-v0") ||
    !researchGroup?.values.includes("active-spatial-ecology-v0")
  ){
    throw new Error(`research experiment grouping failed: ${JSON.stringify(selectorGroups)}`);
  }
  if(!diagnosticGroup?.values.includes("substrate-smoke")){
    throw new Error(`diagnostic experiment grouping failed: ${JSON.stringify(selectorGroups)}`);
  }

  // Experiment switching must keep both B0 and S0 valid.
  await evaluate(`(()=>{
    const s=document.querySelector("#experiment-select");
    s.value="embodied-scale-field-v0";
    s.dispatchEvent(new Event("change",{bubbles:true}));
  })()`);
  await waitFor("switch B0 to S0",async()=>{
    return evaluate('window.__combatLabRuntime.activeExperimentId==="embodied-scale-field-v0" && !!document.querySelector(\'[data-param-id="scale"]\')');
  });

  await evaluate(`(()=>{
    const s=document.querySelector("#experiment-select");
    s.value="load-envelope-field-b0";
    s.dispatchEvent(new Event("change",{bubbles:true}));
  })()`);
  await waitFor("switch S0 back to B0",async()=>{
    return evaluate('window.__combatLabRuntime.activeExperimentId==="load-envelope-field-b0" && !!document.querySelector(\'[data-param-id="loadMass"]\')');
  });

  // New discovery lane: switch from preserved B0/S0 regressions into Active Spatial Ecology.
  await evaluate(`(()=>{
    const s=document.querySelector("#experiment-select");
    s.value="active-spatial-ecology-v0";
    s.dispatchEvent(new Event("change",{bubbles:true}));
  })()`);
  await waitFor("switch into active spatial ecology",async()=>{
    return evaluate(`(()=>{
      const r=window.__combatLabRuntime;
      return r.activeExperimentId==="active-spatial-ecology-v0" &&
        !!document.querySelector('[data-param-id="playerEnvelope"]') &&
        !!document.querySelector('[data-param-id="spawnEnvelope"]') &&
        !!document.querySelector('[data-action-id="spawn1"]') &&
        !!document.querySelector('[data-action-id="spawn5"]') &&
        !!document.querySelector('[data-action-id="spawn10"]') &&
        !!document.querySelector('[data-action-id="spawn50"]') &&
        !!document.querySelector('[data-action-id="clearAll"]');
    })()`);
  });

  const ecologyBaseline=await evaluate("window.__combatLabRuntime.snapshot");
  if(ecologyBaseline.residents.length!==ecologyBaseline.baselineCount || ecologyBaseline.baselineCount!==6){
    throw new Error(`unexpected ecology baseline: ${JSON.stringify({count:ecologyBaseline.residents.length,baseline:ecologyBaseline.baselineCount})}`);
  }

  // Author wave A: deliberately small, heavy and high-force.
  await setNumber("spawnEnvelope",0.55);
  await setNumber("spawnBodyMass",8);
  await setNumber("spawnLoadMass",2);
  await setNumber("spawnForceMultiplier",5);
  await evaluate('document.querySelector(\'[data-action-id="spawn10"]\').click()');
  await waitFor("spawn wave A +10",async()=>{
    return evaluate("window.__combatLabRuntime.snapshot.residents.length===16");
  });
  const waveA=await evaluate("window.__combatLabRuntime.snapshot.residents.slice(-10)");
  if(!waveA.every(r=>Math.abs(r.envelope-0.55)<1e-9 && Math.abs(r.bodyMass-8)<1e-9 && Math.abs(r.loadMass-2)<1e-9 && Math.abs(r.forceMultiplier-5)<1e-9)){
    throw new Error("spawn wave A did not preserve authored phenotype");
  }

  // Author wave B without resetting the world; wave A must remain unchanged.
  await setNumber("spawnEnvelope",2.00);
  await setNumber("spawnBodyMass",0.50);
  await setNumber("spawnLoadMass",0);
  await setNumber("spawnForceMultiplier",0.75);
  await evaluate('document.querySelector(\'[data-action-id="spawn5"]\').click()');
  await waitFor("spawn wave B +5",async()=>{
    return evaluate("window.__combatLabRuntime.snapshot.residents.length===21");
  });
  const mixed=await evaluate("window.__combatLabRuntime.snapshot.residents");
  const waveAAfter=mixed.filter(r=>String(r.id).startsWith("spawn-")).slice(0,10);
  const waveB=mixed.filter(r=>String(r.id).startsWith("spawn-")).slice(10,15);
  if(!waveAAfter.every(r=>Math.abs(r.envelope-0.55)<1e-9 && Math.abs(r.bodyMass-8)<1e-9)){
    throw new Error("later authoring rewrote earlier spawned phenotype");
  }
  if(!waveB.every(r=>Math.abs(r.envelope-2)<1e-9 && Math.abs(r.bodyMass-0.5)<1e-9 && Math.abs(r.forceMultiplier-0.75)<1e-9)){
    throw new Error("spawn wave B did not preserve authored phenotype");
  }

  // Player phenotype remains independently authorable; camera must not normalize it away.
  await setNumber("playerEnvelope",4.50);
  await setNumber("playerBodyMass",20);
  await setNumber("playerLoadMass",4);
  await setNumber("playerForceMultiplier",42);
  await setNumber("cameraZoom",0.75);
  await waitFor("ecology Owner-derived player phenotype",async()=>{
    return evaluate(`(()=>{
      const s=window.__combatLabRuntime.snapshot;
      return Math.abs(s.player.envelope-4.5)<1e-9 &&
        Math.abs(s.player.bodyMass-20)<1e-9 &&
        Math.abs(s.player.loadMass-4)<1e-9 &&
        Math.abs(s.player.forceMultiplier-42)<1e-9 &&
        Math.abs(s.cameraZoom-0.75)<1e-9;
    })()`);
  });

  // Direct movement still works in the larger camera-following world.
  const ecologyX0=await evaluate("window.__combatLabRuntime.snapshot.player.x");
  await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",code:"KeyD",key:"d",windowsVirtualKeyCode:68});
  await sleep(300);
  await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",code:"KeyD",key:"d",windowsVirtualKeyCode:68});
  await waitFor("ecology player direct movement",async()=>{
    const x=await evaluate("window.__combatLabRuntime.snapshot.player.x");
    return Number(x)>Number(ecologyX0)+2;
  });

  await captureScreenshot();

  // Clear extras preserves baseline; Clear all proves population zero is also a legal research state.
  await evaluate('document.querySelector(\'[data-action-id="clearExtras"]\').click()');
  await waitFor("clear extras returns baseline",async()=>{
    return evaluate("window.__combatLabRuntime.snapshot.residents.length===6");
  });
  await evaluate('document.querySelector(\'[data-action-id="clearAll"]\').click()');
  await waitFor("clear all reaches zero residents",async()=>{
    return evaluate("window.__combatLabRuntime.snapshot.residents.length===0");
  });
  await evaluate('document.querySelector("#reset-world").click()');
  await waitFor("reset restores deterministic ecology baseline",async()=>{
    return evaluate("window.__combatLabRuntime.snapshot.residents.length===6");
  });

  // Destructive pressure: one +50 action must reach a broad crowd regime without a low protective cap.
  await evaluate('document.querySelector(\'[data-action-id="spawn50"]\').click()');
  await waitFor("broad ecology population pressure",async()=>{
    return evaluate("window.__combatLabRuntime.snapshot.residents.length>=46");
  },{timeout:7000});
  await waitFor("dense ecology produces actual moving body contact",async()=>{
    return evaluate("window.__combatLabRuntime.snapshot.bodyContactsPerSecond>0");
  },{timeout:5000});
  const pressure=await evaluate(`({
    count:window.__combatLabRuntime.snapshot.residents.length,
    failures:window.__combatLabRuntime.snapshot.spawnFailures,
    occupied:window.__combatLabRuntime.snapshot.occupiedPercent,
    bodyRate:window.__combatLabRuntime.snapshot.bodyContactsPerSecond,
    staticRate:window.__combatLabRuntime.snapshot.staticContactsPerSecond
  })`);
  for(const value of [pressure.count,pressure.failures,pressure.occupied,pressure.bodyRate,pressure.staticRate]){
    if(!Number.isFinite(Number(value))) throw new Error(`non-finite ecology pressure diagnostic: ${JSON.stringify(pressure)}`);
  }
  if(!(pressure.bodyRate>0)){
    throw new Error(`dense population did not produce body contact pressure: ${JSON.stringify(pressure)}`);
  }
  await captureScreenshot(extremeScreenshotPath);

  // Force one long main-thread stall. Fixed-step safety remains, but the lost wall time must be visible.
  await evaluate(`(()=>{
    const until=performance.now()+125;
    while(performance.now()<until){}
    return true;
  })()`);
  await waitFor("simulation stress is truthfully surfaced",async()=>{
    return evaluate(`(()=>{
      const r=window.__combatLabRuntime;
      return r.droppedWallTime>0.02 &&
        r.simHealth==="STRESS" &&
        document.querySelector("#sim-health")?.textContent==="SIM STRESS" &&
        Number.isFinite(r.lastDroppedSeconds);
    })()`);
  },{timeout:3000});

  const stressEvidence=await evaluate(`({
    droppedWallTime:window.__combatLabRuntime.droppedWallTime,
    lastDroppedSeconds:window.__combatLabRuntime.lastDroppedSeconds,
    simHealth:window.__combatLabRuntime.simHealth,
    lastFrameSteps:window.__combatLabRuntime.lastFrameSteps
  })`);

  // Reset returns deterministic baseline but preserves current authored player/spawn/view settings.
  await evaluate('document.querySelector("#reset-world").click()');
  await waitFor("ecology reset preserves authored controls and baseline population",async()=>{
    return evaluate(`(()=>{
      const s=window.__combatLabRuntime.snapshot;
      return s.residents.length===6 &&
        Math.abs(s.player.envelope-4.5)<1e-9 &&
        Math.abs(s.spawnTemplate.envelope-2)<1e-9 &&
        Math.abs(s.spawnTemplate.bodyMass-0.5)<1e-9 &&
        Math.abs(s.cameraZoom-0.75)<1e-9 &&
        window.__combatLabRuntime.droppedWallTime===0;
    })()`);
  });

  await cdp.send("Emulation.setDeviceMetricsOverride",{
    width:1280,height:800,deviceScaleFactor:1,mobile:false
  });
  await sleep(180);

  const compact=await evaluate(`(()=>{
    const inspector=document.querySelector(".inspector");
    return {
      stage:document.querySelector(".stage-column")?.getBoundingClientRect().width,
      inspector:inspector?.getBoundingClientRect().width,
      bodyScroll:getComputedStyle(document.body).overflow,
      inspectorOverflowX:getComputedStyle(inspector).overflowX,
      inspectorScrollWidth:inspector?.scrollWidth,
      inspectorClientWidth:inspector?.clientWidth
    };
  })()`);
  if(Number(compact.inspector)<340 || Number(compact.stage)<700){
    throw new Error(`compact ecology layout failed: ${JSON.stringify(compact)}`);
  }
  if(Number(compact.inspectorScrollWidth)>Number(compact.inspectorClientWidth)+1){
    throw new Error(`ecology Inspector has horizontal overflow: ${JSON.stringify(compact)}`);
  }
  await captureScreenshot(compactScreenshotPath);

  // Public rehearsal deep-link must open the intended experiment directly while root remains B0.
  const ecologyUrl=new URL(target);
  ecologyUrl.searchParams.set("experiment","active-spatial-ecology-v0");
  await cdp.send("Page.navigate",{url:ecologyUrl.toString()});
  await waitFor("ecology deep-link boots directly",async()=>{
    return evaluate(`(()=>{
      const r=window.__combatLabRuntime;
      const selected=document.querySelector("#experiment-select")?.value;
      return !!r && r.state==="RUNNING" && r.frames>=8 && r.elapsed>0.03 &&
        r.activeExperimentId==="active-spatial-ecology-v0" &&
        selected==="active-spatial-ecology-v0" &&
        new URLSearchParams(location.search).get("experiment")==="active-spatial-ecology-v0" &&
        !!document.querySelector('[data-action-id="spawn50"]');
    })()`);
  },{timeout:6000});

  // Selecting canonical B0 again removes the deep-link parameter rather than polluting the root URL.
  await evaluate(`(()=>{
    const s=document.querySelector("#experiment-select");
    s.value="load-envelope-field-b0";
    s.dispatchEvent(new Event("change",{bubbles:true}));
  })()`);
  await waitFor("B0 selection clears experiment query",async()=>{
    return evaluate(`(()=>{
      const r=window.__combatLabRuntime;
      return r.activeExperimentId==="load-envelope-field-b0" &&
        !new URLSearchParams(location.search).has("experiment");
    })()`);
  });

  // Restore ecology through the selector so final state remains the rehearsal specimen.
  await evaluate(`(()=>{
    const s=document.querySelector("#experiment-select");
    s.value="active-spatial-ecology-v0";
    s.dispatchEvent(new Event("change",{bubbles:true}));
  })()`);
  await waitFor("restore ecology after URL qualification",async()=>{
    return evaluate('window.__combatLabRuntime.activeExperimentId==="active-spatial-ecology-v0"');
  });

  const finalState=await evaluate("window.__combatLabRuntime");
  if(finalState.error) throw new Error(`runtime error captured: ${finalState.error}`);

  process.stdout.write(JSON.stringify({
    pass:true,
    initial:{
      title:first.title,
      experiment:first.experiment,
      source:first.source
    },
    matchedLoadComparison:{
      radiusA:a.r,
      radiusB:b.r,
      totalMassA:a.totalMass,
      totalMassB:b.totalMass,
      accelerationA:a.acceleration,
      accelerationB:b.acceleration,
      maxSpeedA:a.maxSpeed,
      maxSpeedB:b.maxSpeed
    },
    ecology:{
      baselineResidents:ecologyBaseline.baselineCount,
      waveAResidents:10,
      waveBResidents:5,
      pressure,
      stressEvidence
    },
    final:{
      state:finalState.state,
      frames:finalState.frames,
      elapsed:finalState.elapsed,
      activeExperimentId:finalState.activeExperimentId
    }
  },null,2)+"\n");
}catch(error){
  try{ await captureScreenshot(); }catch{}
  process.stderr.write(String(error?.stack || error)+"\n");
  if(stderr) process.stderr.write("\nChrome stderr:\n"+stderr.slice(-5000));
  process.exitCode=1;
}finally{
  try{ cdp?.close(); }catch{}
  chrome.kill("SIGTERM");
}
