import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { centroid } from '../../utils/geometry.js';
import { fmt } from '../../utils/format.js';

const BASE = { minX: 0, maxX: 20, minY: 0, maxY: 14 };
const PAD = 1.2; // world units of padding around the drawing area

function niceStep(range) {
  const raw = range / 20;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const m = raw / pow;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * pow;
}

/** Bounds that always contain the base grid and every vertex. */
function computeBounds(points) {
  let { minX, maxX, minY, maxY } = BASE;
  points.forEach((p) => {
    minX = Math.min(minX, Math.floor(p.x) - 1);
    maxX = Math.max(maxX, Math.ceil(p.x) + 1);
    minY = Math.min(minY, Math.floor(p.y) - 1);
    maxY = Math.max(maxY, Math.ceil(p.y) + 1);
  });
  return { minX, maxX, minY, maxY };
}

/**
 * Interactive coordinate grid.
 *  - click empty space → add vertex
 *  - drag a vertex     → move it (one undo step per drag)
 *  - double-click / right-click a vertex → delete it
 * World coordinates are mathematical (y up); the SVG flips them.
 */
export default function PolygonCanvas({ points, snap, areaLabel, onAdd, onMove, onDragEnd, onRemove, selected, onSelect }) {
  const svgRef = useRef(null);
  const drag = useRef(null); // { index, before }
  const down = useRef(null); // pointer-down position for click detection
  const [frozen, setFrozen] = useState(null); // bounds frozen while dragging
  const [hover, setHover] = useState(null);

  const live = useMemo(() => computeBounds(points), [points]);
  const b = frozen ?? live;
  const W = b.maxX - b.minX;
  const H = b.maxY - b.minY;
  const scale = 40; // svg px per world unit (viewBox space)
  const vb = { x: (b.minX - PAD) * scale, y: -(b.maxY + PAD) * scale, w: (W + 2 * PAD) * scale, h: (H + 2 * PAD) * scale };
  const sx = (x) => x * scale;
  const sy = (y) => -y * scale;
  const step = niceStep(Math.max(W, H));
  const r = vb.w / 95; // vertex radius scales with zoom

  const toWorld = (evt) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const snapTo = (v) => (snap > 0 ? Math.round(v / snap) * snap : Math.round(v * 100) / 100);
    return { x: snapTo(p.x / scale), y: snapTo(-p.y / scale) };
  };

  const handleVertexDown = (e, index) => {
    e.stopPropagation();
    if (e.button === 2) return;
    svgRef.current.setPointerCapture(e.pointerId);
    drag.current = { index, before: points, moved: false };
    setFrozen(live);
    onSelect(index);
  };

  const handleDown = (e) => {
    if (e.button !== 0) return;
    down.current = { x: e.clientX, y: e.clientY };
  };

  const handleMove = (e) => {
    if (drag.current) {
      const w = toWorld(e);
      const cur = points[drag.current.index];
      if (cur && (cur.x !== w.x || cur.y !== w.y)) {
        drag.current.moved = true;
        onMove(drag.current.index, w);
      }
    } else if (e.pointerType === 'mouse') {
      setHover(toWorld(e));
    }
  };

  const handleUp = (e) => {
    if (drag.current) {
      if (drag.current.moved) onDragEnd(drag.current.before);
      drag.current = null;
      setFrozen(null);
      try { svgRef.current.releasePointerCapture(e.pointerId); } catch { /* not captured */ }
      return;
    }
    if (down.current) {
      const moved = Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y);
      down.current = null;
      if (moved < 6) onAdd(toWorld(e));
    }
  };

  // grid lines
  const lines = [];
  const startX = Math.ceil((b.minX - PAD) / step) * step;
  for (let x = startX; x <= b.maxX + PAD; x += step) lines.push({ k: `x${x}`, x1: sx(x), x2: sx(x), y1: vb.y, y2: vb.y + vb.h, axis: Math.abs(x) < 1e-9, label: x, v: true });
  const startY = Math.ceil((b.minY - PAD) / step) * step;
  for (let y = startY; y <= b.maxY + PAD; y += step) lines.push({ k: `y${y}`, x1: vb.x, x2: vb.x + vb.w, y1: sy(y), y2: sy(y), axis: Math.abs(y) < 1e-9, label: y, v: false });

  const n = points.length;
  const d = n ? `M${points.map((p) => `${sx(p.x)},${sy(p.y)}`).join('L')}${n >= 3 ? 'Z' : ''}` : '';
  const c = n >= 3 ? centroid(points) : null;
  const last = n >= 2 ? [points[n - 2], points[n - 1]] : null;
  const fontSize = vb.w / 60;

  return (
    <svg
      ref={svgRef}
      className="poly-canvas"
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerLeave={() => setHover(null)}
      onContextMenu={(e) => e.preventDefault()}
      role="application"
      aria-label="Coordinate grid. Click to add a vertex, drag a vertex to move it, double-click a vertex to delete it."
    >
      <defs>
        <linearGradient id="polyFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3cf5c0" stopOpacity="0.32" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0.12" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={r * 0.8} result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* grid */}
      {lines.map((l) => (
        <line key={l.k} x1={l.x1} x2={l.x2} y1={l.y1} y2={l.y2} stroke={l.axis ? 'rgba(180,200,230,.45)' : 'rgba(120,200,255,.09)'} strokeWidth={l.axis ? 2 : 1} />
      ))}
      {lines.map((l) => (l.v ? (
        <text key={`t${l.k}`} x={l.x1 + 4} y={sy(b.minY - PAD) - 6} fontSize={fontSize} fill="#5f7290" fontFamily="JetBrains Mono">{fmt(l.label, 2)}</text>
      ) : (
        <text key={`t${l.k}`} x={vb.x + 6} y={l.y1 - 4} fontSize={fontSize} fill="#5f7290" fontFamily="JetBrains Mono">{fmt(l.label, 2)}</text>
      )))}

      {/* polygon fill — fades in again each time a vertex is added */}
      {n >= 3 && (
        <motion.path key={`fill-${n}`} d={d} fill="url(#polyFill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} />
      )}
      {n >= 2 && (
        <path d={d} fill="none" stroke="#3cf5c0" strokeWidth={r * 0.42} strokeLinejoin="round" filter="url(#glow)" />
      )}
      {/* the most recent edge is drawn with an animation */}
      {last && (
        <motion.line
          key={`edge-${n}`}
          x1={sx(last[0].x)} y1={sy(last[0].y)} x2={sx(last[1].x)} y2={sy(last[1].y)}
          stroke="#fff" strokeWidth={r * 0.42} strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: 0 }} transition={{ duration: 0.7 }}
        />
      )}
      {/* closing edge hint */}
      {n >= 3 && (
        <line x1={sx(points[n - 1].x)} y1={sy(points[n - 1].y)} x2={sx(points[0].x)} y2={sy(points[0].y)} stroke="#22d3ee" strokeWidth={r * 0.25} strokeDasharray={`${r} ${r * 0.7}`} opacity="0.9" />
      )}

      {/* area label at centroid */}
      {c && (
        <text x={sx(c.x)} y={sy(c.y)} textAnchor="middle" dominantBaseline="middle" fontSize={fontSize * 1.1} fill="rgba(232,241,255,.7)" fontWeight="600" fontFamily="JetBrains Mono" pointerEvents="none">
          {areaLabel}
        </text>
      )}

      {/* hover crosshair (mouse only) */}
      {hover && !drag.current && (
        <g pointerEvents="none" opacity="0.7">
          <circle cx={sx(hover.x)} cy={sy(hover.y)} r={r * 0.55} fill="none" stroke="#22d3ee" strokeDasharray="3 3" />
          <text x={sx(hover.x) + r} y={sy(hover.y) - r} fontSize={fontSize} fill="#22d3ee" fontFamily="JetBrains Mono">({fmt(hover.x)}, {fmt(hover.y)})</text>
        </g>
      )}

      {/* vertices */}
      {points.map((p, i) => (
        <g key={i}>
          <motion.circle
            cx={sx(p.x)} cy={sy(p.y)} r={r}
            initial={i === n - 1 ? { scale: 0 } : false} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            fill={selected === i ? '#3cf5c0' : '#04070f'} stroke={i === 0 ? '#22d3ee' : '#3cf5c0'} strokeWidth={r * 0.35}
            style={{ cursor: 'grab', transformBox: 'fill-box', transformOrigin: 'center' }}
            onPointerDown={(e) => handleVertexDown(e, i)}
            onDoubleClick={(e) => { e.stopPropagation(); onRemove(i); }}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(i); }}
          />
          {/* larger invisible hit target for touch */}
          <circle cx={sx(p.x)} cy={sy(p.y)} r={r * 2.2} fill="transparent" style={{ cursor: 'grab' }}
            onPointerDown={(e) => handleVertexDown(e, i)}
            onDoubleClick={(e) => { e.stopPropagation(); onRemove(i); }}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(i); }} />
          <text x={sx(p.x) + r * 1.3} y={sy(p.y) - r * 1.3} fontSize={fontSize} fill={selected === i ? '#3cf5c0' : '#b4c3dc'} fontFamily="JetBrains Mono" pointerEvents="none">
            P{i + 1}{selected === i ? ` (${fmt(p.x)}, ${fmt(p.y)})` : ''}
          </text>
        </g>
      ))}
    </svg>
  );
}
