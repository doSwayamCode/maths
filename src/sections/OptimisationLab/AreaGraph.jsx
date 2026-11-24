import { useMemo } from 'react';
import {
  Area, CartesianGrid, ComposedChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { maxArea, sampleAreaCurve, tangentSegment, firstDerivative } from '../../utils/optimisation.js';
import { fmt } from '../../utils/format.js';

export const RISING = '#3cf5c0';
export const FALLING = '#ff7a95';

function ChartTooltip({ active, payload, P, unit }) {
  if (!active || !payload?.length) return null;
  const { L, A } = payload[0].payload;
  const d = firstDerivative(P, L);
  return (
    <div className="chart-tip">
      <div><span className="muted">L</span> {fmt(L, 3)} {unit}</div>
      <div><span className="muted">B</span> {fmt(P / 2 - L, 3)} {unit}</div>
      <div><span className="muted">A(L)</span> <b>{fmt(A, 3)}</b> {unit}²</div>
      <div><span className="muted">A′(L)</span> {fmt(d, 3)} {Math.abs(d) < 1e-9 ? '(stationary)' : d > 0 ? '(rising)' : '(falling)'}</div>
    </div>
  );
}

/** Live graph of A(L) = L(P/2 − L) with the maximum, current point and tangent line. */
export default function AreaGraph({ P, L, A, unit }) {
  const data = useMemo(() => sampleAreaCurve(P, 160), [P]);
  const Amax = maxArea(P);
  const [t1, t2] = tangentSegment(P, L, P / 14);
  const yMax = Amax * 1.15;
  const ticks = (max) => [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);

  return (
    <>
    <div className="chart-legend" aria-hidden="true">
      <span><i style={{ background: RISING }} />Increasing (A′ &gt; 0)</span>
      <span><i style={{ background: FALLING }} />Decreasing (A′ &lt; 0)</span>
      <span><i style={{ background: '#fbbf24' }} />Tangent (slope = A′(L))</span>
      <span><i className="dot" style={{ background: '#22d3ee' }} />Maximum at L = P/4</span>
      <span><i className="dot ring" />Current L</span>
    </div>
    <div className="area-graph" role="img" aria-label={`Graph of area against length. Maximum ${fmt(Amax)} at L = ${fmt(P / 4)}.`}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 30, right: 18, bottom: 22, left: 6 }}>
          <defs>
            <linearGradient id="gRise" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={RISING} stopOpacity={0.32} />
              <stop offset="100%" stopColor={RISING} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gFall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={FALLING} stopOpacity={0.28} />
              <stop offset="100%" stopColor={FALLING} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(120,200,255,0.08)" vertical={false} />
          <XAxis
            dataKey="L" type="number" domain={[0, P / 2]} ticks={ticks(P / 2)} tickFormatter={(v) => fmt(v, 2)}
            stroke="rgba(180,195,220,0.4)" tick={{ fill: '#7d8fae', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            label={{ value: `Length L (${unit})`, position: 'insideBottom', offset: -12, fill: '#7d8fae', fontSize: 12 }}
          />
          <YAxis
            type="number" domain={[0, yMax]} ticks={ticks(Amax)} tickFormatter={(v) => fmt(v, 1)} width={58}
            stroke="rgba(180,195,220,0.4)" tick={{ fill: '#7d8fae', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            label={{ value: `A (${unit}²)`, angle: -90, position: 'insideLeft', offset: 14, fill: '#7d8fae', fontSize: 12 }}
          />
          <Tooltip content={<ChartTooltip P={P} unit={unit} />} cursor={{ stroke: 'rgba(255,255,255,0.25)', strokeDasharray: '4 4' }} />
          <Area type="monotone" dataKey="rising" name="Increasing (A′ > 0)" stroke={RISING} strokeWidth={2.5} fill="url(#gRise)" isAnimationActive={false} connectNulls={false} dot={false} activeDot={false} />
          <Area type="monotone" dataKey="falling" name="Decreasing (A′ < 0)" stroke={FALLING} strokeWidth={2.5} fill="url(#gFall)" isAnimationActive={false} connectNulls={false} dot={false} activeDot={false} />
          <ReferenceLine x={P / 4} stroke="#22d3ee" strokeDasharray="5 5" label={{ value: 'L = P/4', position: 'top', fill: '#22d3ee', fontSize: 11 }} />
          <ReferenceLine y={Amax} stroke="rgba(34,211,238,0.35)" strokeDasharray="2 6" />
          <ReferenceLine segment={[t1, t2]} stroke="#fbbf24" strokeWidth={2} ifOverflow="extendDomain" />
          <ReferenceDot x={P / 4} y={Amax} r={7} fill="#22d3ee" stroke="#04070f" strokeWidth={2} label={{ value: `max ${fmt(Amax, 2)}`, position: 'insideTopRight', dy: -18, dx: 10, fill: '#e8f1ff', fontSize: 11 }} />
          <ReferenceDot x={L} y={A} r={8} fill="#04070f" stroke="#ffffff" strokeWidth={3} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
    </>
  );
}
