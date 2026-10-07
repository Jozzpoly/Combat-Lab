import { DEFAULT_PROFILE, FIXED_DT, MaterialWorld } from "./material-world.js";

const canvas = document.querySelector("#lab");
const ctx = canvas.getContext("2d");
const summary = document.querySelector("#runtime-summary");
const selectedReadout = document.querySelector("#selected-readout");

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
  dragStart: null,
  cameraStart: null,
  pointer: { x: 0, y: 0 }
};

const world = await MaterialWorld.create();
let accumulator = 0;
let previous = performance.now();
let lastStep = { desiredVelocity: { x: 0, y: 0 }, stepMs: 0 };

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
});
canvas.addEventListener("pointercancel", () => {
  input.draggingCamera = false;
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
      world.setPlayerProfile(next);
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
});
document.querySelector("#reset-world").addEventListener("click", () => world.reset());
document.querySelector("#spawn-light").addEventListener("click", () => world.spawnCrate("light"));
document.querySelector("#spawn-heavy").addEventListener("click", () => world.spawnCrate("heavy"));

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

  summary.textContent =
    "bodies " + snapshot.entities.length +
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
