import { motion } from "framer-motion";
import { Briefcase, Book, Bot, ExternalLink, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

const experiences = [
  {
    icon: <Bot className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />,
    title: "Research Projects",
    extra: "",
    description: <span>Involved in research projects in <span className="text-primary">Machine Learning, Artificial Intelligence, and Computer Vision</span></span>,
    type: "Research",
    duration: "Ongoing"
  },
  {
    icon: <Briefcase className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />,
    title: "Student Tutor / Teaching Assistant",
    extra: " — from Spring 2025",
    description: (
      <span>
        at <span className="text-primary">BRAC University&apos;s CSE Department</span>.<br />
        Responsibilities include helping students in courses related to <span className="text-primary">Data Structure and Algorithms</span>, assisting them to write correct code, grading quizzes and assignments, providing consultation, and making sure they understand the topics thoroughly.
      </span>
    ),
    type: "Teaching",
    duration: "Ongoing"
  },
  {
    icon: <Book className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />,
    title: "Teacher",
    extra: " — 3 years of experience",
    description: <span>as a teacher for <span className="text-primary">O-Level and A-Level students</span>.</span>,
    type: "Teaching",
    duration: "3 Years"
  },
  // BRACU Mongol Tori merged entry
  {
    icon: <Bot className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />,
    title: "BRACU Mongol Tori",
    extra: " — Control, AI & Autonomous Systems",
    description: <span>
      Member of the <span className="text-primary">Control, AI, and Autonomous Systems</span> teams for BRACU Mongol Tori.<br />
      Contributed to the design and implementation of <span className="text-primary">control systems</span>, developed <span className="text-primary">AI and computer vision</span> modules for autonomous navigation and perception, and worked on <span className="text-primary">autonomous systems</span> for the Mars rover project.
    </span>,
    link: "https://www.bracu-mongoltori.com/about",
    type: "Research",
    duration: "2023 - 2025"
  },
];

export const WorkExperienceSection = () => {
  const [tappedIdx, setTappedIdx] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  useEffect(() => {
    setIsTouchDevice(
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || window.matchMedia('(pointer: coarse)').matches)
    );
    if (!isTouchDevice) setTappedIdx(null);
  }, [isTouchDevice]);
  
  useEffect(() => {
    if (!isTouchDevice) return;
    const handleTouch = () => setTappedIdx(null);
    window.addEventListener('touchstart', handleTouch);
    return () => window.removeEventListener('touchstart', handleTouch);
  }, [isTouchDevice]);

  const getTypeBadge = (type) => {
    const isResearch = type === 'Research';
    const isTeaching = type === 'Teaching';
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
        isResearch 
          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
          : isTeaching
          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      }`}>
        {isResearch ? <Bot className="w-3 h-3 mr-1" /> : <Book className="w-3 h-3 mr-1" />}
        {type}
      </div>
    );
  };

  return (
    <section id="work-experience" className="py-24 px-4 relative bg-gradient-to-br from-background/80 via-secondary/10 to-background/80">
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
            Work Experience
          </h2>
        </motion.div>
        <div className="space-y-8">
          {experiences.map((exp, idx) => (
            <motion.div
              key={idx}
              className={`relative flex flex-col lg:flex-row items-start bg-card/40 backdrop-blur-md p-6 lg:p-8 rounded-3xl shadow-xl overflow-hidden group cursor-pointer border border-primary/10 ${tappedIdx === idx ? 'scale-105 shadow-[0_8px_40px_0_rgba(220,38,38,0.25)]' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 40px 0 rgba(220, 38, 38, 0.25)' }}
              {...(isTouchDevice ? {
                onTouchStart: e => { e.stopPropagation(); setTappedIdx(tappedIdx === idx ? null : idx); },
                onClick: e => { if (tappedIdx !== idx) { e.preventDefault(); setTappedIdx(idx); } else { setTappedIdx(null); } },
                onClickCapture: exp.title === 'Research Projects' ? () => {
                  const el = document.getElementById('publications');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                } : undefined
              } : exp.title === 'Research Projects' ? {
                onClickCapture: () => {
                  const el = document.getElementById('publications');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              } : {})}
            >
              {/* Enhanced neon border */}
              <span
                className={`pointer-events-none absolute inset-0 rounded-3xl border-2 border-primary z-20 opacity-0 transition-all duration-300 ${tappedIdx === idx ? 'opacity-100' : 'group-hover:opacity-100'}`}
                style={{
                  boxShadow: '0 0 30px 8px rgba(220,38,38,0.6), 0 0 80px 15px rgba(220,38,38,0.3)',
                  borderColor: 'rgba(220,38,38,0.9)',
                }}
              />
              
              {/* Enhanced accent bar */}
              <span className={`absolute left-0 top-6 bottom-6 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary/60 transition-transform duration-300 ${tappedIdx === idx ? 'scale-y-110' : 'group-hover:scale-y-110'}`} />
              
              {/* Experience type badge */}
              <div className="absolute top-6 right-6 z-30">
                {getTypeBadge(exp.type)}
              </div>

              {/* Duration badge */}
              <div className="absolute top-6 left-6 z-30">
                <div className="inline-flex items-center px-2 py-1 rounded-lg bg-primary/20 text-primary text-xs font-medium border border-primary/30">
                  <Calendar className="w-3 h-3 mr-1" />
                  {exp.duration}
                </div>
              </div>

              {/* External link icon for BRACU Mongol Tori */}
              {exp.title === 'BRACU Mongol Tori' && exp.link && (
                <a
                  href={exp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-6 right-6 z-30 text-primary hover:text-primary/80 hover:drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] transition-all duration-200"
                  title="About BRACU Mongol Tori"
                  onClick={e => e.stopPropagation()}
                >
                  <ExternalLink size={24} />
                </a>
              )}

              {/* Icon */}
              <div className="mb-6 lg:mb-0 lg:mr-8 z-10 select-none flex-shrink-0">
                <div className={`p-4 rounded-2xl bg-primary/10 border border-primary/20 transition-all duration-200 ${tappedIdx === idx ? 'drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]' : 'group-hover:drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]'}`}>
                  <span className={`transition-all duration-200 ${tappedIdx === idx ? 'drop-shadow-[0_0_20px_rgba(220,38,38,1)]' : 'group-hover:drop-shadow-[0_0_20px_rgba(220,38,38,1)]'}`}>{exp.icon}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 w-full text-center lg:text-left overflow-hidden">
                <h3 className="text-xl lg:text-2xl font-bold mb-4 text-foreground break-words leading-tight">
                  {exp.title}
                  {exp.extra && <span className="text-primary font-bold">{exp.extra}</span>}
                </h3>
                
                {exp.description && (
                  <div className="space-y-3">
                    <p className="text-base lg:text-lg text-muted-foreground break-words leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}; 