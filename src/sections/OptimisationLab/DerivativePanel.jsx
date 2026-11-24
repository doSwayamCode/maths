import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Target } from 'lucide-react';
import Tex from '../../components/Tex.jsx';
import { tex } from '../../utils/format.js';

/** Live, substituted derivative working for the current P and L. */
export default function DerivativePanel({ r, unit }) {
  const { P, L, B, A, Amax, dA, trend } = r;
  const u = unit;
  const steps = [
    { k: 'b', cls: '', t: `2(L+B)=P \;\\Rightarrow\; B=\\tfrac{P}{2}-L=${tex(P / 2, 3)}-${tex(L, 3)}=${tex(B, 3)}\\ \\text{${u}}` },
    { k: 'a', cls: '', t: `A(L)=L\\left(\\tfrac P2-L\\right)=\\tfrac P2 L-L^2=${tex(L, 3)}\\times${tex(B, 3)}=${tex(A, 3)}\\ \\text{${u}}^2` },
    { k: 'd1', cls: 'cyan', t: `A'(L)=\\tfrac P2-2L=${tex(P / 2, 3)}-${tex(2 * L, 3)}=${tex(dA, 3)}` },
    { k: 'c', cls: 'cyan', t: `A'(L)=0 \;\\Rightarrow\; L=\\tfrac P4=${tex(P / 4, 3)}\\ \\text{${u}},\\quad B=\\tfrac P4=${tex(P / 4, 3)}\\ \\text{${u}}` },
    { k: 'd2', cls: 'amber', t: `A''(L)=-2<0 \;\\Rightarrow\; \\text{maximum at } L=\\tfrac P4` },
    { k: 'm', cls: '', t: `A_{\\max}=\\tfrac{P^2}{16}=\\tfrac{${tex(P, 3)}^2}{16}=${tex(Amax, 3)}\\ \\text{${u}}^2` },
  ];

  const T = {
    increasing: { icon: TrendingUp, cls: 'mint', title: 'Area is INCREASING', text: <>A′(L) &gt; 0 — making L longer (towards P/4) increases the area.</> },
    decreasing: { icon: TrendingDown, cls: 'rose', title: 'Area is DECREASING', text: <>A′(L) &lt; 0 — making L longer moves away from the square and reduces the area.</> },
    stationary: { icon: Target, cls: 'cyan', title: 'Critical point reached', text: <>A′(L) = 0 and A″(L) = −2 &lt; 0 — this is the maximum. The rectangle is a square.</> },
  }[trend];

  return (
    <div className="stack" style={{ gap: 10 }}>
      <motion.div key={trend} className={`trend-banner ${T.cls}`} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
        <T.icon size={22} />
        <div>
          <div className="trend-title">{T.title}</div>
          <div className="trend-text">{T.text}</div>
        </div>
        <div className="trend-sign mono">A′ = {tex(dA, 3)}</div>
      </motion.div>
      {steps.map((s, i) => (
        <motion.div
          key={s.k}
          className={`eq-block ${s.cls}`}
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.12, duration: 0.5 }}
        >
          <Tex>{s.t}</Tex>
        </motion.div>
      ))}
    </div>
  );
}
