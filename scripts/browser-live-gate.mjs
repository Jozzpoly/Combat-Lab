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
    width:1600,
    height:1000,
    deviceScaleFactor:1,
    mobile:false
  });
  await cdp.send("Page.navigate",{url:target});

  async function evaluate(expression){
    const result=await cdp.send("Runtime.evaluate",{
      expression,
      returnByValue:true,
      awaitPromise:true
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

  await waitFor("live Workbench heartbeat",async()=>{
    return evaluate(`(()=>{
      const r=window.__combatLabRuntime;
      const inspector=document.querySelector(".inspector");
      const scale=document.querySelector('[data-param-id="scale"] .parameter-number');
      return !!r && r.state==="RUNNING" && r.frames>=8 && r.elapsed>0.03 && !r.error &&
        !!inspector && !!scale;
    })()`);
  });

  const first=await evaluate(`({
    title:document.querySelector("#experiment-title")?.textContent,
    state:window.__combatLabRuntime?.state,
    frames:window.__combatLabRuntime?.frames,
    elapsed:window.__combatLabRuntime?.elapsed,
    experiment:window.__combatLabRuntime?.activeExperimentId,
    scale:window.__combatLabRuntime?.snapshot?.player?.scale,
    playerX:window.__combatLabRuntime?.snapshot?.player?.x,
    source:document.querySelector("#build-id")?.textContent,
    inspectorVisible:!!document.querySelector(".inspector"),
    parameterVisible:!!document.querySelector('[data-param-id="scale"]')
  })`);

  if(first.title!=="Embodied Scale Field S0") throw new Error(`wrong initial title: ${first.title}`);
  if(first.experiment!=="embodied-scale-field-v0") throw new Error(`wrong active experiment: ${first.experiment}`);
  if(!(first.frames>=8 && first.elapsed>0.03)) throw new Error(`runtime not advancing: ${JSON.stringify(first)}`);
  if(!first.inspectorVisible || !first.parameterVisible) throw new Error(`Workbench Inspector missing: ${JSON.stringify(first)}`);

  await evaluate(`(()=>{
    const number=document.querySelector('[data-param-id="scale"] .parameter-number');
    number.focus();
  })()`);

  const scaleBeforeFocusedKey=await evaluate("window.__combatLabRuntime?.snapshot?.player?.scale");
  await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",code:"Digit3",key:"3",windowsVirtualKeyCode:51});
  await sleep(120);
  await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",code:"Digit3",key:"3",windowsVirtualKeyCode:51});
  const scaleAfterFocusedKey=await evaluate("window.__combatLabRuntime?.snapshot?.player?.scale");
  if(Math.abs(Number(scaleAfterFocusedKey)-Number(scaleBeforeFocusedKey))>1e-9){
    throw new Error(`focused Inspector leaked keyboard shortcut into experiment: before=${scaleBeforeFocusedKey} after=${scaleAfterFocusedKey}`);
  }

  await evaluate(`document.querySelector("#lab").focus?.(); document.activeElement?.blur?.();`);

  await evaluate(`(()=>{
    const slider=document.querySelector('[data-param-id="scale"] .parameter-slider');
    slider.value="0.65";
    slider.dispatchEvent(new Event("input",{bubbles:true}));
  })()`);

  await waitFor("Workbench slider edits live S0 scale",async()=>{
    const scale=await evaluate("window.__combatLabRuntime?.snapshot?.player?.scale");
    return Math.abs(Number(scale)-0.65)<1e-9;
  });

  await evaluate(`(()=>{
    const input=document.querySelector('[data-param-id="scale"] .parameter-number');
    input.value="3.25";
    input.dispatchEvent(new Event("change",{bubbles:true}));
  })()`);

  await waitFor("Inspector number edit changes live S0 scale",async()=>{
    const r=await evaluate(`({
      scale:window.__combatLabRuntime?.snapshot?.player?.scale,
      extreme:!document.querySelector('[data-param-id="scale"] .extreme-badge')?.hidden
    })`);
    return Math.abs(Number(r?.scale)-3.25)<1e-9 && r?.extreme===true;
  });

  await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",code:"KeyD",key:"d",windowsVirtualKeyCode:68});
  await sleep(260);
  await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",code:"KeyD",key:"d",windowsVirtualKeyCode:68});

  await waitFor("player movement before world reset",async()=>{
    const x=await evaluate("window.__combatLabRuntime?.snapshot?.player?.x");
    return Number(x)>Number(first.playerX)+5;
  });

  await evaluate(`document.querySelector("#reset-world").click()`);
  await waitFor("Reset World preserves authored scale",async()=>{
    const snap=await evaluate("window.__combatLabRuntime?.snapshot");
    return !!snap &&
      Math.abs((snap.player?.x ?? 0)-175)<1e-9 &&
      Math.abs((snap.player?.scale ?? 0)-3.25)<1e-9 &&
      snap.time===0;
  });

  await evaluate(`document.querySelector("#restore-defaults").click()`);
  await waitFor("Restore Defaults resets authored scale",async()=>{
    const scale=await evaluate("window.__combatLabRuntime?.snapshot?.player?.scale");
    return Math.abs(Number(scale)-1)<1e-9;
  });

  const beforePause=await evaluate("window.__combatLabRuntime.elapsed");
  await evaluate(`document.querySelector("#pause").click()`);
  await sleep(250);
  const paused=await evaluate(`({
    state:window.__combatLabRuntime.state,
    elapsed:window.__combatLabRuntime.elapsed
  })`);
  if(paused.state!=="PAUSED") throw new Error(`pause did not change runtime state: ${JSON.stringify(paused)}`);
  if(Math.abs(paused.elapsed-beforePause)>0.02) throw new Error(`elapsed advanced while paused: before=${beforePause} after=${paused.elapsed}`);

  await evaluate(`document.querySelector("#pause").click()`);
  await waitFor("resume",async()=>{
    const r=await evaluate("window.__combatLabRuntime");
    return r?.state==="RUNNING" && r.elapsed>paused.elapsed+0.05;
  });

  await evaluate(`(()=>{
    const s=document.querySelector("#experiment-select");
    s.value="substrate-smoke";
    s.dispatchEvent(new Event("change",{bubbles:true}));
  })()`);

  await waitFor("experiment switch",async()=>{
    return evaluate(`window.__combatLabRuntime?.activeExperimentId==="substrate-smoke" &&
      document.querySelector("#experiment-title")?.textContent==="Substrate smoke probe" &&
      document.querySelector("#parameter-panel")?.textContent.includes("no editable Workbench parameters")`);
  });

  await evaluate(`(()=>{
    const s=document.querySelector("#experiment-select");
    s.value="embodied-scale-field-v0";
    s.dispatchEvent(new Event("change",{bubbles:true}));
  })()`);

  await waitFor("switch back to S0 Workbench",async()=>{
    return evaluate(`window.__combatLabRuntime?.activeExperimentId==="embodied-scale-field-v0" &&
      document.querySelector("#experiment-title")?.textContent==="Embodied Scale Field S0" &&
      !!document.querySelector('[data-param-id="scale"]')`);
  });

  await evaluate(`(()=>{
    const input=document.querySelector('[data-param-id="scale"] .parameter-number');
    input.value="1.70";
    input.dispatchEvent(new Event("change",{bubbles:true}));
  })()`);

  await waitFor("visual rehearsal state",async()=>{
    const scale=await evaluate("window.__combatLabRuntime?.snapshot?.player?.scale");
    return Math.abs(Number(scale)-1.7)<1e-9;
  });

  await captureScreenshot();

  await evaluate(`(()=>{
    const input=document.querySelector('[data-param-id="scale"] .parameter-number');
    input.value="4.50";
    input.dispatchEvent(new Event("change",{bubbles:true}));
  })()`);

  await waitFor("extreme visual state",async()=>{
    return evaluate(`Math.abs((window.__combatLabRuntime?.snapshot?.player?.scale ?? 0)-4.5)<1e-9 &&
      !document.querySelector('[data-param-id="scale"] .extreme-badge')?.hidden`);
  });
  await captureScreenshot(extremeScreenshotPath);

  await evaluate(`document.querySelector("#restore-defaults").click()`);
  await cdp.send("Emulation.setDeviceMetricsOverride",{
    width:1280,
    height:800,
    deviceScaleFactor:1,
    mobile:false
  });
  await sleep(160);

  const compactLayout=await evaluate(`({
    workspace:document.querySelector(".workspace")?.getBoundingClientRect().width,
    stage:document.querySelector(".stage-column")?.getBoundingClientRect().width,
    inspector:document.querySelector(".inspector")?.getBoundingClientRect().width,
    top:document.querySelector(".inspector")?.getBoundingClientRect().top
  })`);
  if(Number(compactLayout.inspector)<340) throw new Error(`compact Inspector too narrow: ${JSON.stringify(compactLayout)}`);
  if(Number(compactLayout.stage)<700) throw new Error(`compact stage too narrow: ${JSON.stringify(compactLayout)}`);
  await captureScreenshot(compactScreenshotPath);

  const finalState=await evaluate(`({
    runtime:window.__combatLabRuntime,
    numberValue:document.querySelector('[data-param-id="scale"] .parameter-number')?.value,
    build:document.querySelector("#build-id")?.textContent,
    workspaceWidth:document.querySelector(".workspace")?.getBoundingClientRect().width,
    inspectorWidth:document.querySelector(".inspector")?.getBoundingClientRect().width
  })`);

  if(finalState.runtime?.error) throw new Error(`runtime error captured: ${finalState.runtime.error}`);
  if(Number(finalState.inspectorWidth)<320) throw new Error(`Inspector unexpectedly narrow: ${finalState.inspectorWidth}`);

  process.stdout.write(JSON.stringify({
    pass:true,
    initial:first,
    final:{
      state:finalState.runtime.state,
      frames:finalState.runtime.frames,
      elapsed:finalState.runtime.elapsed,
      activeExperimentId:finalState.runtime.activeExperimentId,
      scale:finalState.runtime.snapshot?.player?.scale,
      inspectorValue:finalState.numberValue,
      build:finalState.build,
      inspectorWidth:finalState.inspectorWidth
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
