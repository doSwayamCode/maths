import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, FlaskConical, Pause, Play, RotateCcw, Target } from 'lucide-react';
import SectionHeader from '../../components/SectionHeader.jsx';
import Reveal from '../../components/Reveal.jsx';
import Stat from '../../components/Stat.jsx';
import AnimatedNumber from '../../components/AnimatedNumber.jsx';
import FeedbackIndicator from '../../components/FeedbackIndicator.jsx';
import AreaGraph from './AreaGraph.jsx';
import RectangleViz from './RectangleViz.jsx';
import DerivativePanel from './DerivativePanel.jsx';
import { analyseRectangle, validatePositive } from '../../utils/optimisation.js';
import { fmt } from '../../utils/format.js';

/*
 * The slider works in integer steps k = 1 … STEPS−1 with L = k · (P/2) / STEPS.
 * STEPS is even, so k = STEPS/2 gives L = P/4 EXACTLY (no floating-point miss).
 * k = 0 and k = STEPS are excluded because then L or B would be 0 (no rectangle).
 */
const STEPS = 1000;
const MID = STEPS / 2;
const UNITS = ['m', 'cm', 'ft'];

export default function OptimisationLab() {
  const [pText, setPText] = useState('40');
  const [P, setP] = useState(40);
  const [unit, setUnit] = useState('m');
  const [k, setK] = useState(150);
  const [sweeping, setSweeping] = useState(false);
  const [sound, setSound] = useState(false);
  const raf = useRef(null);

  const pError = validatePositive(pText, 'Perimeter', { max: 100000 });
  const L = (k * (P / 2)) / STEPS;
  const r = analyseRectangle(P, L);
  const isMax = k === MID;
  // exact values at the critical point (avoid 99.9999 % from rounding)
  const shown = isMax ? { ...r, L: P / 4, B: P / 4, A: r.Amax, difference: 0, percent: 100, dA: 0, trend: 'stationary' } : r;

  const onPChange = (v) => {
    setPText(v);
    if (!validatePositive(v, 'Perimeter', { max: 100000 })) setP(Number(v));
  };

  const stopSweep = () => { cancelAnimationFrame(raf.current); setSweeping(false); };

  /** Demonstration: sweep L from small to large, then settle on the optimum. */
  const startSweep = () => {
    if (sweeping) return stopSweep();
    setSweeping(true);
    const t0 = performance.now();
    const run = (t) => {
      const s = (t - t0) / 1000;
      let next;
      if (s < 4) next = 40 + (920 * s) / 4; // 40 → 960
      else if (s < 5.2) { const e = (s - 4) / 1.2; const ease = 1 - (1 - e) ** 3; next = 960 + (MID - 960) * ease; } // settle on max
      else { setK(MID); setSweeping(false); return; }
      setK(Math.round(next));
      raf.current = requestAnimationFrame(run);
    };
    raf.current = requestAnimationFrame(run);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const fill = `${((k - 1) / (STEPS - 2)) * 100}%`;

  return (
    <section className="section" id="lab">
      <div className="container">
        <SectionHeader eyebrow="03 · Mode 2 · Maxima & Minima Optimisation Lab" icon={FlaskConical} title={<>Fixed perimeter. <span className="grad-text">Which rectangle wins?</span></>}>
          Keep the perimeter P fixed and change the length L. The breadth adjusts automatically, the area
          changes, and the derivative tells us exactly where the maximum is.
        </SectionHeader>

        {/* ---------- controls ---------- */}
        <Reveal className="card lab-controls">
          <div className="lab-controls-grid">
            <div className="field">
              <label htmlFor="perim">Perimeter P (fixed)</label>
              <div className="row" style={{ gap: 8, flexWrap: 'nowrap' }}>
                <div className="input-wrap" style={{ flex: 1 }}>
                  <input id="perim" className={`input${pError ? ' invalid' : ''}`} inputMode="decimal" value={pText} onChange={(e) => onPChange(e.target.value)} aria-invalid={!!pError} />
                  <span className="input-unit">{unit}</span>
                </div>
                <select className="select" style={{ width: 76 }} value={unit} onChange={(e) => setUnit(e.target.value)} aria-label="Unit">
                  {UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              {pError ? <span className="error-text"><AlertTriangle size={13} />{pError} Using P = {fmt(P)} {unit}.</span>
                : <span className="hint">0 &lt; L &lt; P/2 = {fmt(P / 2, 3)} {unit}</span>}
            </div>

            <div className="field">
              <label htmlFor="lslider">Length L = <b className="cyan">{fmt(shown.L, 3)} {unit}</b> · Breadth B = P/2 − L = <b className="cyan">{fmt(shown.B, 3)} {unit}</b></label>
              <input
                id="lslider" type="range" className="range" min={1} max={STEPS - 1} step={1} value={k}
                style={{ '--fill': fill }}
                onChange={(e) => { if (sweeping) stopSweep(); setK(Number(e.target.value)); }}
                aria-valuetext={`L = ${fmt(shown.L, 3)} ${unit}`}
              />
              <div className="row slider-scale mono">
                <span>≈0</span><span className="cyan">P/4 = {fmt(P / 4, 3)}</span><span>≈{fmt(P / 2, 2)}</span>
              </div>
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => { stopSweep(); setK(MID); }}><Target size={16} /> Jump to optimum (L = P/4)</button>
            <button className="btn" onClick={startSweep}>{sweeping ? <><Pause size={16} /> Stop sweep</> : <><Play size={16} /> Animate sweep</>}</button>
            <button className="btn" onClick={() => { stopSweep(); setK(150); setPText('40'); setP(40); }}><RotateCcw size={16} /> Reset</button>
            <button className="btn btn-sm" onClick={() => { stopSweep(); setK((v) => Math.max(1, v - 1)); }} aria-label="Decrease L by one step">L −</button>
            <button className="btn btn-sm" onClick={() => { stopSweep(); setK((v) => Math.min(STEPS - 1, v + 1)); }} aria-label="Increase L by one step">L +</button>
          </div>
        </Reveal>

        {/* ---------- live results ---------- */}
        <div className="grid grid-4 lab-stats" style={{ marginTop: 20 }}>
          <Stat label="Current area A" value={shown.A} unit={`${unit}²`} decimals={3} highlight={isMax} />
          <Stat label="Maximum area" value={shown.Amax} unit={`${unit}²`} decimals={3} color="var(--blue-ink)" />
          <Stat label="Max − current" value={shown.difference} unit={`${unit}²`} decimals={3} color={isMax ? 'var(--mint-ink)' : 'var(--orange-ink)'} />
          <Stat label="% of maximum">
            <span className={isMax ? 'mint' : ''}><AnimatedNumber value={shown.percent} decimals={2} suffix="%" /></span>
            <div className="bar" style={{ marginTop: 8 }}><div style={{ width: `${shown.percent}%`, background: isMax ? 'var(--mint)' : 'var(--yellow)' }} /></div>
          </Stat>
        </div>

        <div className="lab-main" style={{ marginTop: 20 }}>
          <Reveal className="card">
            <div className="card-title">Area function A(L) — live graph</div>
            <AreaGraph P={P} L={shown.L} A={shown.A} unit={unit} />
            <p className="hint" style={{ marginTop: 6 }}>Hover over the curve to read values. The tangent becomes horizontal (slope 0) exactly at the top of the curve.</p>
          </Reveal>
          <Reveal className="card" delay={0.05}>
            <div className="card-title">Rectangle with perimeter {fmt(P)} {unit}</div>
            <RectangleViz P={P} L={shown.L} B={shown.B} isMax={isMax} unit={unit} />
            <FeedbackIndicator percent={shown.percent} isMax={isMax} sound={sound} onToggleSound={() => setSound((s) => !s)} compact />
          </Reveal>
        </div>

        <Reveal className="card" style={{ marginTop: 20 }}>
          <div className="card-title">Derivative calculations — substituted live</div>
          <DerivativePanel r={shown} unit={unit} />
        </Reveal>
      </div>
    </section>
  );
}
