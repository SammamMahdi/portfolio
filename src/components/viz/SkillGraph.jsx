import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReducedMotion, scrollToSection } from "@/hooks/useTerm";
import { useStage } from "@/three/useStage";
import { buildGraph, AREAS } from "@/data/skillGraph";
import { Window } from "@/components/term/Term";

const KIND = { area: "skill area", paper: "paper", project: "project", role: "role" };
const GLYPH = { area: "◆", paper: "◇", project: "□", role: "△" };

export default function SkillGraph() {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const graph = useMemo(buildGraph, []);
  const [hover, setHover] = useState(null);
  const [pinned, setPinned] = useState(null);

  const open = (n) => {
    if (n.kind === "role") scrollToSection("log");
    else navigate(`/work/${n.id}`);
  };

  const { wrapRef, canvasRef, stageRef, status } = useStage((canvas) =>
    Promise.all([import("@/three/SkillGraphScene"), document.fonts?.ready ?? Promise.resolve()]).then(
      ([{ SkillGraphScene }]) =>
        new SkillGraphScene(canvas, {
          graph,
          reducedMotion: reduced,
          onHover: setHover,
          onPick: open,
          onPinArea: (id) => setPinned((p) => (p === id ? null : id)),
        })
    )
  );

  useEffect(() => {
    stageRef.current?.pin(pinned);
  }, [pinned, status, stageRef]);

  const focus = hover || graph.nodes.find((n) => n.id === pinned) || null;
  const links = focus
    ? graph.edges
        .filter(([a, b]) => a === focus.id || b === focus.id)
        .map(([a, b]) => graph.nodes.find((n) => n.id === (a === focus.id ? b : a)))
    : [];

  return (
    <Window
      title="skills.graph"
      right={<span className="hidden normal-case tracking-normal t-faint sm:inline">drag · hover · click</span>}
    >
      <div className="grid lg:grid-cols-[1fr_17rem]">
        <div ref={wrapRef} className="relative h-[380px] bg-[var(--t-deep)] sm:h-[440px]">
          <canvas
            ref={canvasRef}
            tabIndex={0}
            aria-label="3D graph linking skill areas to the papers and projects that used them. Drag to rotate."
            className="absolute inset-0 h-full w-full cursor-grab touch-pan-y outline-none active:cursor-grabbing"
          />
          {status !== "ready" && (
            <div className="absolute inset-0 flex items-center justify-center text-xs t-dim">
              {status === "failed" ? "webgl unavailable" : "laying out graph…"}
            </div>
          )}
          <div className="pointer-events-none absolute bottom-2 left-3 flex flex-wrap gap-x-3 text-[0.65rem] t-dim">
            {Object.entries(GLYPH).map(([k, g]) => (
              <span key={k}>
                <span className="t-amber">{g}</span> {KIND[k]}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--t-line)] p-4 text-[0.8rem] lg:border-l lg:border-t-0">
          {focus ? (
            <>
              <div className="text-[0.65rem] uppercase tracking-[0.16em] t-dim">
                {GLYPH[focus.kind]} {KIND[focus.kind]}
                {focus.tag && ` · ${focus.tag}`}
              </div>
              <div className="mt-1 text-[1rem] t-hi">{focus.label}</div>
              <div className="mt-3 text-[0.68rem] uppercase tracking-[0.14em] t-dim">
                {focus.kind === "area" ? `used in ${links.length}` : "draws on"}
              </div>
              <ul className="m-0 mt-1 list-none space-y-0.5 p-0">
                {links.map((n) => (
                  <li key={n.id}>
                    {n.kind === "area" ? (
                      <button type="button" className="t-text hover:text-[var(--t-hi)]" onClick={() => setPinned(n.id)}>
                        <span className="t-amber">{GLYPH.area}</span> {n.label}
                      </button>
                    ) : (
                      <button type="button" className="link-term" onClick={() => open(n)}>
                        {GLYPH[n.kind]} {n.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {focus.kind !== "area" && (
                <button type="button" className="btn-term is-sm mt-3" onClick={() => open(focus)}>
                  open {focus.kind} →
                </button>
              )}
            </>
          ) : (
            <>
              <p className="m-0 t-text">How the skills connect to the work.</p>
              <p className="mt-2 t-dim">Hover a node to light up its links; click a paper or project to open it; click a skill to pin it.</p>
              <div className="mt-3 text-[0.68rem] uppercase tracking-[0.14em] t-dim">skill areas</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {AREAS.map(([id, l]) => (
                  <button key={id} type="button" className={`chip cursor-pointer ${pinned === id ? "is-solid" : "hover:border-[var(--t-amber)] hover:text-[var(--t-amber)]"}`} onClick={() => setPinned(pinned === id ? null : id)}>
                    {l}
                  </button>
                ))}
              </div>
            </>
          )}
          {pinned && !hover && (
            <button type="button" className="mt-3 block text-[0.7rem] t-faint hover:text-[var(--t-hi)]" onClick={() => setPinned(null)}>
              × clear pin
            </button>
          )}
        </div>
      </div>
    </Window>
  );
}
