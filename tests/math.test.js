import { describe, it, expect } from 'vitest';
import {
  shoelaceArea, signedArea, orientation, perimeter, centroid, isSelfIntersecting,
  regularPolygonArea, circleAreaForPerimeter, parseCoordinateText, shoelaceTerms,
} from '../src/utils/geometry.js';
import {
  analyseRectangle, areaFn, firstDerivative, maxArea, criticalLength, trend,
  sampleAreaCurve, fixedPerimeterComparison, independentLimitsComparison, validatePositive,
  tangentSegment,
} from '../src/utils/optimisation.js';

const sq = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }];

describe('Shoelace formula', () => {
  it('square 4×4 = 16', () => expect(shoelaceArea(sq)).toBe(16));
  it('same area clockwise and anticlockwise', () => {
    const cw = [...sq].reverse();
    expect(shoelaceArea(cw)).toBe(16);
    expect(signedArea(sq)).toBe(16);
    expect(signedArea(cw)).toBe(-16);
    expect(orientation(sq)).toBe('anticlockwise');
    expect(orientation(cw)).toBe('clockwise');
  });
  it('starting vertex does not matter', () => {
    const rotated = [sq[2], sq[3], sq[0], sq[1]];
    expect(shoelaceArea(rotated)).toBe(16);
  });
  it('triangle (0,0),(4,0),(0,3) = 6', () => {
    expect(shoelaceArea([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 }])).toBe(6);
  });
  it('irregular pentagon textbook example = 30', () => {
    // (3,4),(5,11),(12,8),(9,5),(5,6) → 30
    const p = [{ x: 3, y: 4 }, { x: 5, y: 11 }, { x: 12, y: 8 }, { x: 9, y: 5 }, { x: 5, y: 6 }];
    expect(shoelaceArea(p)).toBe(30);
  });
  it('concave L-shape = 12', () => {
    const L = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 4 }, { x: 0, y: 4 }];
    expect(shoelaceArea(L)).toBe(12);
    expect(shoelaceArea([...L].reverse())).toBe(12);
  });
  it('negative coordinates and decimals', () => {
    const p = [{ x: -1.5, y: -1 }, { x: 2.5, y: -1 }, { x: 2.5, y: 1.5 }, { x: -1.5, y: 1.5 }];
    expect(shoelaceArea(p)).toBeCloseTo(10, 12);
  });
  it('fewer than 3 points or collinear → 0', () => {
    expect(shoelaceArea([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(0);
    expect(shoelaceArea([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }])).toBe(0);
    expect(orientation([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }])).toBe('degenerate');
  });
  it('terms sum to twice the signed area', () => {
    const sum = shoelaceTerms(sq).reduce((s, t) => s + t.term, 0);
    expect(sum).toBe(32);
  });
  it('perimeter & centroid', () => {
    expect(perimeter(sq)).toBe(16);
    expect(perimeter([{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 0, y: 4 }])).toBe(12);
    expect(centroid(sq)).toEqual({ x: 2, y: 2 });
  });
  it('self-intersection detection', () => {
    const bowtie = [{ x: 0, y: 0 }, { x: 4, y: 4 }, { x: 4, y: 0 }, { x: 0, y: 4 }];
    expect(isSelfIntersecting(bowtie)).toBe(true);
    expect(isSelfIntersecting(sq)).toBe(false);
  });
  it('regular polygon / circle benchmarks', () => {
    expect(regularPolygonArea(16, 4)).toBeCloseTo(16, 10); // square side 4
    expect(regularPolygonArea(12, 3)).toBeCloseTo(Math.sqrt(3) / 4 * 16, 10); // eq. triangle side 4
    expect(circleAreaForPerimeter(2 * Math.PI)).toBeCloseTo(Math.PI, 10); // r = 1
  });
  it('parses coordinate text in multiple formats', () => {
    expect(parseCoordinateText('(0,0) (4,0) (4,3)').points).toEqual([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 3 }]);
    expect(parseCoordinateText('0 0\n4 0\n4 3\n-1.5 2').points.length).toBe(4);
    expect(parseCoordinateText('1,2,3').error).toBeTruthy();
    expect(parseCoordinateText('a,b').error).toBeTruthy();
    expect(parseCoordinateText('(0,0) (1,1)').error).toBeTruthy();
  });
});

describe('Fixed perimeter optimisation', () => {
  it('P = 40: L* = 10, Amax = 100', () => {
    expect(criticalLength(40)).toBe(10);
    expect(maxArea(40)).toBe(100);
    expect(firstDerivative(40, 10)).toBe(0);
    expect(trend(40, 10)).toBe('stationary');
  });
  it('P = 40, L = 6 → B = 14, A = 84, 84 %, increasing', () => {
    const r = analyseRectangle(40, 6);
    expect(r.B).toBe(14);
    expect(r.A).toBe(84);
    expect(r.difference).toBe(16);
    expect(r.percent).toBeCloseTo(84, 10);
    expect(r.dA).toBe(8);
    expect(r.d2A).toBe(-2);
    expect(r.trend).toBe('increasing');
  });
  it('P = 40, L = 15 → decreasing, A = 75', () => {
    expect(areaFn(40, 15)).toBe(75);
    expect(trend(40, 15)).toBe('decreasing');
  });
  it('no sampled value exceeds P²/16 (numerical check of the maximum)', () => {
    for (const P of [1, 7, 40, 123.4, 1000]) {
      const curve = sampleAreaCurve(P, 400);
      const best = Math.max(...curve.map((d) => d.A));
      expect(best).toBeCloseTo(maxArea(P), 9);
      curve.forEach((d) => expect(d.A).toBeLessThanOrEqual(maxArea(P) + 1e-9));
    }
  });
  it('tangent at max is horizontal and above the curve elsewhere', () => {
    const [a, b] = tangentSegment(40, 10);
    expect(a.y).toBeCloseTo(100); expect(b.y).toBeCloseTo(100);
    const [c, d] = tangentSegment(40, 4);
    expect(c.y).toBeGreaterThanOrEqual(areaFn(40, c.x) - 1e-9);
    expect(d.y).toBeGreaterThanOrEqual(areaFn(40, d.x) - 1e-9);
  });
});

describe('Calculator panel conditions', () => {
  it('fixed perimeter: 12 × 8 → P 40, A 96, 96 % of 100', () => {
    const r = fixedPerimeterComparison(12, 8);
    expect(r.P).toBe(40); expect(r.A).toBe(96); expect(r.Amax).toBe(100);
    expect(r.percent).toBeCloseTo(96); expect(r.side).toBe(10); expect(r.isSquare).toBe(false);
    expect(fixedPerimeterComparison(5, 5).isSquare).toBe(true);
  });
  it('independent limits: 12 × 8 within 15 × 10 → 96 / 150 = 64 %', () => {
    const r = independentLimitsComparison(12, 8, 15, 10);
    expect(r.Amax).toBe(150); expect(r.percent).toBeCloseTo(64); expect(r.withinLimits).toBe(true);
    expect(independentLimitsComparison(16, 8, 15, 10).withinLimits).toBe(false);
  });
  it('validation', () => {
    expect(validatePositive('', 'L')).toMatch(/required/);
    expect(validatePositive('abc', 'L')).toMatch(/number/);
    expect(validatePositive('-3', 'L')).toMatch(/greater/);
    expect(validatePositive('0', 'L')).toMatch(/greater/);
    expect(validatePositive('5', 'L')).toBeNull();
  });
});
