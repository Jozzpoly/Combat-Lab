export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function normalize(x, y, fallbackX = 1, fallbackY = 0) {
  const length = Math.hypot(x, y);
  if (length <= 1e-9) return { x: fallbackX, y: fallbackY, length: 0 };
  return { x: x / length, y: y / length, length };
}

export function segmentIntersection(a, b) {
  const rX = a.bx - a.ax;
  const rY = a.by - a.ay;
  const sX = b.bx - b.ax;
  const sY = b.by - b.ay;
  const denominator = rX * sY - rY * sX;
  if (Math.abs(denominator) < 1e-9) return null;

  const qpx = b.ax - a.ax;
  const qpy = b.ay - a.ay;
  const t = (qpx * sY - qpy * sX) / denominator;
  const u = (qpx * rY - qpy * rX) / denominator;

  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return {
    x: a.ax + rX * t,
    y: a.ay + rY * t,
    t,
    u
  };
}

export function pointSegmentDistance(px, py, seg) {
  const dx = seg.bx - seg.ax;
  const dy = seg.by - seg.ay;
  const lengthSq = dx * dx + dy * dy;
  const t = lengthSq > 1e-9
    ? clamp(((px - seg.ax) * dx + (py - seg.ay) * dy) / lengthSq, 0, 1)
    : 0;
  const x = seg.ax + dx * t;
  const y = seg.ay + dy * t;
  return {
    x,
    y,
    t,
    distance: Math.hypot(px - x, py - y)
  };
}
