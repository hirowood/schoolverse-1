export function follow(targetX: number, targetY: number, viewW: number, viewH: number, mapW: number, mapH: number) {
  const x = Math.max(0, Math.min(mapW - viewW, targetX - viewW / 2));
  const y = Math.max(0, Math.min(mapH - viewH, targetY - viewH / 2));
  return { x, y };
}
