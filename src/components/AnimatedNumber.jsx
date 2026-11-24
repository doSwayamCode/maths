import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { fmt } from '../utils/format.js';

/** Smoothly counts from the previous value to the new one. */
export default function AnimatedNumber({ value, decimals = 2, duration = 0.5, suffix = '' }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (!Number.isFinite(value)) { setDisplay(value); prev.current = value; return undefined; }
    const from = Number.isFinite(prev.current) ? prev.current : value;
    const controls = animate(from, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, duration]);

  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(display, decimals)}{suffix}</span>;
}
