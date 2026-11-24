import { Check, HelpCircle, Ruler, X } from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import Reveal from '../components/Reveal.jsx';
import Tex from '../components/Tex.jsx';

const S = { fill: 'none', stroke: '#111', strokeWidth: 3, strokeLinejoin: 'round' };

/** Three-step story: easy rectangle → random field → what mathematics does. */
const STEPS = [
  {
    tag: 'Step 1', title: 'Rectangular & square fields', tone: 'mint',
    pic: (
      <svg viewBox="0 0 200 120"><rect x="40" y="18" width="120" height="84" {...S} fill="#3DDC97" />
        <text x="100" y="114" textAnchor="middle" fontSize="12" fontWeight="700">L</text>
        <text x="172" y="64" fontSize="12" fontWeight="700">B</text></svg>
    ),
    points: [
      [true, <>Area is simply <Tex>{'A = L \\times B'}</Tex></>],
      [true, <>For a fixed fence length, calculus gives the best shape: a square with <Tex>{'A_{\\max}=P^2/16'}</Tex></>],
      [true, 'Can be measured with a tape and solved by hand'],
    ],
  },
  {
    tag: 'Step 2', title: 'A random-shaped field', tone: 'pink',
    pic: (
      <svg viewBox="0 0 200 120"><path d="M30 92 L52 30 L98 16 L150 34 L176 70 L140 104 L84 96 Z" {...S} fill="#FF7AA2" />
        <text x="100" y="66" textAnchor="middle" fontSize="20" fontWeight="700">?</text></svg>
    ),
    points: [
      [false, <>There is no single "length" or "breadth", so <Tex>{'L \\times B'}</Tex> does not apply</>],
      [false, 'Its area cannot be worked out manually with a tape'],
      [false, 'Which part of it can actually be used as a rectangular plot?'],
    ],
  },
  {
    tag: 'Step 3', title: 'What this model does', tone: 'yellow',
    pic: (
      <svg viewBox="0 0 200 120"><path d="M30 92 L52 30 L98 16 L150 34 L176 70 L140 104 L84 96 Z" {...S} fill="#fff" />
        <polygon points="58,40 142,40 142,90 58,90" fill="#FFD23F" stroke="#111" strokeWidth="3" strokeDasharray="7 4" />
        {[[30, 92], [52, 30], [98, 16], [150, 34], [176, 70], [140, 104], [84, 96]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="5" fill="#fff" stroke="#111" strokeWidth="2.5" />)}</svg>
    ),
    points: [
      [true, <>Marks the corners as coordinates <Tex>{'(x_i, y_i)'}</Tex></>],
      [true, <>Finds the <b>exact area</b> with the Shoelace Formula</>],
      [true, <>Finds the <b>largest rectangular plot</b> inside by optimisation</>],
    ],
  },
];

export default function Problem() {
  return (
    <section className="section" id="problem">
      <div className="container">
        <SectionHeader eyebrow="01 · The Problem" icon={HelpCircle} title={<>Real fields are <span className="grad-text">not rectangles</span></>}>
          We have always seen fields drawn as rectangles or squares, where finding the area and the maximum area is
          easy. But what if the field has a random shape that cannot be measured manually?
        </SectionHeader>

        <div className="grid grid-3 story">
          {STEPS.map((st, i) => (
            <Reveal key={st.tag} delay={i * 0.1} className={`card story-card tone-${st.tone}`}>
              <span className="badge">{st.tag}</span>
              <div className="story-pic">{st.pic}</div>
              <h3>{st.title}</h3>
              <ul className="story-list">
                {st.points.map(([ok, text], k) => (
                  <li key={k}><span className={`tick ${ok ? 'yes' : 'no'}`}>{ok ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}</span><span>{text}</span></li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <Reveal className="grid grid-2" style={{ marginTop: 24 }}>
          <div className="card question-card">
            <span className="badge cyan">Question 1 · How big is the field?</span>
            <h3>Exact area from corner points</h3>
            <p className="muted">Mark each corner as a coordinate, going around the boundary. The Shoelace Formula turns them into the exact area — the same method used by land surveyors.</p>
            <div className="eq-block cyan" style={{ marginTop: 'auto' }}>
              <Tex block>{'A = \\tfrac12\\left|\\sum_{i=1}^{n}(x_i y_{i+1} - x_{i+1} y_i)\\right|'}</Tex>
            </div>
          </div>
          <div className="card question-card">
            <span className="badge mint">Question 2 · How much can be used?</span>
            <h3>Maximum rectangular plot</h3>
            <p className="muted">Farmers and builders need rectangular plots. For simple boundaries, derivatives give the answer exactly; for a random field, the computer optimises numerically.</p>
            <div className="eq-block" style={{ marginTop: 'auto' }}>
              <Tex block>{"\\text{maximise } A = L\\times B \;\\text{ so that the plot stays inside the field}"}</Tex>
            </div>
          </div>
        </Reveal>

        <Reveal className="note warn" style={{ marginTop: 20 }}>
          <Ruler size={18} />
          <span>
            <strong>Careful:</strong> a random field does not have a "maximum area" given by its length and breadth —
            its boundary fixes its area. A maximum only makes sense once we say what is being chosen: the plot inside
            it (Mode 1), or the shape of a fence of fixed length (Mode 2).
          </span>
        </Reveal>
      </div>
    </section>
  );
}
