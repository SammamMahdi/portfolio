import { motion } from "framer-motion";
import { Briefcase, Book, Bot } from "lucide-react";
const experiences = [
  {
    icon: <Bot className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />,
    title: "Research Projects",
    extra: "",
    description: <span>Involved in research projects in <span className="text-primary">Machine Learning, Artificial Intelligence, and Computer Vision</span></span>
  },
  {
    icon: <Briefcase className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />,
    title: "Student Tutor / Teaching Assistant",
    extra: " — from Spring 2025",
    description: <span>at <span className="text-primary">BRAC University&apos;s CSE Department</span></span>
  },
  {
    icon: <Book className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />,
    title: "Teacher",
    extra: " — 3 years&apos; experience",
    description: <span>as a teacher for <span className="text-primary">O-Level and A-Level students</span>.</span>
  },
  
  
];

export const WorkExperienceSection = () => (
  <section id="work-experience" className="py-24 px-4 relative bg-secondary/30">
    <div className="container mx-auto max-w-5xl">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        Work Experience
      </h2>
      <div className="space-y-10">
        {experiences.map((exp, idx) => (
          <motion.div
            key={idx}
            className="relative flex flex-col md:flex-row items-center bg-card/80 backdrop-blur-md p-4 sm:p-8 rounded-2xl shadow-lg overflow-hidden group cursor-pointer"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
            whileHover={{ scale: 1.04, boxShadow: '0 4px 32px 0 rgba(220, 38, 38, 0.18)' }}
          >
            {/* Neon circling border on hover, animates once per hover */}
            <span
              className="pointer-events-none absolute inset-0 rounded-2xl border-4 border-primary z-20 opacity-0 group-hover:opacity-100 group-hover:animate-neon-spin-once"
              style={{
                boxShadow: '0 0 24px 6px rgba(220,38,38,0.7), 0 0 60px 10px rgba(220,38,38,0.3)',
                borderColor: 'rgba(220,38,38,0.85)',
                borderTopColor: 'rgba(220,38,38,1)',
                borderRightColor: 'rgba(220,38,38,0.5)',
                borderBottomColor: 'rgba(220,38,38,0.2)',
                borderLeftColor: 'rgba(220,38,38,0.5)',
              }}
            />
            <span className="absolute left-0 top-4 md:top-6 bottom-4 md:bottom-6 w-1 rounded-full bg-primary group-hover:scale-y-110 transition-transform duration-300" />
            <span className="mb-4 md:mb-0 md:ml-4 md:mr-8 z-10 select-none flex-shrink-0">
              <span className="transition-all duration-200 group-hover:drop-shadow-[0_0_16px_rgba(220,38,38,0.95)]">
                {exp.icon}
              </span>
            </span>
            <div className="flex-1 w-full text-center md:text-left overflow-hidden">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-foreground break-words">
                {exp.title}
                {exp.extra && <span className="text-primary font-bold">{exp.extra}</span>}
              </h3>
              {exp.description && (
                <p className="text-base sm:text-lg text-muted-foreground mt-2 break-words">{exp.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
    {/* Neon Beam Animation */}
    <style>{`
      @keyframes neon-spin-once {
        0% { transform: rotate(0deg); opacity: 1; }
        90% { opacity: 1; }
        100% { transform: rotate(360deg); opacity: 0; }
      }
      .animate-neon-spin-once {
        animation: neon-spin-once 1.2s cubic-bezier(0.7,0.2,0.2,1) 1;
      }
    `}</style>
  </section>
); 