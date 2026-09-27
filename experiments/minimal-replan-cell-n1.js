import {
  createMinimalReplanState,
  minimalReplanCausalSnapshot,
  stepMinimalReplanState
} from "../src/research/minimal-replan-agent.js";

const WORLD={width:960,height:600};
const OBSTACLES=[
  {id:"wall.center",x:430,y:170,w:100,h:260}
];
const START={x:180,y:300};
const TARGET={x:780,y:300};
const RADIUS=24;
const SPEED=180;

function viewTransform(view){
  const pad=34;
  const scale=Math.min((view.width-pad*2)/WORLD.width,(view.height-pad*2)/WORLD.height);
  const ox=(view.width-WORLD.width*scale)*0.5;
  const oy=(view.height-WORLD.height*scale)*0.5;
  return {scale,ox,oy,x:v=>ox+v*scale,y:v=>oy+v*scale};
}

function drawCircle(ctx,t,p,r,fill,stroke){
  ctx.fillStyle=fill;
  ctx.strokeStyle=stroke;
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(t.x(p.x),t.y(p.y),r*t.scale,0,Math.PI*2);
  ctx.fill();
  ctx.stroke();
}

function createState(){
  return createMinimalReplanState({
    world:WORLD,
    obstacles:OBSTACLES,
    start:START,
    target:TARGET,
    radius:RADIUS,
    speed:SPEED,
    noProgressSeconds:0.65,
    progressEpsilon:0.35,
    clearance:8,
    arrivalTolerance:3
  });
}

export const minimalReplanCellN1={
  id:"minimal-replan-cell-n1",
  title:"Minimal Replan Cell N1",
  kind:"research",
  purpose:"Test one narrow organism competence: detect persistent factual no-progress against static geometry, then optionally consume one verified route witness and resume progress.",
  controls:"Autonomous cell · Reset World reruns · Debug shows causal evidence",

  create(){
    let state=createState();

    const inspector={
      schema:{
        groups:[],
        liveGroups:[
          {
            id:"organism",
            label:"Organism state",
            description:"Read-only causal state. No crowd policy, dynamic avoidance or contact negotiation.",
            values:[
              {id:"status",label:"Status",format:value=>String(value)},
              {id:"planMode",label:"Immediate plan",format:value=>String(value)},
              {id:"goalDistance",label:"Goal distance",decimals:1},
              {id:"noProgressFor",label:"No progress",unit:"s",decimals:2},
              {id:"replanCount",label:"Replans",decimals:0},
              {id:"blocker",label:"Last blocker",format:value=>String(value || "—")}
            ]
          }
        ]
      },
      getLive(id){
        const causal=minimalReplanCausalSnapshot(state);
        if(id==="status") return causal.status;
        if(id==="planMode") return causal.immediatePlan.mode;
        if(id==="goalDistance") return causal.factualProgress.goalDistance;
        if(id==="noProgressFor") return causal.factualProgress.noProgressFor;
        if(id==="replanCount") return causal.replan.count;
        if(id==="blocker") return causal.obstruction?.id || "";
        return undefined;
      }
    };

    return {
      step(_input,dt){
        stepMinimalReplanState(state,dt);
      },

      render(ctx,view,{debug=false}={}){
        const t=viewTransform(view);
        ctx.save();

        ctx.strokeStyle="#3e4652";
        ctx.lineWidth=3;
        ctx.strokeRect(t.x(0),t.y(0),WORLD.width*t.scale,WORLD.height*t.scale);

        for(const obstacle of OBSTACLES){
          ctx.fillStyle="#29303a";
          ctx.fillRect(t.x(obstacle.x),t.y(obstacle.y),obstacle.w*t.scale,obstacle.h*t.scale);
        }

        drawCircle(ctx,t,TARGET,10,"#5cc489","#b5f0ce");

        if(state.lastRouteWitness?.status==="witness"){
          const route=[state.actor.position,...state.lastRouteWitness.waypoints];
          ctx.strokeStyle="rgba(143,213,255,.55)";
          ctx.lineWidth=2;
          ctx.beginPath();
          route.forEach((p,index)=>{
            if(index===0) ctx.moveTo(t.x(p.x),t.y(p.y));
            else ctx.lineTo(t.x(p.x),t.y(p.y));
          });
          ctx.stroke();
          for(const p of state.lastRouteWitness.waypoints.slice(0,-1)){
            drawCircle(ctx,t,p,5,"#8fd5ff","#d6f0ff");
          }
        }

        const fill=state.status==="ARRIVED"
          ? "#5cc489"
          : state.status==="STUCK_NO_WITNESS"
            ? "#db6b6b"
            : "#4d9fe0";
        drawCircle(ctx,t,state.actor.position,state.actor.radius,fill,"#cbeaff");

        if(debug){
          const causal=minimalReplanCausalSnapshot(state);
          ctx.fillStyle="#e9eef5";
          ctx.font="13px ui-monospace, monospace";
          ctx.fillText(
            `status ${causal.status} · plan ${causal.immediatePlan.mode} · goal ${causal.factualProgress.goalDistance.toFixed(1)}`,
            18,24
          );
          ctx.fillText(
            `no-progress ${causal.factualProgress.noProgressFor.toFixed(2)}/${causal.factualProgress.threshold.toFixed(2)}s · blocker ${causal.obstruction?.id || "—"}`,
            18,43
          );
          ctx.fillText(
            `replan ${causal.replan.attempted?"attempted":"not-yet"} · witness ${causal.replan.witness?.status || "—"}`,
            18,62
          );
        }

        ctx.restore();
      },

      reset(){
        state=createState();
      },

      inspector,

      query(name){
        if(name==="causal-state") return minimalReplanCausalSnapshot(state);
        return null;
      },

      snapshot(){
        return {
          time:state.time,
          status:state.status,
          planMode:state.planMode,
          position:{...state.actor.position},
          target:{...state.purpose.target},
          goalDistance:state.goalDistance,
          noProgressFor:state.noProgressFor,
          replanAttempted:state.replanAttempted,
          replanCount:state.replanCount,
          replanAtTime:state.replanAtTime,
          blocker:state.lastBlocker?.id || null,
          witnessStatus:state.lastRouteWitness?.status || null
        };
      }
    };
  }
};
