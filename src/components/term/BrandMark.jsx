/**
 * The site mark: a wireframe cube with a lens at its centre — 3D vision.
 * On hover it flips between its two depth readings (a Necker cube), the same
 * ambiguity a single camera faces. Colours follow the active phosphor.
 */
export function BrandMark({ flipped = false, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      className={`brand-mark shrink-0 overflow-visible ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {/* silhouette */}
      <path className="brand-draw" d="M12 2.5 L20.5 7.25 L20.5 16.75 L12 21.5 L3.5 16.75 L3.5 7.25 Z" />
      {/* seen from above */}
      <path d="M12 12 L3.5 7.25 M12 12 L20.5 7.25 M12 12 L12 21.5" style={{ opacity: flipped ? 0 : 1, transition: "opacity 0.25s" }} />
      {/* seen from below */}
      <path d="M12 12 L3.5 16.75 M12 12 L20.5 16.75 M12 12 L12 2.5" style={{ opacity: flipped ? 1 : 0, transition: "opacity 0.25s" }} />
      {/* the lens */}
      <circle cx="12" cy="12" r="2.4" fill="var(--t-bg)" />
      <circle className="brand-lens" cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}
