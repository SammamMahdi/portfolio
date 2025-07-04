import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
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
];

const categories = [
  "programming-languages",
  "ml-ai",
  "computer-vision",
  "robotics",
  "research"
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
              {category === "programming-languages" ? "Programming Languages" :
               category === "ml-ai" ? "Machine Learning & AI" :
               category === "computer-vision" ? "Computer Vision" :
               category === "robotics" ? "Robotics" :
               category === "research" ? "Research" :
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
