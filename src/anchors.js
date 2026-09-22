export const LIGHT_STRIKER_SPEC=Object.freeze({
  body:Object.freeze({
    radius:14,
    mass:42,
    maxSpeed:258,
    acceleration:3100,
    braking:3350,
    turnRate:12.5,
    hp:100
  }),
  attack:Object.freeze({
    model:"dash-line",
    triggerRange:82,
    prepareHalfAngle:0.62,
    windup:0.15,
    commitDuration:0.18,
    commitSpeed:345,
    reach:20,
    halfWidth:8,
    sweepArc:0,
    damage:34,
    recover:0.76,
    recoveryVelocityScale:0.72
  })
});

export const HEAVY_CRUSHER_SPEC=Object.freeze({
  body:Object.freeze({
    radius:24,
    mass:132,
    maxSpeed:138,
    acceleration:900,
    braking:1450,
    turnRate:4.2,
    hp:100
  }),
  attack:Object.freeze({
    model:"sweep-arc",
    triggerRange:118,
    prepareHalfAngle:0.92,
    windup:0.42,
    commitDuration:0.46,
    commitSpeed:72,
    reach:78,
    halfWidth:11,
    sweepArc:2.35,
    damage:50,
    recover:0.94,
    recoveryVelocityScale:0.12
  })
});

export function interpolateAdversarySpec(a,b,t){
  const mix=(x,y)=>x+(y-x)*t;
  const body={};
  const attack={};

  for(const key of Object.keys(a.body)){
    body[key]=typeof a.body[key]==="number"
      ? mix(a.body[key],b.body[key])
      : a.body[key];
  }
  for(const key of Object.keys(a.attack)){
    attack[key]=typeof a.attack[key]==="number"
      ? mix(a.attack[key],b.attack[key])
      : a.attack[key];
  }

  return {body,attack};
}
