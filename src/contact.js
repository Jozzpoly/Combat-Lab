import { normalize, segmentIntersection } from "./math.js";
import { derivePhenotype, shieldOf } from "./phenotype.js";

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

  return {
    contact: true,
    overlap,
    movedA,
    movedB,
    authorityA: pa.contactAuthority,
    authorityB: pb.contactAuthority
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
