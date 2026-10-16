import { useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useTerm";
import { useStage } from "@/three/useStage";
import { RoverScene, TARGETS } from "@/three/RoverScene";
import { Window } from "@/components/term/Term";

const PAD = [
  ["w", "▲", "col-start-2"],
  ["a", "◀", "col-start-1 row-start-2"],
  ["s", "▼", "col-start-2 row-start-2"],
  ["d", "▶", "col-start-3 row-start-2"],
];

export default function RoverSim() {
  const reduced = useReducedMotion();
  const hud = useRef(null);
  const [st, setSt] = useState({ mode: "auto", target: TARGETS[0].name, found: [] });
  const { wrapRef, canvasRef, stageRef, status } = useStage(
    (canvas) => new RoverScene(canvas, { hud: hud.current, reducedMotion: reduced, onStatus: setSt })
  );

  const press = (k, on) => (e) => {
    e.preventDefault();
    stageRef.current?.press(k, on);
  };

  return (
    <Window title="rover.sim" className="mt-5" right={<span className="normal-case tracking-normal t-faint">obstacle-aware · drivable</span>}>
      <div>
        <div ref={wrapRef} className="relative h-[340px] sm:h-[420px]">
          <canvas
            ref={canvasRef}
            tabIndex={0}
            aria-label="Rover simulation. Focus and use W A S D or the arrow keys to drive; drag to swing the camera."
            className="absolute inset-0 h-full w-full cursor-grab outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--t-amber)] active:cursor-grabbing"
          />
          <canvas ref={hud} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
          {status !== "ready" && (
            <div className="absolute inset-0 flex items-center justify-center text-xs t-dim">
              {status === "failed" ? "webgl unavailable" : "booting rover…"}
            </div>
          )}
          {/* touch / mouse controls */}
          <div className="absolute bottom-3 left-3 grid grid-cols-3 gap-1">
            {PAD.map(([k, glyph, pos]) => (
              <button
                key={k}
                type="button"
                aria-label={`drive ${k}`}
                className={`btn-term is-sm h-8 w-8 justify-center bg-[var(--t-veil)] ${pos}`}
                onPointerDown={press(k, true)}
                onPointerUp={press(k, false)}
                onPointerLeave={press(k, false)}
                onContextMenu={(e) => e.preventDefault()}
              >
                {glyph}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--t-line)] px-3 py-2 text-[0.75rem]">
          <button
            type="button"
            className="btn-term is-sm"
            aria-pressed={st.mode === "auto"}
            onClick={() => stageRef.current?.setMode("auto")}
          >
            autonomous
          </button>
          <span className="t-dim">
            mission:{" "}
            {TARGETS.filter((t) => t.name !== "home").map((t) => (
              <span key={t.name} className={`mr-2 ${st.found.includes(t.name) ? "t-hi" : "t-faint"}`}>
                {st.found.includes(t.name) ? "✓" : "·"} {t.name}
              </span>
            ))}
          </span>
          <span className="ml-auto t-faint">click the view, then W A S D to take over</span>
        </div>
      </div>

      <p className="m-0 border-t border-[var(--t-line)] px-3 py-2 text-[0.72rem] leading-relaxed t-faint">
        A simulation written for this page, in the spirit of URC autonomous navigation — GNSS waypoints, a rocker-bogie
        rover, and YOLO-style boxes projected from each object’s 3D bounds (confidences are illustrative). The team’s
        real YOLOv8 models detected bottles, mallets and keyboard keys on a Jetson.
      </p>
    </Window>
  );
}
