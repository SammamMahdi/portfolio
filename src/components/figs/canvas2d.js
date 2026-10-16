import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useTerm";
import { pal } from "@/lib/themes";

/**
 * A 2D canvas that redraws every frame while visible. `draw(ctx, {w, h, t})`
 * is read from a ref, so it may close over fresh props without restarting.
 * Under reduced motion it draws a single representative frame.
 */
export function useCanvas2D(draw, { stillAt = 3 } = {}) {
  const ref = useRef(null);
  const drawRef = useRef(draw);
  const reduced = useReducedMotion();
  useEffect(() => {
    drawRef.current = draw;
  });

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let raf = 0, w = 0, h = 0, visible = false;
    const t0 = performance.now();
    const paint = (now) => w > 1 && drawRef.current(ctx, { w, h, t: reduced ? stillAt : (now - t0) / 1000 });
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      paint(now);
    };
    const sync = () => {
      const run = visible && !reduced && document.visibilityState === "visible";
      if (run && !raf) raf = requestAnimationFrame(frame);
      if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const ro = new ResizeObserver(() => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint(performance.now());
    });
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    ro.observe(canvas);
    io.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [reduced, stillAt]);

  return ref;
}

/** Palette for canvas drawing: live getters over the active theme. */
export const C = {
  get bg() { return pal.deep; },
  get amber() { return pal.amber; },
  get hi() { return pal.hi; },
  get text() { return pal.text; },
  get dim() { return pal.dim; },
  get faint() { return pal.faint; },
  get line() { return pal.line; },
  get alert() { return pal.alert; },
  font: '"IBM Plex Mono", ui-monospace, monospace',
};

export const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
