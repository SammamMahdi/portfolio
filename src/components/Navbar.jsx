import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { MobileNavbar } from "./MobileNavbar";

// Mirrors the CV's section order.
const navItems = [
  { name: "Home", href: "#hero", id: "hero" },
  { name: "Introduction", href: "#about", id: "about" },
  { name: "Interests", href: "#research-interests", id: "research-interests" },
  { name: "Education", href: "#education", id: "education" },
  { name: "Teaching", href: "#teaching", id: "teaching" },
  { name: "Publications", href: "#publications", id: "publications" },
  { name: "Research", href: "#research-projects", id: "research-projects" },
  { name: "Skills", href: "#skills", id: "skills" },
  { name: "Projects", href: "#projects", id: "projects" },
  { name: "Awards", href: "#awards", id: "awards" },
  { name: "Activities", href: "#activities", id: "activities" },
  { name: "Contact", href: "#contact", id: "contact" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hideOnScroll, setHideOnScroll] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      if (window.scrollY > lastScrollY && window.scrollY > 80) {
        setHideOnScroll(true); // scrolling down
      } else {
        setHideOnScroll(false); // scrolling up
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Scrollspy: the active item is the last section whose top has passed the
  // navbar. Tracking "last passed" rather than "currently straddling" keeps a
  // sensible item lit even when no section boundary sits at the threshold.
  useEffect(() => {
    const handleScrollSpy = () => {
      const sections = navItems
        .map((item) => document.getElementById(item.id))
        .filter(Boolean);
      if (!sections.length) return;

      // Bottom of the page: the final section can be too short to ever pass
      // the threshold, so surface it explicitly.
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 2) {
        setActiveSection(sections[sections.length - 1].id);
        return;
      }

      let active = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= 80) active = section.id;
      }
      setActiveSection(active);
    };
    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy(); // Initial call
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className={cn(
          "fixed w-full z-40 transition-all duration-300 hidden lg:block",
          isScrolled ? "py-2 bg-background/90 backdrop-blur-md shadow-md rounded-b-2xl" : "py-4",
          hideOnScroll ? "-translate-y-full" : "translate-y-0"
        )}
        style={{ boxShadow: isScrolled ? "0 2px 24px 0 rgba(220,38,38,0.08)" : undefined }}
        aria-label="Main navigation"
      >
        <div className="container flex items-center justify-between">
          <a
            className="text-xl font-bold text-primary flex items-center focus-visible:ring-2 focus-visible:ring-primary focus:outline-none rounded-lg px-2 py-1 transition-all duration-200"
            href="#hero"
            tabIndex={0}
          >
            <span className="relative z-10">
              <span className="text-glow text-foreground"> Sammam Mahdi </span>{" "}
              Portfolio
            </span>
          </a>
          <div className="flex space-x-1 lg:space-x-2">
            {navItems.map((item, key) => (
              <a
                key={key}
                href={item.href}
                className={cn(
                  "group relative px-2.5 py-2 pb-1 text-sm font-medium rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary whitespace-nowrap",
                  "hover:text-primary focus:text-primary",
                  activeSection === item.id
                    ? "text-primary neon-glow"
                    : "text-foreground/80"
                )}
                aria-current={activeSection === item.id ? "page" : undefined}
                tabIndex={0}
              >
                {item.name}
                <span
                  className={cn(
                    "pointer-events-none absolute inset-x-0 -bottom-0.5 w-full h-0.5 rounded-full bg-primary mx-auto opacity-0 scale-x-0 group-hover:opacity-80 group-hover:scale-x-100 transition-all duration-300",
                    activeSection === item.id && "opacity-100 scale-x-100 neon-glow"
                  )}
                />
              </a>
            ))}
          </div>
        </div>
        {/* Neon underline animation */}
        <style>{`
          .neon-glow {
            text-shadow: 0 0 6px #dc2626, 0 0 12px #dc2626;
          }
        `}</style>
      </nav>
      {/* Mobile Navbar */}
      <MobileNavbar navItems={navItems} activeSection={activeSection} />
    </>
  );
};
