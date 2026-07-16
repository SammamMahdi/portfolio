import { motion } from "framer-motion";
import { Mail, ArrowRight, MapPin } from "lucide-react";
import { profile, phdStatement } from "@/data/portfolio";

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-[1.25] bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Introduction
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10 items-start text-left">
          {/* Prose */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {profile.intro.map((para, i) => (
              <p
                key={i}
                className={`leading-relaxed text-muted-foreground ${
                  i === 0 ? "text-lg text-foreground/90" : "text-base"
                }`}
              >
                {para}
              </p>
            ))}

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <a
                href={`mailto:${profile.email}?subject=PhD%20Opportunity`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg hover:scale-105 transition-transform duration-200 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Mail size={16} />
                Get in touch
              </a>
              <a
                href={profile.cv}
                download
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-black/50 backdrop-blur border border-white/10 text-primary font-semibold hover:bg-black/70 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary"
              >
                Download CV
                <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>

          {/* At-a-glance */}
          <motion.aside
            className="w-full rounded-2xl border border-primary/15 bg-card/40 backdrop-blur-md p-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="space-y-4">
              {[
                { value: profile.publicationCount, label: "IEEE publications" },
                { value: profile.citations, label: "Citations" },
                { value: profile.cgpaValue, label: "CGPA / 4.00" },
                { value: "100+", label: "Students mentored" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-baseline justify-between gap-3">
                  <span className="text-2xl font-extrabold text-primary">{stat.value}</span>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground text-right">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-border space-y-2.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary/70 flex-shrink-0" />
                {profile.location}
              </p>
              <p className="flex items-start gap-2">
                <span className="relative mt-1.5 flex h-2 w-2 flex-shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-primary font-medium">{phdStatement.headline}</span>
              </p>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
};
