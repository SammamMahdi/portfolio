import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

const skills = [
  // Machine Learning & AI
  { name: "Machine Learning", level: 90, category: "ml-ai" },
  { name: "Artificial Intelligence", level: 85, category: "ml-ai" },
  { name: "Computer Vision", level: 80, category: "ml-ai" },
  { name: "LLM-related work", level: 75, category: "ml-ai" },

  // Full Stack Web Development
  { name: "MERN Stack", level: 80, category: "webdev" },
  { name: "PHP", level: 70, category: "webdev" },
  { name: "MySQL", level: 75, category: "webdev" },

  // Programming Languages
  { name: "Python", level: 95, category: "languages" },
  { name: "Java", level: 85, category: "languages" },
  { name: "JavaScript", level: 85, category: "languages" },
  { name: "C++", level: 80, category: "languages" },
];

const categories = [
  "ml-ai",
  "webdev",
  "languages"
];

export const SkillsSection = () => {
  const [activeCategory, setActiveCategory] = useState("ml-ai");
  const [tappedIdx, setTappedIdx] = useState(null);

  React.useEffect(() => {
    const handleTouch = () => setTappedIdx(null);
    window.addEventListener('touchstart', handleTouch);
    return () => window.removeEventListener('touchstart', handleTouch);
  }, []);

  const filteredSkills = skills.filter(
    (skill) => skill.category === activeCategory
  );
  return (
    <section id="skills" className="py-24 px-4 relative bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          My <span className="text-foreground"> Skills</span>
        </h2>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category, key) => (
            <button
              key={key}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-5 py-2 rounded-full transition-colors duration-300 capitalize",
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/70 text-forefround hover:bd-secondary"
              )}
            >
              {category === "ml-ai" ? "ML & AI" :
               category === "webdev" ? "Web Dev" :
               category === "languages" ? "Languages" :
               category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill, key) => (
            <motion.div
              key={key}
              className={`relative bg-card/80 backdrop-blur-md p-6 rounded-2xl shadow-lg overflow-hidden group cursor-pointer ${tappedIdx === key ? 'scale-105 shadow-[0_4px_32px_0_rgba(220,38,38,0.15)]' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: key * 0.1, ease: 'easeOut' }}
              whileHover={{ scale: 1.04, boxShadow: "0 4px 32px 0 rgba(220, 38, 38, 0.15)", transition: { duration: 0.18 } }}
              onTouchStart={e => { e.stopPropagation(); setTappedIdx(tappedIdx === key ? null : key); }}
              onClick={e => { if (tappedIdx !== key) { e.preventDefault(); setTappedIdx(key); } else { setTappedIdx(null); } }}
            >
              {/* Red accent bar */}
              <span className={`absolute left-0 top-4 bottom-4 w-1 rounded-full bg-primary transition-transform duration-300 ${tappedIdx === key ? 'scale-y-110' : 'group-hover:scale-y-110'}`} />
              <div className="text-left mb-4">
                <h3 className="font-semibold text-lg text-foreground"> {skill.name}</h3>
              </div>
              <div className="relative flex items-center w-full h-5 mt-2 mb-2">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-3 bg-secondary/50 rounded-full" />
                <div
                  className="relative h-3 rounded-full bg-primary shadow-[0_0_12px_2px_rgba(220,38,38,0.35)] transition-all duration-700"
                  style={{ width: skill.level + "%" }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
