import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle, Circle, ClipboardList, Eraser, Hexagon, Info, Keyboard, MousePointerClick, Plus, Redo2,
  RotateCcw, Trash2, Undo2, Shapes,
} from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import Reveal from '../../components/Reveal.jsx';
import Stat from '../../components/Stat.jsx';
import Tex from '../../components/Tex.jsx';
import PolygonCanvas from './PolygonCanvas.jsx';
import { useHistory } from '../../hooks/useHistory.js';
import {
  circleAreaForPerimeter, hasDuplicateVertices, isSelfIntersecting, orientation, parseCoordinateText,
  perimeter, regularPolygonArea, round, shoelaceArea, shoelaceTerms, signedArea,
} from '../../utils/geometry.js';
import { fmt, tex } from '../../utils/format.js';

const PRESETS = {
  'Irregular plot': [{ x: 2, y: 2 }, { x: 9, y: 1 }, { x: 16, y: 3 }, { x: 18, y: 9 }, { x: 12, y: 12 }, { x: 7, y: 10 }, { x: 3, y: 7 }],
  'L-shape': [{ x: 3, y: 2 }, { x: 15, y: 2 }, { x: 15, y: 6 }, { x: 8, y: 6 }, { x: 8, y: 12 }, { x: 3, y: 12 }],
  Triangle: [{ x: 3, y: 2 }, { x: 17, y: 3 }, { x: 8, y: 12 }],
  'Square 8×8': [{ x: 6, y: 3 }, { x: 14, y: 3 }, { x: 14, y: 11 }, { x: 6, y: 11 }],
};
const DEFAULT_SHAPE = PRESETS['Irregular plot'];
const UNITS = ['units', 'm', 'cm', 'ft'];

export default function ShapeCalculator() {
  const h = useHistory(DEFAULT_SHAPE);
  const points = h.value;
  const [snap, setSnap] = useState(1);
  const [unit, setUnit] = useState('m');
  const [selected, setSelected] = useState(null);
  const [manual, setManual] = useState({ x: '', y: '' });
  const [manualErr, setManualErr] = useState(null);
  const [bulk, setBulk] = useState('');
  const [bulkErr, setBulkErr] = useState(null);
  const [showWorking, setShowWorking] = useState(true);

  const n = points.length;
  const area = shoelaceArea(points);
  const signed = signedArea(points);
  const per = perimeter(points);
  const orient = orientation(points);
  const crossing = isSelfIntersecting(points);
  const dupes = hasDuplicateVertices(points);
  const terms = useMemo(() => shoelaceTerms(points), [points]);
  const sum = terms.reduce((s, t) => s + t.term, 0);
  const regArea = n >= 3 ? regularPolygonArea(per, n) : 0;
  const circArea = n >= 3 ? circleAreaForPerimeter(per) : 0;
  const u2 = unit === 'units' ? 'sq. units' : `${unit}²`;

  /* ----- actions ----- */
  const addPoint = useCallback((p) => { h.set((pts) => [...pts, p]); setSelected(null); }, [h]);
  const movePoint = useCallback((i, p) => h.set((pts) => pts.map((q, k) => (k === i ? p : q)), { record: false }), [h]);
  const removePoint = useCallback((i) => { h.set((pts) => pts.filter((_, k) => k !== i)); setSelected(null); }, [h]);
  const editCoord = (i, axis, raw) => {
    const v = Number(raw);
    if (raw === '' || !Number.isFinite(v) || Math.abs(v) > 1000) return; // ignore invalid keystrokes
    h.set((pts) => pts.map((q, k) => (k === i ? { ...q, [axis]: v } : q)));
  };

  // keyboard shortcuts (ignored while typing in a field)
  useEffect(() => {
    const onKey = (e) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); h.undo(); }
      else if (mod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); h.redo(); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && selected !== null && selected < points.length) { e.preventDefault(); removePoint(selected); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [h, selected, points.length, removePoint]);

  const submitManual = (e) => {
    e.preventDefault();
    const x = Number(manual.x);
    const y = Number(manual.y);
    if (manual.x === '' || manual.y === '') return setManualErr('Enter both x and y.');
    if (!Number.isFinite(x) || !Number.isFinite(y)) return setManualErr('x and y must be numbers.');
    if (Math.abs(x) > 1000 || Math.abs(y) > 1000) return setManualErr('Keep coordinates between −1000 and 1000.');
    setManualErr(null);
    addPoint({ x, y });
    setManual({ x: '', y: '' });
  };

  const submitBulk = () => {
    const { points: pts, error } = parseCoordinateText(bulk);
    if (error) return setBulkErr(error);
    if (pts.some((p) => Math.abs(p.x) > 1000 || Math.abs(p.y) > 1000)) return setBulkErr('Keep coordinates between −1000 and 1000.');
    setBulkErr(null);
    h.set(pts);
    setSelected(null);
  };

  return (
    <section className="section" id="shape">
      <div className="container">
        <SectionHeader eyebrow="02 · Mode 1 · Irregular Shape Area Calculator" icon={Shapes} title={<>Measure any shape with the <span className="grad-text">Shoelace Formula</span></>}>
          Click on the grid to place the corners of a region. Drag corners to reshape it. The area is recalculated
          instantly from the coordinates — exactly how surveyors measure irregular plots of land.
        </SectionHeader>

        <Reveal className="note info" style={{ marginBottom: 20 }}>
          <Info size={18} />
          <span>
            <strong>This mode calculates the area of the shape you draw — not its maximum possible area.</strong>{' '}
            A fixed boundary encloses one fixed area. "Maximum area" is an optimisation question that needs a
            constraint (see the Optimisation Lab below).
          </span>
        </Reveal>

        <div className="shape-layout">
          {/* ---------- canvas column ---------- */}
          <Reveal className="card canvas-card">
            <div className="toolbar">
              <div className="btn-row">
                <button className="btn btn-sm" onClick={h.undo} disabled={!h.canUndo} title="Undo (Ctrl+Z)"><Undo2 size={15} /> Undo</button>
                <button className="btn btn-sm" onClick={h.redo} disabled={!h.canRedo} title="Redo (Ctrl+Y)"><Redo2 size={15} /> Redo</button>
                <button className="btn btn-sm" onClick={() => { h.set(DEFAULT_SHAPE); setSelected(null); }} title="Restore the sample irregular plot"><RotateCcw size={15} /> Reset</button>
                <button className="btn btn-sm btn-danger" onClick={() => { h.set([]); setSelected(null); }} disabled={n === 0} title="Remove all vertices"><Eraser size={15} /> Clear</button>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <span className="hint mono">snap</span>
                <div className="seg" role="group" aria-label="Snap to grid">
                  {[1, 0.5, 0].map((s) => (
                    <button key={s} className={snap === s ? 'active' : ''} onClick={() => setSnap(s)}>{s === 0 ? 'off' : s}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="canvas-wrap">
              <PolygonCanvas
                points={points}
                snap={snap}
                areaLabel={n >= 3 ? `A = ${fmt(area)} ${u2}` : ''}
                selected={selected}
                onSelect={setSelected}
                onAdd={addPoint}
                onMove={movePoint}
                onDragEnd={h.commit}
                onRemove={removePoint}
              />
              <AnimatePresence>
                {n < 3 && (
                  <motion.div className="canvas-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <MousePointerClick size={20} />
                    <span>{n === 0 ? 'Click anywhere on the grid to place the first vertex' : `Add ${3 - n} more vertex${3 - n > 1 ? 'es' : ''} to close the polygon`}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="row hint" style={{ marginTop: 12, gap: 16 }}>
              <span><b className="mint">Click</b> add vertex</span>
              <span><b className="mint">Drag</b> move vertex</span>
              <span><b className="mint">Double-click / right-click</b> delete vertex</span>
              <span><kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Y</kbd></span>
            </div>
            <div className="row" style={{ marginTop: 12, gap: 8 }}>
              <span className="hint mono">presets</span>
              {Object.entries(PRESETS).map(([name, pts]) => (
                <button key={name} className="btn btn-sm" onClick={() => { h.set(pts); setSelected(null); }}>{name}</button>
              ))}
            </div>
          </Reveal>

          {/* ---------- results column ---------- */}
          <div className="stack">
            <Reveal className="card" delay={0.05}>
              <div className="card-title" style={{ justifyContent: 'space-between' }}>
                <span className="row" style={{ gap: 10 }}><Hexagon size={18} /> Live results</span>
                <select className="select" style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }} value={unit} onChange={(e) => setUnit(e.target.value)} aria-label="Unit of length">
                  {UNITS.map((u) => <option key={u} value={u}>1 grid unit = 1 {u === 'units' ? 'unit' : u}</option>)}
                </select>
              </div>
              <div className="grid grid-2" style={{ gap: 12 }}>
                <Stat label="Area" value={area} unit={u2} highlight decimals={3} />
                <Stat label="Vertices" value={n} decimals={0} />
                <Stat label="Perimeter" value={per} unit={unit === 'units' ? 'units' : unit} decimals={3} />
                <Stat label="Order">
                  <span style={{ fontSize: 17 }} className={orient === 'degenerate' ? 'muted' : 'cyan'}>
                    {orient === 'degenerate' ? '—' : orient === 'clockwise' ? '↻ clockwise' : '↺ anticlockwise'}
                  </span>
                </Stat>
              </div>

              <div className="stack" style={{ gap: 10, marginTop: 14 }}>
                {n > 0 && n < 3 && <div className="note warn"><AlertTriangle size={16} /><span>A polygon needs at least <strong>3 vertices</strong>. Area = 0 for now.</span></div>}
                {n >= 3 && Math.abs(signed) < 1e-9 && <div className="note warn"><AlertTriangle size={16} /><span>All vertices are <strong>collinear</strong> — the region has zero area.</span></div>}
                {crossing && <div className="note warn"><AlertTriangle size={16} /><span><strong>Edges cross each other.</strong> The Shoelace Formula gives the true area only for a simple (non self-intersecting) polygon. Re-order or move the vertices.</span></div>}
                {dupes && !crossing && <div className="note warn"><AlertTriangle size={16} /><span>Two vertices are at the <strong>same point</strong>. Consider deleting one.</span></div>}
                {n >= 3 && !crossing && Math.abs(signed) >= 1e-9 && (
                  <div className="note ok"><Info size={16} /><span>Signed sum is <strong>{signed > 0 ? 'positive' : 'negative'}</strong> because the vertices run {orient}. The absolute value <Tex>{'|\\,\\cdot\\,|'}</Tex> makes the area the same either way.</span></div>
                )}
              </div>
            </Reveal>

            <Reveal className="card" delay={0.1}>
              <div className="card-title"><Circle size={18} /> How big <em>could</em> it be?</div>
              <p className="card-sub" style={{ marginBottom: 12 }}>
                A separate question: keeping the same perimeter ({fmt(per, 2)} {unit === 'units' ? 'units' : unit}), which shapes would enclose more?
              </p>
              {n >= 3 && !crossing ? (
                <div className="bench">
                  <BenchRow label="Your shape" value={area} max={circArea} u2={u2} color="var(--mint)" />
                  <BenchRow label={`Regular ${n}-gon`} value={regArea} max={circArea} u2={u2} color="var(--cyan)" />
                  <BenchRow label="Circle" value={circArea} max={circArea} u2={u2} color="var(--violet)" />
                  <p className="hint" style={{ marginTop: 8 }}>
                    Among all <Tex>{'n'}</Tex>-gons with perimeter <Tex>{'P'}</Tex>, the regular one is largest: <Tex>{'A=\\frac{P^2}{4n\\tan(\\pi/n)}'}</Tex>. No closed curve beats the circle, <Tex>{'A=\\frac{P^2}{4\\pi}'}</Tex> (isoperimetric inequality). Your shape uses <b className="mint">{fmt((area / circArea) * 100, 1)}%</b> of the circle&apos;s area.
                  </p>
                </div>
              ) : <p className="hint">Draw a simple polygon with at least 3 vertices to compare.</p>}
            </Reveal>
          </div>
        </div>

        {/* ---------- coordinates & manual entry ---------- */}
        <div className="grid grid-2" style={{ marginTop: 20 }}>
          <Reveal className="card">
            <div className="card-title"><ClipboardList size={18} /> Vertex coordinates <span className="badge cyan" style={{ marginLeft: 'auto' }}>n = {n}</span></div>
            <div className="table-wrap">
              <table className="data">
                <thead><tr><th>Vertex</th><th>x</th><th>y</th><th aria-label="Delete" /></tr></thead>
                <tbody>
                  {points.map((p, i) => (
                    <tr key={i} className={selected === i ? 'sel' : ''} onClick={() => setSelected(i)}>
                      <td>P{i + 1}</td>
                      <td><CoordInput value={p.x} onCommit={(v) => editCoord(i, 'x', v)} label={`x of P${i + 1}`} /></td>
                      <td><CoordInput value={p.y} onCommit={(v) => editCoord(i, 'y', v)} label={`y of P${i + 1}`} /></td>
                      <td><button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); removePoint(i); }} aria-label={`Delete P${i + 1}`}><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                  {n === 0 && <tr><td colSpan={4} className="muted" style={{ textAlign: 'center' }}>No vertices yet</td></tr>}
                </tbody>
              </table>
            </div>
            <form className="row" style={{ marginTop: 14, alignItems: 'flex-end' }} onSubmit={submitManual}>
              <div className="field" style={{ flex: 1, minWidth: 80 }}>
                <label htmlFor="mx">x</label>
                <input id="mx" className={`input${manualErr ? ' invalid' : ''}`} inputMode="decimal" value={manual.x} onChange={(e) => setManual({ ...manual, x: e.target.value })} placeholder="e.g. 4" />
              </div>
              <div className="field" style={{ flex: 1, minWidth: 80 }}>
                <label htmlFor="my">y</label>
                <input id="my" className={`input${manualErr ? ' invalid' : ''}`} inputMode="decimal" value={manual.y} onChange={(e) => setManual({ ...manual, y: e.target.value })} placeholder="e.g. 7.5" />
              </div>
              <button type="submit" className="btn btn-primary"><Plus size={16} /> Add vertex</button>
            </form>
            {manualErr && <p className="error-text" style={{ marginTop: 8 }}><AlertTriangle size={14} />{manualErr}</p>}
          </Reveal>

          <Reveal className="card" delay={0.05}>
            <div className="card-title"><Keyboard size={18} /> Enter a full list of coordinates</div>
            <p className="card-sub" style={{ marginBottom: 10 }}>Type the vertices in order around the boundary (clockwise or anticlockwise). Any of these formats work: <span className="mono">(0,0) (4,0) (4,3)</span> or one pair per line.</p>
            <textarea
              className="textarea"
              rows={5}
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              placeholder={'(3,4) (5,11) (12,8) (9,5) (5,6)'}
              aria-label="Coordinate list"
            />
            {bulkErr && <p className="error-text" style={{ marginTop: 8 }}><AlertTriangle size={14} />{bulkErr}</p>}
            <div className="btn-row" style={{ marginTop: 12 }}>
              <button className="btn btn-primary" onClick={submitBulk}>Draw polygon</button>
              <button className="btn" onClick={() => setBulk(points.map((p) => `(${round(p.x)}, ${round(p.y)})`).join(' '))} disabled={n === 0}>Copy current shape here</button>
              <button className="btn" onClick={() => { setBulk('(3,4) (5,11) (12,8) (9,5) (5,6)'); setBulkErr(null); }}>Load NCERT-style example</button>
            </div>
          </Reveal>
        </div>

        {/* ---------- step-by-step working ---------- */}
        <Reveal className="card" style={{ marginTop: 20 }}>
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <span className="row" style={{ gap: 10 }}><Hexagon size={18} /> Shoelace Formula — step-by-step working</span>
            <button className="btn btn-sm" onClick={() => setShowWorking((s) => !s)}>{showWorking ? 'Hide' : 'Show'} working</button>
          </div>
          <div className="eq-block" style={{ marginBottom: 14 }}>
            <Tex block>{'A=\\frac12\\left|\\sum_{i=1}^{n}\\left(x_i\\,y_{i+1}-x_{i+1}\\,y_i\\right)\\right|,\\qquad (x_{n+1},y_{n+1})=(x_1,y_1)'}</Tex>
          </div>
          <AnimatePresence initial={false}>
            {showWorking && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                {n >= 3 ? (
                  <>
                    <div className="table-wrap">
                      <table className="data">
                        <thead>
                          <tr><th>i</th><th>(xᵢ, yᵢ)</th><th>(xᵢ₊₁, yᵢ₊₁)</th><th>xᵢ·yᵢ₊₁</th><th>xᵢ₊₁·yᵢ</th><th>difference</th></tr>
                        </thead>
                        <tbody>
                          {terms.map((t) => (
                            <tr key={t.i}>
                              <td>{t.i + 1}</td>
                              <td>({fmt(t.from.x)}, {fmt(t.from.y)})</td>
                              <td>({fmt(t.to.x)}, {fmt(t.to.y)}){t.i === n - 1 ? ' ↩ P1' : ''}</td>
                              <td>{fmt(t.forward, 4)}</td>
                              <td>{fmt(t.backward, 4)}</td>
                              <td className={t.term >= 0 ? 'mint' : 'rose'}>{fmt(t.term, 4)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr><td colSpan={5}>Σ (sum of differences)</td><td>{fmt(sum, 4)}</td></tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className="eq-block cyan" style={{ marginTop: 14 }}>
                      <Tex block>{`A=\\tfrac12\\,\\left|${tex(sum, 4)}\\right| = \\tfrac12\\times ${tex(Math.abs(sum), 4)} = \\boxed{${tex(area, 4)}\\ \\text{${u2.replace('²', '}^2\\text{')}}}`}</Tex>
                    </div>
                  </>
                ) : <p className="hint">Add at least three vertices to see the working.</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}

/** Number input that only commits valid numbers (on blur / Enter), keeping invalid typing local. */
function CoordInput({ value, onCommit, label }) {
  const [text, setText] = useState(String(round(value)));
  const [bad, setBad] = useState(false);
  useEffect(() => { setText(String(round(value))); setBad(false); }, [value]);
  const commit = () => {
    const v = Number(text);
    if (text.trim() === '' || !Number.isFinite(v) || Math.abs(v) > 1000) { setBad(true); return; }
    setBad(false);
    if (v !== value) onCommit(text);
  };
  return (
    <input
      className={`input${bad ? ' invalid' : ''}`}
      value={text}
      inputMode="decimal"
      aria-label={label}
      title={bad ? 'Enter a number between −1000 and 1000' : undefined}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); } }}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

function BenchRow({ label, value, max, u2, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="bench-row">
      <div className="row" style={{ justifyContent: 'space-between', fontSize: 13.5 }}>
        <span>{label}</span>
        <span className="mono">{fmt(value, 2)} {u2}</span>
      </div>
      <div className="bar"><motion.div style={{ background: color }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} /></div>
    </div>
  );
}
