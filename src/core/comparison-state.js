export const COMPARISON_SNAPSHOT_SCHEMA="combat-lab-comparison-snapshot-v0";

function cloneValue(value){
  return value===undefined ? undefined : structuredClone(value);
}

function requiredText(value,label){
  const text=String(value ?? "").trim();
  if(!text) throw new Error(`${label} required`);
  return text;
}

function normalizeDefinition(definition){
  if(!definition || typeof definition!=="object") throw new Error("comparison definition required");
  const controlIds=Array.isArray(definition.controlIds)
    ? definition.controlIds.map(id=>requiredText(id,"comparison control id"))
    : [];
  if(controlIds.length===0) throw new Error("comparison definition requires controlIds");
  if(new Set(controlIds).size!==controlIds.length) throw new Error("comparison controlIds must be unique");
  return {
    id:requiredText(definition.id,"comparison id"),
    label:requiredText(definition.label || definition.id,"comparison label"),
    controlIds,
    applySemantics:String(definition.applySemantics || "").trim(),
    matchedStartHint:String(definition.matchedStartHint || "").trim()
  };
}

export function buildComparisonSnapshot({
  experimentId,
  simulationTime=null,
  definition,
  descriptors=[],
  values={}
}={}){
  const d=normalizeDefinition(definition);
  const descriptorById=new Map(descriptors.map(item=>[item.id,item]));
  const fields=d.controlIds.map(controlId=>{
    const descriptor=descriptorById.get(controlId);
    if(!descriptor) throw new Error(`comparison control missing descriptor: ${controlId}`);
    if(!Object.prototype.hasOwnProperty.call(values,controlId)){
      throw new Error(`comparison control missing value: ${controlId}`);
    }
    return {
      controlId,
      label:String(descriptor.label || controlId),
      domain:requiredText(descriptor.domain,"comparison field domain"),
      scope:requiredText(descriptor.scope,"comparison field scope"),
      path:requiredText(descriptor.path || controlId,"comparison field path"),
      value:cloneValue(values[controlId])
    };
  });

  const sim=simulationTime===null || simulationTime===undefined ? null : Number(simulationTime);
  return {
    schema:COMPARISON_SNAPSHOT_SCHEMA,
    experimentId:requiredText(experimentId,"comparison experimentId"),
    comparisonId:d.id,
    label:d.label,
    simulationTime:sim!==null && Number.isFinite(sim) ? sim : null,
    applySemantics:d.applySemantics,
    matchedStartHint:d.matchedStartHint,
    fields
  };
}

export function comparisonSnapshotState(snapshot){
  if(!snapshot || snapshot.schema!==COMPARISON_SNAPSHOT_SCHEMA) return {};
  return Object.fromEntries(snapshot.fields.map(field=>[field.controlId,cloneValue(field.value)]));
}

export function comparisonSnapshotScopes(snapshot){
  if(!snapshot || snapshot.schema!==COMPARISON_SNAPSHOT_SCHEMA) return [];
  return [...new Set(snapshot.fields.map(field=>`${field.domain}/${field.scope}`))];
}

function sameValue(a,b){
  return JSON.stringify(a)===JSON.stringify(b);
}

export function diffComparisonSnapshots(a,b){
  if(!a || !b) return [];
  if(a.schema!==COMPARISON_SNAPSHOT_SCHEMA || b.schema!==COMPARISON_SNAPSHOT_SCHEMA){
    throw new Error("comparison diff requires scoped snapshots");
  }
  if(a.experimentId!==b.experimentId || a.comparisonId!==b.comparisonId){
    throw new Error("comparison snapshots are not from the same contract");
  }

  const bById=new Map(b.fields.map(field=>[field.controlId,field]));
  const diffs=[];
  for(const fieldA of a.fields){
    const fieldB=bById.get(fieldA.controlId);
    if(!fieldB) throw new Error(`comparison B missing field: ${fieldA.controlId}`);
    if(!sameValue(fieldA.value,fieldB.value)){
      diffs.push({
        controlId:fieldA.controlId,
        label:fieldA.label,
        domain:fieldA.domain,
        scope:fieldA.scope,
        path:fieldA.path,
        before:cloneValue(fieldA.value),
        after:cloneValue(fieldB.value)
      });
    }
  }
  return diffs;
}

function formatValue(value){
  const n=Number(value);
  if(Number.isFinite(n)){
    return Math.abs(n)>=100 ? n.toFixed(0) : n.toFixed(2);
  }
  if(typeof value==="string") return value;
  return JSON.stringify(value);
}

export function formatComparisonSlot(snapshot){
  if(!snapshot) return "Empty";
  const scopes=comparisonSnapshotScopes(snapshot);
  const fieldWord=snapshot.fields.length===1 ? "field" : "fields";
  return `${snapshot.label} · ${scopes.join(", ")} · ${snapshot.fields.length} ${fieldWord}`;
}

export function formatComparisonDiff(a,b){
  if(!a || !b) return "Capture A and B to inspect exact differences.";
  const diffs=diffComparisonSnapshots(a,b);
  if(diffs.length===0) return "A↔B · no authored differences";
  const shown=diffs.slice(0,2).map(diff=>
    `${diff.label} ${formatValue(diff.before)} → ${formatValue(diff.after)}`
  );
  if(diffs.length>2) shown.push(`+${diffs.length-2}`);
  return `A↔B · ${shown.join(" · ")}`;
}

export function formatComparisonContract(definition,descriptors=[]){
  if(!definition) return "This experiment declares no A/B comparison contract.";
  const d=normalizeDefinition(definition);
  const byId=new Map(descriptors.map(item=>[item.id,item]));
  const scopes=[...new Set(d.controlIds.map(id=>{
    const field=byId.get(id);
    if(!field) return "unknown";
    return `${field.domain}/${field.scope}`;
  }))];
  const parts=[`${d.label} · scope ${scopes.join(", ")}`];
  if(d.applySemantics) parts.push(d.applySemantics);
  if(d.matchedStartHint) parts.push(d.matchedStartHint);
  return parts.join(" · ");
}

export class ComparisonSlotStore {
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

  capture(experimentId,slotName,snapshot){
    if(!this.slotNames.includes(slotName)) throw new Error(`unknown slot: ${slotName}`);
    if(!snapshot || snapshot.schema!==COMPARISON_SNAPSHOT_SCHEMA){
      throw new Error("scoped comparison snapshot required");
    }
    if(snapshot.experimentId!==experimentId){
      throw new Error("comparison snapshot experiment mismatch");
    }
    this.#slotsFor(experimentId)[slotName]=cloneValue(snapshot);
    return this.get(experimentId,slotName);
  }

  get(experimentId,slotName){
    if(!this.slotNames.includes(slotName)) throw new Error(`unknown slot: ${slotName}`);
    const value=this.#slotsFor(experimentId)[slotName];
    return value ? cloneValue(value) : null;
  }

  clear(experimentId,slotName){
    if(!this.slotNames.includes(slotName)) throw new Error(`unknown slot: ${slotName}`);
    this.#slotsFor(experimentId)[slotName]=null;
  }
}
