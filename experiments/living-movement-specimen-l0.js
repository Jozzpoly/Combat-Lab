import {
  LIVING_MOVEMENT_WORLD,
  createLivingMovementState,
  externallyPlaceLivingMovementBody,
  livingMovementActorSnapshot,
  livingMovementActorTrace,
  livingMovementSnapshot,
  setLivingMovementPolicy,
  stepLivingMovementState
} from "../src/research/living-movement.js";

const DEFAULTS={
  population:16,
  prospectionHorizon:0.72,
  effortHistoryStrength:1,
  safetyGap:10
};

const RAILS={
  population:{softMin:8,softMax:24,hardMin:4,hardMax:32,step:1},
  prospectionHorizon:{softMin:0,softMax:1.2,hardMin:0,hardMax:2.5,step:0.04},
  effortHistoryStrength:{softMin:0,softMax:1.5,hardMin:0,hardMax:4,step:0.05},
  safetyGap:{softMin:0,softMax:18,hardMin:0,hardMax:60,step:1}
};

function clamp(value,min,max){
  return Math.max(min,Math.min(max,value));
}

function createState(authored){
  return createLivingMovementState({
    count:authored.population,
    prospectionHorizon:authored.prospectionHorizon,
    effortHistoryStrength:authored.effortHistoryStrength,
    safetyGap:authored.safetyGap
  });
}

function formatActivity(subject){
  if(!subject) return "—";
  return subject.activity.sourceSide+" → "+subject.activity.exitSide+
    " band "+subject.activity.exitBand.center.toFixed(0)+"±"+
    subject.activity.exitBand.half.toFixed(0);
}

function formatReason(subject){
  return subject?.decision?.reason || "—";
}

function drawVector(ctx,from,vector,scale,color,lineWidth){
  ctx.save();
  ctx.strokeStyle=color;
  ctx.lineWidth=lineWidth;
  ctx.beginPath();
  ctx.moveTo(from.x,from.y);
  ctx.lineTo(from.x+vector.x*scale,from.y+vector.y*scale);
  ctx.stroke();
  ctx.restore();
}

export const livingMovementSpecimenL0={
  id:"living-movement-specimen-l0",
  title:"Living Movement Specimen L0",
  kind:"research",
  purpose:"First falsifiable organism specimen: bounded motor demand, material body/world realization, short local prospection and smooth effort-history effects without crowd scripts.",
  controls:"Click organism → causal Observe · Shift+left-drag selected organism = external perturbation · wheel zoom · middle-drag pan · Population applies on Reset World",
  camera:{
    bounds:{x:0,y:0,width:LIVING_MOVEMENT_WORLD.width,height:LIVING_MOVEMENT_WORLD.height}
  },

  create(){
    const authored={...DEFAULTS};
    let state=createState(authored);
    let selectedId=null;
    let latestCamera=null;
    let latestView=null;
    let externalDragActive=false;

    function subject(){
      return selectedId ? livingMovementActorSnapshot(state,selectedId) : null;
    }

    const inspector={
      schema:{
        comparison:{
          id:"living-movement-policy",
          label:"Living movement policy",
          controlIds:["prospectionHorizon","effortHistoryStrength","safetyGap"],
          applySemantics:"Policy changes apply live. Population is excluded because it defines a new matched start.",
          matchedStartHint:"Reset World for matched population starts."
        },
        groups:[
          {
            id:"pressure",
            provenance:{domain:"world",scope:"trial"},
            label:"Pressure",
            description:"Population is exact on Reset World. L0 deliberately stops at 32 rather than pretending crowd-scale qualification.",
            controls:[
              {
                id:"population",type:"number",label:"Population on reset",
                description:"Independent edge-to-edge activities. First N actor specs remain stable when population grows.",
                default:DEFAULTS.population,...RAILS.population,decimals:0,
                anchors:[
                  {label:"8 readable",value:8},
                  {label:"16 baseline",value:16},
                  {label:"24 pressure",value:24},
                  {label:"32 limit",value:32}
                ]
              }
            ]
          },
          {
            id:"organism",
            provenance:{domain:"organism",scope:"population"},
            label:"Organism",
            description:"Research knobs, not accepted Feniks semantics. Zero values deliberately remove candidate mechanisms.",
            controls:[
              {
                id:"prospectionHorizon",type:"number",label:"Prospection horizon",
                description:"Seconds used only for local constant-velocity neighbour evidence. 0 removes future projection.",
                unit:"s",default:DEFAULTS.prospectionHorizon,...RAILS.prospectionHorizon,decimals:2,
                anchors:[
                  {label:"None",value:0},
                  {label:"Short",value:0.4},
                  {label:"Base",value:0.72},
                  {label:"Long",value:1.2}
                ]
              },
              {
                id:"effortHistoryStrength",type:"number",label:"Effort-history effect",
                description:"How strongly accumulated embodied load deforms later motor capability. 0 removes the effect.",
                default:DEFAULTS.effortHistoryStrength,...RAILS.effortHistoryStrength,decimals:2,
                anchors:[
                  {label:"Off",value:0},
                  {label:"Base",value:1},
                  {label:"Strong",value:1.8}
                ]
              },
              {
                id:"safetyGap",type:"number",label:"Prospective surface margin",
                description:"Candidate continuation margin only. It is not a personal-space collider.",
                unit:"px",default:DEFAULTS.safetyGap,...RAILS.safetyGap,decimals:0,
                anchors:[
                  {label:"Contact OK",value:0},
                  {label:"Base",value:10},
                  {label:"Wide",value:20}
                ]
              }
            ]
          }
        ],
        liveGroups:[
          {
            id:"world",
            label:"World now",
            values:[
              {id:"active",label:"Active",decimals:0},
              {id:"completed",label:"Completed",decimals:0},
              {id:"contacts",label:"Contact resolutions",decimals:0},
              {id:"averageLoad",label:"Avg effort history",decimals:3},
              {id:"averageCapability",label:"Avg capability",decimals:3}
            ]
          },
          {
            id:"subject",
            label:"Selected organism",
            description:"Demand → body/world realization → evidence. No private access to another actor's intent is used by L0.",
            values:[
              {id:"selectedId",label:"Organism",format:value=>String(value || "click an organism")},
              {id:"activity",label:"Activity",format:value=>String(value || "—")},
              {id:"continuation",label:"Continuation",format:value=>String(value || "—")},
              {id:"why",label:"Why now",format:value=>String(value || "—")},
              {id:"neighbours",label:"Relevant neighbours",decimals:0},
              {id:"predictedGap",label:"Predicted surface gap",decimals:1},
              {id:"demandSpeed",label:"Demand speed",decimals:1},
              {id:"realizedSpeed",label:"Realized speed",decimals:1},
              {id:"demandError",label:"Demand↔outcome error",decimals:1},
              {id:"demandTurn",label:"Demand turn this step",decimals:1,unit:"°"},
              {id:"demandVectorDelta",label:"Demand vector change",decimals:2},
              {id:"outcomeTurnError",label:"Demand↔outcome turn",decimals:1,unit:"°"},
              {id:"activityProgress",label:"Activity progress this step",decimals:3},
              {id:"realizedDisplacement",label:"Realized displacement",decimals:3},
              {id:"sameLabelDemandFrames",label:"Same-label demand-change frames",decimals:0},
              {id:"sameLabelDemandTurn",label:"Same-label demand turn total",decimals:1,unit:"°"},
              {id:"externalMoves",label:"External perturbation samples",decimals:0},
              {id:"externalActive",label:"Owner hand",format:value=>value ? "ACTIVE" : "—"},
              {id:"effortLoad",label:"Effort history",decimals:3},
              {id:"capability",label:"Capability scale",decimals:3},
              {id:"motorUse",label:"Motor use",decimals:3}
            ]
          }
        ]
      },

      get(id){
        return authored[id];
      },

      set(id,value){
        if(id==="population"){
          authored.population=Math.round(clamp(Number(value),RAILS.population.hardMin,RAILS.population.hardMax));
          return;
        }
        if(id==="prospectionHorizon"){
          authored.prospectionHorizon=clamp(Number(value),RAILS.prospectionHorizon.hardMin,RAILS.prospectionHorizon.hardMax);
        }else if(id==="effortHistoryStrength"){
          authored.effortHistoryStrength=clamp(Number(value),RAILS.effortHistoryStrength.hardMin,RAILS.effortHistoryStrength.hardMax);
        }else if(id==="safetyGap"){
          authored.safetyGap=clamp(Number(value),RAILS.safetyGap.hardMin,RAILS.safetyGap.hardMax);
        }else{
          return;
        }
        setLivingMovementPolicy(state,id,authored[id]);
      },

      reset(id){
        if(!(id in DEFAULTS)) return;
        authored[id]=DEFAULTS[id];
        if(id!=="population") setLivingMovementPolicy(state,id,authored[id]);
      },

      restoreDefaults(){
        Object.assign(authored,DEFAULTS);
        setLivingMovementPolicy(state,"prospectionHorizon",authored.prospectionHorizon);
        setLivingMovementPolicy(state,"effortHistoryStrength",authored.effortHistoryStrength);
        setLivingMovementPolicy(state,"safetyGap",authored.safetyGap);
      },

      getLive(id){
        const world=livingMovementSnapshot(state);
        const selected=subject();
        if(id==="active") return world.active;
        if(id==="completed") return world.completed;
        if(id==="contacts") return world.contactResolutionsThisStep;
        if(id==="averageLoad") return world.averageEffortLoad;
        if(id==="averageCapability") return world.averageCapabilityScale;
        if(id==="selectedId") return selectedId;
        if(id==="activity") return formatActivity(selected);
        if(id==="continuation") return selected?.continuation?.id || "—";
        if(id==="why") return formatReason(selected);
        if(id==="neighbours") return selected?.decision?.neighbourCount ?? NaN;
        if(id==="predictedGap") return selected?.decision?.minPredictedSurfaceGap ?? NaN;
        if(id==="demandSpeed"){
          const v=selected?.decision?.demandedVelocity;
          return v ? Math.hypot(v.x,v.y) : NaN;
        }
        if(id==="realizedSpeed"){
          const v=selected?.outcome?.realizedVelocity;
          return v ? Math.hypot(v.x,v.y) : NaN;
        }
        if(id==="demandError") return selected?.outcome?.demandOutcomeError ?? NaN;
        if(id==="demandTurn") return selected?.outcome
          ? selected.outcome.demandAngleDelta*180/Math.PI
          : NaN;
        if(id==="demandVectorDelta") return selected?.outcome?.demandVectorDelta ?? NaN;
        if(id==="outcomeTurnError") return selected?.outcome
          ? selected.outcome.demandOutcomeAngularError*180/Math.PI
          : NaN;
        if(id==="activityProgress") return selected?.outcome?.activityProgress ?? NaN;
        if(id==="realizedDisplacement") return selected?.outcome?.realizedDisplacement ?? NaN;
        if(id==="sameLabelDemandFrames") return selected?.demandTelemetry?.sameLabelDemandChangeFrames ?? NaN;
        if(id==="sameLabelDemandTurn") return selected?.demandTelemetry
          ? selected.demandTelemetry.sameLabelDemandAngularChurn*180/Math.PI
          : NaN;
        if(id==="externalMoves") return selected?.externalPerturbationCount ?? NaN;
        if(id==="externalActive") return Boolean(externalDragActive && selectedId);
        if(id==="effortLoad") return selected?.body?.effortLoad ?? NaN;
        if(id==="capability") return selected?.body?.capabilityScale ?? NaN;
        if(id==="motorUse") return selected?.body?.motorUse ?? NaN;
        return undefined;
      }
    };

    return {
      step(input,dt){
        const shift=Boolean(
          input?.keys?.includes("ShiftLeft") ||
          input?.keys?.includes("ShiftRight")
        );
        const leftDown=Boolean(input?.buttons?.includes(0));
        externalDragActive=Boolean(
          selectedId &&
          shift &&
          leftDown &&
          input?.pointer?.valid &&
          latestCamera &&
          latestView
        );

        if(externalDragActive){
          const world=latestCamera.screenToWorld(input.pointer,latestView);
          externallyPlaceLivingMovementBody(
            state,
            selectedId,
            world,
            {zeroVelocity:true,source:"owner-shift-drag"}
          );
        }

        stepLivingMovementState(state,dt);
        if(selectedId && !state.bodies.some(body=>body.id===selectedId)){
          selectedId=null;
          externalDragActive=false;
        }
      },

      render(ctx,view,{debug=false,camera=null}={}){
        if(!camera) return;
        latestCamera=camera;
        latestView=view;
        const zoom=camera.zoom;

        ctx.save();
        camera.apply(ctx,view);
        ctx.fillStyle="#0f171f";
        ctx.fillRect(0,0,LIVING_MOVEMENT_WORLD.width,LIVING_MOVEMENT_WORLD.height);
        ctx.strokeStyle="#506071";
        ctx.lineWidth=2/zoom;
        ctx.strokeRect(0,0,LIVING_MOVEMENT_WORLD.width,LIVING_MOVEMENT_WORLD.height);

        for(const body of state.bodies){
          const actor=state.actors[body.id];
          const selected=body.id===selectedId;
          const load=Math.min(1,actor.effortLoad/1.2);
          const base=body.id.charCodeAt(body.id.length-1)%3;
          ctx.fillStyle=["#4d9fe0","#62b884","#b78358"][base];
          ctx.globalAlpha=0.82+0.18*(1-load);
          ctx.strokeStyle=selected ? "#ffffff" : "rgba(220,235,248,.72)";
          ctx.lineWidth=(selected ? 4 : 1.5)/zoom;
          ctx.beginPath();
          ctx.arc(body.x,body.y,body.radius,0,Math.PI*2);
          ctx.fill();
          ctx.stroke();
          ctx.globalAlpha=1;
        }

        const selected=subject();
        if(selected?.body){
          const p=selected.body.position;
          drawVector(
            ctx,p,selected.decision.demandedVelocity,0.28,
            "rgba(140,220,255,.95)",2/zoom
          );
          if(selected.outcome){
            drawVector(
              ctx,p,selected.outcome.realizedVelocity,0.28,
              "rgba(255,199,112,.95)",2/zoom
            );
          }
          if(debug){
            ctx.strokeStyle="rgba(180,210,235,.35)";
            ctx.lineWidth=1/zoom;
            ctx.beginPath();
            ctx.arc(p.x,p.y,230,0,Math.PI*2);
            ctx.stroke();
          }
        }

        ctx.restore();

        const world=livingMovementSnapshot(state);
        ctx.fillStyle="rgba(9,12,16,.80)";
        ctx.fillRect(12,12,355,selectedId ? 60 : 40);
        ctx.fillStyle="#dbe8f4";
        ctx.font="12px ui-monospace, monospace";
        ctx.fillText(
          "active "+world.active+" · complete "+world.completed+
          " · contacts "+world.contactResolutionsThisStep+
          " · capability "+world.averageCapabilityScale.toFixed(2),
          22,31
        );
        if(selectedId){
          const s=subject();
          ctx.fillText(
            selectedId+" · "+(s?.continuation?.id || "—")+
            " · "+(s?.decision?.reason || "—"),
            22,51
          );
        }
      },

      reset(){
        state=createState(authored);
        selectedId=null;
        externalDragActive=false;
      },

      pick({screen,camera,view}={}){
        if(!camera || !screen || !view) return null;
        const world=camera.screenToWorld(screen,view);
        let best=null;
        for(const body of state.bodies){
          const d=Math.hypot(world.x-body.x,world.y-body.y);
          const threshold=body.radius+10/camera.zoom;
          if(d>threshold) continue;
          if(!best || d<best.distance){
            best={id:body.id,distance:d};
          }
        }
        const before=selectedId;
        selectedId=best?.id || null;
        return {before,after:selectedId,inspectorMode:"observe"};
      },

      inspector,

      query(name){
        if(name==="selected-subject") return subject();
        if(name==="selected-demand-trace"){
          return selectedId ? livingMovementActorTrace(state,selectedId,{limit:180}) : [];
        }
        if(name==="living-movement-state") return livingMovementSnapshot(state);
        return null;
      },

      snapshot(){
        return {
          ...livingMovementSnapshot(state),
          selectedId,
          authored:{...authored}
        };
      }
    };
  }
};
