import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { publications, ME_NAME } from "@/data/portfolio";
import { SectionHead, ExtLink } from "@/components/term/Term";
import { useInView } from "@/hooks/useTerm";

const teaser = (name) => lazy(() => import("@/components/figs/TeaserFigs").then((m) => ({ default: m[name] })));

/** Every paper gets a live figure. */
const FIGS = {
  revar3r: { C: teaser("RevarFig") },
  camdet: { C: teaser("CamdetFig") },
  "stroke-detection": { C: lazy(() => import("@/components/figs/FaceFig")) },
  "gesture-keyboard": { C: lazy(() => import("@/components/figs/HandFig")) },
  "sleep-4stage": { C: lazy(() => import("@/components/figs/SleepFig")), props: { variant: "xai" } },
  "sleep-stage-ml": { C: lazy(() => import("@/components/figs/SleepFig")), props: { variant: "models" } },
};

export function Authors({ list }) {
  return list.map((a, i) => (
    <span key={a}>
      {a === ME_NAME ? <span className="font-semibold t-hi underline decoration-[var(--t-faint)] underline-offset-4">{a}</span> : a}
      {i < list.length - 1 && ", "}
    </span>
  ));
}

function FigLoading() {
  return (
    <div className="flex h-full min-h-[300px] items-center justify-center text-xs t-dim">
      loading figure<span className="cursor" aria-hidden="true" />
    </div>
  );
}

function LiveFigure({ slug }) {
  const [ref, near] = useInView({ once: true, rootMargin: "600px 0px" });
  const fig = FIGS[slug];
  if (!fig) return null;
  const { C, props } = fig;
  return (
    <div ref={ref} className="h-full">
      {near ? (
        <Suspense fallback={<FigLoading />}>
          <C {...props} />
        </Suspense>
      ) : (
        <FigLoading />
      )}
    </div>
  );
}

function Paper({ p }) {
  const [open, setOpen] = useState(false);
  const first = p.authors[0] === ME_NAME;
  const id = `paper-${p.slug}`;
  const more = p.contribution || p.figure;
  return (
    <li className="term-window">
      <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
        <div className="flex min-w-0 flex-col p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="mr-1 font-display text-[2.3rem] leading-none t-amber glow" aria-hidden="true">
              {p.id}
            </span>
            <span className={`chip ${p.status === "under review" ? "is-on" : ""}`}>{p.status}</span>
            {first && <span className="chip is-solid">first author</span>}
            <span className="chip">{p.year}</span>
          </div>
          <h3 className="text-[1.02rem] leading-snug t-hi md:text-[1.08rem]">{p.title}</h3>
          <p className="mt-1.5 text-[0.8rem] t-dim">
            <Authors list={p.authors} />
          </p>
          <p className="mt-1 text-[0.8rem] t-text">{p.venue}</p>
          <p className="mt-3 text-[0.86rem] leading-relaxed t-text">{p.tldr}</p>

          {open && (
            <div id={id} className="mt-3 border-t border-[var(--t-line)] pt-3 text-[0.84rem] leading-relaxed">
              {p.contribution && (
                <p className="m-0 t-dim">
                  <span className="t-amber">my role › </span>
                  {p.contribution}
                </p>
              )}
              {p.figure && (
                <div className="phosphor-frame mt-3 border border-[var(--t-line)]">
                  <img src={p.figure} alt={`Figure from “${p.title}”`} loading="lazy" className="phosphor-img block w-full" />
                </div>
              )}
            </div>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-[0.8rem]">
            {more && (
              <button type="button" className="btn-term is-sm" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
                {open ? "− less" : p.contribution ? "+ my role" : "+ paper figure"}
              </button>
            )}
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

        <div className="min-w-0 border-t border-[var(--t-line)] bg-[rgba(0,0,0,0.22)] lg:border-l lg:border-t-0">
          <LiveFigure slug={p.slug} />
        </div>
      </div>
    </li>
  );
}

export function Publications() {
  const review = publications.filter((p) => p.status === "under review");
  const pub = publications.filter((p) => p.status !== "under review");
  return (
    <section id="publications" className="py-14 md:py-28">
      <div className="container">
        <SectionHead id="publications" title="Papers" cmd="cat papers.bib --sort=status">
          <p>
            Two manuscripts under review, including my first-author ReVar3R; four peer-reviewed papers — one in a Q1 journal
            (IEEE Access) and three at IEEE conferences. Each one comes with a live figure.
          </p>
        </SectionHead>

        {[
          ["under review", review],
          ["peer-reviewed", pub],
        ].map(([label, list]) => (
          <div key={label} className="mb-10 last:mb-0">
            <h3 className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.2em] t-dim">
              <span>{label}</span>
              <span className="t-faint">({list.length})</span>
              <span className="h-px flex-1 bg-[var(--t-line)]" />
            </h3>
            <ol className="m-0 grid list-none gap-5 p-0">
              {list.map((p) => (
                <Paper key={p.id} p={p} />
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
