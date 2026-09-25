import {
  actorReadinessDistance,
  createState,
  requestCommit,
  setGuide,
  snapshotActor,
  stepState
} from "./r3.js";

const DT=1/120;

function beginFirstInteraction(state){
  const aTarget=-0.72;
  const bTarget=Math.PI+0.72;
  setGuide(state.a,aTarget);
  setGuide(state.b,bTarget);
  requestCommit(state.a,aTarget);
  requestCommit(state.b,bTarget);
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
  guideAuthority=0.48,
  contactEnabled=true,
  maxSeconds=1.2
}={}){
  const state=createState({yOffset});
  beginFirstInteraction(state);

  let sawContact=false;
  let sawSeparatedAfterContact=false;
  let stopFrame=null;
  const maxFrames=Math.round(maxSeconds/DT);

  for(let i=0;i<maxFrames;i++){
    stepState(state,{
      dt:DT,
      guideAuthority,
      contactEnabled
    });

    if(state.contact.frames>0) sawContact=true;
    if(
      sawContact &&
      !state.contact.engaged &&
      state.contact.separatedFor>=0.06
    ){
      sawSeparatedAfterContact=true;
      stopFrame=i+1;
      break;
    }

    if(!state.a.tool.action&&!state.b.tool.action){
      // Keep ordinary GUIDE active after commit; do not force a reset.
      // The loop may continue until real geometry separates.
    }
  }

  if(stopFrame===null) stopFrame=maxFrames;

  return {
    state,
    frames:stopFrame,
    duration:stopFrame*DT,
    sawContact,
    sawSeparatedAfterContact
  };
}

function runGhostForFrames({
  yOffset=0,
  guideAuthority=0.48,
  frames
}){
  const state=createState({yOffset});
  beginFirstInteraction(state);
  runFrames(state,frames,{
    guideAuthority,
    contactEnabled:false
  });
  return state;
}

function neutralizeLocally(state,{
  guideAuthority=1.8,
  seconds=0.40
}={}){
  setGuide(state.a,-0.72);
  setGuide(state.b,Math.PI+0.72);
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
  guideAuthority=0.48,
  interludeSeconds=0.08,
  independentReset=false
}={}){
  const contact=runContactHistory({
    yOffset,guideAuthority,contactEnabled:true
  });

  const ghost=runGhostForFrames({
    yOffset,
    guideAuthority,
    frames:contact.frames
  });

  if(independentReset){
    neutralizeLocally(contact.state);
    neutralizeLocally(ghost);
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
    guideAuthority,
    historyDuration:Number(contact.duration.toFixed(4)),
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
  const offsets=[-10,-4,0,4,10];
  return offsets.map(yOffset=>compareContactGhost({
    yOffset,
    guideAuthority:0.48
  }));
}

export function perturbationSweep(){
  const offsets=[-1.5,-0.75,0,0.75,1.5];
  return offsets.map(yOffset=>compareContactGhost({
    yOffset,
    guideAuthority:0.48
  }));
}

export function independentResetComparison(){
  const inherited=compareContactGhost({
    yOffset:0,
    guideAuthority:0.48,
    independentReset:false
  });
  const reset=compareContactGhost({
    yOffset:0,
    guideAuthority:0.48,
    independentReset:true
  });
  return {inherited,reset};
}

export function mirroredContactCheck(){
  const left=compareContactGhost({
    yOffset:-4,
    guideAuthority:0.48
  });
  const right=compareContactGhost({
    yOffset:4,
    guideAuthority:0.48
  });
  return {left,right};
}
