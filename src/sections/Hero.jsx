import { useRef, useState } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';
import { ArrowDown, Award, Cpu, Sigma } from 'lucide-react';
import Tex from '../components/Tex.jsx';
import { areaFn, maxArea } from '../utils/optimisation.js';

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
  const s = 7.2;
  const rw = L * s;
  const rh = B * s;

  return (
    <div className="hero-visual card">
      <div className="hv-head">
        <span className="badge cyan mono">P = {P} m (fixed)</span>
        <span className={`badge ${near ? 'mint' : 'amber'} mono`}>{near ? 'A′(L) ≈ 0 · MAXIMUM' : L < 10 ? 'A′(L) > 0 · rising' : 'A′(L) < 0 · falling'}</span>
      </div>
      <svg viewBox="0 0 360 230" className="hv-graph" aria-label="Animated graph of area against length">
        <defs>
          <linearGradient id="hvfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3cf5c0" stopOpacity=".35" />
            <stop offset="1" stopColor="#3cf5c0" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="30" x2="330" y1={40 + i * 37.5} y2={40 + i * 37.5} stroke="rgba(120,200,255,.08)" />
        ))}
        <line x1="30" y1="190" x2="335" y2="190" stroke="rgba(180,195,220,.5)" />
        <line x1="30" y1="190" x2="30" y2="25" stroke="rgba(180,195,220,.5)" />
        <motion.path d={`${curve}L330,190L30,190Z`} fill="url(#hvfill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }} />
        <motion.path d={curve} fill="none" stroke="#3cf5c0" strokeWidth="2.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: 'easeInOut' }} />
        <line x1={gx(10)} x2={gx(10)} y1="40" y2="190" stroke="#22d3ee" strokeDasharray="4 4" opacity=".6" />
        <text x={gx(10)} y="34" textAnchor="middle" fill="#22d3ee" fontSize="10" fontFamily="JetBrains Mono">L = P/4</text>
        <line x1={gx(L)} x2={gx(L)} y1={gy(A)} y2="190" stroke="rgba(255,255,255,.25)" />
        <circle cx={gx(L)} cy={gy(A)} r="9" fill="#04070f" stroke={near ? '#3cf5c0' : '#fff'} strokeWidth="2" />
        <circle cx={gx(L)} cy={gy(A)} r="4" fill={near ? '#3cf5c0' : '#22d3ee'} />
        <text x="335" y="204" textAnchor="end" fill="#7d8fae" fontSize="10" fontFamily="JetBrains Mono">L (m)</text>
        <text x="34" y="20" fill="#7d8fae" fontSize="10" fontFamily="JetBrains Mono">A (m²)</text>
      </svg>
      <div className="hv-bottom">
        <div className="hv-rect-box">
          <div className="hv-rect" style={{ width: rw, height: rh, borderColor: near ? '#3cf5c0' : '#22d3ee' }}>
            <span className="mono">{L.toFixed(1)} × {B.toFixed(1)}</span>
          </div>
        </div>
        <div className="hv-readout mono">
          <div><span className="muted">L</span> {L.toFixed(2)} m</div>
          <div><span className="muted">B</span> {B.toFixed(2)} m</div>
          <div><span className="muted">A</span> <b className="mint">{A.toFixed(2)}</b> m²</div>
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
            How large can a region be? This model answers two different questions: the <b>exact area of any
            irregular plot</b> using the Shoelace Formula, and the <b>maximum area of a rectangle with a fixed
            perimeter</b> using derivatives — where the answer is always a square.
          </motion.p>
          <motion.div variants={item} className="hero-eq">
            <Tex>{'A(L) = L\\left(\\tfrac{P}{2} - L\\right)'}</Tex>
            <span className="hero-eq-arrow">→</span>
            <Tex>{"A'(L)=0"}</Tex>
            <span className="hero-eq-arrow">→</span>
            <Tex>{'A_{\\max} = \\dfrac{P^2}{16}'}</Tex>
          </motion.div>
          <motion.div variants={item} className="row" style={{ marginTop: 28 }}>
            <a href="#shape" className="btn btn-primary btn-lg">Explore the Model <ArrowDown size={18} /></a>
            <a href="#lab" className="btn btn-lg">Optimisation Lab</a>
          </motion.div>
          <motion.div variants={item} className="hero-meta">
            <span><Award size={15} className="mint" /> 2nd Position · Zonal Level</span>
            <span><Cpu size={15} className="cyan" /> Arduino Nano integrated</span>
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.94, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
