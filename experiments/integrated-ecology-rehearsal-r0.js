import {
  E1_OBSTACLES,
  E1_WORLD,
  createIntegratedEcologyState,
  integratedEcologyActorSnapshot,
  integratedEcologySnapshot,
  setIntegratedEcologyPassingSide,
  stepIntegratedEcologyState
} from "../src/research/integrated-ecology.js";

const DEFAULTS={
  population:8,
  passingSide:1
};

const POPULATION_RAILS={
  softMin:4,
  softMax:64,
  hardMin:4,
  hardMax:2048,
  step:1
};

function clampPopulation(value){
  const n=Math.round(Number(value));
  if(!Number.isFinite(n)) return DEFAULTS.population;
  return Math.max(POPULATION_RAILS.hardMin,Math.min(POPULATION_RAILS.hardMax,n));
}

function clampSide(value){
  const n=Math.round(Number(value));
  if(!Number.isFinite(n)) return 0;
  return Math.max(-1,Math.min(1,n));
}

function sideLabel(value){
  if(value===1) return "LEFT";
  if(value===-1) return "RIGHT";
  return "NONE";
}

function createState(authored){
  return createIntegratedEcologyState({
    count:authored.population,
    passingSide:authored.passingSide,
    trialDuration:3600
  });
}

function selectedCausal(state,selectedId){
  return selectedId ? integratedEcologyActorSnapshot(state,selectedId) : null;
}

function drawTarget(ctx,actor,zoom){
  if(!actor) return;
  const lineWidth=1.5/zoom;
  ctx.save();
  ctx.strokeStyle="rgba(143,213,255,.7)";
  ctx.lineWidth=lineWidth;
  ctx.setLineDash([7/zoom,6/zoom]);
  ctx.beginPath();
  ctx.moveTo(actor.body.position.x,actor.body.position.y);
  ctx.lineTo(actor.purpose.target.x,actor.purpose.target.y);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle="#9bd8ff";
  ctx.beginPath();
  ctx.arc(
    actor.purpose.target.x,
    actor.purpose.target.y,
    5/zoom,
    0,
    Math.PI*2
  );
  ctx.fill();

  if(actor.immediatePlan.route.length){
    ctx.strokeStyle="rgba(241,181,95,.75)";
    ctx.lineWidth=2/zoom;
    ctx.beginPath();
    ctx.moveTo(actor.body.position.x,actor.body.position.y);
    for(const point of actor.immediatePlan.route){
      ctx.lineTo(point.x,point.y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawDesiredVelocity(ctx,actor,zoom){
  if(!actor) return;
  const velocity=actor.body.desiredVelocity;
  const d=Math.hypot(velocity.x,velocity.y);
  if(d<1e-9) return;
  const scale=0.35;
  ctx.save();
  ctx.strokeStyle="#d8efff";
  ctx.lineWidth=2/zoom;
  ctx.beginPath();
  ctx.moveTo(actor.body.position.x,actor.body.position.y);
  ctx.lineTo(
    actor.body.position.x+velocity.x*scale,
    actor.body.position.y+velocity.y*scale
  );
  ctx.stroke();
  ctx.restore();
}

export const integratedEcologyRehearsalR0={
  id:"integrated-ecology-rehearsal-r0",
  title:"Integrated Ecology Rehearsal R0",
  kind:"research",
  purpose:"Owner-facing rehearsal candidate for bounded embodied multi-actor ecology: inspect individual causal behavior, author exact population pressure and preserve break regimes without global debug webs.",
  controls:"Click resident → causal Observe · wheel zoom · middle-drag pan · Population applies on Reset World",
  camera:{
    bounds:{x:0,y:0,width:E1_WORLD.width,height:E1_WORLD.height}
  },

  create(){
    const authored={...DEFAULTS};
    let state=createState(authored);
    let selectedId=null;

    function causal(){
      return selectedCausal(state,selectedId);
    }

    const inspector={
      schema:{
        comparison:{
          id:"rehearsal-policy",
          label:"Rehearsal policy",
          controlIds:["passingSide"],
          applySemantics:"Apply changes the shared local passing-side convention live. Population is deliberately excluded because it defines a new matched trial.",
          matchedStartHint:"Use Reset World for a matched population start."
        },
        groups:[
          {
            id:"pressure",
            provenance:{domain:"world",scope:"trial"},
            label:"Pressure",
            description:"Exact population is authored once and takes effect only on Reset World. Soft range is convenience, not a protective cap.",
            controls:[
              {
                id:"population",
                type:"number",
                label:"Population on reset",
                description:"Type an exact population, then Reset World. Large values intentionally enter stress/break regimes.",
                default:8,
                ...POPULATION_RAILS,
                decimals:0,
                anchors:[
                  {label:"8 baseline",value:8},
                  {label:"24 pressure",value:24},
                  {label:"64 dense",value:64},
                  {label:"256 break",value:256}
                ]
              }
            ]
          },
          {
            id:"encounter",
            provenance:{domain:"organism",scope:"population"},
            label:"Encounter policy",
            description:"Explicit shared local convention. This remains a research variable, not accepted Feniks behavior.",
            controls:[
              {
                id:"passingSide",
                type:"number",
                label:"Passing side",
                description:"-1 RIGHT · 0 NONE · +1 LEFT relative to each actor's travel direction.",
                default:1,
                softMin:-1,softMax:1,hardMin:-1,hardMax:1,step:1,decimals:0,
                anchors:[
                  {label:"RIGHT",value:-1},
                  {label:"NONE",value:0},
                  {label:"LEFT",value:1}
                ]
              }
            ]
          }
        ],
        liveGroups:[
          {
            id:"world",
            label:"World now",
            description:"Current physical trial state; target population remains separate until Reset World.",
            values:[
              {id:"populationNow",label:"Residents",decimals:0},
              {id:"populationNext",label:"On next reset",decimals:0},
              {id:"arrived",label:"Arrived",decimals:0},
              {id:"contacts",label:"Contact resolutions",decimals:0},
              {id:"maxCoupled",label:"Max coupled passes",decimals:0}
            ]
          },
          {
            id:"subject",
            label:"Selected resident",
            description:"Click one body in the viewport. This panel explains that subject instead of drawing a global target web.",
            values:[
              {id:"selectedId",label:"Resident",format:value=>String(value || "click a resident")},
              {id:"mode",label:"Mode",format:value=>String(value || "—")},
              {id:"goalDistance",label:"Goal distance",decimals:1},
              {id:"staticBlocker",label:"Static blocker",format:value=>String(value || "—")},
              {id:"staticNoProgress",label:"Static no-progress",unit:"s",decimals:2},
              {id:"dynamicPartners",label:"Dynamic contact",format:value=>String(value || "—")},
              {id:"dynamicNoProgress",label:"Dynamic no-progress",unit:"s",decimals:2},
              {id:"decision",label:"Last decision",format:value=>String(value || "—")}
            ]
          }
        ]
      },

      get(id){
        if(id==="population") return authored.population;
        if(id==="passingSide") return authored.passingSide;
        return undefined;
      },

      set(id,value){
        if(id==="population"){
          authored.population=clampPopulation(value);
          return;
        }
        if(id==="passingSide"){
          authored.passingSide=clampSide(value);
          setIntegratedEcologyPassingSide(state,authored.passingSide);
        }
      },

      reset(id){
        if(id==="population") authored.population=DEFAULTS.population;
        if(id==="passingSide"){
          authored.passingSide=DEFAULTS.passingSide;
          setIntegratedEcologyPassingSide(state,authored.passingSide);
        }
      },

      restoreDefaults(){
        authored.population=DEFAULTS.population;
        authored.passingSide=DEFAULTS.passingSide;
        setIntegratedEcologyPassingSide(state,authored.passingSide);
      },

      getLive(id){
        const world=integratedEcologySnapshot(state);
        const subject=causal();
        if(id==="populationNow") return world.population;
        if(id==="populationNext") return authored.population;
        if(id==="arrived") return world.arrived;
        if(id==="contacts") return world.contactResolutions;
        if(id==="maxCoupled") return world.maxCoupledPassesUsed;
        if(id==="selectedId") return selectedId;
        if(id==="mode") return subject?.mode || "";
        if(id==="goalDistance") return subject?.purpose?.goalDistance ?? NaN;
        if(id==="staticBlocker") return subject?.static?.blockerThisStep || subject?.static?.trigger?.blocker || "";
        if(id==="staticNoProgress") return subject?.static?.noProgressFor ?? NaN;
        if(id==="dynamicPartners") return subject?.dynamic?.partners?.join(", ") || subject?.dynamic?.trigger?.partnerId || "";
        if(id==="dynamicNoProgress") return subject?.dynamic?.noProgressFor ?? NaN;
        if(id==="decision"){
          if(subject?.dynamic?.trigger){
            return `encounter ${sideLabel(subject.dynamic.trigger.passingSide)}`;
          }
          if(subject?.static?.trigger) return "static replan";
          return "";
        }
        return undefined;
      }
    };

    return {
      step(_input,dt){
        stepIntegratedEcologyState(state,dt);
      },

      render(ctx,view,{debug=false,camera=null}={}){
        const activeCamera=camera;
        if(!activeCamera) return;
        const cameraState=activeCamera.snapshot();
        const zoom=cameraState.zoom;

        ctx.save();
        activeCamera.apply(ctx,view);

        ctx.fillStyle="#101821";
        ctx.fillRect(0,0,E1_WORLD.width,E1_WORLD.height);
        ctx.strokeStyle="#506071";
        ctx.lineWidth=2/zoom;
        ctx.strokeRect(0,0,E1_WORLD.width,E1_WORLD.height);

        for(const obstacle of E1_OBSTACLES){
          ctx.fillStyle="#2a333e";
          ctx.fillRect(obstacle.x,obstacle.y,obstacle.w,obstacle.h);
          ctx.strokeStyle="#566474";
          ctx.lineWidth=1.5/zoom;
          ctx.strokeRect(obstacle.x,obstacle.y,obstacle.w,obstacle.h);
        }

        for(const body of state.bodies){
          const selected=body.id===selectedId;
          const phenotype=state.actors[body.id].phenotype;
          ctx.fillStyle=["#4d9fe0","#62b884","#b78358"][phenotype%3];
          ctx.strokeStyle=selected ? "#ffffff" : "rgba(220,235,248,.72)";
          ctx.lineWidth=(selected ? 4 : 1.5)/zoom;
          ctx.beginPath();
          ctx.arc(body.x,body.y,body.radius,0,Math.PI*2);
          ctx.fill();
          ctx.stroke();
        }

        const subject=causal();
        drawTarget(ctx,subject,zoom);
        drawDesiredVelocity(ctx,subject,zoom);

        if(debug && subject?.dynamic?.partners?.length){
          ctx.strokeStyle="rgba(255,125,125,.8)";
          ctx.lineWidth=2/zoom;
          for(const partnerId of subject.dynamic.partners){
            const partner=integratedEcologyActorSnapshot(state,partnerId);
            if(!partner) continue;
            ctx.beginPath();
            ctx.moveTo(subject.body.position.x,subject.body.position.y);
            ctx.lineTo(partner.body.position.x,partner.body.position.y);
            ctx.stroke();
          }
        }

        ctx.restore();

        ctx.fillStyle="rgba(9,12,16,.78)";
        ctx.fillRect(12,12,300,selectedId ? 58 : 38);
        ctx.fillStyle="#dbe8f4";
        ctx.font="12px ui-monospace, monospace";
        const world=integratedEcologySnapshot(state);
        ctx.fillText(
          `residents ${world.population} · arrived ${world.arrived} · max solve ${world.maxCoupledPassesUsed}/24`,
          22,31
        );
        if(selectedId){
          const subjectNow=causal();
          ctx.fillText(
            `${selectedId} · ${subjectNow?.mode || "—"} · goal ${subjectNow?.purpose.goalDistance.toFixed(1) || "—"}`,
            22,51
          );
        }
      },

      reset(){
        state=createState(authored);
        selectedId=null;
      },

      pick({screen,camera,view}={}){
        if(!camera || !screen || !view) return null;
        const world=camera.screenToWorld(screen,view);
        let best=null;
        for(const body of state.bodies){
          const d=Math.hypot(world.x-body.x,world.y-body.y);
          const threshold=body.radius+10/camera.zoom;
          if(d>threshold) continue;
          if(!best || d<best.distance || (Math.abs(d-best.distance)<1e-9 && body.id.localeCompare(best.id)<0)){
            best={id:body.id,distance:d};
          }
        }
        const before=selectedId;
        selectedId=best?.id || null;
        return {
          before,
          after:selectedId,
          inspectorMode:"observe"
        };
      },

      inspector,

      query(name){
        if(name==="selected-subject") return causal();
        if(name==="ecology-causal-state") return integratedEcologySnapshot(state);
        return null;
      },

      snapshot(){
        return {
          ...integratedEcologySnapshot(state),
          selectedId,
          authoredPopulation:authored.population,
          authoredPassingSide:authored.passingSide
        };
      }
    };
  }
};
