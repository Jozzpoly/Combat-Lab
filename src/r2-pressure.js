import { normalize } from "./math.js";

export const R2_RUSHER_SPEC=Object.freeze({
  radius:16,
  prepare:0.32,
  commit:0.46,
  commitSpeed:360,
  returnAcceleration:900,
  maxPhysicalSpeed:420,
  turnaroundClosingSpeed:45
});

export function createR2Rusher(side="east",{
  prepare=R2_RUSHER_SPEC.prepare,
  returnAcceleration=R2_RUSHER_SPEC.returnAcceleration
}={}){
  const sign=side==="east"?1:-1;
  return {
    id:"rusher",
    side,
    x:sign*120,
    y:0,
    vx:0,
    vy:0,
    radius:R2_RUSHER_SPEC.radius,
    mode:"prepare",
    time:prepare,
    commitX:-sign,
    commitY:0,
    commitStartX:sign*120,
    commitStartY:0,
    returnAcceleration,
    turnaroundObserved:false
  };
}

function capPhysicalSpeed(rusher){
  const speed=Math.hypot(rusher.vx,rusher.vy);
  if(speed<=R2_RUSHER_SPEC.maxPhysicalSpeed) return;
  const s=R2_RUSHER_SPEC.maxPhysicalSpeed/speed;
  rusher.vx*=s;
  rusher.vy*=s;
}

export function closingVelocity(rusher,player){
  const d=normalize(
    player.x-rusher.x,
    player.y-rusher.y,
    1,0
  );
  return rusher.vx*d.x+rusher.vy*d.y;
}

export function stepR2Rusher(rusher,player,dt){
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
      rusher.commitStartX=rusher.x;
      rusher.commitStartY=rusher.y;
      rusher.vx=d.x*R2_RUSHER_SPEC.commitSpeed;
      rusher.vy=d.y*R2_RUSHER_SPEC.commitSpeed;
      rusher.mode="commit";
      rusher.time=R2_RUSHER_SPEC.commit;
      events.push({
        type:"rusher-commit",
        commitX:rusher.commitX,
        commitY:rusher.commitY
      });
    }
  }else if(rusher.mode==="commit"){
    rusher.x+=rusher.vx*dt;
    rusher.y+=rusher.vy*dt;
    rusher.time-=dt;

    if(rusher.time<=0){
      rusher.mode="return";
      rusher.time=0;
      events.push({
        type:"rusher-commit-end",
        x:rusher.x,
        y:rusher.y,
        vx:rusher.vx,
        vy:rusher.vy,
        closing:closingVelocity(rusher,player)
      });
    }
  }else if(rusher.mode==="return"){
    const d=normalize(
      player.x-rusher.x,
      player.y-rusher.y,
      1,0
    );

    rusher.vx+=d.x*rusher.returnAcceleration*dt;
    rusher.vy+=d.y*rusher.returnAcceleration*dt;
    capPhysicalSpeed(rusher);

    rusher.x+=rusher.vx*dt;
    rusher.y+=rusher.vy*dt;

    const closing=closingVelocity(rusher,player);
    if(
      !rusher.turnaroundObserved &&
      closing>=R2_RUSHER_SPEC.turnaroundClosingSpeed
    ){
      rusher.turnaroundObserved=true;
      events.push({
        type:"rusher-turnaround",
        x:rusher.x,
        y:rusher.y,
        vx:rusher.vx,
        vy:rusher.vy,
        closing
      });
    }
  }

  return events;
}
