import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/** Animated loading screen: a rectangle morphs into a square while A = P²/16 is "derived". */
export default function Loader({ onDone }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const total = 1900;
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / total);
      setPct(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <motion.div
      className="loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="loader-inner">
        <svg viewBox="0 0 160 160" width="150" height="150" aria-hidden="true">
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#3cf5c0" />
              <stop offset="1" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(120,200,255,.12)" strokeWidth="1.5" />
          <motion.circle
            cx="80" cy="80" r="72" fill="none" stroke="url(#lg)" strokeWidth="2.5" strokeLinecap="round"
            style={{ rotate: -90, transformOrigin: '80px 80px' }}
            initial={{ pathLength: 0 }} animate={{ pathLength: pct / 100 }} transition={{ duration: 0.1 }}
          />
          <motion.rect
            fill="rgba(60,245,192,.12)" stroke="url(#lg)" strokeWidth="2.5" rx="2"
            initial={{ x: 34, y: 62, width: 92, height: 36 }}
            animate={{ x: 52, y: 52, width: 56, height: 56 }}
            transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
          />
        </svg>
        <div className="loader-title">AREA <span className="grad-text">OPTIMISER</span></div>
        <div className="loader-eq mono">A<sub>max</sub> = P² / 16</div>
        <div className="loader-bar"><div style={{ width: `${pct}%` }} /></div>
        <div className="loader-pct mono">{pct.toString().padStart(3, '0')}% · initialising derivatives</div>
      </div>
    </motion.div>
  );
}
