import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sections, profile } from "@/data/portfolio";
import { scrollToSection, useActiveSection } from "@/hooks/useTerm";
import { THEMES } from "@/lib/themes";
import { BrandMark } from "./BrandMark";
import { Scramble } from "./Scramble";
import { useTerm } from "./termStore";

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dhaka",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function DhakaClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="hidden whitespace-nowrap text-xs tabular-nums t-dim 2xl:inline" title="Local time in Dhaka (UTC+6)">
      DHAKA <span className="t-text">{fmt.format(now)}</span>
    </span>
  );
}

const ids = sections.map((s) => s.id);

/** Name + mark. The name decodes on load and again on hover; the cube flips its depth on hover. */
function Brand({ onClick }) {
  const [flipped, setFlipped] = useState(false);
  const [replay, setReplay] = useState(0);
  const enter = () => {
    setFlipped(true);
    setReplay((r) => r + 1);
  };
  const leave = () => setFlipped(false);
  return (
    <a
      href="/#whoami"
      onClick={onClick}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={leave}
      className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-semibold no-underline"
    >
      <BrandMark flipped={flipped} />
      <Scramble text={profile.name} play="load" replay={replay} hover={false} className="t-hi tracking-wide" />
    </a>
  );
}

function NavItem({ s, on, onClick }) {
  const [hover, setHover] = useState(0);
  return (
    <a
      href={`#${s.id}`}
      onClick={onClick}
      onMouseEnter={() => setHover((h) => h + 1)}
      aria-current={on ? "true" : undefined}
      className={`whitespace-nowrap px-2.5 py-1 text-[0.8rem] leading-none no-underline transition-colors ${
        on ? "bg-[var(--t-amber)] text-[var(--t-bg)]" : "t-dim hover:text-[var(--t-hi)]"
      }`}
    >
      <span className={on ? "opacity-60" : "t-faint"}>./</span>
      <Scramble text={s.label} play="load" replay={hover} hover={false} duration={700} />
    </a>
  );
}

export function TopBar() {
  const { crt, setCrt, toggleShell, theme, cycleTheme } = useTerm();
  const active = useActiveSection(ids);
  const [menu, setMenu] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const home = pathname === "/";

  const go = (id) => (e) => {
    e.preventDefault();
    setMenu(false);
    if (home) scrollToSection(id);
    else navigate(`/#${id}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--t-line)] bg-[var(--t-veil)] backdrop-blur-sm md:top-[10px]">
      <div className="container flex h-12 items-center gap-6">
        <Brand onClick={go("whoami")} />

        <nav aria-label="Sections" className="hidden items-center gap-0.5 xl:flex">
          {sections.map((s) => (
            <NavItem key={s.id} s={s} on={home && active === s.id} onClick={go(s.id)} />
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <DhakaClock />
          <button
            type="button"
            onClick={cycleTheme}
            className="btn-term is-sm"
            title={`Phosphor: ${THEMES[theme].label} (${THEMES[theme].tube}) — click for the next tube`}
            aria-label={`Colour theme: ${THEMES[theme].label}. Switch theme`}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--t-amber)] shadow-[0_0_6px_var(--t-glow)]" aria-hidden="true" />
            <span className="hidden sm:inline">{THEMES[theme].label}</span>
          </button>
          <button
            type="button"
            onClick={() => setCrt(!crt)}
            aria-pressed={crt}
            className="btn-term is-sm is-toggle"
            title="Toggle CRT effects"
          >
            <span className="lamp" aria-hidden="true" />
            CRT
          </button>
          <button type="button" onClick={toggleShell} className="btn-term is-sm" title="Open the shell (`)">
            <span aria-hidden="true">&gt;_</span>
            <span className="hidden sm:inline">shell</span>
          </button>
          <a href={profile.cv} download className="btn-term is-primary is-sm">
            CV<span aria-hidden="true">↓</span>
          </a>
          <button
            type="button"
            className="btn-term is-sm xl:hidden"
            aria-expanded={menu}
            aria-controls="mobile-nav"
            onClick={() => setMenu((m) => !m)}
          >
            {menu ? "close" : "menu"}
          </button>
        </div>
      </div>

      {menu && (
        <nav id="mobile-nav" aria-label="Sections" className="border-t border-[var(--t-line)] bg-[var(--t-panel)] xl:hidden">
          <ul className="container grid grid-cols-2 gap-x-6 py-3 sm:grid-cols-4">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={go(s.id)}
                  className={`block py-2 text-sm no-underline ${active === s.id ? "t-amber" : "t-text"}`}
                >
                  <span className="t-faint">./</span>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

const RAIL = 288; // px

/**
 * Right-edge scroll ruler. Each tick sits at its section's real scroll
 * position, and the marker tracks scrollY directly, so they always agree.
 * Click a tick (or anywhere on the rail) to jump there.
 */
export function DepthGauge() {
  const active = useActiveSection(ids);
  const [marks, setMarks] = useState([]);
  const marker = useRef(null);
  const pct = useRef(null);

  useEffect(() => {
    const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pad = () => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const measure = () => {
      const max = maxScroll(), p = pad();
      setMarks(
        sections.map((s) => {
          const el = document.getElementById(s.id);
          const top = el ? el.getBoundingClientRect().top + window.scrollY - p : 0;
          return { ...s, t: Math.min(1, Math.max(0, top / max)) };
        })
      );
    };
    let raf = 0;
    const track = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const p = Math.min(1, Math.max(0, window.scrollY / maxScroll()));
        if (marker.current) marker.current.style.transform = `translateY(${p * RAIL}px)`;
        if (pct.current) pct.current.textContent = `${Math.round(p * 100)}%`;
      });
    };
    measure();
    track();
    const ro = new ResizeObserver(() => {
      measure();
      track();
    });
    ro.observe(document.body);
    window.addEventListener("scroll", track, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", track);
    };
  }, []);

  const jump = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: p * (document.documentElement.scrollHeight - window.innerHeight), behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <nav aria-label="Scroll position" className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 select-none 2xl:block">
      <div className="mb-2 text-center text-[0.62rem] tracking-[0.2em] t-faint">
        <span ref={pct}>0%</span>
      </div>
      <div className="relative w-12" style={{ height: RAIL }}>
        <button type="button" aria-label="Jump to this point of the page" onClick={jump} className="absolute inset-y-0 left-1/2 w-4 -translate-x-1/2 cursor-pointer">
          <span className="absolute inset-y-0 left-1/2 w-px bg-[var(--t-line)]" />
        </button>
        {marks.map((s) => {
          const on = active === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollToSection(s.id)}
              aria-label={`Go to ${s.label}`}
              title={s.label}
              className="group absolute left-1/2 flex -translate-y-1/2 cursor-pointer items-center"
              style={{ top: `${s.t * 100}%` }}
            >
              <span className={`h-px ${on ? "w-3 bg-[var(--t-amber)]" : "w-2 bg-[var(--t-faint)] group-hover:bg-[var(--t-hi)]"}`} />
              <span className={`ml-1 text-[0.62rem] ${on ? "t-amber" : "t-faint group-hover:text-[var(--t-hi)]"}`}>{s.key}</span>
              <span className="pointer-events-none absolute right-full mr-6 hidden whitespace-nowrap text-[0.62rem] t-hi group-hover:block">
                {s.label}
              </span>
            </button>
          );
        })}
        <div ref={marker} className="pointer-events-none absolute right-1/2 top-0 flex -translate-y-1/2 items-center will-change-transform">
          <span className="h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-[var(--t-amber)]" />
        </div>
      </div>
    </nav>
  );
}
