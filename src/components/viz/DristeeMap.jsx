import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "@/hooks/useTerm";
import { makeRoom, astar, waypoints, guidance, W, H, WALL, OBJ } from "./dristee";

const SWEEP = 1.5, PATH = 1.0, CPS = 70; // seconds, seconds, typed characters per second

/** ASCII occupancy map: sweep-to-map, A* path, spoken guidance. Click a free cell to set the goal. */
export function DristeeMap({ seed }) {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView({ once: true });
  const room = useMemo(() => makeRoom(seed), [seed]);
  const [goal, setGoal] = useState(room.goal);
  const [t, setT] = useState(0);
  const clock = useRef({ start: 0, from: 0 });

  useEffect(() => {
    setGoal(room.goal);
    clock.current = { start: 0, from: 0 };
    setT(0);
  }, [room]);

  const path = useMemo(() => astar(room.grid, room.user, goal), [room, goal]);
  const text = useMemo(() => guidance(room, waypoints(room.grid, path)), [room, path]);
  const end = SWEEP + PATH + text.length / CPS;
  const now = reduced ? end : t;
  const running = inView && !reduced && t < end;

  useEffect(() => {
    if (!running) return;
    let raf;
    const c = clock.current;
    if (!c.start) c.start = performance.now();
    const tick = (ms) => {
      setT(c.from + (ms - c.start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const pick = (e) => {
    const c = e.target.closest?.("[data-c]");
    if (!c) return;
    const i = Number(c.dataset.c), x = i % W, y = (i / W) | 0;
    if (room.grid[i] !== 0 || (x === room.user[0] && y === room.user[1])) return;
    setGoal([x, y]);
    clock.current = { start: performance.now(), from: SWEEP }; // map already built: replay the path only
    setT(SWEEP);
  };

  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.02;
    window.speechSynthesis.speak(u);
  };

  const sweep = Math.min(1, now / SWEEP);
  const shown = path ? Math.floor(Math.max(0, Math.min(1, (now - SWEEP) / PATH)) * path.length) : 0;
  const onPath = new Set((path || []).slice(0, shown).map(([x, y]) => y * W + x));
  const typed = text.slice(0, Math.max(0, Math.floor((now - SWEEP - PATH) * CPS)));
  const [ux, uy] = room.user;
  const sweepAng = -Math.PI + sweep * 2 * Math.PI;

  const labels = new Map();
  room.objects.forEach((o) => {
    const cy = o.y + Math.floor((o.h - 1) / 2);
    const name = o.name.slice(0, o.w * 2);
    const x0 = o.x * 2 + Math.floor((o.w * 2 - name.length) / 2);
    [...name].forEach((ch, k) => labels.set(cy * W * 2 + x0 + k, ch));
  });

  const rows = [];
  for (let y = 0; y < H; y++) {
    const cells = [];
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const seen = sweep >= 1 || Math.atan2(y - uy, x - ux) <= sweepAng;
      const v = room.grid[i];
      let ch = "  ", cls;
      if (x === ux && y === uy) { ch = "@ "; cls = "t-hi glow-strong"; }
      else if (x === goal[0] && y === goal[1]) { ch = "X "; cls = "t-alert glow"; }
      else if (!seen) ch = "  ";
      else if (v === WALL) {
        // a filled cell, not a glyph: block characters fall back to a font with a different advance
        cells.push(<span key={x} data-c={i} className="inline-block h-[1.2em] w-[1.2em] align-top bg-[var(--t-line)]" />);
        continue;
      }
      else if (v === OBJ) {
        const a = labels.get(y * W * 2 + x * 2), b = labels.get(y * W * 2 + x * 2 + 1);
        ch = a || b ? (a || " ") + (b || " ") : "##";
        cls = a || b ? "t-hi" : "t-amber";
      } else if (onPath.has(i)) { ch = "• "; cls = "t-hi glow"; }
      else { ch = ". "; cls = "t-faint"; }
      cells.push(
        <span key={x} data-c={i} className={cls}>
          {ch}
        </span>
      );
    }
    rows.push(<div key={y}>{cells}</div>);
  }

  return (
    <div ref={ref} className="w-full">
      <div className="[container-type:inline-size]">
        <pre
          onClick={pick}
          className="m-0 cursor-crosshair select-none whitespace-pre"
          style={{ fontSize: `calc(100cqw / ${W * 2} / 0.6)`, lineHeight: 1.2 }}
          aria-label="Schematic traversability map. Click a free cell to set a new goal."
        >
          {rows}
        </pre>
      </div>
      <div className="mt-3 flex items-start gap-3 border-t border-[var(--t-line)] pt-3 text-sm">
        <button type="button" onClick={speak} className="btn-term is-sm shrink-0" title="Read the guidance aloud">
          ▶ speak
        </button>
        <p className="m-0 min-h-[2.8em] t-text" aria-hidden="true">
          <span className="t-dim">voice&gt; </span>
          {typed}
          {typed.length < text.length && now > SWEEP + PATH && <span className="cursor" />}
        </p>
        <p className="sr-only" aria-live="polite">
          {now >= end ? text : ""}
        </p>
      </div>
    </div>
  );
}
