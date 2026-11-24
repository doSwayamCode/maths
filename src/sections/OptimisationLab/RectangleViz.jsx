import { motion } from 'framer-motion';
import { fmt } from '../../utils/format.js';
import { C, MONO } from '../../styles/theme.js';

/**
 * Animated rectangle drawn to scale inside a fixed box. Its outline length is
 * always P; when L = B it becomes the optimal square and glows.
 */
export default function RectangleViz({ P, L, B, isMax, unit }) {
  const box = 260; // px drawing area
  const scale = box / (P / 2); // longest possible side is P/2
  const w = Math.max(2, L * scale);
  const h = Math.max(2, B * scale);
    const spring = { type: 'spring', stiffness: 220, damping: 26 };

  return (
    <div className="rect-viz">
      <svg viewBox={`-50 -40 ${box + 140} ${box + 80}`} aria-label={`Rectangle ${fmt(L)} by ${fmt(B)}`}>
        <rect x="0" y="0" width={box} height={box} fill={C.white} stroke={C.ink} strokeWidth="2" strokeDasharray="3 5" />
        <motion.rect
          x={0}
          initial={false}
          animate={{ attrY: box - h, width: w, height: h, fill: isMax ? C.yellow : C.mint }}
          transition={spring}
          stroke={C.ink}
          strokeWidth="4"
          rx="2"
          
        />
        {/* the square of side P/4 as a ghost target */}
        <rect x="0" y={box - box / 2} width={box / 2} height={box / 2} fill="none" stroke={C.ink} strokeWidth="2" strokeDasharray="8 6" />
        <motion.text initial={false} animate={{ attrX: w / 2, attrY: box + 24 }} transition={spring} textAnchor="middle" fill={C.ink} fontSize="15" fontWeight="700" fontFamily={MONO}>
          L = {fmt(L, 2)} {unit}
        </motion.text>
        <motion.text
          initial={false} animate={{ attrX: w + 12, attrY: box - h / 2 }} transition={spring}
          fill={C.ink} fontSize="15" fontWeight="700" fontFamily={MONO} dominantBaseline="middle"
        >
          B = {fmt(B, 2)}
        </motion.text>
        <text x="4" y="-18" fill={C.ink} fontSize="12" fontWeight="600" fontFamily={MONO}>dashed: optimal square (P/4 × P/4)</text>
      </svg>
      {isMax && (
        <motion.div className="max-flag" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          ★ SQUARE · MAXIMUM AREA
        </motion.div>
      )}
    </div>
  );
}
