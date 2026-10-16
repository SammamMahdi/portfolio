import { lazy, Suspense } from "react";
import { education, skills, honors } from "@/data/portfolio";
import { SectionHead, Window, Readout } from "@/components/term/Term";
import { useInView, useReducedMotion } from "@/hooks/useTerm";

function CgpaBar() {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView();
  const pct = (education.cgpa / education.scale) * 100;
  return (
    <div ref={ref} className="mt-4">
      <div className="flex items-baseline justify-between text-xs t-dim">
        <span>CGPA</span>
        <span>
          <span className="font-display text-3xl t-hi glow">{education.cgpa.toFixed(2)}</span> / {education.scale.toFixed(2)}
        </span>
      </div>
      <div className="mt-1 h-3 border border-[var(--t-faint)] p-[2px]" role="img" aria-label={`CGPA ${education.cgpa} out of ${education.scale}`}>
        <div
          className="h-full bg-[repeating-linear-gradient(90deg,var(--t-amber)_0_6px,transparent_6px_8px)] shadow-[0_0_10px_var(--t-glow)]"
          style={{ width: inView || reduced ? `${pct}%` : "0%", transition: "width 1.2s cubic-bezier(0.2,0.7,0.2,1)" }}
        />
      </div>
    </div>
  );
}

function Grades({ title, list }) {
  return (
    <div>
      <h4 className="mb-2 mt-5 text-[0.68rem] uppercase tracking-[0.18em] t-amber">{title}</h4>
      <div className="space-y-0.5">
        {list.map(([k, v]) => (
          <Readout key={k} k={k} v={v} />
        ))}
      </div>
    </div>
  );
}

export function System() {
  return (
    <section id="system" className="py-14 md:py-28">
      <div className="container">
        <SectionHead id="system" title="Education" cmd="cat transcript.txt skills.conf honors.log" />

        <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          <Window title="transcript.txt" bodyClassName="p-5">
            <h3 className="text-[1.05rem] t-hi">{education.degree}</h3>
            <p className="text-sm t-dim">
              {education.school} · {education.when}
            </p>
            <CgpaBar />
            <p className="mt-3 text-sm t-amber">{education.honors}</p>
            <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Grades title="computer science" list={education.coursework} />
              <Grades title="mathematics" list={education.mathematics} />
            </div>
            <Grades title="also" list={education.extra} />
          </Window>

          <div className="grid content-start gap-6">
            <Window title="skills.conf" bodyClassName="p-5 text-[0.85rem] leading-relaxed">
              <p className="m-0 t-faint"># what I reach for</p>
              {skills.map(([k, v]) => (
                <p key={k} className="m-0 mt-2">
                  <span className="t-amber">{k}</span>
                  <span className="t-faint"> = </span>
                  <span className="t-text">{v}</span>
                </p>
              ))}
            </Window>

            <Window title="honors.log" bodyClassName="p-5 text-[0.85rem] leading-relaxed">
              <ul className="m-0 list-none space-y-2 p-0">
                {honors.map(([k, v]) => (
                  <li key={k} className="grid grid-cols-[1.4rem_1fr]">
                    <span className="t-amber" aria-hidden="true">✓</span>
                    <span>
                      <span className="t-hi">{k}</span>
                      <span className="block text-[0.78rem] t-dim">{v}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Window>
          </div>
        </div>

        <div className="mt-6">
          <LazyGraph />
        </div>
      </div>
    </section>
  );
}

const SkillGraph = lazy(() => import("@/components/viz/SkillGraph"));

function LazyGraph() {
  const [ref, near] = useInView({ once: true, rootMargin: "500px 0px" });
  const wait = (
    <Window title="skills.graph">
      <div className="h-[440px]" />
    </Window>
  );
  return <div ref={ref}>{near ? <Suspense fallback={wait}><SkillGraph /></Suspense> : wait}</div>;
}
