import { useState } from 'react';
import { ArrowRight, Check, Copy, Cpu, Gauge, Lightbulb, Monitor, Volume2, WifiOff } from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import Reveal from '../components/Reveal.jsx';
import FeedbackIndicator from '../components/FeedbackIndicator.jsx';
import { ARDUINO_SKETCH } from '../data/arduinoSketch.js';
import { analyseRectangle } from '../utils/optimisation.js';
import { fmt } from '../utils/format.js';

const FLOW = [
  { icon: Gauge, title: 'Input', text: 'Potentiometer / sensor sets the length L of the physical model' },
  { icon: Cpu, title: 'Arduino Nano', text: 'Computes B = P/2 − L, A = L·B and A′(L) = P/2 − 2L' },
  { icon: Lightbulb, title: 'LED output', text: 'Red → amber → green as the area approaches the maximum' },
  { icon: Volume2, title: 'Buzzer', text: 'Beeps when A′(L) ≈ 0 — the square, maximum area' },
];

export default function Technology() {
  const [k, setK] = useState(30); // 0..100 → L as % of P/2
  const [sound, setSound] = useState(false);
  const [copied, setCopied] = useState(false);
  const P = 40;
  const L = (k / 100) * (P / 2);
  const r = analyseRectangle(P, L);
  const isMax = k === 50;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ARDUINO_SKETCH);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { setCopied(false); }
  };

  return (
    <section className="section" id="technology">
      <div className="container">
        <SectionHeader eyebrow="07 · Technology Integration" icon={Cpu} title={<>Mathematics first. <span className="grad-text">Technology assists.</span></>}>
          In the physical model, an Arduino Nano automates the same calculations and gives instant LED and buzzer
          feedback — so visitors can feel the maximum as they adjust the model.
        </SectionHeader>

        <Reveal className="flow">
          {FLOW.map((f, i) => (
            <div key={f.title} className="flow-item">
              <div className="card flow-card hoverable">
                <div className="icon-tile"><f.icon size={20} /></div>
                <div>
                  <div style={{ fontWeight: 600 }}>{f.title}</div>
                  <div className="muted" style={{ fontSize: 13.5 }}>{f.text}</div>
                </div>
              </div>
              {i < FLOW.length - 1 && <ArrowRight className="flow-arrow" size={20} />}
            </div>
          ))}
        </Reveal>

        <div className="grid grid-2" style={{ marginTop: 20 }}>
          <Reveal className="card">
            <div className="card-title"><Monitor size={18} /> Hardware feedback simulator</div>
            <p className="card-sub" style={{ marginBottom: 14 }}>This reproduces the Arduino&apos;s behaviour in the browser (P = 40 m). Turn the "knob":</p>
            <input type="range" className="range" min={1} max={99} value={k} onChange={(e) => setK(Number(e.target.value))} style={{ '--fill': `${k}%` }} aria-label="Simulated potentiometer" />
            <div className="sim-readout mono">
              <span>L = {fmt(r.L, 2)} m</span>
              <span>B = {fmt(r.B, 2)} m</span>
              <span>A = {fmt(r.A, 2)} m²</span>
              <span>A′ = {fmt(r.dA, 2)}</span>
            </div>
            <FeedbackIndicator percent={r.percent} isMax={isMax} sound={sound} onToggleSound={() => setSound((s) => !s)} />
            <div className="note info" style={{ marginTop: 14 }}>
              <WifiOff size={17} />
              <span><strong>No Arduino required.</strong> Every calculation on this website runs in the browser. The hardware is an optional companion to the physical model, and the website works fully offline.</span>
            </div>
          </Reveal>

          <Reveal className="card code-card" delay={0.05}>
            <div className="card-title" style={{ justifyContent: 'space-between' }}>
              <span className="row" style={{ gap: 10 }}><Cpu size={18} /> Example Arduino Nano sketch</span>
              <button className="btn btn-sm" onClick={copy}>{copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}</button>
            </div>
            <pre className="code"><code>{ARDUINO_SKETCH}</code></pre>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
