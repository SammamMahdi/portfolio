import { useEffect, useRef, useState } from "react";

const RM = "(prefers-reduced-motion: reduce)";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== "undefined" && window.matchMedia(RM).matches);
  useEffect(() => {
    const m = window.matchMedia(RM);
    const on = () => setReduced(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** True once the element has entered the viewport (or stays live with once=false). */
export function useInView({ once = true, rootMargin = "0px 0px -10% 0px" } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting && once) io.disconnect();
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, rootMargin]);
  return [ref, inView];
}

/** The id of the section currently under the reading line (35% down the viewport). */
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join(",");
  useEffect(() => {
    const els = key.split(",").map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);
  return active;
}

export const isTyping = (el) =>
  !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);

export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia(RM).matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}
