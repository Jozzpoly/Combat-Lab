import {
  createR0State,
  driveBody,
  readinessDistance,
  requestCommit,
  setBodyFacingIntent,
  setGuideIntent,
  snapshotReadiness,
  stepWeapon
} from "./readiness.js";

export const R0_WALL=Object.freeze({
  id:"fixture-wall",
  x:48,
  y:-25,
  w:10,
  h:50
});

function runFrames(state,frames,{
  dt=1/120,
  guideAuthority=1,
  autoNeutral=false,
  walls=[],
  moveX=0,
  moveY=0
}={}){
  const impacts=[];
  for(let i=0;i<frames;i++){
    driveBody(state,moveX,moveY,dt);
    const impact=stepWeapon(state,{
      dt,
      guideAuthority,
      autoNeutral,
      walls
    });
    if(impact) impacts.push(impact);
  }
  return impacts;
}

function runUntilActionDone(state,options={}){
  const impacts=[];
  let guard=0;
  while(state.weapon.action&&guard<240){
    impacts.push(...runFrames(state,1,options));
    guard++;
  }
  return impacts;
}

export function runTwoCommitSequence({
  firstFixture="free",
  guideAuthority=0.38,
  autoNeutral=false,
  interludeSeconds=0.24,
  secondCommitAngle=-0.92,
  sharpAimAfterFirst=null
}={}){
  const state=createR0State();
  setBodyFacingIntent(state,0);
  setGuideIntent(state,0.92,82);

  requestCommit(state,0.92);
  const firstImpacts=runUntilActionDone(state,{
    guideAuthority,
    autoNeutral:false,
    walls:firstFixture==="wall"?[R0_WALL]:[]
  });

  // Remove the fixture after the first realized outcome. R0 is asking
  // whether the inherited state itself changes what happens next.
  if(Number.isFinite(sharpAimAfterFirst)){
    setGuideIntent(state,sharpAimAfterFirst,82);
  }

  const interludeFrames=Math.round(interludeSeconds*120);
  runFrames(state,interludeFrames,{
    guideAuthority,
    autoNeutral,
    walls:[]
  });

  const secondStart=snapshotReadiness(state);
  requestCommit(state,secondCommitAngle);

  let minAngle=state.weapon.angle;
  let maxAngle=state.weapon.angle;
  let path=0;
  let previous=state.weapon.angle;
  let zeroCrossTime=null;
  let secondFrames=0;

  while(state.weapon.action&&secondFrames<240){
    runFrames(state,1,{
      guideAuthority,
      autoNeutral:false,
      walls:[]
    });
    const a=state.weapon.angle;
    let delta=a-previous;
    while(delta<=-Math.PI) delta+=Math.PI*2;
    while(delta>Math.PI) delta-=Math.PI*2;
    path+=Math.abs(delta);
    previous=a;
    minAngle=Math.min(minAngle,a);
    maxAngle=Math.max(maxAngle,a);
    if(
      zeroCrossTime===null &&
      ((secondStart.angle>0&&a<=0) ||
       (secondStart.angle<0&&a>=0))
    ){
      zeroCrossTime=secondFrames/120;
    }
    secondFrames++;
  }

  return {
    firstFixture,
    guideAuthority,
    autoNeutral,
    firstImpacts:firstImpacts.length,
    secondStart,
    secondEnd:snapshotReadiness(state),
    secondPath:Number(path.toFixed(4)),
    secondMinAngle:Number(minAngle.toFixed(4)),
    secondMaxAngle:Number(maxAngle.toFixed(4)),
    secondZeroCrossTime:
      zeroCrossTime===null?null:Number(zeroCrossTime.toFixed(4)),
    wallImpacts:state.weapon.wallImpacts,
    finite:[
      state.body.x,state.body.y,state.body.vx,state.body.vy,
      state.weapon.angle,state.weapon.angularVelocity,
      state.weapon.reach,state.weapon.radialVelocity
    ].every(Number.isFinite)
  };
}

export function compareHistories(options={}){
  const free=runTwoCommitSequence({
    ...options,
    firstFixture:"free"
  });
  const wall=runTwoCommitSequence({
    ...options,
    firstFixture:"wall"
  });
  return {
    free,
    wall,
    secondStartDistance:readinessDistance(
      free.secondStart,
      wall.secondStart
    )
  };
}

export function runGuideSweep(){
  const authorities=[0,0.08,0.18,0.38,0.75,1.25,2.0];
  return authorities.map(guideAuthority=>{
    const inherited=compareHistories({
      guideAuthority,
      autoNeutral:false
    });
    const neutral=compareHistories({
      guideAuthority,
      autoNeutral:true,
      interludeSeconds:0.34
    });
    return {
      guideAuthority,
      inheritedDistance:Number(
        inherited.secondStartDistance.toFixed(4)
      ),
      neutralDistance:Number(
        neutral.secondStartDistance.toFixed(4)
      ),
      inheritedFreeAngle:Number(
        inherited.free.secondStart.angle.toFixed(4)
      ),
      inheritedWallAngle:Number(
        inherited.wall.secondStart.angle.toFixed(4)
      )
    };
  });
}

export function runIntentionalGuideRecovery({
  guideAuthority=0.38,
  seconds=1.0,
  targetAngle=-0.75
}={}){
  const state=createR0State();
  setGuideIntent(state,0.92,82);
  requestCommit(state,0.92);
  runUntilActionDone(state,{
    guideAuthority,
    walls:[R0_WALL]
  });

  const start=snapshotReadiness(state);
  setGuideIntent(state,targetAngle,82);

  let firstUseful=null;
  const frames=Math.round(seconds*120);
  for(let i=0;i<frames;i++){
    runFrames(state,1,{guideAuthority,walls:[]});
    const angleError=Math.abs(
      ((targetAngle-state.weapon.angle+Math.PI*3)%(Math.PI*2))-Math.PI
    );
    if(
      firstUseful===null &&
      angleError<0.16 &&
      Math.abs(state.weapon.angularVelocity)<1.6
    ){
      firstUseful=i/120;
    }
  }

  return {
    guideAuthority,
    start,
    end:snapshotReadiness(state),
    firstUseful:
      firstUseful===null?null:Number(firstUseful.toFixed(4)),
    finite:[
      state.weapon.angle,
      state.weapon.angularVelocity,
      state.weapon.reach,
      state.weapon.radialVelocity
    ].every(Number.isFinite)
  };
}

export function runSoak({
  seconds=20,
  guideAuthority=0.38
}={}){
  const state=createR0State();
  const walls=[R0_WALL];
  let nextCommit=0;
  let side=1;
  let maxOmega=0;
  let maxRadial=0;
  let impacts=0;

  const frames=Math.round(seconds*120);
  for(let i=0;i<frames;i++){
    const t=i/120;
    if(t>=nextCommit&&!state.weapon.action){
      side*=-1;
      const target=side>0?0.92:-0.92;
      setGuideIntent(state,target,82);
      requestCommit(state,target);
      nextCommit=t+0.72;
    }

    driveBody(
      state,
      Math.sin(t*0.7)*0.55,
      Math.cos(t*0.47)*0.38,
      1/120
    );
    const event=stepWeapon(state,{
      dt:1/120,
      guideAuthority,
      walls
    });
    if(event) impacts++;

    maxOmega=Math.max(
      maxOmega,
      Math.abs(state.weapon.angularVelocity)
    );
    maxRadial=Math.max(
      maxRadial,
      Math.abs(state.weapon.radialVelocity)
    );
  }

  return {
    impacts,
    maxOmega:Number(maxOmega.toFixed(3)),
    maxRadial:Number(maxRadial.toFixed(3)),
    final:snapshotReadiness(state),
    finite:[
      state.body.x,state.body.y,state.body.vx,state.body.vy,
      state.weapon.angle,state.weapon.angularVelocity,
      state.weapon.reach,state.weapon.radialVelocity
    ].every(Number.isFinite)
  };
}
