import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useTerm";

/** Screen-space CRT effects. All layers ignore the pointer; html[data-crt=off] hides them. */
export function Crt() {
  return (
    <div aria-hidden="true">
      <div className="crt-scanlines" />
      <div className="crt-vignette" />
      <div className="crt-roll" />
      <div className="crt-bezel" />
    </div>
  );
}

const LINES = [
  ["calibrating intrinsics", "fx fy cx cy ok"],
  ["loading depth field 80×40", "ok"],
  ["registering Sim(3) gauges", "ok"],
  ["warming P3 phosphor", "ok"],
  ["mounting /home/sammam", "ok"],
];

function seen() {
  try {
    return sessionStorage.getItem("booted") === "1";
  } catch {
    return false;
  }
}

/** A short power-on sequence, once per session. Any key or click skips it. */
export function BootSequence() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(() => !reduced && !seen());
  const [n, setN] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!show) return;
    try {
      sessionStorage.setItem("booted", "1");
    } catch {
      /* ignore */
    }
    const timers = LINES.map((_, i) => setTimeout(() => setN(i + 1), 380 + i * 190));
    const out = setTimeout(() => setLeaving(true), 380 + LINES.length * 190 + 520);
    const skip = () => setLeaving(true);
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(out);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [show]);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setShow(false), 380);
    return () => clearTimeout(t);
  }, [leaving]);

  if (!show) return null;
  return (
    <div
      className="fixed inset-0 z-[59] flex items-center justify-center bg-[var(--t-bg)] transition-opacity duration-300"
      style={{ opacity: leaving ? 0 : 1 }}
      role="status"
      aria-label="Loading"
    >
      <div className="w-[min(34rem,88vw)] text-sm" style={{ animation: "power-on 0.55s cubic-bezier(0.2,0.7,0.2,1) both" }}>
        <div className="mb-5 flex items-end justify-between border-b border-[var(--t-line)] pb-3">
          <span className="font-display text-4xl t-hi glow-strong">SM-3D</span>
          <span className="text-xs uppercase tracking-[0.2em] t-dim">phosphor terminal · rev 26.10</span>
        </div>
        {LINES.slice(0, n).map(([k, v]) => (
          <div key={k} className="dotted-row">
            <span className="t-text">{k}</span>
            <span className="leader" />
            <span className="t-amber">{v}</span>
          </div>
        ))}
        <div className="mt-5 text-xs t-dim">
          {n >= LINES.length ? "ready" : "booting"}
          <span className="cursor" />
          <span className="float-right t-faint">any key to skip</span>
        </div>
      </div>
    </div>
  );
}
