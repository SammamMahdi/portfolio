import { useMemo, useRef, useState } from "react";
import { mulberry32, gaussian } from "@/lib/rand";
import { IMPORTANCE, GLOSS, ACCURACY } from "@/data/sleep";
import { FigFrame, Tab } from "./FigFrame";
import { useCanvas2D, C, rgba } from "./canvas2d";

const STAGES = ["Wake", "REM", "Light", "Deep"]; // hypnogram order, top to bottom
// illustrative physiology per stage: heart rate (bpm), its jitter, pulse amplitude
const PHYS = {
  Wake: { hr: 74, j: 6, amp: 0.78 },
  REM: { hr: 67, j: 7, amp: 0.82 },
  Light: { hr: 61, j: 2.5, amp: 0.95 },
  Deep: { hr: 56, j: 1.2, amp: 1.08 },
};
const EPOCHS = 960; // 8 h of 30-s epochs
const LOOP = 44; // seconds of animation per night

/** A plausible synthetic night: ~90-min cycles, deep sleep early, REM late. */
function makeNight(seed = 4) {
  const rng = mulberry32(seed);
  const out = [];
  const push = (stage, n) => {
    for (let i = 0; i < n && out.length < EPOCHS; i++) out.push(stage);
  };
  push("Wake", 24);
  for (let c = 0; c < 6 && out.length < EPOCHS; c++) {
    const deep = Math.max(0, 52 - c * 14), rem = 14 + c * 9;
    push("Light", 34 + Math.round(rng() * 18));
    if (deep) push("Deep", deep + Math.round(rng() * 10));
    push("Light", 22 + Math.round(rng() * 12));
    push("REM", rem + Math.round(rng() * 8));
    if (rng() < 0.6) push("Wake", 3 + Math.round(rng() * 5));
  }
  while (out.length < EPOCHS) out.push("Wake");
  return out;
}

const beat = (phi) => Math.exp(-(((phi - 0.2) / 0.075) ** 2)) + 0.42 * Math.exp(-(((phi - 0.47) / 0.1) ** 2));

export default function SleepFig({ variant = "xai" }) {
  const night = useMemo(() => makeNight(), []);
  const [model, setModel] = useState("RF");
  const [approach, setApproach] = useState("approach 1");
  const stageEl = useRef(null);
  const sim = useRef({ beats: [], rng: mulberry32(9), stage: "" });

  const ref = useCanvas2D((ctx, { w, h, t }) => {
    const S = sim.current;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.font = `10px ${C.font}`;

    const epoch = Math.floor(((t % LOOP) / LOOP) * EPOCHS);
    const stage = night[epoch];
    if (stage !== S.stage) {
      S.stage = stage;
      if (stageEl.current) stageEl.current.textContent = stage;
    }

    // ── PPG strip (top) ──
    const ph = Math.round(h * 0.56), pad = 10, span = 7; // seconds visible
    const speed = 1.6; // signal seconds per real second
    const now = t * speed;
    // extend the beat train with the current stage's physiology
    let last = S.beats[S.beats.length - 1];
    if (!last || last.t0 > now + 2) {
      S.beats = [];
      last = null;
    }
    while (!last || last.t0 + last.d < now + 1) {
      const p = PHYS[stage];
      const hr = p.hr + gaussian(S.rng) * p.j;
      const b = { t0: last ? last.t0 + last.d : now - span - 1, d: 60 / hr, a: p.amp * (1 + gaussian(S.rng) * (stage === "REM" || stage === "Wake" ? 0.09 : 0.03)) };
      S.beats.push(b);
      last = b;
    }
    S.beats = S.beats.filter((b) => b.t0 + b.d > now - span - 1);
    const X = (s) => pad + ((s - (now - span)) / span) * (w - 2 * pad);
    const Y = (v) => ph - 18 - v * (ph - 46);

    ctx.strokeStyle = C.line;
    ctx.beginPath();
    ctx.moveTo(pad, ph - 0.5);
    ctx.lineTo(w - pad, ph - 0.5);
    ctx.stroke();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = C.amber;
    ctx.shadowColor = rgba(C.amber, 0.55);
    ctx.shadowBlur = 6;
    ctx.beginPath();
    let first = true;
    for (let px = pad; px <= w - pad; px += 1.5) {
      const s = now - span + ((px - pad) / (w - 2 * pad)) * span;
      const b = S.beats.find((q) => s >= q.t0 && s < q.t0 + q.d);
      const v = b ? b.a * beat((s - b.t0) / b.d) * 0.85 + 0.04 * Math.sin(s * 0.9) : 0;
      if (first) ctx.moveTo(px, Y(v));
      else ctx.lineTo(px, Y(v));
      first = false;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;

    // detected systolic peaks + the features read off the last full beats
    const vis = S.beats.filter((b) => b.t0 + 0.2 * b.d > now - span && b.t0 + 0.2 * b.d < now);
    ctx.fillStyle = C.hi;
    vis.forEach((b) => {
      ctx.beginPath();
      ctx.arc(X(b.t0 + 0.2 * b.d), Y(b.a * 0.85), 2.4, 0, Math.PI * 2);
      ctx.fill();
    });
    if (vis.length >= 3) {
      const a = vis[vis.length - 3], b = vis[vis.length - 2];
      const xa = X(a.t0 + 0.2 * a.d), xb = X(b.t0 + 0.2 * b.d), yt = 14;
      ctx.strokeStyle = C.dim;
      ctx.beginPath();
      ctx.moveTo(xa, yt + 4);
      ctx.lineTo(xa, yt);
      ctx.lineTo(xb, yt);
      ctx.lineTo(xb, yt + 4);
      ctx.stroke();
      ctx.fillStyle = C.dim;
      ctx.fillText(`PPI ${((b.t0 - a.t0) * 1000).toFixed(0)} ms`, xa + 4, yt - 3);
      // pulse width at half height on beat b
      const half = Y(b.a * 0.85 * 0.5);
      const x0 = X(b.t0 + 0.2 * b.d - 0.06 * b.d), x1 = X(b.t0 + 0.2 * b.d + 0.1 * b.d);
      ctx.strokeStyle = C.alert;
      ctx.beginPath();
      ctx.moveTo(x0, half);
      ctx.lineTo(x1, half);
      ctx.stroke();
      ctx.fillStyle = C.alert;
      ctx.fillText("pw", x1 + 3, half + 3);
    }
    ctx.fillStyle = C.faint;
    ctx.fillText("PPG · synthetic", pad, ph - 4);

    // ── hypnogram (bottom) ──
    const top = ph + 12, bot = h - 14, left = 34, right = w - pad;
    const yS = (s) => top + (STAGES.indexOf(s) / 3) * (bot - top);
    const xE = (e) => left + (e / EPOCHS) * (right - left);
    ctx.fillStyle = C.faint;
    STAGES.forEach((s) => ctx.fillText(s[0] === "L" ? "Lt" : s[0] === "D" ? "Dp" : s[0] === "R" ? "REM" : "W", 6, yS(s) + 3));
    for (const pass of ["future", "past"]) {
      ctx.strokeStyle = pass === "past" ? C.amber : C.line;
      ctx.lineWidth = pass === "past" ? 1.4 : 1;
      ctx.beginPath();
      const end = pass === "past" ? epoch : EPOCHS - 1;
      for (let e = 0; e <= end; e++) {
        const y = yS(night[e]);
        if (e === 0) ctx.moveTo(xE(0), y);
        else {
          ctx.lineTo(xE(e), yS(night[e - 1]));
          ctx.lineTo(xE(e), y);
        }
      }
      ctx.stroke();
    }
    ctx.lineWidth = 1;
    // current 30-s epoch
    ctx.strokeStyle = C.hi;
    ctx.beginPath();
    ctx.moveTo(xE(epoch) + 0.5, top - 4);
    ctx.lineTo(xE(epoch) + 0.5, bot + 4);
    ctx.stroke();
    ctx.fillStyle = C.faint;
    ctx.fillText("0 h", left, h - 2);
    ctx.fillText("8 h", right - 18, h - 2);
  });

  const imp = IMPORTANCE[model];
  const max = imp[0][1];
  const acc = ACCURACY[approach];

  return (
    <FigFrame
      title={variant === "xai" ? "ppg → 4 stages, explained" : "ppg → 4 stages, model families"}
      tabs={
        variant === "xai"
          ? Object.keys(IMPORTANCE).map((m) => (
              <Tab key={m} on={model === m} onClick={() => setModel(m)}>
                {m}
              </Tab>
            ))
          : Object.keys(ACCURACY).map((a) => (
              <Tab key={a} on={approach === a} onClick={() => setApproach(a)}>
                {a}
              </Tab>
            ))
      }
      caption={
        variant === "xai"
          ? "Pulse features per signal segment (pulse width, intervals, areas, complexity) → Wake / Light / Deep / REM. Bars: which features each model leaned on."
          : "The same pipeline compared across model families. Bars: 4-class accuracy on held-out segments."
      }
      note="Waveform and night are synthetic. Feature importances and accuracies are copied from the project's code repository (evaluation logs and XAI exports), not from the papers' tables."
    >
      <div className="grid h-full sm:grid-cols-[1fr_12.5rem]">
        <div className="relative h-[230px] sm:h-full sm:min-h-[260px]">
          <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-label="Synthetic PPG waveform and hypnogram of one night" />
          <div
            className="pointer-events-none absolute right-3 text-[0.65rem] uppercase tracking-[0.14em] t-dim"
            style={{ top: "calc(56% - 17px)" }}
          >
            stage <span ref={stageEl} className="t-hi" />
          </div>
        </div>
        <div className="border-t border-[var(--t-line)] p-3 text-[0.7rem] sm:border-l sm:border-t-0">
          {variant === "xai" ? (
            <>
              <div className="mb-2 uppercase tracking-[0.14em] t-dim">{model} · top features</div>
              {imp.map(([k, v]) => {
                const base = k.replace("_statistical", "");
                return (
                  <div key={k} className="mb-1.5">
                    <div className="truncate t-text" title={k}>
                      {base}
                      {k !== base && <span className="t-faint"> (stat)</span>}
                    </div>
                    <div className="mt-0.5 h-1.5 bg-[var(--t-line)]">
                      <div className="h-full bg-[var(--t-amber)]" style={{ width: `${(v / max) * 100}%` }} />
                    </div>
                    {GLOSS[base] && <div className="t-faint">{GLOSS[base]}</div>}
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <div className="mb-2 uppercase tracking-[0.14em] t-dim">4-class accuracy · {approach}</div>
              {acc.map(([m, v]) => (
                <div key={m} className="mb-2">
                  <div className="flex justify-between">
                    <span className="t-text">{m}</span>
                    <span className="tabular-nums t-hi">{v.toFixed(2)}%</span>
                  </div>
                  <div className="mt-0.5 h-1.5 bg-[var(--t-line)]">
                    <div className="h-full bg-[var(--t-amber)]" style={{ width: `${((v - 60) / 20) * 100}%` }} />
                  </div>
                </div>
              ))}
              <div className="mt-1 t-faint">bars start at 60%</div>
              <div className="mt-3 space-y-0.5 t-dim">
                <div>classes: Wake · Light · Deep · REM</div>
                <div>~2.8k held-out segments</div>
              </div>
            </>
          )}
        </div>
      </div>
    </FigFrame>
  );
}
