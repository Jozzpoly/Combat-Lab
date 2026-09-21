import { normalize } from "./src/math.js";
import {
  ANCHOR_FIXTURES,
  createActor,
  derivePhenotype,
  shieldOf
} from "./src/phenotype.js";
import { shieldSegment } from "./src/contact.js";
import { driveActorInWorld } from "./src/world.js";
import { turnActorToward } from "./src/motion.js";
import {
  createWeaponRuntime,
  requestCompactAttack,
  resolveCompactStrike,
  stepCompactAttack,
  attackProgress,
  compactWeaponSegment
} from "./src/weapon.js";
import {
  resolveCellPair,
  updatePressureGuardMotion
} from "./src/cell.js";
import {
  CELL_WALLS,
  PRESSURE_SPEC
} from "./src/cell-config.js";
import { runPhenotypeStrategyMatrix } from "./src/rehearsal.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const statusEl = document.querySelector("#status");
const phenotypeEl = document.querySelector("#phenotype");
const hpEl = document.querySelector("#hp");
const detailEl = document.querySelector("#detail");

const W = canvas.width;
const H = canvas.height;
const SCALE = 2.7;
const ORIGIN_X = W * 0.5;
const ORIGIN_Y = 62;
const DT = 1 / 120;

const keys = new Set();
const mouse = { x: 0, y: 0 };
const fx = [];

let selected = "bulwark";
let player;
let guard;
let playerWeapon;
let guardWeapon;
let guardAttackTimer;
let round;
let accumulator = 0;
let lastTime = performance.now();

function worldToScreen(x, y) {
  return {
    x: ORIGIN_X + x * SCALE,
    y: ORIGIN_Y + y * SCALE
  };
}

function screenToWorld(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const sx = (clientX - rect.left) * W / rect.width;
  const sy = (clientY - rect.top) * H / rect.height;
  return {
    x: (sx - ORIGIN_X) / SCALE,
    y: (sy - ORIGIN_Y) / SCALE
  };
}

function reset(next = selected) {
  selected = next;
  player = createActor(ANCHOR_FIXTURES[selected], {
    id: "player",
    x: 0,
    y: 160,
    facing: -Math.PI / 2
  });
  guard = createActor(PRESSURE_SPEC, {
    id: "guard",
    x: 0,
    y: 88,
    facing: Math.PI / 2
  });
  playerWeapon = createWeaponRuntime();
  guardWeapon = createWeaponRuntime();
  guardAttackTimer = 0.18;
  round = "active";
  fx.length = 0;
  mouse.x = player.x;
  mouse.y = player.y - 80;
  refreshHUD();
}

function movementInput() {
  let x = 0;
  let y = 0;
  if (keys.has("KeyA")) x -= 1;
  if (keys.has("KeyD")) x += 1;
  if (keys.has("KeyW")) y -= 1;
  if (keys.has("KeyS")) y += 1;
  return normalize(x, y, 0, 0);
}

function addFx(event) {
  if (!event) return;
  fx.push({
    x: event.x,
    y: event.y,
    type: event.type,
    life: 0.30
  });
}

function step(dt) {
  if (round !== "active") {
    for (const effect of fx) effect.life -= dt;
    return;
  }

  const move = movementInput();
  player.brace = (keys.has("ShiftLeft") || keys.has("ShiftRight")) ? 1 : 0;

  const desiredFacing = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  turnActorToward(player, desiredFacing, dt);
  driveActorInWorld(player, move.x, move.y, dt, CELL_WALLS);

  if (guard.hp > 0) {
    updatePressureGuardMotion(guard, player, dt);
    const contact = resolveCellPair(player, guard);
    if (contact.shieldContact) {
      addFx({ ...contact.shieldContact, type: "shield-contact" });
    } else if (contact.bodyContact) {
      const x = (player.x + guard.x) * 0.5;
      const y = (player.y + guard.y) * 0.5;
      addFx({ x, y, type: "body-contact" });
    }

    const distance = Math.hypot(player.x - guard.x, player.y - guard.y);
    const centralThreat = Math.abs(player.x) < 46 && distance < 86;
    guardAttackTimer -= dt;
    if (centralThreat && guardAttackTimer <= 0) {
      if (requestCompactAttack(guardWeapon)) guardAttackTimer = 0.78;
    }

    stepCompactAttack(guardWeapon, dt);
    const guardStrike = resolveCompactStrike(guard, guardWeapon, player);
    addFx(guardStrike);

    if (player.hp <= 0) {
      round = "down";
    }
  }

  stepCompactAttack(playerWeapon, dt);
  if (guard.hp > 0) {
    const playerStrike = resolveCompactStrike(player, playerWeapon, guard);
    addFx(playerStrike);
  }

  if (guard.hp <= 0) {
    guard.vx = 0;
    guard.vy = 0;
  }

  if (round === "active" && player.y < 52) {
    round = "crossed";
  }

  for (const effect of fx) effect.life -= dt;
  while (fx.length && fx[0].life <= 0) fx.shift();
}

function drawWorld() {
  ctx.fillStyle = "#121719";
  ctx.fillRect(0, 0, W, H);

  const goalTop = worldToScreen(-140, 8);
  const goalBottom = worldToScreen(140, 52);
  ctx.fillStyle = "rgba(108, 170, 128, 0.09)";
  ctx.fillRect(goalTop.x, goalTop.y, goalBottom.x - goalTop.x, goalBottom.y - goalTop.y);

  ctx.strokeStyle = "rgba(132, 190, 151, 0.30)";
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  const goalA = worldToScreen(-140, 52);
  const goalB = worldToScreen(140, 52);
  ctx.moveTo(goalA.x, goalA.y);
  ctx.lineTo(goalB.x, goalB.y);
  ctx.stroke();
  ctx.setLineDash([]);

  for (const wall of CELL_WALLS) {
    const a = worldToScreen(wall.x, wall.y);
    ctx.fillStyle = "#30383a";
    ctx.fillRect(a.x, a.y, wall.w * SCALE, wall.h * SCALE);
    ctx.strokeStyle = "#586164";
    ctx.strokeRect(a.x + 0.5, a.y + 0.5, wall.w * SCALE - 1, wall.h * SCALE - 1);
  }

  ctx.fillStyle = "rgba(255,255,255,.10)";
  ctx.font = "700 13px system-ui";
  ctx.fillText("CROSS LINE", 28, goalA.y - 9);
}

function drawActor(actor, isPlayer) {
  if (actor.hp <= 0) return;

  const s = worldToScreen(actor.x, actor.y);
  const radius = actor.spec.body.radius * SCALE;
  const p = derivePhenotype(actor.spec, actor.brace);
  const shield = shieldOf(actor.spec);

  ctx.save();
  ctx.translate(s.x, s.y);

  ctx.fillStyle = isPlayer ? "#8fc5ff" : "#e47f70";
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  const gearMass = p.totalMass - actor.spec.body.mass - (actor.spec.weapon?.mass || 0);
  if (gearMass > 8) {
    ctx.strokeStyle = "rgba(235,242,246,.45)";
    ctx.lineWidth = Math.min(7, 2 + gearMass / 10);
    ctx.beginPath();
    ctx.arc(0, 0, radius - 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.rotate(actor.facing);
  ctx.strokeStyle = "#0b1114";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(radius + 10, 0);
  ctx.stroke();

  if (actor.brace > 0.5) {
    ctx.strokeStyle = "rgba(246, 217, 145, .72)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 7, -0.75, 0.75);
    ctx.stroke();
  }

  ctx.restore();

  const shieldSeg = shield ? shieldSegment(actor) : null;
  if (shieldSeg) {
    const a = worldToScreen(shieldSeg.ax, shieldSeg.ay);
    const b = worldToScreen(shieldSeg.bx, shieldSeg.by);
    ctx.strokeStyle = isPlayer ? "#d9e7ef" : "#ead3cf";
    ctx.lineWidth = Math.max(5, shieldSeg.thickness * SCALE);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  const runtime = isPlayer ? playerWeapon : guardWeapon;
  const progress = attackProgress(runtime);
  const weaponSeg = compactWeaponSegment(actor, progress ?? 0.5);
  if (weaponSeg) {
    const a = worldToScreen(weaponSeg.ax, weaponSeg.ay);
    const b = worldToScreen(weaponSeg.bx, weaponSeg.by);
    ctx.strokeStyle = isPlayer ? "#cce6ff" : "#ffd4ce";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  const barW = radius * 1.8;
  ctx.fillStyle = "rgba(0,0,0,.55)";
  ctx.fillRect(s.x - barW / 2, s.y - radius - 13, barW, 5);
  ctx.fillStyle = isPlayer ? "#8fc5ff" : "#e47f70";
  ctx.fillRect(
    s.x - barW / 2,
    s.y - radius - 13,
    barW * Math.max(0, actor.hp / actor.maxHp),
    5
  );
}

function drawFx() {
  for (const effect of fx) {
    if (effect.life <= 0) continue;
    const s = worldToScreen(effect.x, effect.y);
    const alpha = Math.max(0, effect.life / 0.30);

    ctx.strokeStyle =
      effect.type === "body-hit" ? `rgba(255,110,90,${alpha})` :
      effect.type === "shield-block" ? `rgba(240,230,180,${alpha})` :
      `rgba(220,235,240,${alpha * 0.7})`;

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 7 + (1 - alpha) * 12, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function draw() {
  drawWorld();
  drawActor(guard, false);
  drawActor(player, true);
  drawFx();

  if (round !== "active") {
    ctx.fillStyle = "rgba(5,8,9,.42)";
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.font = "800 34px system-ui";
    ctx.fillStyle = "#f0f4f5";
    ctx.fillText(round === "crossed" ? "CROSSED" : "DOWN", W / 2, H / 2);
    ctx.font = "500 15px system-ui";
    ctx.fillText("R to reset", W / 2, H / 2 + 30);
    ctx.textAlign = "left";
  }
}

function refreshHUD() {
  const p = derivePhenotype(player.spec, player.brace);
  phenotypeEl.textContent = player.spec.label;
  hpEl.textContent = `HP ${player.hp} · mass ${p.totalMass.toFixed(0)} · body Ø${(player.spec.body.radius * 2).toFixed(0)}`;
  detailEl.textContent = player.brace > 0.5
    ? `BRACED · speed authority ${p.maxSpeed.toFixed(0)} · contact ${p.contactAuthority.toFixed(0)}`
    : `free · speed authority ${p.maxSpeed.toFixed(0)} · contact ${p.contactAuthority.toFixed(0)}`;

  statusEl.textContent =
    round === "active" ? "reach the green line · combat / push / bypass are all legal" :
    round === "crossed" ? "objective crossed" : "down";
}

function frame(now) {
  const elapsed = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
  lastTime = now;
  accumulator += elapsed;

  while (accumulator >= DT) {
    step(DT);
    accumulator -= DT;
  }

  refreshHUD();
  draw();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", event => {
  keys.add(event.code);
  if (event.code === "Digit1") reset("bulwark");
  if (event.code === "Digit2") reset("skirmisher");
  if (event.code === "Digit3") reset("hybrid");
  if (event.code === "KeyR") reset();
});

window.addEventListener("keyup", event => keys.delete(event.code));
window.addEventListener("blur", () => keys.clear());

canvas.addEventListener("pointermove", event => {
  Object.assign(mouse, screenToWorld(event.clientX, event.clientY));
});

canvas.addEventListener("pointerdown", event => {
  Object.assign(mouse, screenToWorld(event.clientX, event.clientY));
  if (event.button === 0 && round === "active") requestCompactAttack(playerWeapon);
});

document.querySelectorAll("[data-phenotype]").forEach(button => {
  button.addEventListener("click", () => reset(button.dataset.phenotype));
});

const params = new URLSearchParams(location.search);
if (params.get("probe") === "matrix") {
  document.querySelector("#probe").textContent =
    JSON.stringify(runPhenotypeStrategyMatrix());
}

reset();
requestAnimationFrame(frame);
