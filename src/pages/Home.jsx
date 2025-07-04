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

export const Home = () => {
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
