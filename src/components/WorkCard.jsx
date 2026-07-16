import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { ProjectImage } from "./ProjectImage";

/**
 * Compact entry in a work grid: picture, title, one line of context.
 * Everything else lives on the detail page at /work/<slug>.
 */
export const WorkCard = ({ item, index = 0, badge }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.06, ease: "easeOut" }}
      whileHover={{ y: -5 }}
    >
      <Link
        to={`/work/${item.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-primary/10 bg-card/40 backdrop-blur-md text-left transition-all duration-300 hover:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="relative">
          <ProjectImage src={item.image} alt={item.title} />
          {badge && (
            <span className="absolute top-3 left-3 z-20 inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold text-primary-foreground shadow-lg backdrop-blur">
              {badge}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="text-[15px] font-bold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {item.title}
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1">
            {item.subtitle || item.venue}
          </p>

          <div className="mt-auto flex items-center gap-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-primary/70 group-hover:text-primary transition-colors duration-200">
            View details
            <ArrowUpRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
