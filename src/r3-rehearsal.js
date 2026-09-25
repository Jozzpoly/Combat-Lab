import {
  actorReadinessDistance,
  createState,
  requestCommit,
  setGuide,
  snapshotActor,
  stepState
} from "./r3.js";

const DT=1/120;

function firstTargets(family){
  if(family==="press"){
    return {
      a:0.34,
      b:Math.PI-0.34
    };
  }
  if(family==="glance"){
    return {
      a:-0.52,
      b:Math.PI+0.52
    };
  }
  return {
    a:-0.72,
    b:Math.PI+0.72
  };
}

function beginFirstInteraction(state,family){
  const t=firstTargets(family);
  setGuide(state.a,t.a);
  setGuide(state.b,t.b);
  requestCommit(state.a,t.a);
  requestCommit(state.b,t.b);
}

function beginSecondInteraction(state){
  const aTarget=0.62;
  const bTarget=Math.PI-0.62;
  setGuide(state.a,aTarget);
  setGuide(state.b,bTarget);
  requestCommit(state.a,aTarget);
  requestCommit(state.b,bTarget);
}

function runFrames(state,frames,options){
  const events=[];
  for(let i=0;i<frames;i++){
    const e=stepState(state,{dt:DT,...options});
    if(e) events.push(e);
  }
  return events;
}

function runContactHistory({
  yOffset=0,
  family="sweep",
  pressHoldSeconds=0.08,
  guideAuthority=0.48,
  contactEnabled=true,
  maxSeconds=1.6
}={}){
  const state=createState({yOffset});
  beginFirstInteraction(state,family);

  let sawContact=false;
  let sawSeparatedAfterContact=false;
  let stopFrame=null;
  let releaseFrame=null;
  const maxFrames=Math.round(maxSeconds/DT);

  for(let i=0;i<maxFrames;i++){
    const releasing=
      releaseFrame!==null &&
      i>=releaseFrame;

    stepState(state,{
      dt:DT,
      guideAuthority,
      contactEnabled,
      aMoveX:releasing?-1:0,
      bMoveX:releasing?1:0
    });

    if(state.contact.frames>0) sawContact=true;

    if(
      family!=="glance" &&
      contactEnabled &&
      releaseFrame===null &&
      state.contact.engaged &&
      state.contact.currentDuration>=pressHoldSeconds
    ){
      // Break the material relation through ordinary locomotion, not by
      // weakening contact or entering a hidden escape state.
      releaseFrame=i+1;
    }

    if(
      sawContact &&
      !state.contact.engaged &&
      state.contact.separatedFor>=0.06
    ){
      sawSeparatedAfterContact=true;
      stopFrame=i+1;
      break;
    }
  }

  if(stopFrame===null) stopFrame=maxFrames;

  return {
    state,
    frames:stopFrame,
    releaseFrame,
    duration:stopFrame*DT,
    sawContact,
    sawSeparatedAfterContact
  };
}

function runGhostForSchedule({
  yOffset=0,
  family="sweep",
  guideAuthority=0.48,
  frames,
  releaseFrame=null
}){
  const state=createState({yOffset});
  beginFirstInteraction(state,family);

  for(let i=0;i<frames;i++){
    const releasing=
      releaseFrame!==null &&
      i>=releaseFrame;
    stepState(state,{
      dt:DT,
      guideAuthority,
      contactEnabled:false,
      aMoveX:releasing?-1:0,
      bMoveX:releasing?1:0
    });
  }
  return state;
}

function neutralizeLocally(state,{
  guideAuthority=1.8,
  seconds=0.40
}={}){
  // Matched local attractors, deliberately independent of contact history.
  setGuide(state.a,0.78);
  setGuide(state.b,Math.PI-0.78);
  runFrames(
    state,
    Math.round(seconds/DT),
    {guideAuthority,contactEnabled:false}
  );
}

function runSecond(state,{
  guideAuthority=0.48
}={}){
  const start={
    a:snapshotActor(state.a),
    b:snapshotActor(state.b)
  };

  beginSecondInteraction(state);

  const path={a:0,b:0};
  let prevA=state.a.tool.angle;
  let prevB=state.b.tool.angle;
  const frames=Math.round(0.34/DT);

  for(let i=0;i<frames;i++){
    stepState(state,{
      dt:DT,
      guideAuthority,
      contactEnabled:false
    });

    let da=state.a.tool.angle-prevA;
    let db=state.b.tool.angle-prevB;
    while(da<=-Math.PI) da+=Math.PI*2;
    while(da>Math.PI) da-=Math.PI*2;
    while(db<=-Math.PI) db+=Math.PI*2;
    while(db>Math.PI) db-=Math.PI*2;
    path.a+=Math.abs(da);
    path.b+=Math.abs(db);
    prevA=state.a.tool.angle;
    prevB=state.b.tool.angle;
  }

  return {
    start,
    end:{
      a:snapshotActor(state.a),
      b:snapshotActor(state.b)
    },
    path:{
      a:Number(path.a.toFixed(4)),
      b:Number(path.b.toFixed(4))
    }
  };
}

export function compareContactGhost({
  yOffset=0,
  family="sweep",
  pressHoldSeconds=0.08,
  guideAuthority=0.48,
  interludeSeconds=0.08,
  resetSeconds=null
}={}){
  const contact=runContactHistory({
    yOffset,
    family,
    pressHoldSeconds,
    guideAuthority,
    contactEnabled:true
  });

  const ghost=runGhostForSchedule({
    yOffset,
    family,
    guideAuthority,
    frames:contact.frames,
    releaseFrame:contact.releaseFrame
  });

  if(resetSeconds!==null){
    neutralizeLocally(contact.state,{
      seconds:resetSeconds
    });
    neutralizeLocally(ghost,{
      seconds:resetSeconds
    });
  }else{
    runFrames(
      contact.state,
      Math.round(interludeSeconds/DT),
      {guideAuthority,contactEnabled:false}
    );
    runFrames(
      ghost,
      Math.round(interludeSeconds/DT),
      {guideAuthority,contactEnabled:false}
    );
  }

  const before={
    contact:{
      a:snapshotActor(contact.state.a),
      b:snapshotActor(contact.state.b)
    },
    ghost:{
      a:snapshotActor(ghost.a),
      b:snapshotActor(ghost.b)
    }
  };

  const distance={
    a:actorReadinessDistance(
      before.contact.a,before.ghost.a
    ),
    b:actorReadinessDistance(
      before.contact.b,before.ghost.b
    )
  };

  const next={
    contact:runSecond(contact.state,{guideAuthority}),
    ghost:runSecond(ghost,{guideAuthority})
  };

  return {
    yOffset,
    family,
    pressHoldSeconds,
    guideAuthority,
    historyDuration:Number(contact.duration.toFixed(4)),
    releaseFrame:contact.releaseFrame,
    contact:{
      impacts:contact.state.contact.impacts,
      frames:contact.state.contact.frames,
      maxDuration:Number(
        contact.state.contact.maxDuration.toFixed(4)
      ),
      separated:contact.sawSeparatedAfterContact
    },
    before,
    distance:{
      a:Number(distance.a.toFixed(4)),
      b:Number(distance.b.toFixed(4))
    },
    next,
    nextPathDelta:{
      a:Number(Math.abs(
        next.contact.path.a-next.ghost.path.a
      ).toFixed(4)),
      b:Number(Math.abs(
        next.contact.path.b-next.ghost.path.b
      ).toFixed(4))
    },
    finite:[
      ...Object.values(before.contact.a),
      ...Object.values(before.contact.b),
      ...Object.values(before.ghost.a),
      ...Object.values(before.ghost.b)
    ].every(Number.isFinite)
  };
}

export function contactFamilySweep(){
  return [
    {
      label:"brief-sweep",
      result:compareContactGhost({
        family:"sweep",
        yOffset:0,
        pressHoldSeconds:0.04
      })
    },
    {
      label:"glancing-sweep",
      result:compareContactGhost({
        family:"glance",
        yOffset:10
      })
    },
    {
      label:"press-short",
      result:compareContactGhost({
        family:"press",
        pressHoldSeconds:0.08
      })
    },
    {
      label:"press-medium",
      result:compareContactGhost({
        family:"press",
        pressHoldSeconds:0.16
      })
    },
    {
      label:"press-long",
      result:compareContactGhost({
        family:"press",
        pressHoldSeconds:0.28
      })
    }
  ];
}

export function perturbationSweep(){
  const offsets=[-1.5,-0.75,0,0.75,1.5];
  return offsets.map(yOffset=>compareContactGhost({
    yOffset,
    family:"sweep",
    guideAuthority:0.48
  }));
}

export function resetDecaySweep(){
  const seconds=[0,0.16,0.32,0.55,0.85,1.20];
  return seconds.map(resetSeconds=>{
    const result=compareContactGhost({
      yOffset:0,
      family:"sweep",
      guideAuthority:0.48,
      resetSeconds
    });
    return {
      resetSeconds,
      distance:result.distance,
      nextPathDelta:result.nextPathDelta
    };
  });
}

export function mirroredContactCheck(){
  const left=compareContactGhost({
    yOffset:-4,
    family:"sweep",
    guideAuthority:0.48
  });
  const right=compareContactGhost({
    yOffset:4,
    family:"sweep",
    guideAuthority:0.48
  });
  return {left,right};
}
