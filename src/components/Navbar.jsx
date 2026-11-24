import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Sigma } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'problem', label: 'Problem' },
  { id: 'shape', label: 'Shape Calculator' },
  { id: 'lab', label: 'Optimisation Lab' },
  { id: 'calculator', label: 'Calculator' },
  { id: 'theory', label: 'Theory' },
  { id: 'applications', label: 'Applications' },
  { id: 'technology', label: 'Technology' },
  { id: 'about', label: 'About' },
];

export default function Navbar() {
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? window.scrollY / h : 0);
      let current = '';
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.35) current = item.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`}>
      <div className="container nav-inner">
        <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
          <span className="brand-mark"><Sigma size={18} /></span>
          <span>AREA <b className="grad-text">OPTIMISER</b></span>
        </button>
        <nav className="nav-links" aria-label="Sections">
          {NAV_ITEMS.map((it) => (
            <button key={it.id} className={active === it.id ? 'active' : ''} onClick={() => go(it.id)}>
              {it.label}
              {active === it.id && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
            </button>
          ))}
        </nav>
        <button className="btn btn-sm nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      <div className="nav-progress" style={{ transform: `scaleX(${progress})` }} />
      <AnimatePresence>
        {open && (
          <motion.nav
            className="nav-mobile"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {NAV_ITEMS.map((it) => (
              <button key={it.id} className={active === it.id ? 'active' : ''} onClick={() => go(it.id)}>{it.label}</button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
