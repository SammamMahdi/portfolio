import { motion } from "framer-motion";
import { technicalSkills } from "@/data/portfolio";

export const SkillsSection = () => {
  return (
    <section id="skills" className="py-24 px-4 relative">
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
            Technical Skills
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The tools I actually reach for — each one used in the research or the software
            listed on this page.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {technicalSkills.map((group, idx) => {
            const Icon = group.icon;
            const wide = idx === technicalSkills.length - 1 && technicalSkills.length % 2 === 1;
            return (
              <motion.div
                key={group.category}
                className={`group relative rounded-2xl border border-primary/10 bg-card/40 backdrop-blur-md p-6 overflow-hidden transition-all duration-300 hover:border-primary/40 text-left ${
                  wide ? "md:col-span-2" : ""
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: (idx % 2) * 0.08, ease: "easeOut" }}
                whileHover={{ y: -4 }}
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.14),transparent_70%)]" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 group-hover:drop-shadow-[0_0_14px_rgba(220,38,38,0.6)] transition-all duration-300">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{group.category}</h3>
                    <span className="ml-auto text-xs text-muted-foreground/60 font-medium">
                      {group.items.length}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg bg-secondary/60 text-foreground/90 border border-border hover:border-primary/40 hover:text-primary transition-colors duration-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
