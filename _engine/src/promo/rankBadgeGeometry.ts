/** Pure SVG geometry helpers for the 3D rank badges. No React, no RN imports. */

export type Point = [number, number];

/** Round to 1 decimal place. */
const r1 = (v: number): number => Math.round(v * 10) / 10;

/** Six hexagon vertices around (cx,cy) at radius r, rotated by `rot` radians. */
export function hexAngles(cx: number, cy: number, r: number, rot = 0): Point[] {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3 + rot;
    return [r1(cx + r * Math.cos(a)), r1(cy + r * Math.sin(a))] as Point;
  });
}

/** Hexagon vertices as an SVG `points` string. */
export function hexPoints(cx: number, cy: number, r: number, rot = 0): string {
  return hexAngles(cx, cy, r, rot)
    .map((p) => p.join(','))
    .join(' ');
}

/** 2n star vertices alternating outer radius `oR` and inner radius `iR`. */
export function starPoints(
  cx: number,
  cy: number,
  oR: number,
  iR: number,
  n: number,
  startAngle = -Math.PI / 2,
): Point[] {
  return Array.from({ length: n * 2 }, (_, i) => {
    const a = startAngle + (i * Math.PI) / n;
    const rr = i % 2 === 0 ? oR : iR;
    return [r1(cx + rr * Math.cos(a)), r1(cy + rr * Math.sin(a))] as Point;
  });
}

/** Serialize a vertex array to an SVG `points` string. */
export function toPoints(arr: Point[]): string {
  return arr.map((p) => `${r1(p[0])},${r1(p[1])}`).join(' ');
}

/** A `count`-vertex slice of `pts` starting at `start` (wrapping), closed to the center. */
export function sector(
  pts: Point[],
  start: number,
  count: number,
  cx: number,
  cy: number,
): string {
  const seg = Array.from(
    { length: count },
    (_, i) => pts[(start + i) % pts.length],
  );
  return toPoints([...seg, [cx, cy]]);
}

/** A triangle from vertices a, b to the center (cx,cy) as a points string. */
export function tri(a: Point, b: Point, cx: number, cy: number): string {
  return `${r1(a[0])},${r1(a[1])} ${r1(b[0])},${r1(b[1])} ${cx},${cy}`;
}
