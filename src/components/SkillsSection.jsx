import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import React from "react";

const skills = [
  // Programming Languages
  { name: "Python", level: 95, category: "programming-languages" },
  { name: "Java", level: 90, category: "programming-languages" },
  { name: "C++", level: 85, category: "programming-languages" },
  { name: "JavaScript", level: 85, category: "programming-languages" },

  // Machine Learning & AI
  { name: "Scikit-Learn", level: 90, category: "ml-ai" },
  { name: "PyTorch", level: 85, category: "ml-ai" },
  { name: "TensorFlow", level: 80, category: "ml-ai" },
  { name: "Keras", level: 80, category: "ml-ai" },
  { name: "Explainable AI (XAI)", level: 75, category: "ml-ai" },
  { name: "Large Language Models (LLMs)", level: 75, category: "ml-ai" },
  { name: "Hyperparameter Tuning", level: 80, category: "ml-ai" },
  { name: "Model Evaluation", level: 85, category: "ml-ai" },
  { name: "Custom Models", level: 80, category: "ml-ai" },
  { name: "Neural Networks", level: 85, category: "ml-ai" },
  { name: "VLMS", level: 70, category: "ml-ai" },
  { name: "CLIP AI", level: 70, category: "ml-ai" },

  // Computer Vision
  { name: "OpenCV", level: 85, category: "computer-vision" },
  { name: "MediaPipe", level: 75, category: "computer-vision" },
  { name: "Image Processing", level: 80, category: "computer-vision" },
  { name: "Landmark Detection", level: 75, category: "computer-vision" },
  { name: "Object Detection", level: 80, category: "computer-vision" },
  { name: "VSLAM", level: 70, category: "computer-vision" },
  { name: "Point Cloud Generation", level: 70, category: "computer-vision" },
  { name: "Semantic Segmentation", level: 75, category: "computer-vision" },
  { name: "Heat Map Generation", level: 70, category: "computer-vision" },

  // Robotics
  { name: "ROS2", level: 70, category: "robotics" },
  { name: "Gazebo", level: 70, category: "robotics" },
  { name: "Navigation", level: 75, category: "robotics" },

  // Research
  { name: "Early Detection", level: 80, category: "research" },
  { name: "Stroke Diagnosis", level: 80, category: "research" },
  { name: "Applied AI in Healthcare", level: 85, category: "research" },
  { name: "Paper Writing in LaTeX", level: 90, category: "research" },

  // Web Development
  { name: "MERN Stack", level: 85, category: "webdev" },
  { name: "Vite", level: 80, category: "webdev" },
  { name: "Deployment", level: 80, category: "webdev" },
  { name: "TypeScript", level: 75, category: "webdev" },
  { name: "PHP", level: 70, category: "webdev" },
  { name: "MySQL", level: 75, category: "webdev" },
];

const categories = [
  "programming-languages",
  "ml-ai",
  "computer-vision",
  "robotics",
  "research",
  "webdev"
];

const SKILLS_PER_PAGE = 6;

export const SkillsSection = () => {
  const [activeCategory, setActiveCategory] = useState("ml-ai");
  const [tappedIdx, setTappedIdx] = useState(null);
  const [showAllSkills, setShowAllSkills] = useState(false);

  React.useEffect(() => {
    const handleTouch = () => setTappedIdx(null);
    window.addEventListener('touchstart', handleTouch);
    return () => window.removeEventListener('touchstart', handleTouch);
  }, []);

  // Reset show all when category changes
  React.useEffect(() => {
    setShowAllSkills(false);
  }, [activeCategory]);

  const filteredSkills = skills.filter(
    (skill) => skill.category === activeCategory
  );

  const displayedSkills = showAllSkills ? filteredSkills : filteredSkills.slice(0, SKILLS_PER_PAGE);
  const hasMoreSkills = filteredSkills.length > SKILLS_PER_PAGE;

  const getCategoryDisplayName = (category) => {
    switch (category) {
      case "programming-languages": return "Programming Languages";
      case "ml-ai": return "Machine Learning & AI";
      case "computer-vision": return "Computer Vision";
      case "robotics": return "Robotics";
      case "research": return "Research";
      case "webdev": return "Web Development";
      default: return category;
    }
  };

  return (
    <section id="skills" className="py-24 px-4 relative bg-gradient-to-br from-background/80 via-secondary/10 to-background/80">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-[1.25] bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            My Skills
          </h2>
        </motion.div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category, key) => (
            <button
              key={key}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-5 py-2 rounded-full transition-all duration-300 capitalize font-medium",
                activeCategory === category
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-secondary/70 text-foreground hover:bg-secondary hover:shadow-md"
              )}
            >
              {getCategoryDisplayName(category)}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {displayedSkills.map((skill, key) => (
            <motion.div
              key={key}
              className={`relative bg-card/80 backdrop-blur-md p-6 rounded-2xl shadow-lg overflow-hidden group cursor-pointer border border-border/50 ${tappedIdx === key ? 'scale-105 shadow-[0_4px_32px_0_rgba(220,38,38,0.15)]' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: key * 0.1, ease: 'easeOut' }}
              whileHover={{ scale: 1.03, boxShadow: "0 4px 32px 0 rgba(220, 38, 38, 0.15)", transition: { duration: 0.25, ease: 'easeOut' } }}
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
              
              {/* Skill level indicator */}
              <div className="text-right mt-2">
                <span className="text-sm font-medium text-primary">{skill.level}%</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Show More/Less Button */}
        {hasMoreSkills && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <button
              onClick={() => setShowAllSkills(!showAllSkills)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/30 transition-all duration-300 font-medium group"
            >
              {showAllSkills ? (
                <>
                  Show Less
                  <ChevronUp className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                </>
              ) : (
                <>
                  Show More {getCategoryDisplayName(activeCategory)} Skills
                  <ChevronDown className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Skills Count Indicator */}
        <motion.div
          className="text-center mt-6 text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
        </motion.div>
      </div>
    </section>
  );
};
