import { profile, links, publications, ME_NAME, education } from "@/data/portfolio";
import { Typed } from "@/components/term/Term";
import { PortraitViewer } from "@/components/viz/PortraitViewer";
import { scrollToSection } from "@/hooks/useTerm";

const inReview = publications.filter((p) => p.status === "under review").length;
const published = publications.length - inReview;
const firstAuthor = publications.filter((p) => p.authors[0] === ME_NAME).length;

const VITALS = [
  { k: "papers", v: String(publications.length), sub: `${inReview} under review · ${published} published` },
  { k: "first-author", v: String(firstAuthor), sub: "incl. ReVar3R · arXiv" },
  { k: "cgpa", v: education.cgpa.toFixed(2), sub: `/ ${education.scale.toFixed(2)} · Highest Distinction` },
  { k: "urc 2025", v: "8th", sub: "globally · Mars rover AI/ML" },
];

export function Hero() {
  return (
    <section id="whoami" aria-label="Introduction" className="relative pb-10 pt-10 md:pb-28 md:pt-16">
      <div className="container grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div className="rise min-w-0">
          <p className="text-sm t-dim">
            <span className="t-amber">sammam@lab</span>
            <span className="t-faint">:~$ </span>
            <Typed text="whoami" className="t-text" speed={70} />
          </p>

          <h1 className="mt-5 font-display text-[clamp(3.9rem,11vw,7.6rem)] uppercase leading-[0.82] t-hi glow-strong">
            Sammam
            <br />
            Mahdi
          </h1>

          <p className="mt-6 text-lg t-amber md:text-xl">{profile.role}</p>
          <p className="mt-2 flex items-center gap-2 text-sm t-text">
            <span className="relative inline-flex h-2 w-2" aria-hidden="true">
              <span className="absolute inset-0 animate-ping bg-[var(--t-amber)] opacity-60" />
              <span className="relative h-2 w-2 bg-[var(--t-amber)]" />
            </span>
            {profile.status}
          </p>

          <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed t-text">{profile.tagline}</p>

          <dl className="mt-8 grid max-w-xl grid-cols-2 border-l border-t border-[var(--t-line)] sm:grid-cols-4">
            {VITALS.map((x) => (
              <div key={x.k} className="border-b border-r border-[var(--t-line)] px-3 py-3">
                <dt className="text-[0.65rem] uppercase tracking-[0.16em] t-dim">{x.k}</dt>
                <dd className="m-0 font-display text-[2.4rem] t-hi glow">{x.v}</dd>
                <dd className="m-0 text-[0.68rem] leading-snug t-dim">{x.sub}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#research"
              className="btn-term is-primary"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("research");
              }}
            >
              <span aria-hidden="true">▶</span> run the research demos
            </a>
            <a href={profile.cv} download className="btn-term">
              <span aria-hidden="true">↓</span> CV.pdf
            </a>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {links.map((l) => (
              <li key={l.label}>
                <span className="t-faint">~/</span>
                <a
                  href={l.href}
                  className="link-term"
                  {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="rise min-w-0" style={{ animationDelay: "120ms" }}>
          <PortraitViewer />
        </div>
      </div>
    </section>
  );
}
