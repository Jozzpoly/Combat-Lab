export const TAU = Math.PI * 2;

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function invLerp(a, b, v) {
  if (Math.abs(b - a) < 1e-9) return 0;
  return clamp((v - a) / (b - a), 0, 1);
}

export function wrapAngle(a) {
  while (a <= -Math.PI) a += TAU;
  while (a > Math.PI) a -= TAU;
  return a;
}

export function angleDelta(from, to) {
  return wrapAngle(to - from);
}

export function moveToward(current, target, maxDelta) {
  const d = target - current;
  if (Math.abs(d) <= maxDelta) return target;
  return current + Math.sign(d) * maxDelta;
}

export function length(x, y) {
  return Math.hypot(x, y);
}

export function normalize(x, y, fallbackX = 1, fallbackY = 0) {
  const d = Math.hypot(x, y);
  if (d < 1e-9) return { x: fallbackX, y: fallbackY, length: 0 };
  return { x: x / d, y: y / d, length: d };
}

export function dot(ax, ay, bx, by) {
  return ax * bx + ay * by;
}

export function cross(ax, ay, bx, by) {
  return ax * by - ay * bx;
}

export function pointSegmentDistance(px, py, seg) {
  const abx = seg.bx - seg.ax;
  const aby = seg.by - seg.ay;
  const apx = px - seg.ax;
  const apy = py - seg.ay;
  const denom = abx * abx + aby * aby;
  const t = denom > 1e-9 ? clamp((apx * abx + apy * aby) / denom, 0, 1) : 0;
  const x = seg.ax + abx * t;
  const y = seg.ay + aby * t;
  return { distance: Math.hypot(px - x, py - y), t, x, y };
}

export function segmentCircleHit(seg, circle, padding = 0) {
  return pointSegmentDistance(circle.x, circle.y, seg).distance <= circle.r + padding;
}

export function segmentsIntersection(a, b) {
  const rx = a.bx - a.ax;
  const ry = a.by - a.ay;
  const sx = b.bx - b.ax;
  const sy = b.by - b.ay;
  const qpx = b.ax - a.ax;
  const qpy = b.ay - a.ay;
  const denom = cross(rx, ry, sx, sy);

  if (Math.abs(denom) < 1e-8) return null;

  const t = cross(qpx, qpy, sx, sy) / denom;
  const u = cross(qpx, qpy, rx, ry) / denom;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;

  return {
    x: a.ax + rx * t,
    y: a.ay + ry * t,
    tA: t,
    tB: u
  };
}

export function segmentIntersectsRect(seg, rect) {
  if (
    (seg.ax >= rect.x && seg.ax <= rect.x + rect.w && seg.ay >= rect.y && seg.ay <= rect.y + rect.h) ||
    (seg.bx >= rect.x && seg.bx <= rect.x + rect.w && seg.by >= rect.y && seg.by <= rect.y + rect.h)
  ) return true;

  const edges = [
    { ax: rect.x, ay: rect.y, bx: rect.x + rect.w, by: rect.y },
    { ax: rect.x + rect.w, ay: rect.y, bx: rect.x + rect.w, by: rect.y + rect.h },
    { ax: rect.x + rect.w, ay: rect.y + rect.h, bx: rect.x, by: rect.y + rect.h },
    { ax: rect.x, ay: rect.y + rect.h, bx: rect.x, by: rect.y }
  ];

  return edges.some(edge => segmentsIntersection(seg, edge));
}

export function sweptSegmentCircleHit(prev, next, circle, samples = 7) {
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const seg = {
      ax: lerp(prev.ax, next.ax, t),
      ay: lerp(prev.ay, next.ay, t),
      bx: lerp(prev.bx, next.bx, t),
      by: lerp(prev.by, next.by, t)
    };
    if (segmentCircleHit(seg, circle)) return true;
  }
  return false;
}

export function circleRectPenetration(circle, rect) {
  const nx = clamp(circle.x, rect.x, rect.x + rect.w);
  const ny = clamp(circle.y, rect.y, rect.y + rect.h);
  let dx = circle.x - nx;
  let dy = circle.y - ny;
  let d = Math.hypot(dx, dy);

  if (d >= circle.r) return null;

  if (d < 1e-8) {
    const left = Math.abs(circle.x - rect.x);
    const right = Math.abs(rect.x + rect.w - circle.x);
    const top = Math.abs(circle.y - rect.y);
    const bottom = Math.abs(rect.y + rect.h - circle.y);
    const best = Math.min(left, right, top, bottom);
    if (best === left) { dx = -1; dy = 0; }
    else if (best === right) { dx = 1; dy = 0; }
    else if (best === top) { dx = 0; dy = -1; }
    else { dx = 0; dy = 1; }
    d = 1;
  }

  return {
    nx: dx / d,
    ny: dy / d,
    depth: circle.r - d
  };
}

export function lineOfSightBlocked(ax, ay, bx, by, rects) {
  const seg = { ax, ay, bx, by };
  return rects.some(rect => segmentIntersectsRect(seg, rect));
}

export function nearestPointOnRect(px, py, rect) {
  return {
    x: clamp(px, rect.x, rect.x + rect.w),
    y: clamp(py, rect.y, rect.y + rect.h)
  };
}
