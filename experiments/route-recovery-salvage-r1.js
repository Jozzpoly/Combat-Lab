import {buildDistributedCounterflowTopology} from "../src/research/integrated-ecology.js";
import {
  findStaticRouteWitness
} from "../src/research/static-route-witness.js";
import {
  queryStaticCircleOccupancy
} from "../src/research/static-feasibility.js";
import {
  ROUTE_EXECUTION_STATUS,
  auditRouteExecutionAuthority
} from "../src/research/route-execution-authority.js";
import {
  createSingleRouteRecoveryState,
  injectSingleRouteRecoveryDisplacement,
  singleRouteRecoverySnapshot,
  stepSingleRouteRecoveryState
} from "../src/research/single-route-recovery.js";
import {
  createRearmableRouteRecoveryState,
  injectRearmableRouteRecoveryDisplacement,
  rearmableRouteRecoverySnapshot,
  stepRearmableRouteRecoveryState
} from "../src/research/rearmable-route-recovery.js";

const WORLD={width:1100,height:700};
const OBSTACLES=[
  {id:"pillar.upper",x:510,y:120,w:80,h:190},
  {id:"pillar.lower",x:510,y:500,w:80,h:190}
];
const RADIUS=20;
const SPEED=140;
const START_LOST={x:490,y:275.996};

function fixture(){
  const spec=buildDistributedCounterflowTopology(18,{world:WORLD})[0];
  const witness=findStaticRouteWitness({
    from:spec.start,
    to:spec.target,
    radius:RADIUS,
    clearance:8,
    world:WORLD,
    obstacles:OBSTACLES
  });
  if(!["direct","witness"].includes(witness.status)){
    throw new Error("R1 salvage fixture requires executable initial witness");
  }
  const routeIndex=witness.waypoints.findIndex(candidate=>
    Math.hypot(candidate.x-980,candidate.y-335.55555555555554)<=0.01
  );
  if(routeIndex<0) throw new Error("R1 salvage fixture waypoint not found");
  return {spec,witness,routeIndex};
}

function createPair(){
  const f=fixture();
  const common={
    position:START_LOST,
    routeIndex:f.routeIndex,
    witness:f.witness,
    radius:RADIUS,
    speed:SPEED,
    world:WORLD,
    obstacles:OBSTACLES,
    arrivalTolerance:5,
    lossPersistenceSeconds:0.35
  };
  return {
    baseline:createSingleRouteRecoveryState(common),
    candidate:createRearmableRouteRecoveryState({
      ...common,
      healthyWindowSeconds:0.35,
      progressEpsilon:8
    })
  };
}

function candidatePosition(state){
  return {
    x:state.episode.executor.locomotion.body.x,
    y:state.episode.executor.locomotion.body.y
  };
}

function panelTransform(view,index){
  const panelWidth=view.width/2;
  const pad=24;
  const scale=Math.min(
    (panelWidth-pad*2)/WORLD.width,
    (view.height-pad*2)/WORLD.height
  );
  const panelX=index*panelWidth;
  const ox=panelX+(panelWidth-WORLD.width*scale)*0.5;
  const oy=(view.height-WORLD.height*scale)*0.5;
  return {
    scale,ox,oy,panelX,panelWidth,
    x:value=>ox+value*scale,
    y:value=>oy+value*scale,
    world(screen){
      return {
        x:(screen.x-ox)/scale,
        y:(screen.y-oy)/scale
      };
    }
  };
}

function findRecoverableLostPosition(state){
  const episode=state.episode;
  const executor=episode.executor;
  const witness=executor.witness;
  const routeIndex=executor.routeIndex;
  const target=witness.target;

  for(let y=90;y<=610;y+=20){
    for(let x=430;x<=670;x+=20){
      const occupancy=queryStaticCircleOccupancy({
        center:{x,y},
        radius:state.config.radius,
        world:WORLD,
        obstacles:OBSTACLES
      });
      if(!occupancy.clear) continue;

      const audit=auditRouteExecutionAuthority({
        position:{x,y},
        routeIndex,
        witness,
        radius:state.config.radius,
        world:WORLD,
        obstacles:OBSTACLES,
        arrivalTolerance:state.config.arrivalTolerance
      });
      if(audit.status!==ROUTE_EXECUTION_STATUS.LOST_EXECUTABILITY) continue;

      const fresh=findStaticRouteWitness({
        from:{x,y},
        to:target,
        radius:state.config.radius,
        clearance:witness.clearance ?? 0,
        world:WORLD,
        obstacles:OBSTACLES
      });
      if(["direct","witness"].includes(fresh.status)) return {x,y};
    }
  }
  return null;
}

function drawRoute(ctx,t,witness,routeIndex,position){
  const points=[
    position,
    ...(witness?.waypoints || []).slice(Math.max(0,routeIndex))
  ];
  if(points.length<2) return;
  ctx.strokeStyle="rgba(143,213,255,.44)";
  ctx.lineWidth=2;
  ctx.beginPath();
  points.forEach((point,index)=>{
    if(index===0) ctx.moveTo(t.x(point.x),t.y(point.y));
    else ctx.lineTo(t.x(point.x),t.y(point.y));
  });
  ctx.stroke();
}

function renderPanel(ctx,view,index,state,{label,subLabel,candidate,recommended,lastAction,waiting}){
  const t=panelTransform(view,index);
  const snap=candidate
    ? rearmableRouteRecoverySnapshot(state)
    : singleRouteRecoverySnapshot(state);
  const executor=candidate ? state.episode.executor : state.executor;
  const position=candidate ? snap.episode.executor.position : snap.executor.position;
  const status=candidate ? snap.status : snap.status;
  const queryCount=candidate ? snap.totalFreshQueryCount : snap.freshQueryCount;

  ctx.save();
  ctx.fillStyle="rgba(12,17,23,.72)";
  ctx.fillRect(t.panelX,0,t.panelWidth,view.height);

  ctx.strokeStyle="#3e4652";
  ctx.lineWidth=3;
  ctx.strokeRect(t.x(0),t.y(0),WORLD.width*t.scale,WORLD.height*t.scale);

  for(const obstacle of OBSTACLES){
    ctx.fillStyle="#29303a";
    ctx.fillRect(
      t.x(obstacle.x),t.y(obstacle.y),
      obstacle.w*t.scale,obstacle.h*t.scale
    );
  }

  drawRoute(ctx,t,executor.witness,executor.routeIndex,position);

  const target=executor.witness.target;
  ctx.fillStyle="#5cc489";
  ctx.beginPath();
  ctx.arc(t.x(target.x),t.y(target.y),8*t.scale,0,Math.PI*2);
  ctx.fill();

  if(recommended){
    ctx.strokeStyle="#e7a84e";
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.arc(t.x(recommended.x),t.y(recommended.y),12*t.scale,0,Math.PI*2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(t.x(recommended.x)-8,t.y(recommended.y));
    ctx.lineTo(t.x(recommended.x)+8,t.y(recommended.y));
    ctx.moveTo(t.x(recommended.x),t.y(recommended.y)-8);
    ctx.lineTo(t.x(recommended.x),t.y(recommended.y)+8);
    ctx.stroke();
  }

  ctx.fillStyle=candidate ? "#4d9fe0" : "#a75b5b";
  ctx.strokeStyle=candidate ? "#cbeaff" : "#ffc0c0";
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(t.x(position.x),t.y(position.y),RADIUS*t.scale,0,Math.PI*2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle="#e9eef5";
  ctx.font="600 14px system-ui, sans-serif";
  ctx.fillText(label,t.panelX+18,24);
  ctx.font="12px ui-monospace, monospace";
  ctx.fillStyle="#b8c5d2";
  ctx.fillText(subLabel,t.panelX+18,43);
  ctx.fillText(
    "status "+status+" · fresh queries "+queryCount+
    (candidate ? " · episode "+snap.episodeId : ""),
    t.panelX+18,62
  );
  if(waiting){
    ctx.fillStyle="#e7a84e";
    ctx.fillText(
      "PAUSED INTERNALLY: click orange marker or any free point to displace both lanes",
      t.panelX+18,81
    );
  }else if(lastAction){
    ctx.fillStyle="#9fb1c2";
    ctx.fillText(lastAction,t.panelX+18,81);
  }

  ctx.restore();
}

export const routeRecoverySalvageR1={
  id:"route-recovery-salvage-r1",
  title:"R1 Salvage — Re-armable Route Recovery A/B",
  kind:"research",
  purpose:"Put the R1 result on the table: a one-query lifetime recovery baseline runs beside an episodically re-armable recovery candidate. Both receive the same external displacement.",
  controls:"The specimen freezes when R1 has proved healthy execution after recovery. Click either lane to displace BOTH bodies to that world point. Orange marker is a known recoverable loss candidate.",

  create(){
    let pair=createPair();
    let waitingForOwner=false;
    let recommended=null;
    let lastAction="First loss is the exact clean-R0 wall-death family; both lanes recover once.";

    function rebuild(){
      pair=createPair();
      waitingForOwner=false;
      recommended=null;
      lastAction="First loss is the exact clean-R0 wall-death family; both lanes recover once.";
    }

    const inspector={
      schema:{
        groups:[],
        liveGroups:[
          {
            id:"recovery",
            label:"Matched recovery state",
            description:"No aggregate score. Watch whether fresh-query authority is lifetime one-shot or earned again after healthy verified execution.",
            values:[
              {id:"waiting",label:"Owner displacement gate",format:value=>value ? "READY — CLICK WORLD" : "running"},
              {id:"baselineStatus",label:"Lifetime status",format:value=>String(value)},
              {id:"baselineQueries",label:"Lifetime fresh queries",decimals:0},
              {id:"candidateStatus",label:"R1 status",format:value=>String(value)},
              {id:"candidateEpisode",label:"R1 episode",decimals:0},
              {id:"candidateQueries",label:"R1 fresh queries",decimals:0},
              {id:"candidateRearm",label:"R1 re-arm ready",format:value=>value ? "YES" : "no"},
              {id:"lastAction",label:"Last intervention",format:value=>String(value)}
            ]
          }
        ]
      },

      getLive(id){
        const a=singleRouteRecoverySnapshot(pair.baseline);
        const b=rearmableRouteRecoverySnapshot(pair.candidate);
        if(id==="waiting") return waitingForOwner;
        if(id==="baselineStatus") return a.status;
        if(id==="baselineQueries") return a.freshQueryCount;
        if(id==="candidateStatus") return b.status;
        if(id==="candidateEpisode") return b.episodeId;
        if(id==="candidateQueries") return b.totalFreshQueryCount;
        if(id==="candidateRearm") return b.rearmReady;
        if(id==="lastAction") return lastAction;
        return undefined;
      }
    };

    return {
      step(_input,dt){
        if(waitingForOwner) return;

        stepSingleRouteRecoveryState(pair.baseline,dt);
        stepRearmableRouteRecoveryState(pair.candidate,dt);

        if(pair.candidate.rearmReady){
          waitingForOwner=true;
          recommended=findRecoverableLostPosition(pair.candidate);
          lastAction="R1 earned a new episode. World frozen for Owner displacement.";
        }
      },

      render(ctx,view){
        renderPanel(ctx,view,0,pair.baseline,{
          label:"LIFETIME BASELINE",
          subLabel:"one fresh recovery query for the whole run",
          candidate:false,
          recommended,
          lastAction,
          waiting:waitingForOwner
        });
        renderPanel(ctx,view,1,pair.candidate,{
          label:"R1",
          subLabel:"new recovery episode only after healthy factual progress",
          candidate:true,
          recommended,
          lastAction,
          waiting:waitingForOwner
        });

        ctx.save();
        ctx.strokeStyle="rgba(255,255,255,.14)";
        ctx.beginPath();
        ctx.moveTo(view.width/2,0);
        ctx.lineTo(view.width/2,view.height);
        ctx.stroke();
        ctx.restore();
      },

      pick({screen,view}={}){
        if(!screen || !view) return null;
        const index=screen.x<view.width/2 ? 0 : 1;
        const t=panelTransform(view,index);
        const world=t.world(screen);
        const point={
          x:Math.max(0,Math.min(WORLD.width,world.x)),
          y:Math.max(0,Math.min(WORLD.height,world.y))
        };
        const occupancy=queryStaticCircleOccupancy({
          center:point,
          radius:RADIUS,
          world:WORLD,
          obstacles:OBSTACLES
        });
        if(!occupancy.clear){
          lastAction="Rejected click: hard occupancy is invalid at that point ("+
            String(occupancy.blocker?.id || occupancy.blocker?.type || "static")+
            ").";
          return {before:null,after:null,inspectorMode:"observe"};
        }

        injectSingleRouteRecoveryDisplacement(
          pair.baseline,
          point,
          {reason:"owner-salvage-click"}
        );
        injectRearmableRouteRecoveryDisplacement(
          pair.candidate,
          point,
          {reason:"owner-salvage-click"}
        );
        waitingForOwner=false;
        recommended=null;
        lastAction="Owner displaced both lanes to "+
          point.x.toFixed(1)+", "+point.y.toFixed(1)+".";
        return {before:null,after:null,inspectorMode:"observe"};
      },

      reset(){
        rebuild();
      },

      inspector,

      query(name){
        if(name==="r1-salvage-pair"){
          return {
            waitingForOwner,
            recommended:recommended ? {...recommended} : null,
            lastAction,
            baseline:singleRouteRecoverySnapshot(pair.baseline),
            candidate:rearmableRouteRecoverySnapshot(pair.candidate)
          };
        }
        return null;
      },

      snapshot(){
        return {
          waitingForOwner,
          recommended:recommended ? {...recommended} : null,
          lastAction,
          baseline:singleRouteRecoverySnapshot(pair.baseline),
          candidate:rearmableRouteRecoverySnapshot(pair.candidate)
        };
      }
    };
  }
};
