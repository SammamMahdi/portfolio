import { motion } from "framer-motion";
import { Quote, Award, Star } from "lucide-react";
import { publications, profile } from "@/data/portfolio";
import { WorkCard } from "./WorkCard";

export const PublicationsSection = () => {
  return (
    <section id="publications" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-[1.25] bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Publications
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Peer-reviewed IEEE research in computer vision, explainable AI, and healthcare.
          </p>
        </motion.div>

        {/* Scholar summary */}
        <motion.div
          className="flex flex-wrap justify-center gap-2.5 mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {[
            { icon: Award, label: `${profile.publicationCount} peer-reviewed papers` },
            { icon: Quote, label: `${profile.citations} citations` },
            { icon: Star, label: "1 first-author paper" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/40 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur-md"
            >
              <Icon className="h-3.5 w-3.5 text-primary" />
              {label}
            </span>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {publications.map((pub, idx) => (
            <WorkCard
              key={pub.slug}
              item={pub}
              index={idx}
              badge={pub.isFirstAuthor ? "First Author" : pub.year}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
