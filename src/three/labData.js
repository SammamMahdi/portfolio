/**
 * Pure geometry for the lab demos (no three.js), so it can be tested in Node.
 *
 * The toy scene stands in for a feed-forward reconstruction. Each "run" of a
 * perturbation ensemble returns the scene in its own similarity frame (Sim(3)
 * gauge) plus genuine per-point noise. ReVar3R's point: variance taken across
 * raw runs measures the gauge, not the geometry; align the runs first.
 */
import { mulberry32, gaussian } from "./core.js";

export const CAPTURE_CAM = [0, 1.05, 2.25];
export const LOOK_AT = [0, 0.3, -0.55];

export const OBJECTS = [
  { name: "cabinet", kind: "box", c: [-0.68, 0.36, -0.55], size: [0.62, 0.72, 0.5] },
  { name: "sphere", kind: "sphere", c: [0.5, 0.3, -0.2], r: 0.3 },
  { name: "bin", kind: "cyl", c: [0.05, 0.25, -1.05], r: 0.21, h: 0.5 },
  { name: "lamp", kind: "cyl", c: [0.95, 0.6, -0.95], r: 0.035, h: 1.2, thin: true },
];

export const extents = (o) =>
  o.kind === "box" ? o.size : o.kind === "sphere" ? [2 * o.r, 2 * o.r, 2 * o.r] : [2 * o.r, o.h, 2 * o.r];

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a) => Math.sqrt(dot(a, a));
const norm = (a) => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/* ── scene sampling ───────────────────────────────────────────────────── */
export function sampleScene(seed = 1) {
  const rng = mulberry32(seed);
  const P = [], N = [], thin = [];
  const push = (p, n, t = false) => { P.push(p); N.push(n); thin.push(t); };
  const j = (s) => (rng() - 0.5) * s;

  for (let x = -1.55; x <= 1.551; x += 0.14)
    for (let z = -1.55; z <= 0.751; z += 0.14) push([x + j(0.05), 0, z + j(0.05)], [0, 1, 0]);
  for (let x = -1.55; x <= 1.551; x += 0.15)
    for (let y = 0.08; y <= 1.3; y += 0.15) push([x + j(0.05), y + j(0.05), -1.6], [0, 0, 1]);

  for (const o of OBJECTS) {
    if (o.kind === "box") {
      const [w, h, d] = o.size, [cx, cy, cz] = o.c;
      const faces = [
        [[0, 1, 0], () => [cx + j(w), cy + h / 2, cz + j(d)], w * d],
        [[0, 0, 1], () => [cx + j(w), cy + j(h), cz + d / 2], w * h],
        [[0, 0, -1], () => [cx + j(w), cy + j(h), cz - d / 2], w * h],
        [[1, 0, 0], () => [cx + w / 2, cy + j(h), cz + j(d)], h * d],
        [[-1, 0, 0], () => [cx - w / 2, cy + j(h), cz + j(d)], h * d],
      ];
      for (const [n, gen, area] of faces) for (let i = 0; i < Math.round(area * 220); i++) push(gen(), n);
    } else if (o.kind === "sphere") {
      const M = 230;
      for (let i = 0; i < M; i++) {
        const y = 1 - (2 * (i + 0.5)) / M, r = Math.sqrt(1 - y * y), th = i * 2.399963;
        const n = [Math.cos(th) * r, y, Math.sin(th) * r];
        push([o.c[0] + n[0] * o.r, o.c[1] + n[1] * o.r, o.c[2] + n[2] * o.r], n);
      }
    } else {
      const M = o.thin ? 70 : 150;
      for (let i = 0; i < M; i++) {
        const th = rng() * Math.PI * 2, y = (rng() - 0.5) * o.h;
        const n = [Math.cos(th), 0, Math.sin(th)];
        push([o.c[0] + n[0] * o.r, o.c[1] + y, o.c[2] + n[2] * o.r], n, !!o.thin);
      }
      if (o.thin) {
        for (let i = 0; i < 40; i++) {
          const y = 1 - (2 * (i + 0.5)) / 40, r = Math.sqrt(1 - y * y), th = i * 2.399963;
          const n = [Math.cos(th) * r, y, Math.sin(th) * r];
          push([o.c[0] + n[0] * 0.09, o.c[1] + o.h / 2 + n[1] * 0.09, o.c[2] + n[2] * 0.09], n, true);
        }
      } else {
        for (let i = 0; i < 30; i++) {
          const a = rng() * Math.PI * 2, rr = Math.sqrt(rng()) * o.r;
          push([o.c[0] + Math.cos(a) * rr, o.c[1] + o.h / 2, o.c[2] + Math.sin(a) * rr], [0, 1, 0]);
        }
      }
    }
  }

  const n = P.length;
  const gt = new Float32Array(n * 3);
  const sigma = new Float32Array(n);
  const ray = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    gt.set(P[i], i * 3);
    const v = sub(P[i], CAPTURE_CAM), d = len(v), vn = norm(v);
    ray.set(vn, i * 3);
    // ground-truth noise model: grows with range, grazing angle, and thin structures
    let s = 0.006 + 0.0055 * Math.max(0, d - 1.7) ** 2;
    s += 0.016 * (1 - Math.abs(dot(N[i], vn))) ** 2;
    if (thin[i]) s += 0.028;
    sigma[i] = s;
  }
  return { n, gt, sigma, ray };
}

/* ── Sim(3) ───────────────────────────────────────────────────────────── */
function rotFromAxisAngle(ax, a) {
  const [x, y, z] = norm(ax), c = Math.cos(a), s = Math.sin(a), t = 1 - c;
  return [t * x * x + c, t * x * y - s * z, t * x * z + s * y,
          t * x * y + s * z, t * y * y + c, t * y * z - s * x,
          t * x * z - s * y, t * y * z + s * x, t * z * z + c];
}

/** dst[i] = s * R * src[i] + t, for flat xyz arrays. */
export function applySim3(src, { R, s, t }, out = new Float32Array(src.length)) {
  for (let i = 0; i < src.length; i += 3) {
    const x = src[i], y = src[i + 1], z = src[i + 2];
    out[i] = s * (R[0] * x + R[1] * y + R[2] * z) + t[0];
    out[i + 1] = s * (R[3] * x + R[4] * y + R[5] * z) + t[1];
    out[i + 2] = s * (R[6] * x + R[7] * y + R[8] * z) + t[2];
  }
  return out;
}

/** Cyclic Jacobi eigen-decomposition of a symmetric 4x4 matrix. */
function jacobi4(A) {
  const a = A.map((r) => r.slice());
  const v = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0;
    for (let p = 0; p < 3; p++) for (let q = p + 1; q < 4; q++) off += a[p][q] * a[p][q];
    if (off < 1e-22) break;
    for (let p = 0; p < 3; p++) {
      for (let q = p + 1; q < 4; q++) {
        if (Math.abs(a[p][q]) < 1e-30) continue;
        const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < 4; k++) {
          const akp = a[k][p], akq = a[k][q];
          a[k][p] = c * akp - s * akq;
          a[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < 4; k++) {
          const apk = a[p][k], aqk = a[q][k];
          a[p][k] = c * apk - s * aqk;
          a[q][k] = s * apk + c * aqk;
        }
        for (let k = 0; k < 4; k++) {
          const vkp = v[k][p], vkq = v[k][q];
          v[k][p] = c * vkp - s * vkq;
          v[k][q] = s * vkp + c * vkq;
        }
      }
    }
  }
  return { values: [a[0][0], a[1][1], a[2][2], a[3][3]], vectors: v };
}

/**
 * Least-squares similarity transform taking src onto dst (Horn's quaternion
 * method with Umeyama's scale): minimises sum |s R src_i + t - dst_i|^2.
 */
export function estimateSim3(src, dst) {
  const n = src.length / 3;
  const ms = [0, 0, 0], md = [0, 0, 0];
  for (let i = 0; i < src.length; i += 3) {
    ms[0] += src[i]; ms[1] += src[i + 1]; ms[2] += src[i + 2];
    md[0] += dst[i]; md[1] += dst[i + 1]; md[2] += dst[i + 2];
  }
  for (let k = 0; k < 3; k++) { ms[k] /= n; md[k] /= n; }
  let Sxx = 0, Sxy = 0, Sxz = 0, Syx = 0, Syy = 0, Syz = 0, Szx = 0, Szy = 0, Szz = 0, varS = 0;
  for (let i = 0; i < src.length; i += 3) {
    const ax = src[i] - ms[0], ay = src[i + 1] - ms[1], az = src[i + 2] - ms[2];
    const bx = dst[i] - md[0], by = dst[i + 1] - md[1], bz = dst[i + 2] - md[2];
    Sxx += ax * bx; Sxy += ax * by; Sxz += ax * bz;
    Syx += ay * bx; Syy += ay * by; Syz += ay * bz;
    Szx += az * bx; Szy += az * by; Szz += az * bz;
    varS += ax * ax + ay * ay + az * az;
  }
  const N = [
    [Sxx + Syy + Szz, Syz - Szy, Szx - Sxz, Sxy - Syx],
    [Syz - Szy, Sxx - Syy - Szz, Sxy + Syx, Szx + Sxz],
    [Szx - Sxz, Sxy + Syx, -Sxx + Syy - Szz, Syz + Szy],
    [Sxy - Syx, Szx + Sxz, Syz + Szy, -Sxx - Syy + Szz],
  ];
  const { values, vectors } = jacobi4(N);
  let best = 0;
  for (let k = 1; k < 4; k++) if (values[k] > values[best]) best = k;
  const [w, x, y, z] = [vectors[0][best], vectors[1][best], vectors[2][best], vectors[3][best]];
  const R = [
    w * w + x * x - y * y - z * z, 2 * (x * y - w * z), 2 * (x * z + w * y),
    2 * (x * y + w * z), w * w - x * x + y * y - z * z, 2 * (y * z - w * x),
    2 * (x * z - w * y), 2 * (y * z + w * x), w * w - x * x - y * y + z * z,
  ];
  // Umeyama scale: sum b'.(R a') / sum |a'|^2
  let num = 0;
  for (let i = 0; i < src.length; i += 3) {
    const ax = src[i] - ms[0], ay = src[i + 1] - ms[1], az = src[i + 2] - ms[2];
    const bx = dst[i] - md[0], by = dst[i + 1] - md[1], bz = dst[i + 2] - md[2];
    num += bx * (R[0] * ax + R[1] * ay + R[2] * az) + by * (R[3] * ax + R[4] * ay + R[5] * az) + bz * (R[6] * ax + R[7] * ay + R[8] * az);
  }
  const s = num / varS;
  const t = [
    md[0] - s * (R[0] * ms[0] + R[1] * ms[1] + R[2] * ms[2]),
    md[1] - s * (R[3] * ms[0] + R[4] * ms[1] + R[5] * ms[2]),
    md[2] - s * (R[6] * ms[0] + R[7] * ms[1] + R[8] * ms[2]),
  ];
  return { R, s, t };
}

/* ── ensemble + uncertainty ───────────────────────────────────────────── */
function perPointSpread(runs, n) {
  const out = new Float32Array(n), K = runs.length;
  for (let i = 0; i < n; i++) {
    let mx = 0, my = 0, mz = 0;
    for (const r of runs) { mx += r[i * 3]; my += r[i * 3 + 1]; mz += r[i * 3 + 2]; }
    mx /= K; my /= K; mz /= K;
    let v = 0;
    for (const r of runs) {
      const dx = r[i * 3] - mx, dy = r[i * 3 + 1] - my, dz = r[i * 3 + 2] - mz;
      v += dx * dx + dy * dy + dz * dz;
    }
    out[i] = Math.sqrt(v / K);
  }
  return out;
}

/** Sparsification curves and AUSE (area between estimate and oracle curves). */
export function sparsification(u, e, steps = 20) {
  const n = e.length;
  const order = (key) => Array.from({ length: n }, (_, i) => i).sort((a, b) => key[b] - key[a]);
  const total = e.reduce((s, x) => s + x, 0);
  const curve = (ord) => {
    const out = [];
    let removed = 0, k = 0;
    for (let j = 0; j < steps; j++) {
      const target = Math.floor((n * j) / steps);
      while (k < target) removed += e[ord[k++]];
      out.push((total - removed) / (n - k));
    }
    return out;
  };
  const est = curve(order(u)), oracle = curve(order(e));
  const base = est[0];
  const estN = est.map((x) => x / base), oraN = oracle.map((x) => x / base);
  const ause = estN.reduce((s, x, i) => s + (x - oraN[i]), 0) / steps;
  return { ause, est: estN, oracle: oraN };
}

/**
 * K perturbed runs, each returned in its own random Sim(3) gauge, then the
 * same runs after aligning every run onto run 0. Everything is finally
 * expressed in the ground-truth frame for display.
 */
export function buildEnsemble(scene, { K = 6, seed = 7, maxDeg = 7, maxScale = 0.07, maxShift = 0.07 } = {}) {
  const rng = mulberry32(seed * 7919 + 13);
  const { n, gt, sigma, ray } = scene;
  const centroid = [0, 0, 0];
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) centroid[k] += gt[i * 3 + k] / n;

  const raw = [], gauges = [];
  for (let r = 0; r < K; r++) {
    const noisy = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const g = gaussian(rng) * sigma[i];
      for (let k = 0; k < 3; k++) {
        noisy[i * 3 + k] = gt[i * 3 + k] - centroid[k] + ray[i * 3 + k] * g + gaussian(rng) * sigma[i] * 0.25;
      }
    }
    const ax = [gaussian(rng), gaussian(rng), gaussian(rng)];
    const gauge = {
      R: rotFromAxisAngle(ax, ((rng() * 2 - 1) * maxDeg * Math.PI) / 180),
      s: 1 + (rng() * 2 - 1) * maxScale,
      t: [centroid[0] + gaussian(rng) * maxShift, centroid[1] + gaussian(rng) * maxShift, centroid[2] + gaussian(rng) * maxShift],
    };
    gauges.push(gauge);
    raw.push(applySim3(noisy, gauge));
  }

  // ReVar3R step: register every run onto a reference before taking variance
  const IDENTITY = { R: [1, 0, 0, 0, 1, 0, 0, 0, 1], s: 1, t: [0, 0, 0] };
  const aligns = raw.map((run, r) => (r === 0 ? IDENTITY : estimateSim3(run, raw[0])));
  const aligned = raw.map((run, r) => applySim3(run, aligns[r]));
  // express the aligned stack in the ground-truth frame (display only)
  const toGT = estimateSim3(raw[0], gt);
  const alignedGT = aligned.map((run) => applySim3(run, toGT));

  // per-point error of the base prediction (run 0) after Sim(3)-aligning it to ground truth
  const pred = applySim3(raw[0], toGT);
  const err = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const dx = pred[i * 3] - gt[i * 3], dy = pred[i * 3 + 1] - gt[i * 3 + 1], dz = pred[i * 3 + 2] - gt[i * 3 + 2];
    err[i] = Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  const uRaw = perPointSpread(raw, n);
  const uAligned = perPointSpread(aligned, n);
  return {
    K, n, raw, alignedGT, uRaw, uAligned, err, gauges, aligns, toGT, centroid,
    raw_: sparsification(uRaw, err),
    aligned_: sparsification(uAligned, err),
    meanSigma: sigma.reduce((s, x) => s + x, 0) / n,
    meanRaw: uRaw.reduce((s, x) => s + x, 0) / n,
    meanAligned: uAligned.reduce((s, x) => s + x, 0) / n,
  };
}

/* ── CAMDet illustration: focal-length ambiguity ──────────────────────── */
export const CAMERAS = [
  { id: "tele", label: "TELE", fov: 28, pos: [-1.35, 1.15, 2.55] },
  { id: "normal", label: "NORMAL", fov: 52, pos: [0.05, 1.25, 2.3] },
  { id: "wide", label: "WIDE", fov: 76, pos: [1.3, 0.95, 1.7] },
];
export const TRAIN_FOV = 52;
const focal = (fov) => 1 / Math.tan(((fov / 2) * Math.PI) / 180);

/**
 * For one camera: where an intrinsics-blind detector (infers range from
 * apparent size, as if every photo came from the training camera) and an
 * intrinsics-conditioned detector place each object. A blind box is a scaled
 * copy along the viewing ray, so it projects onto the same pixels.
 */
export function detections(camera) {
  const k = focal(TRAIN_FOV) / focal(camera.fov);
  const wobble = [0.018, -0.022, 0.012, -0.015]; // small honest residuals, not perfection
  return OBJECTS.map((o, i) => {
    const v = sub(o.c, camera.pos), z = len(v), dir = norm(v);
    const zBlind = z * k, zCond = z * (1 + wobble[i]);
    const at = (zz) => [camera.pos[0] + dir[0] * zz, camera.pos[1] + dir[1] * zz, camera.pos[2] + dir[2] * zz];
    return {
      name: o.name,
      z,
      blind: { z: zBlind, c: at(zBlind), scale: zBlind / z },
      cond: { z: zCond, c: at(zCond), scale: zCond / z },
      size: extents(o),
    };
  });
}
