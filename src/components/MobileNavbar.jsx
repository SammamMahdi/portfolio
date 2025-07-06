import { useState } from "react";

export const MobileNavbar = ({ navItems, activeSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setIsMenuOpen((prev) => !prev)}
        className="fixed top-4 right-4 lg:hidden p-2 text-foreground z-50 bg-background/90 rounded-full shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
        aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
        style={{ boxShadow: "0 2px 12px 0 rgba(220,38,38,0.12)" }}
      >
        <span className="block w-6 h-0.5 bg-primary mb-1 rounded-full" />
        <span className="block w-6 h-0.5 bg-primary mb-1 rounded-full" />
        <span className="block w-6 h-0.5 bg-primary rounded-full" />
      </button>
      {/* Sidebar overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 lg:hidden ${isMenuOpen ? "bg-black/60 backdrop-blur-sm pointer-events-auto opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />
      {/* Sidebar menu */}
      <aside
        className={`fixed top-0 right-0 h-full w-56 bg-background/90 border-l border-border z-50 flex flex-col items-center pt-0 shadow-2xl transition-all duration-500 lg:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"} overflow-y-auto`}
        style={{ boxShadow: isMenuOpen ? "-4px 0 32px 0 rgba(220,38,38,0.12)" : undefined }}
        aria-label="Mobile navigation"
      >
        {/* Portfolio Title */}
        <div className="w-full px-6 pt-6 pb-3 flex flex-col items-center border-b border-border bg-background/95">
          <span className="text-xl font-bold text-primary neon-glow text-center tracking-wide">
            Sammam Mahdi <span className="text-glow text-foreground">Portfolio</span>
          </span>
        </div>
        <nav className="flex flex-col space-y-3 w-full px-6 mt-6 mb-6">
          {navItems.map((item, key) => (
            <a
              key={key}
              href={item.href}
              className={`group relative px-3 py-3 pb-1 rounded-lg text-lg font-semibold transition-all duration-200 text-foreground/90 hover:text-primary focus:text-primary outline-none w-full block text-left focus-visible:ring-2 focus-visible:ring-primary ${activeSection === item.id ? "text-primary neon-glow" : ""}`}
              aria-current={activeSection === item.id ? "page" : undefined}
              onClick={() => setIsMenuOpen(false)}
              tabIndex={0}
            >
              {item.name}
              <span
                className={`pointer-events-none absolute inset-x-0 -bottom-0.5 w-full h-0.5 rounded-full bg-primary mx-auto opacity-0 scale-x-0 group-hover:opacity-80 group-hover:scale-x-100 transition-all duration-300 ${activeSection === item.id ? "opacity-100 scale-x-100 neon-glow" : ""}`}
              />
            </a>
          ))}
        </nav>
      </aside>
      {/* Neon underline animation */}
      <style>{`
        .neon-glow {
          text-shadow: 0 0 6px #dc2626, 0 0 12px #dc2626;
        }
      `}</style>
    </>
  );
}; 