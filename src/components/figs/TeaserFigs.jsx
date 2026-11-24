import { useMemo } from "react";
import { mulberry32, gaussian } from "@/lib/rand";
import { FigFrame } from "./FigFrame";
import { useCanvas2D, C, rgba } from "./canvas2d";
import { openLab } from "./labLink";
import { LAYERS as LMSA_LAYERS, COST as LMSA_COST } from "@/data/lmsa";

const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x) => Math.max(0, Math.min(1, x));

function LabButton({ tab }) {
  return (
    <button type="button" className="btn-term is-sm" onClick={() => openLab(tab)}>
      interactive 3D ↑
    </button>
  );
}

/* ── ReVar3R: raw run-to-run spread is mostly the gauge ─────────────────── */
function makeToy() {
  const rng = mulberry32(5);
  const P = [];
  const add = (x, y, s) => P.push({ x, y, s });
  for (let x = -0.95; x <= 0.951; x += 0.065) add(x, 0.62, 0.01);
  for (let y = -0.62; y < 0.6; y += 0.065) add(-0.95, y, 0.01);
  for (let k = 0; k < 24; k++) {
    const u = k / 24, side = Math.floor(u * 4), f = (u * 4) % 1, h = 0.19;
    const pts = [[-h + 2 * h * f, -h], [h, -h + 2 * h * f], [h - 2 * h * f, h], [-h, h - 2 * h * f]][side];
    add(-0.3 + pts[0], -0.05 + pts[1], 0.011);
  }
  for (let k = 0; k < 20; k++) add(0.32 + 0.17 * Math.cos((k / 20) * 6.283), -0.42 + 0.17 * Math.sin((k / 20) * 6.283), 0.014);
  for (let k = 0; k < 12; k++) add(0.5 + 0.045 * Math.cos((k / 12) * 6.283), 0.2 + 0.045 * Math.sin((k / 12) * 6.283), 0.05); // thin pole
  const K = 5;
  const runs = Array.from({ length: K }, () => {
    const th = (rng() * 2 - 1) * 0.13, sc = 1 + (rng() * 2 - 1) * 0.07;
    return {
      th, sc, tx: gaussian(rng) * 0.06, ty: gaussian(rng) * 0.06,
      noise: P.map((p) => [gaussian(rng) * p.s, gaussian(rng) * p.s]),
    };
  });
  const spread = (a) => {
    let sum = 0;
    const per = P.map((p, i) => {
      const xs = runs.map((r) => place(p, r, i, a));
      const mx = xs.reduce((s, q) => s + q[0], 0) / K, my = xs.reduce((s, q) => s + q[1], 0) / K;
      const v = Math.sqrt(xs.reduce((s, q) => s + (q[0] - mx) ** 2 + (q[1] - my) ** 2, 0) / K);
      sum += v;
      return v;
    });
    return { per, mean: sum / P.length };
  };
  return { P, runs, K, spread, raw: spread(0).mean, aligned: spread(1).mean };
}

function place(p, r, i, a) {
  const x = p.x + r.noise[i][0], y = p.y + r.noise[i][1];
  const th = r.th * (1 - a), sc = 1 + (r.sc - 1) * (1 - a);
  const c = Math.cos(th), s = Math.sin(th);
  return [sc * (c * x - s * y) + r.tx * (1 - a), sc * (s * x + c * y) + r.ty * (1 - a)];
}

export function RevarFig() {
  const toy = useMemo(makeToy, []);
  const ref = useCanvas2D(
    (ctx, { w, h, t }) => {
      const T = t % 10;
      const a = T < 3.2 ? 0 : T < 4.6 ? ease((T - 3.2) / 1.4) : T < 8.6 ? 1 : 1 - ease((T - 8.6) / 1.4);
      const S = Math.min(w / 2.3, (h - 40) / 1.45), cx = w / 2, cy = h / 2 + 4;
      const X = (v) => cx + v[0] * S, Y = (v) => cy - v[1] * S;
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, w, h);

      const { per } = toy.spread(a);
      // spread rings: what a variance-based uncertainty would report right now
      const ringCol = a < 0.5 ? C.alert : C.amber;
      toy.P.forEach((p, i) => {
        const r = per[i] * S * 1.6;
        if (r < 1.2) return;
        ctx.strokeStyle = rgba(ringCol, 0.35);
        ctx.beginPath();
        ctx.arc(X([p.x, p.y]), Y([p.x, p.y]), r, 0, Math.PI * 2);
        ctx.stroke();
      });
      // each run's frame
      toy.runs.forEach((r) => {
        const o = place({ x: 0, y: 0 }, { ...r, noise: [[0, 0]] }, 0, a), ex = place({ x: 0.16, y: 0 }, { ...r, noise: [[0, 0]] }, 0, a), ey = place({ x: 0, y: 0.16 }, { ...r, noise: [[0, 0]] }, 0, a);
        ctx.strokeStyle = rgba(C.hi, 0.7);
        ctx.beginPath();
        ctx.moveTo(X(o), Y(o));
        ctx.lineTo(X(ex), Y(ex));
        ctx.moveTo(X(o), Y(o));
        ctx.lineTo(X(ey), Y(ey));
        ctx.stroke();
      });
      // the runs themselves
      toy.runs.forEach((r, k) => {
        ctx.fillStyle = rgba(k === 0 ? C.hi : C.amber, 0.75);
        toy.P.forEach((p, i) => {
          const q = place(p, r, i, a);
          ctx.fillRect(X(q) - 1.1, Y(q) - 1.1, 2.2, 2.2);
        });
      });

      ctx.font = `10px ${C.font}`;
      ctx.fillStyle = a < 0.5 ? C.alert : C.hi;
      const label = a === 0 ? "RAW · 5 runs, 5 similarity frames" : a === 1 ? "ALIGNED · spread left = real uncertainty" : "ALIGNING Sim(3)…";
      ctx.fillText(label, 10, 16);
      ctx.fillStyle = C.faint;
      ctx.fillText("rings = per-point spread", 10, h - 8);
    },
    { stillAt: 6 }
  );

  return (
    <FigFrame
      title="gauge-aware spread"
      tabs={<LabButton tab="revar3r" />}
      caption={
        <>
          Before alignment the rings are biggest far from the centre — that is rotation and scale, not doubt. After it,
          only the thin pole stays uncertain. Mean spread{" "}
          <span className="t-alert">{toy.raw.toFixed(3)}</span> → <span className="t-hi">{toy.aligned.toFixed(3)}</span>.
        </>
      }
      note="A 2D sketch of the idea (toy numbers). The interactive 3D version above (key research interests) adds AUSE."
    >
      <div className="relative h-[240px] sm:h-full sm:min-h-[260px]">
        <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-label="Animated sketch: five runs in different similarity frames, then aligned" />
      </div>
    </FigFrame>
  );
}

/* ── LMSA: each global layer gets its own attention estimator ───────────── */
export function LmsaFig() {
  const keys = useMemo(() => {
    // 8 views x 14 tokens; which keys a diffuse layer samples as hubs
    const rng = mulberry32(11);
    return Array.from({ length: 8 * 14 }, () => rng());
  }, []);
  const ref = useCanvas2D(
    (ctx, { w, h, t }) => {
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, w, h);
      const cur = Math.floor(t / 0.55) % 24;
      const L = LMSA_LAYERS[cur];
      ctx.font = `10px ${C.font}`;

      // top: the per-layer statistic, with the fixed cut-off
      const top = 26, bh = h * 0.36, bw = (w - 40) / 24, base = top + bh;
      const cut = base - (1.5 / 2.6) * bh;
      LMSA_LAYERS.forEach((d) => {
        const x = 20 + d.l * bw, hh = (Math.min(d.stat, 2.6) / 2.6) * bh;
        const exact = d.kind === "exact";
        ctx.fillStyle = rgba(exact ? C.hi : C.amber, d.l === cur ? 0.95 : exact ? 0.7 : 0.4);
        ctx.fillRect(x + 1, base - hh, bw - 2, hh);
        if (exact) {
          ctx.strokeStyle = C.hi;
          ctx.strokeRect(x + 1.5, base - hh + 0.5, bw - 3, hh - 1);
        }
      });
      ctx.strokeStyle = rgba(C.alert, 0.8);
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(16, cut);
      ctx.lineTo(w - 16, cut);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = C.alert;
      ctx.fillText("cut-off 1.5", w - 88, cut - 4);
      ctx.fillStyle = C.faint;
      ctx.fillText("global layer 0 … 23", 20, base + 12);
      ctx.fillStyle = L.kind === "exact" ? C.hi : C.amber;
      ctx.fillText(
        `layer ${cur}: ${L.kind === "exact" ? "MATCHING · exact attention, all keys" : `DIFFUSE · own view + ${L.hubs} shared hubs`}`,
        10,
        16
      );

      // bottom: which keys one query reads (rows = views, query in view 0)
      const gy = base + 26, rows = 8, cols = 14;
      const cw = Math.min((w - 150) / cols, 14), ch = Math.min((h - gy - 26) / rows, 12);
      const p = 0.12 + (L.hubs === 1024 ? 0.1 : 0);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const read = L.kind === "exact" || r === 0 || keys[r * cols + c] < p;
          ctx.fillStyle = read ? rgba(L.kind === "exact" ? C.hi : C.amber, r === 0 ? 0.9 : 0.7) : rgba(C.line, 0.6);
          ctx.fillRect(20 + c * cw, gy + r * ch, cw - 2, ch - 2);
        }
      ctx.fillStyle = C.faint;
      ctx.fillText("keys read by one query (row = view)", 20, h - 8);

      // cost per token, from the paper
      const cx = 20 + cols * cw + 18;
      ctx.fillStyle = C.dim;
      ctx.fillText("GFLOP/token", cx, gy + 8);
      const step = Math.min(30, (h - gy - 30) / 3);
      LMSA_COST.forEach((c, i) => {
        const y = gy + 26 + i * step, sc = (w - cx - 70) / 22.49;
        ctx.fillStyle = C.faint;
        ctx.fillText(`N=${c.n}`, cx, y + 9);
        const bx = cx + 44;
        ctx.fillStyle = rgba(C.dim, 0.5);
        ctx.fillRect(bx, y, c.dense * sc, 6);
        ctx.fillStyle = C.amber;
        ctx.fillRect(bx, y + 8, c.lmsa * sc, 6);
      });
    },
    { stillAt: 7 }
  );

  return (
    <FigFrame
      title="layer-matched sparse attention"
      tabs={<LabButton tab="lmsa" />}
      caption={
        <>
          Most layers only need the gist of the other views, so they read their own view plus a few hundred shared{" "}
          <span className="t-amber">hub</span> keys. The few layers whose statistic crosses the cut-off match points
          across views and keep <span className="t-hi">exact</span> attention. Cost per token (grey dense, amber LMSA) is
          the paper&rsquo;s.
        </>
      }
      note="Layer roles, hub counts and costs follow the paper; bar heights and the key grid are schematic."
    >
      <div className="relative h-[260px] sm:h-full sm:min-h-[280px]">
        <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-label="Animated sketch: per-layer statistic and the keys each layer reads" />
      </div>
    </FigFrame>
  );
}

/* ── Intervene3D: a screen and a real corridor look the same until you move ── */
export function Intervene3DFig() {
  const ref = useCanvas2D(
    (ctx, { w, h, t }) => {
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, w, h);
      ctx.font = `10px ${C.font}`;
      // two rounds: a small allowed motion (abstain), then a larger one (answer)
      const T = t % 12, round = T < 6 ? 0 : 1, u = (T % 6) / 6;
      const dMax = round === 0 ? 0.12 : 0.6;
      const d = dMax * Math.sin(Math.min(1, u / 0.7) * Math.PI * 0.5);

      // top-down scene: camera at bottom, display panel, depicted corridor behind it
      const zp = 1, zc = 2.2;
      const sy = h - 74, S = Math.min(w / 4.2, (sy - 50) / zc), sx = w * 0.42;
      const feats = [-0.32, -0.11, 0.1, 0.3]; // where the screen shows each corridor point
      const P = (x, z) => [sx + x * S, sy - z * S];
      const cam = P(d, 0);
      // sight rays from the camera to each corridor point
      ctx.strokeStyle = rgba(C.dim, 0.35);
      ctx.setLineDash([2, 4]);
      feats.forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(...cam);
        ctx.lineTo(...P(x * (zc / zp), zc));
        ctx.stroke();
      });
      ctx.setLineDash([]);
      // depicted corridor (H_D)
      ctx.fillStyle = C.amber;
      feats.forEach((x) => ctx.fillRect(P(x * (zc / zp), zc)[0] - 3, P(0, zc)[1] - 3, 6, 6));
      ctx.fillText("real corridor (H_D)", P(0.85, zc)[0] + 6, P(0, zc)[1] + 4);
      // the screen and the picture on it (H_E)
      ctx.strokeStyle = C.hi;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(...P(-0.45, zp));
      ctx.lineTo(...P(0.45, zp));
      ctx.stroke();
      ctx.lineWidth = 1;
      feats.forEach((x) => ctx.strokeRect(P(x, zp)[0] - 3, P(0, zp)[1] - 3, 6, 6));
      ctx.fillStyle = C.hi;
      ctx.fillText("screen (H_E)", P(0.5, zp)[0] + 6, P(0, zp)[1] + 4);
      // camera and allowed motion range
      ctx.strokeStyle = rgba(C.dim, 0.6);
      ctx.beginPath();
      ctx.moveTo(...P(-dMax, -0.12));
      ctx.lineTo(...P(dMax, -0.12));
      ctx.stroke();
      ctx.fillStyle = C.faint;
      ctx.fillText(`allowed motion ±${dMax.toFixed(2)}`, P(dMax, -0.12)[0] + 8, P(0, -0.12)[1] + 3);
      ctx.fillStyle = C.text;
      ctx.fillRect(cam[0] - 6, cam[1] - 4, 12, 8);

      // predicted image positions under each hypothesis (they coincide at d = 0)
      const iy = h - 30, ix = 30, iw = w - 60, f = iw * 0.55;
      ctx.strokeStyle = C.line;
      ctx.strokeRect(ix, iy - 8, iw, 16);
      let sep = 0;
      feats.forEach((x) => {
        const X = x * (zc / zp), xp = x; // same ray at d = 0
        const uD = (X - d) / zc, uE = (xp - d) / zp;
        sep = Math.max(sep, Math.abs(uD - uE));
        ctx.fillStyle = C.amber;
        ctx.fillRect(ix + iw / 2 + uD * f - 2, iy - 5, 4, 10);
        ctx.strokeStyle = C.hi;
        ctx.strokeRect(ix + iw / 2 + uE * f - 3, iy - 6, 6, 12);
      });
      ctx.fillStyle = C.faint;
      ctx.fillText("image after the move: amber = real depth, outline = screen", ix, iy + 20);

      // decision
      const tau = 0.12, done = u > 0.75;
      ctx.fillStyle = C.dim;
      ctx.fillText(`separability ${sep.toFixed(2)}  ·  threshold ${tau}`, 10, 16);
      if (done) {
        const ok = sep >= tau;
        ctx.fillStyle = ok ? C.hi : C.alert;
        ctx.fillText(ok ? "ANSWER: screen · first surface at the panel" : "ABSTAIN: no allowed move separates them", 10, 30);
      } else {
        ctx.fillStyle = C.faint;
        ctx.fillText(d < 0.01 ? "identical first image" : "moving the camera…", 10, 30);
      }
    },
    { stillAt: 10.8 }
  );

  return (
    <FigFrame
      title="motion as evidence"
      tabs={<LabButton tab="intervene3d" />}
      caption={
        <>
          A <span className="t-hi">screen</span> showing a corridor and a{" "}
          <span className="t-amber">real corridor</span> give the same first image. A camera move shifts them differently;
          Intervene3D answers only when an allowed move separates the explanations, and{" "}
          <span className="t-alert">abstains</span> otherwise. On real displays, one executed move cut the median
          surface error of twelve depth networks by 31.5%.
        </>
      }
      note="A top-down sketch of the idea (toy geometry); the 31.5% is the paper's result."
    >
      <div className="relative h-[260px] sm:h-full sm:min-h-[280px]">
        <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-label="Animated sketch: a screen and a real corridor separated by camera motion" />
      </div>
    </FigFrame>
  );
}

/* ── CAMDet: same pixels, different lens, different distance ───────────── */
const LENSES = [28, 52, 76];
const TRAIN = 52;
const tanH = (fov) => Math.tan((fov * Math.PI) / 360);

export function CamdetFig() {
  const ref = useCanvas2D(
    (ctx, { w, h, t }) => {
      const per = 3.4, i = Math.floor(t / per) % 3, f = (t % per) / per;
      const prev = LENSES[(i + 2) % 3], cur = LENSES[i];
      const fov = prev + (cur - prev) * ease(clamp01(f / 0.25));
      const k = tanH(fov) / tanH(TRAIN); // blind range factor = f_train / f_cam

      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, w, h);
      const top = h - 46; // image strip lives below
      const cam = [w * 0.08, top * 0.55], dir = -0.12;
      const along = (d) => [cam[0] + Math.cos(dir) * d, cam[1] + Math.sin(dir) * d];
      const Z = w * 0.4, s = w * 0.07;

      // field of view
      ctx.fillStyle = rgba(C.amber, 0.05);
      ctx.strokeStyle = rgba(C.amber, 0.35);
      const half = (fov * Math.PI) / 360, L = w;
      ctx.beginPath();
      ctx.moveTo(...cam);
      ctx.lineTo(cam[0] + Math.cos(dir - half) * L, cam[1] + Math.sin(dir - half) * L);
      ctx.lineTo(cam[0] + Math.cos(dir + half) * L, cam[1] + Math.sin(dir + half) * L);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // camera body
      ctx.fillStyle = C.hi;
      ctx.fillRect(cam[0] - 12, cam[1] - 6, 12, 12);

      const box = (c, size, col, dash) => {
        ctx.strokeStyle = col;
        ctx.setLineDash(dash || []);
        ctx.lineWidth = 1.5;
        ctx.strokeRect(c[0] - size / 2, c[1] - size / 2, size, size);
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
      };
      // the rays through the object's edges: everything inside projects to the same pixels
      const g = along(Z);
      ctx.strokeStyle = rgba(C.dim, 0.45);
      ctx.setLineDash([3, 4]);
      [-1, 1].forEach((sg) => {
        const e = [g[0], g[1] + (sg * s) / 2];
        const d = [e[0] - cam[0], e[1] - cam[1]];
        ctx.beginPath();
        ctx.moveTo(...cam);
        ctx.lineTo(cam[0] + d[0] * 2.4, cam[1] + d[1] * 2.4);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      box(g, s, C.dim, [4, 3]);
      box(along(Z * k), s * k, C.alert);
      box(along(Z * (1 + 0.025 * Math.sin(t * 1.7))), s, C.amber);

      ctx.font = `10px ${C.font}`;
      ctx.fillStyle = C.hi;
      ctx.fillText(`lens ${fov.toFixed(0)}°`, 10, 16);
      ctx.fillStyle = C.alert;
      ctx.fillText(`blind range ×${k.toFixed(2)}`, 10, 30);

      // the image the camera sees: object extent on the sensor
      const iy = top + 16, ix = 40, iw = w - 80;
      const frac = Math.min(1, s / Z / (2 * tanH(fov)));
      ctx.strokeStyle = C.line;
      ctx.strokeRect(ix, iy, iw, 12);
      ctx.fillStyle = rgba(C.amber, 0.85);
      ctx.fillRect(ix + iw / 2 - (frac * iw) / 2, iy + 2, frac * iw, 8);
      ctx.fillStyle = C.faint;
      ctx.fillText("image", ix, iy - 4);
      ctx.fillText("same pixels for all three boxes", ix + iw - 190, iy + 28);
    },
    { stillAt: 1.2 }
  );

  return (
    <FigFrame
      title="focal-length ambiguity"
      tabs={<LabButton tab="camdet" />}
      caption={
        <>
          Same object, same distance, three lenses. An intrinsics-blind detector reads range from apparent size, so its{" "}
          <span className="t-alert">box</span> slides along the ray; conditioning on the intrinsics keeps the{" "}
          <span className="t-amber">box</span> on the <span className="t-dim">ground truth</span>.
        </>
      }
      note="An illustration of the failure mode, not model output. The interactive 3D version above lets you look through each camera."
    >
      <div className="relative h-[240px] sm:h-full sm:min-h-[260px]">
        <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-label="Animated sketch: a camera cycling through three lenses" />
      </div>
    </FigFrame>
  );
}
