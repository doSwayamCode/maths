/**
 * Largest rectangle that fits inside a random-shaped field (simple polygon).
 *
 * For a random shape there is no formula like A = P²/16, so we use NUMERICAL
 * OPTIMISATION: the computer tests rectangles at many orientations and keeps the
 * largest one that lies completely inside the field.
 *
 *  1. Rotate the field by an angle θ.
 *  2. Lay a fine grid over it; keep only grid cells that are fully inside.
 *  3. Find the biggest block of inside cells (a classic "maximal rectangle"
 *     search using histograms), giving the best rectangle for that θ.
 *  4. Repeat for θ from 0° to 90° (a rectangle looks the same after 90°), then
 *     refine around the best angle with a finer grid.
 *  5. Every candidate is checked EXACTLY against the field boundary before it is
 *     accepted, so the answer always genuinely fits.
 *  6. Finally each side of the winner is pushed outward (binary search) until it
 *     touches the boundary, removing most of the grid error.
 *
 * The result is a very close lower estimate of the true maximum.
 */
import { centroid, segmentsIntersect } from './geometry.js';

/** Ray-casting point-in-polygon test (points exactly on the boundary may go either way). */
export function pointInPolygon(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

const rotate = (p, c, ang) => {
  const cos = Math.cos(ang);
  const sin = Math.sin(ang);
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return { x: c.x + dx * cos - dy * sin, y: c.y + dx * sin + dy * cos };
};

/** Largest axis-aligned rectangle made of grid cells lying inside `poly`. */
function largestAxisAligned(poly, res) {
  let minX = Infinity; let maxX = -Infinity; let minY = Infinity; let maxY = -Infinity;
  for (const p of poly) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }
  const W = maxX - minX;
  const H = maxY - minY;
  if (W <= 0 || H <= 0) return null;
  // square-ish cells: `res` cells along the longer side
  const cell = Math.max(W, H) / res;
  const nx = Math.max(1, Math.ceil(W / cell));
  const ny = Math.max(1, Math.ceil(H / cell));

  // inside-ness of every grid corner
  const corner = new Uint8Array((nx + 1) * (ny + 1));
  for (let j = 0; j <= ny; j++) {
    for (let i = 0; i <= nx; i++) {
      corner[j * (nx + 1) + i] = pointInPolygon({ x: minX + i * cell, y: minY + j * cell }, poly) ? 1 : 0;
    }
  }
  // cells containing a polygon vertex are blocked (catches sharp inward notches)
  const blocked = new Uint8Array(nx * ny);
  for (const p of poly) {
    const i = Math.floor((p.x - minX) / cell);
    const j = Math.floor((p.y - minY) / cell);
    if (i >= 0 && i < nx && j >= 0 && j < ny) blocked[j * nx + i] = 1;
  }

  // maximal rectangle in a binary matrix (histogram + stack), O(nx·ny)
  const heights = new Int32Array(nx);
  let best = { area: 0 };
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const ok = corner[j * (nx + 1) + i] && corner[j * (nx + 1) + i + 1]
        && corner[(j + 1) * (nx + 1) + i] && corner[(j + 1) * (nx + 1) + i + 1] && !blocked[j * nx + i];
      heights[i] = ok ? heights[i] + 1 : 0;
    }
    const stack = [];
    for (let i = 0; i <= nx; i++) {
      const h = i === nx ? 0 : heights[i];
      while (stack.length && heights[stack[stack.length - 1]] >= h) {
        const top = stack.pop();
        const height = heights[top];
        const left = stack.length ? stack[stack.length - 1] + 1 : 0;
        const width = i - left;
        const area = width * height;
        if (height > 0 && area > best.area) {
          best = { area, x0: minX + left * cell, x1: minX + i * cell, y1: minY + (j + 1) * cell, y0: minY + (j + 1 - height) * cell };
        }
      }
      stack.push(i);
    }
  }
  if (!best.area) return null;
  return { x0: best.x0, x1: best.x1, y0: best.y0, y1: best.y1, area: (best.x1 - best.x0) * (best.y1 - best.y0) };
}

/** Exact check that a rectangle (4 corners) lies inside the polygon. */
export function rectangleInsidePolygon(rect, poly) {
  // shrink very slightly so a rectangle touching the boundary still counts
  const c = { x: rect.reduce((s, p) => s + p.x, 0) / 4, y: rect.reduce((s, p) => s + p.y, 0) / 4 };
  const r = rect.map((p) => ({ x: c.x + (p.x - c.x) * (1 - 1e-9), y: c.y + (p.y - c.y) * (1 - 1e-9) }));
  if (!r.every((p) => pointInPolygon(p, poly))) return false;
  for (let i = 0; i < 4; i++) {
    const a = r[i];
    const b = r[(i + 1) % 4];
    for (let k = 0; k < poly.length; k++) {
      if (segmentsIntersect(a, b, poly[k], poly[(k + 1) % poly.length])) return false;
    }
  }
  // no polygon vertex may poke into the rectangle
  return !poly.some((p) => pointInPolygon(p, r));
}

/**
 * Search for the largest rectangle inside the polygon.
 * @returns {{corners, width, height, area, angle}} | null
 */
export function largestInscribedRectangle(points, { allowRotation = true, coarseRes = 70, fineRes = 160 } = {}) {
  if (points.length < 3) return null;
  const c = centroid(points);
  let best = null;

  const tryAngle = (deg, res) => {
    const th = (deg * Math.PI) / 180;
    const rotated = points.map((p) => rotate(p, c, -th));
    const r = largestAxisAligned(rotated, res);
    if (!r || (best && r.area <= best.area)) return;
    const box = [{ x: r.x0, y: r.y0 }, { x: r.x1, y: r.y0 }, { x: r.x1, y: r.y1 }, { x: r.x0, y: r.y1 }];
    if (!rectangleInsidePolygon(box, rotated)) return; // exact safety check
    best = { deg, th, rotated, r, area: r.area };
  };

  /** Push each side outward as far as the boundary allows (binary search on the exact check). */
  const expand = (b) => {
    let { x0, x1, y0, y1 } = b.r;
    const xs = b.rotated.map((p) => p.x);
    const ys = b.rotated.map((p) => p.y);
    const lim = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
    const fits = (a0, a1, b0, b1) => rectangleInsidePolygon(
      [{ x: a0, y: b0 }, { x: a1, y: b0 }, { x: a1, y: b1 }, { x: a0, y: b1 }], b.rotated,
    );
    for (let pass = 0; pass < 3; pass++) {
      for (const side of ['x0', 'x1', 'y0', 'y1']) {
        const cur = { x0, x1, y0, y1 };
        let lo = 0;
        let hi = Math.abs(lim[side] - cur[side]);
        const dir = side.endsWith('0') ? -1 : 1;
        for (let it = 0; it < 40 && hi - lo > 1e-9; it++) {
          const mid = (lo + hi) / 2;
          const t = { ...cur, [side]: cur[side] + dir * mid };
          if (fits(t.x0, t.x1, t.y0, t.y1)) lo = mid; else hi = mid;
        }
        if (side === 'x0') x0 -= lo; else if (side === 'x1') x1 += lo; else if (side === 'y0') y0 -= lo; else y1 += lo;
      }
    }
    const corners = [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }].map((p) => rotate(p, c, b.th));
    let width = x1 - x0;
    let height = y1 - y0;
    let angle = ((b.deg % 180) + 180) % 180;
    if (height > width) { [width, height] = [height, width]; angle = (angle + 90) % 180; }
    return { corners, width, height, area: width * height, angle: Math.round(angle * 10) / 10 };
  };

  if (!allowRotation) {
    tryAngle(0, fineRes * 1.5);
    return best ? expand(best) : null;
  }
  for (let d = 0; d < 90; d += 2) tryAngle(d, coarseRes);
  const start = best ? best.deg : 0;
  for (let d = start - 2; d <= start + 2 + 1e-9; d += 0.5) tryAngle(d, fineRes);
  tryAngle(0, fineRes); // always consider the field's own axes at full resolution
  return best ? expand(best) : null;
}
