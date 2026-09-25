import {spawn} from "node:child_process";
import {setTimeout as sleep} from "node:timers/promises";

const target=process.argv[2] || "http://127.0.0.1:4173/";
const chromeBin=process.env.CHROME_BIN;
if (!chromeBin) throw new Error("CHROME_BIN is required");

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
  for(let i=0;i<80;i++){
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
try{
  const page=await waitForJsonList();
  cdp=createCdp(page.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
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

  async function waitFor(label,predicate,{timeout=4000,interval=80}={}){
    const deadline=Date.now()+timeout;
    let lastValue;
    while(Date.now()<deadline){
      lastValue=await predicate();
      if(lastValue) return lastValue;
      await sleep(interval);
    }
    throw new Error(`${label} timed out; last=${JSON.stringify(lastValue)}`);
  }

  await waitFor("live RUNNING heartbeat",async()=>{
    return evaluate(`(()=>{
      const r=window.__combatLabRuntime;
      return !!r && r.state==="RUNNING" && r.frames>=8 && r.elapsed>0.03 && !r.error;
    })()`);
  });

  const first=await evaluate(`({
    title:document.querySelector("#experiment-title")?.textContent,
    state:window.__combatLabRuntime?.state,
    frames:window.__combatLabRuntime?.frames,
    elapsed:window.__combatLabRuntime?.elapsed,
    experiment:window.__combatLabRuntime?.activeExperimentId,
    scale:window.__combatLabRuntime?.snapshot?.player?.scale,
    source:document.querySelector("#build-id")?.textContent
  })`);

  if(first.title!=="Embodied Scale Field S0") throw new Error(`wrong initial title: ${first.title}`);
  if(first.experiment!=="embodied-scale-field-v0") throw new Error(`wrong active experiment: ${first.experiment}`);
  if(!(first.frames>=8 && first.elapsed>0.03)) throw new Error(`runtime not advancing: ${JSON.stringify(first)}`);

  await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",code:"Digit3",key:"3",windowsVirtualKeyCode:51});
  await sleep(100);
  await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",code:"Digit3",key:"3",windowsVirtualKeyCode:51});

  await waitFor("real experiment input",async()=>{
    const scale=await evaluate("window.__combatLabRuntime?.snapshot?.player?.scale");
    return Number(scale)>1.69;
  });

  await evaluate(`document.querySelector("#reset").click()`);
  await waitFor("experiment reset",async()=>{
    const snap=await evaluate("window.__combatLabRuntime?.snapshot");
    return !!snap && Math.abs((snap.player?.scale ?? 0)-1)<1e-9 && snap.time===0;
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
      document.querySelector("#experiment-title")?.textContent==="Substrate smoke probe"`);
  });

  await evaluate(`(()=>{
    const s=document.querySelector("#experiment-select");
    s.value="embodied-scale-field-v0";
    s.dispatchEvent(new Event("change",{bubbles:true}));
  })()`);

  await waitFor("switch back to S0",async()=>{
    return evaluate(`window.__combatLabRuntime?.activeExperimentId==="embodied-scale-field-v0" &&
      document.querySelector("#experiment-title")?.textContent==="Embodied Scale Field S0"`);
  });

  const finalState=await evaluate("window.__combatLabRuntime");
  if(finalState.error) throw new Error(`runtime error captured: ${finalState.error}`);

  process.stdout.write(JSON.stringify({
    pass:true,
    initial:first,
    final:{
      state:finalState.state,
      frames:finalState.frames,
      elapsed:finalState.elapsed,
      activeExperimentId:finalState.activeExperimentId
    }
  },null,2)+"\n");
} catch(error){
  process.stderr.write(String(error?.stack || error)+"\n");
  if(stderr) process.stderr.write("\nChrome stderr:\n"+stderr.slice(-5000));
  process.exitCode=1;
} finally {
  try{ cdp?.close(); }catch{}
  chrome.kill("SIGTERM");
}
