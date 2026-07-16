import { motion } from "framer-motion";
import { Calendar, Building2, GraduationCap } from "lucide-react";
import { teachingExperience, teachingInterests } from "@/data/portfolio";

export const TeachingSection = () => {
  return (
    <section id="teaching" className="py-24 px-4 relative">
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
            Teaching
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mentoring 100+ students through Data Structures & Algorithms — and a genuine
            passion for explaining complex ideas simply.
          </p>
        </motion.div>

        {/* Experience */}
        <div className="space-y-6 mb-16">
          {teachingExperience.map((role, idx) => {
            const Icon = role.icon;
            return (
              <motion.article
                key={role.role}
                className="group relative rounded-3xl border border-primary/10 bg-card/40 backdrop-blur-md p-6 lg:p-8 overflow-hidden transition-all duration-300 hover:border-primary/40 text-left"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: idx * 0.08, ease: "easeOut" }}
              >
                <div className="pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_15%_0%,rgba(220,38,38,0.16),transparent_55%)]" />
                <span className="absolute left-0 top-6 bottom-6 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary/40" />

                <div className="relative z-10 flex flex-col lg:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="p-3.5 w-fit rounded-2xl bg-primary/10 border border-primary/20 group-hover:drop-shadow-[0_0_16px_rgba(220,38,38,0.6)] transition-all duration-300">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl lg:text-2xl font-bold text-foreground leading-snug mb-2">
                      {role.role}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary/70" />
                        {role.org}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary/70" />
                        {role.duration}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {role.highlights.map((h) => (
                        <li key={h} className="flex gap-2.5 text-sm text-muted-foreground">
                          <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                          <span className="leading-relaxed">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Courses able to teach */}
        <motion.div
          className="text-left"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-primary" />
            Courses I can teach
          </h3>
          <p className="text-sm text-muted-foreground mb-7">
            Ready to lead both theory and laboratory sections across these areas.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teachingInterests.map((group, idx) => {
              const Icon = group.icon;
              return (
                <motion.div
                  key={group.area}
                  className="group relative rounded-2xl border border-primary/10 bg-card/40 backdrop-blur-md p-6 overflow-hidden transition-all duration-300 hover:border-primary/40"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
                  whileHover={{ y: -4 }}
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.14),transparent_70%)]" />
                  <div className="relative z-10">
                    <div className="p-2.5 w-fit rounded-xl bg-primary/10 border border-primary/20 mb-4">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="text-base font-bold text-foreground mb-3">{group.area}</h4>
                    <div className="flex flex-wrap gap-2">
                      {group.courses.map((c) => (
                        <span
                          key={c}
                          className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
