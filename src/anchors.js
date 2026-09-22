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
    triggerRange:80,
    prepareHalfAngle:0.62,
    windup:0.15,
    commitDuration:0.16,
    commitSpeed:335,
    reach:18,
    halfWidth:9,
    damage:34,
    recover:0.72
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
    triggerRange:112,
    prepareHalfAngle:0.82,
    windup:0.38,
    commitDuration:0.24,
    commitSpeed:225,
    reach:38,
    halfWidth:26,
    damage:50,
    recover:0.88
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
