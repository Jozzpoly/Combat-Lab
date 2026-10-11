// Local response law. Receives only previous-step private contact/progress,
// never world geometry, actor IDs, routes or global positions.
export const MORPHS = Object.freeze({
  dart: { name: "Dart / compact", mass: 18, speed: 5.2, acceleration: 26,
    braking: 32, turnRate: 3.8, turnTorque: 95, width: 0.42, length: 1.05,
    contactYield: .90, braceForce: 90, gripReach: 1.8, gripForce: 120, color: "#75c6e8" },
  crawler: { name: "Crawler / hinged", mass: 88, speed: 2.75, acceleration: 12,
    braking: 14, turnRate: 1.65, turnTorque: 280, rearDrive: 0.55, width: 0.74, length: 2.65,
    contactYield: .52, braceForce: 520, gripReach: 2.3, gripForce: 330, color: "#d9b17b" },
  broad: { name: "Broad / pusher", mass: 245, speed: 2.0, acceleration: 7.5,
    braking: 10, turnRate: 0.9, turnTorque: 540, width: 2.3, length: 1.7,
    contactYield: .12, braceForce: 2800, gripReach: 2.6, gripForce: 750, color: "#a99ae3" },
  worm: { name: "Inchworm / alternating support", mass: 84, speed: 2.0,
    acceleration: 9, braking: 9, turnRate: 1.1, turnTorque: 260,
    width: .62, length: 2.05, muscleForce: 850, supportForce: 900,
    contactYield: .76, braceForce: 640, gripReach: 1.7, gripForce: 150, color: "#97cf9c" }
});
export const KINDS = Object.freeze(Object.keys(MORPHS));
export const DT = 1 / 60;
export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
export function wrap(a) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}
// A somatic *local response*, not navigation or cognition.
// The actor gets only its own previous-step physical contact/progress.
// contactYield is authored on the body [0..1]: 0 = persist through frontal
// resistance, 1 = promptly relinquish space. Solver pressure/geometry still
// decides what is actually possible; this policy cannot ignore collision.
export function localResponse(state, sensed, profile = null) {
  const next={...state,age:(state.age||0)+1};
  const yieldFactor=clamp(Number.isFinite(profile?.contactYield) ?
    profile.contactYield:1,0,1);
  const front=Number.isFinite(sensed.front) ? sensed.front :
    (sensed.touch?1:0); // legacy minimal tactile clients
  const side=Number.isFinite(sensed.side) ? sensed.side : 0;
  const frontalStall=Boolean(sensed.touch)&&front>.28&&
    sensed.progress<.20;
  const requiredTicks=Math.round(14+(1-yieldFactor)*35);
  if(frontalStall && (next.recover||0)<=0)
    next.pressure=(next.pressure||0)+1;
  else next.pressure=0;
  if(next.pressure>=requiredTicks){
    next.pressure=0;
    next.recover=65;
    next.turnSide=side>.25?-1:side<-.25?1:-(next.turnSide||1);
    next.recoveries=(next.recoveries||0)+1;
  }
  if(next.recover>0){
    next.recover-=1;
    return {state:next,steer:(next.turnSide||1),
      throttle:next.recover>43?-.45:.50,mode:"give-way"};
  }
  // Incidental side contacts should not trigger a wholesale reverse.
  // Partial steering away from contact is bounded, not path planning.
  const wander=Math.sin(next.age*.012)*.12;
  const sideAvoid=clamp(-side*.28*yieldFactor,-.25,.25);
  // A low-yielding organism can briefly anchor itself in response to
  // *observed* lateral/rear pressure. It cannot hold against arbitrary force:
  // the body motor must supply finite ground-coupled brace impulse.
  const directed=Number.isFinite(sensed.rearLoad) &&
    Number.isFinite(sensed.sideLoad);
  const supportLoad=directed ?
    Math.max(0,sensed.rearLoad)+Math.max(0,sensed.sideLoad):
    (front<.25 ? Math.max(0,sensed.load||0) : 0);
  // Support is a short, renewable somatic reaction while real pressure
  // persists, NOT a cognition state or unlimited sticky stance. The latch
  // avoids the old false 'full progress' signal while throttle=0.
  const wasBracing=(next.braceTicks||0)>0;
  if(yieldFactor<.25 && sensed.touch && supportLoad>6 &&
      (sensed.progress<.7 || wasBracing))
    next.braceTicks=9;
  else next.braceTicks=Math.max(0,(next.braceTicks||0)-1);
  if(next.braceTicks>0 && !next.recover)
    return {state:next,steer:0,throttle:0,mode:"brace"};
  return {state:next,steer:clamp(wander+sideAvoid,-1,1),
    throttle:.85,mode:frontalStall?"press":"cruise"};
}
export function finiteDrive({ mass, velocity, heading, input, speed, acceleration,
  braking, traction, dt = DT }) {
  // Explicit top-down substrate traction approximation: external ground
  // reaction is represented by a bounded impulse budget, not Rapier ground contact.
  if (!Number.isFinite(mass) || mass < 0) throw new RangeError("invalid allocated drive mass");
  if (mass === 0) return {x:0,y:0};
  const dx = Math.cos(heading), dy = Math.sin(heading);
  const desired = { x: dx * speed * input, y: dy * speed * input };
  const error = { x: desired.x - velocity.x, y: desired.y - velocity.y };
  const limit = mass * (Math.abs(input) > 0.01 ? acceleration : braking) *
    clamp(traction, 0, 1) * dt;
  const mag = Math.hypot(error.x, error.y);
  const factor = mag > 0 ? Math.min(1, limit / (mass * mag)) : 0;
  return { x: mass * error.x * factor, y: mass * error.y * factor };
}


// Point-target intent is translated into finite reciprocal impulse. This
// translational effective-mass approximation delegates off-axis rotation to
// Rapier; it is deliberately not claimed as precision hand biomechanics.
export function finiteGrip({ playerMass, objectMass, anchorVelocity,
  targetError, maxForce, dt = DT }) {
  for (const [key, value] of Object.entries({playerMass, objectMass,maxForce,dt,
    ax:anchorVelocity.x, ay:anchorVelocity.y, ex:targetError.x, ey:targetError.y}))
    if (!Number.isFinite(value)) throw new RangeError("nonfinite grip "+key);
  if (playerMass <= 0 || objectMass <= 0 || maxForce < 0 || dt <= 0)
    throw new RangeError("invalid grip mass/force/dt");
  const len = Math.hypot(targetError.x, targetError.y);
  const desiredMag = Math.min(6, len * 7);
  const desired = len > 1e-8 ?
    { x: targetError.x / len * desiredMag,
      y: targetError.y / len * desiredMag } : { x: 0, y: 0 };
  const effective = 1 / (1/playerMass + 1/objectMass);
  const raw = {x:(desired.x-anchorVelocity.x)*effective,
    y:(desired.y-anchorVelocity.y)*effective};
  const requested = Math.hypot(raw.x,raw.y);
  const limit = maxForce*dt;
  const factor = requested > 1e-8 ? Math.min(1,limit/requested) : 0;
  return {x:raw.x*factor,y:raw.y*factor};
}


// External ground reaction that resists a moving body, never a position lock.
// It can be defeated by stronger material contact or absent ground traction.
export function finiteBrace({mass, velocity, force, traction, dt=DT}) {
  for(const q of [mass,velocity.x,velocity.y,force,traction,dt])
    if(!Number.isFinite(q))throw new RangeError("nonfinite brace input");
  if(mass<=0||force<0||dt<=0||traction<0)
    throw new RangeError("invalid brace mass/force/traction");
  const raw={x:-mass*velocity.x,y:-mass*velocity.y};
  const length=Math.hypot(raw.x,raw.y);
  const limit=force*clamp(traction,0,1)*dt;
  if(limit===0 || length===0)return {x:0,y:0};
  const scale=Math.min(1,limit/length);
  return {x:raw.x===0?0:raw.x*scale,y:raw.y===0?0:raw.y*scale};
}
