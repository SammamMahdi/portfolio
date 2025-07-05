import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { MobileNavbar } from "./MobileNavbar";

const navItems = [
  { name: "Home", href: "#hero", id: "hero" },
  { name: "Education", href: "#education", id: "education" },
  { name: "Skills", href: "#skills", id: "skills" },
  { name: "Projects", href: "#projects", id: "projects" },
  { name: "Work Experience", href: "#work-experience", id: "work-experience" },
  { name: "Publications", href: "#publications", id: "publications" },
  { name: "Activities", href: "#activities", id: "activities" },
  { name: "Awards", href: "#awards", id: "awards" },
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

  // Improved scrollspy logic: uses scroll event and section positions
  useEffect(() => {
    const handleScrollSpy = () => {
      const sectionIds = navItems.map((item) => item.id);
      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);
      const scrollY = window.scrollY;
      let active = sectionIds[0];
      for (let i = 0; i < sections.length; i++) {
        const rect = sections[i].getBoundingClientRect();
        // If top is above the top of the viewport but not too far above, mark as active
        if (rect.top <= 80 && rect.bottom > 80) {
          active = sections[i].id;
          break;
        }
        // If at the bottom of the page, set last section as active
        if (window.innerHeight + scrollY >= document.body.offsetHeight - 2) {
          active = sectionIds[sectionIds.length - 1];
        }
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
          "fixed w-full z-40 transition-all duration-300 hidden md:block",
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
          <div className="flex space-x-2 lg:space-x-6">
            {navItems.map((item, key) => (
              <a
                key={key}
                href={item.href}
                className={cn(
                  "group relative px-3 py-2 pb-1 text-base font-medium rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary",
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
