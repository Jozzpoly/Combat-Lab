// GPT-6 / Combat Lab: isolated, opt-in read-only physical witness for Jaskinia.
// This does NOT serialize Rapier's solver state and cannot restore/replay a world.
// The lab owns its physics and runs normally when opened without Jaskinia.
const PROTOCOL = "jozz-worldbench/v0";
const MAX_BYTES = 32000;

export function installP10JaskiniaWitness(read, perform = null) {
  if (typeof window === "undefined" || window.parent === window) return () => {};
  if (typeof read !== "function") throw new TypeError("witness needs an actual world read function");
  const parent = window.parent;
  let hostOrigin = null, alive = true;
  const runtimeBase = "p10b-" + Date.now() + "-" + Math.random().toString(36).slice(2, 12);
  const performed = new Map(); // idempotent response to duplicate same-id requests
  const target = () => hostOrigin === "null" ? "*" : hostOrigin;
  const send = data => {
    if (!alive || !hostOrigin) return;
    try { parent.postMessage(data, target()); } catch { /* stand-alone physics remains independent */ }
  };
  const sample = () => {
    const value = read();
    if (!value || typeof value !== "object" || !value.trace) throw new Error("No physical source trace");
    const record = {
      specimen: "Combat Lab / P10b",
      runtimeId: runtimeBase + "-g" + Number(value.generation || 0),
      capabilities: {
        ownerGrantedRemoteEdit: !!value.remotePermission,
        operations: ["p10b.aperture.widen","p10b.aperture.narrow"],
        requiresPause: true,
      },
      sourceRevisionClaim: null, // do not pretend a built Pages/CI SHA is known at runtime
      contract: PROTOCOL,
      kind: "read-only-physical-witness",
      restorable: false,
      capturedByLabAt: new Date().toISOString(),
      simulation: value.trace,
      camera: value.camera || null,
      paused: !!value.paused,
      operatorMode: String(value.operatorMode || ""),
    };
    const raw = JSON.stringify(record);
    if (raw.length > MAX_BYTES) throw new Error("Witness over size limit");
    return JSON.parse(raw);
  };
  const sendState = () => {
    try {
      const t = read().trace;
      send({ jaskinia: 1, type: "state",
        text: "P10b · " + (t.tick / 60).toFixed(2) + "s · " + t.actors.length +
          " bodies · " + t.cargo.length + " loads · " + t.grips.length + " grips",
        data: { fixture: t.fixture, tick: t.tick, selected: t.selected,
          entities: t.worldEntities, aperture: t.aperture?.width, restorable: false } });
      send({ jaskinia: 1, type: "signals",
        values: { tick: t.tick, bodies: t.actors.length, cargo: t.cargo.length,
          grips: t.grips.length, effort: t.rootEffort } });
    } catch { /* a frame must not break the physics runtime */ }
  };
  const onMessage = ev => {
    if (!alive || ev.source !== parent || !ev.data || typeof ev.data !== "object") return;
    const d = ev.data;
    if (d.jaskinia === 1 && d.type === "hi") {
      // Establish the parent origin from a direct parent handshake; no owner data is read.
      if (hostOrigin === null) hostOrigin = ev.origin || "null";
      if (ev.origin !== hostOrigin) return;
      send({ jaskinia: 1, type: "hello", name: "Combat Lab · P10b",
        version: "worldbench witness v0", wants: ["evidence"] });
      sendState();
      return;
    }
    if (hostOrigin === null || ev.origin !== hostOrigin) return;
    if (d.jaskinia === 1 && d.type === "state?") {
      sendState();
    } else if (d.protocol === PROTOCOL && d.type === "capture?" &&
               typeof d.id === "string" && /^[a-z0-9_-]{1,80}$/i.test(d.id)) {
      try {
        send({ protocol: PROTOCOL, type: "capture", id: d.id, ok: true, record: sample() });
      } catch (err) {
        send({ protocol: PROTOCOL, type: "capture", id: d.id, ok: false,
          error: String(err?.message || err).slice(0,180) });
      }
    } else if (d.protocol === PROTOCOL && d.type === "action?" &&
               typeof d.id === "string" && /^[a-z0-9_-]{1,80}$/i.test(d.id)) {
      let receipt = performed.get(d.id);
      if (!receipt) {
        try {
          const value=read();
          if(!value.remotePermission) throw Error("owner-opt-in-required");
          if(typeof perform!=="function") throw Error("source-has-no-edit-handler");
          const expected=d.expected;
          const current=runtimeBase+"-g"+Number(value.generation||0);
          if(!expected || expected.runtimeId!==current) throw Error("stale-runtime");
          if(!value.paused) throw Error("pause-required");
          if(!Number.isFinite(expected.aperture) ||
             expected.aperture!==value.trace.aperture.width ||
             expected.edits!==value.trace.materialEvents.edits) throw Error("stale-physical-state");
          if(!["p10b.aperture.widen","p10b.aperture.narrow"].includes(d.action))
            throw Error("unsupported-source-operation");
          const result=perform(d.action,expected);
          if(!result?.ok) throw Error(String(result?.error||"source-rejected"));
          receipt={protocol:PROTOCOL,type:"action",id:d.id,ok:true,result,
            record:sample()};
          send({jaskinia:1,type:"event",level:"uwaga",
            text:"Wykonano fizyczną edycję szczeliny z uprawnionego narzędzia Worldbench."});
        }catch(err){
          receipt={protocol:PROTOCOL,type:"action",id:d.id,ok:false,
            error:String(err?.message||err).slice(0,180)};
        }
        performed.set(d.id,receipt);
        if(performed.size>100)performed.delete(performed.keys().next().value);
      }
      send(receipt);
    }
  };
  window.addEventListener("message", onMessage);
  // The parent may send its initial "hi" before async Rapier module evaluation
  // finishes. Announce non-sensitive identity proactively, like the legacy drop-in.
  // Source data still requires a direct parent handshake first.
  try { parent.postMessage({ jaskinia: 1, type: "hello",
    name: "Combat Lab · P10b", version: "worldbench witness v0",
    wants: ["evidence"] }, "*"); } catch { /* standalone execution stays independent */ }
  const interval = window.setInterval(() => { if (hostOrigin) sendState(); }, 1000);
  return () => { alive = false; window.clearInterval(interval); window.removeEventListener("message", onMessage); };
}
