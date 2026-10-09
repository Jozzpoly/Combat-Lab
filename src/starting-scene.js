import { MaterialWorld } from "./material-world.js";

// An experimental, intentionally disposable starting-scene recipe. It does
// not pretend to serialize a running physics simulation or canonical GDD.
export const SCENE_RECIPE_FORMAT = "combat-lab-authored-start-v1";
const required = (condition, message) => {
  if (!condition) throw new RangeError("Scene recipe: " + message);
};
const object = (v, what) => {
  required(v && typeof v === "object" && !Array.isArray(v), what + " must be an object");
  return v;
};
const finite = (n, what, min = -Infinity) => {
  required(typeof n === "number" && Number.isFinite(n) &&
    Number.isFinite(Math.fround(n)) &&
    (n === 0 || Math.fround(n) !== 0) && n >= min,
    what + " must be representable by the physical solver");
  return n;
};
const exactKeys = (o, keys, what) => {
  required(Object.keys(o).sort().join("|") === [...keys].sort().join("|"),
    what + " fields do not match this experimental format");
};
const PROFILE_PLAYER = ["radius", "mass", "maxSpeed", "acceleration",
  "braking", "gripBraking", "gripReach", "gripForce"];
const PROFILE_RESIDENT = ["radius", "mass", "maxSpeed", "acceleration", "braking"];
const modes = new Set(["baseline", "tactile-recovery", "directional-recovery",
  "lateral-maneuver"]);

export function captureStartingScene(world) {
  const authoredObjects = new Set(world.authoredShapes.map(x => x.id));
  const starts = [];
  for (const [id, point] of world.bodyStarts) {
    if (!["player", "resident", "peer", "brace",
      "light-crate", "heavy-crate", "plank"].includes(id) &&
        !authoredObjects.has(id)) continue;
    starts.push({ key: id, x: point.x, y: point.y });
  }
  return {
    format: SCENE_RECIPE_FORMAT,
    player: { ...world.profile },
    resident: { profile: { ...world.residentProfile },
      mode: world.residentMode, side: world.residentSidePreference },
    peer: { enabled: world.peerEnabled, mass: world.peerMass,
      mode: world.peerMode, side: world.peerSidePreference },
    brace: { enabled: world.braceEnabled, mass: world.braceMass,
      braking: world.braceBraking, form: world.braceForm, angle: world.braceAngle },
    shapes: world.authoredShapes.map(x => ({
      key: x.id, kind: x.kind, cx: x.cx, cy: x.cy,
      width: x.width, height: x.height, mass: x.mass
    })),
    starts
  };
}

export function validateStartingScene(value) {
  const v = object(value, "root");
  exactKeys(v, ["format", "player", "resident", "peer", "brace",
    "shapes", "starts"], "root");
  required(v.format === SCENE_RECIPE_FORMAT, "unsupported starting-scene version");
  const validateProfile = (raw, keys, what) => {
    object(raw, what);
    exactKeys(raw, keys, what);
    for (const key of keys) finite(raw[key], what + "." + key,
      key === "radius" || key === "mass" ? Number.MIN_VALUE : 0);
  };
  validateProfile(v.player, PROFILE_PLAYER, "player");
  object(v.resident, "resident");
  exactKeys(v.resident, ["profile", "mode", "side"], "resident");
  validateProfile(v.resident.profile, PROFILE_RESIDENT, "resident.profile");
  object(v.peer, "peer");
  exactKeys(v.peer, ["enabled", "mass", "mode", "side"], "peer");
  object(v.brace, "brace");
  exactKeys(v.brace, ["enabled", "mass", "braking", "form", "angle"], "brace");
  for (const [name, actor] of [["resident", v.resident], ["peer", v.peer]]) {
    required(modes.has(actor.mode), name + " mode unsupported");
    required(actor.side === -1 || actor.side === 1,
      name + " side must be -1 or +1");
  }
  for (const name of ["peer", "brace"])
    required(typeof v[name].enabled === "boolean", name + " enabled must be boolean");
  finite(v.peer.mass, "peer mass", Number.MIN_VALUE);
  finite(v.brace.mass, "brace mass", Number.MIN_VALUE);
  finite(v.brace.braking, "brace braking", 0);
  finite(v.brace.angle, "brace angle");
  required(["round", "beam"].includes(v.brace.form), "unknown holder morphology");
  required(Array.isArray(v.shapes) && Array.isArray(v.starts),
    "shapes and starts must be arrays");
  const knownKeys = new Set(["player", "resident", "peer", "brace",
    "light-crate", "heavy-crate", "plank"]);
  const dynamicKeys = new Set(knownKeys);
  for (const shape of v.shapes) {
    object(shape, "shape");
    exactKeys(shape, ["key", "kind", "cx", "cy", "width", "height", "mass"], "shape");
    required(typeof shape.key === "string" && /^authored-[1-9][0-9]*$/.test(shape.key) &&
      !knownKeys.has(shape.key), "authored shape key invalid/duplicate");
    required(shape.kind === "wall" || shape.kind === "object", "unsupported shape kind");
    finite(shape.cx, "shape cx");
    finite(shape.cy, "shape cy");
    finite(shape.width, "shape width", 0.04);
    finite(shape.height, "shape height", 0.04);
    finite(shape.mass, "shape mass", shape.kind === "wall" ? 0 : Number.MIN_VALUE);
    required(shape.kind !== "wall" || shape.mass === 0,
      "fixed wall mass must be zero");
    knownKeys.add(shape.key);
    if (shape.kind === "object") dynamicKeys.add(shape.key);
  }
  const starts = new Set();
  for (const start of v.starts) {
    object(start, "start");
    exactKeys(start, ["key", "x", "y"], "start");
    required(typeof start.key === "string" && dynamicKeys.has(start.key) &&
      !starts.has(start.key), "unknown, static or duplicated body start key");
    finite(start.x, "body start x");
    finite(start.y, "body start y");
    starts.add(start.key);
  }
  return v;
}

export async function stageStartingScene(value) {
  // This always builds a separate Rapier World. The caller can replace the
  // active World only after full validation and physical reconstruction.
  const recipe = validateStartingScene(value);
  const staged = await MaterialWorld.create();
  try {
    staged.setPlayerProfile(recipe.player);
    staged.setResidentProfile(recipe.resident.profile);
    staged.setResidentMode(recipe.resident.mode);
    staged.setActorSidePreference("resident", recipe.resident.side);
    staged.setPeerMass(recipe.peer.mass);
    staged.setPeerMode(recipe.peer.mode);
    staged.setActorSidePreference("peer", recipe.peer.side);
    staged.setPeerEnabled(recipe.peer.enabled);
    staged.setBraceProfile({ mass: recipe.brace.mass, braking: recipe.brace.braking });
    staged.setBraceForm(recipe.brace.form);
    staged.setBraceAngle(recipe.brace.angle);
    staged.setBraceEnabled(recipe.brace.enabled);
    const ids = new Map();
    for (const shape of recipe.shapes) {
      const id = staged.authorRect({
        kind: shape.kind, cx: shape.cx, cy: shape.cy,
        width: shape.width, height: shape.height, mass: shape.mass
      });
      ids.set(shape.key, id);
    }
    // Dormant actors can have authored starts. Reposition present objects
    // through the World API and remember dormant starts for later toggles.
    for (const start of recipe.starts) {
      const id = ids.get(start.key) ?? start.key;
      if (staged.entities.has(id)) staged.repositionBody(id, start);
      else staged.bodyStarts.set(id, { x: start.x, y: start.y });
    }
    staged.reset();
    return staged;
  } catch (error) {
    staged.world.free();
    throw error;
  }
}

export async function compareStartingScenes(reference, candidate, {
  subject = "resident", steps = 240
} = {}) {
  required(["player", "resident", "peer", "brace"].includes(subject),
    "comparison supports named physical actors, not inferred entities");
  required(Number.isInteger(steps) && steps >= 1 && steps <= 2000,
    "comparison steps must be a finite bounded integer");
  const before = validateStartingScene(reference);
  const after = validateStartingScene(candidate);
  // Reconstruct two independent frozen authored starts. Neither trial may
  // mutate the Owner's active World or inherit a live afterstate.
  const a = await stageStartingScene(before);
  let b;
  try {
    b = await stageStartingScene(after);
    required(a.entities.has(subject) && b.entities.has(subject),
      "selected body absent from one starting scene");
    const aSubject = a.entities.get(subject);
    const bSubject = b.entities.get(subject);
    const distance = () => {
      const x = aSubject.body.translation(), y = bSubject.body.translation();
      return Math.hypot(x.x - y.x, x.y - y.y);
    };
    let firstPositionDifference = distance() > 1e-5 ? 0 : null;
    let maxPositionGap = distance();
    let contactA = 0, contactB = 0;
    let firstContactA = null, firstContactB = null;
    let firstMotorDifference = null;
    for (let tick = 1; tick <= steps; tick++) {
      a.step({ x: 0, y: 0 });
      b.step({ x: 0, y: 0 });
      const gap = distance();
      if (firstPositionDifference === null && gap > 1e-5)
        firstPositionDifference = tick;
      maxPositionGap = Math.max(maxPositionGap, gap);
      const ac = a.contactsFor(subject).length > 0;
      const bc = b.contactsFor(subject).length > 0;
      if (ac) { contactA++; if (firstContactA === null) firstContactA = tick; }
      if (bc) { contactB++; if (firstContactB === null) firstContactB = tick; }
      const am = a.lastCausalObservations.get(subject)?.intendedVelocity;
      const bm = b.lastCausalObservations.get(subject)?.intendedVelocity;
      if (am && bm && firstMotorDifference === null &&
          Math.hypot(am.x - bm.x, am.y - bm.y) > 1e-7)
        firstMotorDifference = tick;
    }
    const ap = aSubject.body.translation(), bp = bSubject.body.translation();
    for (const v of [ap.x, ap.y, bp.x, bp.y, maxPositionGap])
      required(Number.isFinite(v), "comparison became physically nonfinite");
    return {
      subject, steps, initialStateDiffers: firstPositionDifference === 0,
      firstPositionDifference, firstMotorDifference,
      maxPositionGap,
      referenceFinal: { x: ap.x, y: ap.y },
      candidateFinal: { x: bp.x, y: bp.y },
      referenceContactTicks: contactA, candidateContactTicks: contactB,
      referenceFirstContact: firstContactA, candidateFirstContact: firstContactB
    };
  } finally {
    a.world.free();
    if (b?.world) b.world.free();
  }
}
