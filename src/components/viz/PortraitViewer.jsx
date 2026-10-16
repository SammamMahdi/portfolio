import { useEffect, useRef, useState } from "react";
import { PORTRAIT, RAMP } from "@/data/asciiPortrait";
import { useReducedMotion } from "@/hooks/useTerm";
import { useStage } from "@/three/useStage";
import { Window } from "@/components/term/Term";

const MODES = [
  { id: "photo", label: "photo" },
  { id: "flat", label: "scan" },
  { id: "depth", label: "3d" },
];

function bar(x, n = 10) {
  const k = Math.round(x * n);
  return "█".repeat(k) + "░".repeat(n - k);
}

export function PortraitViewer() {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState("photo");
  const [probe, setProbe] = useState(null);
  const prev = useRef(mode);
  const { wrapRef, canvasRef, stageRef, status } = useStage((canvas) =>
    import("@/three/PortraitCloud").then(
      ({ PortraitCloud }) =>
        new PortraitCloud(canvas, {
          data: PORTRAIT,
          ramp: RAMP,
          mode: "flat",
          reducedMotion: reduced,
          onProbe: setProbe,
          // dragging the photo or the flat scan lifts it into 3D
          onModeRequest: setMode,
        })
    )
  );

  useEffect(() => {
    const s = stageRef.current;
    if (!s) return;
    s.suspend(mode === "photo"); // nothing to draw behind the photo
    if (mode !== "photo") {
      if (prev.current === "photo") s.replay();
      s.setMode(mode);
    }
    prev.current = mode;
  }, [mode, status, stageRef]);

  const live = status === "ready";
  const photo = mode === "photo";

  return (
    <Window
      title="portrait.scan"
      className="w-full"
      right={
        <div role="tablist" aria-label="Portrait view" className="flex gap-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => setMode(m.id)}
              className="btn-term is-sm"
              disabled={!live && m.id === "depth"}
            >
              {m.label}
            </button>
          ))}
        </div>
      }
    >
      <div ref={wrapRef} className="relative aspect-square w-full overflow-hidden bg-[var(--t-deep)] [container-type:inline-size]">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label="Three-dimensional ASCII portrait of Sammam Mahdi. Drag or use the arrow keys to rotate."
          className="absolute inset-0 h-full w-full cursor-grab touch-pan-y outline-none transition-opacity duration-500 focus-visible:ring-1 focus-visible:ring-[var(--t-amber)] focus-visible:ring-inset active:cursor-grabbing"
          style={{ opacity: live && !photo ? 1 : 0 }}
        />
        {!live && !photo && (
          <pre
            aria-hidden="true"
            className="absolute inset-0 m-0 select-none overflow-hidden t-amber glow"
            style={{ fontSize: "calc(100cqw / 80 / 0.6)", lineHeight: 1.2 }}
          >
            {PORTRAIT.glyphs}
          </pre>
        )}
        <img
          src="/sammam.webp"
          alt="Portrait photograph of Sammam Mahdi"
          width="1122"
          height="1402"
          className="phosphor-img pointer-events-none absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500"
          style={{ opacity: photo ? 1 : 0 }}
        />
        <div className="pointer-events-none absolute left-3 top-2 text-[0.65rem] uppercase tracking-[0.18em] t-faint">
          {photo ? "rgb · 1 frame" : `${PORTRAIT.cols}×${PORTRAIT.rows} glyphs · ${mode === "flat" ? "scan" : "3d"}`}
        </div>
      </div>
      <div className="flex min-h-[2.6rem] flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-[var(--t-line)] px-3 py-2 text-[0.72rem]">
        <span className="tabular-nums t-dim" aria-live="off">
          {probe && !photo ? (
            <>
              probe <span className="t-text">r{String(probe.row).padStart(2, "0")} c{String(probe.col).padStart(2, "0")}</span>{" "}
              glyph <span className="t-hi">{RAMP[probe.glyph]}</span> · inv-depth{" "}
              <span className="t-amber">{bar(probe.depth)}</span> <span className="t-text">{probe.depth.toFixed(2)}</span>
            </>
          ) : photo ? (
            live ? "drag the photo to lift it into 3d" : "the photo the scan and depth are made from"
          ) : live ? (
            mode === "flat" ? "drag to lift into 3d · hover to probe depth" : "drag to orbit · hover to probe depth"
          ) : status === "failed" ? (
            "webgl unavailable · static render"
          ) : (
            "loading depth field…"
          )}
        </span>
        <span className="t-faint">depth: Depth Anything V2 · monocular · relative</span>
      </div>
    </Window>
  );
}

export default PortraitViewer;
