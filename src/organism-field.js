import RAPIER from "@dimforge/rapier2d-deterministic";
import { validateScene, actorRecipe } from "./scene-recipe.js";
import { MORPHS, KINDS, DT, clamp, wrap, localResponse, finiteDrive, finiteGrip } from "./organism-law.js";

export const FIELD = Object.freeze({ width: 34, height: 22 });
const v = (x, y) => ({ x, y });
const mag = a => Math.hypot(a.x, a.y);
const rotate = (p, a) => v(p.x * Math.cos(a) - p.y * Math.sin(a),
  p.x * Math.sin(a) + p.y * Math.cos(a));
function num(value, label, positive = false) {
  const n = Number(value);
  if (!Number.isFinite(n) || (positive ? n <= 0 : n < 0) ||
      !Number.isFinite(Math.fround(n)) || (n !== 0 && Math.fround(n) === 0))
    throw new RangeError(label + " must be solver-representable and " +
      (positive ? "positive" : "nonnegative"));
  return n;
}

export class OrganismField {
  constructor() {
    this.authored = [];
    this.sceneRecipe = null;
    this.nextId = 0;
    this.lastFrameMs = 0;
    this.activeContactCount = 0;
    this.reset();
  }
  static async create() { return new OrganismField(); }
  reset() {
    if (this.world) this.world.free();
    this.world = new RAPIER.World(v(0, 0));
    this.world.timestep = DT;
    this.nextId = 0; // reset reproduces stable starting-scene runtime identities
    this.actors = [];
    this.matter = [];
    this.walls = [];
    this.gates = [];
    this.colliderOwners = new Map();
    this.ticks = 0;
    this.activeContactCount = 0;
    this.activeActor = null;
    this.contacts = [];
    this.lastFrameMs = 0;
    this.grip = null;
    this.gripImpulse = {x:0,y:0};
    this.#staticWorld();
    if(this.sceneRecipe){
      for(const item of this.sceneRecipe.walls)this.addWall(item,false);
      for(const item of this.sceneRecipe.matter){
        const obj=this.addBox(item,false);
        obj.body.setRotation(item.angle,true);
      }
      for(const item of this.sceneRecipe.gates)this.addGate(item,false);
      for(const item of this.sceneRecipe.actors){
        const a=this.spawn(item.kind,item.pos,item.heading);
        this.setActorProfile(a.id,item.profile);
        this.resizeMorphology(a.id,{length:item.length,width:item.width});
      }
    }else{
      this.spawn("dart", v(6.2, 9), 0);
      this.spawn("crawler", v(15.0, 5.9), Math.PI * 0.48);
      this.spawn("broad", v(27, 12), Math.PI);
      this.spawn("worm", v(6.2, 17), 0);
      for(const object of [
        {x:10.7,y:11,hx:.6,hy:.55,mass:16},
        {x:13,y:13.4,hx:.65,hy:.6,mass:105},
        {x:23.5,y:9,hx:1.1,hy:.27,mass:45},
        {x:20.8,y:16.1,hx:.55,hy:.55,mass:35},
        {x:17,y:17.2,hx:.9,hy:.30,mass:24}
      ])this.addBox(object,false);
      this.addGate({x:19.7,y:15.7,length:3.25,mass:105},false);
    }
    for(const entry of this.authored){
      if(entry.kind==="wall")this.addWall(entry,false);
      else if(entry.kind==="gate")this.addGate(entry,false);
      else this.addBox(entry,false);
    }
    this.activeActor=this.actors[0]?.id||null;
  }
  #staticWorld() {
    for (const r of [
      { x: 17, y: 0.18, hx: 17, hy: 0.18 },
      { x: 17, y: 21.82, hx: 17, hy: 0.18 },
      { x: 0.18, y: 11, hx: 0.18, hy: 11 },
      { x: 33.82, y: 11, hx: 0.18, hy: 11 },
      { x: 10.2, y: 5.5, hx: 0.30, hy: 2.2 },
      { x: 10.2, y: 17.7, hx: 0.30, hy: 3.6 },
      { x: 20.0, y: 6.1, hx: 2.2, hy: 0.32 },
      { x: 25.2, y: 16.7, hx: 0.35, hy: 2.55 },
      { x: 29.8, y: 6.1, hx: 1.4, hy: 0.3 }
    ]) this.addWall(r, false);
  }
  addWall(r, authored = true) {
    const x = Number(r.x), y = Number(r.y), hx = num(r.hx, "wall hx", true),
      hy = num(r.hy, "wall hy", true);
    if (!Number.isFinite(x) || !Number.isFinite(y) || hx < 0.03 || hy < 0.03)
      throw new RangeError("unsafe wall geometry");
    const id = "wall-" + ++this.nextId;
    const collider = this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(hx, hy).setTranslation(x, y)
        .setFriction(0.8).setRestitution(0));
    this.walls.push({ id, x, y, hx, hy, collider });
    this.colliderOwners.set(collider.handle, id);
    if (authored) this.authored.push({ kind: "wall", x, y, hx, hy });
    return id;
  }
  addBox(r, authored = true) {
    const x = Number(r.x), y = Number(r.y), hx = num(r.hx, "box hx", true),
      hy = num(r.hy, "box hy", true), mass = num(r.mass, "box mass", true);
    if (!Number.isFinite(x) || !Number.isFinite(y) || hx < 0.04 || hy < 0.04)
      throw new RangeError("unsafe matter geometry");
    const id = "matter-" + ++this.nextId;
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y)
        .setLinearDamping(0.65).setAngularDamping(0.65).setCcdEnabled(true));
    const collider = this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(hx, hy).setMass(mass)
        .setFriction(0.7).setRestitution(0), body);
    const obj = { id, kind: "matter", body, collider, hx, hy, mass };
    this.matter.push(obj);
    this.colliderOwners.set(collider.handle, id);
    if (authored) this.authored.push({ kind: "box", x, y, hx, hy, mass });
    return obj;
  }
  // A real dynamic gate rotates around a static world pivot. The pivot
  // is not a script that chooses whether the actor may pass.
  addGate({x,y,length=3,mass=80,angle=0},authored=true){
    const px=Number(x),py=Number(y),len=num(length,"gate length",true),
      m=num(mass,"gate mass",true);
    if(!Number.isFinite(px)||!Number.isFinite(py)||
      !Number.isFinite(angle)||!Number.isFinite(Math.fround(angle))||len<.20)
      throw new RangeError("invalid physical gate");
    const half=len/2, id="gate-"+ ++this.nextId;
    const pivot=this.world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(px,py));
    const body=this.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(px+half*Math.cos(angle),py+half*Math.sin(angle))
      .setRotation(angle).setLinearDamping(.4)
      .setAngularDamping(1.7).setCcdEnabled(true));
    const collider=this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(half,.18)
        .setMass(m).setFriction(.75).setRestitution(0),body);
    const joint=this.world.createImpulseJoint(
      RAPIER.JointData.revolute(v(0,0),v(-half,0)),pivot,body,true);
    const gate={id,kind:"gate",body,collider,joint,pivot,
      pivotPoint:v(px,py),hx:half,hy:.18,mass:m};
    this.matter.push(gate);this.gates.push(gate);
    this.colliderOwners.set(collider.handle,id);
    if(authored)this.authored.push({kind:"gate",x:px,y:py,length:len,mass:m});
    return gate;
  }
  #newBody(p, heading) {
    return this.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(p.x, p.y).setRotation(heading)
      .setLinearDamping(0.45).setAngularDamping(1.4).setCcdEnabled(true));
  }
  #part(actor, body, shape, x, y, mass) {
    const d = shape.type === "ball" ? RAPIER.ColliderDesc.ball(shape.r) :
      RAPIER.ColliderDesc.cuboid(shape.hx, shape.hy);
    const collider = this.world.createCollider(
      d.setTranslation(x, y).setMass(mass).setFriction(0.7).setRestitution(0), body);
    const part = { body, collider, shape: { ...shape }, baseShape: { ...shape },
      x, y, baseX: x, baseY: y, mass };
    actor.parts.push(part);
    this.colliderOwners.set(collider.handle, actor.id);
    return part;
  }
  spawn(kind, p, heading = 0) {
    if (!KINDS.includes(kind)) throw new RangeError("unknown morphology");
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y) ||
        !Number.isFinite(heading)) throw new RangeError("nonfinite actor pose");
    const spec = MORPHS[kind];
    const id = "organism-" + ++this.nextId;
    const root = this.#newBody(p, heading);
    const actor = {
      id, kind, spec: { ...spec }, shapeScale: { length: 1, width: 1 },
      root, parts: [], joint: null, tail: null,
      state: { age: 0, pressure: 0, recover: 0, turnSide: 1, recoveries: 0 },
      strokeTick: 0,
      sense: { touch: false, progress: 1 },
      control: { mode: "local", throttle: 0, steering: 0, traction: 1 },
      contactCount: 0
    };
    if (kind === "dart") {
      this.#part(actor, root, { type: "box", hx: 0.47, hy: 0.19 }, 0, 0, 14);
      this.#part(actor, root, { type: "ball", r: 0.20 }, 0.42, 0, 4);
    } else if (kind === "broad") {
      this.#part(actor, root, { type: "box", hx: 0.73, hy: 1.12 }, 0, 0, 196);
      this.#part(actor, root, { type: "ball", r: 0.43 }, 0.68, 0, 49);
    } else if (kind === "worm") {
      this.#part(actor, root, { type: "box", hx: 0.44, hy: 0.31 }, 0, 0, 42);
      const off = rotate(v(-1.16, 0), heading);
      const tail = this.#newBody(v(p.x+off.x,p.y+off.y),heading);
      this.#part(actor, tail, { type: "box", hx: 0.44, hy: 0.31 },0,0,42);
      actor.tail = tail;
      const params=RAPIER.JointData.prismatic(v(0,0),v(0,0),v(1,0));
      params.limitsEnabled=true;params.limits=[-1.85,-.73];
      actor.joint=this.world.createImpulseJoint(params,root,tail,true);
    } else {
      this.#part(actor, root, { type: "box", hx: 0.56, hy: 0.36 }, 0, 0, 48);
      const tailOffset = rotate(v(-1.11, 0), heading);
      const tail = this.#newBody(v(p.x + tailOffset.x, p.y + tailOffset.y), heading);
      this.#part(actor, tail, { type: "box", hx: 0.62, hy: 0.31 }, 0, 0, 40);
      actor.tail = tail;
      // Real revolute constraint: one shared organism, two solver bodies.
      actor.joint = this.world.createImpulseJoint(
        RAPIER.JointData.revolute(v(-0.53, 0), v(0.58, 0)),
        root, tail, true);
    }
    this.actors.push(actor);
    return actor;
  }
  actor(id) { return this.actors.find(a => a.id === id) || null; }
  select(id) {
    if (!this.actor(id)) return false;
    if (this.grip && this.grip.actorId !== id) this.releaseGrip();
    this.activeActor = id;
    return true;
  }
  resizeMorphology(id, { length, width }) {
    const actor = this.actor(id);
    if (!actor) throw new RangeError("select an organism to resize");
    const sx = num(length, "length scale", true);
    const sy = num(width, "width scale", true);
    // Compute and check *all* replacement collider dimensions first.
    const edits = actor.parts.map(part => {
      const base = part.baseShape;
      const shape = base.type === "ball" ?
        {type:"ball",r:base.r*Math.min(sx,sy)} :
        {type:"box",hx:base.hx*sx,hy:base.hy*sy};
      const x = part.baseX*sx, y = part.baseY*sy;
      const values = base.type === "ball" ? [shape.r] : [shape.hx,shape.hy];
      if (!values.every(n => Number.isFinite(Math.fround(n)) && n >= .04) ||
          !Number.isFinite(Math.fround(x)) || !Number.isFinite(Math.fround(y)))
        throw new RangeError("collider would be unrepresentably thin/large");
      return {part,shape,x,y};
    });
    if (!Number.isFinite(Math.fround(1.11*sx)))
      throw new RangeError("joint length cannot be represented by solver");
    for (const {part,shape,x,y} of edits) {
      if (shape.type === "ball") part.collider.setRadius(shape.r);
      else part.collider.setHalfExtents(v(shape.hx,shape.hy));
      part.collider.setTranslationWrtParent(v(x,y));
      part.shape=shape;
      part.x=x;part.y=y;
    }
    if (actor.joint) {
      // Intentional research-side morphology intervention, NOT animal motion.
      // Reanchor and reset only this articulated body's tail. Other dynamic
      // world afterstate and all other organisms remain exactly where they are.
      this.world.removeImpulseJoint(actor.joint,true);
      const root=actor.root, tail=actor.tail;
      const p=root.translation(), a=root.rotation();
      const d=rotate(v(-(actor.kind==="worm"?1.16:1.11)*sx,0),a);
      tail.setTranslation(v(p.x+d.x,p.y+d.y),true);
      tail.setRotation(a,true);
      tail.setLinvel(root.linvel(),true);
      tail.setAngvel(root.angvel(),true);
      if(actor.kind==="worm"){
        const params=RAPIER.JointData.prismatic(v(0,0),v(0,0),v(1,0));
        params.limitsEnabled=true;params.limits=[-1.85*sx,-.73*sx];
        actor.joint=this.world.createImpulseJoint(params,root,tail,true);
      }else{
        actor.joint=this.world.createImpulseJoint(
          RAPIER.JointData.revolute(v(-.53*sx,0),v(.58*sx,0)),
          root,tail,true);
      }
    }
    for(const b of new Set(actor.parts.map(part=>part.body)))
      b.recomputeMassPropertiesFromColliders();
    actor.shapeScale={length:sx,width:sy};
    actor.spec={...actor.spec,length:MORPHS[actor.kind].length*sx,
      width:MORPHS[actor.kind].width*sy};
    // Avoid interpreting reset-relative proprioception as genuine travel
    // across a deliberate shape intervention. The local policy resets.
    actor.sense={touch:false,progress:1};
    actor.state={age:0,pressure:0,recover:0,turnSide:1,recoveries:0};
    return { ...actor.shapeScale };
  }
  setActorProfile(id, changes) {
    const actor = this.actor(id);
    if (!actor) throw new RangeError("select an organism to edit");
    const fields = ["mass", "speed", "acceleration", "braking", "turnRate", "turnTorque", "gripReach", "gripForce", "rearDrive", "muscleForce", "supportForce"];
    const next = { ...actor.spec };
    for (const key of fields) {
      if (Object.prototype.hasOwnProperty.call(changes, key))
        next[key] = num(changes[key], key, key === "mass");
    }
    if (next.rearDrive !== undefined && (next.rearDrive > 1 ||
        (actor.kind!=="crawler" && Object.hasOwn(changes,"rearDrive"))))
      throw new RangeError("rear drive fraction requires articulated body and range [0,1]");
    // Validate *all* derived collider masses before modifying any body.
    const masses = actor.parts.map(part =>
      num(next.mass * part.mass / actor.spec.mass, "part mass", true));
    actor.parts.forEach((part, i) => {
      part.collider.setMass(masses[i]);
      part.mass = masses[i];
      part.body.wakeUp();
    });
    for (const body of new Set(actor.parts.map(part => part.body)))
      body.recomputeMassPropertiesFromColliders();
    actor.spec = next;
    return { ...next };
  }
  remove(id) {
    const actor = this.actor(id);
    if (!actor) return false;
    if(this.grip?.actorId === id) this.releaseGrip();
    // Removing a rigid body also removes its associated impulse joints.
    for (const p of actor.parts) this.colliderOwners.delete(p.collider.handle);
    if (actor.tail) this.world.removeRigidBody(actor.tail);
    this.world.removeRigidBody(actor.root);
    this.actors = this.actors.filter(a => a !== actor);
    if (this.activeActor === id) this.activeActor = this.actors[0]?.id || null;
    return true;
  }
  // Grip acquisition is against the real rotated rectangle, not object-centre
  // proximity. Author-controlled cursor target, finite reach and force;
  // the crate retains mass, momentum and unconstrained rotation.
  beginGrip(point) {
    const actor = this.actor(this.activeActor);
    if (!actor || !Number.isFinite(point.x) || !Number.isFinite(point.y))return false;
    const root = actor.root.translation();
    let closest = null;
    for (const obj of this.matter) {
      const p = obj.body.translation(), angle=obj.body.rotation();
      const local=rotate(v(point.x-p.x, point.y-p.y),-angle);
      const dx=Math.max(0,Math.abs(local.x)-obj.hx);
      const dy=Math.max(0,Math.abs(local.y)-obj.hy);
      const error=Math.hypot(dx,dy);
      if (error>.20)continue;
      const reach=Math.hypot(point.x-root.x,point.y-root.y);
      if (reach > actor.spec.gripReach + .12) continue;
      if (!closest || error < closest.error)
        closest={obj,local,error};
    }
    if(!closest)return false;
    this.grip={actorId:actor.id,objectId:closest.obj.id,
      local:closest.local,target:{...point},worldAnchor:{...point}};
    this.gripImpulse=v(0,0);
    return true;
  }
  setGripTarget(point) {
    if(!Number.isFinite(point.x)||!Number.isFinite(point.y))
      throw new RangeError("invalid grip target");
    if(this.grip)this.grip.target={...point};
  }
  releaseGrip(){this.grip=null;this.gripImpulse=v(0,0);}
  #stepGrip(){
    const grip=this.grip;
    if(!grip){this.gripImpulse=v(0,0);return;}
    const actor=this.actor(grip.actorId);
    const obj=this.matter.find(m=>m.id===grip.objectId);
    if(!actor||!obj){this.releaseGrip();return;}
    const pos=actor.root.translation();
    const delta=v(grip.target.x-pos.x,grip.target.y-pos.y);
    const len=mag(delta),range=actor.spec.gripReach;
    const factor=len>range ? range/len : 1;
    const target=v(pos.x+delta.x*factor,pos.y+delta.y*factor);
    const objPos=obj.body.translation();
    const offset=rotate(grip.local,obj.body.rotation());
    const anchor=v(objPos.x+offset.x,objPos.y+offset.y);
    const velocity=obj.body.linvel(),omega=obj.body.angvel();
    const anchorVelocity=v(velocity.x-omega*offset.y,velocity.y+omega*offset.x);
    // Force reaction at the organ's leading edge, never a kinematic
    // teleport nor a reaction-free remotely moved crate.
    const front=rotate(v(Math.min(actor.spec.length*.35,.65),0),
      actor.root.rotation());
    const hand=v(pos.x+front.x,pos.y+front.y);
    const ownV=actor.root.linvel(), ownOmega=actor.root.angvel();
    const handVelocity=v(ownV.x-ownOmega*front.y,ownV.y+ownOmega*front.x);
    const impulse=finiteGrip({
      playerMass:actor.root.mass(),objectMass:obj.body.mass(),
      anchorVelocity:v(anchorVelocity.x-handVelocity.x,
        anchorVelocity.y-handVelocity.y),
      targetError:v(target.x-anchor.x,target.y-anchor.y),
      maxForce:actor.spec.gripForce
    });
    obj.body.applyImpulseAtPoint(impulse,anchor,true);
    actor.root.applyImpulseAtPoint(v(-impulse.x,-impulse.y),hand,true);
    grip.worldAnchor=anchor;
    grip.clampedTarget=target;
    this.gripImpulse=impulse;
  }
  tractionAt(pos) {
    // Authored static low-traction terrain. This is an explicit XY ground
    // coupling approximation, NOT contact with a 3D ground plane.
    return pos.x > 13 && pos.x < 22 && pos.y > 9.3 && pos.y < 14.4 ? 0.26 : 1;
  }
  #wormMotor(actor,throttle){
    const head=actor.root,tail=actor.tail,spec=actor.spec;
    if(Math.abs(throttle)<.001)return {x:0,y:0};
    const forward=v(Math.cos(head.rotation()),Math.sin(head.rotation()));
    const phase=actor.strokeTick%100/100;
    const extending=phase<.5;
    const h=head.translation(),r=tail.translation();
    const hv=head.linvel(),rv=tail.linvel();
    const span=(h.x-r.x)*forward.x+(h.y-r.y)*forward.y;
    const rel=(hv.x-rv.x)*forward.x+(hv.y-rv.y)*forward.y;
    const target=(extending?1.64:.88)*actor.shapeScale.length;
    const force=clamp((target-span)*180-rel*42,
      -spec.muscleForce,spec.muscleForce)*Math.abs(throttle);
    // Reciprocal muscle impulses; cannot propel an isolated two-body system.
    const stroke=v(forward.x*force*DT,forward.y*force*DT);
    head.applyImpulse(stroke,true);
    tail.applyImpulse(v(-stroke.x,-stroke.y),true);
    // The physical location chosen as stance point controls external ground
    // reaction. More grip is not assumed to yield more forward travel.
    const anchor=(throttle>=0)===(extending)?tail:head;
    const vel=anchor.linvel(),mass=anchor.mass();
    const raw=v(-vel.x*mass,-vel.y*mass);
    const magJ=mag(raw),maxJ=spec.supportForce*DT*
      this.tractionAt(anchor.translation());
    const ratio=magJ>1e-8?Math.min(1,maxJ/magJ):0;
    const support=v(raw.x*ratio,raw.y*ratio);
    anchor.applyImpulse(support,true);
    actor.strokeTick+=Math.min(3,Math.abs(throttle)*spec.speed/2);
    actor.controlStroke={phase:extending?"extend":"retract",
      support:mag(support),stroke:mag(stroke)};
    return support;
  }
  #motor(actor, manual) {
    const body = actor.root, spec = actor.spec;
    const selected = actor.id === this.activeActor;
    let throttle, desiredOmega;
    if (selected && manual && mag(manual) > 0.01) {
      const direction = Math.atan2(manual.y, manual.x);
      const angleError = wrap(direction - body.rotation());
      throttle = 1;
      desiredOmega = clamp(angleError * 4.0, -spec.turnRate, spec.turnRate);
    } else if (selected && manual) {
      throttle = 0;
      desiredOmega = 0;
    } else {
      const response = localResponse(actor.state, actor.sense);
      actor.state = response.state;
      throttle = response.throttle;
      desiredOmega = response.steer * spec.turnRate;
    }
    const traction = this.tractionAt(body.translation());
    const rearTraction = actor.tail ?
      this.tractionAt(actor.tail.translation()) : null;
    let impulse;
    if(actor.kind==="worm"){
      impulse=this.#wormMotor(actor,throttle);
    }else if(actor.tail){
      // Distinct supporting segment positions create independent *external*
      // traction limits. The drive split is authored; internal bend torque
      // remains reciprocal and is not claimed as ground-generated gait.
      const share=spec.rearDrive;
      const front=finiteDrive({
        mass:spec.mass*(1-share),velocity:body.linvel(),
        heading:body.rotation(),input:throttle,speed:spec.speed,
        acceleration:spec.acceleration,braking:spec.braking,traction
      });
      const rear=finiteDrive({
        mass:spec.mass*share,velocity:actor.tail.linvel(),
        heading:body.rotation(),input:throttle,speed:spec.speed,
        acceleration:spec.acceleration,braking:spec.braking,
        traction:rearTraction
      });
      body.applyImpulse(front,true);
      actor.tail.applyImpulse(rear,true);
      impulse=v(front.x+rear.x,front.y+rear.y);
    }else{
      impulse=finiteDrive({
        mass:spec.mass,velocity:body.linvel(),heading:body.rotation(),
        input:throttle,speed:spec.speed,acceleration:spec.acceleration,
        braking:spec.braking,traction
      });
      body.applyImpulse(impulse,true);
    }
    const inertiaEstimate = spec.mass * (spec.length ** 2 + spec.width ** 2) / 12;
    const torque = clamp((desiredOmega - body.angvel()) * inertiaEstimate,
      -spec.turnTorque * traction * DT, spec.turnTorque * traction * DT);
    body.applyTorqueImpulse(torque, true);
    if (actor.kind==="crawler") {
      // Internal articulated movement is real and reciprocal, but only the
      // explicit substrate drive creates net free-space propulsion.
      const bend = wrap(actor.tail.rotation() - body.rotation());
      const target = Math.sin(this.ticks * 0.09) * 0.24;
      const effort = clamp((target - bend) * 15 -
        (actor.tail.angvel() - body.angvel()) * 2.5, -1.8, 1.8) * DT;
      actor.tail.applyTorqueImpulse(effort, true);
      body.applyTorqueImpulse(-effort, true);
    }
    actor.control = {
      mode: selected && manual ? "manual" : "local",
      throttle, steering: desiredOmega, traction, rearTraction,
      intended: v(Math.cos(body.rotation()) * spec.speed * throttle,
        Math.sin(body.rotation()) * spec.speed * throttle),
      motorImpulse: impulse
    };
  }
  #physicalCenter(actor){
    // A multi-part organism's progress is its *actual mass-weighted centre*,
    // not the tip of an oscillating head or one preferred physics body.
    const bodies=actor.tail?[actor.root,actor.tail]:[actor.root];
    let sumMass=0,x=0,y=0;
    for(const body of bodies){
      const m=body.mass(),p=body.translation();
      sumMass+=m;x+=m*p.x;y+=m*p.y;
    }
    return sumMass>0 ? v(x/sumMass,y/sumMass) :
      {...actor.root.translation()};
  }
  #readContacts(actor) {
    let touch = false, count = 0;
    for (const part of actor.parts) {
      this.world.contactPairsWith(part.collider, other => {
        const owner = this.colliderOwners.get(other.handle);
        if (!owner || owner === actor.id) return;
        this.world.contactPair(part.collider, other, manifold => {
          if (!manifold.numSolverContacts()) return;
          touch = true;
          count += 1;
        });
      });
    }
    return { touch, count };
  }
  step(manual = null) {
    const before = new Map(this.actors.map(a => [a.id, this.#physicalCenter(a)]));
    for (const actor of this.actors) this.#motor(actor, manual);
    this.#stepGrip();
    const t = performance.now();
    this.world.step();
    this.lastFrameMs = performance.now() - t;
    this.ticks++;
    let contacts = 0;
    for (const actor of this.actors) {
      const c = this.#readContacts(actor);
      actor.contactCount = c.count;
      contacts += c.count;
      const prev = before.get(actor.id), now = this.#physicalCenter(actor);
      const intended = actor.control.intended;
      const speed = mag(intended);
      const progress = speed > 0.01 ?
        ((now.x - prev.x) * intended.x + (now.y - prev.y) * intended.y) /
        (DT * speed * speed) : 1;
      actor.sense = { touch: c.touch, progress };
    }
    this.activeContactCount = contacts;
  }
  kick(id, p, amount, mode="radial") {
    const actor = this.actor(id);
    const box = this.matter.find(x => x.id === id);
    const body = actor?.root || box?.body;
    if (!body) return false;
    const center = body.translation();
    const dx = p.x - center.x, dy = p.y - center.y;
    const n = Math.hypot(dx, dy) || 1;
    const a = num(amount, "impulse", false);
    if(!["radial","tangential"].includes(mode))throw new RangeError("unknown impulse direction");
    const direction=mode==="tangential" ?
      v(-dy/n*a,dx/n*a) : v(dx/n*a,dy/n*a);
    // Unlike radial impulses, a tangent at an offset produces real torque.
    body.applyImpulseAtPoint(direction,p,true);
    return true;
  }
  pick(p) {
    const items = [
      ...this.actors.flatMap(a => a.parts.map(part =>
        ({ id: a.id, position: part.collider.translation() }))),
      ...this.matter.map(m => ({ id: m.id, position: m.body.translation() }))
    ];
    const chosen = items.map(e => ({ ...e, d: Math.hypot(e.position.x - p.x,
      e.position.y - p.y) })).sort((a, b) => a.d - b.d)[0];
    return chosen && chosen.d < 1.6 ? chosen.id : null;
  }
  // Saved scene = explicit starting poses, not running solver/cognition replay.
  exportScene(){
    return validateScene({
      format:"combat-lab.initial-scene.v1",
      actors:this.actors.map(actorRecipe),
      walls:this.walls.slice(9).map(w=>({
        x:w.x,y:w.y,hx:w.hx,hy:w.hy
      })),
      matter:this.matter.filter(m=>m.kind!=="gate").map(m=>{
        const p=m.body.translation();
        return {x:p.x,y:p.y,hx:m.hx,hy:m.hy,
          mass:m.mass,angle:m.body.rotation()};
      }),
      gates:this.gates.map(g=>({
        x:g.pivotPoint.x,y:g.pivotPoint.y,length:g.hx*2,
        mass:g.mass,angle:g.body.rotation()
      }))
    });
  }
  importScene(input){
    // Reject all malformed content before resetting live physical history.
    const validated=validateScene(input);
    this.sceneRecipe=validated;
    this.authored=[];
    this.reset();
    return {actors:this.actors.length,matter:this.matter.length,
      walls:this.walls.length,gates:this.gates.length};
  }
  clearEdits() { this.authored = []; this.reset(); }
  snapshot() {
    return {
      tick: this.ticks, activeActor: this.activeActor,
      count: this.actors.length, matterCount: this.matter.length,
      activeContacts: this.activeContactCount,
      physicsMs: this.lastFrameMs,
      grip: this.grip ? {actorId:this.grip.actorId,objectId:this.grip.objectId,
        force:mag(this.gripImpulse)/DT} : null,
      actors: this.actors.map(a => ({
        id: a.id, kind: a.kind, pos: { ...a.root.translation() },
        angle: a.root.rotation(), speed: mag(a.root.linvel()),
        contacts: a.contactCount, recoveries: a.state.recoveries,
        traction: a.control.traction, mode: a.control.mode
      }))
    };
  }
}
