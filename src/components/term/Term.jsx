import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { sections } from "@/data/portfolio";
import { useInView, useReducedMotion } from "@/hooks/useTerm";

/** A framed terminal window with a title bar. */
export function Window({ title, right, children, className, bodyClassName, ...rest }) {
  return (
    <div className={cn("term-window", className)} {...rest}>
      <div className="term-bar">
        <span className="term-title">{title}</span>
        {right && <div className="ml-auto flex min-w-0 items-center gap-2">{right}</div>}
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

/** Types `text` once when scrolled into view. */
export function Typed({ text, speed = 28, className, cursor = false, onDone }) {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setN(text.length);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [inView, reduced, text, speed]);
  useEffect(() => {
    if (n >= text.length && inView) onDone?.();
  }, [n, text.length, inView, onDone]);
  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, n)}</span>
      {cursor && <span className="cursor" aria-hidden="true" />}
    </span>
  );
}

/** Section header: index, display title, and the "command" that produced it. */
export function SectionHead({ id, title, cmd, children }) {
  const s = sections.find((x) => x.id === id);
  const n = String(sections.indexOf(s) + 1).padStart(2, "0");
  return (
    <header className="mb-10 md:mb-12">
      <div className="mb-3 flex items-center gap-3 text-xs uppercase tracking-[0.22em] t-dim">
        <span className="t-amber">{n}</span>
        <span className="h-px flex-1 bg-[var(--t-line)]" />
        <span className="hidden sm:inline">
          press <span className="kbd">{s?.key}</span>
        </span>
      </div>
      <h2 className="font-display text-[3.4rem] uppercase t-hi glow-strong md:text-[4.6rem]">{title}</h2>
      <p className="mt-3 text-sm t-dim">
        <span className="t-amber">sammam@lab</span>
        <span className="t-faint">:</span>
        <span className="t-dim">~</span>
        <span className="t-faint">$ </span>
        <Typed text={cmd} className="t-text" />
      </p>
      {children && <div className="mt-5 max-w-3xl text-[0.95rem] leading-relaxed t-text">{children}</div>}
    </header>
  );
}

/** "key ........ value" readout row. */
export function Readout({ k, v, className }) {
  return (
    <div className={cn("dotted-row text-sm", className)}>
      <span className="t-dim">{k}</span>
      <span className="leader" />
      <span className="t-hi text-right">{v}</span>
    </div>
  );
}

export function ExtLink({ href, children, className, ...rest }) {
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      className={cn("link-term", className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
      {external && <span aria-hidden="true"> ↗</span>}
    </a>
  );
}
