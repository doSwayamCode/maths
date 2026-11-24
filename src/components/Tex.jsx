import { useMemo } from 'react';
import katex from 'katex';

/** Renders a LaTeX string with KaTeX (bundled locally — works offline). */
export default function Tex({ children, block = false, className = '' }) {
  const html = useMemo(
    () => katex.renderToString(String(children), { displayMode: block, throwOnError: false, strict: 'ignore' }),
    [children, block],
  );
  const Tag = block ? 'div' : 'span';
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
