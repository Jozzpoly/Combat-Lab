import { DEFAULT_PROFILE, DEFAULT_RESIDENT_PROFILE, FIXED_DT, MaterialWorld } from "./material-world.js";

const canvas = document.querySelector("#lab");
const ctx = canvas.getContext("2d");
const summary = document.querySelector("#runtime-summary");
const selectedReadout = document.querySelector("#selected-readout");
const causalReadout = document.querySelector("#causal-readout");
const profileFeedback = document.querySelector("#profile-feedback");
const worldEditFeedback = document.querySelector("#world-edit-feedback");
const boxMassInput = document.querySelector("#author-mass");
const residentModeSelect = document.querySelector("#resident-mode");
const residentStatus = document.querySelector("#resident-status");
const peerStatus = document.querySelector("#peer-status");
const togglePeer = document.querySelector("#toggle-peer");
const focusPeer = document.querySelector("#focus-peer");
const peerMassField = document.querySelector("#peer-mass");
const peerModeSelect = document.querySelector("#peer-mode");
const peerMassFeedback = document.querySelector("#peer-mass-feedback");
const toggleBrace = document.querySelector("#toggle-brace");
const focusBrace = document.querySelector("#focus-brace");
const braceMassInput = document.querySelector("#brace-mass");
const braceBrakingInput = document.querySelector("#brace-braking");
const braceFeedback = document.querySelector("#brace-profile-feedback");
const braceStatus = document.querySelector("#brace-status");
const contactOverlayInput = document.querySelector("#contact-overlay");
const contactOverlaySummary = document.querySelector("#contact-overlay-summary");
const residentProfileFeedback = document.querySelector("#resident-profile-feedback");
const interventionTimeline = document.querySelector("#intervention-timeline");

const camera = {
  center: { x: 12, y: 7 },
  zoom: 52,
  minZoom: 18,
  maxZoom: 220,
  follow: true,
  followTarget: "player"
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
let simulationPaused = false;
const pauseButton = document.querySelector("#pause-simulation");
const stepButton = document.querySelector("#single-step");
const simulationControlStatus = document.querySelector("#simulation-control-status");

function updateSimulationControl() {
  pauseButton.textContent = simulationPaused ? "Resume simulation (Space)" : "Pause simulation (Space)";
  pauseButton.setAttribute("aria-pressed", String(simulationPaused));
  stepButton.disabled = !simulationPaused;
  document.body.dataset.simulationPaused = String(simulationPaused);
  simulationControlStatus.textContent = simulationPaused ?
    "Paused. Edit matter without advancing physics; single-step to inspect the response." :
    "Running. Live edits immediately affect subsequent physics steps.";
}
function setSimulationPaused(next) {
  simulationPaused = next;
  accumulator = 0;
  previous = performance.now();
  updateSimulationControl();
}
pauseButton.addEventListener("click", () => setSimulationPaused(!simulationPaused));
stepButton.addEventListener("click", () => {
  if (!simulationPaused) return;
  lastStep = world.step(movementInput());
  completedPhysicsSteps += 1;
  document.body.dataset.physicsSteps = String(completedPhysicsSteps);
  render();
});
updateSimulationControl();

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
  if (event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLSelectElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLButtonElement) return;
  if (event.code === "Space") {
    event.preventDefault();
    if (!event.repeat) setSimulationPaused(!simulationPaused);
    return;
  }
  if (event.code === "Period") {
    if (simulationPaused && !event.repeat) {
      event.preventDefault();
      stepButton.click();
    }
    return;
  }
  input.keys.add(event.code);
  if (event.code === "KeyF") {
    camera.follow = true;
    camera.followTarget = "player";
  }
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

function syncResidentProfileFields(profile) {
  for (const field of document.querySelectorAll("[data-resident-profile]")) {
    field.value = String(profile[field.dataset.residentProfile]);
  }
}
for (const field of document.querySelectorAll("[data-resident-profile]")) {
  field.addEventListener("change", () => {
    const next = { ...world.residentProfile };
    for (const inputEl of document.querySelectorAll("[data-resident-profile]")) {
      next[inputEl.dataset.residentProfile] = Number(inputEl.value);
    }
    try {
      world.setResidentProfile(next);
      syncResidentProfileFields(world.residentProfile);
      residentProfileFeedback.textContent = "";
    } catch (error) {
      syncResidentProfileFields(world.residentProfile);
      residentProfileFeedback.textContent =
        "Not applied: " + String(error?.message ?? error);
    }
  });
}
document.querySelector("#restore-resident-body").addEventListener("click", () => {
  world.setResidentProfile(DEFAULT_RESIDENT_PROFILE);
  syncResidentProfileFields(world.residentProfile);
  residentProfileFeedback.textContent = "";
});

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
residentModeSelect.value = world.residentMode;
residentModeSelect.addEventListener("change", () => {
  world.setResidentMode(residentModeSelect.value);
});
document.querySelector("#focus-resident").addEventListener("click", () => {
  camera.follow = true;
  camera.followTarget = "resident";
  world.selectedId = "resident";
});
document.querySelector("#focus-player").addEventListener("click", () => {
  camera.follow = true;
  camera.followTarget = "player";
  world.selectedId = "player";
});
function refreshPeerControls() {
  togglePeer.textContent = world.peerEnabled ? "Remove second body" :
    "Add counter-moving body";
  togglePeer.setAttribute("aria-pressed", String(world.peerEnabled));
  focusPeer.disabled = !world.peerEnabled;
  if (!world.peerEnabled && camera.followTarget === "peer") {
    camera.followTarget = "resident";
    camera.follow = true;
  }
}
togglePeer.addEventListener("click", () => {
  world.setPeerEnabled(!world.peerEnabled);
  refreshPeerControls();
});
focusPeer.addEventListener("click", () => {
  if (!world.peerEnabled) return;
  camera.followTarget = "peer";
  camera.follow = true;
  world.selectedId = "peer";
});
function refreshBraceControls() {
  toggleBrace.textContent = world.braceEnabled ?
    "Remove holding body" : "Add holding body";
  toggleBrace.setAttribute("aria-pressed", String(world.braceEnabled));
  focusBrace.disabled = !world.braceEnabled;
  if (!world.braceEnabled && camera.followTarget === "brace") {
    camera.followTarget = world.peerEnabled ? "peer" : "resident";
    camera.follow = true;
  }
}
toggleBrace.addEventListener("click", () => {
  world.setBraceEnabled(!world.braceEnabled);
  refreshBraceControls();
});
focusBrace.addEventListener("click", () => {
  if (!world.braceEnabled) return;
  camera.follow = true;
  camera.followTarget = "brace";
  world.selectedId = "brace";
});
function applyBraceFields() {
  try {
    world.setBraceProfile({
      mass: Number(braceMassInput.value),
      braking: Number(braceBrakingInput.value)
    });
    braceMassInput.value = String(world.braceMass);
    braceBrakingInput.value = String(world.braceBraking);
    braceFeedback.textContent = "";
  } catch (error) {
    braceMassInput.value = String(world.braceMass);
    braceBrakingInput.value = String(world.braceBraking);
    braceFeedback.textContent = "Not applied: " + String(error?.message ?? error);
  }
}
braceMassInput.addEventListener("change", applyBraceFields);
braceBrakingInput.addEventListener("change", applyBraceFields);
refreshBraceControls();
peerModeSelect.value = world.peerMode;
peerModeSelect.addEventListener("change", () => {
  world.setPeerMode(peerModeSelect.value);
});
peerMassField.addEventListener("change", () => {
  try {
    world.setPeerMass(Number(peerMassField.value));
    peerMassField.value = String(world.peerMass);
    peerMassFeedback.textContent = "";
  } catch (error) {
    peerMassField.value = String(world.peerMass);
    peerMassFeedback.textContent = "Not applied: " + String(error?.message ?? error);
  }
});
refreshPeerControls();
document.querySelector("#undo-edit").addEventListener("click", () => {
  worldEditFeedback.textContent = world.undoAuthored() ? "Last authored shape removed." :
    "No authored shape to remove.";
});
document.querySelector("#clear-edits").addEventListener("click", () => {
  const count = world.clearAuthored();
  worldEditFeedback.textContent = "Removed " + count + " authored shape(s).";
});

const fixtureFeedback = document.querySelector("#fixture-feedback");
function loadFixture(kind) {
  // Explicit reset, never a background re-authoring operation. Every
  // post-seed shape remains live-editable with the existing canvas tools.
  world.clearAuthored();
  world.setPeerEnabled(false);
  world.setBraceEnabled(false);
  world.setPeerMass(210);
  world.setBraceProfile({ mass: 120, braking: 30 });
  world.setResidentProfile(DEFAULT_RESIDENT_PROFILE);
  world.setResidentMode("tactile-recovery");
  world.setPeerMode("tactile-recovery");
  if (kind === "pressure") {
    world.setPeerMass(30);
    world.setPeerEnabled(true);
    world.setBraceEnabled(true);
    world.reset();
    fixtureFeedback.textContent =
      "3-body pressure: resident 72kg, opposing body 30kg, holder 120kg / braking 30. " +
      "Try changing holder braking to zero, then Reset world for an A/B.";
  } else if (kind === "side") {
    world.setResidentProfile({ ...DEFAULT_RESIDENT_PROFILE, acceleration: 0.45 });
    world.reset();
    world.authorRect({ kind: "wall", cx: 17.5, cy: 12.13,
      width: 10, height: 0.45 });
    fixtureFeedback.textContent =
      "Side-contact: slow drive against a lateral surface. Compare " +
      "any-touch vs forward-contact mode; Reset world between trials.";
  } else if (kind === "lateral") {
    world.setResidentMode("skirt-recovery");
    world.reset();
    world.authorRect({ kind: "wall", cx: 16.8, cy: 11.4,
      width: 0.7, height: 1.4 });
    fixtureFeedback.textContent =
      "Finite post in front of the resident. Compare forward-touch reversal " +
      "against lateral detour, then increase the wall height to challenge clearance. " +
      "Reset world between policies.";
  } else {
    throw new Error("unrecognized experiment fixture");
  }
  residentModeSelect.value = world.residentMode;
  peerModeSelect.value = world.peerMode;
  syncResidentProfileFields(world.residentProfile);
  peerMassField.value = String(world.peerMass);
  braceMassInput.value = String(world.braceMass);
  braceBrakingInput.value = String(world.braceBraking);
  refreshPeerControls();
  refreshBraceControls();
  camera.follow = true;
  camera.followTarget = "resident";
  world.selectedId = "resident";
  document.body.dataset.experimentFixture = kind;
  setSimulationPaused(true);
  render();
}
document.querySelector("#fixture-pressure-chain").addEventListener(
  "click", () => loadFixture("pressure"));
document.querySelector("#fixture-side-touch").addEventListener(
  "click", () => loadFixture("side"));
document.querySelector("#fixture-lateral-gap").addEventListener(
  "click", () => loadFixture("lateral"));

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

  // The graph belongs to the experimenter's presentation layer: draw
  // only reciprocal Rapier contact pairs, never inferred affiliation,
  // intention, or knowledge attributed to the organisms.
  const links = [];
  if (contactOverlayInput.checked) {
    const byId = new Map(snapshot.entities.map(entity => [entity.id, entity]));
    const contacts = new Map(snapshot.entities.map(entity => [
      entity.id, new Set(world.contactsFor(entity.id))
    ]));
    for (const entity of snapshot.entities) {
      for (const peerId of contacts.get(entity.id)) {
        if (entity.id >= peerId) continue;
        const other = byId.get(peerId);
        if (other && contacts.get(peerId)?.has(entity.id)) links.push([entity, other]);
      }
    }
  }
  contactOverlaySummary.textContent = contactOverlayInput.checked ?
    "Live body pairs: " + links.length + " (Rapier contact observations)" :
    "Contact overlay off.";
  document.body.dataset.liveBodyContactPairs = String(links.length);
  if (contactOverlayInput.checked) {
    ctx.save();
    ctx.strokeStyle = "rgba(247,202,111,.9)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    for (const [a, b] of links) {
      const start = worldToScreen(a.position);
      const end = worldToScreen(b.position);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc((start.x + end.x) / 2, (start.y + end.y) / 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#f7ca6f";
      ctx.fill();
    }
    ctx.restore();
  }

  const selectedBodyState = world.selectedSnapshot();
  const observedMotorId = selectedBodyState?.observedMotor ? selectedBodyState.id :
    (snapshot.grip ? "player" : null);
  const selectedEntity = snapshot.entities.find((entity) => entity.id === observedMotorId);
  const selectedCausality = observedMotorId ?
    world.lastCausalObservations.get(observedMotorId) : null;
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

  // Grip selection belongs to the object, but the reciprocal motor/reaction
  // trace belongs to the gripping player. Never conceal that authority split.
  const motor = selected?.observedMotor ??
    (snapshot.grip ? world.lastCausalObservations.get("player") : null);
  if (motor) {
    const speed = (v) => Math.hypot(v.x, v.y).toFixed(2);
    const impulse = Math.hypot(motor.motorImpulse.x, motor.motorImpulse.y).toFixed(2);
    causalReadout.textContent =
      "driven: " + (observedMotorId ?? selected.id) +
        (snapshot.grip && observedMotorId === "player" ?
          " (gripping " + snapshot.grip.entityId + ")" : "") + "\n" +
      "intended speed: " + speed(motor.intendedVelocity) + " m/s\n" +
      "realized step travel: " + speed(motor.measuredVelocity) + " m/s\n" +
      "applied motor impulse: " + impulse + " N·s\n" +
      "grip reaction on player: " + speed(motor.gripReactionImpulse) + " N·s\n" +
      "progress on intended axis: " +
        (motor.progressAlongIntent === null ? "no requested movement" :
          motor.progressAlongIntent.toFixed(2) + " m/s") + "\n" +
      "co-observed contacts: " +
        (motor.contacts.length ? motor.contacts.join(", ") : "none") + "\n" +
      "No physical-cause inference is made from this snapshot." +
      (selected?.localControl ?
        "\nlocal controller: " + selected.localControl.mode +
        " / " + selected.localControl.state +
        " / recoveries=" + selected.localControl.recoveries : "");
  } else {
    causalReadout.textContent = selected ?
      "No own motor trace for this body. It may still receive contact/grip impulses." :
      "No selected body.";
  }

  interventionTimeline.textContent = snapshot.interventionEvents.slice(-10)
    .map((event) => "t" + event.tick + " " + event.type + " — " + event.note)
    .join("\n") || "No research events in current run.";

  braceStatus.textContent = snapshot.braceEnabled ?
    "Holder: " + snapshot.braceMass + " kg, finite braking " +
    snapshot.braceBraking + " m/s² · not a static obstacle" :
    "Third role disabled. Existing two-body control remains available.";

  peerStatus.textContent = snapshot.peerControl ?
    "Second body: " + snapshot.peerMass + " kg · " +
      snapshot.peerControl.mode + " · local state " +
      snapshot.peerControl.state + " · recoveries " +
      snapshot.peerControl.recoveries + " · travel " +
      snapshot.peerControl.estimatedX.toFixed(2) + "m" :
    "Second body absent. The original one-resident control remains available.";

  residentStatus.textContent =
    "local state: " + snapshot.residentControl.state +
    " · local travel " + snapshot.residentControl.estimatedX.toFixed(2) + "m" +
    " · lateral " + snapshot.residentControl.estimatedY.toFixed(2) + "m" +
    " · detours " + snapshot.residentControl.skirts +
    " · obstruction evidence " + snapshot.residentControl.blockedTicks + "/12 steps" +
    " · recovery count " + snapshot.residentControl.recoveries +
    (snapshot.residentControl.lastTransition ?
      " · last transition at physical step " +
        snapshot.residentControl.lastTransition.tick : "");

  summary.textContent =
    "bodies " + snapshot.entities.length +
    " · authored " + snapshot.authoredCount +
    " · physics " + lastStep.stepMs.toFixed(2) + " ms" +
    " · zoom " + camera.zoom.toFixed(0) + " px/m" +
    (camera.follow ? " · follow " + camera.followTarget : " · free camera") +
    (simulationPaused ? " · PAUSED" : "");

  document.body.dataset.activeBodies = String(snapshot.entities.length);
}

function frame(now) {
  let elapsed = Math.min(0.1, (now - previous) / 1000);
  previous = now;
  if (!simulationPaused) accumulator += elapsed;

  while (!simulationPaused && accumulator >= FIXED_DT) {
    lastStep = world.step(movementInput());
    completedPhysicsSteps += 1;
    accumulator -= FIXED_DT;
  }

  if (camera.follow) {
    const subject = world.entities.get(camera.followTarget);
    if (subject) {
      const p = subject.body.translation();
      camera.center.x = p.x;
      camera.center.y = p.y;
    }
  }

  render();
  requestAnimationFrame(frame);
}

// A headless DOM capture can precede the first requestAnimationFrame.
// Expose the already-created physics bodies at bootstrap; do not claim any
// physical step before it has actually run. Browser pressure separately
// exercises explicit Rapier steps.
document.body.dataset.activeBodies = String(world.snapshot().entities.length);
document.body.dataset.physicsSteps = String(completedPhysicsSteps);
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
