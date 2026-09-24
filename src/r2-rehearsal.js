import {
  createR2State,
  r2RusherAngle,
  r2Snapshot,
  stepR2
} from "./r2-sim.js";

function expectedOverrunAngle(side){
  return side==="east"?Math.PI:0;
}

function inputFor(policy,state){
  const angle=r2RusherAngle(state);
  const incoming=state.rusher.mode==="commit";
  const followPhase=state.rusher.mode==="return";

  if(policy==="evade-only"){
    return {
      moveX:0,
      moveY:incoming?1:0,
      bodyFacing:angle,
      guideAngle:undefined,
      commit:false,
      commitAngle:angle
    };
  }

  if(policy==="evade-immediate-follow"){
    const commit=
      followPhase &&
      state.toolContacts===0 &&
      !state.player.weapon.action;
    return {
      moveX:0,
      moveY:incoming?1:0,
      bodyFacing:angle,
      guideAngle:commit?angle:undefined,
      commit,
      commitAngle:angle
    };
  }

  if(policy==="evade-guide-follow"){
    const guideAngle=incoming
      ? expectedOverrunAngle(state.side)
      : angle;
    const commit=
      followPhase &&
      state.toolContacts===0 &&
      !state.player.weapon.action;
    return {
      moveX:0,
      moveY:incoming?1:0,
      bodyFacing:angle,
      guideAngle,
      commit,
      commitAngle:angle
    };
  }

  throw new Error("unknown R2 policy "+policy);
}

export function runR2Policy({
  history,
  side,
  policy,
  inheritanceMode="full",
  guideAuthority=0.38,
  prepare=0.32,
  returnAcceleration=900,
  seconds=1.35
}={}){
  const state=createR2State({
    history,
    side,
    inheritanceMode,
    guideAuthority,
    prepare,
    returnAcceleration
  });

  const start=r2Snapshot(state);
  let commitEndEvent=null;
  let turnaroundEvent=null;
  let followEvent=null;
  let maxPlayerDisplacement=0;
  let readinessAtCommitEnd=null;
  let readinessAtFollowStart=null;

  const frames=Math.ceil(seconds*120);
  for(let i=0;i<frames;i++){
    const wasReturn=state.rusher.mode==="return";
    const input=inputFor(policy,state);

    if(
      input.commit &&
      !readinessAtFollowStart
    ){
      readinessAtFollowStart=r2Snapshot(state).player.readiness;
    }

    const events=stepR2(state,input,1/120);

    for(const event of events){
      if(event.type==="rusher-commit-end"&&!commitEndEvent){
        commitEndEvent=event;
        readinessAtCommitEnd=r2Snapshot(state).player.readiness;
      }
      if(event.type==="rusher-turnaround"&&!turnaroundEvent){
        turnaroundEvent={
          ...event,
          at:state.time
        };
      }
      if(event.type==="follow-contact"&&!followEvent){
        followEvent={
          ...event,
          at:state.time
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

    // Once physical closing has been recovered, allow a short observation
    // tail and then stop. No gameplay state is changed by this condition.
    if(
      state.turnaroundAt!==null &&
      state.time-state.turnaroundAt>0.12
    ) break;

    // If no turnaround appears, bounded experiment duration still applies.
    if(state.time>=seconds) break;
  }

  const end=r2Snapshot(state);

  return {
    history,
    side,
    policy,
    result:followEvent
      ? (followEvent.beforeTurnaround
          ?"pre-turnaround-contact"
          :"post-turnaround-contact")
      : "no-follow-contact",
    incomingBodyContact:end.bodyContacts>0,
    followContacts:end.toolContacts,
    maxPlayerDisplacement:Number(maxPlayerDisplacement.toFixed(2)),
    commitEndAt:end.commitEndedAt===null
      ? null
      : Number(end.commitEndedAt.toFixed(4)),
    turnaroundAt:end.turnaroundAt===null
      ? null
      : Number(end.turnaroundAt.toFixed(4)),
    opportunityDuration:
      end.commitEndedAt!==null&&end.turnaroundAt!==null
        ? Number((end.turnaroundAt-end.commitEndedAt).toFixed(4))
        : null,
    followContactAt:followEvent
      ? Number(followEvent.at.toFixed(4))
      : null,
    followSinceCommitEnd:followEvent?.sinceCommitEnd===null ||
      followEvent?.sinceCommitEnd===undefined
      ? null
      : Number(followEvent.sinceCommitEnd.toFixed(4)),
    readinessStart:start.player.readiness,
    readinessAtCommitEnd,
    readinessAtFollowStart,
    endReadiness:end.player.readiness,
    rusherCommitEnd:commitEndEvent
      ? {
          x:Number(commitEndEvent.x.toFixed(2)),
          y:Number(commitEndEvent.y.toFixed(2)),
          vx:Number(commitEndEvent.vx.toFixed(2)),
          vy:Number(commitEndEvent.vy.toFixed(2)),
          closing:Number(commitEndEvent.closing.toFixed(2))
        }
      : null,
    finite:[
      end.player.x,end.player.y,
      end.rusher.x,end.rusher.y,
      end.rusher.vx,end.rusher.vy,
      end.player.readiness.angle,
      end.player.readiness.angularVelocity
    ].every(Number.isFinite)
  };
}

export function runR2CrossedMatrix(){
  const result={};
  for(const history of ["free","wall"]){
    result[history]={};
    for(const side of ["east","west"]){
      result[history][side]={};
      for(const policy of [
        "evade-only",
        "evade-immediate-follow",
        "evade-guide-follow"
      ]){
        result[history][side][policy]=runR2Policy({
          history,
          side,
          policy
        });
      }
    }
  }
  return result;
}

export function summarizeR2Matrix(matrix){
  const result={};
  for(const [history,sides] of Object.entries(matrix)){
    result[history]={};
    for(const [side,policies] of Object.entries(sides)){
      result[history][side]=Object.fromEntries(
        Object.entries(policies).map(([policy,value])=>[
          policy,
          {
            result:value.result,
            incomingBodyContact:value.incomingBodyContact,
            playerMove:value.maxPlayerDisplacement,
            opportunity:value.opportunityDuration,
            followDelay:value.followSinceCommitEnd,
            startAngle:Number(value.readinessStart.angle.toFixed(3)),
            commitEndAngle:value.readinessAtCommitEnd
              ? Number(value.readinessAtCommitEnd.angle.toFixed(3))
              : null
          }
        ])
      );
    }
  }
  return result;
}
