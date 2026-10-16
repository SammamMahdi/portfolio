import { useMemo } from "react";
import { mulberry32, gaussian } from "@/lib/rand";
import { FigFrame } from "./FigFrame";
import { useCanvas2D, C, rgba } from "./canvas2d";
import { openLab } from "./labLink";

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
