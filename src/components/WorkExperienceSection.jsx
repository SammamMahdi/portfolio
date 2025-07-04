import { motion } from "framer-motion";
import { Briefcase, Book, Bot, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
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
    extra: " — 3 years of experience",
    description: <span>as a teacher for <span className="text-primary">O-Level and A-Level students</span>.</span>
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
    link: "https://www.bracu-mongoltori.com/about"
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
  return (
    <section id="work-experience" className="py-24 px-4 relative bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          Work Experience
        </h2>
        <div className="space-y-10">
          {experiences.map((exp, idx) => (
            <motion.div
              key={idx}
              className={`relative flex flex-col md:flex-row items-center md:items-start bg-card/80 backdrop-blur-md p-4 sm:p-8 rounded-2xl shadow-lg overflow-hidden group cursor-pointer ${tappedIdx === idx ? 'scale-105 shadow-[0_4px_32px_0_rgba(220,38,38,0.18)]' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
              whileHover={{ scale: 1.04, boxShadow: '0 4px 32px 0 rgba(220, 38, 38, 0.18)' }}
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
              {/* Neon circling border on hover, animates once per hover */}
              <span
                className={`pointer-events-none absolute inset-0 rounded-2xl border-4 border-primary z-20 opacity-0 transition-all duration-300 ${tappedIdx === idx ? 'opacity-100' : 'group-hover:opacity-100'}`}
                style={{
                  boxShadow: '0 0 24px 6px rgba(220,38,38,0.7), 0 0 60px 10px rgba(220,38,38,0.3)',
                  borderColor: 'rgba(220,38,38,0.85)',
                  borderTopColor: 'rgba(220,38,38,1)',
                  borderRightColor: 'rgba(220,38,38,0.5)',
                  borderBottomColor: 'rgba(220,38,38,0.2)',
                  borderLeftColor: 'rgba(220,38,38,0.5)',
                }}
              />
              <span className={`absolute left-0 top-4 md:top-6 bottom-4 md:bottom-6 w-1 rounded-full bg-primary transition-transform duration-300 ${tappedIdx === idx ? 'scale-y-110' : 'group-hover:scale-y-110'}`} />
              {/* External link icon for BRACU Mongol Tori */}
              {exp.title === 'BRACU Mongol Tori' && exp.link && (
                <a
                  href={exp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="md:absolute md:top-4 md:right-4 md:top-6 md:right-6 z-30 text-primary hover:drop-shadow-[0_0_10px_rgba(220,38,38,0.7)] transition-all duration-200 self-end mb-2 md:mb-0"
                  title="About BRACU Mongol Tori"
                  onClick={e => e.stopPropagation()}
                >
                  <ExternalLink size={28} />
                </a>
              )}
              <span className="mb-2 md:mb-0 md:ml-4 md:mr-8 z-10 select-none flex-shrink-0 flex justify-center w-full md:w-auto">
                <span className={`transition-all duration-200 ${tappedIdx === idx ? 'drop-shadow-[0_0_16px_rgba(220,38,38,0.95)]' : 'group-hover:drop-shadow-[0_0_16px_rgba(220,38,38,0.95)]'}`}>{exp.icon}</span>
              </span>
              <div className="flex-1 w-full flex flex-col items-center md:items-start text-center md:text-left overflow-hidden">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-foreground break-words flex flex-col md:flex-row items-center gap-1 md:gap-2 w-full justify-center md:justify-start">
                  <span>{exp.title}</span>
                  {exp.extra && <span className="text-primary font-bold">{exp.extra}</span>}
                </h3>
                {exp.description && (
                  <p className="text-base sm:text-lg text-muted-foreground mt-2 break-words w-full max-w-2xl">
                    {exp.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}; 