/**
 * Mode 2 — Maxima & Minima of a rectangle with FIXED PERIMETER P.
 *
 *   2(L + B) = P  ⇒  B = P/2 − L
 *   A(L)   = L(P/2 − L) = (P/2)L − L²
 *   A'(L)  = P/2 − 2L
 *   A''(L) = −2  (< 0 ⇒ maximum)
 *   A'(L) = 0  ⇒  L = P/4,  B = P/4,  A_max = P²/16
 */

export const breadthFromLength = (P, L) => P / 2 - L;
export const areaFn = (P, L) => L * (P / 2 - L);
export const firstDerivative = (P, L) => P / 2 - 2 * L;
export const secondDerivative = () => -2;
export const criticalLength = (P) => P / 4;
export const maxArea = (P) => (P * P) / 16;

/** 'increasing' | 'decreasing' | 'stationary' based on the sign of A'(L). */
export function trend(P, L, tolerance = 1e-9) {
  const d = firstDerivative(P, L);
  const tol = Math.max(tolerance, P * 1e-6);
  if (Math.abs(d) <= tol) return 'stationary';
  return d > 0 ? 'increasing' : 'decreasing';
}

/** Full snapshot of the experiment for a given P and L. */
export function analyseRectangle(P, L) {
  const B = breadthFromLength(P, L);
  const A = areaFn(P, L);
  const Amax = maxArea(P);
  return {
    P,
    L,
    B,
    A,
    Amax,
    difference: Amax - A,
    percent: Amax > 0 ? (A / Amax) * 100 : 0,
    dA: firstDerivative(P, L),
    d2A: secondDerivative(),
    Lstar: criticalLength(P),
    trend: trend(P, L),
  };
}

/** Sample A(L) on [0, P/2] for graphing. Each point is tagged increasing/decreasing. */
export function sampleAreaCurve(P, samples = 120) {
  const half = P / 2;
  const Lstar = P / 4;
  const data = [];
  for (let k = 0; k <= samples; k++) {
    const L = (half * k) / samples;
    const A = areaFn(P, L);
    data.push({
      L,
      A,
      // split series so the chart can colour the rising and falling parts
      rising: L <= Lstar + 1e-12 ? A : null,
      falling: L >= Lstar - 1e-12 ? A : null,
    });
  }
  // guarantee the exact vertex is present in both halves (for a seamless join)
  if (!data.some((d) => Math.abs(d.L - Lstar) < 1e-12)) {
    const A = maxArea(P);
    data.push({ L: Lstar, A, rising: A, falling: A });
    data.sort((a, b) => a.L - b.L);
  }
  return data;
}

/**
 * Tangent line to A(L) at L0, clipped to [0, P/2]. Returns two endpoints.
 * Because A is concave, the tangent lies on or above the curve.
 */
export function tangentSegment(P, L0, halfWidth = P / 16) {
  const A0 = areaFn(P, L0);
  const m = firstDerivative(P, L0);
  const x1 = Math.max(0, L0 - halfWidth);
  const x2 = Math.min(P / 2, L0 + halfWidth);
  return [
    { x: x1, y: A0 + m * (x1 - L0) },
    { x: x2, y: A0 + m * (x2 - L0) },
  ];
}

/* ---------- Calculator panel (two separate conditions) ---------- */

/**
 * CONDITION 1 — Fixed perimeter.
 * The rectangle L × B has perimeter P = 2(L+B). Among ALL rectangles with that
 * same perimeter, the maximum area is the square of side P/4: A_max = P²/16.
 */
export function fixedPerimeterComparison(L, B) {
  const P = 2 * (L + B);
  const A = L * B;
  const side = P / 4;
  const Amax = maxArea(P);
  return {
    P,
    A,
    side,
    Amax,
    percent: Amax > 0 ? (A / Amax) * 100 : 0,
    shortfall: Amax - A,
    isSquare: Math.abs(L - B) <= 1e-9 * Math.max(1, L, B),
  };
}

/**
 * CONDITION 2 — Independent upper limits: 0 < L ≤ Lmax and 0 < B ≤ Bmax,
 * with NO link between L and B. A = L·B increases in L and in B separately
 * (∂A/∂L = B > 0, ∂A/∂B = L > 0), so there is no interior critical point; the
 * maximum is at the boundary: A_max = Lmax × Bmax.
 */
export function independentLimitsComparison(L, B, Lmax, Bmax) {
  const A = L * B;
  const Amax = Lmax * Bmax;
  return {
    A,
    Amax,
    percent: Amax > 0 ? (A / Amax) * 100 : 0,
    shortfall: Amax - A,
    withinLimits: L <= Lmax + 1e-12 && B <= Bmax + 1e-12,
  };
}

/**
 * Validate a user-entered positive length. Returns an error string or null.
 */
export function validatePositive(raw, label, { max = 1e6 } = {}) {
  if (raw === '' || raw === null || raw === undefined) return `${label} is required.`;
  const v = Number(raw);
  if (!Number.isFinite(v)) return `${label} must be a number.`;
  if (v <= 0) return `${label} must be greater than 0.`;
  if (v > max) return `${label} must be at most ${max.toLocaleString('en-IN')}.`;
  return null;
}
