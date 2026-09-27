const BASE_MOTOR_FORCE=720;
const DEFAULT_MAX_SPEED=140;
const EPS=1e-9;

function finite(value,label){
  const n=Number(value);
  if(!Number.isFinite(n)) throw new Error(`${label} must be finite`);
  return n;
}

function positive(value,label){
  const n=finite(value,label);
  if(n<=0) throw new Error(`${label} must be positive`);
  return n;
}

function point(value,label){
  if(!value || typeof value!=="object") throw new Error(`${label} required`);
  return {x:finite(value.x,`${label}.x`),y:finite(value.y,`${label}.y`)};
}

function moveVectorToward(vx,vy,targetX,targetY,maxDelta){
  const dx=targetX-vx;
  const dy=targetY-vy;
  const distance=Math.hypot(dx,dy);
  if(distance<=maxDelta || distance<EPS) return {vx:targetX,vy:targetY};
  const scale=maxDelta/distance;
  return {vx:vx+dx*scale,vy:vy+dy*scale};
}

export function createContactBody({
  id,
  position,
  radius=36,
  mass=1,
  motorAuthority=1,
  contactResistance=1,
  desiredVelocity={x:0,y:0},
  velocity={x:0,y:0},
  maxSpeed=DEFAULT_MAX_SPEED
}={}){
  return {
    id:String(id || "body"),
    x:point(position,"position").x,
    y:point(position,"position").y,
    vx:point(velocity,"velocity").x,
    vy:point(velocity,"velocity").y,
    radius:positive(radius,"radius"),
    mass:positive(mass,"mass"),
    motorAuthority:positive(motorAuthority,"motorAuthority"),
    contactResistance:positive(contactResistance,"contactResistance"),
    desiredVelocity:point(desiredVelocity,"desiredVelocity"),
    maxSpeed:positive(maxSpeed,"maxSpeed")
  };
}

export function setContactBodyParameter(body,id,value){
  if(id==="mass") body.mass=positive(value,"mass");
  else if(id==="motorAuthority") body.motorAuthority=positive(value,"motorAuthority");
  else if(id==="contactResistance") body.contactResistance=positive(value,"contactResistance");
  else throw new Error(`unknown contact body parameter: ${id}`);
}

export function contactAcceleration(body){
  return BASE_MOTOR_FORCE*body.motorAuthority/body.mass;
}

export function resolveCandidateContactPair(a,b){
  let dx=b.x-a.x;
  let dy=b.y-a.y;
  let distance=Math.hypot(dx,dy);
  const minDistance=a.radius+b.radius;
  if(distance>=minDistance-EPS) return null;

  if(distance<EPS){
    dx=1;
    dy=0;
    distance=1;
  }

  const nx=dx/distance;
  const ny=dy/distance;
  const penetration=minDistance-distance;

  // Candidate C0 semantics:
  // - inertial mass remains mass;
  // - contact resistance is an independent positional-yield axis;
  // - resistance does not rewrite motor authority or inertial impulse mass.
  const mobilityA=1/(a.mass*a.contactResistance);
  const mobilityB=1/(b.mass*b.contactResistance);
  const mobilityTotal=mobilityA+mobilityB;

  const correctionA=penetration*(mobilityA/mobilityTotal);
  const correctionB=penetration*(mobilityB/mobilityTotal);

  a.x-=nx*correctionA;
  a.y-=ny*correctionA;
  b.x+=nx*correctionB;
  b.y+=ny*correctionB;

  const rvx=b.vx-a.vx;
  const rvy=b.vy-a.vy;
  const closing=rvx*nx+rvy*ny;
  let impulse=0;

  if(closing<0){
    const invMassA=1/a.mass;
    const invMassB=1/b.mass;
    impulse=-closing/(invMassA+invMassB);
    a.vx-=impulse*invMassA*nx;
    a.vy-=impulse*invMassA*ny;
    b.vx+=impulse*invMassB*nx;
    b.vy+=impulse*invMassB*ny;
  }

  return {
    a:a.id,
    b:b.id,
    normal:{x:nx,y:ny},
    penetration,
    correction:{a:correctionA,b:correctionB},
    impulse
  };
}

function pairIndices(count,pairOrder){
  const pairs=[];
  for(let i=0;i<count;i++){
    for(let j=i+1;j<count;j++) pairs.push([i,j]);
  }
  if(pairOrder==="reverse") pairs.reverse();
  else if(pairOrder!=="forward") throw new Error("pairOrder must be forward or reverse");
  return pairs;
}

export function stepContactWorld(state,dt,{iterations=8,pairOrder="forward"}={}){
  const delta=positive(dt,"dt");
  const iterationCount=Math.max(1,Math.floor(positive(iterations,"iterations")));

  for(const body of state.bodies){
    const desired=body.desiredVelocity;
    const desiredLength=Math.hypot(desired.x,desired.y);
    const target=desiredLength>body.maxSpeed
      ? {x:desired.x/desiredLength*body.maxSpeed,y:desired.y/desiredLength*body.maxSpeed}
      : desired;
    const next=moveVectorToward(
      body.vx,body.vy,target.x,target.y,contactAcceleration(body)*delta
    );
    body.vx=next.vx;
    body.vy=next.vy;
    body.x+=body.vx*delta;
    body.y+=body.vy*delta;
  }

  const pairs=pairIndices(state.bodies.length,pairOrder);
  const contactedPairs=new Set();
  const firstContacts=[];

  for(let iteration=0;iteration<iterationCount;iteration++){
    let changed=false;
    for(const [i,j] of pairs){
      const contact=resolveCandidateContactPair(state.bodies[i],state.bodies[j]);
      if(!contact) continue;
      changed=true;
      const id=contact.a<contact.b
        ? `${contact.a}<->${contact.b}`
        : `${contact.b}<->${contact.a}`;
      if(!contactedPairs.has(id)){
        contactedPairs.add(id);
        firstContacts.push({...contact,iteration});
      }
    }
    if(!changed) break;
  }

  state.time+=delta;
  state.contactPairsThisStep=contactedPairs.size;
  state.totalContactPairSteps+=contactedPairs.size;
  state.lastContacts=firstContacts;
  return state;
}

export function createHeadOnContactState({
  a={},
  b={},
  world={width:1400,height:600},
  trialDuration=4
}={}){
  const centerY=finite(world.height,"world.height")/2;
  const bodyA=createContactBody({
    id:"A",
    position:{x:350,y:centerY},
    desiredVelocity:{x:DEFAULT_MAX_SPEED,y:0},
    ...a
  });
  const bodyB=createContactBody({
    id:"B",
    position:{x:1050,y:centerY},
    desiredVelocity:{x:-DEFAULT_MAX_SPEED,y:0},
    ...b
  });

  return {
    world:{width:finite(world.width,"world.width"),height:finite(world.height,"world.height")},
    time:0,
    trialDuration:positive(trialDuration,"trialDuration"),
    status:"RUNNING",
    initialMidpoint:(bodyA.x+bodyB.x)/2,
    bodies:[bodyA,bodyB],
    contactPairsThisStep:0,
    totalContactPairSteps:0,
    firstContactTime:null,
    lastContacts:[]
  };
}

export function stepHeadOnContactState(state,dt,options={}){
  if(state.status==="COMPLETE") return state;
  const beforeContacts=state.totalContactPairSteps;
  stepContactWorld(state,dt,options);
  if(state.firstContactTime===null && state.totalContactPairSteps>beforeContacts){
    state.firstContactTime=state.time;
  }
  if(state.time+EPS>=state.trialDuration){
    state.status="COMPLETE";
    for(const body of state.bodies){
      body.vx=0;
      body.vy=0;
    }
  }
  return state;
}

export function contactOutcomeSnapshot(state){
  const [a,b]=state.bodies;
  const midpoint=(a.x+b.x)/2;
  return {
    status:state.status,
    time:state.time,
    firstContactTime:state.firstContactTime,
    contactPairSteps:state.totalContactPairSteps,
    midpoint,
    midpointShift:midpoint-state.initialMidpoint,
    separation:Math.hypot(b.x-a.x,b.y-a.y),
    bodies:{
      A:{
        x:a.x,y:a.y,vx:a.vx,vy:a.vy,
        mass:a.mass,motorAuthority:a.motorAuthority,
        contactResistance:a.contactResistance,
        acceleration:contactAcceleration(a),
        desiredVelocity:{...a.desiredVelocity}
      },
      B:{
        x:b.x,y:b.y,vx:b.vx,vy:b.vy,
        mass:b.mass,motorAuthority:b.motorAuthority,
        contactResistance:b.contactResistance,
        acceleration:contactAcceleration(b),
        desiredVelocity:{...b.desiredVelocity}
      }
    },
    lastContacts:state.lastContacts.map(contact=>structuredClone(contact))
  };
}
