import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { sections } from "@/data/portfolio";
import { isTyping, scrollToSection } from "@/hooks/useTerm";
import { useTerm } from "@/components/term/termStore";
import { BootSequence } from "@/components/term/Crt";
import { TopBar, DepthGauge } from "@/components/term/TopBar";
import { Hero } from "@/components/sections/Hero";
import { Research } from "@/components/sections/Research";
import { Publications } from "@/components/sections/Publications";
import { GitLog } from "@/components/sections/GitLog";
import { Projects } from "@/components/sections/Projects";
import { System } from "@/components/sections/System";
import { Contact, Footer } from "@/components/sections/Contact";
import { Scout } from "@/components/scout/Scout";

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getCookie(name) {
  const parts = `; ${document.cookie}`.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function setCookie(name, value, days = 1) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

export const Home = () => {
  const { hash } = useLocation();
  const { shellOpen } = useTerm();

  // Arriving from a detail page at /#papers: the router restores the URL but
  // does not scroll, and the target section only exists after this mount.
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: "instant", block: "start" }));
  }, [hash]);

  useEffect(() => {
    let visitorId = getCookie("unique_visitor_id");
    if (!visitorId) {
      visitorId = generateUUID();
      setCookie("unique_visitor_id", visitorId, 1);
    }
    fetch("/api/visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-visitor-id": visitorId },
    }).catch(console.error);
  }, []);

  // 1–7 jump between sections
  useEffect(() => {
    const onKey = (e) => {
      if (shellOpen || e.metaKey || e.ctrlKey || e.altKey || isTyping(document.activeElement)) return;
      const s = sections.find((x) => x.key === e.key);
      if (s) {
        e.preventDefault();
        scrollToSection(s.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shellOpen]);

  return (
    <div className="min-h-screen overflow-x-clip">
      <BootSequence />
      <a href="#research" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-[var(--t-amber)] focus:px-3 focus:py-2 focus:text-[var(--t-bg)]">
        Skip to research
      </a>
      <TopBar />
      <DepthGauge />
      <main>
        <Hero />
        <System />
        <Research />
        <Publications />
        <GitLog />
        <Projects />
        <Contact />
      </main>
      <Footer />
      <Scout />
    </div>
  );
};

export default Home;
