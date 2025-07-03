import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hideOnScroll, setHideOnScroll] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");
  const observerRef = useRef(null);

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

  // Scrollspy logic
  useEffect(() => {
    const sectionIds = navItems.map((item) => item.id);
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new window.IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { threshold: 0.4 }
    );
    sections.forEach((section) => {
      if (section) observerRef.current.observe(section);
    });
    return () => observerRef.current && observerRef.current.disconnect();
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
      >
        <div className="container flex items-center justify-between">
          <a
            className="text-xl font-bold text-primary flex items-center"
            href="#hero"
          >
            <span className="relative z-10">
              <span className="text-glow text-foreground"> Sammam Mahdi </span>{" "}
              Portfolio
            </span>
          </a>
          <div className="flex space-x-4 lg:space-x-8">
            {navItems.map((item, key) => (
              <a
                key={key}
                href={item.href}
                className={cn(
                  "relative px-2 py-1 text-base font-medium transition-colors duration-300",
                  "hover:text-primary focus:text-primary outline-none",
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
                    "absolute left-0 -bottom-1 w-full h-0.5 rounded-full bg-primary opacity-0 scale-x-0 transition-all duration-300",
                    "group-hover:opacity-100 group-hover:scale-x-100",
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
