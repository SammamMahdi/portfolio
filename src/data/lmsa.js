/**
 * LMSA numbers shared by the 2D figure and the 3D lab demo.
 * Layer roles, hub counts and costs follow the paper (arXiv:2611.23554, Fig. 1);
 * the per-layer statistic heights are schematic.
 */

export const CUTOFF = 1.5;

export const LAYERS = Array.from({ length: 24 }, (_, l) => {
  if (l >= 11 && l <= 16) return { l, kind: "exact", stat: 1.9 + 0.5 * Math.sin(l * 1.3) };
  if (l <= 8) return { l, kind: "hubs", hubs: 256, stat: 0.35 + 0.25 * Math.abs(Math.sin(l * 2.1)) };
  return { l, kind: "hubs", hubs: 1024, stat: 0.7 + 0.35 * Math.abs(Math.sin(l * 1.7)) };
});

// GFLOP per token of global attention (paper, Fig. 1f).
export const COST = [
  { n: 32, dense: 5.29, lmsa: 2.99 },
  { n: 100, dense: 12.25, lmsa: 4.76 },
  { n: 200, dense: 22.49, lmsa: 7.35 },
];

// 33,312 keys per query at N = 32 (paper, Sec. 1) → 1,041 tokens per view, 5 of them special.
export const TOKENS_PER_VIEW = 1041;
export const SPECIAL_PER_VIEW = 5;

/** Keys one query reads in a given layer, with N views. */
export function keysRead(layer, n) {
  if (layer.kind === "exact") return n * TOKENS_PER_VIEW;
  return TOKENS_PER_VIEW + (n - 1) * SPECIAL_PER_VIEW + layer.hubs;
}
