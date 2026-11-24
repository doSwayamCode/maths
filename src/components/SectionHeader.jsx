import Reveal from './Reveal.jsx';

export default function SectionHeader({ eyebrow, icon: Icon, title, children }) {
  return (
    <Reveal className="section-head">
      <span className="eyebrow">{Icon && <Icon size={14} />}{eyebrow}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </Reveal>
  );
}
