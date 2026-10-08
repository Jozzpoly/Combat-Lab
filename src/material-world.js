import RAPIER from "@dimforge/rapier2d-deterministic";
import { clampMagnitude, computeGripImpulse, computeMotorImpulse } from "./control-laws.js";

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
    // These are authored edits, distinct from runtime motion/afterstate.
    // Ordinary reset replays them; clear/undo deliberately change the authored scene.
    this.authoredShapes = [];
    this.authoredSerial = 0;
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
    // This probe preserves two selectable, explicitly authored low-level
    // control laws. Neither one is autonomous cognition or a world planner.
    this.residentMode = "tactile-recovery";
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
    this.residentDirection = 1;
    this.residentSense = null;
    this.residentControl = {
      tick: 0, blockedTicks: 0, recoveryTicks: 0, recoveries: 0,
      state: "cruise", lastTransition: null
    };

    this.#buildStaticWorld();
    this.#createPlayer();
    this.#createResident();
    this.#createBox("light-crate", { x: 6.9, y: 5.8 }, { x: 0.48, y: 0.48 }, 14, COLORS.light, true);
    this.#createBox("plank", { x: 12.8, y: 6.6 }, { x: 1.05, y: 0.28 }, 34, COLORS.plank, true);
    this.#createBox("heavy-crate", { x: 16.5, y: 5.25 }, { x: 0.68, y: 0.68 }, 120, COLORS.heavy, true);
    for (const shape of this.authoredShapes) this.#instantiateAuthored(shape);
    this.selectedId = "player";
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
      RAPIER.ColliderDesc.ball(0.56)
        .setMass(72)
        .setFriction(0.55)
        .setRestitution(0),
      body
    );
    const entity = {
      id: "resident",
      label: "simple pressure body",
      kind: "resident",
      shape: "circle",
      radius: 0.56,
      mass: 72,
      maxSpeed: 2.1,
      acceleration: 7,
      braking: 10,
      body,
      collider,
      color: COLORS.resident,
      grabbable: false,
      pickRadius: 0.72
    };
    this.entities.set(entity.id, entity);
    this.colliderLabels.set(collider.handle, entity.id);
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
    if (mode !== "baseline" && mode !== "tactile-recovery") {
      throw new RangeError("resident mode must be baseline or tactile-recovery");
    }
    this.residentMode = mode;
    this.residentControl.blockedTicks = 0;
    this.residentControl.recoveryTicks = 0;
    this.residentControl.state = "cruise";
    this.residentControl.lastTransition = null;
  }

  #stepResident() {
    const entity = this.entities.get("resident");
    const ctl = this.residentControl;
    ctl.tick += 1;
    const previous = this.residentSense;

    // Locally testable evidence, not a map/obstacle-label oracle:
    // commanded effort, realized progress and bare tactile contact.
    // A contact alone is not proof of blockage; a stationary motorless
    // actor must not be misclassified as blocked.
    if (this.residentMode === "tactile-recovery" && ctl.recoveryTicks === 0) {
      const driven = previous && previous.motorEffort > 0.01;
      const resistance = previous && previous.touch &&
        previous.progressAlongIntent !== null &&
        previous.progressAlongIntent < entity.maxSpeed * 0.12;
      ctl.blockedTicks = driven && resistance ? ctl.blockedTicks + 1 : 0;
      if (ctl.blockedTicks >= 12) {
        const formerDirection = this.residentDirection;
        this.residentDirection = -formerDirection;
        ctl.recoveryTicks = 58;
        ctl.blockedTicks = 0;
        ctl.recoveries += 1;
        ctl.lastTransition = {
          tick: ctl.tick,
          reason: "sustained contact + low realized progress + motor effort",
          fromDirection: formerDirection,
          toDirection: this.residentDirection
        };
      }
    }

    const p = entity.body.translation();
    // The existing lane endpoints are fixture policy, not discovered
    // knowledge. Recovery suppresses these endpoints temporarily.
    if (ctl.recoveryTicks === 0) {
      if (p.x > 20.7) this.residentDirection = -1;
      if (p.x < 13.2) this.residentDirection = 1;
    }
    ctl.state = ctl.recoveryTicks > 0 ? "backoff" :
      ctl.blockedTicks > 0 ? "contact-pressure" : "cruise";
    const intendedVelocity = { x: entity.maxSpeed * this.residentDirection, y: 0 };
    const motorImpulse = this.#applyMotor(
      entity, intendedVelocity, entity.acceleration, entity.braking
    );
    if (ctl.recoveryTicks > 0) ctl.recoveryTicks -= 1;
    return { intendedVelocity, motorImpulse };
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
    const magnitude = Math.hypot(move.x, move.y);
    const direction = magnitude > 1 ? { x: move.x / magnitude, y: move.y / magnitude } : move;
    const desired = {
      x: direction.x * this.profile.maxSpeed,
      y: direction.y * this.profile.maxSpeed
    };

    const before = new Map();
    for (const id of ["player", "resident"]) {
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
    this.#stepGrip();

    const started = performance.now();
    this.world.step();
    const stepMs = performance.now() - started;

    // This is a record of attempted agency and observed consequences,
    // NOT a classification of why contact or lost progress occurred.
    for (const [id, drive] of [
      ["player", { intendedVelocity: desired, motorImpulse: playerImpulse }],
      ["resident", residentDrive]
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
      if (id === "resident") {
        // The on-board controller receives only synthetic tactile/proprioceptive
        // evidence. World object IDs, authored geometry and global positions
        // remain on the research/debug plane, never in this local sample.
        let touch = false;
        this.world.contactPairsWith(entity.collider, () => { touch = true; });
        this.residentSense = {
          touch,
          motorEffort: Math.hypot(drive.motorImpulse.x, drive.motorImpulse.y),
          progressAlongIntent
        };
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
      out.push(this.colliderLabels.get(other.handle) ?? ("collider-" + other.handle));
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
      residentControl: { mode: this.residentMode, ...this.residentControl },
      authoredCount: this.authoredShapes.length,
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
        { mode: this.residentMode, ...this.residentControl } : null,
      grabbable: entity.grabbable
    };
  }
}
