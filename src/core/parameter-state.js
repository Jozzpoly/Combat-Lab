function cloneState(state){
  if(!state || typeof state!=="object") return {};
  return Object.fromEntries(
    Object.entries(state)
      .filter(([,value])=>Number.isFinite(Number(value)))
      .map(([key,value])=>[key,Number(value)])
  );
}

export class ParameterSlotStore {
  constructor(slotNames=["A","B"]){
    this.slotNames=[...slotNames];
    this.byExperiment=new Map();
  }

  #slotsFor(experimentId){
    if(!this.byExperiment.has(experimentId)){
      this.byExperiment.set(
        experimentId,
        Object.fromEntries(this.slotNames.map(name=>[name,null]))
      );
    }
    return this.byExperiment.get(experimentId);
  }

  capture(experimentId,slotName,state){
    if(!this.slotNames.includes(slotName)) throw new Error(`unknown slot: ${slotName}`);
    const slots=this.#slotsFor(experimentId);
    slots[slotName]=cloneState(state);
    return this.get(experimentId,slotName);
  }

  get(experimentId,slotName){
    if(!this.slotNames.includes(slotName)) throw new Error(`unknown slot: ${slotName}`);
    const value=this.#slotsFor(experimentId)[slotName];
    return value ? cloneState(value) : null;
  }

  clear(experimentId,slotName){
    if(!this.slotNames.includes(slotName)) throw new Error(`unknown slot: ${slotName}`);
    this.#slotsFor(experimentId)[slotName]=null;
  }
}

export function formatParameterSlot(state,labels={}){
  if(!state) return "Empty";
  const entries=Object.entries(state);
  if(entries.length===0) return "No authored parameters";

  const shown=entries.slice(0,2).map(([id,value])=>{
    const label=labels[id] || id;
    const n=Number(value);
    const formatted=Math.abs(n)>=100 ? n.toFixed(0) : n.toFixed(2);
    return `${label} ${formatted}`;
  });

  if(entries.length>2) shown.push(`+${entries.length-2}`);
  return shown.join(" · ");
}
