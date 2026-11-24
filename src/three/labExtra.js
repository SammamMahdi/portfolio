/**
 * Geometry for the LMSA and Intervene3D lab demos. Both are schematic
 * illustrations written for this page, not model output.
 */
import { mulberry32 } from "../lib/rand.js";

/* ── LMSA: several views of one scene, one query token ────────────────── */
export const LMSA_CENTER = [0, 0.45, -0.4];
const LMSA_FOV = 50;

/** N cameras on an arc in front of the room, all looking at the centre. */
export function lmsaViews(n = 6) {
  const [cx, , cz] = LMSA_CENTER, R = 2.5;
  return Array.from({ length: n }, (_, k) => {
    const th = -0.95 + (1.9 * k) / (n - 1);
    return { pos: [cx + R * Math.sin(th), 1.05, cz + R * Math.cos(th)], fov: LMSA_FOV };
  });
}

/**
 * Which points each view "tokenises": those near its line of sight, thinned so
 * that each point is seen by only a few views (low redundancy).
 */
export function lmsaTokens(gt, views, seed = 4) {
  const rng = mulberry32(seed);
  const n = gt.length / 3;
  const per = views.map(() => []);
  const seenBy = Array.from({ length: n }, () => []);
  views.forEach((v, k) => {
    const ax = LMSA_CENTER[0] - v.pos[0], az = LMSA_CENTER[2] - v.pos[2];
    const a0 = Math.atan2(ax, az);
    for (let i = 0; i < n; i++) {
      const dx = gt[i * 3] - v.pos[0], dz = gt[i * 3 + 2] - v.pos[2];
      let da = Math.atan2(dx, dz) - a0;
      da = Math.atan2(Math.sin(da), Math.cos(da));
      if (Math.abs(da) < 0.3 && rng() < 0.75) {
        per[k].push(i);
        seenBy[i].push(k);
      }
    }
  });
  // the query: a point in a middle view that two or more other views also see
  const qView = Math.floor(views.length / 2);
  const cand = per[qView].filter((i) => seenBy[i].length >= 3);
  const pool = cand.length ? cand : per[qView];
  const q = pool[Math.floor(pool.length / 2)];
  // shared hub keys, drawn once per input from the other views
  const others = [];
  per.forEach((list, k) => k !== qView && list.forEach((i) => others.push(i)));
  const order = others.map((i) => ({ i, r: rng() })).sort((a, b) => a.r - b.r).map((o) => o.i);
  return { per, seenBy, qView, q, others, hubOrder: order };
}

/* ── Intervene3D: a screen showing a corridor vs the real corridor ───── */
export const I3D = {
  C0: [0, 0.7, 0.5], // initial camera
  zp: -1.55, // the screen plane (on the back wall)
  f: 600, // focal length in pixels for the separability readout
  tau: 4, // separability threshold in pixels
  ranges: [0.02, 0.2], // allowed sideways motion, metres
};

/** Real corridor (H_D) points behind the wall, and the same points painted on the screen (H_E). */
export function interveneScene() {
  const D = [];
  const seg = [];
  const W = 0.38, y0 = 0.28, y1 = 1.08, z0 = -2.0, z1 = -3.8;
  const sample = (a, b, step) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const k = Math.max(1, Math.round(len / step));
    for (let j = 0; j <= k; j++) D.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k, a[2] + ((b[2] - a[2]) * j) / k]);
    seg.push(...a, ...b);
  };
  // four long edges
  [[-W, y0], [W, y0], [W, y1], [-W, y1]].forEach(([x, y]) => sample([x, y, z0], [x, y, z1], 0.09));
  // cross-section frames along the corridor
  for (let z = z0; z >= z1 - 1e-6; z -= 0.45) {
    const c = [[-W, y0], [W, y0], [W, y1], [-W, y1]];
    c.forEach((p, i) => sample([p[0], p[1], z], [c[(i + 1) % 4][0], c[(i + 1) % 4][1], z], 0.1));
  }
  // a door at the far end
  const d = [[-0.15, y0], [0.15, y0], [0.15, 0.82], [-0.15, 0.82]];
  d.forEach((p, i) => sample([p[0], p[1], z1 + 0.01], [d[(i + 1) % 4][0], d[(i + 1) % 4][1], z1 + 0.01], 0.06));

  // the screen hypothesis: each corridor point moved along its ray from C0 onto the screen plane
  const { C0, zp } = I3D;
  const E = D.map((p) => {
    const t = (zp - C0[2]) / (p[2] - C0[2]);
    return [C0[0] + (p[0] - C0[0]) * t, C0[1] + (p[1] - C0[1]) * t, zp];
  });
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  E.forEach((p) => {
    minX = Math.min(minX, p[0]);
    maxX = Math.max(maxX, p[0]);
    minY = Math.min(minY, p[1]);
    maxY = Math.max(maxY, p[1]);
  });
  const m = 0.05;
  const panel = { x0: minX - m, x1: maxX + m, y0: minY - m, y1: maxY + m, z: zp };
  return { D, E, seg, panel };
}

/** Pixel position of P seen from a camera at C looking straight at the wall (−z). */
export function project(P, C, f = I3D.f) {
  const z = C[2] - P[2];
  return [(f * (P[0] - C[0])) / z, (f * (P[1] - C[1])) / z];
}

/** Median pixel disagreement between the two hypotheses after moving the camera sideways by d. */
export function separability(sc, d) {
  const C = [I3D.C0[0] + d, I3D.C0[1], I3D.C0[2]];
  const diffs = sc.D.map((p, i) => {
    const a = project(p, C), b = project(sc.E[i], C);
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
  }).sort((a, b) => a - b);
  return diffs[Math.floor(diffs.length / 2)];
}

/** Where the ray from C through P crosses the screen plane. */
export function onScreen(P, C, zp = I3D.zp) {
  const t = (zp - C[2]) / (P[2] - C[2]);
  return [C[0] + (P[0] - C[0]) * t, C[1] + (P[1] - C[1]) * t, zp];
}
