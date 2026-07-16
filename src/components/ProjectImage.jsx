import { useState } from "react";
import { ImageIcon } from "lucide-react";

/**
 * Project screenshot with a designed fallback.
 *
 * Real screenshots live in public/projects/. Until one exists for a given
 * slug, the <img> onError swap renders a gradient card seeded from the title
 * so the grid never shows a broken-image glyph or a ragged empty box.
 */
export const ProjectImage = ({ src, alt, className = "", aspect = "aspect-video" }) => {
  const [failed, setFailed] = useState(false);

  const initials = (alt || "")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (failed || !src) {
    return (
      <div
        className={`${aspect} ${className} relative w-full overflow-hidden bg-gradient-to-br from-primary/25 via-primary/5 to-secondary/20 flex items-center justify-center`}
        aria-label={alt}
        role="img"
      >
        {/* grid texture */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(220,38,38,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,.5) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="absolute -inset-8 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.25),transparent_60%)]" />
        <div className="relative z-10 flex flex-col items-center gap-2">
          <span className="text-3xl font-extrabold tracking-widest text-primary/90 drop-shadow-[0_0_12px_rgba(220,38,38,0.6)]">
            {initials || <ImageIcon className="w-8 h-8" />}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
            Preview coming soon
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${aspect} ${className} relative w-full overflow-hidden bg-secondary/30`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
    </div>
  );
};
