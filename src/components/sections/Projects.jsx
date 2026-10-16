import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { projects } from "@/data/portfolio";
import { SectionHead, ExtLink } from "@/components/term/Term";

const GROUPS = [
  ["research", "research & ongoing"],
  ["engineering", "engineering"],
];

function Row({ p, pid }) {
  const [open, setOpen] = useState(false);
  const id = `proc-${p.slug}`;
  return (
    <>
      <tr className={`border-t border-[var(--t-line)] ${open ? "bg-[var(--t-ghost)]" : ""}`}>
        <td className="hidden py-2.5 pl-3 pr-2 align-top tabular-nums t-faint sm:table-cell">{pid}</td>
        <td className="py-2.5 pl-3 pr-2 align-top sm:pl-2">
          <span className={`chip ${p.state === "RUN" ? "is-on" : ""}`}>
            {p.state === "RUN" && <span className="h-1.5 w-1.5 animate-pulse bg-[var(--t-amber)]" aria-hidden="true" />}
            {p.state}
          </span>
        </td>
        <td className="w-full py-2.5 pr-3 align-top">
          <button
            type="button"
            className="group block w-full cursor-pointer text-left"
            aria-expanded={open}
            aria-controls={id}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="t-hi group-hover:underline group-hover:decoration-[var(--t-faint)] group-hover:underline-offset-4">
              {p.name}
            </span>
            <span className="t-faint"> {open ? "▾" : "▸"}</span>
            <span className="block text-[0.8rem] t-dim">{p.full}</span>
            {p.badge && <span className="chip is-solid mt-1.5 sm:hidden">{p.badge}</span>}
          </button>
        </td>
        <td className="hidden whitespace-nowrap py-2.5 pr-3 align-top text-[0.8rem] t-dim md:table-cell">{p.stack}</td>
        <td className="hidden whitespace-nowrap py-2.5 pr-3 text-right align-top sm:table-cell">
          {p.badge && <span className="chip is-solid">{p.badge}</span>}
        </td>
      </tr>
      {open && (
        <tr id={id}>
          <td colSpan={5} className="px-3 pb-5 pt-1">
            <div className={`grid gap-5 ${p.image ? "md:grid-cols-[minmax(0,18rem)_1fr]" : ""}`}>
              {p.image && (
                <div className="phosphor-frame aspect-video border border-[var(--t-line)]">
                  <img src={p.image} alt={`${p.name} — ${p.full}`} loading="lazy" className="phosphor-img h-full w-full object-cover" />
                </div>
              )}
              <div className="text-[0.88rem] leading-relaxed">
                <p className="m-0 t-text">{p.summary}</p>
                <p className="mt-2 text-[0.78rem] t-dim md:hidden">stack: {p.stack}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem]">
                  {p.links.map((l) => (
                    <ExtLink key={l.href} href={l.href}>
                      {l.label}
                    </ExtLink>
                  ))}
                  <Link to={`/work/${p.slug}`} className="link-term">
                    page →
                  </Link>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function Projects() {
  let pid = 1000;
  return (
    <section id="projects" className="py-14 md:py-28">
      <div className="container">
        <SectionHead id="projects" title="Projects" cmd="ps aux --sort=state | grep sammam">
          <p>
            Ongoing research and shipped engineering. <span className="chip is-on">RUN</span> = active,{" "}
            <span className="chip">DONE</span> = complete. Open a row for details.
          </p>
        </SectionHead>

        <div className="term-window overflow-x-auto">
          <table className="w-full border-collapse text-left text-[0.9rem]">
            <thead>
              <tr className="text-[0.65rem] uppercase tracking-[0.16em] t-dim">
                <th className="hidden py-2 pl-3 pr-2 font-normal sm:table-cell">pid</th>
                <th className="py-2 pl-3 pr-2 font-normal sm:pl-2">stat</th>
                <th className="py-2 pr-3 font-normal">command</th>
                <th className="hidden py-2 pr-3 font-normal md:table-cell">stack</th>
                <th className="hidden py-2 pr-3 text-right font-normal sm:table-cell">flag</th>
              </tr>
            </thead>
            <tbody>
              {GROUPS.map(([g, label]) => {
                const list = projects.filter((p) => p.group === g);
                return (
                  <Fragment key={g}>
                    <tr>
                      <td colSpan={5} className="border-t border-[var(--t-line)] bg-[var(--t-tint)] px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.18em] t-amber">
                        # {label} <span className="t-faint">— {list.length}</span>
                      </td>
                    </tr>
                    {list.map((p) => (
                      <Row key={p.slug} p={p} pid={(pid += 7)} />
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
