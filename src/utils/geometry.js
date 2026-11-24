/**
 * Polygon geometry utilities (Mode 1 — Irregular Shape Area Calculator).
 *
 * All functions take an array of vertices [{ x, y }, ...] in order around
 * the boundary. Coordinates are standard mathematical (y increases upwards).
 */

/** Round to a fixed number of decimals, avoiding "-0" and float noise like 12.000000001. */
export function round(value, decimals = 4) {
  if (!Number.isFinite(value)) return value;
  const f = 10 ** decimals;
  const r = Math.round((value + Number.EPSILON * Math.sign(value)) * f) / f;
  return Object.is(r, -0) ? 0 : r;
}

/**
 * Individual Shoelace terms: (x_i * y_{i+1} − x_{i+1} * y_i) for every edge,
 * wrapping the last vertex back to the first so the polygon is closed.
 */
export function shoelaceTerms(points) {
  const n = points.length;
  if (n < 3) return [];
  return points.map((p, i) => {
    const q = points[(i + 1) % n];
    const forward = p.x * q.y; // x_i · y_{i+1}
    const backward = q.x * p.y; // x_{i+1} · y_i
    return { i, from: p, to: q, forward, backward, term: forward - backward };
  });
}

/**
 * Signed area (½ Σ (x_i y_{i+1} − x_{i+1} y_i)).
 *  > 0  → vertices listed anticlockwise
 *  < 0  → vertices listed clockwise
 */
export function signedArea(points) {
  if (points.length < 3) return 0;
  const sum = shoelaceTerms(points).reduce((s, t) => s + t.term, 0);
  return sum / 2;
}

/**
 * Shoelace Formula: A = ½ |Σ (x_i y_{i+1} − x_{i+1} y_i)|.
 * Taking the absolute value makes the result independent of whether the
 * vertices were entered clockwise or anticlockwise.
 */
export function shoelaceArea(points) {
  return Math.abs(signedArea(points));
}

/** 'anticlockwise' | 'clockwise' | 'degenerate' (zero area / fewer than 3 points). */
export function orientation(points) {
  const s = signedArea(points);
  if (points.length < 3 || Math.abs(s) < 1e-12) return 'degenerate';
  return s > 0 ? 'anticlockwise' : 'clockwise';
}

export function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Perimeter of the closed polygon (length of the boundary). */
export function perimeter(points) {
  const n = points.length;
  if (n < 2) return 0;
  if (n === 2) return distance(points[0], points[1]); // an open segment
  let p = 0;
  for (let i = 0; i < n; i++) p += distance(points[i], points[(i + 1) % n]);
  return p;
}

/** Centroid of the polygon region (falls back to vertex average when area ≈ 0). */
export function centroid(points) {
  const n = points.length;
  if (n === 0) return { x: 0, y: 0 };
  const A = signedArea(points);
  if (n < 3 || Math.abs(A) < 1e-12) {
    return {
      x: points.reduce((s, p) => s + p.x, 0) / n,
      y: points.reduce((s, p) => s + p.y, 0) / n,
    };
  }
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < n; i++) {
    const p = points[i];
    const q = points[(i + 1) % n];
    const cross = p.x * q.y - q.x * p.y;
    cx += (p.x + q.x) * cross;
    cy += (p.y + q.y) * cross;
  }
  return { x: cx / (6 * A), y: cy / (6 * A) };
}

/* ---------- Self-intersection check ---------- */

function orient(a, b, c) {
  const v = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  if (Math.abs(v) < 1e-12) return 0;
  return v > 0 ? 1 : -1;
}

function onSegment(a, b, c) {
  // is c on segment ab (given collinear)?
  return (
    Math.min(a.x, b.x) - 1e-12 <= c.x &&
    c.x <= Math.max(a.x, b.x) + 1e-12 &&
    Math.min(a.y, b.y) - 1e-12 <= c.y &&
    c.y <= Math.max(a.y, b.y) + 1e-12
  );
}

export function segmentsIntersect(p1, p2, p3, p4) {
  const d1 = orient(p3, p4, p1);
  const d2 = orient(p3, p4, p2);
  const d3 = orient(p1, p2, p3);
  const d4 = orient(p1, p2, p4);
  if (d1 !== d2 && d3 !== d4) return true;
  if (d1 === 0 && onSegment(p3, p4, p1)) return true;
  if (d2 === 0 && onSegment(p3, p4, p2)) return true;
  if (d3 === 0 && onSegment(p1, p2, p3)) return true;
  if (d4 === 0 && onSegment(p1, p2, p4)) return true;
  return false;
}

/**
 * True when two non-adjacent edges cross (or touch). The Shoelace Formula only
 * gives the true enclosed area for a SIMPLE (non self-intersecting) polygon.
 */
export function isSelfIntersecting(points) {
  const n = points.length;
  if (n < 4) return false;
  for (let i = 0; i < n; i++) {
    const a1 = points[i];
    const a2 = points[(i + 1) % n];
    for (let j = i + 1; j < n; j++) {
      // skip edges that share a vertex
      if (j === i || (j + 1) % n === i || (i + 1) % n === j) continue;
      const b1 = points[j];
      const b2 = points[(j + 1) % n];
      if (segmentsIntersect(a1, a2, b1, b2)) return true;
    }
  }
  return false;
}

/** Index pairs of vertices that are at the same location. */
export function hasDuplicateVertices(points) {
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (distance(points[i], points[j]) < 1e-9) return true;
    }
  }
  return false;
}

/* ---------- Benchmarks for "how big could it be?" ---------- */

/**
 * Area of a REGULAR n-gon with perimeter P:  A = P² / (4n · tan(π/n)).
 * Among all n-sided polygons with the same perimeter, the regular one has the
 * greatest area (e.g. n = 4 → square, A = P²/16).
 */
export function regularPolygonArea(perimeterValue, n) {
  if (n < 3 || perimeterValue <= 0) return 0;
  return (perimeterValue * perimeterValue) / (4 * n * Math.tan(Math.PI / n));
}

/**
 * Area of a circle with circumference P:  A = P² / (4π).
 * By the isoperimetric inequality no closed curve of length P encloses more.
 */
export function circleAreaForPerimeter(perimeterValue) {
  if (perimeterValue <= 0) return 0;
  return (perimeterValue * perimeterValue) / (4 * Math.PI);
}

/**
 * Parse free-text coordinates such as
 *   "(0,0) (4,0) (4,3)"  or  "0 0\n4 0\n4 3"  or  "0,0; 4,0; 4,3"
 * Returns { points, error }.
 */
export function parseCoordinateText(text) {
  const cleaned = text.trim();
  if (!cleaned) return { points: [], error: 'Please type at least three coordinate pairs.' };
  const numbers = cleaned.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi);
  // reject stray characters that are not numbers / separators / brackets
  if (/[^\d\s.,;()\[\]\-+eE]/.test(cleaned)) {
    return { points: [], error: 'Only numbers, commas, spaces, semicolons and brackets are allowed.' };
  }
  if (!numbers || numbers.length % 2 !== 0) {
    return { points: [], error: 'Each vertex needs exactly two numbers (x and y).' };
  }
  const points = [];
  for (let i = 0; i < numbers.length; i += 2) {
    const x = Number(numbers[i]);
    const y = Number(numbers[i + 1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return { points: [], error: `Vertex ${i / 2 + 1} is not a valid number pair.` };
    }
    points.push({ x, y });
  }
  if (points.length < 3) return { points, error: 'A polygon needs at least 3 vertices.' };
  return { points, error: null };
}
