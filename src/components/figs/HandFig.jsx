import { useEffect, useRef, useState } from "react";
import { useStage } from "@/three/useStage";
import { HandScene } from "@/three/HandScene";
import { useReducedMotion } from "@/hooks/useTerm";
import { FigFrame } from "./FigFrame";

const FINGERS = [
  ["index", "I", "move"],
  ["middle", "M", "drag"],
  ["ring", "R", "right"],
  ["pinky", "P", "click"],
];

// Illustrative only: the paper's predictor is a pair of two-layer LSTMs (English, Bangla).
const WORDS = [
  { lang: "EN", text: "see you", next: ["tomorrow", "soon", "later"] },
  { lang: "BN", text: "আমি তোমাকে", next: ["চিনি", "বলেছি", "দেখেছি"] },
  { lang: "EN", text: "thank you for", next: ["the", "your", "coming"] },
  { lang: "BN", text: "আজকের আবহাওয়া", next: ["ভালো", "কেমন", "গরম"] },
];

function NextWord() {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const [n, setN] = useState(reduced ? 99 : 0);
  const w = WORDS[i];
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setN((x) => x + 1), 110);
    return () => clearInterval(id);
  }, [reduced]);
  useEffect(() => {
    const total = w.text.length + 22;
    if (n > total && !reduced) {
      setN(0);
      setI((x) => (x + 1) % WORDS.length);
    }
  }, [n, w.text.length, reduced]);
  const typed = [...w.text].slice(0, n).join("");
  const showing = n >= w.text.length + 3;
  const picked = n >= w.text.length + 12;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-[var(--t-line)] px-3 py-2 text-[0.75rem]">
      <span className="chip">{w.lang}</span>
      <span className="min-w-[9rem] t-hi">
        {typed}
        {picked && <span className="t-amber"> {w.next[0]}</span>}
        <span className="cursor" aria-hidden="true" />
      </span>
      <span className="ml-auto flex gap-1">
        {w.next.map((s, k) => (
          <span key={s} className={`chip ${showing ? (picked && k === 0 ? "is-solid" : "is-on") : "opacity-30"}`}>
            {s}
          </span>
        ))}
      </span>
    </div>
  );
}

export default function HandFig() {
  const reduced = useReducedMotion();
  const [state, setState] = useState({ gesture: { label: "move", rule: "index fingertip drives the cursor" }, fingers: {} });
  const [menu, setMenu] = useState(null);
  const [ripple, setRipple] = useState(null);
  const [exit, setExit] = useState(false);
  const cursor = useRef(null);
  const win = useRef(null);
  const pos = useRef({ x: 0.5, y: 0.5 });
  const drag = useRef(null);

  const { wrapRef, canvasRef, status } = useStage(
    (canvas) =>
      new HandScene(canvas, {
        reducedMotion: reduced,
        onCursor: (x, y) => {
          pos.current = { x, y };
          if (cursor.current) cursor.current.style.transform = `translate(${x * 100}cqw, ${y * 100}cqh)`;
          if (drag.current && win.current) {
            win.current.style.left = `${(x - drag.current.dx) * 100}%`;
            win.current.style.top = `${(y - drag.current.dy) * 100}%`;
          }
        },
        onState: (s) => {
          setState(s);
          const { x, y } = pos.current;
          if (s.events.includes("exit")) {
            setExit(true);
            drag.current = null;
            setTimeout(() => setExit(false), 1300);
            return;
          }
          if (s.events.includes("click")) {
            setRipple({ x, y, k: Math.random() });
            setMenu(null);
          }
          if (s.events.includes("right")) setMenu({ x, y });
          if (s.events.includes("grab") && win.current) {
            const box = win.current.parentElement.getBoundingClientRect();
            const r = win.current.getBoundingClientRect();
            drag.current = { dx: x - (r.left - box.left) / box.width, dy: y - (r.top - box.top) / box.height };
          }
          if (s.events.includes("release")) drag.current = null;
        },
      })
  );

  useEffect(() => {
    if (!menu) return;
    const id = setTimeout(() => setMenu(null), 1400);
    return () => clearTimeout(id);
  }, [menu]);

  const g = state.gesture;
  return (
    <FigFrame
      title="hand → mouse controller"
      caption={
        <>
          <span className="t-amber">{g.label}</span> — {g.rule}
        </>
      }
      note="Gestures and rules from the project's open-source mouse controller (Hand_Gesture_BSC12). The paper's full framework has 9 static gestures (≥97.4% accuracy, <0.03 ms each); next-word chips are illustrative — the paper uses two-layer LSTMs (CER 3.43% EN, 8.34% BN)."
    >
      <div className="flex h-full flex-col">
        <div className="grid min-h-0 flex-1 sm:grid-cols-[1fr_12rem]">
          <div ref={wrapRef} className="relative h-[280px] bg-[var(--t-deep)] sm:h-full sm:min-h-[280px]">
            <canvas
              ref={canvasRef}
              tabIndex={0}
              aria-label="3D hand skeleton performing mouse gestures. Drag to rotate."
              className="absolute inset-0 h-full w-full cursor-grab touch-pan-y outline-none active:cursor-grabbing"
            />
            {status !== "ready" && (
              <div className="absolute inset-0 flex items-center justify-center text-xs t-dim">
                {status === "failed" ? "webgl unavailable" : "loading hand…"}
              </div>
            )}
            <div className="pointer-events-none absolute left-2 top-1.5 text-[0.6rem] uppercase tracking-[0.16em] t-faint">
              21 landmarks · ticks mark each PIP joint
            </div>
          </div>

          <div className="flex flex-col border-t border-[var(--t-line)] sm:border-l sm:border-t-0">
            {/* the screen the cursor lives on */}
            <div className="relative m-2 aspect-[4/3] overflow-hidden border border-[var(--t-line)] bg-[var(--t-deep)] [container-type:size]">
              <div className="absolute left-2 top-2 text-[0.55rem] uppercase tracking-[0.14em] t-faint">screen</div>
              <div
                ref={win}
                className="absolute w-[38%] border border-[var(--t-dim)] bg-[var(--t-panel)] text-[0.5rem]"
                style={{ left: "52%", top: "48%" }}
              >
                <div className="bg-[var(--t-faint)] px-1 t-hi">notes.txt</div>
                <div className="h-5 px-1 t-dim">…</div>
              </div>
              {ripple && (
                <span
                  key={ripple.k}
                  className="absolute h-6 w-6 rounded-full border border-[var(--t-hi)]"
                  style={{
                    left: `${ripple.x * 100}%`,
                    top: `${ripple.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                    animation: reduced ? "none" : "fig-ripple 0.6s ease-out forwards",
                  }}
                />
              )}
              {menu && (
                <div
                  className="absolute border border-[var(--t-dim)] bg-[var(--t-panel)] text-[0.5rem] leading-tight"
                  style={{ left: `${Math.min(70, menu.x * 100)}%`, top: `${Math.min(60, menu.y * 100)}%` }}
                >
                  {["open", "copy", "rename"].map((x) => (
                    <div key={x} className="px-1.5 py-[1px] t-text">
                      {x}
                    </div>
                  ))}
                </div>
              )}
              <div ref={cursor} className="pointer-events-none absolute left-0 top-0" style={{ transform: "translate(50cqw, 50cqh)" }}>
                <svg width="10" height="14" viewBox="0 0 10 14" className="-translate-x-[1px] -translate-y-[1px]">
                  <path d="M0 0 L0 12 L3 9 L5.5 13.5 L7 12.8 L4.6 8.4 L9 8.4 Z" className="fill-[var(--t-hi)] stroke-[var(--t-bg)]" strokeWidth="0.8" />
                </svg>
              </div>
              {exit && (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--t-veil)] text-[0.6rem] t-alert">
                  controller exited
                </div>
              )}
            </div>
            <div className="px-3 pb-2 text-[0.7rem]">
              {FINGERS.map(([k, short, act]) => {
                const down = state.fingers[k];
                const active = k === "index" ? true : down;
                return (
                  <div key={k} className="flex items-center justify-between py-[1px]">
                    <span className={active ? "t-hi" : "t-dim"}>
                      {short} <span className="t-faint">{k}</span>
                    </span>
                    <span className={`tabular-nums ${k !== "index" && down ? "t-alert" : "t-dim"}`}>
                      {k === "index" ? act : down ? `down → ${act}` : "up"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <NextWord />
      </div>
    </FigFrame>
  );
}
