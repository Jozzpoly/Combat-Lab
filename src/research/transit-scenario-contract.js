export const TRANSIT_SCENARIO_SCHEMA="combat-lab-transit-scenario-s1-v0";

export const TRANSIT_FLOW_MODES=Object.freeze([
  "one-way",
  "counterflow"
]);

export const TRANSIT_TRAJECTORY_MODES=Object.freeze([
  "straight",
  "crossing"
]);

export const TRANSIT_COMPLETION_MODES=Object.freeze([
  "sink-retire",
  "persistent-destination"
]);

export const TRANSIT_BREAK_MODES=Object.freeze([
  "ordinary-valid",
  "intentional-unsafe"
]);

const AXES=Object.freeze([
  "demand",
  "flowMode",
  "trajectoryMode",
  "completionMode",
  "breakMode"
]);

function requiredChoice(value,choices,label){
  const text=String(value ?? "").trim();
  if(!choices.includes(text)){
    throw new Error(`${label} must be one of: ${choices.join(", ")}`);
  }
  return text;
}

function nonNegativeInteger(value,label){
  const n=Number(value);
  if(!Number.isInteger(n) || n<0){
    throw new Error(`${label} must be a non-negative integer`);
  }
  return n;
}

function normalizeDemand(value={}){
  return {
    eastbound:nonNegativeInteger(value.eastbound ?? 0,"demand.eastbound"),
    westbound:nonNegativeInteger(value.westbound ?? 0,"demand.westbound")
  };
}

function same(a,b){
  return JSON.stringify(a)===JSON.stringify(b);
}

export function buildTransitScenarioContract({
  demand={eastbound:0,westbound:0},
  flowMode="counterflow",
  trajectoryMode="straight",
  completionMode="sink-retire",
  breakMode="ordinary-valid"
}={}){
  const normalizedDemand=normalizeDemand(demand);
  const contract={
    schema:TRANSIT_SCENARIO_SCHEMA,
    demand:normalizedDemand,
    flowMode:requiredChoice(flowMode,TRANSIT_FLOW_MODES,"flowMode"),
    trajectoryMode:requiredChoice(
      trajectoryMode,
      TRANSIT_TRAJECTORY_MODES,
      "trajectoryMode"
    ),
    completionMode:requiredChoice(
      completionMode,
      TRANSIT_COMPLETION_MODES,
      "completionMode"
    ),
    breakMode:requiredChoice(breakMode,TRANSIT_BREAK_MODES,"breakMode")
  };

  const totalDemand=normalizedDemand.eastbound+normalizedDemand.westbound;
  const warnings=[];
  if(totalDemand===0) warnings.push("NO_DEMAND");
  if(
    contract.flowMode==="one-way" &&
    normalizedDemand.eastbound>0 &&
    normalizedDemand.westbound>0
  ){
    warnings.push("FLOW_MODE_DEMAND_MISMATCH");
  }
  if(
    contract.flowMode==="counterflow" &&
    (normalizedDemand.eastbound===0 || normalizedDemand.westbound===0)
  ){
    warnings.push("FLOW_MODE_DEMAND_MISMATCH");
  }

  return {
    ...contract,
    totalDemand,
    warnings
  };
}

export function transitScenarioAxisSnapshot(contract){
  if(!contract || contract.schema!==TRANSIT_SCENARIO_SCHEMA){
    throw new Error("transit scenario contract required");
  }
  return {
    demand:structuredClone(contract.demand),
    flowMode:contract.flowMode,
    trajectoryMode:contract.trajectoryMode,
    completionMode:contract.completionMode,
    breakMode:contract.breakMode
  };
}

export function diffTransitScenarioContracts(a,b){
  const aa=transitScenarioAxisSnapshot(a);
  const bb=transitScenarioAxisSnapshot(b);
  return AXES
    .filter(axis=>!same(aa[axis],bb[axis]))
    .map(axis=>({
      axis,
      before:structuredClone(aa[axis]),
      after:structuredClone(bb[axis])
    }));
}

export function matchedTransitScenarioExcept(a,b,allowedAxes=[]){
  const allowed=new Set((allowedAxes || []).map(String));
  return diffTransitScenarioContracts(a,b)
    .every(diff=>allowed.has(diff.axis));
}
