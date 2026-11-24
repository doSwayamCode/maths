import { motion } from 'framer-motion';
import { fmt } from '../../utils/format.js';

/**
 * Animated rectangle drawn to scale inside a fixed box. Its outline length is
 * always P; when L = B it becomes the optimal square and glows.
 */
export default function RectangleViz({ P, L, B, isMax, unit }) {
  const box = 260; // px drawing area
  const scale = box / (P / 2); // longest possible side is P/2
  const w = Math.max(2, L * scale);
  const h = Math.max(2, B * scale);
  const color = isMax ? '#3cf5c0' : '#22d3ee';
  const spring = { type: 'spring', stiffness: 220, damping: 26 };

  return (
    <div className="rect-viz">
      <svg viewBox={`-50 -40 ${box + 140} ${box + 80}`} aria-label={`Rectangle ${fmt(L)} by ${fmt(B)}`}>
        <defs>
          <pattern id="rgrid" width="13" height="13" patternUnits="userSpaceOnUse">
            <path d="M13 0H0V13" fill="none" stroke="rgba(120,200,255,0.08)" />
          </pattern>
        </defs>
        <rect x="0" y="0" width={box} height={box} fill="url(#rgrid)" stroke="rgba(120,200,255,0.12)" strokeDasharray="3 5" />
        {/* the square of side P/4 as a ghost target */}
        <rect x="0" y={box - box / 2} width={box / 2} height={box / 2} fill="none" stroke="rgba(60,245,192,0.35)" strokeDasharray="6 6" />
        <motion.rect
          x={0}
          initial={false}
          animate={{ attrY: box - h, width: w, height: h, fill: isMax ? 'rgba(60,245,192,0.22)' : 'rgba(34,211,238,0.12)', stroke: color }}
          transition={spring}
          strokeWidth="3"
          rx="3"
          style={{ filter: isMax ? 'drop-shadow(0 0 14px rgba(60,245,192,0.8))' : 'none' }}
        />
        <motion.text initial={false} animate={{ attrX: w / 2, attrY: box + 24 }} transition={spring} textAnchor="middle" fill="#e8f1ff" fontSize="15" fontFamily="JetBrains Mono">
          L = {fmt(L, 2)} {unit}
        </motion.text>
        <motion.text
          initial={false} animate={{ attrX: w + 12, attrY: box - h / 2 }} transition={spring}
          fill="#e8f1ff" fontSize="15" fontFamily="JetBrains Mono" dominantBaseline="middle"
        >
          B = {fmt(B, 2)}
        </motion.text>
        <text x="4" y="-18" fill="rgba(60,245,192,0.7)" fontSize="12" fontFamily="JetBrains Mono">dashed: optimal square (P/4 × P/4)</text>
      </svg>
      {isMax && (
        <motion.div className="max-flag" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          ★ SQUARE · MAXIMUM AREA
        </motion.div>
      )}
    </div>
  );
}
