import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "@/hooks/useTerm";

const GLYPHS = "!<>-_/[]{}=+*^?#01ABCDEFGHXZ%$";
const SWAP_MS = 60; // how often an unresolved character changes glyph

/**
 * Terminal "decode": characters cycle through random glyphs and lock in left
 * to right. Plays on mount ("load") or when scrolled into view ("view"), and
 * replays whenever the pointer moves onto it (`hover`) or `replay` changes
 * (for parents that own a larger hover area). Screen readers get the plain
 * text; reduced motion shows it immediately.
 */
export function Scramble({ text, play = "view", replay = 0, hover = true, duration = 1300, className }) {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView({ once: true });
  const [out, setOut] = useState(reduced ? text : text.replace(/\S/g, " "));
  const [hovers, setHovers] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (reduced) {
      setOut(text);
      return;
    }
    if (play === "view" && !inView) return;
    const start = performance.now();
    const n = text.length;
    const noise = [...text].map(() => GLYPHS[(Math.random() * GLYPHS.length) | 0]);
    let lastSwap = start;
    const tick = (now) => {
      const t = now - start;
      if (now - lastSwap >= SWAP_MS) {
        for (let i = 0; i < n; i++) noise[i] = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        lastSwap = now;
      }
      let s = "";
      for (let i = 0; i < n; i++) {
        const ch = text[i];
        const lockAt = (i / n) * duration * 0.75 + duration * 0.25;
        s += ch === " " || t >= lockAt ? ch : noise[i];
      }
      setOut(s);
      if (t < duration) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [text, play, inView, replay, hovers, duration, reduced]);

  return (
    <span ref={ref} className={className} onMouseEnter={hover ? () => setHovers((h) => h + 1) : undefined}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{out}</span>
    </span>
  );
}

/** Counts a number up when it scrolls into view, keeping decimals and any suffix ("8th"). */
export function CountUp({ value, duration = 1900, className }) {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView({ once: true });
  const m = String(value).match(/^(\d+(?:\.(\d+))?)(.*)$/);
  const target = m ? parseFloat(m[1]) : null;
  const decimals = m?.[2]?.length || 0;
  const suffix = m?.[3] || "";
  const [v, setV] = useState(reduced || target == null ? target : 0);

  useEffect(() => {
    if (target == null || reduced || !inView) return;
    let raf, start;
    const tick = (now) => {
      start ??= now;
      const k = Math.min(1, (now - start) / duration);
      setV(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, inView, reduced, duration]);

  if (target == null) return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="tabular-nums">
        {(v ?? target).toFixed(decimals)}
        {suffix}
      </span>
    </span>
  );
}
