import {
  createR1State,
  r1Snapshot,
  rusherAngle,
  stepR1
} from "./r1-sim.js";

function inputFor(policy,state,{
  commitLead=0.085
}={}){
  const angle=rusherAngle(state);
  const r=state.rusher;
  const p=state.player;

  if(policy==="immediate-commit"){
    const shouldCommit=
      r.mode==="prepare" &&
      r.time<=commitLead &&
      !p.weapon.action;
    return {
      moveX:0,moveY:0,
      bodyFacing:angle,
      guideAngle:shouldCommit?angle:undefined,
      commit:shouldCommit,
      commitAngle:angle
    };
  }

  if(policy==="guide-then-commit"){
    const shouldCommit=
      r.mode==="prepare" &&
      r.time<=commitLead &&
      !p.weapon.action;
    return {
      moveX:0,moveY:0,
      bodyFacing:angle,
      guideAngle:angle,
      commit:shouldCommit,
      commitAngle:angle
    };
  }

  if(policy==="lateral-evade"){
    const moving=r.mode==="commit";
    return {
      moveX:0,
      moveY:moving?1:0,
      bodyFacing:angle,
      guideAngle:undefined,
      commit:false,
      commitAngle:angle
    };
  }

  if(policy==="guide-move-commit"){
    const shouldCommit=
      r.mode==="prepare" &&
      r.time<=commitLead &&
      !p.weapon.action;
    const moving=
      r.mode==="commit" ||
      (r.mode==="prepare"&&r.time<=commitLead);
    return {
      moveX:0,
      moveY:moving?0.65:0,
      bodyFacing:angle,
      guideAngle:angle,
      commit:shouldCommit,
      commitAngle:angle
    };
  }

  throw new Error("unknown R1 policy "+policy);
}

export function runR1Policy({
  history,
  side,
  policy,
  inheritanceMode="full",
  guideAuthority=0.38,
  prepare=0.32,
  commitLead=0.085,
  materialScale=1,
  seconds=1.35
}={}){
  const state=createR1State({
    history,
    side,
    inheritanceMode,
    guideAuthority,
    prepare
  });

  const start=r1Snapshot(state);
  let commitEvent=null;
  let firstToolContact=null;
  let maxPlayerDisplacement=0;
  let maxRusherLateral=0;
  const initialRusherY=state.rusher.y;

  const frames=Math.ceil(seconds*120);
  for(let i=0;i<frames&&state.rusher.mode!=="done";i++){
    const events=stepR1(
      state,
      inputFor(policy,state,{commitLead}),
      1/120,
      {materialScale}
    );

    for(const event of events){
      if(event.type==="rusher-commit"&&!commitEvent){
        commitEvent=event;
      }
      if(event.type==="tool-contact"&&!firstToolContact){
        firstToolContact={
          at:state.time,
          rusherX:state.rusher.x,
          rusherY:state.rusher.y,
          commitRemaining:state.rusher.mode==="commit"
            ? state.rusher.time
            : null,
          deltaSpeed:event.deltaSpeed
        };
      }
    }

    maxPlayerDisplacement=Math.max(
      maxPlayerDisplacement,
      Math.hypot(
        state.player.body.x-start.player.x,
        state.player.body.y-start.player.y
      )
    );
    maxRusherLateral=Math.max(
      maxRusherLateral,
      Math.abs(state.rusher.y-initialRusherY)
    );
  }

  const end=r1Snapshot(state);
  const committedLineAngle=commitEvent
    ? Math.atan2(commitEvent.commitY,commitEvent.commitX)
    : null;

  return {
    history,
    side,
    policy,
    inheritanceMode,
    result:end.bodyContacts>0?"body-contact":"body-miss",
    toolContacts:end.toolContacts,
    bodyContacts:end.bodyContacts,
    time:Number(end.time.toFixed(3)),
    maxPlayerDisplacement:Number(maxPlayerDisplacement.toFixed(2)),
    maxRusherLateral:Number(maxRusherLateral.toFixed(2)),
    rusherFinalSpeed:Number(
      Math.hypot(end.rusher.vx,end.rusher.vy).toFixed(2)
    ),
    firstToolContact:firstToolContact
      ? {
          at:Number(firstToolContact.at.toFixed(4)),
          rusherX:Number(firstToolContact.rusherX.toFixed(2)),
          rusherY:Number(firstToolContact.rusherY.toFixed(2)),
          commitRemaining:firstToolContact.commitRemaining===null
            ? null
            : Number(firstToolContact.commitRemaining.toFixed(4)),
          deltaSpeed:Number(firstToolContact.deltaSpeed.toFixed(2))
        }
      : null,
    committedLineAngle:
      committedLineAngle===null
        ? null
        : Number(committedLineAngle.toFixed(4)),
    startReadiness:start.playerReadiness,
    endReadiness:end.playerReadiness,
    finite:[
      end.player.x,end.player.y,
      end.rusher.x,end.rusher.y,
      end.rusher.vx,end.rusher.vy,
      end.playerReadiness.angle,
      end.playerReadiness.angularVelocity,
      end.playerReadiness.reach,
      end.playerReadiness.radialVelocity
    ].every(Number.isFinite)
  };
}

export function runR1CrossedMatrix({
  guideAuthority=0.38,
  prepare=0.32,
  commitLead=0.085,
  materialScale=1
}={}){
  const result={};
  for(const history of ["free","wall"]){
    result[history]={};
    for(const side of ["east","west"]){
      result[history][side]={};
      for(const policy of [
        "immediate-commit",
        "guide-then-commit",
        "lateral-evade"
      ]){
        result[history][side][policy]=runR1Policy({
          history,
          side,
          policy,
          guideAuthority,
          prepare,
          commitLead,
          materialScale
        });
      }
    }
  }
  return result;
}

export function runR1MaterialScaleSweep(){
  const scales=[0,0.35,0.7,1,1.4,2,3,4];
  return scales.map(materialScale=>{
    const cells=[];
    for(const history of ["free","wall"]){
      for(const side of ["east","west"]){
        cells.push(runR1Policy({
          history,
          side,
          policy:"immediate-commit",
          materialScale
        }));
      }
    }
    return {
      materialScale,
      bodyMisses:cells.filter(x=>x.result==="body-miss").length,
      toolContactCells:cells.filter(x=>x.toolContacts>0).length,
      cells:cells.map(x=>({
        history:x.history,
        side:x.side,
        result:x.result,
        toolContacts:x.toolContacts,
        lateral:x.maxRusherLateral,
        firstToolContact:x.firstToolContact
      }))
    };
  });
}

export function summarizeR1Matrix(matrix){
  const out={};
  for(const [history,sides] of Object.entries(matrix)){
    out[history]={};
    for(const [side,policies] of Object.entries(sides)){
      out[history][side]=Object.fromEntries(
        Object.entries(policies).map(([policy,value])=>[
          policy,
          {
            result:value.result,
            toolContacts:value.toolContacts,
            bodyContacts:value.bodyContacts,
            playerMove:value.maxPlayerDisplacement,
            rusherLateral:value.maxRusherLateral,
            finalSpeed:value.rusherFinalSpeed
          }
        ])
      );
    }
  }
  return out;
}
