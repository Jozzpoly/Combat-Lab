import { MaterialWorld } from "./material-world.js";

// This module is deliberately invoked only by ?pressureProbe=1 on the emitted
// browser artifact. It exercises the same WASM bundle as the actual Lab.
const cases = [];
const assert = (yes, message) => { if (!yes) throw new Error(message); };
const at = (world, id) => {
  const found = world.snapshot().entities.find((e) => e.id === id);
  assert(Boolean(found), "missing " + id);
  return found;
};
const finite = (world, scope) => {
  for (const e of world.snapshot().entities) {
    for (const n of [e.position.x, e.position.y, e.velocity.x, e.velocity.y, e.rotation]) {
      assert(Number.isFinite(n), scope + ": nonfinite state " + e.id);
    }
  }
};
async function trial(name, fn) {
  let world;
  try {
    world = await MaterialWorld.create();
    const detail = await fn(world);
    cases.push({ name, status: "PASS", detail: detail ?? "" });
  } catch (error) {
    cases.push({ name, status: "FAIL", detail: String(error?.message ?? error).slice(0, 300) });
  } finally {
    if (world?.world) world.world.free();
  }
}
async function observation(name, fn) {
  let world;
  try {
    world = await MaterialWorld.create();
    const detail = await fn(world);
    cases.push({ name, status: "OBSERVED", detail });
  } catch (error) {
    cases.push({ name, status: "FAIL", detail: String(error?.message ?? error).slice(0, 300) });
  } finally {
    if (world?.world) world.world.free();
  }
}
const still = { x: 0, y: 0 };
const right = { x: 1, y: 0 };

await trial("motor-realized-motion", (world) => {
  const before = at(world, "player");
  for (let i = 0; i < 90; i++) world.step(right);
  const after = at(world, "player");
  finite(world, "motor");
  const moved = after.position.x - before.position.x;
  assert(moved > 1, "body has not moved usefully: dx=" + moved.toFixed(4));
  return "dx=" + moved.toFixed(2);
});

await trial("grip-material-afterstate", (world) => {
  world.player().body.setTranslation({ x: 5.5, y: 5.8 }, true);
  assert(world.beginGrip({ x: 6.9, y: 5.8 }), "grip acquisition failed");
  const before = at(world, "light-crate");
  world.setGripTarget({ x: 8, y: 5.8 });
  for (let i = 0; i < 90; i++) world.step(still);
  const during = at(world, "light-crate");
  const displacement = Math.hypot(during.position.x - before.position.x,
    during.position.y - before.position.y);
  assert(displacement > 0.2, "no meaningful physical displacement: " + displacement.toFixed(3));
  world.endGrip();
  for (let i = 0; i < 30; i++) world.step(still);
  assert(world.snapshot().entities.length === 5, "object vanished on release");
  finite(world, "grip after release");
  return "crate displacement=" + displacement.toFixed(2);
});

await trial("mass-separates-impulse-response", (world) => {
  const light = world.entities.get("light-crate").body;
  const heavy = world.entities.get("heavy-crate").body;
  light.applyImpulse({ x: 20, y: 0 }, true);
  heavy.applyImpulse({ x: 20, y: 0 }, true);
  const ratio = light.linvel().x / heavy.linvel().x;
  assert(ratio > 3, "identical impulse not materially mass-dependent: ratio=" + ratio);
  return "velocity ratio=" + ratio.toFixed(2);
});

await trial("scene-reset-and-body-identity", (world) => {
  world.setPlayerProfile({ ...world.profile, mass: 75, radius: 0.65 });
  world.spawnCrate("heavy");
  assert(world.snapshot().entities.length === 6, "spawn did not persist");
  for (let i = 0; i < 40; i++) world.step(right);
  world.reset();
  const snap = world.snapshot();
  assert(snap.entities.length === 5, "reset count wrong");
  assert(snap.profile.mass === 75 && snap.profile.radius === 0.65, "profile lost");
  assert(Math.abs(at(world, "player").position.x - 4) < 1e-5, "player spawn altered");
  finite(world, "reset");
  return "scene reset; profile persists";
});

await trial("contact-with-boundary", (world) => {
  for (let i = 0; i < 140; i++) world.step({ x: -1, y: 0 });
  const p = at(world, "player");
  const wall = 0.3 + p.radius;
  assert(p.position.x >= wall - 0.12, "player crossed outer boundary: x=" + p.position.x);
  finite(world, "boundary contact");
  return "stopped x=" + p.position.x.toFixed(3);
});

await trial("deliberate-overlap-pressure-32", (world) => {
  for (let i = 0; i < 32; i++) world.spawnCrate(i % 3 === 0 ? "heavy" : "light");
  assert(world.snapshot().entities.length === 37, "objects lost before stepping");
  for (let i = 0; i < 100; i++) {
    world.step(i % 40 < 20 ? right : still);
    if (i % 20 === 0) finite(world, "overlap tick " + i);
  }
  finite(world, "overlap final");
  assert(world.snapshot().entities.length === 37, "objects silently despawned");
  return "37 bodies survived 100 steps; performance not measured under virtual time";
});

await trial("zero-motor-authority-is-authorable", (world) => {
  world.setPlayerProfile({ ...world.profile, acceleration: 0, braking: 0,
    maxSpeed: 0, gripForce: 0 });
  const p = world.profile;
  assert(p.acceleration === 0 && p.braking === 0 && p.maxSpeed === 0 && p.gripForce === 0,
    "zero authority silently replaced: " + JSON.stringify(p));
  return "zero motor and grip authority retained";
});

await trial("invalid-body-edit-is-atomic", (world) => {
  const before = { ...world.profile };
  let rejected = false;
  try {
    world.setPlayerProfile({ ...world.profile, mass: -3, maxSpeed: 0 });
  } catch (error) {
    rejected = error instanceof RangeError;
  }
  assert(rejected, "invalid mass was silently accepted or thrown as an unrelated error");
  assert(JSON.stringify(world.profile) === JSON.stringify(before),
    "invalid partial edit changed the live body profile");
  return "invalid mass rejected without partial changes";
});

await trial("motor-only-edit-preserves-physical-collider", (world) => {
  const handle = world.player().collider.handle;
  world.setPlayerProfile({ ...world.profile, acceleration: 0, braking: 0 });
  assert(world.player().collider.handle === handle,
    "changing motor authority unnecessarily recreated a physical collider");
  return "stable collider after motor-only edit";
});

await trial("authored-world-survives-reset-and-undo", (world) => {
  const baseStatic = world.snapshot().staticRects.length;
  const wallId = world.authorRect({ kind: "wall", cx: 3, cy: 3, width: 1.5, height: 0.3 });
  const boxId = world.authorRect({ kind: "object", cx: 6, cy: 9,
    width: 0.9, height: 1.2, mass: 27 });
  assert(world.snapshot().authoredCount === 2, "authored record not created");
  assert(world.snapshot().staticRects.length === baseStatic + 1, "wall missing");
  assert(at(world, boxId).mass === 27, "authored object mass not retained");
  for (let i = 0; i < 30; i++) world.step(still);
  world.reset();
  assert(world.snapshot().authoredCount === 2, "reset erased authored scene");
  assert(world.snapshot().staticRects.some((x) => x.id === wallId), "wall lost on reset");
  assert(at(world, boxId).mass === 27, "authored object lost on reset");
  assert(world.undoAuthored(), "cannot undo authored box");
  assert(!world.snapshot().entities.some((x) => x.id === boxId), "undone box still in world");
  assert(world.clearAuthored() === 1, "cannot clear remaining wall");
  assert(world.snapshot().staticRects.length === baseStatic, "authored wall still present");
  finite(world, "authored scene");
  return "wall+box persisted; undo/clear removed live matter";
});

await trial("authoring-rejects-degenerate-not-signed-coordinates", (world) => {
  const id = world.authorRect({ kind: "wall", cx: -3, cy: -2,
    width: 0.25, height: 0.25 });
  assert(world.snapshot().staticRects.some((x) => x.id === id && x.cx === -3),
    "authored world was silently confined inside default arena");
  const count = world.authoredShapes.length;
  const serial = world.authoredSerial;
  let rejected = false;
  try {
    world.authorRect({ kind: "wall", cx: 3, cy: 3, width: 0.001, height: 1 });
  } catch (error) {
    rejected = error instanceof RangeError;
  }
  assert(rejected, "program-unsafe near-degenerate geometry was accepted");
  assert(world.authoredShapes.length === count, "invalid edit partially mutated scene");
  assert(world.authoredSerial === serial, "rejected edit consumed source identity");
  return "signed positions allowed; unsafe dimensions rejected without mutation";
});

await trial("replay-from-reset-reproduces-world", (world) => {
  const run = () => {
    for (let i = 0; i < 130; i++) {
      const input = i < 35 ? { x: 1, y: 0 } :
        i < 70 ? { x: 0, y: -1 } :
        i < 105 ? { x: -1, y: 0 } : still;
      world.step(input);
    }
    return world.snapshot().entities.map((e) => ({
      id: e.id, x: e.position.x, y: e.position.y,
      vx: e.velocity.x, vy: e.velocity.y, angle: e.rotation
    }));
  };
  const first = run();
  world.reset();
  const second = run();
  assert(first.length === second.length, "replay lost bodies");
  let worst = 0;
  for (let i = 0; i < first.length; i++) {
    assert(first[i].id === second[i].id, "replay reordered entities");
    for (const key of ["x", "y", "vx", "vy", "angle"]) {
      worst = Math.max(worst, Math.abs(first[i][key] - second[i][key]));
    }
  }
  assert(worst < 1e-7, "same initial scene and inputs diverged: " + worst);
  return "max state divergence=" + worst.toExponential(1);
});

await trial("body-extremes-are-not-silently-normalized", (world) => {
  world.setPlayerProfile({ ...world.profile, radius: 0.08, mass: 0.5,
    maxSpeed: 15, acceleration: 120, braking: 300 });
  assert(world.profile.radius === 0.08 && world.profile.mass === 0.5 &&
    world.profile.maxSpeed === 15, "small fast body silently normalized");
  for (let i = 0; i < 75; i++) world.step(right);
  finite(world, "small-fast body");
  world.reset();
  world.setPlayerProfile({ ...world.profile, radius: 2.5, mass: 5000,
    maxSpeed: 0, acceleration: 0, braking: 0 });
  assert(world.profile.radius === 2.5 && world.profile.mass === 5000,
    "large heavy body silently normalized");
  for (let i = 0; i < 40; i++) world.step(still);
  finite(world, "large-stationary body");
  return "small-fast and large-heavy bodies remain physically represented";
});

await trial("observability-contact-versus-intent", (world) => {
  // Frozen baseline law: this test specifically validates sustained motor
  // pressure, not the newer local-contact recovery challenger.
  world.setResidentMode("baseline");
  const wallId = world.authorRect({
    kind: "wall", cx: 16.8, cy: 11.4, width: 0.6, height: 2.5
  });
  for (let i = 0; i < 180; i++) world.step(still);
  world.selectedId = "resident";
  const selected = world.selectedSnapshot();
  const observation = selected.observedMotor;
  assert(Boolean(observation), "driven resident has no motor trace");
  assert(observation.intendedVelocity.x > 1.5, "resident stopped requesting motion");
  assert(observation.contacts.includes(wallId),
    "motor shortfall cannot be examined beside actual wall contact");
  assert(observation.progressAlongIntent < 0.5,
    "wall appeared, but motor progress was not materially reduced");
  assert(selected.position.x < 16.8, "resident went through authored wall");
  return "resident requested " + observation.intendedVelocity.x.toFixed(2) +
    "m/s; progressed " + observation.progressAlongIntent.toFixed(2) +
    "m/s with contact " + wallId;
});

await trial("observability-no-authority-versus-contact", (world) => {
  world.setPlayerProfile({ ...world.profile, acceleration: 0, braking: 0 });
  for (let i = 0; i < 15; i++) world.step(right);
  const observation = world.selectedSnapshot().observedMotor;
  assert(observation.intendedVelocity.x > 1, "lost intended command");
  assert(Math.hypot(observation.motorImpulse.x, observation.motorImpulse.y) === 0,
    "disabled motor still applied impulse");
  assert(Math.abs(observation.progressAlongIntent) < 1e-4,
    "stationary motorless actor falsely recorded progress");
  assert(observation.contacts.length === 0,
    "unexpected contacts would confound the no-authority observation");
  return "intended speed " + observation.intendedVelocity.x.toFixed(2) +
    "; motor impulse 0; no contact";
});

// Donor-informed curiosity: E17 Owner feedback reported both emergent physical
// verbs and poor grip precision/oscillation. These are measurements, NOT PASSes
// for manipulation feel or for the donor's 3D implementation.
for (const specimen of [
  { name: "light-center", id: "light-crate", player: { x: 5.5, y: 5.8 },
    pick: { x: 6.9, y: 5.8 }, target: { x: 7.9, y: 5.8 } },
  { name: "light-offcenter", id: "light-crate", player: { x: 5.5, y: 5.8 },
    pick: { x: 6.9, y: 6.14 }, target: { x: 7.9, y: 6.14 } },
  { name: "heavy-offcenter", id: "heavy-crate", player: { x: 15.1, y: 5.25 },
    pick: { x: 16.5, y: 5.65 }, target: { x: 17.5, y: 5.65 } }
]) {
  await observation("grip-response-" + specimen.name, (world) => {
    world.player().body.setTranslation(specimen.player, true);
    const before = at(world, specimen.id);
    assert(world.beginGrip(specimen.pick), "grip acquisition failed");
    world.setGripTarget(specimen.target);
    let maxAngularSpeed = 0;
    let maxBeyondTarget = 0;
    for (let i = 0; i < 120; i++) {
      world.step(still);
      const obj = world.entities.get(specimen.id);
      maxAngularSpeed = Math.max(maxAngularSpeed, Math.abs(obj.body.angvel()));
      const radial = world.grip.localAnchor;
      const c = Math.cos(obj.body.rotation()), si = Math.sin(obj.body.rotation());
      const anchorX = obj.body.translation().x + radial.x * c - radial.y * si;
      maxBeyondTarget = Math.max(maxBeyondTarget, anchorX - specimen.target.x);
    }
    const after = at(world, specimen.id);
    const player = at(world, "player");
    finite(world, specimen.name);
    return "object dx=" + (after.position.x - before.position.x).toFixed(2) +
      "m; final angle=" + after.rotation.toFixed(2) +
      "rad; peak angular speed=" + maxAngularSpeed.toFixed(2) +
      "rad/s; overshoot beyond cursor x=" + maxBeyondTarget.toFixed(2) +
      "m; player x=" + player.position.x.toFixed(2) + "m; no quality verdict";
  });
}

for (const braking of [24, 0]) {
  await observation("grip-player-reaction-braking-" + braking, (world) => {
    world.setPlayerProfile({ ...world.profile, braking, gripBraking: braking });
    world.player().body.setTranslation({ x: 5.5, y: 5.8 }, true);
    assert(world.beginGrip({ x: 6.9, y: 5.8 }), "could not grasp light crate");
    world.setGripTarget({ x: 7.9, y: 5.8 });
    let motorImpulseSum = 0;
    let gripReactionSum = 0;
    let maxPlayerExcursion = 0;
    for (let i = 0; i < 120; i++) {
      world.step(still);
      const evidence = world.lastCausalObservations.get("player");
      motorImpulseSum += Math.abs(evidence.motorImpulse.x);
      gripReactionSum += Math.abs(evidence.gripReactionImpulse.x);
      maxPlayerExcursion = Math.max(maxPlayerExcursion,
        Math.abs(world.player().body.translation().x - 5.5));
    }
    finite(world, "grip-braking-" + braking);
    const player = at(world, "player");
    const crate = at(world, "light-crate");
    assert(gripReactionSum > 0.01, "grip never coupled force back to player");
    return "braking=" + braking +
      "; player dx=" + (player.position.x - 5.5).toFixed(3) +
      "m; max excursion=" + maxPlayerExcursion.toFixed(3) +
      "m; accumulated |motor impulse x|=" + motorImpulseSum.toFixed(2) +
      "N·s; accumulated |grip reaction x|=" + gripReactionSum.toFixed(2) +
      "N·s; crate x=" + crate.position.x.toFixed(2) +
      "m; causal interpretation still open";
  });
}

await trial("grip-braking-can-be-varied-without-changing-normal-braking", (world) => {
  world.setPlayerProfile({ ...world.profile, braking: 24, gripBraking: 0 });
  world.player().body.setTranslation({ x: 5.5, y: 5.8 }, true);
  assert(world.beginGrip({ x: 6.9, y: 5.8 }), "grip acquisition failed");
  world.setGripTarget({ x: 7.9, y: 5.8 });
  for (let i = 0; i < 120; i++) world.step(still);
  const playerDx = world.player().body.translation().x - 5.5;
  assert(playerDx < -0.1,
    "independent grip braking did not expose physical reaction: dx=" + playerDx);
  assert(world.profile.braking === 24 && world.profile.gripBraking === 0,
    "experiment silently coupled independent braking authorities");
  world.endGrip();
  finite(world, "grip-braking decoupled");
  return "ordinary braking=24, grip braking=0; player dx=" +
    playerDx.toFixed(3) + "m";
});

await trial("same-wall-first-divergence-is-after-local-contact", (world) => {
  const wall = world.authorRect({ kind: "wall", cx: 16.8, cy: 11.4,
    width: 0.6, height: 2.5 });
  const run = (mode) => {
    world.reset();
    world.setResidentMode(mode);
    const record = [];
    for (let tick = 1; tick <= 165; tick++) {
      world.step(still);
      const e = at(world, "resident");
      const obs = world.lastCausalObservations.get("resident");
      record.push({
        tick, x: e.position.x, vx: e.velocity.x,
        demand: obs.intendedVelocity.x, touch: obs.contacts.includes(wall),
        progress: obs.progressAlongIntent, state: world.residentControl.state,
        recoveries: world.residentControl.recoveries
      });
    }
    finite(world, mode);
    return record;
  };
  const passive = run("baseline");
  const reactive = run("tactile-recovery");
  const contact = passive.find((x) => x.touch)?.tick;
  const firstDemand = passive.find((x, i) =>
    x.demand !== reactive[i].demand)?.tick;
  const firstPhysical = passive.find((x, i) =>
    Math.abs(x.x - reactive[i].x) > 1e-7 ||
    Math.abs(x.vx - reactive[i].vx) > 1e-7)?.tick;
  assert(Number.isInteger(contact), "authored wall never touched");
  assert(Number.isInteger(firstDemand), "local recovery never changed movement demand");
  assert(Number.isInteger(firstPhysical), "reaction never changed material trajectory");
  assert(firstDemand > contact,
    "different motor demand before tactile obstruction existed");
  assert(firstPhysical >= firstDemand,
    "material outcome diverged before motor intent");
  assert(reactive.some((x) => x.recoveries > 0),
    "reactive variant never initiated a recovery");
  const baseEnd = passive.at(-1), reactiveEnd = reactive.at(-1);
  assert(reactiveEnd.x < baseEnd.x - 0.5,
    "claimed recovery did not produce a distinct physical outcome");
  return "first touch t=" + contact + ", motor divergence t=" + firstDemand +
    ", body divergence t=" + firstPhysical +
    ", baseline x=" + baseEnd.x.toFixed(2) +
    ", reactive x=" + reactiveEnd.x.toFixed(2);
});

await trial("no-wall-control-recovery-does-not-invent-obstruction", (world) => {
  const run = (mode) => {
    world.reset();
    world.setResidentMode(mode);
    const frames = [];
    for (let i = 0; i < 135; i++) {
      world.step(still);
      const e = at(world, "resident");
      frames.push({ x: e.position.x, vx: e.velocity.x,
        demand: world.lastCausalObservations.get("resident").intendedVelocity.x });
    }
    assert(world.residentControl.recoveries === 0,
      "local recovery fabricated an obstacle in empty lane");
    return frames;
  };
  const base = run("baseline");
  const challenge = run("tactile-recovery");
  let largestDifference = 0;
  for (let i = 0; i < base.length; i++) {
    for (const key of ["x", "vx", "demand"]) {
      largestDifference = Math.max(largestDifference,
        Math.abs(base[i][key] - challenge[i][key]));
    }
  }
  assert(largestDifference < 1e-7,
    "control modes changed movement without material contact: " + largestDifference);
  return "same empty-lane behavior; largest divergence=" + largestDifference.toExponential(1);
});

// Donor-informed effectivity contrast: a world-object may obstruct geometry
// while being physically displaceable for this actor. Measure, do not label
// an authored material box impassable from shape alone.
for (const mass of [4, 450]) {
  await observation("movable-obstacle-effectivity-mass-" + mass, (world) => {
    const targetId = world.authorRect({ kind: "object", cx: 16.8, cy: 11.4,
      width: 0.7, height: 0.7, mass });
    world.setResidentMode("tactile-recovery");
    let touchTicks = 0;
    let firstTouch = null;
    let firstRecovery = null;
    let maxObjectDisplacement = 0;
    for (let tick = 1; tick <= 180; tick++) {
      world.step(still);
      const observation = world.lastCausalObservations.get("resident");
      if (observation.contacts.includes(targetId)) {
        touchTicks++;
        if (firstTouch === null) firstTouch = tick;
      }
      if (world.residentControl.recoveries > 0 && firstRecovery === null) {
        firstRecovery = tick;
      }
      maxObjectDisplacement = Math.max(maxObjectDisplacement,
        Math.abs(at(world, targetId).position.x - 16.8));
    }
    finite(world, "movable mass " + mass);
    return "mass=" + mass +
      "; first touch=" + String(firstTouch) +
      "; contact ticks=" + touchTicks +
      "; recoveries=" + world.residentControl.recoveries +
      "; first recovery=" + String(firstRecovery) +
      "; max obstacle travel=" + maxObjectDisplacement.toFixed(2) +
      "m; actor final x=" + at(world, "resident").position.x.toFixed(2) +
      "m; no affordance verdict";
  });
}

await trial("same-physics-private-touch-ablation-first-divergence", (world) => {
  const wallId = world.authorRect({ kind: "wall", cx: 16.8, cy: 11.4,
    width: 0.6, height: 2.5 });
  const run = (ablateTouch) => {
    world.reset();
    world.setResidentMode("tactile-recovery");
    const frames = [];
    for (let tick = 1; tick <= 140; tick++) {
      world.step(still);
      const obs = world.lastCausalObservations.get("resident");
      const body = at(world, "resident");
      const sensor = world.residentSense;
      assert(Object.keys(sensor).sort().join(",") ===
        "deltaX,forwardTouch,motorEffort,progressAlongIntent,touch",
        "local controller's sensory boundary gained World identity or geometry");
      if (ablateTouch) sensor.touch = false;
      frames.push({
        tick, x: body.position.x, vx: body.velocity.x,
        motor: obs.intendedVelocity.x, worldContact: obs.contacts.includes(wallId),
        privateTouch: sensor.touch,
        recoveries: world.residentControl.recoveries
      });
    }
    return frames;
  };
  const normal = run(false);
  const cut = run(true);
  const firstTouch = normal.find((f) => f.worldContact)?.tick;
  const firstPrivate = normal.find((f, i) => f.privateTouch !== cut[i].privateTouch)?.tick;
  const firstMotor = normal.find((f, i) => f.motor !== cut[i].motor)?.tick;
  const firstBody = normal.find((f, i) =>
    Math.abs(f.x - cut[i].x) > 1e-7 || Math.abs(f.vx - cut[i].vx) > 1e-7)?.tick;
  assert(firstTouch && firstPrivate && firstMotor && firstBody,
    "sensory ablation had no bounded causal contrast");
  assert(firstPrivate === firstTouch &&
    firstMotor > firstPrivate && firstBody >= firstMotor,
    "private sensory / motor / material first-divergence order invalid");
  assert(normal.some((f) => f.recoveries > 0), "intact actor did not react");
  assert(cut.every((f) => f.recoveries === 0),
    "local touch ablation failed; unexpected world-authority shortcut");
  assert(normal[firstTouch - 1].worldContact && cut[firstTouch - 1].worldContact,
    "World contact was modified by private sensory intervention");
  return "world touch t=" + firstTouch +
    ", private evidence divergence t=" + firstPrivate +
    ", first motor difference t=" + firstMotor +
    ", first material difference t=" + firstBody +
    "; sensory cut prevented recovery without altering World contact";
});

await trial("wall-inserted-during-live-simulation-changes-only-subsequent-response", (world) => {
  const run = (mode) => {
    world.clearAuthored();
    world.reset();
    world.setResidentMode(mode);
    const frames = [];
    let wallId = null;
    for (let tick = 1; tick <= 155; tick++) {
      if (tick === 22) {
        wallId = world.authorRect({ kind: "wall", cx: 16.8, cy: 11.4,
          width: 0.6, height: 2.5 });
      }
      world.step(still);
      const body = at(world, "resident");
      const trace = world.lastCausalObservations.get("resident");
      frames.push({
        tick, x: body.position.x, vx: body.velocity.x,
        motor: trace.intendedVelocity.x, touch: wallId ?
          trace.contacts.includes(wallId) : false
      });
    }
    return frames;
  };
  const fixed = run("baseline");
  const reactive = run("tactile-recovery");
  const firstTouch = fixed.find((f) => f.touch)?.tick;
  const firstMotor = fixed.find((f, i) => f.motor !== reactive[i].motor)?.tick;
  const firstBody = fixed.find((f, i) =>
    Math.abs(f.x - reactive[i].x) > 1e-7 ||
    Math.abs(f.vx - reactive[i].vx) > 1e-7)?.tick;
  assert(firstTouch && firstTouch >= 22 && firstMotor && firstBody,
    "no lawful contact or resulting behavioral divergence after live edit");
  assert(firstMotor > firstTouch && firstBody >= firstMotor,
    "intervention response diverged before receiving tactile evidence");
  for (let i = 0; i < 21; i++) {
    assert(fixed[i].x === reactive[i].x && fixed[i].motor === reactive[i].motor,
      "control mode altered the world before owner live intervention");
  }
  return "live wall placed t=22; first touch t=" + firstTouch +
    "; motor divergence t=" + firstMotor +
    "; body divergence t=" + firstBody;
});

await trial("removing-a-live-wall-reopens-the-material-lane", (world) => {
  const run = (removeAtTick) => {
    world.clearAuthored();
    world.reset();
    world.setResidentMode("tactile-recovery");
    const id = world.authorRect({ kind: "wall", cx: 16.8, cy: 11.4,
      width: 0.6, height: 2.5 });
    const samples = [];
    for (let tick = 1; tick <= 350; tick++) {
      if (tick === removeAtTick) {
        assert(world.undoAuthored(), "could not remove authored obstruction during live run");
        assert(!world.snapshot().staticRects.some((s) => s.id === id),
          "world retained removed wall collider");
      }
      world.step(still);
      const resident = at(world, "resident");
      const trace = world.lastCausalObservations.get("resident");
      samples.push({
        tick, x: resident.position.x, motor: trace.intendedVelocity.x,
        touchedWall: trace.contacts.includes(id),
        recoveries: world.residentControl.recoveries
      });
    }
    finite(world, "live wall removal");
    return samples;
  };
  const held = run(Infinity);
  const removed = run(75);
  for (let i = 0; i < 74; i++) {
    assert(held[i].x === removed[i].x && held[i].motor === removed[i].motor,
      "removal counterfactual diverged before the actual intervention");
  }
  assert(held.some((s) => s.touchedWall) && removed.some((s) => s.touchedWall),
    "comparison lacked the same initial wall-contact history");
  assert(removed.slice(74).every((s) => !s.touchedWall),
    "removed wall persisted as contact or ghost collider");
  const firstWorldDifference = held.find((s, i) => Math.abs(s.x - removed[i].x) > 1e-7 ||
    Math.abs(s.motor - removed[i].motor) > 1e-7)?.tick;
  assert(firstWorldDifference >= 75,
    "changed outcome precedes material removal");
  const maxRightAfterRemoval = Math.max(...removed.slice(74).map((s) => s.x));
  assert(maxRightAfterRemoval > 17.3,
    "material lane was reopened but resident never advanced beyond former wall: " +
      maxRightAfterRemoval.toFixed(2));
  return "remove at t=75; first changed trajectory/motor t=" + firstWorldDifference +
    "; max x after removal=" + maxRightAfterRemoval.toFixed(2) +
    "m; max x with wall=" + Math.max(...held.map((s) => s.x)).toFixed(2) +
    "m; initial histories identical";
});

// Exercise the real DOM control bindings as well as the physics model,
// without adding a third (flaky/expensive) headless-Chrome process.
try {
  const pause = document.querySelector("#pause-simulation");
  const single = document.querySelector("#single-step");
  assert(pause && single, "pause/step controls absent from actual HTML");
  assert(document.body.dataset.simulationPaused === "false" && single.disabled,
    "simulation initially paused or step available while running");
  const before = Number(document.body.dataset.physicsSteps || "0");
  pause.click();
  assert(document.body.dataset.simulationPaused === "true" && !single.disabled,
    "pause button failed to freeze simulation mode");
  window.dispatchEvent(new KeyboardEvent("keydown", {
    code: "Space", repeat: true, bubbles: true, cancelable: true
  }));
  assert(document.body.dataset.simulationPaused === "true",
    "held Space repeated and unexpectedly toggled simulation");
  window.dispatchEvent(new KeyboardEvent("keydown", {
    code: "Period", repeat: true, bubbles: true, cancelable: true
  }));
  assert(Number(document.body.dataset.physicsSteps || "0") === before,
    "held Period repeated and unexpectedly advanced physics");
  single.click();
  const after = Number(document.body.dataset.physicsSteps || "0");
  assert(after === before + 1, "single-step did not advance exactly one physics tick");
  pause.click();
  assert(document.body.dataset.simulationPaused === "false" && single.disabled,
    "resume failed or single-step remained enabled");
  cases.push({ name: "live-ui-pause-and-exact-step", status: "PASS",
    detail: "DOM buttons paused, advanced one Rapier tick and resumed" });
} catch (error) {
  cases.push({ name: "live-ui-pause-and-exact-step", status: "FAIL",
    detail: String(error?.message ?? error).slice(0, 300) });
}
await trial("resident-physical-profile-validates-and-survives-reset", (world) => {
  const before = { ...world.residentProfile };
  let rejected = false;
  try {
    world.setResidentProfile({ ...world.residentProfile, mass: -1, acceleration: 0 });
  } catch (error) { rejected = error instanceof RangeError; }
  assert(rejected, "invalid resident body profile was accepted");
  assert(JSON.stringify(world.residentProfile) === JSON.stringify(before),
    "invalid resident edit partially mutated its profile");
  const resident = world.entities.get("resident");
  const priorCollider = resident.collider.handle;
  world.setResidentProfile({ ...before, acceleration: 0, braking: 0,
    maxSpeed: 0 });
  assert(resident.collider.handle === priorCollider,
    "drive-only edit recreated a physical collider");
  for (let t = 0; t < 50; t++) world.step(still);
  assert(world.residentControl.recoveries === 0,
    "resident falsely inferred an obstacle with zero motor authority");
  world.setResidentProfile({ radius: 0.33, mass: 350,
    maxSpeed: 3, acceleration: 12, braking: 16 });
  assert(resident.mass === 350 && resident.radius === 0.33,
    "authored resident body failed to change");
  world.reset();
  assert(world.residentProfile.mass === 350 && world.residentProfile.radius === 0.33,
    "reset erased authored resident physiology");
  assert(at(world, "resident").mass === 350 && at(world, "resident").radius === 0.33,
    "reset failed to reconstruct physical resident collider");
  finite(world, "resident profile and reset");
  return "rejected invalid profile; zero drive; mass+radius reconstructed on reset";
});

for (const actorMass of [72, 350]) {
  await observation("same-heavy-obstacle-resident-mass-" + actorMass, (world) => {
    world.setResidentProfile({ ...world.residentProfile, mass: actorMass });
    const id = world.authorRect({ kind: "object", cx: 16.8, cy: 11.4,
      width: 0.7, height: 0.7, mass: 450 });
    world.setResidentMode("tactile-recovery");
    let contacts = 0;
    let maxMovement = 0;
    for (let tick = 1; tick <= 180; tick++) {
      world.step(still);
      if (world.lastCausalObservations.get("resident").contacts.includes(id)) contacts++;
      maxMovement = Math.max(maxMovement, Math.abs(at(world, id).position.x - 16.8));
    }
    finite(world, "same obstacle vs actor mass " + actorMass);
    return "resident mass=" + actorMass + "kg; fixed obstacle mass=450kg;" +
      " obstacle max travel=" + maxMovement.toFixed(3) + "m;" +
      " resident x=" + at(world, "resident").position.x.toFixed(3) +
      "; touch ticks=" + contacts +
      "; recoveries=" + world.residentControl.recoveries +
      "; no general affordance verdict";
  });
}

try {
  const pause = document.querySelector("#pause-simulation");
  const step = document.querySelector("#single-step");
  const mass = document.querySelector('[data-resident-profile="mass"]');
  const feedback = document.querySelector("#resident-profile-feedback");
  const readout = document.querySelector("#selected-readout");
  const reset = document.querySelector("#restore-resident-body");
  assert(pause && step && mass && feedback && readout && reset,
    "resident authoring UI bindings missing");
  document.querySelector("#focus-resident").click();
  pause.click();
  assert(document.body.dataset.simulationPaused === "true",
    "resident UI test could not pause real simulation");
  mass.value = "350";
  mass.dispatchEvent(new Event("change", { bubbles: true }));
  step.click();
  assert(readout.textContent.includes("resident") &&
    readout.textContent.includes("mass 350.00"),
    "resident mass UI did not change the real selected physical body");
  mass.value = "-2";
  mass.dispatchEvent(new Event("change", { bubbles: true }));
  assert(mass.value === "350" && feedback.textContent.startsWith("Not applied:"),
    "invalid physical edit did not visibly reject and restore accepted value");
  reset.click();
  step.click();
  assert(readout.textContent.includes("mass 72.00"),
    "restore resident defaults failed to reconstruct physical selected body");
  assert(document.querySelector("#resident-status").textContent.includes("local travel"),
    "resident status omitted its bounded body-local odometry");
  assert(document.querySelector("#intervention-timeline").textContent.includes("actor.body"),
    "visible experiment workbench omitted a real resident body intervention");
  pause.click();
  assert(document.body.dataset.simulationPaused === "false",
    "resident UI probe left simulation paused");
  cases.push({ name: "live-ui-resident-authoring-and-rejection", status: "PASS",
    detail: "selected physical body changed to 350kg; invalid -2kg visibly rejected; default 72kg restored" });
} catch (error) {
  cases.push({ name: "live-ui-resident-authoring-and-rejection", status: "FAIL",
    detail: String(error?.message ?? error).slice(0, 300) });
}
await trial("research-event-trace-does-not-enter-resident-sensors", (world) => {
  const wall = world.authorRect({ kind: "wall", cx: 16.8, cy: 11.4,
    width: 0.6, height: 2.5 });
  assert(world.interventionEvents.some((e) => e.type === "world.add" &&
    e.note.includes(wall) && e.tick === 0),
    "authored wall has no source-level intervention event");
  for (let i = 0; i < 70; i++) world.step(still);
  const reversals = world.interventionEvents.filter((e) =>
    e.type === "actor.reversal");
  assert(reversals.length > 0 && reversals[0].tick >= 35,
    "resident reversal not causally placed after material contact");
  assert(Object.keys(world.residentSense).sort().join(",") ===
    "deltaX,forwardTouch,motorEffort,progressAlongIntent,touch",
    "research-plane source history leaked into local resident sensing");
  assert(world.undoAuthored(), "could not undo wall for event trace");
  assert(world.interventionEvents.some((e) => e.type === "world.remove" &&
    e.note.includes(wall) && e.tick === 70),
    "world removal omitted material-edit timing");
  world.reset();
  assert(world.interventionEvents.length === 1 &&
    world.interventionEvents[0].type === "world.reset" &&
    world.interventionEvents[0].tick === 0,
    "new simulation inherited earlier run's intervention events");
  return "world.add@0, reversal@" + reversals[0].tick +
    ", world.remove@70; reset clears previous run trace; actor sample remains private";
});

await trial("resident-lane-reversal-does-not-query-absolute-world-x", (world) => {
  world.setResidentMode("tactile-recovery");
  const controller = world.residentControl;
  assert(controller.estimatedX === 0, "initial local travel estimate is not zero");
  // A research-plane placement intentionally changes World x without
  // fabricating private movement history. It is a falsifier of global-x access.
  world.entities.get("resident").body.setTranslation({ x: 21.1, y: 11.4 }, true);
  world.step(still);
  const trace = world.lastCausalObservations.get("resident");
  assert(trace.intendedVelocity.x > 0,
    "resident silently used World position beyond old endpoint to reverse");
  assert(Math.abs(controller.estimatedX) < 1e-7,
    "local odometry fabricated a teleport displacement before moving");
  assert(Object.keys(world.residentSense).sort().join(",") ===
    "deltaX,forwardTouch,motorEffort,progressAlongIntent,touch",
    "resident received extra World truth instead of bounded proprioception");
  return "global x=21.1 beyond former endpoint, local estimate=0;" +
    " motor remains positive until actual proprioceptive travel";
});

await trial("peer-is-optional-and-reset-is-physical-not-identity-loss", (world) => {
  assert(!world.peerEnabled && !world.entities.has("peer"),
    "existing single-resident baseline was modified");
  for (let i = 0; i < 15; i++) world.step(still);
  const before = at(world, "resident").position;
  const beforeTick = world.physicsTick;
  world.setPeerEnabled(true);
  assert(world.entities.has("peer") && world.snapshot().entities.length === 6,
    "peer not physically present in shared World");
  assert(world.physicsTick === beforeTick && world.residentControl.tick === beforeTick,
    "peer spawn silently reset live resident time");
  assert(JSON.stringify(at(world, "resident").position) === JSON.stringify(before),
    "peer spawn teleported the original resident");
  assert(world.entities.get("peer").mass === 210 &&
    world.entities.get("resident").mass === 72, "bodies not physically distinct");
  for (let i = 0; i < 12; i++) world.step(still);
  assert(world.residentSense && world.peerSense &&
    world.residentSense !== world.peerSense &&
    world.residentControl !== world.peerControl,
    "actor sensor or decision history accidentally shared");
  assert(Object.keys(world.peerSense).sort().join(",") ===
    "deltaX,forwardTouch,motorEffort,progressAlongIntent,touch",
    "peer received World oracle or extra cross-actor knowledge");
  world.reset();
  assert(world.peerEnabled && world.entities.has("peer") &&
    world.snapshot().entities.length === 6 &&
    world.peerControl.tick === 0 && world.residentControl.tick === 0,
    "reset failed to reconstruct two isolated actor-local states");
  world.setPeerEnabled(false);
  assert(!world.entities.has("peer") && world.snapshot().entities.length === 5 &&
    !world.lastCausalObservations.has("peer"),
    "removing peer leaked body or stale observation");
  finite(world, "peer spawn/remove");
  return "5→6 bodies; independent traces; reset rebuilds; disable returns to 5";
});

await trial("two-real-bodies-contact-and-produce-mutual-physical-response", (world) => {
  world.setPeerEnabled(true);
  world.setResidentMode("tactile-recovery");
  let firstDirectContact = null;
  let observedContactTicks = 0;
  let maxPeerChange = 0;
  for (let tick = 1; tick <= 200; tick++) {
    world.step(still);
    const a = world.lastCausalObservations.get("resident");
    const b = world.lastCausalObservations.get("peer");
    assert(a && b, "one actor failed to execute an independent motor step");
    const joined = a.contacts.includes("peer") && b.contacts.includes("resident");
    if (joined) {
      if (firstDirectContact === null) firstDirectContact = tick;
      observedContactTicks++;
    }
    maxPeerChange = Math.max(maxPeerChange,
      Math.abs(at(world, "peer").position.x - 19));
    if (tick === 20) {
      assert(!world.residentSense?.contacts && !world.peerSense?.contacts,
        "private actor sensor carried debugging contact identities");
    }
  }
  finite(world, "two-body contact");
  assert(Number.isInteger(firstDirectContact),
    "actors never made reciprocal physical contact");
  assert(maxPeerChange > 0.2, "second physical body never moved");
  assert(observedContactTicks > 0, "reciprocal contact did not persist for a sampled step");
  return "first reciprocal contact t=" + firstDirectContact +
    "; contact ticks=" + observedContactTicks +
    "; peer max travel=" + maxPeerChange.toFixed(2) +
    "m; resident recoveries=" + world.residentControl.recoveries +
    ", peer recoveries=" + world.peerControl.recoveries;
});

await trial("empty-lane-one-vs-two-only-diverges-after-material-encounter", (world) => {
  const run = (withPeer) => {
    world.reset();
    world.setPeerEnabled(withPeer);
    world.setResidentMode("tactile-recovery");
    const timeline = [];
    for (let tick = 1; tick <= 190; tick++) {
      world.step(still);
      const a = at(world, "resident");
      const obs = world.lastCausalObservations.get("resident");
      timeline.push({
        tick, x: a.position.x, vx: a.velocity.x,
        demand: obs.intendedVelocity.x,
        directContact: obs.contacts.includes("peer")
      });
    }
    return timeline;
  };
  const control = run(false);
  const together = run(true);
  const touch = together.find((x) => x.directContact)?.tick;
  const firstDifference = control.find((x,i) =>
    Math.abs(x.x - together[i].x) > 1e-7 ||
    Math.abs(x.vx - together[i].vx) > 1e-7 ||
    x.demand !== together[i].demand)?.tick;
  assert(Number.isInteger(touch), "no physical encounter in two-body arm");
  assert(Number.isInteger(firstDifference), "second physical body had no causal effect");
  assert(firstDifference >= touch,
    "resident changed before direct physical interaction: t=" +
      firstDifference + " versus touch " + touch);
  return "first contact t=" + touch +
    "; first material/motor divergence t=" + firstDifference +
    "; control and two-body histories identical beforehand";
});

try {
  const toggle = document.querySelector("#toggle-peer");
  const focus = document.querySelector("#focus-peer");
  const status = document.querySelector("#peer-status");
  assert(toggle && focus && status, "second-actor UI not mounted");
  assert(toggle.getAttribute("aria-pressed") === "false" && focus.disabled,
    "peer UI enabled before physical body existed");
  toggle.click();
  assert(toggle.getAttribute("aria-pressed") === "true" && !focus.disabled,
    "peer button did not instantiate and enable second actor");
  focus.click();
  const trace = document.querySelector("#selected-readout");
  document.querySelector("#pause-simulation").click();
  document.querySelector("#single-step").click();
  assert(trace.textContent.includes("peer") &&
    status.textContent.includes("Second body"),
    "peer camera/selection or local-inspection surface failed");
  const massField = document.querySelector("#peer-mass");
  const massFeedback = document.querySelector("#peer-mass-feedback");
  assert(massField && massFeedback, "counter-body mass UI missing");
  massField.value = "390";
  massField.dispatchEvent(new Event("change", { bubbles: true }));
  document.querySelector("#single-step").click();
  assert(trace.textContent.includes("mass 390.00"),
    "selected counter-body did not receive physical 390kg");
  massField.value = "-1";
  massField.dispatchEvent(new Event("change", { bubbles: true }));
  assert(massField.value === "390" && massFeedback.textContent.startsWith("Not applied:"),
    "counter-body mass invalid edit not rejected visibly");
  toggle.click();
  assert(toggle.getAttribute("aria-pressed") === "false" && focus.disabled,
    "disabling peer did not leave usable one-body UI");
  document.querySelector("#pause-simulation").click();
  cases.push({ name: "live-ui-peer-toggle-and-inspection", status: "PASS",
    detail: "Add → focus/inspect → remove second physical body through actual DOM controls" });
} catch (error) {
  cases.push({ name: "live-ui-peer-toggle-and-inspection", status: "FAIL",
    detail: String(error?.message ?? error).slice(0, 300) });
}
await trial("second-body-mass-is-real-and-authorable-without-shared-state", (world) => {
  world.setPeerEnabled(true);
  const actor = world.entities.get("peer");
  const original = world.peerMass;
  let rejected = false;
  try { world.setPeerMass(-200); } catch (error) { rejected = error instanceof RangeError; }
  assert(rejected && world.peerMass === original && actor.mass === original,
    "invalid peer body edit partially applied");
  const firstIdentity = actor.id;
  world.setPeerMass(430);
  assert(actor.mass === 430 && world.peerMass === 430 &&
    world.entities.get("resident").mass === 72 && actor.id === firstIdentity,
    "mass changed globally or physical object identity lost");
  for (let i = 0; i < 55; i++) world.step(still);
  assert(world.peerControl.tick === 55 && world.residentControl.tick === 55,
    "actor-local controllers stopped while mass was edited");
  world.reset();
  assert(world.peerEnabled && world.entities.get("peer").mass === 430,
    "reset silently lost authored peer mass");
  assert(world.peerSense === null && world.residentSense === null,
    "reset retained private samples from previous experiment");
  finite(world, "peer mass");
  return "rejected -200kg, set 430kg in live physics, kept resident 72kg, reset persisted";
});

await trial("mass-only-peer-intervention-causes-later-physical-divergence", (world) => {
  const run = (mass) => {
    world.setPeerMass(mass);
    world.setPeerEnabled(true);
    world.reset();
    world.setResidentMode("tactile-recovery");
    const samples = [];
    for (let tick = 1; tick <= 190; tick++) {
      world.step(still);
      const a = at(world, "resident");
      const o = world.lastCausalObservations.get("resident");
      samples.push({
        tick, x: a.position.x, vx: a.velocity.x,
        demand: o.intendedVelocity.x, touching: o.contacts.includes("peer")
      });
    }
    finite(world, "mass AB");
    return samples;
  };
  const light = run(30);
  const heavy = run(430);
  const touch = light.find((v) => v.touching)?.tick;
  const firstChange = light.find((v,i) =>
    Math.abs(v.x - heavy[i].x) > 1e-7 ||
    Math.abs(v.vx - heavy[i].vx) > 1e-7 ||
    v.demand !== heavy[i].demand)?.tick;
  assert(touch && firstChange && firstChange >= touch,
    "different material mass changed behavior before actual contact");
  const delta = Math.abs(light.at(-1).x - heavy.at(-1).x);
  assert(delta > 0.2, "large mass contrast produced no material difference: " + delta);
  return "contact t=" + touch + "; first physical/motor difference t=" + firstChange +
    "; resident x: peer 30kg " + light.at(-1).x.toFixed(2) +
    "m vs peer 430kg " + heavy.at(-1).x.toFixed(2) + "m";
});

await trial("third-body-role-is-dynamic-and-resets-without-oracle-leak", (world) => {
  assert(!world.braceEnabled && !world.entities.has("brace"),
    "new pressure role changed the old two-body starting fixture");
  world.setPeerEnabled(true);
  world.setBraceEnabled(true);
  assert(world.entities.has("brace") && world.snapshot().entities.length === 7,
    "three physical roles not instantiated in the same World");
  const brace = world.entities.get("brace");
  assert(brace.body.isDynamic() && brace.mass === 120 &&
    brace.braking === 30, "holder was a fixture or did not carry finite force");
  assert(world.residentSense === null && world.peerSense === null,
    "new role leaked another actor's private sensor history");
  let rejected = false;
  try { world.setBraceProfile({ mass: -1, braking: 0 }); }
  catch (error) { rejected = error instanceof RangeError; }
  assert(rejected && world.braceMass === 120 && world.braceBraking === 30,
    "invalid holder edit partially changed material or motor state");
  world.setBraceProfile({ mass: 150, braking: 0 });
  assert(world.entities.get("brace").mass === 150 &&
    world.entities.get("brace").braking === 0, "zero finite authority was normalized");
  for (let i = 0; i < 25; i++) world.step(still);
  finite(world, "shared three-body world");
  world.reset();
  assert(world.braceEnabled && world.peerEnabled &&
    world.entities.get("brace").mass === 150 &&
    world.entities.get("brace").braking === 0 &&
    world.snapshot().entities.length === 7,
    "authored holder configuration did not survive reset");
  world.setBraceEnabled(false);
  assert(world.snapshot().entities.length === 6 &&
    !world.lastCausalObservations.has("brace"),
    "third role leaked body or stale observation after disabling");
  return "dynamic holder; 7 bodies; zero authority valid; reset/disable clean";
});

await trial("finite-holder-enters-real-contact-chain-with-two-moving-actors", (world) => {
  world.setPeerEnabled(true);
  world.setBraceEnabled(true);
  world.setPeerMass(30);
  let contactsResidentBrace = 0;
  let contactsPeerBrace = 0;
  let maxBraceTravel = 0;
  let firstResidentBrace = null;
  let firstPeerBrace = null;
  for (let tick = 1; tick <= 280; tick++) {
    world.step(still);
    const residentContacts = world.lastCausalObservations.get("resident").contacts;
    const peerContacts = world.lastCausalObservations.get("peer").contacts;
    const braceContacts = world.lastCausalObservations.get("brace").contacts;
    if (residentContacts.includes("brace") && braceContacts.includes("resident")) {
      contactsResidentBrace++;
      if (firstResidentBrace === null) firstResidentBrace = tick;
    }
    if (peerContacts.includes("brace") && braceContacts.includes("peer")) {
      contactsPeerBrace++;
      if (firstPeerBrace === null) firstPeerBrace = tick;
    }
    maxBraceTravel = Math.max(maxBraceTravel,
      Math.abs(at(world, "brace").position.x - 17.35));
  }
  finite(world, "real pressure chain");
  assert(contactsResidentBrace > 0 && contactsPeerBrace > 0,
    "holder never physically interacted with BOTH moving actors");
  // Strong finite braking may make displacement tiny. Reciprocal contacts
  // are evidence of interaction, not a guaranteed displacement threshold.
  // Falsify an accidentally static holder with a controlled physical impulse.
  const beforeImpulse = at(world, "brace").position.x;
  world.entities.get("brace").body.applyImpulse({ x: 35, y: 0 }, true);
  for (let tick = 0; tick < 12; tick++) world.step(still);
  const afterImpulse = at(world, "brace").position.x;
  assert(Math.abs(afterImpulse - beforeImpulse) > 1e-4,
    "braced body did not respond to a real Rapier impulse");
  return "resident↔holder first t=" + firstResidentBrace +
    " (" + contactsResidentBrace + " steps), peer↔holder first t=" +
    firstPeerBrace + " (" + contactsPeerBrace +
    " steps), holder max displacement under encounter=" +
    maxBraceTravel.toFixed(4) + "m; after direct impulse=" +
    (afterImpulse - beforeImpulse).toFixed(4) + "m";
});

await trial("holder-finite-braking-is-different-from-zero-authority", (world) => {
  const run = (braking) => {
    world.setBraceProfile({ mass: 120, braking });
    world.setPeerMass(30);
    world.setPeerEnabled(true);
    world.setBraceEnabled(true);
    world.reset();
    const held = [];
    let impulseTotal = 0;
    let contacts = 0;
    for (let tick = 1; tick <= 260; tick++) {
      world.step(still);
      const state = at(world, "brace");
      const obs = world.lastCausalObservations.get("brace");
      impulseTotal += Math.hypot(obs.motorImpulse.x, obs.motorImpulse.y);
      if (obs.contacts.length) contacts++;
      held.push({ x: state.position.x, vx: state.velocity.x,
        withResident: obs.contacts.includes("resident"),
        withPeer: obs.contacts.includes("peer") });
    }
    finite(world, "bracing AB");
    return { held, impulseTotal, contacts };
  };
  const passive = run(0);
  const active = run(30);
  assert(passive.impulseTotal === 0 && active.impulseTotal > 0,
    "finite holding authority did not change applied motor impulse");
  assert(passive.contacts > 0 && active.contacts > 0,
    "comparison never physically reached holding body");
  // Capture first tick explicitly; timing does not classify intent.
  let first = null, peakDiff = 0;
  for (let i = 0; i < passive.held.length; i++) {
    const diff = Math.abs(passive.held[i].x - active.held[i].x);
    if (first === null && diff > 1e-7) first = i + 1;
    peakDiff = Math.max(peakDiff, diff);
  }
  assert(first !== null, "holding authority changed effort but never material afterstate");
  return "first material difference t=" + first +
    "; max holder x divergence=" + peakDiff.toFixed(4) +
    "m; summed |motor impulse| zero=" + passive.impulseTotal.toFixed(2) +
    " vs braked=" + active.impulseTotal.toFixed(2) + " N·s";
});

try {
  const toggle = document.querySelector("#toggle-brace");
  const focus = document.querySelector("#focus-brace");
  const m = document.querySelector("#brace-mass");
  const b = document.querySelector("#brace-braking");
  const message = document.querySelector("#brace-profile-feedback");
  const readout = document.querySelector("#selected-readout");
  assert(toggle && focus && m && b && message && readout,
    "holder experiment controls not mounted");
  assert(toggle.getAttribute("aria-pressed") === "false" && focus.disabled,
    "holder UI was enabled before it existed physically");
  toggle.click();
  assert(toggle.getAttribute("aria-pressed") === "true" && !focus.disabled,
    "holder toggle did not instantiate live body");
  focus.click();
  document.querySelector("#pause-simulation").click();
  document.querySelector("#single-step").click();
  assert(readout.textContent.includes("brace") &&
    readout.textContent.includes("mass 120.00"),
    "holder camera/selection does not expose real physical body");
  m.value = "180";
  b.value = "0";
  m.dispatchEvent(new Event("change", { bubbles: true }));
  document.querySelector("#single-step").click();
  assert(readout.textContent.includes("mass 180.00") &&
    m.value === "180" && b.value === "0",
    "material holder mass/authority not applied via DOM");
  b.value = "-5";
  b.dispatchEvent(new Event("change", { bubbles: true }));
  assert(b.value === "0" && message.textContent.startsWith("Not applied:"),
    "invalid finite braking was accepted or UI not synchronized");
  toggle.click();
  assert(focus.disabled && toggle.getAttribute("aria-pressed") === "false",
    "removal left an active holder UI");
  document.querySelector("#pause-simulation").click();
  cases.push({ name: "live-ui-finite-holder-edit-and-remove", status: "PASS",
    detail: "add/focus, mass 180kg, braking 0, reject -5, remove; shared World intact" });
} catch (error) {
  cases.push({ name: "live-ui-finite-holder-edit-and-remove", status: "FAIL",
    detail: String(error?.message ?? error).slice(0, 300) });
}
await trial("third-role-addition-only-alters-other-actors-after-actual-contact", (world) => {
  const run = (withHolder) => {
    world.setPeerMass(30);
    world.setBraceProfile({ mass: 120, braking: 30 });
    world.setPeerEnabled(true);
    world.setBraceEnabled(withHolder);
    world.reset();
    const observations = [];
    for (let tick = 1; tick <= 200; tick++) {
      world.step(still);
      const resident = at(world, "resident"), peer = at(world, "peer");
      const residentTrace = world.lastCausalObservations.get("resident");
      const peerTrace = world.lastCausalObservations.get("peer");
      observations.push({
        tick,
        residentX: resident.position.x, residentVX: resident.velocity.x,
        residentDemand: residentTrace.intendedVelocity.x,
        peerX: peer.position.x, peerVX: peer.velocity.x,
        peerDemand: peerTrace.intendedVelocity.x,
        residentHolder: residentTrace.contacts.includes("brace"),
        peerHolder: peerTrace.contacts.includes("brace")
      });
    }
    finite(world, "third-role counterfactual");
    return observations;
  };
  const no = run(false), yes = run(true);
  const firstTouch = yes.find(x => x.residentHolder || x.peerHolder)?.tick;
  let peerDifference = null, residentDifference = null;
  for (let i = 0; i < no.length; i++) {
    const a = no[i], b = yes[i];
    if (peerDifference === null &&
      (Math.abs(a.peerX - b.peerX) > 1e-7 ||
       Math.abs(a.peerVX - b.peerVX) > 1e-7 ||
       a.peerDemand !== b.peerDemand)) peerDifference = i + 1;
    if (residentDifference === null &&
      (Math.abs(a.residentX - b.residentX) > 1e-7 ||
       Math.abs(a.residentVX - b.residentVX) > 1e-7 ||
       a.residentDemand !== b.residentDemand)) residentDifference = i + 1;
  }
  assert(firstTouch && peerDifference && residentDifference,
    "optional third role had no measured shared-world causal consequence");
  assert(peerDifference >= firstTouch && residentDifference >= firstTouch,
    "body divergence predates contact with new physical participant");
  return "first holder contact t=" + firstTouch +
    "; peer material/motor divergence t=" + peerDifference +
    "; resident material/motor divergence t=" + residentDifference;
});

await observation("three-way-overlapping-contact-pressure-survey", world => {
  world.setPeerMass(30);
  world.setBraceProfile({ mass: 120, braking: 30 });
  world.setPeerEnabled(true);
  world.setBraceEnabled(true);
  world.reset();
  let threeBodyContactTicks = 0, maxLiveEdges = 0, peakOverlaps = 0;
  let contactStart = null;
  for (let tick = 1; tick <= 400; tick++) {
    world.step(still);
    const res = world.lastCausalObservations.get("resident").contacts;
    const peer = world.lastCausalObservations.get("peer").contacts;
    const holder = world.lastCausalObservations.get("brace").contacts;
    const rh = res.includes("brace") && holder.includes("resident");
    const hp = peer.includes("brace") && holder.includes("peer");
    const rp = peer.includes("resident") && res.includes("peer");
    const edges = Number(rh) + Number(hp) + Number(rp);
    maxLiveEdges = Math.max(maxLiveEdges, edges);
    if (edges >= 2) {
      if (contactStart === null) contactStart = tick;
      threeBodyContactTicks++;
    }
    peakOverlaps = Math.max(peakOverlaps, edges);
  }
  finite(world, "simultaneous contact survey");
  return "shared 2+ simultaneous contact edges for " + threeBodyContactTicks +
    " steps; first t=" + String(contactStart) +
    "; max live physical edges=" + maxLiveEdges +
    "; no crowd-level inference";
});

try {
  const peerToggle = document.querySelector("#toggle-peer");
  const braceToggle = document.querySelector("#toggle-brace");
  const pause = document.querySelector("#pause-simulation");
  const advance = document.querySelector("#single-step");
  const overlay = document.querySelector("#contact-overlay");
  const readout = document.querySelector("#contact-overlay-summary");
  assert(peerToggle && braceToggle && pause && advance && overlay && readout,
    "live contact graph controls missing");
  peerToggle.click();
  braceToggle.click();
  pause.click();
  overlay.checked = true;
  for (let tick = 0; tick < 50; tick++) advance.click();
  const pairs = Number(document.body.dataset.liveBodyContactPairs || "0");
  assert(pairs > 0, "actual 3-body encounter did not expose contact links");
  assert(readout.textContent.includes("Live body pairs"),
    "the live overlay does not report the actual contact graph");
  overlay.checked = false;
  braceToggle.click();
  peerToggle.click();
  pause.click();
  cases.push({ name: "live-ui-three-body-contact-graph", status: "PASS",
    detail: pairs + " reciprocal contact-pair edges visualizable during actual DOM step-run" });
} catch (error) {
  cases.push({ name: "live-ui-three-body-contact-graph", status: "FAIL",
    detail: String(error?.message ?? error).slice(0, 300) });
}
await trial("forward-contact-is-actually-derived-from-rapier-manifold", (world) => {
  const wall = world.authorRect({ kind: "wall", cx: 16.8, cy: 11.4,
    width: 0.6, height: 2.5 });
  world.setResidentMode("directional-recovery");
  let firstWorldTouch = null, firstForwardTouch = null;
  let firstBackoff = null;
  for (let tick = 1; tick <= 100; tick++) {
    world.step(still);
    const local = world.residentSense;
    const observed = world.lastCausalObservations.get("resident");
    if (firstWorldTouch === null && observed.contacts.includes(wall))
      firstWorldTouch = tick;
    if (firstForwardTouch === null && local.forwardTouch) firstForwardTouch = tick;
    if (firstBackoff === null && world.residentControl.recoveries > 0)
      firstBackoff = tick;
  }
  assert(firstWorldTouch && firstForwardTouch && firstBackoff,
    "forward normal did not produce meaningful sensor→controller sequence");
  assert(firstForwardTouch >= firstWorldTouch && firstBackoff > firstForwardTouch,
    "forward normal or motor action arrived before physical contact evidence");
  assert(world.residentControl.recoveries >= 1, "directional contact never recovered");
  return "World contact t=" + firstWorldTouch +
    ", local forward normal t=" + firstForwardTouch +
    ", backoff t=" + firstBackoff;
});

await trial("directional-recovery-requires-local-forward-evidence-not-just-touch", (world) => {
  const wall = world.authorRect({ kind: "wall", cx: 16.8, cy: 11.4,
    width: 0.6, height: 2.5 });
  const run = cut => {
    world.reset();
    world.setResidentMode("directional-recovery");
    let contacts = 0, forwardBeforeAblation = 0;
    for (let tick = 1; tick <= 120; tick++) {
      world.step(still);
      const trace = world.lastCausalObservations.get("resident");
      if (trace.contacts.includes(wall)) contacts++;
      if (world.residentSense.forwardTouch) forwardBeforeAblation++;
      if (cut) world.residentSense.forwardTouch = false;
    }
    return { recoveries: world.residentControl.recoveries,
      contacts, forwardBeforeAblation };
  };
  const intact = run(false), cut = run(true);
  assert(intact.recoveries > 0 && cut.recoveries === 0,
    "directional law ignored or hallucinated its private tactile input");
  assert(intact.contacts > 0 && cut.contacts > 0 &&
    intact.forwardBeforeAblation > 0 && cut.forwardBeforeAblation > 0,
    "World contact was lost by private sensor intervention");
  return "intact recovered=" + intact.recoveries +
    ", sensory-cut recovered=" + cut.recoveries +
    ", both had World collision and forward-normal measurements";
});

await observation("lateral-touch-orientation-survey", world => {
  world.setResidentProfile({ ...world.residentProfile, acceleration: 0.45 });
  world.authorRect({ kind: "wall", cx: 17.5, cy: 12.13,
    width: 10, height: 0.45 });
  world.setResidentMode("directional-recovery");
  let anyTouch = 0, forwardTouch = 0, lowProgress = 0, recoveries = 0;
  for (let i = 0; i < 110; i++) {
    world.step(still);
    const sensor = world.residentSense;
    if (sensor.touch) anyTouch++;
    if (sensor.forwardTouch) forwardTouch++;
    if (sensor.progressAlongIntent !== null &&
        sensor.progressAlongIntent < world.residentProfile.maxSpeed * .12)
      lowProgress++;
  }
  recoveries = world.residentControl.recoveries;
  finite(world, "lateral fixture");
  return "any touch=" + anyTouch + " frames, forward touch=" + forwardTouch +
    ", low-progress=" + lowProgress +
    ", backoffs=" + recoveries +
    "; geometry-specific observation, not validated universal side-contact classification";
});

await trial("same-lateral-wall-old-touch-reverses-new-directional-does-not", world => {
  world.setResidentProfile({ ...world.residentProfile, acceleration: 0.45 });
  const wall = world.authorRect({ kind: "wall", cx: 17.5, cy: 12.13,
    width: 10, height: 0.45 });
  const run = mode => {
    world.reset();
    world.setResidentMode(mode);
    const trace = [];
    for (let tick = 1; tick <= 110; tick++) {
      world.step(still);
      const sense = world.residentSense;
      const report = world.lastCausalObservations.get("resident");
      const body = at(world, "resident");
      trace.push({ tick, x: body.position.x,
        demand: report.intendedVelocity.x, touch: sense.touch,
        forwardTouch: sense.forwardTouch, recoveries: world.residentControl.recoveries,
        wallContact: report.contacts.includes(wall) });
    }
    finite(world, "lateral AB " + mode);
    return trace;
  };
  const old = run("tactile-recovery");
  const improved = run("directional-recovery");
  assert(old.some(x => x.recoveries > 0),
    "control any-touch law did not produce hypothesized false recovery");
  assert(improved.every(x => x.recoveries === 0),
    "directional law still falsely classified lateral touch as blockage");
  assert(old.some(x => x.wallContact) && improved.some(x => x.wallContact) &&
    improved.every(x => !x.forwardTouch),
    "lateral control fixture did not generate contact without forward normal");
  const firstDemand = old.find((x,i) => x.demand !== improved[i].demand)?.tick;
  const firstWorldDifference = old.find((x,i) => Math.abs(x.x - improved[i].x) > 1e-7)?.tick;
  assert(firstDemand && firstWorldDifference && firstWorldDifference >= firstDemand,
    "behavior diverged before changed local motor law");
  return "any-touch false backoffs=" + old.at(-1).recoveries +
    "; directional false backoffs=" + improved.at(-1).recoveries +
    "; first command/body divergence=" + firstDemand + "/" +
    firstWorldDifference + "; both touched same side wall";
});

await trial("live-third-actor-entry-changes-others-only-after-real-contact", world => {
  const run = insert => {
    world.setPeerEnabled(true);
    world.setPeerMass(30);
    world.setBraceEnabled(false);
    world.reset();
    const snapshots = [];
    for (let tick = 1; tick <= 220; tick++) {
      if (tick === 20 && insert) world.setBraceEnabled(true);
      world.step(still);
      const res = at(world, "resident");
      const peer = at(world, "peer");
      const obsA = world.lastCausalObservations.get("resident");
      const obsB = world.lastCausalObservations.get("peer");
      snapshots.push({
        tick, ax: res.position.x, bx: peer.position.x,
        av: res.velocity.x, bv: peer.velocity.x,
        amotor: obsA.intendedVelocity.x, bmotor: obsB.intendedVelocity.x,
        braceTouch: obsA.contacts.includes("brace") ||
          obsB.contacts.includes("brace")
      });
    }
    finite(world, "live 3rd actor arrival");
    return snapshots;
  };
  const alone = run(false);
  const inserted = run(true);
  const firstTouch = inserted.find(x => x.braceTouch)?.tick;
  let firstAnyDiff = null;
  for (let i = 0; i < alone.length; i++) {
    const a = alone[i], b = inserted[i];
    if (firstAnyDiff === null &&
      ["ax", "bx", "av", "bv", "amotor", "bmotor"].some(
        key => Math.abs(a[key] - b[key]) > 1e-7
      )) firstAnyDiff = i + 1;
  }
  assert(firstTouch && firstAnyDiff,
    "live participant insertion did not enter physical causal graph");
  assert(firstTouch >= 20 && firstAnyDiff >= firstTouch,
    "adding a body changed other trajectories before it physically touched them");
  assert(alone.slice(0, 19).every((frame, i) =>
    frame.ax === inserted[i].ax && frame.bx === inserted[i].bx &&
    frame.amotor === inserted[i].amotor &&
    frame.bmotor === inserted[i].bmotor),
    "live third-body addition retroactively altered earlier physics");
  return "holder inserted t=20; first contact t=" + firstTouch +
    "; first other-body motor/material difference t=" + firstAnyDiff;
});

await observation("remove-holder-during-live-encounter-survey", world => {
  world.setPeerEnabled(true);
  world.setPeerMass(30);
  world.setBraceProfile({ mass: 120, braking: 30 });
  world.setBraceEnabled(true);
  world.reset();
  let contactsBefore = 0, ghostAfter = 0, removedAt = 90;
  const beforeBodies = world.snapshot().entities.length;
  for (let tick = 1; tick <= 220; tick++) {
    if (tick === removedAt) {
      world.setBraceEnabled(false);
      if (world.entities.has("brace")) throw Error("holder body still in World");
    }
    world.step(still);
    const res = world.lastCausalObservations.get("resident");
    const peer = world.lastCausalObservations.get("peer");
    if (tick < removedAt &&
      (res.contacts.includes("brace") || peer.contacts.includes("brace")))
      contactsBefore++;
    if (tick >= removedAt &&
      (res.contacts.includes("brace") || peer.contacts.includes("brace")))
      ghostAfter++;
  }
  finite(world, "holder removal while pressured");
  assert(beforeBodies === 7 && world.snapshot().entities.length === 6 &&
    contactsBefore > 0 && ghostAfter === 0,
    "removal failed physically or left ghost contact history");
  return "holder removed at t=90; contacts before=" + contactsBefore +
    "; ghost contacts after=" + ghostAfter + "; remaining bodies=6";
});

try {
  const side = document.querySelector("#fixture-side-touch");
  const pressure = document.querySelector("#fixture-pressure-chain");
  const pause = document.querySelector("#pause-simulation");
  const step = document.querySelector("#single-step");
  const mode = document.querySelector("#resident-mode");
  const feedback = document.querySelector("#fixture-feedback");
  const residentStatus = document.querySelector("#resident-status");
  assert(side && pressure && pause && step && mode && feedback && residentStatus,
    "A/B fixture controls absent in real emitted DOM");
  side.click();
  assert(document.body.dataset.experimentFixture === "side" &&
    document.body.dataset.simulationPaused === "true" &&
    feedback.textContent.includes("lateral surface") &&
    document.querySelector('[data-resident-profile="acceleration"]').value === "0.45",
    "side-contact fixture failed to author and pause editable scene");
  for (let i = 0; i < 20; i++) step.click();
  assert(residentStatus.textContent.includes("recovery count 1"),
    "actual any-touch preset failed to reproduce false backoff");
  mode.value = "directional-recovery";
  mode.dispatchEvent(new Event("change", { bubbles: true }));
  document.querySelector("#reset-world").click();
  for (let i = 0; i < 20; i++) step.click();
  assert(residentStatus.textContent.includes("recovery count 0"),
    "actual directional preset still backed off from same lateral wall");
  pressure.click();
  assert(document.body.dataset.experimentFixture === "pressure" &&
    document.body.dataset.activeBodies === "7" &&
    document.body.dataset.simulationPaused === "true" &&
    document.querySelector("#toggle-peer").getAttribute("aria-pressed") === "true" &&
    document.querySelector("#toggle-brace").getAttribute("aria-pressed") === "true",
    "pressure fixture did not reset onto real editable 3-body World");
  pause.click();
  cases.push({ name: "live-ui-one-click-physical-ab-fixtures", status: "PASS",
    detail: "20-step sidewall any-touch=1 vs directional=0 backoffs; pressure fixture 7 bodies, paused" });
} catch (error) {
  cases.push({ name: "live-ui-one-click-physical-ab-fixtures", status: "FAIL",
    detail: String(error?.message ?? error).slice(0, 300) });
}
const failed = cases.filter((c) => c.status === "FAIL");
document.body.dataset.pressureProbe = failed.length ? "fail" : "pass";
document.body.dataset.pressureCaseCount = String(cases.length);
document.body.dataset.pressureFailureCount = String(failed.length);
document.body.dataset.pressureFailure = failed.map((c) => c.name + ": " + c.detail).join(" | ").slice(0, 1000);
const node = document.createElement("pre");
node.id = "pressure-report";
node.hidden = true;
node.textContent = cases.map((c) => c.status + " " + c.name + " — " + c.detail).join("\n");
document.body.append(node);
console.log("Material Agency Yard pressure probe", cases);
