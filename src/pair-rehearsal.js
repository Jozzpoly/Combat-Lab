import { normalize } from "./math.js";
import { HEAVY_CRUSHER_SPEC, LIGHT_STRIKER_SPEC } from "./anchors.js";
import { createA0State, stepA0 } from "./sim.js";

export const A2_OPEN_WORLD=Object.freeze({
  width:1400,
  height:1000,
  inset:28,
  walls:Object.freeze([])
});

export const A2_PAIR_START=Object.freeze({
  player:Object.freeze({x:700,y:760,facing:-Math.PI/2}),
  light:Object.freeze({id:"light",x:520,y:300,facing:Math.PI/2}),
  heavy:Object.freeze({id:"heavy",x:880,y:330,facing:Math.PI/2})
});

function living(state){
  return state.adversaries.filter(x=>x.hp>0);
}

function byId(state,id){
  return state.adversaries.find(x=>x.id===id&&x.hp>0) ?? null;
}

function nearest(state){
  let best=null;
  let bestDistance=Infinity;
  for(const enemy of living(state)){
    const d=Math.hypot(
      enemy.x-state.player.x,
      enemy.y-state.player.y
    );
    if(d<bestDistance){
      best=enemy;
      bestDistance=d;
    }
  }
  return {enemy:best,distance:bestDistance};
}

function moveTowardTarget(state,target,strength=1){
  if(!target){
    return {
      moveX:0,moveY:0,
      aimX:state.player.x,
      aimY:state.player.y-100,
      strike:false
    };
  }
  const d=normalize(
    target.x-state.player.x,
    target.y-state.player.y,
    0,-1
  );
  const distance=Math.hypot(
    target.x-state.player.x,
    target.y-state.player.y
  );
  return {
    moveX:d.x*strength,
    moveY:d.y*strength,
    aimX:target.x,
    aimY:target.y,
    strike:distance<86&&!state.player.action
  };
}

function nearestMash(state){
  return moveTowardTarget(state,nearest(state).enemy,1);
}

function focusPolicy(state,id){
  return moveTowardTarget(
    state,
    byId(state,id) ?? nearest(state).enemy,
    0.92
  );
}

function retreatAll(state){
  const enemies=living(state);
  if(!enemies.length) return moveTowardTarget(state,null);

  let tx=0;
  let ty=0;
  for(const enemy of enemies){
    const d=normalize(
      state.player.x-enemy.x,
      state.player.y-enemy.y,
      0,1
    );
    const distance=Math.max(
      40,
      Math.hypot(
        enemy.x-state.player.x,
        enemy.y-state.player.y
      )
    );
    const weight=1/distance;
    tx+=d.x*weight;
    ty+=d.y*weight;
  }
  const away=normalize(tx,ty,0,1);
  const target=nearest(state).enemy;
  const distance=target
    ? Math.hypot(target.x-state.player.x,target.y-state.player.y)
    : Infinity;

  return {
    moveX:away.x,
    moveY:away.y,
    aimX:target?.x ?? state.player.x,
    aimY:target?.y ?? state.player.y-100,
    strike:distance<86&&!state.player.action
  };
}

function orbitNearest(state){
  const {enemy,distance}=nearest(state);
  if(!enemy) return moveTowardTarget(state,null);
  const d=normalize(
    enemy.x-state.player.x,
    enemy.y-state.player.y,
    0,-1
  );
  const inward=distance>92?0.34:distance<64?-0.22:0;
  return {
    moveX:-d.y+d.x*inward,
    moveY:d.x+d.y*inward,
    aimX:enemy.x,
    aimY:enemy.y,
    strike:distance<86&&!state.player.action
  };
}

function screenWith(state,blockerId,attackerId,tangentOffset=0){
  const blocker=byId(state,blockerId);
  const attacker=byId(state,attackerId);

  if(!blocker||!attacker){
    const target=nearest(state).enemy;
    if(!target) return moveTowardTarget(state,null);
    const away=normalize(
      state.player.x-target.x,
      state.player.y-target.y,
      0,1
    );
    return {
      moveX:away.x,
      moveY:away.y,
      aimX:target.x,
      aimY:target.y,
      strike:false
    };
  }

  // Stand on the far side of blocker from attacker. This uses only visible
  // body positions; no attack phase, trigger range or hidden AI state.
  const line=normalize(
    blocker.x-attacker.x,
    blocker.y-attacker.y,
    0,1
  );
  const spacing=
    blocker.spec.radius+
    state.player.spec.radius+
    24;
  const tangentX=-line.y;
  const tangentY=line.x;
  const desiredX=
    blocker.x+
    line.x*spacing+
    tangentX*tangentOffset;
  const desiredY=
    blocker.y+
    line.y*spacing+
    tangentY*tangentOffset;
  const move=normalize(
    desiredX-state.player.x,
    desiredY-state.player.y,
    0,0
  );

  return {
    moveX:move.x,
    moveY:move.y,
    aimX:attacker.x,
    aimY:attacker.y,
    strike:false
  };
}

function pairReader(state){
  const light=byId(state,"light");
  const heavy=byId(state,"heavy");
  const recovering=living(state)
    .filter(x=>x.mode==="recover")
    .sort((a,b)=>{
      const da=(a.x-state.player.x)**2+(a.y-state.player.y)**2;
      const db=(b.x-state.player.x)**2+(b.y-state.player.y)**2;
      return da-db;
    })[0] ?? null;

  // Heavy sweep has priority because its broad space denial punishes lateral orbit.
  if(heavy&&(heavy.mode==="prepare"||heavy.mode==="commit")){
    const d=normalize(
      heavy.x-state.player.x,
      heavy.y-state.player.y,
      0,-1
    );
    return {
      moveX:-d.x,
      moveY:-d.y,
      aimX:heavy.x,
      aimY:heavy.y,
      strike:false
    };
  }

  // Light dash is answered laterally rather than by racing backwards.
  if(light&&(light.mode==="prepare"||light.mode==="commit")){
    const d=normalize(
      light.x-state.player.x,
      light.y-state.player.y,
      0,-1
    );
    return {
      moveX:-d.y,
      moveY:d.x,
      aimX:light.x,
      aimY:light.y,
      strike:false
    };
  }

  if(recovering){
    return moveTowardTarget(state,recovering,0.82);
  }

  return moveTowardTarget(state,nearest(state).enemy,0.42);
}

export function createA2PairState({
  entries=[
    {spec:LIGHT_STRIKER_SPEC,start:A2_PAIR_START.light},
    {spec:HEAVY_CRUSHER_SPEC,start:A2_PAIR_START.heavy}
  ],
  playerStart=A2_PAIR_START.player,
  resolveAdversaryPairs=true,
  adversaryActionsHitPeers=true,
  adversaryFriendlyDamageScale=1
}={}){
  return createA0State({
    world:A2_OPEN_WORLD,
    playerStart,
    adversaryEntries:entries,
    resolveAdversaryPairs,
    adversaryActionsHitPeers,
    adversaryFriendlyDamageScale
  });
}

export function runA2Policy(policyName,{
  seconds=18,
  dt=1/120,
  entries,
  playerStart,
  resolveAdversaryPairs=true,
  adversaryActionsHitPeers=true,
  adversaryFriendlyDamageScale=1,
  screenTangentOffset=0
}={}){
  const state=createA2PairState({
    ...(entries?{entries}:{}),
    ...(playerStart?{playerStart}:{}),
    resolveAdversaryPairs,
    adversaryActionsHitPeers,
    adversaryFriendlyDamageScale
  });

  let policy;
  if(policyName==="nearest-mash") policy=nearestMash;
  else if(policyName==="retreat-all") policy=retreatAll;
  else if(policyName==="orbit-nearest") policy=orbitNearest;
  else if(policyName==="focus-light") policy=s=>focusPolicy(s,"light");
  else if(policyName==="focus-heavy") policy=s=>focusPolicy(s,"heavy");
  else if(policyName==="pair-reader") policy=pairReader;
  else if(policyName==="screen-heavy") policy=s=>screenWith(
    s,
    "heavy",
    "light",
    screenTangentOffset
  );
  else if(policyName==="screen-light") policy=s=>screenWith(
    s,
    "light",
    "heavy",
    screenTangentOffset
  );
  else throw new Error("unknown A2 policy: "+policyName);

  const metrics={
    playerHits:0,
    enemyHits:0,
    hitsBy:{light:0,heavy:0},
    kills:[],
    pairContactFrames:0,
    pairContactEvents:0,
    friendlyHits:0,
    friendlyKills:0,
    friendlyDamage:0,
    friendlyPairs:[],
    simultaneousCommits:0,
    boundaryFrames:0
  };

  const frames=Math.ceil(seconds/dt);
  for(let frame=0;frame<frames&&state.result==="active";frame++){
    const events=stepA0(state,policy(state),dt);

    const activeCommits=living(state).filter(x=>x.mode==="commit").length;
    if(activeCommits>=2) metrics.simultaneousCommits++;

    let pairContactThisFrame=false;
    for(const event of events){
      if(event.type==="player-hit"){
        metrics.playerHits++;
        if(event.killed) metrics.kills.push({
          id:event.target,
          at:Number(state.time.toFixed(3))
        });
      }
      if(event.type==="adversary-hit"){
        metrics.enemyHits++;
        if(Object.hasOwn(metrics.hitsBy,event.attacker)){
          metrics.hitsBy[event.attacker]++;
        }
      }
      if(event.type==="adversary-body-contact"){
        metrics.pairContactEvents++;
        pairContactThisFrame=true;
      }
      if(event.type==="adversary-friendly-hit"){
        metrics.friendlyHits++;
        metrics.friendlyDamage+=event.damage;
        if(event.killed) metrics.friendlyKills++;
        metrics.friendlyPairs.push({
          attacker:event.attacker,
          target:event.target,
          at:Number(state.time.toFixed(3)),
          killed:event.killed
        });
      }
    }
    if(pairContactThisFrame) metrics.pairContactFrames++;

    const p=state.player;
    const w=state.world;
    const margin=28;
    if(
      p.x<w.inset+p.spec.radius+margin||
      p.x>w.width-w.inset-p.spec.radius-margin||
      p.y<w.inset+p.spec.radius+margin||
      p.y>w.height-w.inset-p.spec.radius-margin
    ) metrics.boundaryFrames++;
  }

  return {
    policy:policyName,
    result:state.result,
    time:Number(state.time.toFixed(3)),
    playerHp:state.player.hp,
    living:living(state).map(x=>x.id),
    enemyHp:Object.fromEntries(
      state.adversaries.map(x=>[x.id,x.hp])
    ),
    ...metrics,
    player:{
      x:Number(state.player.x.toFixed(1)),
      y:Number(state.player.y.toFixed(1))
    },
    adversaries:Object.fromEntries(
      state.adversaries.map(x=>[
        x.id,
        {
          x:Number(x.x.toFixed(1)),
          y:Number(x.y.toFixed(1)),
          mode:x.mode,
          hp:x.hp
        }
      ])
    ),
    finite:[state.player,...state.adversaries].every(a=>
      [a.x,a.y,a.vx,a.vy,a.facing,a.hp].every(Number.isFinite)
    )
  };
}
