import { useEffect, useRef, useState } from "react";

function webglAvailable() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

/**
 * Mounts a three.js Stage on a canvas. `load` returns (a promise of) the
 * stage, so three.js itself can be code-split. The stage is resized with its
 * wrapper and only animates while on screen and the tab is visible.
 */
export function useStage(load) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const loadRef = useRef(load);
  const [status, setStatus] = useState("loading"); // loading | ready | failed

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return; // the host didn't render its canvas
    if (!webglAvailable()) {
      setStatus("failed");
      return;
    }
    let cancelled = false, cleanup = () => {};

    Promise.resolve()
      .then(() => loadRef.current(canvas))
      .then((stage) => {
        if (cancelled) return stage.dispose();
        stageRef.current = stage;
        let visible = false;
        const sync = () => stage.setActive(visible && document.visibilityState === "visible");
        const ro = new ResizeObserver(([e]) => stage.resize(e.contentRect.width, e.contentRect.height));
        const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { rootMargin: "80px" });
        ro.observe(wrap);
        io.observe(wrap);
        document.addEventListener("visibilitychange", sync);
        setStatus("ready");
        cleanup = () => {
          ro.disconnect();
          io.disconnect();
          document.removeEventListener("visibilitychange", sync);
          stage.dispose();
          stageRef.current = null;
        };
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return { wrapRef, canvasRef, stageRef, status };
}
