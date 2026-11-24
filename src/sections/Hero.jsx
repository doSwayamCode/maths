import { useRef, useState } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';
import { ArrowDown, Award, Cpu, Sigma } from 'lucide-react';
import Tex from '../components/Tex.jsx';
import { areaFn, maxArea } from '../utils/optimisation.js';
import { C, MONO } from '../styles/theme.js';

const P = 40;

/** Live animated visual: a fixed-perimeter rectangle sweeps through shapes while its point travels along A(L). */
function HeroVisual() {
  const [L, setL] = useState(4);
  const t0 = useRef(null);
  useAnimationFrame((t) => {
    if (t0.current === null) t0.current = t;
    const s = ((t - t0.current) / 7000) * Math.PI * 2;
    setL(10 + 8 * Math.sin(s)); // L sweeps 2 → 18 (P/2 = 20)
  });
  const B = P / 2 - L;
  const A = areaFn(P, L);
  const Amax = maxArea(P);

  // graph geometry
  const gx = (l) => 30 + (l / 20) * 300;
  const gy = (a) => 190 - (a / Amax) * 150;
  let curve = '';
  for (let i = 0; i <= 60; i++) {
    const l = (20 * i) / 60;
    curve += `${i ? 'L' : 'M'}${gx(l).toFixed(1)},${gy(areaFn(P, l)).toFixed(1)}`;
  }
  const near = Math.abs(L - 10) < 0.6;
  // rectangle geometry (scaled)
  const s = 7.4;
  const rw = L * s;
  const rh = B * s;

  return (
    <div className="hero-visual card">
      <div className="hv-head">
        <span className="badge cyan mono">P = {P} m (fixed)</span>
        <span className={`badge ${near ? 'mint' : 'amber'} mono`}>{near ? 'A′(L) ≈ 0 · MAXIMUM' : L < 10 ? 'A′(L) > 0 · rising' : 'A′(L) < 0 · falling'}</span>
      </div>
      <svg viewBox="0 0 360 230" className="hv-graph" aria-label="Animated graph of area against length">
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="30" x2="330" y1={40 + i * 37.5} y2={40 + i * 37.5} stroke={C.grid} />
        ))}
        <motion.path d={`${curve}L330,190L30,190Z`} fill={C.mint} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }} />
        <motion.path d={curve} fill="none" stroke={C.ink} strokeWidth="3.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: 'easeInOut' }} />
        <line x1="30" y1="190" x2="336" y2="190" stroke={C.ink} strokeWidth="3" />
        <line x1="30" y1="190" x2="30" y2="24" stroke={C.ink} strokeWidth="3" />
        <line x1={gx(10)} x2={gx(10)} y1="40" y2="190" stroke={C.ink} strokeWidth="2" strokeDasharray="6 5" />
        <rect x={gx(10) - 34} y="22" width="68" height="18" fill={C.yellow} stroke={C.ink} strokeWidth="2" />
        <text x={gx(10)} y="35" textAnchor="middle" fill={C.ink} fontSize="11" fontWeight="700" fontFamily={MONO}>L = P/4</text>
        <line x1={gx(L)} x2={gx(L)} y1={gy(A)} y2="190" stroke={C.ink} strokeWidth="2" />
        <rect x={gx(L) - 8} y={gy(A) - 8} width="16" height="16" fill={near ? C.yellow : C.white} stroke={C.ink} strokeWidth="3" />
        <text x="336" y="206" textAnchor="end" fill={C.ink} fontSize="11" fontWeight="600" fontFamily={MONO}>L (m)</text>
        <text x="36" y="18" fill={C.ink} fontSize="11" fontWeight="600" fontFamily={MONO}>A (m²)</text>
      </svg>
      <div className="hv-bottom">
        <div className="hv-rect-box">
          <div className="hv-rect" style={{ width: rw, height: rh, background: near ? C.yellow : C.mint }}>
            <span className="mono">{L.toFixed(1)} × {B.toFixed(1)}</span>
          </div>
        </div>
        <div className="hv-readout mono">
          <div><span className="muted">L</span> {L.toFixed(2)} m</div>
          <div><span className="muted">B</span> {B.toFixed(2)} m</div>
          <div><span className="muted">A</span> <b>{A.toFixed(2)}</b> m²</div>
          <div><span className="muted">A<sub>max</sub></span> {Amax} m²</div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };

  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <motion.div variants={container} initial="hidden" animate="show" className="hero-copy">
          <motion.div variants={item} className="row" style={{ gap: 8, marginBottom: 20 }}>
            <span className="eyebrow" style={{ margin: 0 }}><Sigma size={14} /> Class 12 · Applications of Derivatives</span>
          </motion.div>
          <motion.h1 variants={item} className="hero-title">
            AREA<br /><span className="grad-text">OPTIMISER</span>
          </motion.h1>
          <motion.p variants={item} className="hero-sub">Exploring Maxima and Minima Through Mathematics</motion.p>
          <motion.p variants={item} className="hero-intro">
            We usually picture fields as rectangles or squares — easy to measure with <b>L × B</b>, and easy to
            optimise. But real fields have <b>random shapes</b> that a measuring tape and a formula cannot handle.
            This model shows how mathematics finds the <b>exact area</b> of any field and the <b>largest usable
            plot</b> inside it.
          </motion.p>
          <motion.div variants={item} className="hero-eq">
            <Tex>{'A(L) = L\\left(\\tfrac{P}{2} - L\\right)'}</Tex>
            <span className="hero-eq-arrow">→</span>
            <Tex>{"A'(L)=0"}</Tex>
            <span className="hero-eq-arrow">→</span>
            <Tex>{'A_{\\max} = \\dfrac{P^2}{16}'}</Tex>
          </motion.div>
          <motion.div variants={item} className="row" style={{ marginTop: 28 }}>
            <a href="#problem" className="btn btn-primary btn-lg">Explore the Model <ArrowDown size={18} /></a>
            <a href="#shape" className="btn btn-lg">Draw a random field</a>
          </motion.div>
          <motion.div variants={item} className="hero-meta">
            <span><Award size={15} /> 2nd Position · Zonal Level</span>
            <span><Cpu size={15} /> Arduino Nano integrated</span>
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.94, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
