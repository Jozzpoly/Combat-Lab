import RAPIER from "@dimforge/rapier2d-deterministic";
import { MORPHS, KINDS, DT, clamp, wrap, localResponse, finiteDrive } from "./organism-law.js";

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
    this.actors = [];
    this.matter = [];
    this.walls = [];
    this.colliderOwners = new Map();
    this.ticks = 0;
    this.activeContactCount = 0;
    this.activeActor = null;
    this.contacts = [];
    this.lastFrameMs = 0;
    this.#staticWorld();
    this.spawn("dart", v(6.2, 9), 0);
    this.spawn("crawler", v(15.0, 5.9), Math.PI * 0.48);
    this.spawn("broad", v(27, 12), Math.PI);
    for (const object of [
      { x: 10.7, y: 11, hx: 0.6, hy: 0.55, mass: 16 },
      { x: 13, y: 13.4, hx: 0.65, hy: 0.6, mass: 105 },
      { x: 23.5, y: 9.0, hx: 1.1, hy: 0.27, mass: 45 },
      { x: 20.8, y: 16.1, hx: 0.55, hy: 0.55, mass: 35 },
      { x: 17, y: 17.2, hx: 0.9, hy: 0.30, mass: 24 }
    ]) this.addBox(object, false);
    for (const entry of this.authored) {
      if (entry.kind === "wall") this.addWall(entry, false);
      else this.addBox(entry, false);
    }
    this.activeActor = this.actors[0].id;
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
    const part = { body, collider, shape: { ...shape }, x, y, mass };
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
      id, kind, spec: { ...spec }, root, parts: [], joint: null, tail: null,
      state: { age: 0, pressure: 0, recover: 0, turnSide: 1, recoveries: 0 },
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
    this.activeActor = id;
    return true;
  }
  setActorProfile(id, changes) {
    const actor = this.actor(id);
    if (!actor) throw new RangeError("select an organism to edit");
    const fields = ["mass", "speed", "acceleration", "braking", "turnRate", "turnTorque"];
    const next = { ...actor.spec };
    for (const key of fields) {
      if (Object.prototype.hasOwnProperty.call(changes, key))
        next[key] = num(changes[key], key, key === "mass");
    }
    // Validate *all* derived collider masses before modifying any body.
    const masses = actor.parts.map(part =>
      num(next.mass * part.mass / actor.spec.mass, "part mass", true));
    actor.parts.forEach((part, i) => {
      part.collider.setMass(masses[i]);
      part.mass = masses[i];
      part.body.wakeUp();
    });
    actor.spec = next;
    return { ...next };
  }
  remove(id) {
    const actor = this.actor(id);
    if (!actor) return false;
    // Removing a rigid body also removes its associated impulse joints.
    for (const p of actor.parts) this.colliderOwners.delete(p.collider.handle);
    if (actor.tail) this.world.removeRigidBody(actor.tail);
    this.world.removeRigidBody(actor.root);
    this.actors = this.actors.filter(a => a !== actor);
    if (this.activeActor === id) this.activeActor = this.actors[0]?.id || null;
    return true;
  }
  tractionAt(pos) {
    // Authored static low-traction terrain. This is an explicit XY ground
    // coupling approximation, NOT contact with a 3D ground plane.
    return pos.x > 13 && pos.x < 22 && pos.y > 9.3 && pos.y < 14.4 ? 0.26 : 1;
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
    const vel = body.linvel();
    const impulse = finiteDrive({
      mass: spec.mass, velocity: vel, heading: body.rotation(),
      input: throttle, speed: spec.speed, acceleration: spec.acceleration,
      braking: spec.braking, traction
    });
    body.applyImpulse(impulse, true);
    const inertiaEstimate = spec.mass * (spec.length ** 2 + spec.width ** 2) / 12;
    const torque = clamp((desiredOmega - body.angvel()) * inertiaEstimate,
      -spec.turnTorque * traction * DT, spec.turnTorque * traction * DT);
    body.applyTorqueImpulse(torque, true);
    if (actor.tail) {
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
      throttle, steering: desiredOmega, traction,
      intended: v(Math.cos(body.rotation()) * spec.speed * throttle,
        Math.sin(body.rotation()) * spec.speed * throttle),
      motorImpulse: impulse
    };
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
    const before = new Map(this.actors.map(a => [a.id, { ...a.root.translation() }]));
    for (const actor of this.actors) this.#motor(actor, manual);
    const t = performance.now();
    this.world.step();
    this.lastFrameMs = performance.now() - t;
    this.ticks++;
    let contacts = 0;
    for (const actor of this.actors) {
      const c = this.#readContacts(actor);
      actor.contactCount = c.count;
      contacts += c.count;
      const prev = before.get(actor.id), now = actor.root.translation();
      const intended = actor.control.intended;
      const speed = mag(intended);
      const progress = speed > 0.01 ?
        ((now.x - prev.x) * intended.x + (now.y - prev.y) * intended.y) /
        (DT * speed * speed) : 1;
      actor.sense = { touch: c.touch, progress };
    }
    this.activeContactCount = contacts;
  }
  kick(id, p, amount) {
    const actor = this.actor(id);
    const box = this.matter.find(x => x.id === id);
    const body = actor?.root || box?.body;
    if (!body) return false;
    const center = body.translation();
    const dx = p.x - center.x, dy = p.y - center.y;
    const n = Math.hypot(dx, dy) || 1;
    const a = num(amount, "impulse", false);
    body.applyImpulseAtPoint(v(dx / n * a, dy / n * a), p, true);
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
  clearEdits() { this.authored = []; this.reset(); }
  snapshot() {
    return {
      tick: this.ticks, activeActor: this.activeActor,
      count: this.actors.length, matterCount: this.matter.length,
      activeContacts: this.activeContactCount,
      physicsMs: this.lastFrameMs,
      actors: this.actors.map(a => ({
        id: a.id, kind: a.kind, pos: { ...a.root.translation() },
        angle: a.root.rotation(), speed: mag(a.root.linvel()),
        contacts: a.contactCount, recoveries: a.state.recoveries,
        traction: a.control.traction, mode: a.control.mode
      }))
    };
  }
}
