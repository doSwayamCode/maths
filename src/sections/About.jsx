import { Award, BookMarked, GraduationCap, Medal, Sparkles, Users } from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import Reveal from '../components/Reveal.jsx';
import { PROJECT } from '../data/project.js';

export default function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <SectionHeader eyebrow="08 · About the Project" icon={Sparkles} title={<>From the zonal stage <span className="grad-text">to the district level</span></>}>
          {PROJECT.title}
        </SectionHeader>

        <div className="about-layout">
          <Reveal className="card about-hero">
            <div className="trophy"><Award size={44} /></div>
            <div>
              <span className="badge mint">Achievement</span>
              <h3 style={{ fontSize: 28, margin: '10px 0 6px' }}>2nd Position — Zonal Level</h3>
              <p className="muted">This project received 2nd position at the zonal-level mathematics exhibition and is now being presented at the <b style={{ color: 'var(--text)' }}>district level</b>.</p>
            </div>
          </Reveal>

          <Reveal className="card" delay={0.05}>
            <div className="timeline">
              {PROJECT.achievements.map((a) => (
                <div key={a.level} className={`tl-item ${a.status}`}>
                  <span className="tl-dot">{a.status === 'won' ? <Medal size={14} /> : <Sparkles size={14} />}</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{a.level}</div>
                    <div className={a.status === 'won' ? 'mint' : 'cyan'} style={{ fontSize: 14 }}>{a.result}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="grid grid-3" style={{ marginTop: 20 }}>
          <Reveal className="card hoverable">
            <div className="card-title"><BookMarked size={18} /> Curriculum link</div>
            <p className="muted">{PROJECT.className}<br />{PROJECT.chapter}</p>
          </Reveal>
          <Reveal className="card hoverable" delay={0.05}>
            <div className="card-title"><GraduationCap size={18} /> What the model shows</div>
            <p className="muted">Mode 1 measures any irregular region exactly (Shoelace Formula). Mode 2 proves with derivatives that, for a fixed perimeter, a square gives the maximum area P²/16.</p>
          </Reveal>
          <Reveal className="card hoverable" delay={0.1}>
            <div className="card-title"><Users size={18} /> Team</div>
            {PROJECT.team.length ? (
              <ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>{PROJECT.team.map((t) => <li key={t}>{t}</li>)}</ul>
            ) : <p className="muted">Class 12 Mathematics students{PROJECT.school ? `, ${PROJECT.school}` : ''}.</p>}
            {PROJECT.guide && <p className="muted" style={{ marginTop: 6 }}>Guided by {PROJECT.guide}</p>}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
