import { lazy, Suspense } from "react";
import { experience } from "@/data/portfolio";
import { SectionHead, Window } from "@/components/term/Term";
import { useInView } from "@/hooks/useTerm";

const SIMS = {
  rover: { C: lazy(() => import("@/components/viz/RoverSim")), title: "rover.sim", h: "h-[340px] sm:h-[420px]" },
  graphs: { C: lazy(() => import("@/components/viz/AlgoPlayground")), title: "graph.alg", h: "h-[300px] sm:h-[320px]" },
};

/** An entry's interactive companion, mounted as it nears the viewport. */
function Sim({ kind }) {
  const [ref, near] = useInView({ once: true, rootMargin: "600px 0px" });
  const { C, title, h } = SIMS[kind];
  const wait = (
    <Window title={title} className="mt-5">
      <div className={`flex items-center justify-center text-xs t-dim ${h}`}>
        loading<span className="cursor" aria-hidden="true" />
      </div>
    </Window>
  );
  return <div ref={ref}>{near ? <Suspense fallback={wait}><C /></Suspense> : wait}</div>;
}

export function GitLog() {
  return (
    <section id="log" className="py-14 md:py-28">
      <div className="container">
        <SectionHead id="log" title="Experience" cmd="git log --graph --all --format=career" />

        <ol className="m-0 list-none p-0">
          {experience.map((e, i) => (
            <li key={e.hash} className="grid grid-cols-[1.6rem_1fr] gap-x-3 sm:grid-cols-[2rem_1fr]">
              {/* graph rail */}
              <div className="relative flex justify-center" aria-hidden="true">
                <span
                  className={`absolute w-px bg-[var(--t-line)] ${i === 0 ? "top-3" : "top-0"} ${
                    i === experience.length - 1 ? "h-3" : "bottom-0"
                  }`}
                />
                <span className={`relative mt-[0.35rem] text-sm leading-none ${e.head ? "t-hi glow-strong" : "t-amber"}`}>
                  {e.head ? "◆" : "●"}
                </span>
              </div>

              <article className={`min-w-0 ${i === experience.length - 1 ? "pb-2" : "pb-10"}`}>
                <div className="max-w-4xl">
                  <div className="flex flex-wrap items-baseline gap-x-2 text-[0.8rem]">
                    <span className="t-amber">commit {e.hash}</span>
                    <span className="t-dim">
                      (
                      {e.head && <span className="t-alert">HEAD → </span>}
                      <span className="t-hi">{e.branch}</span>)
                    </span>
                  </div>
                  <div className="text-[0.78rem] t-dim">
                    <span className="t-faint">Date: </span>
                    {e.when}
                    <span className="t-faint"> · </span>
                    {e.org}
                  </div>
                  <h3 className="mt-2 text-[1.05rem] leading-snug t-hi">{e.title}</h3>
                  {e.note && <p className="mt-1 text-[0.82rem] t-dim">{e.note}</p>}
                  {e.bullets.length > 0 && (
                    <ul className="mt-3 list-none space-y-1.5 p-0 text-[0.88rem] leading-relaxed">
                      {e.bullets.map(([k, v]) => (
                        <li key={k} className="grid grid-cols-[1rem_1fr]">
                          <span className="t-amber" aria-hidden="true">+</span>
                          <span className="t-text">
                            <span className="t-hi">{k}</span>
                            <span className="t-faint"> — </span>
                            {v}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {e.sim && <Sim kind={e.sim} />}
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
