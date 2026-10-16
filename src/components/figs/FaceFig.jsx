import { useEffect, useState } from "react";
import { useStage } from "@/three/useStage";
import { FaceScene, STEPS } from "@/three/FaceScene";
import { IMPORTANCE } from "@/data/faceMesh";
import { useInView, useReducedMotion } from "@/hooks/useTerm";
import { FigFrame, Tab } from "./FigFrame";

const LABEL = { mesh: "mesh", landmarks: "468", select: "228", normalize: "norm", xai: "xai", droop: "droop" };

const CAPTION = {
  mesh: "MediaPipe Face Landmarker run on my own photo — the model's 2,556-edge mesh.",
  landmarks: "Its 468 surface landmarks (the 10 iris points are left out).",
  select: "The paper keeps 228 landmark features from 29 regions: eyes, brows, nose, lips and cheeks.",
  normalize:
    "Every face is centred on the nose tip and scaled by the outer-eye-corner distance, then each landmark becomes one y/x ratio.",
  xai: "Region importance from the paper's XAI, summed over Random Forest, CatBoost and XGBoost — cheeks first, then lips.",
  droop: "Simulate a one-sided droop on the right side of the face and watch the y/x signature move.",
};

const TOP = Object.entries(IMPORTANCE)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);
const MAX = TOP[0][1];
const pretty = (k) => k.replace(/([A-Z])/g, " $1").replace(/(\d)/, " $1").toLowerCase();

export default function FaceFig() {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView({ once: false, rootMargin: "0px" });
  const [step, setStep] = useState("mesh");
  const [auto, setAuto] = useState(!reduced);
  const [droop, setDroop] = useState(0);
  const [read, setRead] = useState({ drift: 0, tilt: 0, features: 0 });

  const { wrapRef, canvasRef, stageRef, status } = useStage((canvas) => {
    const s = new FaceScene(canvas, { reducedMotion: reduced, onReadout: setRead });
    s.onUser = () => setAuto(false);
    return s;
  });

  useEffect(() => {
    stageRef.current?.setStep(step);
  }, [step, status, stageRef]);

  useEffect(() => {
    if (step === "droop") stageRef.current?.setDroop(droop);
  }, [droop, step, status, stageRef]);

  // walk through the pipeline while visible, until the visitor takes over
  useEffect(() => {
    if (!auto || !inView) return;
    const id = setInterval(() => {
      setStep((s) => STEPS[(STEPS.indexOf(s) + 1) % STEPS.length]);
    }, 4200);
    return () => clearInterval(id);
  }, [auto, inView]);

  // in auto mode, the droop step animates the slider itself
  useEffect(() => {
    if (!auto || step !== "droop") return;
    let raf, t0 = performance.now();
    const tick = (now) => {
      setDroop(Math.sin(Math.min(1, (now - t0) / 3800) * Math.PI));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto, step]);

  const pick = (s) => {
    setAuto(false);
    setStep(s);
    if (s === "droop") setDroop(0.6);
  };

  return (
    <FigFrame
      title="face mesh → 228 features"
      tabs={STEPS.map((s) => (
        <Tab key={s} on={step === s} onClick={() => pick(s)}>
          {LABEL[s]}
        </Tab>
      ))}
      caption={CAPTION[step]}
      note="Mesh: MediaPipe on my portrait, frontalised for display. Regions, normalisation and importances: the paper's code. The droop is simulated — no classifier runs here."
    >
      <div ref={ref} className="grid h-full sm:grid-cols-[1fr_11.5rem]">
        <div ref={wrapRef} className="relative h-[300px] bg-[var(--t-deep)] sm:h-full sm:min-h-[300px]">
          <canvas
            ref={canvasRef}
            tabIndex={0}
            aria-label="3D face mesh. Drag or use the arrow keys to rotate."
            className="absolute inset-0 h-full w-full cursor-grab touch-pan-y outline-none active:cursor-grabbing"
          />
          {status !== "ready" && (
            <div className="absolute inset-0 flex items-center justify-center text-xs t-dim">
              {status === "failed" ? "webgl unavailable" : "loading mesh…"}
            </div>
          )}
        </div>
        <div className="border-t border-[var(--t-line)] p-3 text-[0.72rem] sm:border-l sm:border-t-0">
          {step === "xai" ? (
            <>
              <div className="mb-2 uppercase tracking-[0.14em] t-dim">region importance</div>
              {TOP.map(([k, v]) => (
                <div key={k} className="mb-1.5">
                  <div className="flex justify-between">
                    <span className="t-text">{pretty(k)}</span>
                    <span className="tabular-nums t-hi">{v.toFixed(2)}</span>
                  </div>
                  <div className="mt-0.5 h-1.5 bg-[var(--t-line)]">
                    <div className="h-full bg-[var(--t-amber)]" style={{ width: `${(v / MAX) * 100}%` }} />
                  </div>
                </div>
              ))}
              <div className="mt-2 t-faint">top 10 regions → 115 features in the final model</div>
            </>
          ) : step === "droop" ? (
            <>
              <label className="block uppercase tracking-[0.14em] t-dim" htmlFor="droop">
                droop
              </label>
              <input
                id="droop"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={droop}
                onChange={(e) => {
                  setAuto(false);
                  setDroop(Number(e.target.value));
                }}
                className="mt-1 w-full accent-[var(--t-amber)]"
              />
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="t-dim">mouth tilt Δ</span>
                  <span className="tabular-nums t-hi">{read.tilt.toFixed(1)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="t-dim">y/x drift</span>
                  <span className="tabular-nums t-hi">{read.drift.toFixed(3)}</span>
                </div>
                <div className="t-faint">mean |Δ y/x| over {read.features} top-10-region features</div>
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <Row k="landmarks" v="468" on={step === "landmarks"} />
              <Row k="features" v="228" on={step === "select"} />
              <Row k="regions" v="29" on={step === "select"} />
              <Row k="origin" v="nose tip · 1" on={step === "normalize"} />
              <Row k="unit" v="|33 – 263|" on={step === "normalize"} />
              <div className="pt-2 t-faint">MVC (RF + XGB + CatBoost): 94.75% accuracy · 96.5% stroke recall</div>
            </div>
          )}
        </div>
      </div>
    </FigFrame>
  );
}

function Row({ k, v, on }) {
  return (
    <div className="flex justify-between">
      <span className={on ? "t-amber" : "t-dim"}>{k}</span>
      <span className={`tabular-nums ${on ? "t-hi" : "t-text"}`}>{v}</span>
    </div>
  );
}
