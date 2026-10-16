/**
 * Sparsification curves: remove the most-uncertain points first and track
 * the mean error of what remains. The shaded gap to the oracle is AUSE.
 */
export function SparsePlot({ raw, aligned, mode }) {
  const W = 300, H = 118, L = 26, B = 18, T = 6, R = 6;
  const all = [...raw.est, ...aligned.est, 1];
  const yMax = Math.max(...all) * 1.04;
  const x = (i, n) => L + (i / n) * (W - L - R);
  const y = (v) => T + (1 - v / yMax) * (H - T - B);
  const path = (arr) => arr.map((v, i) => `${i ? "L" : "M"}${x(i, arr.length).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const cur = mode === "aligned" ? aligned : raw;
  const area =
    cur.est.map((v, i) => `${i ? "L" : "M"}${x(i, cur.est.length).toFixed(1)},${y(v).toFixed(1)}`).join("") +
    cur.oracle
      .slice()
      .reverse()
      .map((v, j) => `L${x(cur.oracle.length - 1 - j, cur.oracle.length).toFixed(1)},${y(v).toFixed(1)}`)
      .join("") +
    "Z";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Sparsification curves for raw and aligned uncertainty">
      <line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="var(--t-line)" />
      <line x1={L} y1={T} x2={L} y2={H - B} stroke="var(--t-line)" />
      <text x={L} y={H - 4} fontSize="8" fill="var(--t-faint)">0%</text>
      <text x={W - R} y={H - 4} fontSize="8" fill="var(--t-faint)" textAnchor="end">removed →</text>
      <text x={L - 4} y={y(1) + 3} fontSize="8" fill="var(--t-faint)" textAnchor="end">1.0</text>
      <text x={L - 4} y={H - B} fontSize="8" fill="var(--t-faint)" textAnchor="end">0</text>
      <path d={area} fill="var(--t-amber)" opacity="0.12" />
      <path d={path(cur.oracle)} fill="none" stroke="var(--t-dim)" strokeDasharray="3 3" strokeWidth="1" />
      <path
        d={path(raw.est)}
        fill="none"
        stroke="var(--t-alert)"
        strokeWidth={mode === "raw" ? 1.8 : 1}
        opacity={mode === "raw" ? 1 : 0.45}
      />
      <path
        d={path(aligned.est)}
        fill="none"
        stroke="var(--t-hi)"
        strokeWidth={mode === "aligned" ? 1.8 : 1}
        opacity={mode === "aligned" ? 1 : 0.45}
      />
    </svg>
  );
}
