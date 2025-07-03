import { useState } from "react";

export const MobileNavbar = ({ navItems, activeSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setIsMenuOpen((prev) => !prev)}
        className="fixed top-4 right-4 md:hidden p-2 text-foreground z-50 bg-background/90 rounded-full shadow-lg"
        aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
        style={{ boxShadow: "0 2px 12px 0 rgba(220,38,38,0.12)" }}
      >
        <span className="block w-6 h-0.5 bg-primary mb-1 rounded-full" />
        <span className="block w-6 h-0.5 bg-primary mb-1 rounded-full" />
        <span className="block w-6 h-0.5 bg-primary rounded-full" />
      </button>
      {/* Sidebar overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 md:hidden ${isMenuOpen ? "bg-black/60 pointer-events-auto opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />
      {/* Sidebar menu */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-[#10111a] z-50 flex flex-col items-center pt-12 shadow-2xl transition-transform duration-500 md:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ boxShadow: isMenuOpen ? "-4px 0 32px 0 rgba(220,38,38,0.12)" : undefined }}
      >
        <nav className="flex flex-col space-y-8 w-full px-8">
          {navItems.map((item, key) => (
            <a
              key={key}
              href={item.href}
              className={`relative px-2 py-3 rounded-lg text-lg font-semibold transition-colors duration-300 text-foreground/90 hover:text-primary focus:text-primary outline-none w-full block text-left ${activeSection === item.id ? "text-primary neon-glow" : ""}`}
              aria-current={activeSection === item.id ? "page" : undefined}
              onClick={() => setIsMenuOpen(false)}
              tabIndex={0}
            >
              {item.name}
              <span
                className={`absolute left-0 -bottom-1 w-full h-1 rounded-full bg-primary opacity-0 scale-x-0 transition-all duration-300 ${activeSection === item.id ? "opacity-100 scale-x-100 neon-glow" : ""}`}
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