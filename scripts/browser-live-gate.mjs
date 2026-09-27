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

  // P0 clock truth: a deliberate browser stall must be reported as discarded wall time.
  await evaluate(`(()=>{
    const until=performance.now()+90;
    while(performance.now()<until){}
  })()`);
  const p0ClockTruth=await waitFor("P0 discarded wall-time evidence",async()=>{
    return evaluate(`(()=>{
      const r=window.__combatLabRuntime;
      const p=r.performance?.snapshot?.();
      if(Number(r.fixedStep?.discardedSeconds)>0.02 &&
         Number(p?.discardedWallSeconds)>0.02 &&
         Number(p?.run?.discardedWallSeconds)>0.02){
        return {fixed:r.fixedStep,performance:p};
      }
      return null;
    })()`);
  });
  if(!(p0ClockTruth.fixed.rawFrameSeconds>p0ClockTruth.fixed.acceptedFrameSeconds) ||
     !(p0ClockTruth.performance.simulationToWallRatio<1)){
    throw new Error(`P0 clock attribution failed: ${JSON.stringify(p0ClockTruth)}`);
  }

  const baselineFeasibility=await evaluate(`window.__combatLabRuntime.query(
    "static-feasibility",
    {target:{x:520,y:325},clearance:10}
  )`);
  if(baselineFeasibility?.schema!=="combat-lab-static-feasibility-v0" ||
     baselineFeasibility.hard?.clear!==true ||
     baselineFeasibility.comfort?.clear!==false ||
     baselineFeasibility.clearanceConstrained!==true){
    throw new Error(`N0 baseline feasibility query failed: ${JSON.stringify(baselineFeasibility)}`);
  }

  await setNumber("envelope",1.70);
  const largeFeasibility=await evaluate(`window.__combatLabRuntime.query(
    "static-feasibility",
    {target:{x:520,y:325},clearance:10}
  )`);
  if(largeFeasibility?.hard?.clear!==false ||
     !String(largeFeasibility?.hard?.blocker?.id || "").startsWith("choke.")){
    throw new Error(`N0 large-body feasibility did not expose choke blocker: ${JSON.stringify(largeFeasibility)}`);
  }

  const routeWitness=await evaluate(`window.__combatLabRuntime.query(
    "static-route-witness",
    {target:{x:520,y:325},clearance:10}
  )`);
  if(routeWitness?.schema!=="combat-lab-static-route-witness-v0" ||
     routeWitness.status!=="witness" ||
     routeWitness.provesUnreachable!==false ||
     routeWitness.completeness!=="witness-only" ||
     routeWitness.routeNodeIds?.length<=2 ||
     routeWitness.clearanceConstrained!==true){
    throw new Error(`N0b alternative witness contract failed: ${JSON.stringify(routeWitness)}`);
  }
  for(const edgeId of routeWitness.routeEdgeIds || []){
    const edge=routeWitness.edges?.find(candidate=>candidate.id===edgeId);
    if(!edge?.hard?.clear){
      throw new Error(`N0b route contains non-hard-feasible edge: ${JSON.stringify(edge)}`);
    }
  }

  await setNumber("envelope",1.00);

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

  const comparisonUi=await evaluate(`({
    a:document.querySelector("#slot-a-summary")?.textContent,
    b:document.querySelector("#slot-b-summary")?.textContent,
    contract:document.querySelector("#comparison-contract")?.textContent,
    diff:document.querySelector("#comparison-diff")?.textContent
  })`);
  if(!comparisonUi.a?.includes("Player authored phenotype") || !comparisonUi.a?.includes("specimen/player")){
    throw new Error(`A scope is not explicit: ${JSON.stringify(comparisonUi)}`);
  }
  if(!comparisonUi.b?.includes("4 fields")){
    throw new Error(`B field scope is not explicit: ${JSON.stringify(comparisonUi)}`);
  }
  if(!comparisonUi.contract?.includes("current world state is preserved") ||
     !comparisonUi.contract?.includes("Reset World separately")){
    throw new Error(`comparison apply/matched-start semantics are hidden: ${JSON.stringify(comparisonUi)}`);
  }
  if(!comparisonUi.diff?.includes("Carried load mass") ||
     !comparisonUi.diff?.includes("0.00 → 4.00")){
    throw new Error(`comparison diff is not explicit before Apply: ${JSON.stringify(comparisonUi)}`);
  }

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

  await evaluate('document.querySelector(\'[data-param-id="envelope"] .icon-button\').click()');
  await waitFor("per-parameter reset restores envelope",async()=>{
    const p=await evaluate("window.__combatLabRuntime.snapshot.player");
    return Math.abs(p.envelope-1)<1e-9;
  });
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
  if(!researchGroup?.values.includes("load-envelope-field-b0") || !researchGroup?.values.includes("embodied-scale-field-v0")){
    throw new Error(`research experiment grouping failed: ${JSON.stringify(selectorGroups)}`);
  }
  if(!diagnosticGroup?.values.includes("substrate-smoke")){
    throw new Error(`diagnostic experiment grouping failed: ${JSON.stringify(selectorGroups)}`);
  }

  // Apparatus/session interventions are provenance too, without becoming specimen state.
  await evaluate('document.querySelector("#debug").click()');
  await evaluate('document.querySelector("#debug").click()');

  await evaluate('document.querySelector("#pause").click()');
  await waitFor("pause toggle reaches runtime",async()=>
    evaluate('window.__combatLabRuntime.state==="PAUSED"')
  );
  await evaluate('document.querySelector("#pause").click()');
  await waitFor("resume toggle reaches runtime",async()=>
    evaluate('window.__combatLabRuntime.state==="RUNNING"')
  );

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

  // N1 real-browser organism competence: direct stall -> bounded replan -> arrival.
  await evaluate(`(()=>{
    const s=document.querySelector("#experiment-select");
    s.value="minimal-replan-cell-n1";
    s.dispatchEvent(new Event("change",{bubbles:true}));
  })()`);
  await waitFor("switch B0 to N1",async()=>{
    return evaluate('window.__combatLabRuntime.activeExperimentId==="minimal-replan-cell-n1"');
  });

  const beforeN1=await evaluate("window.__combatLabRuntime.snapshot");
  if(beforeN1.status!=="MOVING" || beforeN1.planMode!=="DIRECT" || beforeN1.replanAttempted){
    throw new Error(`N1 did not start in direct pre-replan state: ${JSON.stringify(beforeN1)}`);
  }

  await waitFor("N1 bounded replan attempt",async()=>{
    return evaluate(`(()=>{
      const s=window.__combatLabRuntime.snapshot;
      return s?.replanAttempted===true &&
        s?.replanCount===1 &&
        s?.witnessStatus==="witness" &&
        s?.planMode==="ROUTE_WITNESS";
    })()`);
  },{timeout:5000,interval:80});

  const causalN1=await evaluate('window.__combatLabRuntime.query("causal-state")');
  if(causalN1?.schema!=="combat-lab-minimal-replan-v0" ||
     causalN1.replan?.witness?.status!=="witness" ||
     causalN1.replan?.trigger?.blocker?.id!=="wall.center" ||
     !(Number(causalN1.replan?.trigger?.noProgressFor)>=Number(causalN1.factualProgress?.threshold)) ||
     !Number.isFinite(causalN1.factualProgress?.goalDistance)){
    throw new Error(`N1 causal query failed: ${JSON.stringify(causalN1)}`);
  }

  await waitFor("N1 reaches target after witness replan",async()=>{
    return evaluate(`(()=>{
      const s=window.__combatLabRuntime.snapshot;
      return s?.status==="ARRIVED" &&
        s?.replanCount===1 &&
        Number(s?.goalDistance)<=3;
    })()`);
  },{timeout:7000,interval:80});

  await evaluate(`(()=>{
    const s=document.querySelector("#experiment-select");
    s.value="load-envelope-field-b0";
    s.dispatchEvent(new Event("change",{bubbles:true}));
  })()`);
  await waitFor("switch N1 back to B0",async()=>{
    return evaluate('window.__combatLabRuntime.activeExperimentId==="load-envelope-field-b0" && !!document.querySelector(\'[data-param-id="loadMass"]\')');
  });

  // C0 real-browser contact semantics: equal hold then explicit A-yields/B-resists trial.
  await evaluate(`(()=>{
    const s=document.querySelector("#experiment-select");
    s.value="contact-semantics-cell-c0";
    s.dispatchEvent(new Event("change",{bubbles:true}));
  })()`);
  await waitFor("switch B0 to C0",async()=>{
    return evaluate('window.__combatLabRuntime.activeExperimentId==="contact-semantics-cell-c0" && !!document.querySelector(\'[data-param-id="aContactResistance"]\')');
  });

  const c0Contract=await evaluate('document.querySelector("#comparison-contract")?.textContent');
  if(!c0Contract?.includes("specimen/body:A") || !c0Contract?.includes("specimen/body:B") ||
     !c0Contract?.includes("matched contact trial")){
    throw new Error(`C0 comparison scope/matched-start semantics hidden: ${c0Contract}`);
  }

  await waitFor("C0 equal trial completes",async()=>{
    return evaluate('window.__combatLabRuntime.snapshot?.status==="COMPLETE"');
  },{timeout:6000,interval:80});
  const equalC0=await evaluate("window.__combatLabRuntime.snapshot");
  if(!(equalC0.contactPairSteps>100) || Math.abs(Number(equalC0.midpointShift))>0.2){
    throw new Error(`C0 equal hold failed: ${JSON.stringify(equalC0)}`);
  }

  await setNumber("aContactResistance",0.25);
  await setNumber("bContactResistance",4);
  await evaluate('document.querySelector("#reset-world").click()');
  await waitFor("C0 yielding trial restarted",async()=>{
    return evaluate('window.__combatLabRuntime.snapshot?.status==="RUNNING" && window.__combatLabRuntime.snapshot?.time<0.5');
  });
  await waitFor("C0 yielding trial completes",async()=>{
    return evaluate('window.__combatLabRuntime.snapshot?.status==="COMPLETE"');
  },{timeout:6000,interval:80});

  const causalC0=await evaluate('window.__combatLabRuntime.query("contact-causal-state")');
  if(!(Number(causalC0?.midpointShift)<-5) ||
     causalC0?.bodies?.A?.mass!==1 ||
     causalC0?.bodies?.B?.mass!==1 ||
     causalC0?.bodies?.A?.contactResistance!==0.25 ||
     causalC0?.bodies?.B?.contactResistance!==4 ||
     causalC0?.bodies?.A?.contactMobility!==4 ||
     causalC0?.bodies?.B?.contactMobility!==0.25 ||
     causalC0?.bodies?.A?.desiredVelocity?.x!==140 ||
     causalC0?.bodies?.B?.desiredVelocity?.x!==-140){
    throw new Error(`C0 yielding causal evidence failed: ${JSON.stringify(causalC0)}`);
  }

  const sparse12=await evaluate('window.__combatLabRuntime.query("contact-scaling-probe",{count:12,steps:5,dense:false})');
  const sparse24=await evaluate('window.__combatLabRuntime.query("contact-scaling-probe",{count:24,steps:5,dense:false})');
  const dense12=await evaluate('window.__combatLabRuntime.query("contact-scaling-probe",{count:12,steps:4,dense:true})');

  if(sparse12?.schema!=="combat-lab-contact-scaling-probe-v0" ||
     sparse12.naivePairsPerIteration!==66 ||
     sparse12.pairChecks!==330 ||
     sparse12.contactResolutions!==0 ||
     sparse24.naivePairsPerIteration!==276 ||
     sparse24.pairChecks!==1380 ||
     !(sparse24.pairChecks>sparse12.pairChecks*4)){
    throw new Error(`P0 exact pair-work attribution failed: ${JSON.stringify({sparse12,sparse24})}`);
  }
  if(!(dense12.contactResolutions>0) ||
     !(dense12.pairChecks>dense12.contactResolutions) ||
     !Number.isFinite(Number(dense12.durationMs))){
    throw new Error(`P0 dense contact attribution failed: ${JSON.stringify(dense12)}`);
  }

  const p0QueryTiming=await evaluate('window.__combatLabRuntime.performance.snapshot().lastQuery');
  if(p0QueryTiming?.name!=="contact-scaling-probe" ||
     !Number.isFinite(Number(p0QueryTiming.durationMs)) ||
     Number(p0QueryTiming.durationMs)<0){
    throw new Error(`P0 query cost missing: ${JSON.stringify(p0QueryTiming)}`);
  }

  await evaluate(`(()=>{
    const s=document.querySelector("#experiment-select");
    s.value="load-envelope-field-b0";
    s.dispatchEvent(new Event("change",{bubbles:true}));
  })()`);
  await waitFor("switch C0 back to B0",async()=>{
    return evaluate('window.__combatLabRuntime.activeExperimentId==="load-envelope-field-b0" && !!document.querySelector(\'[data-param-id="loadMass"]\')');
  });

  // D0 dynamic encounter competence: exact symmetry must not invent a side.
  await evaluate(`(()=>{
    const s=document.querySelector("#experiment-select");
    s.value="dynamic-encounter-cell-d0";
    s.dispatchEvent(new Event("change",{bubbles:true}));
  })()`);
  await waitFor("switch B0 to D0",async()=>{
    return evaluate('window.__combatLabRuntime.activeExperimentId==="dynamic-encounter-cell-d0" && !!document.querySelector(\'[data-param-id="aPassingSide"]\')');
  });

  const d0Contract=await evaluate('document.querySelector("#comparison-contract")?.textContent');
  if(!d0Contract?.includes("organism/body:A") ||
     !d0Contract?.includes("organism/body:B") ||
     !d0Contract?.includes("matched encounter trial")){
    throw new Error(`D0 comparison scope/matched-start semantics hidden: ${d0Contract}`);
  }

  await waitFor("D0 no-convention hold becomes explicit",async()=>{
    return evaluate(`(()=>{
      const s=window.__combatLabRuntime.snapshot;
      return s?.actors?.A?.mode==="BLOCKED_NO_CONVENTION" &&
        s?.actors?.B?.mode==="BLOCKED_NO_CONVENTION" &&
        s?.actors?.A?.trigger?.partnerId==="B" &&
        s?.actors?.B?.trigger?.partnerId==="A";
    })()`);
  },{timeout:5500,interval:80});

  const noConventionD0=await evaluate("window.__combatLabRuntime.snapshot");
  if(!(noConventionD0.actors.A.goalDistance>300) ||
     !(noConventionD0.actors.B.goalDistance>300)){
    throw new Error(`D0 no-convention baseline escaped instead of holding: ${JSON.stringify(noConventionD0)}`);
  }

  await setNumber("aPassingSide",1);
  await setNumber("bPassingSide",1);
  await evaluate('document.querySelector("#reset-world").click()');
  await waitFor("D0 LEFT convention matched trial restarted",async()=>{
    return evaluate(`(()=>{
      const s=window.__combatLabRuntime.snapshot;
      return s?.status==="RUNNING" &&
        s?.time<0.5 &&
        s?.actors?.A?.passingSide===1 &&
        s?.actors?.B?.passingSide===1;
    })()`);
  });

  await waitFor("D0 shared local convention reaches both targets",async()=>{
    return evaluate(`(()=>{
      const s=window.__combatLabRuntime.snapshot;
      return s?.status==="COMPLETE" &&
        s?.actors?.A?.mode==="ARRIVED" &&
        s?.actors?.B?.mode==="ARRIVED" &&
        s?.actors?.A?.encounterCount===1 &&
        s?.actors?.B?.encounterCount===1;
    })()`);
  },{timeout:9000,interval:80});

  const causalD0=await evaluate('window.__combatLabRuntime.query("dynamic-encounter-causal")');
  if(causalD0?.schema!=="combat-lab-dynamic-encounter-v0" ||
     causalD0?.actors?.A?.trigger?.partnerId!=="B" ||
     causalD0?.actors?.B?.trigger?.partnerId!=="A" ||
     causalD0?.actors?.A?.trigger?.passingSide!==1 ||
     causalD0?.actors?.B?.trigger?.passingSide!==1 ||
     !(Number(causalD0?.actors?.A?.trigger?.noProgressFor)>=0.45)){
    throw new Error(`D0 causal encounter evidence failed: ${JSON.stringify(causalD0)}`);
  }

  await evaluate(`(()=>{
    const s=document.querySelector("#experiment-select");
    s.value="load-envelope-field-b0";
    s.dispatchEvent(new Event("change",{bubbles:true}));
  })()`);
  await waitFor("switch D0 back to B0",async()=>{
    return evaluate('window.__combatLabRuntime.activeExperimentId==="load-envelope-field-b0" && !!document.querySelector(\'[data-param-id="loadMass"]\')');
  });

  // E1 browser-only integration qualification. Do not expose E1 in the Owner selector yet.
  const e1Browser=await evaluate(`(async()=>{
    const module=await import("./src/research/integrated-ecology.js");
    const left=module.runIntegratedEcologyTrial({
      count:8,
      passingSide:1,
      pairOrder:"forward",
      trialDuration:10
    });
    const none=module.runIntegratedEcologyTrial({
      count:8,
      passingSide:0,
      pairOrder:"forward",
      trialDuration:10
    });
    return {
      schema:left.schema,
      left:{
        arrived:left.arrived,
        staticReplans:left.staticReplans,
        dynamicEncounters:left.dynamicEncounters,
        staticOverlapViolations:left.staticOverlapViolations,
        dynamicOverlapViolations:left.dynamicOverlapViolations,
        maxCoupledPassesUsed:left.maxCoupledPassesUsed,
        totalRemainingDistance:left.totalRemainingDistance,
        pairChecks:left.pairChecks,
        contactResolutions:left.contactResolutions
      },
      none:{
        arrived:none.arrived,
        dynamicEncounters:none.dynamicEncounters,
        noConventionEncounters:none.noConventionEncounters,
        totalRemainingDistance:none.totalRemainingDistance
      }
    };
  })()`);

  if(e1Browser?.schema!=="combat-lab-integrated-ecology-v0" ||
     !(e1Browser.left.staticReplans>0) ||
     !(e1Browser.left.dynamicEncounters>0) ||
     e1Browser.left.staticOverlapViolations!==0 ||
     e1Browser.left.dynamicOverlapViolations!==0 ||
     !(e1Browser.left.maxCoupledPassesUsed>0) ||
     !(e1Browser.left.maxCoupledPassesUsed<24) ||
     !(e1Browser.left.pairChecks>e1Browser.left.contactResolutions) ||
     !(e1Browser.none.dynamicEncounters>0) ||
     !(e1Browser.none.noConventionEncounters>0) ||
     !(e1Browser.left.totalRemainingDistance<e1Browser.none.totalRemainingDistance)){
    throw new Error(`E1 browser integration qualification failed: ${JSON.stringify(e1Browser)}`);
  }

  // Normal visual rehearsal: heavy load only.
  await setNumber("loadMass",4.00);
  await captureScreenshot();

  // Owner-derived extreme phenotype: wider than the old rails, still finite and explicitly allowed.
  await setNumber("envelope",4.50);
  await setNumber("bodyMass",20.00);
  await setNumber("loadMass",4.00);
  await setNumber("forceMultiplier",42.00);
  await waitFor("Owner-derived extreme B0 state",async()=>{
    return evaluate(`(()=>{
      const p=window.__combatLabRuntime.snapshot.player;
      const badges=[...document.querySelectorAll(".extreme-badge")].filter(x=>!x.hidden);
      return Math.abs(p.envelope-4.5)<1e-9 &&
        Math.abs(p.bodyMass-20)<1e-9 &&
        Math.abs(p.loadMass-4)<1e-9 &&
        Math.abs(p.forceMultiplier-42)<1e-9 &&
        badges.length>=3;
    })()`);
  });
  await captureScreenshot(extremeScreenshotPath);

  await evaluate('document.querySelector("#restore-defaults").click()');
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
    throw new Error(`compact B0 layout failed: ${JSON.stringify(compact)}`);
  }
  if(Number(compact.inspectorScrollWidth)>Number(compact.inspectorClientWidth)+1){
    const overflowAudit=await evaluate(`(()=>{
      const inspector=document.querySelector(".inspector");
      const root=inspector.getBoundingClientRect();
      const contentRight=root.left+inspector.clientWidth;
      return [...inspector.querySelectorAll("*")]
        .map(el=>{
          const r=el.getBoundingClientRect();
          return {
            tag:el.tagName,
            id:el.id || "",
            cls:el.className || "",
            left:Number(r.left.toFixed(1)),
            right:Number(r.right.toFixed(1)),
            width:Number(r.width.toFixed(1)),
            scrollWidth:el.scrollWidth,
            clientWidth:el.clientWidth,
            overflowX:getComputedStyle(el).overflowX,
            excess:Number((r.right-contentRight).toFixed(1))
          };
        })
        .filter(x=>x.excess>1 || x.scrollWidth>x.clientWidth+1)
        .sort((a,b)=>Math.max(b.excess,b.scrollWidth-b.clientWidth)-Math.max(a.excess,a.scrollWidth-a.clientWidth))
        .slice(0,12);
    })()`);
    throw new Error(`Inspector has horizontal overflow: ${JSON.stringify(compact)} offenders=${JSON.stringify(overflowAudit)}`);
  }
  await captureScreenshot(compactScreenshotPath);

  const interventionLedger=await evaluate("window.__combatLabRuntime.interventionLedger.snapshot()");
  const interventionEvents=interventionLedger.events;

  const force42=interventionEvents.find(event=>
    event.operation==="set" &&
    event.effects.some(effect=>
      effect.domain==="specimen" &&
      effect.scope==="player" &&
      effect.path==="forceMultiplier" &&
      Math.abs(Number(effect.before)-1)<1e-9 &&
      Math.abs(Number(effect.after)-42)<1e-9 &&
      Math.abs(Number(effect.requested)-42)<1e-9
    )
  );
  if(!force42) throw new Error("intervention ledger missed exact Owner force=42 edit");
  if(!Number.isFinite(Number(force42.detail?.durationMs)) || Number(force42.detail.durationMs)<0){
    throw new Error(`P0 set intervention cost missing: ${JSON.stringify(force42)}`);
  }

  const clamped=interventionEvents.find(event=>
    event.operation==="set" &&
    event.effects.some(effect=>
      effect.path==="forceMultiplier" &&
      Math.abs(Number(effect.before)-42)<1e-9 &&
      Math.abs(Number(effect.after)-100)<1e-9 &&
      Math.abs(Number(effect.requested)-9999)<1e-9
    )
  );
  if(!clamped) throw new Error("intervention ledger did not preserve requested vs applied safety-rail truth");

  for(const operation of [
    "comparison-capture",
    "comparison-apply",
    "reset-world",
    "restore-defaults",
    "reset-parameter",
    "toggle-debug",
    "toggle-pause",
    "experiment-switch"
  ]){
    if(!interventionEvents.some(event=>event.operation===operation)){
      throw new Error(`intervention ledger missed ${operation}`);
    }
  }

  const captureA=interventionEvents.find(event=>
    event.operation==="comparison-capture" && event.detail?.slot==="A"
  );
  const scopedSnapshot=captureA?.effects?.[0]?.after;
  if(scopedSnapshot?.schema!=="combat-lab-comparison-snapshot-v0"){
    throw new Error("comparison capture did not preserve a scoped snapshot");
  }
  if(scopedSnapshot.fields.length!==4 ||
     scopedSnapshot.fields.some(field=>field.domain!=="specimen" || field.scope!=="player")){
    throw new Error(`comparison capture scope is not explicit: ${JSON.stringify(scopedSnapshot)}`);
  }

  const resetWithTiming=interventionEvents.find(event=>
    event.operation==="reset-world" &&
    Number.isFinite(Number(event.detail?.durationMs))
  );
  if(!resetWithTiming || Number(resetWithTiming.detail.durationMs)<0){
    throw new Error("P0 Reset World intervention cost missing");
  }

  const performanceTruth=await evaluate("window.__combatLabRuntime.performance.snapshot()");
  if(!(performanceTruth.sampleCount>0) ||
     !(Number(performanceTruth.renderHz)>0) ||
     !Number.isFinite(Number(performanceTruth.simulationToWallRatio)) ||
     !Number.isFinite(Number(performanceTruth.phaseMs?.simulation)) ||
     !Number.isFinite(Number(performanceTruth.phaseMs?.render)) ||
     !Number.isFinite(Number(performanceTruth.phaseMs?.observation)) ||
     !(Number(performanceTruth.run?.frames)>0) ||
     !Number.isFinite(Number(performanceTruth.run?.simulationToWallRatio)) ||
     !Number.isFinite(Number(performanceTruth.run?.discardedWallSeconds)) ||
     !Number.isFinite(Number(performanceTruth.lastIntervention?.durationMs))){
    throw new Error(`P0 runtime phase attribution incomplete: ${JSON.stringify(performanceTruth)}`);
  }

  const switches=interventionEvents.filter(event=>event.operation==="experiment-switch");
  if(switches.length<2) throw new Error(`expected B0↔S0 experiment provenance, got ${switches.length}`);

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
    interventionLedger:{
      count:interventionLedger.count,
      operations:[...new Set(interventionEvents.map(event=>event.operation))]
    },
    performance:{
      renderHz:performanceTruth.renderHz,
      simulationToWallRatio:performanceTruth.simulationToWallRatio,
      phaseMs:performanceTruth.phaseMs,
      lastQuery:performanceTruth.lastQuery,
      lastIntervention:performanceTruth.lastIntervention
    },
    e1Browser,
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
