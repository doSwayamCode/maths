import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Calculator, Lock, Ruler, Scale, Square } from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import Reveal from '../components/Reveal.jsx';
import Stat from '../components/Stat.jsx';
import Tex from '../components/Tex.jsx';
import { fixedPerimeterComparison, independentLimitsComparison, validatePositive } from '../utils/optimisation.js';
import { fmt, tex } from '../utils/format.js';

const MAX = 100000;

function NumField({ id, label, value, onChange, error, unit }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <input id={id} className={`input${error ? ' invalid' : ''}`} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} />
        <span className="input-unit">{unit}</span>
      </div>
      {error && <span className="error-text"><AlertTriangle size={13} />{error}</span>}
    </div>
  );
}

/**
 * Calculator panel. Two DIFFERENT mathematical conditions are kept apart:
 *  1. Fixed perimeter  → best rectangle is the square, A_max = P²/16.
 *  2. Independent limits L ≤ Lmax, B ≤ Bmax → A_max = Lmax·Bmax (boundary maximum).
 */
export default function DimensionCalculator() {
  const [form, setForm] = useState({ L: '12', B: '8', Lmax: '15', Bmax: '10' });
  const [unit, setUnit] = useState('m');
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(() => compute({ L: 12, B: 8, Lmax: 15, Bmax: 10 }));
  const [tab, setTab] = useState('perimeter');

  function compute(v) {
    return {
      ...v,
      fp: fixedPerimeterComparison(v.L, v.B),
      il: independentLimitsComparison(v.L, v.B, v.Lmax, v.Bmax),
    };
  }

  const set = (k) => (val) => setForm((f) => ({ ...f, [k]: val }));

  const calculate = (e) => {
    e?.preventDefault();
    const errs = {
      L: validatePositive(form.L, 'Length', { max: MAX }),
      B: validatePositive(form.B, 'Breadth', { max: MAX }),
      Lmax: validatePositive(form.Lmax, 'Length limit', { max: MAX }),
      Bmax: validatePositive(form.Bmax, 'Breadth limit', { max: MAX }),
    };
    const v = Object.fromEntries(Object.entries(form).map(([k, x]) => [k, Number(x)]));
    if (!errs.L && !errs.Lmax && v.L > v.Lmax) errs.Lmax = 'Length limit must be ≥ the length L.';
    if (!errs.B && !errs.Bmax && v.B > v.Bmax) errs.Bmax = 'Breadth limit must be ≥ the breadth B.';
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setResult(compute(v));
  };

  const { fp, il } = result;
  const u2 = `${unit}²`;

  return (
    <section className="section" id="calculator">
      <div className="container">
        <SectionHeader eyebrow="04 · Rectangle Calculator" icon={Calculator} title={<>Two conditions, <span className="grad-text">two different maxima</span></>}>
          Enter a rectangle&apos;s length and breadth. The calculator compares it with the best possible rectangle —
          but "best" depends entirely on which condition is fixed. The two conditions are treated separately.
        </SectionHeader>

        <div className="calc-layout">
          <Reveal className="card calc-input">
            <div className="card-title"><Ruler size={18} /> Your rectangle</div>
            <form className="stack" onSubmit={calculate} noValidate>
              <div className="grid grid-2" style={{ gap: 12 }}>
                <NumField id="cl" label="Length L" value={form.L} onChange={set('L')} error={errors.L} unit={unit} />
                <NumField id="cb" label="Breadth B" value={form.B} onChange={set('B')} error={errors.B} unit={unit} />
              </div>
              <div className="field">
                <label htmlFor="cu">Unit</label>
                <div className="seg" id="cu" role="group" aria-label="Unit">
                  {['m', 'cm', 'ft'].map((u) => <button type="button" key={u} className={unit === u ? 'active' : ''} onClick={() => setUnit(u)}>{u}</button>)}
                </div>
              </div>
              <div className="divider-label"><Lock size={13} /> Only for Condition 2 — independent limits</div>
              <div className="grid grid-2" style={{ gap: 12 }}>
                <NumField id="clm" label="Max length (L max)" value={form.Lmax} onChange={set('Lmax')} error={errors.Lmax} unit={unit} />
                <NumField id="cbm" label="Max breadth (B max)" value={form.Bmax} onChange={set('Bmax')} error={errors.Bmax} unit={unit} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg"><Calculator size={18} /> Calculate</button>
            </form>

            <div className="grid grid-2" style={{ gap: 12, marginTop: 18 }}>
              <Stat label="Current area" value={fp.A} unit={u2} decimals={3} highlight />
              <Stat label="Perimeter" value={fp.P} unit={unit} decimals={3} />
            </div>
          </Reveal>

          <div className="stack">
            <div className="seg calc-tabs" role="tablist">
              <button role="tab" aria-selected={tab === 'perimeter'} className={tab === 'perimeter' ? 'active' : ''} onClick={() => setTab('perimeter')}>Condition 1 · Fixed perimeter</button>
              <button role="tab" aria-selected={tab === 'limits'} className={tab === 'limits' ? 'active' : ''} onClick={() => setTab('limits')}>Condition 2 · Independent limits</button>
            </div>

            <AnimatePresence mode="wait">
              {tab === 'perimeter' ? (
                <motion.div key="p" className="card condition-card mint-edge" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="card-title"><Square size={18} /> Condition 1 — the perimeter is fixed</div>
                  <p className="card-sub">Constraint: <Tex>{'2(L+B)=P'}</Tex> stays the same, so <Tex>L</Tex> and <Tex>B</Tex> are linked. This is the derivative problem from the lab.</p>
                  <div className="grid grid-3" style={{ gap: 12, margin: '16px 0' }}>
                    <Stat label="Max area (square)" value={fp.Amax} unit={u2} decimals={3} color="var(--blue-ink)" />
                    <Stat label="% of maximum" value={fp.percent} unit="%" decimals={2} highlight={fp.isSquare} />
                    <Stat label="Area lost" value={fp.shortfall} unit={u2} decimals={3} color={fp.isSquare ? 'var(--mint-ink)' : 'var(--orange-ink)'} />
                  </div>
                  <CompareBars a={fp.A} b={fp.Amax} labelA={`Your ${fmt(result.L)} × ${fmt(result.B)} rectangle`} labelB={`Square ${fmt(fp.side, 3)} × ${fmt(fp.side, 3)} (same perimeter)`} u2={u2} />
                  <div className="eq-block" style={{ marginTop: 14 }}>
                    <Tex block>{`\\begin{gathered}P=2(${tex(result.L, 3)}+${tex(result.B, 3)})=${tex(fp.P, 3)} \\\\ A_{\\max}=\\frac{P^2}{16}=\\frac{${tex(fp.P, 3)}^2}{16}=${tex(fp.Amax, 3)}\\end{gathered}`}</Tex>
                  </div>
                  <p className="hint" style={{ marginTop: 10 }}>
                    {fp.isSquare
                      ? 'Your rectangle is already a square — it has the maximum possible area for this perimeter.'
                      : `With the same ${fmt(fp.P, 3)} ${unit} of boundary, a square encloses ${fmt(fp.shortfall, 3)} ${u2} more.`}
                  </p>
                </motion.div>
              ) : (
                <motion.div key="l" className="card condition-card cyan-edge" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="card-title"><Scale size={18} /> Condition 2 — length and breadth have separate limits</div>
                  <p className="card-sub">Constraint: <Tex>{'0<L\\le L_{\\max}'}</Tex> and <Tex>{'0<B\\le B_{\\max}'}</Tex>, chosen <b>independently</b>. The perimeter is <b>not</b> fixed here.</p>
                  <div className="grid grid-3" style={{ gap: 12, margin: '16px 0' }}>
                    <Stat label="Max area" value={il.Amax} unit={u2} decimals={3} color="var(--blue-ink)" />
                    <Stat label="% of maximum" value={il.percent} unit="%" decimals={2} highlight={il.percent >= 99.9999} />
                    <Stat label="Area unused" value={il.shortfall} unit={u2} decimals={3} color={il.shortfall < 1e-9 ? 'var(--mint-ink)' : 'var(--orange-ink)'} />
                  </div>
                  <CompareBars a={il.A} b={il.Amax} labelA={`Your ${fmt(result.L)} × ${fmt(result.B)} rectangle`} labelB={`Largest allowed ${fmt(result.Lmax)} × ${fmt(result.Bmax)}`} u2={u2} />
                  <div className="eq-block cyan" style={{ marginTop: 14 }}>
                    <Tex block>{`\\begin{gathered}A=L\\,B,\\quad \\frac{\\partial A}{\\partial L}=B>0,\\ \\frac{\\partial A}{\\partial B}=L>0 \\\\ \\Rightarrow\\; A_{\\max}=L_{\\max}B_{\\max}=${tex(result.Lmax, 3)}\\times${tex(result.Bmax, 3)}=${tex(il.Amax, 3)}\\end{gathered}`}</Tex>
                  </div>
                  <p className="hint" style={{ marginTop: 10 }}>
                    Area keeps increasing as either side grows, so there is <b>no turning point</b> (no A′ = 0). The maximum is at the
                    boundary — use both full limits. The answer need not be a square. (Partial derivatives are shown only for completeness; the idea is simply that a bigger side gives a bigger area.)
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="note warn">
              <AlertTriangle size={18} />
              <span><strong>Do not mix the two conditions.</strong> "Square is best" is true only when the <em>perimeter</em> is fixed. When each side has its own upper limit, the best rectangle simply uses both limits.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompareBars({ a, b, labelA, labelB, u2 }) {
  const pa = b > 0 ? Math.min(100, (a / b) * 100) : 0;
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="bench-row">
        <div className="row" style={{ justifyContent: 'space-between', fontSize: 13.5 }}><span>{labelA}</span><span className="mono">{fmt(a, 3)} {u2}</span></div>
        <div className="bar"><motion.div style={{ background: 'var(--mint)' }} initial={{ width: 0 }} animate={{ width: `${pa}%` }} transition={{ duration: 0.8 }} /></div>
      </div>
      <div className="bench-row">
        <div className="row" style={{ justifyContent: 'space-between', fontSize: 13.5 }}><span>{labelB}</span><span className="mono">{fmt(b, 3)} {u2}</span></div>
        <div className="bar"><motion.div style={{ background: 'var(--blue)' }} initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.8 }} /></div>
      </div>
    </div>
  );
}
