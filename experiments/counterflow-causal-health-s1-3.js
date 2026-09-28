import {
  counterflowTransitSnapshot,
  createCounterflowTransitState,
  stepCounterflowTransitState
} from "../src/research/counterflow-transit.js";
import {buildTransitScenarioContract} from "../src/research/transit-scenario-contract.js";
import {
  counterflowSubjectCausalDrilldown,
  createCounterflowCausalObserver,
  observeCounterflowCausalHealth,
  probeCounterflowCurrentContacts
} from "../src/research/counterflow-causal-observation.js";

const WORLD={width:1200,height:400};
const DEFAULTS={eastboundDemand:16,westboundDemand:16};
const DEMAND_RAILS={
  softMin:1,
  softMax:64,
  hardMin:1,
  hardMax:10000,
  step:1
};

function integerDemand(value){
  const n=Number(value);
  if(!Number.isFinite(n)) return 1;
  return Math.max(DEMAND_RAILS.hardMin,Math.min(DEMAND_RAILS.hardMax,Math.round(n)));
}

function scenario(authored){
  return buildTransitScenarioContract({
    demand:{
      eastbound:authored.eastboundDemand,
      westbound:authored.westboundDemand
    },
    flowMode:"counterflow",
    trajectoryMode:"straight",
    completionMode:"sink-retire",
    breakMode:"ordinary-valid"
  });
}

function createState(authored){
  return createCounterflowTransitState({
    scenario:scenario(authored),
    world:WORLD,
    trialDuration:3600
  });
}

function idsText(ids){
  return Array.isArray(ids) && ids.length ? ids.join(", ") : "—";
}

function ratioText(value){
  return Number.isFinite(value) ? value.toFixed(2)+"×" : "—";
}

function percentText(value){
  return Number.isFinite(value) ? (value*100).toFixed(0)+"%" : "—";
}

function numberText(value,decimals=2){
  return Number.isFinite(value) ? Number(value).toFixed(decimals) : "—";
}

function bodyById(state,id){
  return state.bodies.find(body=>body.id===id) || null;
}

function geometryPartners(probe,id){
  if(!probe || !id) return [];
  const partners=new Set();
  for(const pair of probe.pairs || []){
    if(pair.a===id) partners.add(pair.b);
    if(pair.b===id) partners.add(pair.a);
  }
  return [...partners].sort((a,b)=>a.localeCompare(b));
}

export const counterflowCausalHealthS13={
  id:"counterflow-causal-health-s1-3",
  title:"Counterflow Causal Health S1-3",
  kind:"research",
  purpose:"Observe clean two-sided pressure as separate flow, behavior, contact/solver, runtime and validity truths; drill from a suspicious cohort into one body without adding crowd behavior authority.",
  controls:"Autonomous straight counterflow · edit next-reset demand · click a body for an explicit geometry/contact drilldown · wheel zoom · middle-drag pan",
  camera:{bounds:{x:0,y:0,width:WORLD.width,height:WORLD.height}},

  create({runtimePerformance=null}={}){
    const authored={...DEFAULTS};
    let state=createState(authored);
    let observer=createCounterflowCausalObserver();
    let selectedId=null;
    let lastProbe=null;

    const runtimeSnapshot=()=>runtimePerformance?.snapshot?.() ?? null;

    let macro=observeCounterflowCausalHealth(
      observer,
      state,
      {runtimeSnapshot:runtimeSnapshot()}
    );

    function refreshMacro(options={}){
      macro=observeCounterflowCausalHealth(
        observer,
        state,
        {
          runtimeSnapshot:runtimeSnapshot(),
          currentContactProbe:options.currentContactProbe || null
        }
      );
      return macro;
    }

    function refreshGeometryProbe(){
      lastProbe=probeCounterflowCurrentContacts(state);
      refreshMacro({currentContactProbe:lastProbe});
      return lastProbe;
    }

    function selectedSubject(){
      if(!selectedId) return null;
      const body=bodyById(state,selectedId);
      if(!body) return null;
      let current=null;
      try{
        current=counterflowSubjectCausalDrilldown(observer,selectedId);
      }catch{
        return null;
      }
      return {
        ...current,
        geometryProbe:{
          available:Boolean(lastProbe),
          ageSeconds:lastProbe ? Math.max(0,state.time-lastProbe.time) : null,
          partners:geometryPartners(lastProbe,selectedId),
          maxResidualPenetration:lastProbe?.maxResidualPenetration ?? null
        }
      };
    }

    function rebuild(){
      state=createState(authored);
      observer=createCounterflowCausalObserver();
      selectedId=null;
      lastProbe=null;
      macro=observeCounterflowCausalHealth(
        observer,
        state,
        {runtimeSnapshot:runtimeSnapshot()}
      );
    }

    const inspector={
      schema:{
        comparison:{
          id:"counterflow-demand",
          label:"Counterflow demand",
          controlIds:["eastboundDemand","westboundDemand"],
          applySemantics:"Apply only authored source demand for the next reset; current physical trial remains untouched.",
          matchedStartHint:"Reset World after applying A/B before interpreting pressure differences."
        },
        groups:[
          {
            id:"demand",
            label:"Next-reset demand",
            description:"Exact two-sided authored demand. Soft range is convenience only; the explicit safety rail remains far wider.",
            provenance:{domain:"scenario",scope:"counterflow-demand"},
            controls:[
              {
                id:"eastboundDemand",
                type:"number",
                label:"Eastbound",
                default:DEFAULTS.eastboundDemand,
                ...DEMAND_RAILS,
                decimals:0
              },
              {
                id:"westboundDemand",
                type:"number",
                label:"Westbound",
                default:DEFAULTS.westboundDemand,
                ...DEMAND_RAILS,
                decimals:0
              }
            ]
          }
        ],
        liveGroups:[
          {
            id:"flow",
            label:"Flow / pressure",
            description:"Demand, source backlog, active transit and completion remain different facts.",
            values:[
              {id:"demanded",label:"Demanded",decimals:0},
              {id:"queued",label:"Source backlog",decimals:0},
              {id:"active",label:"Active transit",decimals:0},
              {id:"completed",label:"Completed",decimals:0},
              {id:"admissionRate",label:"Admission rate",decimals:1},
              {id:"completionRate",label:"Completion rate",decimals:1}
            ]
          },
          {
            id:"behavior",
            label:"Behavior cohort",
            description:"Macro anomaly first. Stalled bodies receive a stronger viewport outline so one can be selected deliberately.",
            values:[
              {id:"progressing",label:"Progressing",decimals:0},
              {id:"pending",label:"Pending evidence",decimals:0},
              {id:"stalled",label:"Stalled",decimals:0},
              {id:"solverContactBodies",label:"Solver-step contact bodies",decimals:0}
            ]
          },
          {
            id:"subject",
            label:"Selected subject",
            description:"Click one body. Geometry/contact detail is probed explicitly at selection time rather than globally every frame.",
            values:[
              {id:"selectedId",label:"Participant",format:value=>String(value || "click a body")},
              {id:"subjectSide",label:"Flow side",format:value=>String(value || "—")},
              {id:"subjectProgress",label:"Progress state",format:value=>String(value || "—")},
              {id:"subjectNoProgress",label:"Since material progress",format:value=>Number.isFinite(value) ? value.toFixed(2)+" s" : "—"},
              {id:"subjectSolverPartners",label:"Solver-step partners",format:value=>String(value || "—")},
              {id:"subjectGeometryPartners",label:"Last geometry partners",format:value=>String(value || "—")},
              {id:"subjectProbeAge",label:"Geometry probe age",format:value=>Number.isFinite(value) ? value.toFixed(2)+" s" : "—"}
            ]
          },
          {
            id:"solver",
            label:"Contact / solver",
            description:"Current work, historical saturation and explicit geometry probes are not interchangeable.",
            values:[
              {id:"pairChecks",label:"Pair checks this step",decimals:0},
              {id:"contactResolutions",label:"Contact resolutions",decimals:0},
              {id:"solverIterations",label:"Solver iterations",format:value=>String(value || "0")},
              {id:"recentSaturation",label:"Recent cap saturation",format:percentText},
              {id:"probePenetration",label:"Last probe max penetration",format:value=>numberText(value,4)},
              {id:"probeAge",label:"Last probe age",format:value=>Number.isFinite(value) ? value.toFixed(2)+" s" : "not probed"}
            ]
          },
          {
            id:"runtime",
            label:"Runtime",
            description:"Performance evidence stays independent from behavioral and solver interpretation.",
            values:[
              {id:"simWall",label:"Simulation / wall",format:ratioText},
              {id:"discardedWall",label:"Discarded wall time",format:value=>Number.isFinite(value) ? value.toFixed(3)+" s" : "—"},
              {id:"simulationMs",label:"Window simulation cost",format:value=>Number.isFinite(value) ? value.toFixed(1)+" ms" : "—"},
              {id:"observationMs",label:"Window observation cost",format:value=>Number.isFinite(value) ? value.toFixed(1)+" ms" : "—"}
            ]
          },
          {
            id:"validity",
            label:"Validity",
            description:"Ordinary-valid admission truth stays distinct from later solver penetration or congestion.",
            values:[
              {id:"breakMode",label:"Break mode",format:value=>String(value || "—")},
              {id:"invalidAdmissions",label:"Invalid admissions",decimals:0},
              {id:"activeParity",label:"Physical = ledger active",format:value=>value ? "YES" : "NO"},
              {id:"boundaryViolations",label:"Boundary violations",decimals:0}
            ]
          },
        ]
      },

      get(id){
        if(Object.prototype.hasOwnProperty.call(authored,id)) return authored[id];
        return undefined;
      },

      set(id,value){
        if(!Object.prototype.hasOwnProperty.call(authored,id)) return;
        authored[id]=integerDemand(value);
      },

      reset(id){
        if(Object.prototype.hasOwnProperty.call(DEFAULTS,id)){
          authored[id]=DEFAULTS[id];
        }
      },

      restoreDefaults(){
        Object.assign(authored,DEFAULTS);
      },

      getLive(id){
        const subject=selectedSubject();
        const runtime=macro.runtime?.snapshot;
        if(id==="demanded") return macro.flow.demanded;
        if(id==="queued") return macro.flow.queued;
        if(id==="active") return macro.flow.active;
        if(id==="completed") return macro.flow.completed;
        if(id==="admissionRate") return macro.flow.admissionRate;
        if(id==="completionRate") return macro.flow.completionRate;
        if(id==="progressing") return macro.behavior.progressing.count;
        if(id==="pending") return macro.behavior.pending.count;
        if(id==="stalled") return macro.behavior.stalled.count;
        if(id==="solverContactBodies") return macro.contact.solverStep.bodyCount;
        if(id==="pairChecks") return macro.solver.current.pairChecks;
        if(id==="contactResolutions") return macro.solver.current.contactResolutions;
        if(id==="solverIterations"){
          return macro.solver.current.iterationsUsed+"/"+macro.solver.current.iterationLimit;
        }
        if(id==="recentSaturation"){
          return macro.solver.historical.recentSampleSaturationFraction;
        }
        if(id==="probePenetration") return lastProbe?.maxResidualPenetration ?? NaN;
        if(id==="probeAge") return lastProbe ? Math.max(0,state.time-lastProbe.time) : NaN;
        if(id==="simWall") return runtime?.simulationToWallRatio ?? NaN;
        if(id==="discardedWall") return runtime?.discardedWallSeconds ?? NaN;
        if(id==="simulationMs") return runtime?.phaseMs?.simulation ?? NaN;
        if(id==="observationMs") return runtime?.phaseMs?.observation ?? NaN;
        if(id==="breakMode") return macro.validity.breakMode;
        if(id==="invalidAdmissions") return macro.validity.invalidAdmissionCount;
        if(id==="activeParity") return macro.validity.physicalLedgerActiveMatch;
        if(id==="boundaryViolations") return macro.validity.boundaryViolationCount;
        if(id==="selectedId") return selectedId;
        if(id==="subjectSide") return subject?.subject?.side || "";
        if(id==="subjectProgress") return subject?.subject?.progressState || "";
        if(id==="subjectNoProgress") return subject?.subject?.secondsSinceMaterialProgress ?? NaN;
        if(id==="subjectSolverPartners") return idsText(subject?.contact?.solverStepPartners);
        if(id==="subjectGeometryPartners") return idsText(subject?.geometryProbe?.partners);
        if(id==="subjectProbeAge") return subject?.geometryProbe?.ageSeconds ?? NaN;
        return undefined;
      }
    };

    return {
      step(_input,dt){
        stepCounterflowTransitState(state,dt);
        if(selectedId && !bodyById(state,selectedId)){
          selectedId=null;
          lastProbe=null;
        }
        refreshMacro();
      },

      render(ctx,view,{camera=null}={}){
        if(!camera) return;
        const zoom=camera.zoom;
        const stalled=new Set(macro.behavior.stalled.ids);
        const pending=new Set(macro.behavior.pending.ids);

        ctx.save();
        camera.apply(ctx,view);

        ctx.fillStyle="#101821";
        ctx.fillRect(0,0,WORLD.width,WORLD.height);
        ctx.strokeStyle="#506071";
        ctx.lineWidth=2/zoom;
        ctx.strokeRect(0,0,WORLD.width,WORLD.height);

        for(const [side,source] of Object.entries(state.sources)){
          ctx.strokeStyle=side==="eastbound" ? "#4d9fe0" : "#c78755";
          ctx.lineWidth=2/zoom;
          ctx.beginPath();
          ctx.moveTo(source.x,0);
          ctx.lineTo(source.x,WORLD.height);
          ctx.stroke();
        }

        for(const body of state.bodies){
          const selected=body.id===selectedId;
          ctx.fillStyle=body.flowSide==="eastbound" ? "#4d9fe0" : "#c78755";
          if(selected) ctx.strokeStyle="#ffffff";
          else if(stalled.has(body.id)) ctx.strokeStyle="#ff6b6b";
          else if(pending.has(body.id)) ctx.strokeStyle="#e6c36a";
          else ctx.strokeStyle="rgba(220,235,248,.72)";
          ctx.lineWidth=(selected ? 4 : stalled.has(body.id) ? 3 : 1.5)/zoom;
          ctx.beginPath();
          ctx.arc(body.x,body.y,body.radius,0,Math.PI*2);
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();

        ctx.fillStyle="rgba(9,12,16,.82)";
        ctx.fillRect(12,12,430,selectedId ? 68 : 50);
        ctx.fillStyle="#dbe8f4";
        ctx.font="12px ui-monospace, monospace";
        ctx.fillText(
          "demand "+macro.flow.demanded+
          " · queued "+macro.flow.queued+
          " · active "+macro.flow.active+
          " · done "+macro.flow.completed,
          22,31
        );
        ctx.fillText(
          "progress "+macro.behavior.progressing.count+
          " · stalled "+macro.behavior.stalled.count+
          " · contact "+macro.contact.solverStep.bodyCount+
          " · solve "+macro.solver.current.iterationsUsed+"/"+macro.solver.current.iterationLimit,
          22,49
        );
        if(selectedId){
          const subject=selectedSubject();
          ctx.fillText(
            selectedId+" · "+(subject?.subject?.progressState || "—")+
            " · probe "+(lastProbe ? Math.max(0,state.time-lastProbe.time).toFixed(2)+" s old" : "none"),
            22,67
          );
        }
      },

      reset(){
        rebuild();
      },

      pick({screen,camera,view}={}){
        if(!camera || !screen || !view) return null;
        const world=camera.screenToWorld(screen,view);
        let best=null;
        for(const body of state.bodies){
          const distance=Math.hypot(world.x-body.x,world.y-body.y);
          const threshold=body.radius+10/camera.zoom;
          if(distance>threshold) continue;
          if(!best || distance<best.distance || (
            Math.abs(distance-best.distance)<1e-9 &&
            body.id.localeCompare(best.id)<0
          )){
            best={id:body.id,distance};
          }
        }
        const before=selectedId;
        selectedId=best?.id || null;
        lastProbe=selectedId ? refreshGeometryProbe() : null;
        return {
          before,
          after:selectedId,
          inspectorMode:"observe"
        };
      },

      inspector,

      query(name){
        if(name==="macro-causal-health") return structuredClone(macro);
        if(name==="current-contact-probe"){
          return structuredClone(refreshGeometryProbe());
        }
        if(name==="selected-subject"){
          const subject=selectedSubject();
          return subject ? structuredClone(subject) : null;
        }
        if(name==="transit-state"){
          return counterflowTransitSnapshot(state);
        }
        return null;
      },

      snapshot(){
        return {
          transit:counterflowTransitSnapshot(state),
          macro:structuredClone(macro),
          selectedId,
          authored:structuredClone(authored),
          lastGeometryProbeTime:lastProbe?.time ?? null
        };
      }
    };
  }
};
