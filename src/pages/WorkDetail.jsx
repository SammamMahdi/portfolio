import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { findWork, publications, projects } from "@/data/portfolio";
import { TopBar } from "@/components/term/TopBar";
import { Footer } from "@/components/sections/Contact";
import { Authors } from "@/components/sections/Publications";
import { ExtLink } from "@/components/term/Term";
import NotFound from "./NotFound";

function Sec({ name, children }) {
  return (
    <section className="mt-8">
      <h2 className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] t-amber">{name}</h2>
      <div className="mt-2 pl-4 text-[0.95rem] leading-relaxed t-text sm:pl-8">{children}</div>
    </section>
  );
}

export const WorkDetail = () => {
  const { slug } = useParams();
  const item = findWork(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!item) return;
    document.title = `${item.name || item.title.split(":")[0]} — Sammam Mahdi`;
    return () => {
      document.title = "Sammam Mahdi — Computer Vision & ML Researcher";
    };
  }, [item]);

  if (!item) return <NotFound path={`/work/${slug}`} />;

  const isPaper = publications.includes(item);
  const back = isPaper ? { href: "/#publications", label: "papers" } : { href: "/#projects", label: "projects" };
  const NAME = item.slug.toUpperCase();
  const section = isPaper ? 3 : 5;
  const list = isPaper ? publications : projects;
  const idx = list.indexOf(item);
  const prev = list[idx - 1], next = list[idx + 1];
  const figure = item.figure || item.image;

  return (
    <div className="min-h-screen overflow-x-clip">
      <TopBar />
      <main className="container py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <Link to={back.href} className="link-term text-sm">
            ← cd ~/{back.label}
          </Link>

          <div className="mt-8 flex justify-between border-b border-[var(--t-line)] pb-2 text-[0.75rem] uppercase tracking-[0.1em] t-dim">
            <span>
              {NAME}({section})
            </span>
            <span className="hidden sm:inline">Sammam Mahdi — {isPaper ? "publications" : "projects"}</span>
            <span>
              {NAME}({section})
            </span>
          </div>

          <Sec name="name">
            <h1 className="text-[1.25rem] leading-snug t-hi md:text-[1.5rem]">
              {isPaper ? item.title : `${item.name} — ${item.full}`}
            </h1>
          </Sec>

          <Sec name="synopsis">
            {isPaper ? (
              <>
                <p className="m-0">{item.venue}</p>
                <p className="m-0 mt-1 t-dim">
                  {item.status} · {item.year} · {item.position}
                </p>
              </>
            ) : (
              <p className="m-0">
                {item.stack} <span className="t-faint">·</span> {item.state === "RUN" ? "in progress" : "complete"}
                {item.badge && (
                  <>
                    {" "}
                    <span className="chip is-solid ml-1">{item.badge}</span>
                  </>
                )}
              </p>
            )}
          </Sec>

          {isPaper && (
            <Sec name="authors">
              <p className="m-0 t-dim">
                <Authors list={item.authors} />
              </p>
            </Sec>
          )}

          <Sec name="description">
            <p className="m-0">{isPaper ? item.tldr : item.summary}</p>
          </Sec>

          {item.contribution && (
            <Sec name="my role">
              <p className="m-0">{item.contribution}</p>
            </Sec>
          )}

          {figure && (
            <Sec name="figure">
              <div className="phosphor-frame border border-[var(--t-line)]">
                <img src={figure} alt={`Figure: ${isPaper ? item.title : item.full}`} className="phosphor-img block w-full" />
              </div>
            </Sec>
          )}

          {item.links.length > 0 && (
            <Sec name="links">
              <ul className="m-0 list-none space-y-1 p-0">
                {item.links.map((l) => (
                  <li key={l.href}>
                    <span className="t-dim">{l.label.padEnd(6, " ")}</span>{" "}
                    <ExtLink href={l.href} className="break-all">
                      {l.href.replace(/^https?:\/\//, "")}
                    </ExtLink>
                  </li>
                ))}
              </ul>
            </Sec>
          )}

          <Sec name="see also">
            <p className="m-0 flex flex-wrap gap-x-5 gap-y-1">
              {prev && (
                <Link to={`/work/${prev.slug}`} className="link-term">
                  ← {prev.slug}({section})
                </Link>
              )}
              {next && (
                <Link to={`/work/${next.slug}`} className="link-term">
                  {next.slug}({section}) →
                </Link>
              )}
              <Link to={back.href} className="link-term">
                {back.label}({section})
              </Link>
            </p>
          </Sec>

          <div className="mt-12 flex justify-between border-t border-[var(--t-line)] pt-2 text-[0.75rem] t-dim">
            <span>sammam</span>
            <span>{item.year || "2026"}</span>
            <span>
              {NAME}({section})
            </span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WorkDetail;
