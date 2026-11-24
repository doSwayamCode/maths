import { ArrowUpRight, Sigma } from 'lucide-react';
import Tex from './Tex.jsx';

const LINKEDIN = 'https://www.linkedin.com/in/muskan-kl-7285ba360';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row" style={{ justifyContent: 'space-between', gap: 20 }}>
          <div className="row" style={{ gap: 10 }}>
            <span className="brand-mark"><Sigma size={16} /></span>
            <div>
              <div className="footer-name">MAXIMUM AREA OPTIMISER</div>
              <div>Class 12 Mathematics Exhibition · Applications of Derivatives</div>
            </div>
          </div>
          <div className="mono" style={{ fontSize: 13 }}>
            <Tex>{"A'(L)=0,\\quad A''(L)<0 \\Rightarrow A_{\\max}=\\tfrac{P^2}{16}"}</Tex>
          </div>
        </div>

        <div className="footer-credit">
          <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="made-by" aria-label="Made by Muskan — open her LinkedIn profile in a new tab">
            <span className="in-badge" aria-hidden="true">in</span>
            <span>Made by <b>Muskan</b></span>
            <ArrowUpRight size={16} strokeWidth={2.5} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
