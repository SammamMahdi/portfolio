import { motion } from "framer-motion";
import { ArrowRight, Code2 } from "lucide-react";
import { softwareProjects, engineeringStatement, profile } from "@/data/portfolio";
import { WorkCard } from "./WorkCard";

export const ProjectsSection = () => {
  return (
    <section id="projects" className="py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-[1.25] bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Selected Projects
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Products I designed, built, and shipped — from real-time 3D games to healthcare
            platforms and embedded robotics.
          </p>
        </motion.div>

        {/* Engineering statement */}
        <motion.div
          className="relative mb-10 overflow-hidden rounded-2xl border border-primary/15 bg-card/40 backdrop-blur-md p-6 text-left"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="pointer-events-none absolute -inset-24 bg-[radial-gradient(circle_at_80%_0%,rgba(220,38,38,0.14),transparent_55%)]" />
          <div className="relative z-10 flex items-start gap-3">
            <Code2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">
                {engineeringStatement.headline}.
              </span>{" "}
              {engineeringStatement.body}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {softwareProjects.map((project, idx) => (
            <WorkCard key={project.slug} item={project} index={idx} badge={project.award ? "Award" : null} />
          ))}
        </div>

        {/* GitHub Link */}
        <div className="text-center">
          <a
            className="w-fit flex items-center mx-auto gap-2 px-6 py-3 rounded-full bg-black/60 backdrop-blur text-primary font-bold shadow-lg border border-white/10 hover:bg-black/80 neon-glow transition-all duration-300 transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary"
            target="_blank"
            href={profile.github}
            rel="noopener noreferrer"
          >
            More on GitHub <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};
