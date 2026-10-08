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
