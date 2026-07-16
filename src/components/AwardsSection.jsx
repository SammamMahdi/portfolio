import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { awards } from "@/data/portfolio";

const typeStyles = {
  Academic: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  Competition: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Achievement: "bg-green-500/15 text-green-500 border-green-500/30",
};

export const AwardsSection = () => {
  return (
    <section id="awards" className="py-24 px-4 relative">
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
            Honors & Awards
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {awards.map((award, idx) => {
            const Icon = award.icon;
            const wide = idx === awards.length - 1 && awards.length % 2 === 1;
            return (
              <motion.article
                key={award.title}
                className={`group relative flex gap-5 rounded-2xl border border-primary/10 bg-card/40 backdrop-blur-md p-6 overflow-hidden transition-all duration-300 hover:border-primary/40 text-left ${
                  wide ? "md:col-span-2" : ""
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: (idx % 2) * 0.08, ease: "easeOut" }}
                whileHover={{ y: -4 }}
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.14),transparent_70%)]" />

                <div className="relative z-10 flex-shrink-0">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:drop-shadow-[0_0_14px_rgba(220,38,38,0.6)] transition-all duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>

                <div className="relative z-10 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        typeStyles[award.type] || typeStyles.Achievement
                      }`}
                    >
                      {award.type}
                    </span>
                    {award.year && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                        <Calendar className="w-2.5 h-2.5" />
                        {award.year}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-foreground leading-snug mb-1.5">
                    {award.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{award.detail}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
