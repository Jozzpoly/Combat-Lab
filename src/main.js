import { DEFAULT_PROFILE, DEFAULT_RESIDENT_PROFILE, FIXED_DT, MaterialWorld } from "./material-world.js";
import { captureStartingScene, stageStartingScene, compareStartingScenes } from "./starting-scene.js";

const canvas = document.querySelector("#lab");
const ctx = canvas.getContext("2d");
const summary = document.querySelector("#runtime-summary");
const selectedReadout = document.querySelector("#selected-readout");
const causalReadout = document.querySelector("#causal-readout");
const profileFeedback = document.querySelector("#profile-feedback");
const worldEditFeedback = document.querySelector("#world-edit-feedback");
const boxMassInput = document.querySelector("#author-mass");
const residentModeSelect = document.querySelector("#resident-mode");
const residentSideSelect = document.querySelector("#resident-lateral-side");
const residentStatus = document.querySelector("#resident-status");
const peerStatus = document.querySelector("#peer-status");
const togglePeer = document.querySelector("#toggle-peer");
const focusPeer = document.querySelector("#focus-peer");
const peerMassField = document.querySelector("#peer-mass");
const peerModeSelect = document.querySelector("#peer-mode");
const peerSideSelect = document.querySelector("#peer-lateral-side");
const peerMassFeedback = document.querySelector("#peer-mass-feedback");
const toggleBrace = document.querySelector("#toggle-brace");
const focusBrace = document.querySelector("#focus-brace");
const braceMassInput = document.querySelector("#brace-mass");
const braceBrakingInput = document.querySelector("#brace-braking");
const braceFormSelect = document.querySelector("#brace-form");
const braceAngleInput = document.querySelector("#brace-angle");
const braceFeedback = document.querySelector("#brace-profile-feedback");
const braceStatus = document.querySelector("#brace-status");
const contactOverlayInput = document.querySelector("#contact-overlay");
const contactOverlaySummary = document.querySelector("#contact-overlay-summary");
const residentProfileFeedback = document.querySelector("#resident-profile-feedback");
const interventionTimeline = document.querySelector("#intervention-timeline");
const recipeTextarea = document.querySelector("#starting-scene-json");
const recipeFeedback = document.querySelector("#recipe-feedback");
const recipeExportButton = document.querySelector("#recipe-export");
const recipeCopyButton = document.querySelector("#recipe-copy");
const recipeImportButton = document.querySelector("#recipe-import");
const compareSubjectSelect = document.querySelector("#compare-subject");
const compareScenesButton = document.querySelector("#compare-scenes");
const compareReport = document.querySelector("#compare-report");
const comparePlot = document.querySelector("#compare-plot");

function renderPhysicalComparison(result) {
  const ctx = comparePlot.getContext("2d");
  const w = comparePlot.width, h = comparePlot.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#101820"; ctx.fillRect(0, 0, w, h);
  const values = [...result.traces.a, ...result.traces.b].map(p => p.x);
  let low = Math.min(...values), high = Math.max(...values);
  if (Math.abs(high-low) < 0.01) {low -= 0.5; high += 0.5;}
  const margin = { left: 50, right: 13, top: 16, bottom: 22 };
  const x = tick => margin.left +
    tick / result.steps * (w-margin.left-margin.right);
  const y = value => margin.top +
    (high-value)/(high-low)*(h-margin.top-margin.bottom);
  ctx.font = "12px system-ui";
  ctx.fillStyle = "#98a7b2";
  for (let i=0;i<=4;i++) {
    const val = low+(high-low)*i/4;
    const yy=y(val);
    ctx.strokeStyle = "rgba(255,255,255,.08)";
    ctx.beginPath();ctx.moveTo(margin.left,yy);ctx.lineTo(w-margin.right,yy);ctx.stroke();
    ctx.fillText(val.toFixed(1),5,yy+4);
  }
  for (const [path,color] of [
    [result.traces.a,"#d9c89a"], [result.traces.b,"#74dbed"]
  ]) {
    ctx.beginPath();
    path.forEach((p,i) => {
      if(i===0)ctx.moveTo(x(p.tick),y(p.x));
      else ctx.lineTo(x(p.tick),y(p.x));
    });
    ctx.lineWidth=2.3;
    ctx.strokeStyle=color;ctx.stroke();
  }
  ctx.fillStyle="#98a7b2";
  ctx.fillText("0",margin.left-4,h-5);
  ctx.fillText(String(result.steps)+" steps",w-90,h-5);
  comparePlot.dataset.tracedPoints=String(
    result.traces.a.length+result.traces.b.length);
}
const placeBodyButton = document.querySelector("#place-selected-at-cursor");
const restoreBodyStartsButton = document.querySelector("#restore-body-positions");
const bodyPositionFeedback = document.querySelector("#body-position-feedback");
const experimentImpulse = document.querySelector("#experiment-impulse");
const experimentImpulseMode = document.querySelector("#experiment-impulse-mode");
const pokeBodyButton = document.querySelector("#poke-selected-body");
const impulseFeedback = document.querySelector("#impulse-feedback");

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
  reposition: null,
  dragStart: null,
  cameraStart: null,
  pointer: { x: 0, y: 0 }
};

let world = await MaterialWorld.create();
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
  placeBodyButton.disabled = !simulationPaused;
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
  if (event.code === "Escape" && input.reposition) {
    event.preventDefault();
    input.reposition = null;
    bodyPositionFeedback.textContent = "Body move canceled; World unchanged.";
    render();
    return;
  }
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
  if (input.reposition) {
    const draft = input.reposition;
    draft.preview = {
      x: input.pointer.x + draft.offset.x,
      y: input.pointer.y + draft.offset.y
    };
    bodyPositionFeedback.textContent =
      "Previewing " + draft.id + " · release to commit, Esc to cancel.";
    render();
  }
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
  if (event.button === 0 && event.altKey) {
    if (!simulationPaused) {
      bodyPositionFeedback.textContent = "Pause simulation first to reposition a body.";
      return;
    }
    const selected = world.selectAt(point);
    if (!selected) {
      bodyPositionFeedback.textContent = "No physical body at this point.";
      return;
    }
    const start = selected.body.translation();
    input.reposition = {
      id: selected.id, pointerId: event.pointerId,
      offset: { x: start.x - point.x, y: start.y - point.y },
      preview: { x: start.x, y: start.y }
    };
    camera.follow = false;
    canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
    return;
  }
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
  if (input.reposition && event.pointerId === input.reposition.pointerId) {
    const draft = input.reposition;
    input.reposition = null;
    const pointer = screenToWorld(event.clientX, event.clientY);
    const position = world.repositionBody(draft.id, {
      x: pointer.x + draft.offset.x, y: pointer.y + draft.offset.y
    });
    bodyPositionFeedback.textContent = "Authored start of " + draft.id +
      " at (" + position.x.toFixed(2) + ", " + position.y.toFixed(2) +
      "). Reset reconstructs this scene.";
  }
  if (input.drawing && event.pointerId === input.drawing.pointerId) {
    const draft = input.drawing;
    draft.end = screenToWorld(event.clientX, event.clientY);
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
  if (input.reposition) {
    input.reposition = null;
    bodyPositionFeedback.textContent = "Body move canceled; World unchanged.";
  }
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
residentSideSelect.value = String(world.residentSidePreference);
residentSideSelect.addEventListener("change", () => {
  world.setActorSidePreference("resident", Number(residentSideSelect.value));
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
braceFormSelect.addEventListener("change", () => {
  try {
    world.setBraceForm(braceFormSelect.value);
    braceFeedback.textContent = "";
  } catch (error) {
    braceFormSelect.value = world.braceForm;
    braceFeedback.textContent = "Not applied: " + String(error?.message ?? error);
  }
});
braceAngleInput.addEventListener("change", () => {
  try {
    if (!braceAngleInput.value.trim()) throw new RangeError("enter holder angle");
    world.setBraceAngle(Number(braceAngleInput.value));
    braceAngleInput.value = String(world.braceAngle);
    braceFeedback.textContent = "";
  } catch (error) {
    braceAngleInput.value = String(world.braceAngle);
    braceFeedback.textContent = "Not applied: " + String(error?.message ?? error);
  }
});
refreshBraceControls();
peerModeSelect.value = world.peerMode;
peerModeSelect.addEventListener("change", () => {
  world.setPeerMode(peerModeSelect.value);
});
peerSideSelect.value = String(world.peerSidePreference);
peerSideSelect.addEventListener("change", () => {
  world.setActorSidePreference("peer", Number(peerSideSelect.value));
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

placeBodyButton.addEventListener("click", () => {
  if (!simulationPaused) return;
  const id = world.selectedId;
  if (!world.entities.has(id)) return;
  const p = world.repositionBody(id, input.pointer);
  bodyPositionFeedback.textContent =
    "Authored start of " + id + " at (" + p.x.toFixed(2) + ", " +
    p.y.toFixed(2) + "). Reset reconstructs this scene.";
  camera.follow = false;
  render();
});
pokeBodyButton.addEventListener("click", () => {
  const entity = world.entities.get(world.selectedId);
  if (!entity) return;
  try {
    const raw = experimentImpulse.value.trim();
    if (!raw) throw new RangeError("enter an impulse strength");
    const magnitude = Number(raw);
    if (!Number.isFinite(magnitude))
      throw new RangeError("impulse must be a finite signed number");
    const pos = entity.body.translation();
    const delta = {
      x: input.pointer.x - pos.x,
      y: input.pointer.y - pos.y
    };
    const length = Math.hypot(delta.x, delta.y);
    if (length < 0.00001)
      throw new RangeError("move cursor away from the body center");
    const tangential = experimentImpulseMode.value === "tangential";
    const unit = tangential ?
      { x: -delta.y / length, y: delta.x / length } :
      { x: delta.x / length, y: delta.y / length };
    const result = world.applyBodyImpulse(entity.id, {
      x: magnitude * unit.x,
      y: magnitude * unit.y
    }, tangential ? { atPoint: input.pointer } : {});
    impulseFeedback.textContent = "Applied " +
      (tangential ? "tangential off-center" : "center") +
      " impulse to " + entity.id + ": (" +
      result.x.toFixed(2) + ", " + result.y.toFixed(2) +
      ") N·s. Observe the next physical step.";
    render();
  } catch (error) {
    impulseFeedback.textContent =
      "Not applied: " + String(error?.message ?? error);
  }
});
restoreBodyStartsButton.addEventListener("click", () => {
  const count = world.clearBodyStartOverrides();
  world.reset();
  bodyPositionFeedback.textContent =
    "Restored original starts for " + count + " body placements; world reset.";
  render();
});

// Schema v1 is an ephemeral interchange experiment, not canonical World data.
recipeExportButton.addEventListener("click", () => {
  recipeTextarea.value = JSON.stringify(captureStartingScene(world), null, 2);
  recipeFeedback.textContent = "Captured authored starts and profiles only; runtime physics was not serialized.";
});
recipeCopyButton.addEventListener("click", async () => {
  if (!recipeTextarea.value.trim()) recipeExportButton.click();
  try {
    if (!navigator.clipboard?.writeText)
      throw new Error("Clipboard unavailable in this browser context");
    await navigator.clipboard.writeText(recipeTextarea.value);
    recipeFeedback.textContent = "Recipe copied. Keep it yourself to restore after reload.";
  } catch {
    recipeFeedback.textContent =
      "Clipboard unavailable; select and copy the JSON text manually.";
    recipeTextarea.focus();
    recipeTextarea.select();
  }
});
recipeImportButton.addEventListener("click", async () => {
  recipeImportButton.disabled = true;
  let staged = null;
  try {
    const text = recipeTextarea.value.trim();
    if (!text || text.length > 2_000_000)
      throw new RangeError("Recipe must be a nonempty JSON text under 2 MB");
    staged = await stageStartingScene(JSON.parse(text));
    // The expensive/unsafe work is finished before this single swap. If
    // validation or Rapier construction failed, the existing World is intact.
    const old = world;
    world = staged;
    staged = null;
    old.world.free();
    input.keys.clear();
    input.reposition = null;
    input.drawing = null;
    input.draggingCamera = false;
    lastStep = { desiredVelocity: { x: 0, y: 0 }, stepMs: 0 };
    completedPhysicsSteps = 0;
    document.body.dataset.physicsSteps = "0";
    syncProfileFields(world.profile);
    syncResidentProfileFields(world.residentProfile);
    residentModeSelect.value = world.residentMode;
    residentSideSelect.value = String(world.residentSidePreference);
    peerModeSelect.value = world.peerMode;
    peerSideSelect.value = String(world.peerSidePreference);
    peerMassField.value = String(world.peerMass);
    braceMassInput.value = String(world.braceMass);
    braceBrakingInput.value = String(world.braceBraking);
    braceFormSelect.value = world.braceForm;
    braceAngleInput.value = String(world.braceAngle);
    refreshPeerControls();
    refreshBraceControls();
    camera.follow = true;
    camera.followTarget = "resident";
    world.selectedId = "resident";
    document.body.dataset.experimentFixture = "imported";
    setSimulationPaused(true);
    render();
    recipeFeedback.textContent =
      "Imported starting scene atomically: " + world.authoredShapes.length +
      " authored shapes and " + world.bodyStarts.size +
      " placed starts. Paused. Running afterstate not restored.";
  } catch (error) {
    if (staged?.world) staged.world.free();
    recipeFeedback.textContent =
      "Import rejected; existing World unchanged: " + String(error?.message ?? error);
  } finally {
    recipeImportButton.disabled = false;
  }
});

compareScenesButton.addEventListener("click", async () => {
  compareScenesButton.disabled = true;
  try {
    const source = recipeTextarea.value.trim();
    if (!source || source.length > 2_000_000)
      throw new RangeError("Export an A recipe first (max 2 MB)");
    const reference = JSON.parse(source);
    const candidate = captureStartingScene(world);
    const result = await compareStartingScenes(reference, candidate, {
      subject: compareSubjectSelect.value, steps: 240
    });
    renderPhysicalComparison(result);
    const tick = value => value === null ? "none" : String(value);
    const position = point => "(" + point.x.toFixed(2) + ", " +
      point.y.toFixed(2) + ") m";
    compareReport.textContent =
      "A / B — " + result.subject + " · " + result.steps +
        " identical fixed physics steps\n" +
      "First motor-intent difference: t" + tick(result.firstMotorDifference) + "\n" +
      "First body-position difference: t" + tick(result.firstPositionDifference) +
        (result.initialStateDiffers ? " (different starting positions)" : "") + "\n" +
      "Largest body-position gap: " + result.maxPositionGap.toFixed(3) + " m\n" +
      "Final positions A / B: " + position(result.referenceFinal) +
        " / " + position(result.candidateFinal) + "\n" +
      "Active-contact ticks A / B: " + result.referenceContactTicks +
        " / " + result.candidateContactTicks + "\n" +
      "First active contact A / B: t" + tick(result.referenceFirstContact) +
        " / t" + tick(result.candidateFirstContact) + "\n" +
      "No live World was modified. This is physical measurement, not NPC quality.";
  } catch (error) {
    comparePlot.dataset.tracedPoints = "0";
    const ctx = comparePlot.getContext("2d");
    ctx.clearRect(0,0,comparePlot.width,comparePlot.height);
    compareReport.textContent =
      "A/B not run; live World unchanged: " + String(error?.message ?? error);
  } finally {
    compareScenesButton.disabled = false;
  }
});

const fixtureFeedback = document.querySelector("#fixture-feedback");
function loadFixture(kind) {
  // Explicit reset, never a background re-authoring operation. Every
  // post-seed shape remains live-editable with the existing canvas tools.
  world.clearAuthored();
  world.clearBodyStartOverrides();
  world.setPeerEnabled(false);
  world.setBraceEnabled(false);
  world.setPeerMass(210);
  world.setBraceProfile({ mass: 120, braking: 30 });
  world.setBraceForm("round");
  world.setBraceAngle(0);
  world.setResidentProfile(DEFAULT_RESIDENT_PROFILE);
  world.setResidentMode("tactile-recovery");
  world.setPeerMode("tactile-recovery");
  world.setActorSidePreference("resident", 1);
  world.setActorSidePreference("peer", -1);
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
  } else if (kind === "short") {
    world.setResidentMode("lateral-maneuver");
    world.reset();
    world.authorRect({ kind: "wall", cx: 16.8, cy: 11.4,
      width: 0.6, height: 1.0 });
    fixtureFeedback.textContent =
      "Finite lateral response: short wall at x=16.8. Compare directional " +
      "reversal with finite side-stepping and try longer walls, body sizes, and side bias.";
  } else if (kind === "wrong") {
    world.setResidentMode("adaptive-lateral");
    world.reset();
    world.authorRect({ kind: "wall", cx: 16.8, cy: 11.4,
      width: 0.6, height: 1.0 });
    world.authorRect({ kind: "wall", cx: 16.8, cy: 12.20,
      width: 5, height: 0.40 });
    fixtureFeedback.textContent =
      "Short wall ahead, longer side barrier below. Compare finite +Y " +
      "sidestep with an adaptive attempt that may reverse side after actual touch.";
  } else if (kind === "beam") {
    world.setBraceForm("beam");
    world.setBraceAngle(0);
    world.setBraceProfile({ mass: 120, braking: 0 });
    world.setBraceEnabled(true);
    world.reset();
    fixtureFeedback.textContent =
      "Rotating beam: 1.8×0.56m, 120kg, zero hold braking. " +
      "Use tangential impulse at an offset cursor, then one physical step. " +
      "Change shape, mass, or angle and compare.";
  } else if (kind === "offaxis") {
    world.setPeerMass(30);
    world.setPeerEnabled(true);
    world.setBraceForm("beam");
    world.setBraceAngle(0);
    world.setBraceProfile({ mass: 120, braking: 30 });
    world.setBraceEnabled(true);
    world.reset();
    world.repositionBody("peer", { x: 19, y: 12 });
    fixtureFeedback.textContent =
      "A counter-moving actor hits the beam off-axis: watch real rotation " +
      "without external impulse. Move the peer to Y=11.4 for a symmetric contact null.";
  } else {
    throw new Error("unrecognized experiment fixture");
  }
  residentModeSelect.value = world.residentMode;
  residentSideSelect.value = String(world.residentSidePreference);
  peerModeSelect.value = world.peerMode;
  peerSideSelect.value = String(world.peerSidePreference);
  syncResidentProfileFields(world.residentProfile);
  peerMassField.value = String(world.peerMass);
  braceMassInput.value = String(world.braceMass);
  braceBrakingInput.value = String(world.braceBraking);
  braceFormSelect.value = world.braceForm;
  braceAngleInput.value = String(world.braceAngle);
  refreshPeerControls();
  refreshBraceControls();
  experimentImpulse.value = "150";
  experimentImpulseMode.value = kind === "beam" ? "tangential" : "center";
  camera.follow = true;
  camera.followTarget = kind === "beam" || kind === "offaxis" ? "brace" : "resident";
  world.selectedId = camera.followTarget;
  document.body.dataset.experimentFixture = kind;
  setSimulationPaused(true);
  render();
}
document.querySelector("#fixture-pressure-chain").addEventListener(
  "click", () => loadFixture("pressure"));
document.querySelector("#fixture-side-touch").addEventListener(
  "click", () => loadFixture("side"));
document.querySelector("#fixture-short-block").addEventListener(
  "click", () => loadFixture("short"));
document.querySelector("#fixture-wrong-side").addEventListener(
  "click", () => loadFixture("wrong"));
document.querySelector("#fixture-beam-torque").addEventListener(
  "click", () => loadFixture("beam"));
document.querySelector("#fixture-offaxis-pressure").addEventListener(
  "click", () => loadFixture("offaxis"));

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

  if (input.reposition) {
    const moved = input.reposition;
    const entity = snapshot.entities.find(e => e.id === moved.id);
    if (entity) {
      const a = worldToScreen(entity.position);
      const b = worldToScreen(moved.preview);
      ctx.save();
      ctx.strokeStyle = "#74dbed";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      if (entity.shape === "circle") {
        ctx.beginPath();
        ctx.arc(b.x, b.y, entity.radius * camera.zoom, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(entity.rotation);
        ctx.strokeRect(-entity.half.x * camera.zoom,
          -entity.half.y * camera.zoom,
          2 * entity.half.x * camera.zoom,
          2 * entity.half.y * camera.zoom);
        ctx.restore();
      }
      ctx.restore();
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
      "position " + selected.position.x.toFixed(2) + ", " +
        selected.position.y.toFixed(2) + " m\n" +
      (selected.radius ? "radius " + selected.radius.toFixed(2) + "\n" : "") +
      "rotation " + (selected.rotation * 180 / Math.PI).toFixed(2) +
        "° · angular " + selected.angularVelocity.toFixed(2) + " rad/s\n" +
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
        " / recoveries=" + selected.localControl.recoveries +
        " / lateral=" + selected.localControl.lateralAttempts : "");
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
    snapshot.braceBraking + " m/s² · " + snapshot.braceForm +
      " @ " + snapshot.braceAngle + "° · not a static obstacle" :
    "Third role disabled. Existing two-body control remains available.";

  peerStatus.textContent = snapshot.peerControl ?
    "Second body: " + snapshot.peerMass + " kg · " +
      snapshot.peerControl.mode + " · local state " +
      snapshot.peerControl.state + " · recoveries " +
      snapshot.peerControl.recoveries + " · lateral attempts " +
      snapshot.peerControl.lateralAttempts + " · travel " +
      snapshot.peerControl.estimatedX.toFixed(2) + "m" :
    "Second body absent. The original one-resident control remains available.";

  residentStatus.textContent =
    "local state: " + snapshot.residentControl.state +
    " · local travel " + snapshot.residentControl.estimatedX.toFixed(2) +
      "," + snapshot.residentControl.estimatedY.toFixed(2) + "m" +
    " · lateral attempts " + snapshot.residentControl.lateralAttempts +
    " · side flips " + snapshot.residentControl.lateralFlips +
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
