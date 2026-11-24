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
      exit={{ y: '-100%' }}
      transition={{ duration: 0.5, ease: [0.7, 0, 0.3, 1] }}
    >
      <div className="loader-inner">
        <svg viewBox="0 0 160 160" width="150" height="150" aria-hidden="true">
          <circle cx="80" cy="80" r="72" fill="none" stroke="#111" strokeWidth="3" strokeDasharray="4 6" />
          <motion.circle
            cx="80" cy="80" r="72" fill="none" stroke="#111" strokeWidth="8" strokeLinecap="butt"
            style={{ rotate: -90, transformOrigin: '80px 80px' }}
            initial={{ pathLength: 0 }} animate={{ pathLength: pct / 100 }} transition={{ duration: 0.1 }}
          />
          <motion.rect
            fill="#3DDC97" stroke="#111" strokeWidth="4" rx="2"
            initial={{ x: 34, y: 62, width: 92, height: 36 }}
            animate={{ x: 52, y: 52, width: 56, height: 56 }}
            transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
          />
        </svg>
        <div className="loader-title">MAXIMUM AREA OPTIMISER</div>
        <div className="loader-eq mono">A<sub>max</sub> = P² / 16</div>
        <div className="loader-bar"><div style={{ width: `${pct}%` }} /></div>
        <div className="loader-pct mono">{pct.toString().padStart(3, '0')}% · initialising derivatives</div>
      </div>
    </motion.div>
  );
}
