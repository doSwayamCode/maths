import { describe, it, expect } from 'vitest';
import { largestInscribedRectangle, rectangleInsidePolygon, pointInPolygon } from '../src/utils/inscribed.js';
import { shoelaceArea } from '../src/utils/geometry.js';

const circle = (r, n = 96) => Array.from({ length: n }, (_, k) => ({ x: r * Math.cos((2 * Math.PI * k) / n), y: r * Math.sin((2 * Math.PI * k) / n) }));

describe('Largest rectangle inside a random-shaped field', () => {
  it('point in polygon', () => {
    const sq = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }];
    expect(pointInPolygon({ x: 2, y: 2 }, sq)).toBe(true);
    expect(pointInPolygon({ x: 5, y: 2 }, sq)).toBe(false);
  });
  it('square field 8×8 → whole field (64)', () => {
    const r = largestInscribedRectangle([{ x: 0, y: 0 }, { x: 8, y: 0 }, { x: 8, y: 8 }, { x: 0, y: 8 }]);
    expect(r.area).toBeGreaterThan(63.5);
    expect(r.area).toBeLessThanOrEqual(64 * (1 + 1e-6));
  });
  it('rotated square (diamond) is found by rotating the search', () => {
    const diamond = [{ x: 0, y: -5 }, { x: 5, y: 0 }, { x: 0, y: 5 }, { x: -5, y: 0 }]; // area 50
    expect(largestInscribedRectangle(diamond).area).toBeGreaterThan(48.5);
    // without rotation the best axis-aligned rectangle is only half (25)
    const fixed = largestInscribedRectangle(diamond, { allowRotation: false });
    expect(fixed.area).toBeGreaterThan(24); expect(fixed.area).toBeLessThanOrEqual(25 * (1 + 1e-6));
  });
  it('right triangle legs 4 → half its area (4)', () => {
    const r = largestInscribedRectangle([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 4 }]);
    expect(r.area).toBeGreaterThan(3.85); expect(r.area).toBeLessThanOrEqual(4 * (1 + 1e-6));
  });
  it('circle r = 5 → square, area 2r² = 50 (calculus answer)', () => {
    const r = largestInscribedRectangle(circle(5));
    expect(r.area).toBeGreaterThan(48); expect(r.area).toBeLessThanOrEqual(50 * (1 + 1e-6));
    expect(r.width / r.height).toBeLessThan(1.1); // nearly a square
  });
  it('L-shaped field (area 12) → 8', () => {
    const L = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 4 }, { x: 0, y: 4 }];
    const r = largestInscribedRectangle(L);
    expect(r.area).toBeGreaterThan(7.8); expect(r.area).toBeLessThanOrEqual(8 * (1 + 1e-6));
  });
  it('result always lies inside the field (random irregular plot), both vertex orders', () => {
    const plot = [{ x: 2, y: 2 }, { x: 9, y: 1 }, { x: 16, y: 3 }, { x: 18, y: 9 }, { x: 12, y: 12 }, { x: 7, y: 10 }, { x: 3, y: 7 }];
    for (const pts of [plot, [...plot].reverse()]) {
      const r = largestInscribedRectangle(pts);
      expect(rectangleInsidePolygon(r.corners, pts)).toBe(true);
      expect(r.area).toBeLessThan(shoelaceArea(pts));
      expect(r.area).toBeGreaterThan(0.5 * shoelaceArea(pts));
    }
  });
  it('rejects a rectangle that crosses the boundary', () => {
    const L = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 4 }, { x: 0, y: 4 }];
    expect(rectangleInsidePolygon([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }], L)).toBe(false);
  });
  it('runs fast enough for live use', () => {
    const t = performance.now();
    largestInscribedRectangle(circle(5, 40));
    expect(performance.now() - t).toBeLessThan(400);
  });
});
