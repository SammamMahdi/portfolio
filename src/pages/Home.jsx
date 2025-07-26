import { Navbar } from "../components/Navbar";
// import { ThemeToggle } from "../components/ThemeToggle";
import { StarBackground } from "@/components/StarBackground";
import { HeroSection } from "../components/HeroSection";
import { EducationSection } from "../components/EducationSection";
import { ActivitiesSection } from "../components/ActivitiesSection";
import { AwardsSection } from "../components/AwardsSection";
import { WorkExperienceSection } from "../components/WorkExperienceSection";
import { PublicationsSection } from "../components/PublicationsSection";
import { SkillsSection } from "../components/SkillsSection";
import { ProjectsSection } from "../components/ProjectsSection";
import { ContactSection } from "../components/ContactSection";
import { Footer } from "../components/Footer";
import { useEffect } from "react";

export const Home = () => {
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
      {/* Theme Toggle */}
      {/* <ThemeToggle /> */}
      {/* Background Effects */}
      <StarBackground />

      {/* Navbar */}
      <Navbar />
      {/* Main Content */}
      <main className="flex-1">
        <HeroSection />
        <EducationSection />
        <SkillsSection />
        <ProjectsSection />
        <WorkExperienceSection />
        <PublicationsSection />
        <ActivitiesSection />
        <AwardsSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
