/** The live figure attached to a paper card: a title row, the figure, a caption. */
export function FigFrame({ title, tabs, children, caption, note }) {
  return (
    <figure className="m-0 flex h-full min-w-0 flex-col">
      <div className="flex min-h-[2.4rem] flex-wrap items-center gap-x-3 gap-y-1 border-b border-[var(--t-line)] px-3 py-1.5">
        <span className="text-[0.65rem] uppercase tracking-[0.16em] t-dim">
          <span className="t-amber">fig.</span> {title}
        </span>
        {tabs && <div className="ml-auto flex flex-wrap justify-end gap-1">{tabs}</div>}
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
      {(caption || note) && (
        <figcaption className="border-t border-[var(--t-line)] px-3 py-2 text-[0.76rem] leading-relaxed">
          {caption && <div className="t-text">{caption}</div>}
          {note && <div className="mt-1 text-[0.68rem] t-faint">{note}</div>}
        </figcaption>
      )}
    </figure>
  );
}

export function Tab({ on, onClick, children }) {
  return (
    <button type="button" role="tab" aria-selected={on} onClick={onClick} className="btn-term is-sm">
      {children}
    </button>
  );
}
