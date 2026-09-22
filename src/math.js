export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export function normalize(x, y, fallbackX = 1, fallbackY = 0) {
  const length = Math.hypot(x, y);
  if (length <= 1e-9) return { x: fallbackX, y: fallbackY, length: 0 };
  return { x: x / length, y: y / length, length };
}

export function wrapAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}
