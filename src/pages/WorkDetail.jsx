import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Github,
  ExternalLink,
  Quote,
  Star,
  Landmark,
  Calendar,
  Trophy,
} from "lucide-react";
import { findWork } from "@/data/portfolio";
import { ProjectImage } from "@/components/ProjectImage";
import { StarBackground } from "@/components/StarBackground";

const backHref = {
  publication: "/#publications",
  research: "/#research-projects",
  software: "/#projects",
};

const backLabel = {
  publication: "Publications",
  research: "Research Experience",
  software: "Selected Projects",
};

export const WorkDetail = () => {
  const { slug } = useParams();
  const item = findWork(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!item) {
    return (
      <div className="relative min-h-screen bg-background text-foreground">
        <StarBackground />
        <div className="container relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-3 text-3xl font-bold">Not found</h1>
          <p className="mb-8 text-muted-foreground">
            There is nothing here with the name “{slug}”.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-6 py-3 font-bold text-primary backdrop-blur transition-transform duration-200 hover:scale-105"
          >
            <ArrowLeft size={16} />
            Back home
          </Link>
        </div>
      </div>
    );
  }

  const links = [
    item.paperUrl && { href: item.paperUrl, icon: ExternalLink, label: "Read paper", primary: true },
    item.codeUrl && { href: item.codeUrl, icon: Github, label: "View code" },
    item.liveUrl && { href: item.liveUrl, icon: ExternalLink, label: "Live demo", primary: true },
    item.link && { href: item.link, icon: ExternalLink, label: "Learn more" },
  ].filter(Boolean);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <StarBackground />

      <article className="container relative z-10 mx-auto max-w-4xl px-4 py-16 text-left">
        {/* Back */}
        <Link
          to={backHref[item.kind] || "/"}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          <ArrowLeft size={16} />
          Back to {backLabel[item.kind] || "home"}
        </Link>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/30 bg-primary/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
              {item.kindLabel}
            </span>
            {item.year && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {item.year}
              </span>
            )}
            {item.period && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {item.period}
              </span>
            )}
            {item.isFirstAuthor && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
                <Star className="h-3 w-3" />
                First Author
              </span>
            )}
            {item.citations != null && (
              <span className="inline-flex items-center gap-1 rounded-full border border-green-500/25 bg-green-500/15 px-2.5 py-1 text-[11px] font-semibold text-green-500">
                <Quote className="h-3 w-3" />
                Cited {item.citations}×
              </span>
            )}
            {item.award && (
              <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/15 px-2.5 py-1 text-[11px] font-semibold text-yellow-500">
                <Trophy className="h-3 w-3" />
                {item.award}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
            {item.title}
          </h1>
          {item.subtitle && (
            <p className="mt-2 text-lg font-medium text-primary">{item.subtitle}</p>
          )}
          {item.venue && (
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-semibold text-primary">{item.venue}</span>
              {item.location && ` · ${item.location}`}
              {item.extra && ` · ${item.extra}`}
            </p>
          )}
          {item.authors && (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground/80">{item.authors}</p>
          )}
        </motion.header>

        {/* Large picture */}
        <motion.div
          className="my-8 overflow-hidden rounded-3xl border border-primary/15"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ProjectImage src={item.image} alt={item.title} aspect="aspect-video" />
        </motion.div>

        {/* Funding */}
        {item.funding && (
          <div className="mb-6 inline-flex items-start gap-2 rounded-xl border border-yellow-500/25 bg-yellow-500/10 px-4 py-2.5">
            <Landmark className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
            <span className="text-sm font-medium leading-relaxed text-yellow-600 dark:text-yellow-400">
              {item.funding}
            </span>
          </div>
        )}

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            {item.description}
          </p>

          {item.contribution && (
            <div className="mt-6 rounded-2xl border-l-2 border-primary/50 bg-primary/5 px-5 py-4">
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                My contribution
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.contribution}</p>
            </div>
          )}

          {item.highlights && (
            <div className="mt-8">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">
                Highlights
              </h2>
              <ul className="space-y-2.5">
                {item.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-sm text-muted-foreground md:text-base">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span className="leading-relaxed">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.tags && (
            <div className="mt-8">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">
                Built with
              </h2>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {links.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-8">
              {links.map(({ href, icon: Icon, label, primary }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary ${
                    primary
                      ? "border border-primary/25 bg-primary/10 text-primary hover:bg-primary/20"
                      : "border border-border bg-secondary/60 text-foreground hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </a>
              ))}
            </div>
          )}

          {item.doiUrl && (
            <p className="mt-5 text-xs text-muted-foreground">
              DOI:{" "}
              <a
                href={item.doiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline decoration-primary/40 hover:decoration-primary"
              >
                {item.doi}
              </a>
            </p>
          )}
        </motion.div>
      </article>
    </div>
  );
};

export default WorkDetail;
