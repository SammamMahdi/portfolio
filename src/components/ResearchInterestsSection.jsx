import { motion } from "framer-motion";
import { GraduationCap, Mail, Sparkles } from "lucide-react";
import { researchInterests, phdStatement, profile } from "@/data/portfolio";

export const ResearchInterestsSection = () => {
  return (
    <section id="research-interests" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-[1.25] bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Research Interests
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Where 3D perception meets trustworthy AI — and what I want to spend a doctorate on.
          </p>
        </motion.div>

        {/* Interests — compact list */}
        <motion.div
          className="flex flex-wrap justify-center gap-2.5 mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {researchInterests.map((interest) => (
            <span
              key={interest.title}
              title={interest.blurb}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-default ${
                interest.emerging
                  ? "border border-primary/40 bg-primary/12 text-primary hover:bg-primary/20"
                  : "border border-border bg-secondary/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {interest.emerging && <Sparkles className="h-3 w-3 flex-shrink-0" />}
              {interest.title}
            </span>
          ))}
        </motion.div>

        {/* PhD availability */}
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card/50 backdrop-blur-md p-7 md:p-8 text-left"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="pointer-events-none absolute -inset-24 bg-[radial-gradient(circle_at_20%_0%,rgba(220,38,38,0.20),transparent_55%)]" />
          <span className="absolute left-0 top-7 bottom-7 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary/40" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold mb-2.5 text-foreground flex items-center gap-2.5">
                <GraduationCap className="w-6 h-6 text-primary flex-shrink-0" />
                {phdStatement.headline}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {phdStatement.body}
              </p>
            </div>

            <a
              href={`mailto:${profile.email}?subject=PhD%20Opportunity`}
              className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg hover:scale-105 transition-transform duration-200 focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Mail size={16} />
              Get in touch
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
