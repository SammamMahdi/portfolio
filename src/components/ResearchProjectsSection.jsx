import { motion } from "framer-motion";
import { researchProjects } from "@/data/portfolio";
import { WorkCard } from "./WorkCard";

export const ResearchProjectsSection = () => {
  return (
    <section id="research-projects" className="py-24 px-4 relative">
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
            Research Experience
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Assistive 3D perception, media forensics, edge-deployable diagnostics, federated
            quantum learning — and two years on a Mars rover team.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {researchProjects.map((project, idx) => (
            <WorkCard key={project.slug} item={project} index={idx} badge={project.status} />
          ))}
        </div>
      </div>
    </section>
  );
};
