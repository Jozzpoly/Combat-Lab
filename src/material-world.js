import RAPIER from "@dimforge/rapier2d-deterministic";
import { clampMagnitude, computeGripImpulse, computeMotorImpulse } from "./control-laws.js";
import { stepLocalShuttle } from "./local-shuttle.js";

export const FIXED_DT = 1 / 60;
export const WORLD_SIZE = Object.freeze({ width: 24, height: 14 });

export const DEFAULT_PROFILE = Object.freeze({
  radius: 0.45,
  mass: 40,
  maxSpeed: 4.5,
  acceleration: 18,
  braking: 24,
  gripBraking: 24,
  gripReach: 2.6,
  gripForce: 260
});

export const DEFAULT_RESIDENT_PROFILE = Object.freeze({
  radius: 0.56,
  mass: 72,
  maxSpeed: 2.1,
  acceleration: 7,
  braking: 10
});

const COLORS = Object.freeze({
  player: "#73b7ff",
  resident: "#e08b5c",
  light: "#c9aa6a",
  heavy: "#8d7460",
  plank: "#a78c68"
});

// Accept zero for authored motor/grip authority, but not zero-sized or
// massless rigid bodies. Invalid values fail visibly rather than silently
// restoring a previous value that contradicts the user's input.
function authoredNumber(value, name, strictlyPositive) {
  const number = Number(value);
  if (!Number.isFinite(number) || (strictlyPositive ? number <= 0 : number < 0)) {
    throw new RangeError(name + " must be finite and " +
      (strictlyPositive ? "greater than zero" : "nonnegative"));
  }
  return number;
}

function authoredCoordinate(value, name) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new RangeError(name + " must be finite");
  return number;
}

function rotate(v, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
}

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export class MaterialWorld {
  static async create() {
    // The non-compat Rapier ESM build loads its WASM through the module import.
    // Its default export does not expose the explicit init() of the -compat build.
    return new MaterialWorld();
  }

  constructor() {
    this.profile = { ...DEFAULT_PROFILE };
    this.residentProfile = { ...DEFAULT_RESIDENT_PROFILE };
    // Off by default, so single-resident evidence remains an untouched null.
    // This switch adds a second embodied participant to the *same* World.
    this.peerEnabled = false;
    this.peerMass = 210;
    // Optional third physical role: a finite-braking dynamic buffer.
    // Not a wall, not a static collider, and not a third copy of the patrol.
    this.braceEnabled = false;
    this.braceMass = 120;
    this.braceBraking = 30;
    this.peerMode = "tactile-recovery";
    // These are authored edits, distinct from runtime motion/afterstate.
    // Ordinary reset replays them; clear/undo deliberately change the authored scene.
    this.authoredShapes = [];
    this.authoredSerial = 0;
    // Authored starting positions are kept separate from runtime physics.
    this.bodyStarts = new Map();
    this.spawnSerial = 0;
    this.selectedId = "player";
    this.grip = null;
    this.lastGripForce = 0;
    this.lastGripReaction = { x: 0, y: 0 };
    this.lastCausalObservations = new Map();
    this.staticRects = [];
    this.entities = new Map();
    this.colliderLabels = new Map();
    this.residentDirection = 1;
    this.residentSense = null;
    this.physicsTick = 0;
    this.interventionEvents = [];
    // This probe preserves two selectable, explicitly authored low-level
    // control laws. Neither one is autonomous cognition or a world planner.
    this.residentMode = "tactile-recovery";
    this.residentSidePreference = 1;
    this.peerSidePreference = -1;
    this.reset();
  }

  reset() {
    if (this.world) this.world.free();
    this.world = new RAPIER.World({ x: 0, y: 0 });
    this.world.timestep = FIXED_DT;
    this.entities.clear();
    this.colliderLabels.clear();
    this.staticRects = [];
    this.staticColliderById = new Map();
    this.grip = null;
    this.lastGripForce = 0;
    this.lastGripReaction = { x: 0, y: 0 };
    this.lastCausalObservations.clear();
    this.spawnSerial = 0;
    // Runtime spawned crates intentionally do not become permanent objects.
    for (const id of this.bodyStarts.keys()) {
      if (id.startsWith("spawn-")) this.bodyStarts.delete(id);
    }
    this.residentDirection = 1;
    this.residentSense = null;
    this.physicsTick = 0;
    this.interventionEvents = [];
    this.residentControl = {
      tick: 0, blockedTicks: 0, recoveryTicks: 0, recoveries: 0,
      estimatedX: 0, estimatedY: 0, lateralTicks: 0, lateralAttempts: 0,
      state: "cruise", lastTransition: null
    };
    this.peerDirection = -1;
    this.peerSense = null;
    this.peerControl = this.#newLocalControl();

    this.#buildStaticWorld();
    this.#createPlayer();
    this.#createResident();
    if (this.peerEnabled) this.#createPeer();
    if (this.braceEnabled) this.#createBrace();
    this.#createBox("light-crate", { x: 6.9, y: 5.8 }, { x: 0.48, y: 0.48 }, 14, COLORS.light, true);
    this.#createBox("plank", { x: 12.8, y: 6.6 }, { x: 1.05, y: 0.28 }, 34, COLORS.plank, true);
    this.#createBox("heavy-crate", { x: 16.5, y: 5.25 }, { x: 0.68, y: 0.68 }, 120, COLORS.heavy, true);
    for (const shape of this.authoredShapes) this.#instantiateAuthored(shape);
    for (const [id, p] of this.bodyStarts) {
      const entity = this.entities.get(id);
      if (entity) this.#setBodyPosition(entity, p);
    }
    this.selectedId = "player";
    this.#recordEvent("world.reset", this.authoredShapes.length +
      " authored shapes reconstructed");
  }

  #recordEvent(type, note) {
    // Research-plane intervention history. These events never enter the
    // resident's private tactile/proprioceptive input.
    this.interventionEvents.push({ tick: this.physicsTick, type, note });
    if (this.interventionEvents.length > 24) this.interventionEvents.shift();
  }

  #staticRect(id, cx, cy, width, height) {
    const desc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2)
      .setTranslation(cx, cy)
      .setFriction(0.75)
      .setRestitution(0);
    const collider = this.world.createCollider(desc);
    this.colliderLabels.set(collider.handle, id);
    this.staticColliderById.set(id, collider);
    this.staticRects.push({ id, cx, cy, width, height });
  }

  #buildStaticWorld() {
    const w = WORLD_SIZE.width;
    const h = WORLD_SIZE.height;
    const t = 0.3;
    this.#staticRect("boundary.top", w / 2, t / 2, w, t);
    this.#staticRect("boundary.bottom", w / 2, h - t / 2, w, t);
    this.#staticRect("boundary.left", t / 2, h / 2, t, h);
    this.#staticRect("boundary.right", w - t / 2, h / 2, t, h);

    this.#staticRect("divider.upper", 10, 2.75, 0.55, 4.9);
    this.#staticRect("divider.lower", 10, 10.55, 0.55, 6.3);
    this.#staticRect("island", 15.7, 9.0, 1.4, 2.2);
    this.#staticRect("alcove.wall", 19.1, 3.1, 4.0, 0.45);
    this.#staticRect("alcove.stop", 21.0, 4.25, 0.45, 2.7);
  }

  #createPlayer() {
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(4.0, 7.0)
        .setLinearDamping(0.35)
        .setAngularDamping(1.5)
        .setCcdEnabled(true)
    );
    const collider = this.world.createCollider(
      RAPIER.ColliderDesc.ball(this.profile.radius)
        .setMass(this.profile.mass)
        .setFriction(0.55)
        .setRestitution(0),
      body
    );
    const entity = {
      id: "player",
      label: "player body",
      kind: "player",
      shape: "circle",
      radius: this.profile.radius,
      mass: this.profile.mass,
      body,
      collider,
      color: COLORS.player,
      grabbable: false,
      pickRadius: this.profile.radius + 0.15
    };
    this.entities.set(entity.id, entity);
    this.colliderLabels.set(collider.handle, entity.id);
  }

  #createResident() {
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(15.0, 11.4)
        .setLinearDamping(0.4)
        .setAngularDamping(1.5)
        .setCcdEnabled(true)
    );
    const collider = this.world.createCollider(
      RAPIER.ColliderDesc.ball(this.residentProfile.radius)
        .setMass(this.residentProfile.mass)
        .setFriction(0.55)
        .setRestitution(0),
      body
    );
    const entity = {
      id: "resident",
      label: "simple pressure body",
      kind: "resident",
      shape: "circle",
      radius: this.residentProfile.radius,
      mass: this.residentProfile.mass,
      maxSpeed: this.residentProfile.maxSpeed,
      acceleration: this.residentProfile.acceleration,
      braking: this.residentProfile.braking,
      body,
      collider,
      color: COLORS.resident,
      grabbable: false,
      pickRadius: this.residentProfile.radius + 0.16
    };
    this.entities.set(entity.id, entity);
    this.colliderLabels.set(collider.handle, entity.id);
  }

  #newLocalControl() {
    return {
      tick: 0, blockedTicks: 0, recoveryTicks: 0, recoveries: 0,
      estimatedX: 0, estimatedY: 0, lateralTicks: 0, lateralAttempts: 0,
      state: "cruise", lastTransition: null
    };
  }

  #createPeer() {
    const profile = { radius: 0.71, mass: this.peerMass, maxSpeed: 1.55,
      acceleration: 6, braking: 8 };
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic().setTranslation(19.0, 11.4)
        .setLinearDamping(0.4).setAngularDamping(1.5).setCcdEnabled(true)
    );
    const collider = this.world.createCollider(
      RAPIER.ColliderDesc.ball(profile.radius)
        .setMass(profile.mass).setFriction(0.55).setRestitution(0), body
    );
    const entity = {
      id: "peer", label: "counter-moving heavy body", kind: "peer",
      shape: "circle", ...profile, body, collider,
      color: "#c2a8dc", grabbable: false,
      pickRadius: profile.radius + 0.16
    };
    this.entities.set(entity.id, entity);
    this.colliderLabels.set(collider.handle, entity.id);
    return entity;
  }

  #createBrace() {
    const radius = 0.5;
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(17.35, 11.4)
        .setLinearDamping(0.4).setAngularDamping(1.5).setCcdEnabled(true)
    );
    const collider = this.world.createCollider(
      RAPIER.ColliderDesc.ball(radius).setMass(this.braceMass)
        .setFriction(0.55).setRestitution(0), body
    );
    const entity = {
      id: "brace", label: "finite-force holding body",
      kind: "brace", shape: "circle", radius, mass: this.braceMass,
      maxSpeed: 0, acceleration: 0, braking: this.braceBraking,
      body, collider, color: "#79b9a5", grabbable: false,
      pickRadius: radius + 0.16
    };
    this.entities.set(entity.id, entity);
    this.colliderLabels.set(collider.handle, entity.id);
    return entity;
  }

  setBraceEnabled(enabled) {
    const next = Boolean(enabled);
    if (this.braceEnabled === next) return;
    this.braceEnabled = next;
    if (next) {
      this.#createBrace();
      const start = this.bodyStarts.get("brace");
      if (start) this.repositionBody("brace", start, { persist: false, record: false });
    } else {
      const brace = this.entities.get("brace");
      if (brace) {
        this.colliderLabels.delete(brace.collider.handle);
        this.world.removeRigidBody(brace.body);
        this.entities.delete("brace");
        this.lastCausalObservations.delete("brace");
      }
      if (this.selectedId === "brace") this.selectedId = "resident";
    }
    this.#recordEvent("actor.brace", next ?
      "finite-force holding body entered shared physics" :
      "finite-force holding body removed from shared physics");
  }

  setBraceProfile({ mass, braking }) {
    const m = authoredNumber(mass, "brace mass", true);
    const b = authoredNumber(braking, "brace braking", false);
    if (m !== this.braceMass && this.braceEnabled) {
      const entity = this.entities.get("brace");
      this.colliderLabels.delete(entity.collider.handle);
      this.world.removeCollider(entity.collider, true);
      entity.collider = this.world.createCollider(
        RAPIER.ColliderDesc.ball(entity.radius)
          .setMass(m).setFriction(0.55).setRestitution(0), entity.body
      );
      this.colliderLabels.set(entity.collider.handle, entity.id);
      entity.mass = m;
      entity.body.wakeUp();
    }
    if (this.braceEnabled) this.entities.get("brace").braking = b;
    this.braceMass = m;
    this.braceBraking = b;
    this.#recordEvent("actor.braceProfile",
      "finite-force holder mass=" + m + "kg, braking=" + b + "m/s²");
  }

  setPeerMass(value) {
    const next = authoredNumber(value, "peer mass", true);
    if (next === this.peerMass) return;
    const peer = this.entities.get("peer");
    if (peer) {
      this.colliderLabels.delete(peer.collider.handle);
      this.world.removeCollider(peer.collider, true);
      peer.collider = this.world.createCollider(
        RAPIER.ColliderDesc.ball(peer.radius)
          .setMass(next).setFriction(0.55).setRestitution(0),
        peer.body
      );
      this.colliderLabels.set(peer.collider.handle, peer.id);
      peer.mass = next;
      peer.body.wakeUp();
    }
    this.peerMass = next;
    this.#recordEvent("actor.peerBody", "peer mass=" + next + "kg");
  }

  setPeerEnabled(enabled) {
    const next = Boolean(enabled);
    if (this.peerEnabled === next) return;
    this.peerEnabled = next;
    if (next) {
      this.peerDirection = -1;
      this.peerSense = null;
      this.peerControl = this.#newLocalControl();
      this.#createPeer();
      const start = this.bodyStarts.get("peer");
      if (start) this.repositionBody("peer", start, { persist: false, record: false });
    } else {
      const peer = this.entities.get("peer");
      if (peer) {
        this.colliderLabels.delete(peer.collider.handle);
        this.world.removeRigidBody(peer.body);
        this.entities.delete("peer");
        this.lastCausalObservations.delete("peer");
      }
      if (this.selectedId === "peer") this.selectedId = "resident";
      this.peerSense = null;
      this.peerControl = this.#newLocalControl();
    }
    this.#recordEvent("actor.peer", next ?
      "counter-moving body entered shared physics" :
      "counter-moving body removed from shared physics");
  }

  #createBox(id, position, half, mass, color, grabbable) {
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(position.x, position.y)
        .setLinearDamping(0.55)
        .setAngularDamping(0.7)
        .setCcdEnabled(true)
    );
    const collider = this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(half.x, half.y)
        .setMass(mass)
        .setFriction(0.7)
        .setRestitution(0.02),
      body
    );
    const entity = {
      id,
      label: id.replaceAll("-", " "),
      kind: "object",
      shape: "box",
      half: { ...half },
      mass,
      body,
      collider,
      color,
      grabbable,
      pickRadius: Math.hypot(half.x, half.y) + 0.15
    };
    this.entities.set(id, entity);
    this.colliderLabels.set(collider.handle, id);
    return entity;
  }

  spawnCrate(kind = "light") {
    this.spawnSerial += 1;
    const player = this.player().body.translation();
    const phase = this.spawnSerial % 8;
    const angle = phase * Math.PI / 4;
    const position = {
      x: Math.max(1, Math.min(WORLD_SIZE.width - 1, player.x + Math.cos(angle) * 1.8)),
      y: Math.max(1, Math.min(WORLD_SIZE.height - 1, player.y + Math.sin(angle) * 1.8))
    };
    if (kind === "heavy") {
      return this.#createBox(
        "spawn-heavy-" + this.spawnSerial,
        position,
        { x: 0.7, y: 0.7 },
        140,
        COLORS.heavy,
        true
      );
    }
    return this.#createBox(
      "spawn-light-" + this.spawnSerial,
      position,
      { x: 0.46, y: 0.46 },
      12,
      COLORS.light,
      true
    );
  }

  // A bounded authoring seam for real scene intervention, not a final Studio
  // schema. These shapes survive a simulation reset, while their runtime
  // rigid bodies/colliders are rebuilt from the authored description.
  #instantiateAuthored(shape) {
    if (shape.kind === "wall") {
      this.#staticRect(shape.id, shape.cx, shape.cy, shape.width, shape.height);
    } else {
      this.#createBox(shape.id, { x: shape.cx, y: shape.cy },
        { x: shape.width / 2, y: shape.height / 2 },
        shape.mass, COLORS.light, true);
    }
  }

  authorRect({ kind, cx, cy, width, height, mass = 20 }) {
    if (kind !== "wall" && kind !== "object") {
      throw new RangeError("authored kind must be wall or object");
    }
    const accepted = {
      kind,
      cx: authoredCoordinate(cx, "author x"),
      cy: authoredCoordinate(cy, "author y"),
      width: authoredNumber(width, "author width", true),
      height: authoredNumber(height, "author height", true),
      mass: kind === "object" ? authoredNumber(mass, "author mass", true) : 0,
      id: "authored-" + (this.authoredSerial + 1)
    };
    // Rapier cannot reliably represent effectively zero-area fixtures.
    // This is a visible rejection, never a silent change to authored size.
    if (accepted.width < 0.04 || accepted.height < 0.04) {
      throw new RangeError("authored rectangle must span at least 0.04 m in each axis");
    }
    this.#instantiateAuthored(accepted);
    this.authoredShapes.push(accepted);
    this.authoredSerial += 1;
    this.#recordEvent("world.add", accepted.id + " " + accepted.kind +
      " at (" + accepted.cx.toFixed(2) + "," + accepted.cy.toFixed(2) +
      ") width=" + accepted.width.toFixed(2) +
      " height=" + accepted.height.toFixed(2));
    return accepted.id;
  }

  undoAuthored() {
    const shape = this.authoredShapes.pop();
    if (!shape) return false;
    if (shape.kind === "wall") {
      const collider = this.staticColliderById.get(shape.id);
      if (collider) {
        this.colliderLabels.delete(collider.handle);
        this.world.removeCollider(collider, true);
        this.staticColliderById.delete(shape.id);
      }
      this.staticRects = this.staticRects.filter((rect) => rect.id !== shape.id);
    } else {
      const entity = this.entities.get(shape.id);
      if (entity) {
        if (this.grip?.entityId === shape.id) this.endGrip();
        this.colliderLabels.delete(entity.collider.handle);
        this.world.removeRigidBody(entity.body);
        this.entities.delete(shape.id);
      }
      if (this.selectedId === shape.id) this.selectedId = "player";
    }
    this.bodyStarts.delete(shape.id);
    this.#recordEvent("world.remove", shape.id + " " + shape.kind);
    return true;
  }

  clearAuthored() {
    let count = 0;
    while (this.undoAuthored()) count++;
    return count;
  }

  player() {
    return this.entities.get("player");
  }

  setPlayerProfile(next) {
    // Validate the full edit before mutating the live body: one invalid
    // number cannot leave a partially accepted profile behind.
    const accepted = {};
    for (const key of Object.keys(DEFAULT_PROFILE)) {
      accepted[key] = authoredNumber(next[key], key, key === "radius" || key === "mass");
    }
    const rebuildCollider = accepted.mass !== this.profile.mass ||
      accepted.radius !== this.profile.radius;
    this.profile = accepted;

    if (!rebuildCollider) return;
    const player = this.player();
    player.mass = accepted.mass;
    player.radius = accepted.radius;
    player.pickRadius = accepted.radius + 0.15;

    this.colliderLabels.delete(player.collider.handle);
    this.world.removeCollider(player.collider, true);
    player.collider = this.world.createCollider(
      RAPIER.ColliderDesc.ball(accepted.radius)
        .setMass(accepted.mass)
        .setFriction(0.55)
        .setRestitution(0),
      player.body
    );
    this.colliderLabels.set(player.collider.handle, player.id);
    player.body.wakeUp();
  }

  setResidentProfile(next) {
    const accepted = {};
    for (const key of Object.keys(DEFAULT_RESIDENT_PROFILE)) {
      accepted[key] = authoredNumber(next[key], "resident " + key,
        key === "radius" || key === "mass");
    }
    const changeMaterialBody = accepted.radius !== this.residentProfile.radius ||
      accepted.mass !== this.residentProfile.mass;
    const entity = this.entities.get("resident");
    if (changeMaterialBody) {
      this.colliderLabels.delete(entity.collider.handle);
      this.world.removeCollider(entity.collider, true);
      entity.collider = this.world.createCollider(
        RAPIER.ColliderDesc.ball(accepted.radius)
          .setMass(accepted.mass)
          .setFriction(0.55)
          .setRestitution(0),
        entity.body
      );
      this.colliderLabels.set(entity.collider.handle, entity.id);
      entity.body.wakeUp();
    }
    // All authored fields were validated before changing any profile value.
    this.residentProfile = accepted;
    Object.assign(entity, accepted, { pickRadius: accepted.radius + 0.16 });
    this.#recordEvent("actor.body", "resident radius=" + accepted.radius +
      "m, mass=" + accepted.mass + "kg, maxSpeed=" + accepted.maxSpeed);
  }

  #setBodyPosition(entity, point) {
    entity.body.setTranslation({ x: point.x, y: point.y }, true);
    entity.body.setLinvel({ x: 0, y: 0 }, true);
    entity.body.setAngvel(0, true);
  }

  repositionBody(id, point, { persist = true, record = true } = {}) {
    const entity = this.entities.get(id);
    if (!entity) throw new RangeError("unknown live body: " + id);
    // Allow strange/overlapping positions: the physical solver must reveal
    // their consequences. Reject only numerically invalid coordinates.
    const p = {
      x: authoredCoordinate(point.x, "body x"),
      y: authoredCoordinate(point.y, "body y")
    };
    if (this.grip?.entityId === id) this.endGrip();
    this.#setBodyPosition(entity, p);
    if (persist) this.bodyStarts.set(id, { ...p });
    // A research-side teleport is NOT private odometry. Do not silently
    // feed a fabricated travel delta to either actor's local controller.
    if (id === "resident") {
      this.residentSense = null;
      this.residentDirection = 1;
      this.residentControl = this.#newLocalControl();
    }
    if (id === "peer") {
      this.peerSense = null;
      this.peerDirection = -1;
      this.peerControl = this.#newLocalControl();
    }
    this.lastCausalObservations.delete(id);
    this.selectedId = id;
    if (record) this.#recordEvent("world.reposition",
      id + " placed at (" + p.x.toFixed(2) + "," + p.y.toFixed(2) +
      "); local travel reset; start=" + (persist ? "authored" : "transient"));
    return { ...p };
  }

  clearBodyStartOverrides() {
    const count = this.bodyStarts.size;
    this.bodyStarts.clear();
    this.#recordEvent("world.clearStarts", count + " authored body placements cleared");
    return count;
  }

  selectAt(point) {
    let winner = null;
    let winnerDistance = Infinity;
    for (const entity of this.entities.values()) {
      const p = entity.body.translation();
      const d = distance(point, p);
      if (d <= entity.pickRadius && d < winnerDistance) {
        winner = entity;
        winnerDistance = d;
      }
    }
    if (winner) this.selectedId = winner.id;
    return winner;
  }

  beginGrip(point) {
    const playerPos = this.player().body.translation();
    if (distance(point, playerPos) > this.profile.gripReach) return false;

    let winner = null;
    let winnerDistance = Infinity;
    for (const entity of this.entities.values()) {
      if (!entity.grabbable) continue;
      const p = entity.body.translation();
      const d = distance(point, p);
      if (d <= entity.pickRadius && d < winnerDistance) {
        winner = entity;
        winnerDistance = d;
      }
    }
    if (!winner) return false;

    const center = winner.body.translation();
    const angle = winner.body.rotation();
    const localAnchor = rotate(sub(point, center), -angle);
    this.grip = {
      entityId: winner.id,
      localAnchor,
      requestedTarget: { ...point },
      worldAnchor: { ...point }
    };
    this.selectedId = winner.id;
    return true;
  }

  setGripTarget(point) {
    if (this.grip) this.grip.requestedTarget = { ...point };
  }

  endGrip() {
    this.grip = null;
    this.lastGripForce = 0;
    this.lastGripReaction = { x: 0, y: 0 };
  }

  #applyMotor(entity, desiredVelocity, acceleration, braking) {
    const current = entity.body.linvel();
    const impulse = computeMotorImpulse({
      mass: entity.mass,
      currentVelocity: current,
      desiredVelocity,
      acceleration,
      braking,
      dt: FIXED_DT
    });
    entity.body.applyImpulse({ x: impulse.x, y: impulse.y }, true);
    return impulse;
  }

  setResidentMode(mode) {
    if (mode !== "baseline" && mode !== "tactile-recovery" &&
        mode !== "directional-recovery" && mode !== "lateral-maneuver") {
      throw new RangeError("resident mode must be baseline, tactile-recovery, directional-recovery or lateral-maneuver");
    }
    this.residentMode = mode;
    this.residentControl.blockedTicks = 0;
    this.residentControl.recoveryTicks = 0;
    this.residentControl.state = "cruise";
    this.residentControl.lastTransition = null;
    this.#recordEvent("actor.mode", "resident controller=" + mode);
  }

  // Shared law, separate local histories and physically distinct actors.
  // Never receives the World layout, obstacle IDs, actor global x or
  // another actor's private samples.
  #advanceLocalActor({ id, sense, ctl, direction, mode, lower, upper,
    recoveryDuration, resistanceTicks }) {
    const entity = this.entities.get(id);
    const decision = stepLocalShuttle({
      state: ctl, sense, direction, mode, maxSpeed: entity.maxSpeed,
      lower, upper, recoveryDuration, resistanceTicks,
      sidePreference: id === "resident" ?
        this.residentSidePreference : this.peerSidePreference
    });
    // The policy cannot see World: the host merely applies its declared
    // intent to the physical body and records a research-only explanation.
    Object.assign(ctl, decision.state);
    if (decision.transition) {
      if (decision.transition.lateralDirection) {
        this.#recordEvent("actor.lateral",
          id + " chose bounded lateral velocity from own forward-touch pressure; side=" +
          decision.transition.lateralDirection);
      } else {
        this.#recordEvent("actor.reversal",
          id + " changed direction after local resistance " +
          decision.transition.fromDirection + " -> " +
          decision.transition.toDirection);
      }
    }
    const motorImpulse = this.#applyMotor(
      entity, decision.intendedVelocity, entity.acceleration, entity.braking
    );
    return {
      intendedVelocity: decision.intendedVelocity,
      motorImpulse, direction: decision.direction
    };
  }

  #stepResident() {
    const result = this.#advanceLocalActor({
      id: "resident", sense: this.residentSense,
      ctl: this.residentControl, direction: this.residentDirection,
      mode: this.residentMode, lower: -1.8, upper: 5.7,
      recoveryDuration: 58, resistanceTicks: 12
    });
    this.residentDirection = result.direction;
    return result;
  }

  setPeerMode(mode) {
    if (mode !== "baseline" && mode !== "tactile-recovery" &&
        mode !== "directional-recovery" && mode !== "lateral-maneuver") {
      throw new RangeError("peer mode must be baseline, tactile-recovery, directional-recovery or lateral-maneuver");
    }
    if (this.peerMode === mode) return;
    this.peerMode = mode;
    this.peerControl.blockedTicks = 0;
    this.peerControl.recoveryTicks = 0;
    this.peerControl.state = "cruise";
    this.peerControl.lastTransition = null;
    this.#recordEvent("actor.peerMode", "peer controller=" + mode);
  }

  setActorSidePreference(id, value) {
    if (id !== "resident" && id !== "peer") {
      throw new RangeError("lateral preference is only authored for locally driven actors");
    }
    const side = Number(value);
    if (side !== -1 && side !== 1)
      throw new RangeError("lateral direction must be -1 (up) or 1 (down)");
    if (id === "resident") this.residentSidePreference = side;
    else this.peerSidePreference = side;
    this.#recordEvent("actor.sidePreference", id + " side=" + side);
  }

  #stepPeer() {
    const result = this.#advanceLocalActor({
      id: "peer", sense: this.peerSense, ctl: this.peerControl,
      direction: this.peerDirection, mode: this.peerMode,
      lower: -5.0, upper: 1.3,
      recoveryDuration: 70, resistanceTicks: 20
    });
    this.peerDirection = result.direction;
    return result;
  }

  #stepGrip() {
    if (!this.grip) {
      this.lastGripForce = 0;
      this.lastGripReaction = { x: 0, y: 0 };
      return;
    }
    const object = this.entities.get(this.grip.entityId);
    if (!object) {
      this.endGrip();
      return;
    }

    const player = this.player();
    const playerPos = player.body.translation();
    const requestedOffset = sub(this.grip.requestedTarget, playerPos);
    const clampedOffset = clampMagnitude(requestedOffset, this.profile.gripReach);
    const target = add(playerPos, clampedOffset);

    const objectPos = object.body.translation();
    const angle = object.body.rotation();
    const radial = rotate(this.grip.localAnchor, angle);
    const anchor = add(objectPos, radial);
    const linear = object.body.linvel();
    const angular = object.body.angvel();
    const anchorVelocity = {
      x: linear.x - angular * radial.y,
      y: linear.y + angular * radial.x
    };

    const impulse = computeGripImpulse({
      playerMass: this.profile.mass,
      objectMass: object.mass,
      anchorVelocity,
      targetError: sub(target, anchor),
      maxForce: this.profile.gripForce,
      dt: FIXED_DT
    });

    object.body.applyImpulseAtPoint({ x: impulse.x, y: impulse.y }, anchor, true);
    player.body.applyImpulse({ x: -impulse.x, y: -impulse.y }, true);

    this.lastGripReaction = { x: -impulse.x, y: -impulse.y };
    this.lastGripForce = Math.hypot(impulse.x, impulse.y) / FIXED_DT;
    this.grip.worldAnchor = anchor;
    this.grip.clampedTarget = target;
  }

  step(move) {
    this.physicsTick += 1;
    const magnitude = Math.hypot(move.x, move.y);
    const direction = magnitude > 1 ? { x: move.x / magnitude, y: move.y / magnitude } : move;
    const desired = {
      x: direction.x * this.profile.maxSpeed,
      y: direction.y * this.profile.maxSpeed
    };

    const before = new Map();
    for (const id of ["player", "resident",
      ...(this.peerEnabled ? ["peer"] : []),
      ...(this.braceEnabled ? ["brace"] : [])]) {
      const entity = this.entities.get(id);
      before.set(id, { ...entity.body.translation() });
    }
    const playerImpulse = this.#applyMotor(
      this.player(),
      desired,
      this.profile.acceleration,
      this.grip ? this.profile.gripBraking : this.profile.braking
    );
    const residentDrive = this.#stepResident();
    const peerDrive = this.peerEnabled ? this.#stepPeer() : null;
    // The holder's only intent is local zero velocity, maintained with a
    // finite motor impulse. World contact may physically displace it.
    const braceDrive = this.braceEnabled ? {
      intendedVelocity: { x: 0, y: 0 },
      motorImpulse: this.#applyMotor(
        this.entities.get("brace"), { x: 0, y: 0 }, 0, this.braceBraking
      )
    } : null;
    this.#stepGrip();

    const started = performance.now();
    this.world.step();
    const stepMs = performance.now() - started;

    // This is a record of attempted agency and observed consequences,
    // NOT a classification of why contact or lost progress occurred.
    for (const [id, drive] of [
      ["player", { intendedVelocity: desired, motorImpulse: playerImpulse }],
      ["resident", residentDrive],
      ...(peerDrive ? [["peer", peerDrive]] : []),
      ...(braceDrive ? [["brace", braceDrive]] : [])
    ]) {
      const entity = this.entities.get(id);
      const from = before.get(id);
      const now = entity.body.translation();
      const measuredVelocity = {
        x: (now.x - from.x) / FIXED_DT,
        y: (now.y - from.y) / FIXED_DT
      };
      const requestedSpeed = Math.hypot(
        drive.intendedVelocity.x, drive.intendedVelocity.y
      );
      const progressAlongIntent = requestedSpeed > 1e-8 ?
        (measuredVelocity.x * drive.intendedVelocity.x +
          measuredVelocity.y * drive.intendedVelocity.y) / requestedSpeed : null;
      if (id === "resident" || id === "peer") {
        // Each body receives independent local tactile/proprioceptive samples.
        // Neither receives World colliders/IDs, another body history or provenance.
        let touch = false;
        let forwardTouch = false;
        const requestedSpeed = Math.hypot(
          drive.intendedVelocity.x, drive.intendedVelocity.y
        );
        this.world.contactPairsWith(entity.collider, other => {
          // contactPairsWith returns *candidates*. Only a manifold that
          // reached the solver is evidence of an active physical contact.
          // Candidate-only proximity must not become the actor's touch.
          this.world.contactPair(entity.collider, other, (manifold, flipped) => {
            if (!manifold.numSolverContacts()) return;
            touch = true;
            if (requestedSpeed < 1e-8) return;
            const n = manifold.normal();
            const outwardSign = flipped ? -1 : 1;
            const alignment = outwardSign *
              (n.x * drive.intendedVelocity.x +
               n.y * drive.intendedVelocity.y) / requestedSpeed;
            if (alignment > 0.55) forwardTouch = true;
          });
        });
        const localSample = {
          touch, forwardTouch,
          motorEffort: Math.hypot(drive.motorImpulse.x, drive.motorImpulse.y),
          progressAlongIntent,
          deltaX: now.x - from.x,
          deltaY: now.y - from.y
        };
        if (id === "resident") this.residentSense = localSample;
        else this.peerSense = localSample;
      }
      this.lastCausalObservations.set(id, {
        intendedVelocity: { ...drive.intendedVelocity },
        motorImpulse: { x: drive.motorImpulse.x, y: drive.motorImpulse.y },
        gripReactionImpulse: id === "player" ?
          { ...this.lastGripReaction } : { x: 0, y: 0 },
        measuredVelocity,
        progressAlongIntent,
        contacts: this.contactsFor(id)
      });
    }

    return { desiredVelocity: desired, playerImpulse, stepMs };
  }

  contactsFor(id) {
    const entity = this.entities.get(id);
    if (!entity) return [];
    const out = [];
    this.world.contactPairsWith(entity.collider, (other) => {
      let active = false;
      this.world.contactPair(entity.collider, other, manifold => {
        if (manifold.numSolverContacts() > 0) active = true;
      });
      if (active) {
        out.push(this.colliderLabels.get(other.handle) ?? ("collider-" + other.handle));
      }
    });
    return [...new Set(out)].sort();
  }

  snapshot() {
    const entities = [];
    for (const entity of this.entities.values()) {
      const p = entity.body.translation();
      const v = entity.body.linvel();
      entities.push({
        id: entity.id,
        label: entity.label,
        kind: entity.kind,
        shape: entity.shape,
        radius: entity.radius,
        half: entity.half ? { ...entity.half } : null,
        mass: entity.mass,
        color: entity.color,
        position: { x: p.x, y: p.y },
        velocity: { x: v.x, y: v.y },
        rotation: entity.body.rotation(),
        grabbable: entity.grabbable
      });
    }
    return {
      world: WORLD_SIZE,
      staticRects: this.staticRects.map((item) => ({ ...item })),
      entities,
      selectedId: this.selectedId,
      profile: { ...this.profile },
      residentProfile: { ...this.residentProfile },
      physicsTick: this.physicsTick,
      interventionEvents: this.interventionEvents.map((event) => ({ ...event })),
      residentControl: { mode: this.residentMode, ...this.residentControl },
      peerEnabled: this.peerEnabled,
      peerMass: this.peerMass,
      residentSidePreference: this.residentSidePreference,
      peerSidePreference: this.peerSidePreference,
      braceEnabled: this.braceEnabled,
      braceMass: this.braceMass,
      braceBraking: this.braceBraking,
      peerControl: this.peerEnabled ? { mode: this.peerMode, ...this.peerControl } : null,
      authoredCount: this.authoredShapes.length,
      authoredBodyStarts: [...this.bodyStarts].map(([id, point]) =>
        ({ id, x: point.x, y: point.y })),
      grip: this.grip ? {
        entityId: this.grip.entityId,
        worldAnchor: { ...this.grip.worldAnchor },
        target: this.grip.clampedTarget ? { ...this.grip.clampedTarget } : { ...this.grip.requestedTarget },
        force: this.lastGripForce
      } : null
    };
  }

  selectedSnapshot() {
    const entity = this.entities.get(this.selectedId);
    if (!entity) return null;
    const p = entity.body.translation();
    const v = entity.body.linvel();
    return {
      id: entity.id,
      kind: entity.kind,
      mass: entity.mass,
      radius: entity.radius ?? null,
      position: { x: p.x, y: p.y },
      velocity: { x: v.x, y: v.y },
      speed: Math.hypot(v.x, v.y),
      contacts: this.contactsFor(entity.id),
      observedMotor: this.lastCausalObservations.get(entity.id) ?? null,
      localControl: entity.kind === "resident" ?
        { mode: this.residentMode, ...this.residentControl } :
        entity.kind === "peer" ?
          { mode: this.peerMode, ...this.peerControl } : null,
      grabbable: entity.grabbable
    };
  }
}
