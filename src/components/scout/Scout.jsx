import { useCallback, useEffect, useRef, useState } from "react";
import { sections, profile } from "@/data/portfolio";
import { useActiveSection, useReducedMotion, scrollToSection } from "@/hooks/useTerm";
import { useStage } from "@/three/useStage";
import { useTerm } from "@/components/term/termStore";
import { openLab } from "@/components/figs/labLink";
import { answer, SUGGESTIONS, SECTION_TIPS } from "./brain";

const ids = sections.map((s) => s.id);

function readOff() {
  try {
    return localStorage.getItem("scout") === "off";
  } catch {
    return false;
  }
}

/** Types a line out, then calls onDone. */
function useTyping(text, speed = 18) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(reduced ? text.length : 0);
    if (reduced || !text) return;
    const id = setInterval(() => setN((x) => (x >= text.length ? (clearInterval(id), x) : x + 2)), speed);
    return () => clearInterval(id);
  }, [text, speed, reduced]);
  return text.slice(0, n);
}

function Bubble({ text, onClose }) {
  const shown = useTyping(text);
  return (
    <div className="term-window mb-2 max-w-[17rem] px-3 py-2 text-[0.78rem] leading-relaxed shadow-[0_12px_30px_-12px_rgba(0,0,0,0.9)]">
      <button type="button" onClick={onClose} aria-label="Dismiss" className="float-right ml-2 t-faint hover:text-[var(--t-hi)]">
        ×
      </button>
      <span className="t-amber">scout› </span>
      <span className="t-text">{shown}</span>
    </div>
  );
}

function Reply({ msg }) {
  const shown = useTyping(msg.text, 12);
  return <span className="t-text">{shown}</span>;
}

/** The visible drone + chat; mounted only while SCOUT is shown, so its 3D stage is built fresh each time. */
function ScoutUnit({ onDismiss }) {
  const reduced = useReducedMotion();
  const { setShellOpen } = useTerm();
  const [open, setOpen] = useState(false);
  const [bubble, setBubble] = useState(null);
  const [log, setLog] = useState([{ who: "scout", text: "I’m SCOUT. I know everything on this page about Sammam — ask away." }]);
  const [q, setQ] = useState("");
  const said = useRef(new Set());
  const endRef = useRef(null);
  const active = useActiveSection(ids);
  const wrap = useRef(null);

  const { wrapRef, canvasRef, stageRef } = useStage((canvas) =>
    import("@/three/ScoutBot").then(({ ScoutBot }) => new ScoutBot(canvas, { reducedMotion: reduced }))
  );

  // the eye follows the pointer
  useEffect(() => {
    const move = (e) => {
      const r = wrap.current?.getBoundingClientRect();
      if (!r) return;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      stageRef.current?.setLook((e.clientX - cx) / (window.innerWidth * 0.5), -(e.clientY - cy) / (window.innerHeight * 0.5));
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [stageRef]);

  useEffect(() => {
    stageRef.current?.setMood(bubble || open ? "talk" : "idle");
  }, [bubble, open, stageRef]);

  // greet once per session, then a tip the first time each section comes into view
  useEffect(() => {
    let greeted = false;
    try {
      greeted = sessionStorage.getItem("scout-hi") === "1";
    } catch {
      /* ignore */
    }
    if (greeted) return;
    const t = setTimeout(() => {
      setBubble("Hi — I’m SCOUT, the survey drone. Click me to ask about Sammam.");
      try {
        sessionStorage.setItem("scout-hi", "1"); // only once it has actually been said
      } catch {
        /* ignore */
      }
    }, 3200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open || !SECTION_TIPS[active] || said.current.has(active)) return;
    said.current.add(active);
    const t = setTimeout(() => setBubble(SECTION_TIPS[active]), 700);
    return () => clearTimeout(t);
  }, [active, open]);

  useEffect(() => {
    if (!bubble) return;
    const t = setTimeout(() => setBubble(null), 7000);
    return () => clearTimeout(t);
  }, [bubble]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [log]);

  const act = useCallback(
    (a) => {
      if (!a) return;
      if (a.type === "scroll") scrollToSection(a.id);
      if (a.type === "lab") openLab(a.tab);
      if (a.type === "cv") {
        const el = document.createElement("a");
        el.href = profile.cv;
        el.download = "Sammam_Mahdi_CV.pdf";
        el.click();
      }
      if (a.type === "shell") {
        setOpen(false);
        setShellOpen(true);
      }
    },
    [setShellOpen]
  );

  const ask = (text) => {
    const a = answer(text);
    if (!a) return;
    setLog((l) => [...l, { who: "you", text }, { who: "scout", text: a.text, action: a.action }]);
    setQ("");
    stageRef.current?.setMood("think");
    setTimeout(() => stageRef.current?.setMood("talk"), 400);
  };

  const dismiss = () => {
    setOpen(false);
    onDismiss();
  };

  return (
    <div className="fixed bottom-3 right-3 z-[45] flex flex-col items-end md:bottom-6 md:right-6">
      {open ? (
        <div
          role="dialog"
          aria-label="Ask SCOUT"
          className="term-window mb-2 flex w-[min(22rem,calc(100vw-1.5rem))] flex-col shadow-[0_20px_50px_-15px_rgba(0,0,0,0.95)]"
        >
          <div className="term-bar">
            <span className="term-title">scout</span>
            <span className="hidden sm:inline">ask about Sammam</span>
            <button type="button" onClick={dismiss} className="ml-auto t-faint hover:text-[var(--t-hi)]" title="Hide SCOUT">
              hide
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn-term is-sm">
              close
            </button>
          </div>
          <div className="max-h-[min(45vh,20rem)] space-y-2 overflow-y-auto p-3 text-[0.8rem] leading-relaxed" aria-live="polite">
            {log.map((m, i) => (
              <div key={i}>
                {m.who === "you" ? (
                  <div className="t-dim">
                    <span className="t-faint">you› </span>
                    {m.text}
                  </div>
                ) : (
                  <div>
                    <span className="t-amber">scout› </span>
                    {i === log.length - 1 ? <Reply msg={m} /> : <span className="t-text">{m.text}</span>}
                    {m.action && (
                      <div className="mt-1.5">
                        <button type="button" className="btn-term is-sm" onClick={() => act(m.action)}>
                          ▸ {m.action.label}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="flex flex-wrap gap-1 border-t border-[var(--t-line)] px-3 py-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="chip cursor-pointer hover:border-[var(--t-amber)] hover:text-[var(--t-amber)]" onClick={() => ask(s)}>
                {s}
              </button>
            ))}
          </div>
          <form
            className="flex items-center gap-2 border-t border-[var(--t-line)] px-3 py-2"
            onSubmit={(e) => {
              e.preventDefault();
              ask(q);
            }}
          >
            <span className="t-amber" aria-hidden="true">›</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ask anything about his work"
              aria-label="Ask SCOUT"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[0.82rem] text-[var(--t-hi)] placeholder:text-[var(--t-faint)] outline-none"
              autoFocus
            />
          </form>
        </div>
      ) : (
        bubble && <Bubble text={bubble} onClose={() => setBubble(null)} />
      )}

      <button
        ref={wrap}
        type="button"
        onClick={() => {
          setBubble(null);
          setOpen((o) => !o);
        }}
        aria-label={open ? "Close SCOUT" : "Ask SCOUT, the site guide"}
        aria-expanded={open}
        className="relative h-[66px] w-[66px] cursor-pointer rounded-full outline-none focus-visible:ring-1 focus-visible:ring-[var(--t-amber)] md:h-[108px] md:w-[108px]"
      >
        {/* hover shadow on the ground */}
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 h-2 w-2/3 -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,var(--t-glow-soft),transparent)]"
        />
        <span ref={wrapRef} className="absolute inset-0 block">
          <canvas ref={canvasRef} className="h-full w-full" />
        </span>
      </button>
    </div>
  );
}

/** SCOUT, or the small pill that brings it back once hidden. */
export function Scout() {
  const [off, setOff] = useState(readOff);
  const set = (v) => {
    setOff(v);
    try {
      if (v) localStorage.setItem("scout", "off");
      else localStorage.removeItem("scout");
    } catch {
      /* ignore */
    }
  };
  if (off) {
    return (
      <button type="button" onClick={() => set(false)} className="btn-term is-sm fixed bottom-4 right-4 z-[45] md:bottom-6 md:right-6" title="Bring SCOUT back">
        ◉ scout
      </button>
    );
  }
  return <ScoutUnit onDismiss={() => set(true)} />;
}
