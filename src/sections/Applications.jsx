import { Globe2 } from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import Reveal from '../components/Reveal.jsx';
import Tex from '../components/Tex.jsx';

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

const ILLUS = {
  farm: (
    <svg viewBox="0 0 200 120">
      <rect x="50" y="20" width="100" height="80" {...S} strokeDasharray="6 5" />
      {[50, 75, 100, 125, 150].map((x) => <line key={x} x1={x} y1="16" x2={x} y2="104" {...S} strokeWidth="3" />)}
      <path d="M62 85 q8-14 16 0 M92 70 q8-14 16 0 M120 88 q8-14 16 0" {...S} opacity=".6" />
      <text x="100" y="116" textAnchor="middle" fontSize="10" fill="currentColor" opacity=".7">fixed fencing = P</text>
    </svg>
  ),
  wall: (
    <svg viewBox="0 0 200 120">
      <line x1="20" y1="22" x2="180" y2="22" stroke="currentColor" strokeWidth="7" opacity=".5" />
      <path d="M45 22 V98 H155 V22" {...S} strokeDasharray="6 5" />
      <text x="100" y="15" textAnchor="middle" fontSize="10" fill="currentColor" opacity=".7">river / wall (no fence)</text>
      <text x="100" y="112" textAnchor="middle" fontSize="10" fill="currentColor" opacity=".7">L = P/4, B = P/2</text>
    </svg>
  ),
  plan: (
    <svg viewBox="0 0 200 120">
      <rect x="40" y="14" width="120" height="92" {...S} />
      <line x1="100" y1="14" x2="100" y2="70" {...S} />
      <line x1="40" y1="70" x2="160" y2="70" {...S} />
      <path d="M100 52 a14 14 0 0 1 14 14" {...S} opacity=".6" />
      <rect x="120" y="80" width="26" height="14" {...S} opacity=".6" />
    </svg>
  ),
  survey: (
    <svg viewBox="0 0 200 120">
      <path d="M30 90 L60 25 L120 15 L170 50 L150 100 L80 104 Z" {...S} />
      {[[30, 90], [60, 25], [120, 15], [170, 50], [150, 100], [80, 104]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="4" fill="currentColor" />)}
      <line x1="10" y1="112" x2="190" y2="112" stroke="currentColor" opacity=".3" />
      <line x1="10" y1="112" x2="10" y2="6" stroke="currentColor" opacity=".3" />
    </svg>
  ),
  window: (
    <svg viewBox="0 0 200 120">
      <rect x="62" y="20" width="76" height="86" {...S} />
      <line x1="100" y1="20" x2="100" y2="106" {...S} opacity=".6" />
      <line x1="62" y1="63" x2="138" y2="63" {...S} opacity=".6" />
      <path d="M150 20 l14 -10 M150 40 l20 -14" {...S} opacity=".5" />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 200 120">
      <path d="M60 40 L100 22 L140 40 L140 92 L100 110 L60 92 Z M60 40 L100 58 L140 40 M100 58 V110" {...S} />
    </svg>
  ),
};

const APPS = [
  { k: 'farm', title: 'Fencing a field', math: 'A_{\\max}=P^2/16', text: 'With a fixed length of fencing, a square field encloses the most land. 400 m of wire → 100 m × 100 m = 10 000 m².' },
  { k: 'wall', title: 'Enclosure beside a wall', math: 'A=L(P-2L)', text: 'If one side is a river or wall, only three sides need fencing. Then A′(L) = P − 4L = 0 gives L = P/4, B = P/2 — not a square!' },
  { k: 'plan', title: 'Floor plans & construction', math: '\\text{max carpet area}', text: 'For a fixed length of outer wall (fixed cost of bricks and labour), squarer floor plans give more usable area.' },
  { k: 'survey', title: 'Land surveying', math: '\\tfrac12|\\sum x_iy_{i+1}-x_{i+1}y_i|', text: 'Irregular plots are measured from corner coordinates (GPS / total station) using the Shoelace Formula — exactly Mode 1.' },
  { k: 'window', title: 'Window & panel design', math: "A'(x)=0", text: 'With a fixed length of frame material, derivatives find the dimensions that let in the most light.' },
  { k: 'box', title: 'Packaging', math: "V'(x)=0", text: 'The same idea in 3-D: choosing dimensions of a box to get maximum volume from a fixed sheet of cardboard.' },
];

export default function Applications() {
  return (
    <section className="section" id="applications">
      <div className="container">
        <SectionHeader eyebrow="06 · Real-Life Applications" icon={Globe2} title={<>Where this mathematics <span className="grad-text">is used</span></>}>
          Optimisation with derivatives and area by coordinates are everyday tools for farmers, engineers, architects and surveyors.
        </SectionHeader>
        <div className="grid grid-3">
          {APPS.map((a, i) => (
            <Reveal key={a.k} delay={(i % 3) * 0.08} className="card hoverable app-card">
              <div className="app-illus">{ILLUS[a.k]}</div>
              <h3 style={{ fontSize: 18, margin: '14px 0 6px' }}>{a.title}</h3>
              <p className="muted" style={{ fontSize: 14.5 }}>{a.text}</p>
              <div className="app-math"><Tex>{a.math}</Tex></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
