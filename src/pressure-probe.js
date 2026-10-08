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
  const begin = performance.now();
  try {
    world = await MaterialWorld.create();
    const detail = await fn(world);
    cases.push({ name, status: "PASS", detail: detail ?? "", ms: +(performance.now() - begin).toFixed(1) });
  } catch (error) {
    cases.push({ name, status: "FAIL", detail: String(error?.message ?? error).slice(0, 300),
      ms: +(performance.now() - begin).toFixed(1) });
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
  let worstMs = 0;
  for (let i = 0; i < 100; i++) {
    const result = world.step(i % 40 < 20 ? right : still);
    worstMs = Math.max(worstMs, result.stepMs);
    if (i % 20 === 0) finite(world, "overlap tick " + i);
  }
  finite(world, "overlap final");
  assert(world.snapshot().entities.length === 37, "objects silently despawned");
  return "37 bodies; max step " + worstMs.toFixed(1) + "ms (diagnostic only)";
});

await trial("zero-motor-authority-is-authorable", (world) => {
  world.setPlayerProfile({ ...world.profile, acceleration: 0, braking: 0,
    maxSpeed: 0, gripForce: 0 });
  const p = world.profile;
  assert(p.acceleration === 0 && p.braking === 0 && p.maxSpeed === 0 && p.gripForce === 0,
    "zero authority silently replaced: " + JSON.stringify(p));
  return "zero motor and grip authority retained";
});

const failed = cases.filter((c) => c.status === "FAIL");
document.body.dataset.pressureProbe = failed.length ? "fail" : "pass";
document.body.dataset.pressureCaseCount = String(cases.length);
document.body.dataset.pressureFailureCount = String(failed.length);
document.body.dataset.pressureFailure = failed.map((c) => c.name + ": " + c.detail).join(" | ").slice(0, 1000);
const node = document.createElement("pre");
node.id = "pressure-report";
node.hidden = true;
node.textContent = cases.map((c) => c.status + " " + c.name + " — " + c.detail + " (" + c.ms + "ms)").join("\n");
document.body.append(node);
console.log("Material Agency Yard pressure probe", cases);
