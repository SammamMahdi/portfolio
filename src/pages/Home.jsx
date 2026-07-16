import { Navbar } from "../components/Navbar";
import { StarBackground } from "@/components/StarBackground";
import { HeroSection } from "../components/HeroSection";
import { AboutSection } from "../components/AboutSection";
import { ResearchInterestsSection } from "../components/ResearchInterestsSection";
import { EducationSection } from "../components/EducationSection";
import { TeachingSection } from "../components/TeachingSection";
import { PublicationsSection } from "../components/PublicationsSection";
import { ResearchProjectsSection } from "../components/ResearchProjectsSection";
import { SkillsSection } from "../components/SkillsSection";
import { ProjectsSection } from "../components/ProjectsSection";
import { AwardsSection } from "../components/AwardsSection";
import { ActivitiesSection } from "../components/ActivitiesSection";
import { ContactSection } from "../components/ContactSection";
import { Footer } from "../components/Footer";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const Home = () => {
  const { hash } = useLocation();

  // Arriving from a detail page at /#publications: the router restores the URL
  // but does not scroll, and the target section only exists after this mount.
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: "instant", block: "start" }));
  }, [hash]);

  useEffect(() => {
    // Generate or get visitor ID from cookie
    let visitorId = getCookie('unique_visitor_id');
    if (!visitorId) {
      visitorId = generateUUID();
      setCookie('unique_visitor_id', visitorId, 1); // 1 day expiration
    }

    // Record the visit with the visitor ID
    fetch("/api/visitor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-visitor-id": visitorId
      }
    }).catch(console.error);
  }, []);

  // Helper functions for cookie management
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  function setCookie(name, value, days = 1) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  }
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* Background Effects */}
      <StarBackground />

      {/* Navbar */}
      <Navbar />

      {/* Main Content — section order mirrors the CV. */}
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <ResearchInterestsSection />
        <EducationSection />
        <TeachingSection />
        <PublicationsSection />
        <ResearchProjectsSection />
        <SkillsSection />
        <ProjectsSection />
        <AwardsSection />
        <ActivitiesSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
