import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

export function Math({ expr, inline = false }: { expr: string; inline?: boolean }) {
  if (!expr) return null;
  return inline ? <InlineMath math={expr} /> : <BlockMath math={expr} />;
}

export default Math;
