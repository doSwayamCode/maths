import AnimatedNumber from './AnimatedNumber.jsx';

export default function Stat({ label, value, unit, decimals = 2, highlight = false, icon: Icon, children, color }) {
  return (
    <div className={`stat${highlight ? ' highlight' : ''}`}>
      <div className="stat-label">{Icon && <Icon size={13} />}{label}</div>
      <div className="stat-value" style={color ? { color } : undefined}>
        {children ?? (
          <>
            <AnimatedNumber value={value} decimals={decimals} />
            {unit && <small>{unit}</small>}
          </>
        )}
      </div>
    </div>
  );
}
