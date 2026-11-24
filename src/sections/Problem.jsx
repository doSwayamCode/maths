import { Building2, HelpCircle, LandPlot, LayoutGrid, Ruler, Tractor } from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import Reveal from '../components/Reveal.jsx';
import Tex from '../components/Tex.jsx';

const EXAMPLES = [
  { icon: Tractor, title: 'Land utilisation', text: 'A farmer has a fixed length of fencing wire. Which rectangular enclosure gives the most grazing land for the same cost?' },
  { icon: Building2, title: 'Construction', text: 'For a fixed length of outer wall (and therefore fixed material and labour), which floor plan gives the most usable carpet area?' },
  { icon: LayoutGrid, title: 'Space planning', text: 'Rooms, parking lots and exhibition stalls must use limited boundaries efficiently — wasted shape is wasted money.' },
  { icon: LandPlot, title: 'Surveying irregular plots', text: 'Real plots are rarely rectangles. Surveyors record corner coordinates and compute the area exactly with the Shoelace Formula.' },
];

export default function Problem() {
  return (
    <section className="section" id="problem">
      <div className="container">
        <SectionHeader eyebrow="01 · The Mathematical Problem" icon={HelpCircle} title={<>Why does <span className="grad-text">maximum area</span> matter?</>}>
          Boundaries cost money — fencing, walls, borders. Area is what we actually use. Optimisation asks:
          for the resources we have, what is the best possible result?
        </SectionHeader>

        <div className="grid grid-4">
          {EXAMPLES.map((e, i) => (
            <Reveal key={e.title} delay={i * 0.08} className="card hoverable">
              <div className="icon-tile"><e.icon size={22} /></div>
              <h3 style={{ fontSize: 18, margin: '14px 0 8px' }}>{e.title}</h3>
              <p className="muted" style={{ fontSize: 14.5 }}>{e.text}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="grid grid-2" style={{ marginTop: 24 }}>
          <div className="card question-card">
            <span className="badge cyan">Question 1 · Measurement</span>
            <h3>What is the area of <em>this</em> shape?</h3>
            <p className="muted">For an irregular region given by its corner points, the area is a single fixed number — computed exactly by the Shoelace Formula.</p>
            <div className="eq-block cyan" style={{ marginTop: 'auto' }}>
              <Tex block>{'A = \\tfrac12\\left|\\sum_{i=1}^{n}(x_i y_{i+1} - x_{i+1} y_i)\\right|'}</Tex>
            </div>
          </div>
          <div className="card question-card">
            <span className="badge mint">Question 2 · Optimisation</span>
            <h3>Which shape gives the <em>most</em> area?</h3>
            <p className="muted">"Maximum area" only makes sense under a <b>constraint</b>. With a fixed perimeter, calculus shows that the best rectangle is a square.</p>
            <div className="eq-block" style={{ marginTop: 'auto' }}>
              <Tex block>{'2(L+B)=P \;\\Rightarrow\; A_{\\max} = \\frac{P^2}{16} \\text{ at } L=B=\\frac P4'}</Tex>
            </div>
          </div>
        </Reveal>

        <Reveal className="note warn" style={{ marginTop: 20 }}>
          <Ruler size={18} />
          <span>
            <strong>A common misconception:</strong> an irregular shape does not have a "maximum area" determined by
            its length and breadth. Its area is fixed by its boundary. Asking for a maximum requires stating what is
            held fixed (perimeter, fencing length, limits on sides…) and what is allowed to vary.
          </span>
        </Reveal>
      </div>
    </section>
  );
}
