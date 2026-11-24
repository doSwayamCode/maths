import { useMemo } from 'react';
import {
  Area, CartesianGrid, ComposedChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { maxArea, sampleAreaCurve, tangentSegment, firstDerivative } from '../../utils/optimisation.js';
import { fmt } from '../../utils/format.js';
import { C, MONO } from '../../styles/theme.js';

export const RISING = C.mint;
export const FALLING = C.pink;

function ChartTooltip({ active, payload, P, unit }) {
  if (!active || !payload?.length) return null;
  const { L, A } = payload[0].payload;
  const d = firstDerivative(P, L);
  return (
    <div className="chart-tip">
      <div>L = {fmt(L, 3)} {unit}</div>
      <div>B = {fmt(P / 2 - L, 3)} {unit}</div>
      <div><b>A(L) = {fmt(A, 3)} {unit}²</b></div>
      <div>A′(L) = {fmt(d, 3)} {Math.abs(d) < 1e-9 ? '(stationary)' : d > 0 ? '(rising)' : '(falling)'}</div>
    </div>
  );
}

const tick = { fill: C.ink, fontSize: 11.5, fontFamily: MONO, fontWeight: 600 };

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
        <span><i className="line" style={{ background: C.orange, height: 5 }} />Tangent (slope = A′(L))</span>
        <span><i className="dot" style={{ background: C.yellow }} />Maximum at L = P/4</span>
        <span><i className="dot ring" />Current L</span>
      </div>
      <div className="area-graph" role="img" aria-label={`Graph of area against length. Maximum ${fmt(Amax)} at L = ${fmt(P / 4)}.`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 30, right: 18, bottom: 22, left: 6 }}>
            <CartesianGrid stroke={C.grid} vertical={false} />
            <XAxis
              dataKey="L" type="number" domain={[0, P / 2]} ticks={ticks(P / 2)} tickFormatter={(v) => fmt(v, 2)}
              stroke={C.ink} strokeWidth={3} tick={tick}
              label={{ value: `Length L (${unit})`, position: 'insideBottom', offset: -12, fill: C.ink, fontSize: 12.5, fontWeight: 600 }}
            />
            <YAxis
              type="number" domain={[0, yMax]} ticks={ticks(Amax)} tickFormatter={(v) => fmt(v, 1)} width={58}
              stroke={C.ink} strokeWidth={3} tick={tick}
              label={{ value: `A (${unit}²)`, angle: -90, position: 'insideLeft', offset: 14, fill: C.ink, fontSize: 12.5, fontWeight: 600 }}
            />
            <Tooltip content={<ChartTooltip P={P} unit={unit} />} cursor={{ stroke: C.ink, strokeWidth: 1.5, strokeDasharray: '4 4' }} />
            <Area type="monotone" dataKey="rising" name="Increasing" stroke={C.ink} strokeWidth={3} fill={RISING} fillOpacity={0.85} isAnimationActive={false} connectNulls={false} dot={false} activeDot={false} />
            <Area type="monotone" dataKey="falling" name="Decreasing" stroke={C.ink} strokeWidth={3} fill={FALLING} fillOpacity={0.85} isAnimationActive={false} connectNulls={false} dot={false} activeDot={false} />
            <ReferenceLine x={P / 4} stroke={C.ink} strokeWidth={2} strokeDasharray="6 5" label={{ value: 'L = P/4', position: 'top', fill: C.ink, fontSize: 12, fontWeight: 700 }} />
            <ReferenceLine y={Amax} stroke={C.ink} strokeDasharray="2 6" />
            <ReferenceLine segment={[t1, t2]} stroke={C.orange} strokeWidth={4} ifOverflow="extendDomain" />
            <ReferenceDot x={P / 4} y={Amax} r={8} fill={C.yellow} stroke={C.ink} strokeWidth={3} label={{ value: `max ${fmt(Amax, 2)}`, position: 'insideTopRight', dy: -20, dx: 12, fill: C.ink, fontSize: 12, fontWeight: 700 }} />
            <ReferenceDot x={L} y={A} r={8} fill={C.white} stroke={C.ink} strokeWidth={4} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
