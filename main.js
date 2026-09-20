import {
  angleDelta,
  clamp,
  lerp,
  normalize
} from "./core.js";

import {
  WORLD,
  createBody,
  driveBody,
  resolveBodyPair,
  setDesiredFacing,
  tickBodyVisuals,
  updateFacing
} from "./world.js";

import {
  WEAPONS,
  createWeaponState,
  equipWeapon,
  requestAttack,
  resolveWeaponClash,
  resolveWeaponHit,
  updateWeapon,
  weaponSegment
} from "./combat.js";

import {
  createDuelistBrain,
  updateDuelistAI
} from "./ai.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const hpPlayer = document.querySelector("#playerHpFill");
const hpEnemy = document.querySelector("#enemyHpFill");
const weaponLabel = document.querySelector("#weaponLabel");
const runtimeStatus = document.querySelector("#runtimeStatus");
const eventLabel = document.querySelector("#eventLabel");

const VIEW_W = canvas.width;
const VIEW_H = canvas.height;
const FIXED_DT = 1 / 120;

const keys = new Set();
const mouse = {
  screenX: VIEW_W * 0.67,
  screenY: VIEW_H * 0.50,
  worldX: 0,
  worldY: 0
};

const camera = {
  x: 390,
  y: 550
};

const game = {
  time: 0,
  generation: 0,
  roundState: "fight",
  roundTimer: 0,
  player: null,
  enemy: null,
  playerWeapon: null,
  enemyWeapon: null,
  enemyBrain: null,
  playerWeaponId: "sword",
  events: [],
  particles: [],
  trails: {
    player: [],
    enemy: []
  },
  debug: false,
  frame: 0,
  lastEvent: "",
  lastEventTimer: 0
};

let audio = null;
let lastNow = performance.now();
let accumulator = 0;

function unlockAudio() {
  if (!audio) {
    audio = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audio.state === "suspended") audio.resume();
}

function tone(kind, strength = 1) {
  if (!audio) return;
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const filter = audio.createBiquadFilter();

  let f0 = 170;
  let f1 = 70;
  let duration = 0.08;
  let volume = 0.035 * strength;
  osc.type = "triangle";

  if (kind === "swing") {
    f0 = 250;
    f1 = 120;
    duration = 0.06;
    volume = 0.018 * strength;
    osc.type = "sine";
  } else if (kind === "clash") {
    f0 = 1100;
    f1 = 280;
    duration = 0.10;
    volume = 0.055 * strength;
    osc.type = "square";
  } else if (kind === "wall") {
    f0 = 520;
    f1 = 150;
    duration = 0.07;
    volume = 0.026 * strength;
  } else if (kind === "hit") {
    f0 = 130;
    f1 = 48;
    duration = 0.13;
    volume = 0.06 * strength;
    osc.type = "sawtooth";
  }

  filter.type = "lowpass";
  filter.frequency.value = kind === "clash" ? 2600 : 1050;

  osc.frequency.setValueAtTime(f0, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, f1), now + duration);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function makePlayer() {
  return createBody({
    id: "player",
    x: 350,
    y: 555,
    radius: 18,
    mass: 1.0,
    maxSpeed: 250,
    acceleration: 2250,
    braking: 2700,
    turnRate: 11.5,
    hp: 100
  });
}

function makeEnemy() {
  const body = createBody({
    id: "duelist",
    x: 1240,
    y: 555,
    radius: 19,
    mass: 1.12,
    maxSpeed: 214,
    acceleration: 1700,
    braking: 2050,
    turnRate: 9.6,
    hp: 100
  });
  body.facing = Math.PI;
  body.desiredFacing = Math.PI;
  return body;
}

function resetRound() {
  game.generation++;
  game.roundState = "fight";
  game.roundTimer = 0;
  game.time = 0;
  game.player = makePlayer();
  game.enemy = makeEnemy();
  game.playerWeapon = createWeaponState(game.player, game.playerWeaponId);
  game.enemyWeapon = createWeaponState(game.enemy, "sword");
  game.enemyBrain = createDuelistBrain(game.generation + 3);
  game.events = [];
  game.particles = [];
  game.trails.player = [];
  game.trails.enemy = [];
  game.lastEvent = "";
  game.lastEventTimer = 0;
  camera.x = game.player.x;
  camera.y = game.player.y;
  refreshHUD();
}

function setPlayerWeapon(id) {
  if (!WEAPONS[id] || game.playerWeaponId === id) return;
  game.playerWeaponId = id;
  equipWeapon(game.player, game.playerWeapon, id);
  game.player.turnRate = id === "spear" ? 10.0 : 11.5;
  game.player.maxSpeed = id === "spear" ? 238 : 250;
  game.trails.player = [];
  announce(WEAPONS[id].label.toUpperCase(), 0.65);
  refreshHUD();
}

function announce(text, seconds = 0.42) {
  game.lastEvent = text;
  game.lastEventTimer = seconds;
  eventLabel.textContent = text;
  eventLabel.classList.add("visible");
}

function spawnContact(x, y, kind, strength = 1) {
  const count = kind === "hit" ? 12 : kind === "clash" ? 9 : 5;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + game.time * 2.7;
    const speed = (38 + (i % 4) * 18) * strength;
    game.particles.push({
      x, y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: kind === "hit" ? 0.28 : 0.20,
      maxLife: kind === "hit" ? 0.28 : 0.20,
      kind
    });
  }
}

function onCombatEvent(event) {
  game.events.push({ ...event, at: game.time });
  if (game.events.length > 120) game.events.shift();

  if (event.type === "blade-clash") {
    spawnContact(event.x, event.y, "clash", clamp(event.relativeSpeed / 420, 0.5, 1.3));
    tone("clash", clamp(event.relativeSpeed / 320, 0.55, 1.2));
    announce("BLADE CONTACT", 0.28);
  } else if (event.type === "body-hit") {
    spawnContact(event.x, event.y, "hit", 1);
    tone("hit", clamp(event.speed / 360, 0.65, 1.25));
    announce(event.attacker === "player" ? "CLEAN CONTACT" : "HIT TAKEN", 0.35);
  } else if (event.type === "weapon-wall") {
    const actor = event.actor === "player" ? game.player : game.enemy;
    const weapon = event.actor === "player" ? game.playerWeapon : game.enemyWeapon;
    const seg = weaponSegment(actor, weapon);
    spawnContact(seg.bx, seg.by, "wall", 0.65);
    if (event.actor === "player") tone("wall", 0.8);
  }
}

function pointerToWorld(e) {
  const rect = canvas.getBoundingClientRect();
  mouse.screenX = (e.clientX - rect.left) * VIEW_W / rect.width;
  mouse.screenY = (e.clientY - rect.top) * VIEW_H / rect.height;
  mouse.worldX = camera.x + mouse.screenX - VIEW_W / 2;
  mouse.worldY = camera.y + mouse.screenY - VIEW_H / 2;
}

function currentMoveInput() {
  let x = 0;
  let y = 0;
  if (keys.has("KeyA")) x -= 1;
  if (keys.has("KeyD")) x += 1;
  if (keys.has("KeyW")) y -= 1;
  if (keys.has("KeyS")) y += 1;
  const n = normalize(x, y, 0, 0);
  return n.length > 0 ? { x: n.x, y: n.y } : { x: 0, y: 0 };
}

function recordTrail(owner, weapon, which) {
  const seg = weaponSegment(owner, weapon);
  const trail = game.trails[which];
  trail.push({
    x: seg.bx,
    y: seg.by,
    life: weapon.action ? 0.16 : 0.06,
    maxLife: weapon.action ? 0.16 : 0.06
  });
  if (trail.length > 28) trail.shift();
}

function updateTrail(dt) {
  for (const trail of [game.trails.player, game.trails.enemy]) {
    for (const p of trail) p.life -= dt;
    while (trail.length && trail[0].life <= 0) trail.shift();
  }
}

function updateParticles(dt) {
  for (const p of game.particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= Math.pow(0.12, dt);
    p.vy *= Math.pow(0.12, dt);
  }
  game.particles = game.particles.filter(p => p.life > 0);
}

function endRound(winner) {
  if (game.roundState !== "fight") return;
  game.roundState = winner === "player" ? "won" : "lost";
  game.roundTimer = 1.55;
  announce(winner === "player" ? "OPENING WON" : "DOWN", 1.1);
}

function updateFight(dt) {
  const p = game.player;
  const e = game.enemy;

  const aim = Math.atan2(mouse.worldY - p.y, mouse.worldX - p.x);
  setDesiredFacing(p, aim);

  const move = currentMoveInput();
  const attackMobility = p.playerWeapon?.action ? 1 : 1;
  driveBody(p, move.x, move.y, dt, attackMobility);
  updateFacing(p, dt);

  const enemyInput = updateDuelistAI(game.enemyBrain, e, game.enemyWeapon, p, dt);
  driveBody(e, enemyInput.moveX, enemyInput.moveY, dt, 1);
  updateFacing(e, dt);

  resolveBodyPair(p, e, 0.80);

  const playerFrame = updateWeapon(p, game.playerWeapon, dt, onCombatEvent);
  const enemyFrame = updateWeapon(e, game.enemyWeapon, dt, onCombatEvent);

  const clash = resolveWeaponClash(p, game.playerWeapon, e, game.enemyWeapon, onCombatEvent);

  if (!clash) {
    resolveWeaponHit(p, game.playerWeapon, e, playerFrame, onCombatEvent);
    resolveWeaponHit(e, game.enemyWeapon, p, enemyFrame, onCombatEvent);
  }

  recordTrail(p, game.playerWeapon, "player");
  recordTrail(e, game.enemyWeapon, "enemy");

  if (!e.alive) endRound("player");
  if (!p.alive) endRound("enemy");

  tickBodyVisuals(p, dt);
  tickBodyVisuals(e, dt);
}

function updateCamera(dt) {
  const aimLeadX = clamp(mouse.screenX - VIEW_W / 2, -220, 220) * 0.13;
  const aimLeadY = clamp(mouse.screenY - VIEW_H / 2, -160, 160) * 0.13;
  const tx = game.player.x + aimLeadX;
  const ty = game.player.y + aimLeadY;

  const ease = 1 - Math.pow(0.0008, dt);
  camera.x = lerp(camera.x, tx, ease);
  camera.y = lerp(camera.y, ty, ease);

  camera.x = clamp(camera.x, VIEW_W / 2, WORLD.width - VIEW_W / 2);
  camera.y = clamp(camera.y, VIEW_H / 2, WORLD.height - VIEW_H / 2);

  mouse.worldX = camera.x + mouse.screenX - VIEW_W / 2;
  mouse.worldY = camera.y + mouse.screenY - VIEW_H / 2;
}

function fixedUpdate(dt) {
  game.time += dt;

  if (game.lastEventTimer > 0) {
    game.lastEventTimer -= dt;
    if (game.lastEventTimer <= 0) {
      eventLabel.classList.remove("visible");
    }
  }

  if (game.roundState === "fight") {
    updateFight(dt);
  } else {
    game.roundTimer -= dt;
    tickBodyVisuals(game.player, dt);
    tickBodyVisuals(game.enemy, dt);
    if (game.roundTimer <= 0) resetRound();
  }

  updateTrail(dt);
  updateParticles(dt);
  updateCamera(dt);
}

function worldToScreen(x, y) {
  return {
    x: x - camera.x + VIEW_W / 2,
    y: y - camera.y + VIEW_H / 2
  };
}

function drawGround() {
  ctx.fillStyle = "#171a1c";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  ctx.save();
  ctx.translate(VIEW_W / 2 - camera.x, VIEW_H / 2 - camera.y);

  ctx.fillStyle = "#242627";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.strokeStyle = "#2d3031";
  ctx.lineWidth = 1;
  for (let x = 80; x < WORLD.width; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 52);
    ctx.lineTo(x, WORLD.height - 52);
    ctx.stroke();
  }
  for (let y = 72; y < WORLD.height; y += 64) {
    ctx.beginPath();
    ctx.moveTo(52, y);
    ctx.lineTo(WORLD.width - 52, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#2b2d2e";
  ctx.fillRect(820, 468, 230, 136);
  ctx.strokeStyle = "#363a3c";
  ctx.strokeRect(820.5, 468.5, 229, 135);

  ctx.fillStyle = "#202324";
  for (const wall of WORLD.walls) {
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.strokeStyle = "#45494a";
    ctx.strokeRect(wall.x + 0.5, wall.y + 0.5, wall.w - 1, wall.h - 1);
  }

  ctx.font = "700 24px system-ui";
  ctx.fillStyle = "#ffffff0b";
  ctx.fillText("RUINED GATE", 690, 540);
  ctx.restore();
}

function drawTrail(trail, color) {
  if (trail.length < 2) return;

  ctx.save();
  ctx.lineCap = "round";
  for (let i = 1; i < trail.length; i++) {
    const a = trail[i - 1];
    const b = trail[i];
    const alpha = clamp(b.life / b.maxLife, 0, 1) * 0.28;
    const sa = worldToScreen(a.x, a.y);
    const sb = worldToScreen(b.x, b.y);
    ctx.strokeStyle = color.replace("ALPHA", alpha.toFixed(3));
    ctx.lineWidth = 2.5 + alpha * 3;
    ctx.beginPath();
    ctx.moveTo(sa.x, sa.y);
    ctx.lineTo(sb.x, sb.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBody(body, isPlayer) {
  const s = worldToScreen(body.x, body.y);
  const facingX = Math.cos(body.facing);
  const facingY = Math.sin(body.facing);

  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(body.facing);

  ctx.fillStyle = body.hitFlash > 0
    ? "#fff"
    : isPlayer ? "#80b4ff" : "#e06e62";

  ctx.beginPath();
  ctx.moveTo(body.radius + 7, 0);
  ctx.lineTo(-body.radius * 0.55, -body.radius * 0.82);
  ctx.lineTo(-body.radius, 0);
  ctx.lineTo(-body.radius * 0.55, body.radius * 0.82);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#0b0d0e99";
  ctx.beginPath();
  ctx.arc(body.radius * 0.18, 0, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  if (game.debug) {
    ctx.strokeStyle = isPlayer ? "#80b4ff66" : "#e06e6266";
    ctx.beginPath();
    ctx.arc(s.x, s.y, body.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#d8f1ff55";
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x + facingX * 56, s.y + facingY * 56);
    ctx.stroke();

    const desired = body.desiredFacing;
    ctx.strokeStyle = "#72f0ce88";
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x + Math.cos(desired) * 48, s.y + Math.sin(desired) * 48);
    ctx.stroke();
  }
}

function drawWeapon(owner, weapon, isPlayer) {
  const seg = weaponSegment(owner, weapon);
  const a = worldToScreen(seg.ax, seg.ay);
  const b = worldToScreen(seg.bx, seg.by);

  if (game.debug) {
    const pivot = worldToScreen(owner.x + Math.cos(owner.facing) * 8, owner.y + Math.sin(owner.facing) * 8);
    const reach = weapon.desiredReach;
    const dx = Math.cos(weapon.desiredAngle);
    const dy = Math.sin(weapon.desiredAngle);
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = isPlayer ? "#72f0ce66" : "#ffb36b55";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pivot.x + dx * weapon.config.inner, pivot.y + dy * weapon.config.inner);
    ctx.lineTo(pivot.x + dx * reach, pivot.y + dy * reach);
    ctx.stroke();
    ctx.restore();
  }

  ctx.lineCap = "round";

  ctx.strokeStyle = "#6d5238";
  ctx.lineWidth = weapon.config.id === "spear" ? 5 : 6;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();

  if (weapon.config.id === "sword") {
    ctx.strokeStyle = isPlayer ? "#dfeeff" : "#ffe2dd";
    ctx.lineWidth = 6.5;
    ctx.beginPath();
    ctx.moveTo(
      a.x + (b.x - a.x) * 0.27,
      a.y + (b.y - a.y) * 0.27
    );
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  } else {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const n = normalize(dx, dy);
    const px = -n.y;
    const py = n.x;
    ctx.fillStyle = isPlayer ? "#dfeeff" : "#ffe2dd";
    ctx.beginPath();
    ctx.moveTo(b.x + n.x * 9, b.y + n.y * 9);
    ctx.lineTo(b.x - n.x * 8 + px * 5, b.y - n.y * 8 + py * 5);
    ctx.lineTo(b.x - n.x * 8 - px * 5, b.y - n.y * 8 - py * 5);
    ctx.closePath();
    ctx.fill();
  }
}

function drawParticles() {
  for (const p of game.particles) {
    const s = worldToScreen(p.x, p.y);
    const alpha = clamp(p.life / p.maxLife, 0, 1);
    ctx.fillStyle = p.kind === "hit"
      ? `rgba(255,105,90,${alpha})`
      : p.kind === "clash"
        ? `rgba(235,245,255,${alpha})`
        : `rgba(215,180,120,${alpha})`;
    ctx.fillRect(s.x - 1.5, s.y - 1.5, 3, 3);
  }
}

function drawDebug() {
  if (!game.debug) return;

  ctx.save();
  ctx.fillStyle = "rgba(8,10,12,.78)";
  ctx.fillRect(18, VIEW_H - 138, 300, 116);
  ctx.font = "12px ui-monospace, SFMono-Regular, Consolas, monospace";
  ctx.fillStyle = "#aeb9c5";

  const p = game.player;
  const w = game.playerWeapon;
  const e = game.enemy;

  const lines = [
    `player v = ${Math.hypot(p.vx,p.vy).toFixed(1)}`,
    `body facing error = ${Math.abs(angleDelta(p.facing,p.desiredFacing)).toFixed(3)} rad`,
    `weapon = ${w.config.id} / ${w.action?.type || "guard"}`,
    `weapon ω = ${w.angularVelocity.toFixed(2)} rad/s`,
    `weapon reach = ${w.reach.toFixed(1)}`,
    `enemy dist = ${Math.hypot(e.x-p.x,e.y-p.y).toFixed(1)}`
  ];

  lines.forEach((line, i) => ctx.fillText(line, 30, VIEW_H - 112 + i * 16));
  ctx.restore();
}

function render() {
  drawGround();

  drawTrail(game.trails.player, "rgba(135,194,255,ALPHA)");
  drawTrail(game.trails.enemy, "rgba(255,132,115,ALPHA)");

  drawBody(game.enemy, false);
  drawWeapon(game.enemy, game.enemyWeapon, false);

  drawBody(game.player, true);
  drawWeapon(game.player, game.playerWeapon, true);

  drawParticles();
  drawDebug();

  if (game.roundState !== "fight") {
    ctx.fillStyle = "rgba(7,8,10,.38)";
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.textAlign = "center";
    ctx.font = "800 32px system-ui";
    ctx.fillStyle = "#f2f5f7";
    ctx.fillText(game.roundState === "won" ? "OPENING WON" : "DOWN", VIEW_W / 2, VIEW_H / 2);
    ctx.textAlign = "left";
  }
}

function refreshHUD() {
  hpPlayer.style.transform = `scaleX(${clamp(game.player.hp / game.player.maxHp, 0, 1)})`;
  hpEnemy.style.transform = `scaleX(${clamp(game.enemy.hp / game.enemy.maxHp, 0, 1)})`;
  weaponLabel.textContent = WEAPONS[game.playerWeaponId].label;
  document.querySelectorAll("[data-weapon]").forEach(button => {
    button.classList.toggle("active", button.dataset.weapon === game.playerWeaponId);
  });
}

function frame(now) {
  const elapsed = Math.min(0.05, Math.max(0, (now - lastNow) / 1000));
  lastNow = now;
  accumulator += elapsed;

  while (accumulator >= FIXED_DT) {
    fixedUpdate(FIXED_DT);
    accumulator -= FIXED_DT;
  }

  game.frame++;
  if (game.frame % 10 === 0) refreshHUD();
  if (game.frame % 30 === 0) {
    runtimeStatus.textContent = `runtime live · ${game.playerWeaponId} · frame ${game.frame}`;
  }

  render();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", e => {
  keys.add(e.code);
  unlockAudio();

  if (e.code === "Digit1") setPlayerWeapon("sword");
  if (e.code === "Digit2") setPlayerWeapon("spear");
  if (e.code === "KeyR") resetRound();
  if (e.code === "Backquote") game.debug = !game.debug;
});

window.addEventListener("keyup", e => {
  keys.delete(e.code);
});

window.addEventListener("blur", () => {
  keys.clear();
});

canvas.addEventListener("pointermove", pointerToWorld);
canvas.addEventListener("pointerdown", e => {
  unlockAudio();
  pointerToWorld(e);
  if (game.roundState !== "fight") return;

  if (e.button === 0) {
    if (requestAttack(game.player, game.playerWeapon, "cut")) tone("swing", 0.8);
  } else if (e.button === 2) {
    if (requestAttack(game.player, game.playerWeapon, "thrust")) tone("swing", 0.65);
  }
});

canvas.addEventListener("contextmenu", e => e.preventDefault());

document.querySelectorAll("[data-weapon]").forEach(button => {
  button.addEventListener("click", () => {
    unlockAudio();
    setPlayerWeapon(button.dataset.weapon);
  });
});

resetRound();
requestAnimationFrame(frame);
