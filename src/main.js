import { DEFAULT_PROFILE, FIXED_DT, MaterialWorld } from "./material-world.js";

const canvas = document.querySelector("#lab");
const ctx = canvas.getContext("2d");
const summary = document.querySelector("#runtime-summary");
const selectedReadout = document.querySelector("#selected-readout");
const causalReadout = document.querySelector("#causal-readout");
const profileFeedback = document.querySelector("#profile-feedback");
const worldEditFeedback = document.querySelector("#world-edit-feedback");
const boxMassInput = document.querySelector("#author-mass");

const camera = {
  center: { x: 12, y: 7 },
  zoom: 52,
  minZoom: 18,
  maxZoom: 220,
  follow: true
};

const input = {
  keys: new Set(),
  draggingCamera: false,
  drawing: null,
  dragStart: null,
  cameraStart: null,
  pointer: { x: 0, y: 0 }
};

const world = await MaterialWorld.create();
let accumulator = 0;
let previous = performance.now();
let lastStep = { desiredVelocity: { x: 0, y: 0 }, stepMs: 0 };
let completedPhysicsSteps = 0;

function resize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
new ResizeObserver(resize).observe(canvas);
resize();

function canvasSize() {
  const rect = canvas.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

function screenToWorld(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const size = canvasSize();
  return {
    x: camera.center.x + (clientX - rect.left - size.width / 2) / camera.zoom,
    y: camera.center.y + (clientY - rect.top - size.height / 2) / camera.zoom
  };
}

function worldToScreen(point) {
  const size = canvasSize();
  return {
    x: size.width / 2 + (point.x - camera.center.x) * camera.zoom,
    y: size.height / 2 + (point.y - camera.center.y) * camera.zoom
  };
}

function movementInput() {
  return {
    x: (input.keys.has("KeyD") || input.keys.has("ArrowRight") ? 1 : 0) -
       (input.keys.has("KeyA") || input.keys.has("ArrowLeft") ? 1 : 0),
    y: (input.keys.has("KeyS") || input.keys.has("ArrowDown") ? 1 : 0) -
       (input.keys.has("KeyW") || input.keys.has("ArrowUp") ? 1 : 0)
  };
}

window.addEventListener("keydown", (event) => {
  if (event.target instanceof HTMLInputElement) return;
  input.keys.add(event.code);
  if (event.code === "KeyF") camera.follow = true;
});
window.addEventListener("keyup", (event) => input.keys.delete(event.code));
window.addEventListener("blur", () => input.keys.clear());

canvas.addEventListener("contextmenu", (event) => event.preventDefault());
canvas.addEventListener("pointermove", (event) => {
  input.pointer = screenToWorld(event.clientX, event.clientY);
  if (input.drawing) input.drawing.end = { ...input.pointer };
  if (input.draggingCamera && input.dragStart) {
    const dx = (event.clientX - input.dragStart.x) / camera.zoom;
    const dy = (event.clientY - input.dragStart.y) / camera.zoom;
    camera.center.x = input.cameraStart.x - dx;
    camera.center.y = input.cameraStart.y - dy;
    camera.follow = false;
  }
  world.setGripTarget(input.pointer);
});
canvas.addEventListener("pointerdown", (event) => {
  const point = screenToWorld(event.clientX, event.clientY);
  input.pointer = point;
  if (event.button === 0 && (event.ctrlKey || event.shiftKey)) {
    input.drawing = {
      kind: event.ctrlKey ? "wall" : "object",
      start: { ...point }, end: { ...point }, pointerId: event.pointerId
    };
    canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
    return;
  }
  if (event.button === 1) {
    input.draggingCamera = true;
    input.dragStart = { x: event.clientX, y: event.clientY };
    input.cameraStart = { ...camera.center };
    canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
    return;
  }
  if (event.button === 2) {
    world.beginGrip(point);
    canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
    return;
  }
  if (event.button === 0) world.selectAt(point);
});
canvas.addEventListener("pointerup", (event) => {
  if (event.button === 1) input.draggingCamera = false;
  if (event.button === 2) world.endGrip();
  if (input.drawing && event.pointerId === input.drawing.pointerId) {
    const draft = input.drawing;
    input.drawing = null;
    const cx = (draft.start.x + draft.end.x) / 2;
    const cy = (draft.start.y + draft.end.y) / 2;
    const width = Math.abs(draft.end.x - draft.start.x);
    const height = Math.abs(draft.end.y - draft.start.y);
    try {
      const id = world.authorRect({
        kind: draft.kind, cx, cy, width, height, mass: Number(boxMassInput.value)
      });
      worldEditFeedback.textContent = "Added " + draft.kind + " " + id +
        " (" + width.toFixed(2) + " × " + height.toFixed(2) + " m)";
    } catch (error) {
      worldEditFeedback.textContent = "Not placed: " + String(error?.message ?? error);
    }
  }
});
canvas.addEventListener("pointercancel", () => {
  input.draggingCamera = false;
  input.drawing = null;
  world.endGrip();
});
canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  const before = screenToWorld(event.clientX, event.clientY);
  const factor = Math.exp(-event.deltaY * 0.0016);
  camera.zoom = Math.max(camera.minZoom, Math.min(camera.maxZoom, camera.zoom * factor));
  const after = screenToWorld(event.clientX, event.clientY);
  camera.center.x += before.x - after.x;
  camera.center.y += before.y - after.y;
}, { passive: false });

function bindProfileControls() {
  for (const inputEl of document.querySelectorAll("[data-profile]")) {
    inputEl.addEventListener("change", () => {
      const next = { ...world.profile };
      for (const field of document.querySelectorAll("[data-profile]")) {
        const key = field.dataset.profile;
        next[key] = Number(field.value);
      }
      try {
        world.setPlayerProfile(next);
        syncProfileFields(world.profile);
        profileFeedback.textContent = "";
      } catch (error) {
        // The authored reality must never silently differ from the visible form.
        syncProfileFields(world.profile);
        profileFeedback.textContent = "Not applied: " + String(error?.message ?? error);
      }
    });
  }
}
bindProfileControls();

function syncProfileFields(profile) {
  for (const field of document.querySelectorAll("[data-profile]")) {
    field.value = String(profile[field.dataset.profile]);
  }
}

document.querySelector("#restore-body").addEventListener("click", () => {
  syncProfileFields(DEFAULT_PROFILE);
  world.setPlayerProfile(DEFAULT_PROFILE);
  profileFeedback.textContent = "";
});
document.querySelector("#reset-world").addEventListener("click", () => {
  world.reset();
  worldEditFeedback.textContent = "Simulation reset; " + world.authoredShapes.length +
    " authored shape(s) restored.";
});
document.querySelector("#spawn-light").addEventListener("click", () => world.spawnCrate("light"));
document.querySelector("#spawn-heavy").addEventListener("click", () => world.spawnCrate("heavy"));
document.querySelector("#undo-edit").addEventListener("click", () => {
  worldEditFeedback.textContent = world.undoAuthored() ? "Last authored shape removed." :
    "No authored shape to remove.";
});
document.querySelector("#clear-edits").addEventListener("click", () => {
  const count = world.clearAuthored();
  worldEditFeedback.textContent = "Removed " + count + " authored shape(s).";
});

function drawStaticRect(item, selected) {
  const p = worldToScreen({ x: item.cx, y: item.cy });
  ctx.fillStyle = selected ? "#5d6873" : "#313a44";
  ctx.fillRect(
    p.x - item.width * camera.zoom / 2,
    p.y - item.height * camera.zoom / 2,
    item.width * camera.zoom,
    item.height * camera.zoom
  );
}

function drawCircle(entity, selected) {
  const p = worldToScreen(entity.position);
  const r = entity.radius * camera.zoom;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fillStyle = entity.color;
  ctx.fill();
  ctx.lineWidth = selected ? 3 : 1.5;
  ctx.strokeStyle = selected ? "#ffffff" : "rgba(255,255,255,.32)";
  ctx.stroke();

  const speed = Math.hypot(entity.velocity.x, entity.velocity.y);
  const angle = speed > 0.05 ? Math.atan2(entity.velocity.y, entity.velocity.x) : 0;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + Math.cos(angle) * r * 0.75, p.y + Math.sin(angle) * r * 0.75);
  ctx.strokeStyle = "rgba(10,16,22,.7)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawBox(entity, selected) {
  const p = worldToScreen(entity.position);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(entity.rotation);
  ctx.fillStyle = entity.color;
  ctx.fillRect(
    -entity.half.x * camera.zoom,
    -entity.half.y * camera.zoom,
    entity.half.x * 2 * camera.zoom,
    entity.half.y * 2 * camera.zoom
  );
  ctx.lineWidth = selected ? 3 : 1.5;
  ctx.strokeStyle = selected ? "#ffffff" : "rgba(255,255,255,.28)";
  ctx.strokeRect(
    -entity.half.x * camera.zoom,
    -entity.half.y * camera.zoom,
    entity.half.x * 2 * camera.zoom,
    entity.half.y * 2 * camera.zoom
  );
  ctx.restore();
}

function render() {
  const size = canvasSize();
  ctx.clearRect(0, 0, size.width, size.height);
  ctx.fillStyle = "#171d24";
  ctx.fillRect(0, 0, size.width, size.height);

  const snapshot = world.snapshot();
  document.body.dataset.physicsSteps = String(completedPhysicsSteps);

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.035)";
  ctx.lineWidth = 1;
  const grid = camera.zoom;
  const origin = worldToScreen({ x: 0, y: 0 });
  for (let x = origin.x % grid; x < size.width; x += grid) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size.height); ctx.stroke();
  }
  for (let y = origin.y % grid; y < size.height; y += grid) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size.width, y); ctx.stroke();
  }
  ctx.restore();

  for (const item of snapshot.staticRects) drawStaticRect(item, false);

  for (const entity of snapshot.entities) {
    const selected = entity.id === snapshot.selectedId;
    if (entity.shape === "circle") drawCircle(entity, selected);
    else drawBox(entity, selected);
  }

  const selectedEntity = snapshot.entities.find((entity) => entity.id === snapshot.selectedId);
  const selectedCausality = world.selectedSnapshot()?.observedMotor ?? null;
  if (selectedEntity && selectedCausality) {
    const anchor = worldToScreen(selectedEntity.position);
    for (const arrow of [
      { velocity: selectedCausality.intendedVelocity, color: "#73b7ff" },
      { velocity: selectedCausality.measuredVelocity, color: "#efca73" }
    ]) {
      const vx = arrow.velocity.x;
      const vy = arrow.velocity.y;
      const length = Math.hypot(vx, vy);
      if (length < 0.02) continue;
      const shown = Math.min(length, 3.2) * camera.zoom * 0.28;
      const ex = anchor.x + vx / length * shown;
      const ey = anchor.y + vy / length * shown;
      ctx.beginPath();
      ctx.moveTo(anchor.x, anchor.y);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = arrow.color;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ex, ey, 3, 0, Math.PI * 2);
      ctx.fillStyle = arrow.color;
      ctx.fill();
    }
  }

  if (input.drawing) {
    const a = worldToScreen(input.drawing.start);
    const b = worldToScreen(input.drawing.end);
    ctx.save();
    ctx.fillStyle = input.drawing.kind === "wall" ?
      "rgba(190,200,210,.24)" : "rgba(201,170,106,.24)";
    ctx.strokeStyle = input.drawing.kind === "wall" ? "#d7e2f0" : "#eed29a";
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 2;
    ctx.fillRect(Math.min(a.x, b.x), Math.min(a.y, b.y),
      Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    ctx.strokeRect(Math.min(a.x, b.x), Math.min(a.y, b.y),
      Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    ctx.restore();
  }

  if (snapshot.grip) {
    const a = worldToScreen(snapshot.grip.worldAnchor);
    const b = worldToScreen(snapshot.grip.target);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = "#d7ecff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#d7ecff";
    ctx.fill();
  }

  const selected = world.selectedSnapshot();
  if (selected) {
    selectedReadout.textContent =
      selected.id + "\n" +
      "kind " + selected.kind + "\n" +
      "mass " + selected.mass.toFixed(2) + "\n" +
      (selected.radius ? "radius " + selected.radius.toFixed(2) + "\n" : "") +
      "speed " + selected.speed.toFixed(2) + "\n" +
      "velocity " + selected.velocity.x.toFixed(2) + ", " + selected.velocity.y.toFixed(2) + "\n" +
      "contacts " + (selected.contacts.length ? selected.contacts.join(", ") : "none") + "\n" +
      (snapshot.grip ? "grip force " + snapshot.grip.force.toFixed(1) : "");
  }

  const motor = selected?.observedMotor ?? null;
  if (motor) {
    const speed = (v) => Math.hypot(v.x, v.y).toFixed(2);
    const impulse = Math.hypot(motor.motorImpulse.x, motor.motorImpulse.y).toFixed(2);
    causalReadout.textContent =
      "driven: " + selected.id + "\n" +
      "intended speed: " + speed(motor.intendedVelocity) + " m/s\n" +
      "realized step travel: " + speed(motor.measuredVelocity) + " m/s\n" +
      "applied motor impulse: " + impulse + " N·s\n" +
      "grip reaction on player: " + speed(motor.gripReactionImpulse) + " N·s\n" +
      "progress on intended axis: " +
        (motor.progressAlongIntent === null ? "no requested movement" :
          motor.progressAlongIntent.toFixed(2) + " m/s") + "\n" +
      "co-observed contacts: " +
        (motor.contacts.length ? motor.contacts.join(", ") : "none") + "\n" +
      "No physical-cause inference is made from this snapshot.";
  } else {
    causalReadout.textContent = selected ?
      "No own motor trace for this body. It may still receive contact/grip impulses." :
      "No selected body.";
  }

  summary.textContent =
    "bodies " + snapshot.entities.length +
    " · authored " + snapshot.authoredCount +
    " · physics " + lastStep.stepMs.toFixed(2) + " ms" +
    " · zoom " + camera.zoom.toFixed(0) + " px/m" +
    (camera.follow ? " · follow" : " · free camera");

  document.body.dataset.activeBodies = String(snapshot.entities.length);
}

function frame(now) {
  let elapsed = Math.min(0.1, (now - previous) / 1000);
  previous = now;
  accumulator += elapsed;

  while (accumulator >= FIXED_DT) {
    lastStep = world.step(movementInput());
    completedPhysicsSteps += 1;
    accumulator -= FIXED_DT;
  }

  if (camera.follow) {
    const p = world.player().body.translation();
    camera.center.x = p.x;
    camera.center.y = p.y;
  }

  render();
  requestAnimationFrame(frame);
}

document.body.dataset.combatLabReady = "true";
requestAnimationFrame(frame);

// Isolated internal pressure query; no change to normal Owner interaction.
// A cold headless browser exercises this exact emitted physics/runtime build.
if (new URLSearchParams(window.location.search).has("pressureProbe")) {
  document.body.dataset.pressureProbe = "running";
  import("./pressure-probe.js").catch((error) => {
    document.body.dataset.pressureProbe = "fail";
    document.body.dataset.pressureFailure = String(error?.message ?? error).slice(0, 500);
  });
}
