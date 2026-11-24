import { Sigma } from 'lucide-react';
import Tex from './Tex.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container row" style={{ justifyContent: 'space-between', gap: 20 }}>
        <div className="row" style={{ gap: 10 }}>
          <span className="brand-mark"><Sigma size={16} /></span>
          <div>
            <div style={{ color: 'var(--text)', fontWeight: 600 }}>AREA OPTIMISER</div>
            <div>Class 12 Mathematics Exhibition · Applications of Derivatives</div>
          </div>
        </div>
        <div className="mono" style={{ fontSize: 13 }}>
          <Tex>{"A'(L)=0,\; A''(L)<0 \\Rightarrow A_{\\max}=\\tfrac{P^2}{16}"}</Tex>
        </div>
      </div>
    </footer>
  );
}
