/** Number formatting for display (Indian-English locale, trims trailing zeros). */
export function fmt(value, decimals = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  if (!Number.isFinite(value)) return '∞';
  const v = Math.abs(value) < 1e-10 ? 0 : value;
  return v.toLocaleString('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
}

/** Plain number for KaTeX strings (no thousands separators). */
export function tex(value, decimals = 2) {
  if (!Number.isFinite(value)) return '\\infty';
  const v = Math.abs(value) < 1e-10 ? 0 : value;
  return String(Number(v.toFixed(decimals)));
}
