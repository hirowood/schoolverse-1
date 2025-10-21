export function circleIntersectsRect(cx: number, cy: number, r: number, x: number, y: number, w: number, h: number) {
  const dx = Math.max(x, Math.min(cx, x + w)) - cx;
  const dy = Math.max(y, Math.min(cy, y + h)) - cy;
  return dx * dx + dy * dy <= r * r;
}
