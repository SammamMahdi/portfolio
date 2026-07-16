import { motion } from "framer-motion";
import { Calendar, Building2, BadgeCheck, BookMarked } from "lucide-react";
import { education } from "@/data/portfolio";

export const EducationSection = () => {
  return (
    <section id="education" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-[1.25] bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Education
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Consistent academic record across university and international qualifications.
          </p>
        </motion.div>

        <div className="space-y-6">
          {education.map((edu, idx) => {
            const Icon = edu.icon;
            return (
              <motion.article
                key={edu.degree}
                className="group relative rounded-3xl border border-primary/10 bg-card/40 backdrop-blur-md p-6 lg:p-8 overflow-hidden transition-all duration-300 hover:border-primary/40 text-left"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: idx * 0.08, ease: "easeOut" }}
              >
                <div className="pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_15%_0%,rgba(220,38,38,0.18),transparent_55%)]" />
                <span className="absolute left-0 top-6 bottom-6 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary/40" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Grade — the headline */}
                  <div className="flex-shrink-0 flex items-center gap-5">
                    <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 group-hover:drop-shadow-[0_0_16px_rgba(220,38,38,0.6)] transition-all duration-300">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className="rounded-2xl border border-primary/30 bg-primary/5 px-6 py-3 text-center min-w-[132px]">
                      <div className="text-4xl font-extrabold text-primary leading-none drop-shadow-[0_0_14px_rgba(220,38,38,0.45)]">
                        {edu.grade}
                      </div>
                      <div className="mt-1.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                        {edu.gradeLabel}
                      </div>
                    </div>
                  </div>

                  {/* Detail */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          edu.status === "Graduated"
                            ? "bg-green-500/15 text-green-500 border-green-500/30"
                            : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                        }`}
                      >
                        <BadgeCheck className="w-3 h-3" />
                        {edu.status}
                      </span>
                      {edu.honors?.map((h) => (
                        <span
                          key={h}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-yellow-500/15 text-yellow-500 border border-yellow-500/30"
                        >
                          {h}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-xl lg:text-2xl font-bold text-foreground leading-snug mb-3">
                      {edu.degree}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary/70" />
                        {edu.institution}
                        {edu.location && ` · ${edu.location}`}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary/70" />
                        {edu.duration}
                      </span>
                    </div>

                    {edu.coursework && (
                      <div className="mt-5">
                        <div className="flex items-center gap-2 mb-2.5 text-[10px] uppercase tracking-[0.15em] text-primary font-bold">
                          <BookMarked className="w-3 h-3" />
                          Relevant coursework
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {edu.coursework.map((c) => (
                            <span
                              key={c}
                              className="px-2.5 py-1 text-xs font-medium rounded-full bg-secondary/60 text-muted-foreground border border-border"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
