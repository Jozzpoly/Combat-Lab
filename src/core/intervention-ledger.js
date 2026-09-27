export const INTERVENTION_EVENT_SCHEMA="combat-lab-intervention-v0";
export const INTERVENTION_LEDGER_SCHEMA="combat-lab-intervention-ledger-v0";

function cloneValue(value){
  return value===undefined ? undefined : structuredClone(value);
}

function requiredText(value,label){
  const text=String(value ?? "").trim();
  if(!text) throw new Error(`${label} required`);
  return text;
}

function optionalText(value){
  if(value===null || value===undefined) return null;
  const text=String(value).trim();
  return text || null;
}

function normalizeEffect(effect){
  if(!effect || typeof effect!=="object") throw new Error("intervention effect required");
  const normalized={
    domain:requiredText(effect.domain,"effect.domain"),
    scope:requiredText(effect.scope,"effect.scope"),
    path:requiredText(effect.path,"effect.path")
  };

  for(const key of ["before","after","requested"]){
    if(Object.prototype.hasOwnProperty.call(effect,key)){
      normalized[key]=cloneValue(effect[key]);
    }
  }
  return normalized;
}

export class InterventionLedger {
  #now;
  #nextSequence;
  #events;

  constructor({now=()=>Date.now()}={}){
    if(typeof now!=="function") throw new Error("InterventionLedger now() required");
    this.#now=now;
    this.#nextSequence=1;
    this.#events=[];
  }

  record({
    experimentId=null,
    simulationTime=null,
    operation,
    source="owner-ui",
    effects=[],
    detail
  }={}){
    const wallTimeMs=Number(this.#now());
    if(!Number.isFinite(wallTimeMs)) throw new Error("intervention wall clock must be finite");

    const sim=simulationTime===null || simulationTime===undefined
      ? null
      : Number(simulationTime);
    const event={
      schema:INTERVENTION_EVENT_SCHEMA,
      sequence:this.#nextSequence++,
      wallTimeMs,
      experimentId:optionalText(experimentId),
      simulationTime:sim!==null && Number.isFinite(sim) ? sim : null,
      operation:requiredText(operation,"intervention operation"),
      source:requiredText(source,"intervention source"),
      effects:Array.from(effects,normalizeEffect)
    };

    if(detail!==undefined) event.detail=cloneValue(detail);

    this.#events.push(event);
    return cloneValue(event);
  }

  entries(){
    return cloneValue(this.#events);
  }

  snapshot(){
    return {
      schema:INTERVENTION_LEDGER_SCHEMA,
      count:this.#events.length,
      events:this.entries()
    };
  }
}
