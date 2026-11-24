import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, ChevronRight } from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import Reveal from '../components/Reveal.jsx';
import Tex from '../components/Tex.jsx';

const TOPICS = [
  {
    id: 'ap', title: 'Area and perimeter',
    body: <>
      <p><b>Perimeter</b> is the total length of the boundary of a region (measured in m). <b>Area</b> is the amount of surface enclosed (measured in m²). For a rectangle of length <Tex>L</Tex> and breadth <Tex>B</Tex>:</p>
      <Tex block>{'P = 2(L+B), \\qquad A = L\\times B'}</Tex>
      <p>Two rectangles can have the <b>same perimeter but different areas</b>. With <Tex>P = 20</Tex> m: <Tex>{'9\\times1 = 9'}</Tex> m², <Tex>{'7\\times3=21'}</Tex> m², <Tex>{'5\\times5=25'}</Tex> m². That difference is what we want to optimise.</p>
    </>,
  },
  {
    id: 'fn', title: 'Writing area as a function',
    body: <>
      <p>Calculus works with functions of <b>one</b> variable, so we use the constraint to remove <Tex>B</Tex>:</p>
      <Tex block>{'2(L+B)=P \;\\Rightarrow\; B=\\frac P2-L'}</Tex>
      <Tex block>{'A(L)=L\\left(\\frac P2-L\\right)=\\frac P2\\,L-L^2,\\qquad 0<L<\\frac P2'}</Tex>
      <p>This is a quadratic function. Its graph is a downward-opening parabola (the coefficient of <Tex>{'L^2'}</Tex> is negative), so it has a highest point.</p>
    </>,
  },
  {
    id: 'd1', title: 'The first derivative',
    body: <>
      <p>The derivative <Tex>{"A'(L)"}</Tex> measures the <b>rate of change</b> of area with respect to length — the slope of the tangent to the graph.</p>
      <Tex block>{"A'(L)=\\frac{d}{dL}\\left(\\frac P2 L-L^2\\right)=\\frac P2-2L"}</Tex>
      <ul>
        <li>If <Tex>{"A'(L)>0"}</Tex> the area is <b className="mint">increasing</b> (here, when <Tex>{'L<P/4'}</Tex>).</li>
        <li>If <Tex>{"A'(L)<0"}</Tex> the area is <b className="rose">decreasing</b> (here, when <Tex>{'L>P/4'}</Tex>).</li>
      </ul>
    </>,
  },
  {
    id: 'cp', title: 'Critical points',
    body: <>
      <p>A <b>critical point</b> is where the derivative is zero — the tangent is horizontal, so the function stops rising and starts falling (or vice-versa).</p>
      <Tex block>{"A'(L)=0 \;\\Rightarrow\; \\frac P2-2L=0 \;\\Rightarrow\; L=\\frac P4"}</Tex>
      <Tex block>{'B=\\frac P2-\\frac P4=\\frac P4 \\quad\\Rightarrow\\quad L=B \;(\\text{a square})'}</Tex>
    </>,
  },
  {
    id: 'd2', title: 'Second derivative test',
    body: <>
      <p>A critical point can be a maximum or a minimum. The <b>second derivative test</b> (NCERT, Class 12) decides which:</p>
      <ul>
        <li><Tex>{"f'(c)=0"}</Tex> and <Tex>{"f''(c)<0"}</Tex> ⇒ local <b>maximum</b> at <Tex>c</Tex></li>
        <li><Tex>{"f'(c)=0"}</Tex> and <Tex>{"f''(c)>0"}</Tex> ⇒ local <b>minimum</b> at <Tex>c</Tex></li>
        <li><Tex>{"f''(c)=0"}</Tex> ⇒ test fails; use the first derivative test</li>
      </ul>
      <Tex block>{"A''(L)=\\frac{d}{dL}\\left(\\frac P2-2L\\right)=-2<0"}</Tex>
      <p>The second derivative is negative for every <Tex>L</Tex>, so <Tex>{'L=P/4'}</Tex> gives a <b>maximum</b>. Since it is the only critical point in <Tex>{'(0, P/2)'}</Tex>, it is the absolute maximum.</p>
    </>,
  },
  {
    id: 'mm', title: 'Maximum and minimum values',
    body: <>
      <Tex block>{'A_{\\max}=A\\!\\left(\\frac P4\\right)=\\frac P4\\cdot\\frac P4=\\frac{P^2}{16}'}</Tex>
      <p><b>Example.</b> A farmer has 40 m of fencing. Then <Tex>{'L=B=10'}</Tex> m and <Tex>{'A_{\\max}=\\frac{40^2}{16}=100'}</Tex> m². A 12 m × 8 m field uses the same fencing but gives only 96 m².</p>
      <p><b>Is there a minimum?</b> As <Tex>{'L\\to0'}</Tex> or <Tex>{'L\\to P/2'}</Tex>, the rectangle becomes a thin strip and <Tex>{'A\\to0'}</Tex>. These end points are not real rectangles, so the area has no minimum value inside the interval — it can be made as small as we like.</p>
    </>,
  },
  {
    id: 'rf', title: 'Plot inside a curved field',
    body: <>
      <p>Derivatives can also find the biggest rectangular plot inside a field — when the boundary has an equation. Take a <b>circular field</b> of radius <Tex>r</Tex>. A rectangle inside it has corners <Tex>{'(\\pm x, \\pm y)'}</Tex> on the circle, so <Tex>{'x^2+y^2=r^2'}</Tex>:</p>
      <Tex block>{'A = (2x)(2y) = 4x\\sqrt{r^2-x^2}'}</Tex>
      <p>It is easier to maximise <Tex>{'S = A^2'}</Tex> (both are largest together):</p>
      <Tex block>{"S(x)=16(r^2x^2-x^4),\\qquad S'(x)=16(2r^2x-4x^3)=0 \\;\\Rightarrow\\; x=\\frac{r}{\\sqrt2}"}</Tex>
      <Tex block>{"S''\\!\\left(\\tfrac{r}{\\sqrt2}\\right)=16\\left(2r^2-12\\cdot\\tfrac{r^2}{2}\\right)=-64r^2<0 \\;\\Rightarrow\\; \\text{maximum}"}</Tex>
      <Tex block>{'y=\\frac{r}{\\sqrt2}=x \\;(\\text{a square}),\\qquad A_{\\max}=2r^2 \\approx 63.7\\% \\text{ of the field } (\\pi r^2)'}</Tex>
      <p><b>A random field has no equation for its boundary</b>, so we cannot differentiate. Instead the computer does the same job numerically: it tests thousands of rectangles and keeps the largest one that fits. Try it in Mode 1 — draw a near-circle and the search also finds a square of about <Tex>{'2r^2'}</Tex>.</p>
    </>,
  },
];

export default function Explanation() {
  const [active, setActive] = useState(TOPICS[0].id);
  const idx = TOPICS.findIndex((t) => t.id === active);
  const topic = TOPICS[idx];

  return (
    <section className="section" id="theory">
      <div className="container">
        <SectionHeader eyebrow="05 · Mathematical Explanation" icon={BookOpen} title={<>The mathematics, <span className="grad-text">step by step</span></>}>
          From area and perimeter to the second derivative test — the complete reasoning at Class 12 NCERT level.
        </SectionHeader>
        <Reveal className="theory-layout">
          <div className="theory-nav" role="tablist">
            {TOPICS.map((t, i) => (
              <button key={t.id} role="tab" aria-selected={active === t.id} className={active === t.id ? 'active' : ''} onClick={() => setActive(t.id)}>
                <span className="mono theory-num">{String(i + 1).padStart(2, '0')}</span>
                <span>{t.title}</span>
                <ChevronRight size={16} className="theory-chev" />
              </button>
            ))}
          </div>
          <div className="card theory-body">
            <AnimatePresence mode="wait">
              <motion.div key={topic.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
                <span className="badge mint">Step {idx + 1} of {TOPICS.length}</span>
                <h3 style={{ fontSize: 26, margin: '12px 0 14px' }}>{topic.title}</h3>
                <div className="prose">{topic.body}</div>
                <div className="row" style={{ marginTop: 20 }}>
                  <button className="btn btn-sm" disabled={idx === 0} onClick={() => setActive(TOPICS[idx - 1].id)}>← Previous</button>
                  <div className="spacer" />
                  <button className="btn btn-sm" disabled={idx === TOPICS.length - 1} onClick={() => setActive(TOPICS[idx + 1].id)}>Next →</button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
