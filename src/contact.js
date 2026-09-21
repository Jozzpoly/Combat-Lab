import { normalize, pointSegmentDistance, segmentIntersection } from "./math.js";
import { derivePhenotype, shieldOf } from "./phenotype.js";


function resolveClosingVelocity(a, b, nx, ny, authorityA, authorityB) {
  const relative = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  if (relative >= 0) {
    return { impulse: 0, closingSpeed: 0 };
  }

  const inverseA = 1 / Math.max(1, authorityA);
  const inverseB = 1 / Math.max(1, authorityB);
  const impulse = -relative / (inverseA + inverseB);

  a.vx -= nx * impulse * inverseA;
  a.vy -= ny * impulse * inverseA;
  b.vx += nx * impulse * inverseB;
  b.vy += ny * impulse * inverseB;

  return {
    impulse,
    closingSpeed: -relative
  };
}

export function resolveBodyOverlap(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const n = normalize(dx, dy);
  const distance = Math.max(1e-6, n.length);
  const overlap = a.spec.body.radius + b.spec.body.radius - distance;
  if (overlap <= 0) {
    return {
      contact: false,
      overlap: 0,
      movedA: 0,
      movedB: 0
    };
  }

  const pa = derivePhenotype(a.spec, a.brace);
  const pb = derivePhenotype(b.spec, b.brace);
  const totalAuthority = pa.contactAuthority + pb.contactAuthority;

  // The actor with more opposing authority yields less.
  const movedA = overlap * (pb.contactAuthority / totalAuthority);
  const movedB = overlap * (pa.contactAuthority / totalAuthority);

  a.x -= n.x * movedA;
  a.y -= n.y * movedA;
  b.x += n.x * movedB;
  b.y += n.y * movedB;

  const velocity = resolveClosingVelocity(
    a,
    b,
    n.x,
    n.y,
    pa.contactAuthority,
    pb.contactAuthority
  );

  return {
    contact: true,
    overlap,
    movedA,
    movedB,
    authorityA: pa.contactAuthority,
    authorityB: pb.contactAuthority,
    ...velocity
  };
}

export function shieldSegment(actor) {
  const shield = shieldOf(actor.spec);
  if (!shield) return null;

  const fx = Math.cos(actor.facing);
  const fy = Math.sin(actor.facing);
  const rx = -fy;
  const ry = fx;
  const cx = actor.x + fx * shield.offset;
  const cy = actor.y + fy * shield.offset;
  const half = shield.width * 0.5;

  return {
    ax: cx - rx * half,
    ay: cy - ry * half,
    bx: cx + rx * half,
    by: cy + ry * half,
    thickness: shield.thickness
  };
}

export function shieldIntercept(actor, incomingSegment) {
  const shield = shieldSegment(actor);
  if (!shield) return null;
  return segmentIntersection(shield, incomingSegment);
}


export function resolveActorShieldContact(defender, mover) {
  const shield = shieldSegment(defender);
  if (!shield) return { contact: false };

  const forwardX = Math.cos(defender.facing);
  const forwardY = Math.sin(defender.facing);
  const relationX = mover.x - defender.x;
  const relationY = mover.y - defender.y;

  // The shield is a frontal occupied surface, not a 360-degree force field.
  if (relationX * forwardX + relationY * forwardY <= 0) {
    return { contact: false };
  }

  const closest = pointSegmentDistance(mover.x, mover.y, shield);
  const contactRadius = mover.spec.body.radius + shield.thickness * 0.5;
  const overlap = contactRadius - closest.distance;
  if (overlap <= 0) return { contact: false };

  let nx = mover.x - closest.x;
  let ny = mover.y - closest.y;
  let normal = normalize(nx, ny, forwardX, forwardY);

  // At exact center-line contact, use the shield's outward facing normal.
  if (normal.length <= 1e-9) {
    normal = { x: forwardX, y: forwardY, length: 1 };
  }

  // Reject back-face numerical normals; the shield only resists from its front.
  if (normal.x * forwardX + normal.y * forwardY < 0) {
    normal = { x: forwardX, y: forwardY, length: 1 };
  }

  const defenderP = derivePhenotype(defender.spec, defender.brace);
  const moverP = derivePhenotype(mover.spec, mover.brace);
  const totalAuthority = defenderP.contactAuthority + moverP.contactAuthority;

  const defenderYield = overlap * (moverP.contactAuthority / totalAuthority);
  const moverYield = overlap * (defenderP.contactAuthority / totalAuthority);

  defender.x -= normal.x * defenderYield;
  defender.y -= normal.y * defenderYield;
  mover.x += normal.x * moverYield;
  mover.y += normal.y * moverYield;

  const velocity = resolveClosingVelocity(
    defender,
    mover,
    normal.x,
    normal.y,
    defenderP.contactAuthority,
    moverP.contactAuthority
  );

  return {
    contact: true,
    x: closest.x,
    y: closest.y,
    overlap,
    defenderYield,
    moverYield,
    defenderAuthority: defenderP.contactAuthority,
    moverAuthority: moverP.contactAuthority,
    ...velocity
  };
}
