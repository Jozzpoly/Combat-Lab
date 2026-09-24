import { normalize } from "./math.js";

export const R1_RUSHER_SPEC=Object.freeze({
  radius:16,
  mass:48,
  prepare:0.32,
  commit:0.46,
  commitSpeed:360,
  recover:0.32
});

export function createRusher(side="east",{
  prepare=R1_RUSHER_SPEC.prepare
}={}){
  const sign=side==="east"?1:-1;
  return {
    id:"rusher",
    side,
    x:sign*120,
    y:0,
    vx:0,
    vy:0,
    radius:R1_RUSHER_SPEC.radius,
    mass:R1_RUSHER_SPEC.mass,
    mode:"prepare",
    time:prepare,
    commitX:-sign,
    commitY:0,
    bodyContactResolved:false
  };
}

export function stepRusher(rusher,player,dt){
  const events=[];

  if(rusher.mode==="prepare"){
    rusher.time-=dt;
    if(rusher.time<=0){
      const d=normalize(
        player.x-rusher.x,
        player.y-rusher.y,
        rusher.commitX,
        rusher.commitY
      );
      rusher.commitX=d.x;
      rusher.commitY=d.y;
      rusher.vx=d.x*R1_RUSHER_SPEC.commitSpeed;
      rusher.vy=d.y*R1_RUSHER_SPEC.commitSpeed;
      rusher.mode="commit";
      rusher.time=R1_RUSHER_SPEC.commit;
      rusher.bodyContactResolved=false;
      events.push({
        type:"rusher-commit",
        x:rusher.x,
        y:rusher.y,
        commitX:rusher.commitX,
        commitY:rusher.commitY
      });
    }
  }else if(rusher.mode==="commit"){
    rusher.x+=rusher.vx*dt;
    rusher.y+=rusher.vy*dt;
    rusher.time-=dt;
    if(rusher.time<=0){
      rusher.mode="recover";
      rusher.time=R1_RUSHER_SPEC.recover;
      rusher.vx*=0.35;
      rusher.vy*=0.35;
      events.push({type:"rusher-recover"});
    }
  }else if(rusher.mode==="recover"){
    rusher.x+=rusher.vx*dt;
    rusher.y+=rusher.vy*dt;
    rusher.vx*=Math.pow(0.06,dt);
    rusher.vy*=Math.pow(0.06,dt);
    rusher.time-=dt;
    if(rusher.time<=0){
      rusher.mode="done";
      rusher.vx=0;
      rusher.vy=0;
      events.push({type:"rusher-done"});
    }
  }

  return events;
}
