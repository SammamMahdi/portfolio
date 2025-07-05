import { motion } from "framer-motion";
import { GraduationCap, Calendar, Building2, Award } from "lucide-react";
import { useState, useEffect } from "react";

const education = [
  {
    icon: <GraduationCap className="w-8 h-8" />,
    degree: "B.Sc. in Computer Science",
    institution: "BRAC University",
    duration: "2022 onwards",
    status: "In Progress"
  },
  {
    icon: <GraduationCap className="w-8 h-8" />,
    degree: "International A-Level",
    institution: "Academia (Edexcel)",
    duration: "2019–2021",
    status: "Completed"
  },
  {
    icon: <GraduationCap className="w-8 h-8" />,
    degree: "International GCSE",
    institution: "Academia (Edexcel)",
    duration: "2018–2019",
    status: "Completed"
  },
];

export const EducationSection = () => {
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
    <section id="education" className="py-24 px-4 relative bg-gradient-to-br from-background/80 via-secondary/10 to-background/80">
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
            Education
          </h2>
        </motion.div>

        <div className="space-y-8">
          {education.map((edu, idx) => (
            <motion.div
              key={idx}
              className={`relative flex flex-col lg:flex-row items-start bg-card/90 backdrop-blur-md p-6 lg:p-8 rounded-3xl shadow-xl overflow-hidden group cursor-pointer border border-primary/10 ${tappedIdx === idx ? 'scale-105 shadow-[0_8px_40px_0_rgba(220,38,38,0.25)]' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 40px 0 rgba(220, 38, 38, 0.25)' }}
              {...(isTouchDevice ? {
                onTouchStart: e => { e.stopPropagation(); setTappedIdx(tappedIdx === idx ? null : idx); },
                onClick: e => { if (tappedIdx !== idx) { e.preventDefault(); setTappedIdx(idx); } else { setTappedIdx(null); } }
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
              
              {/* Status badge */}
              <div className="absolute top-6 right-6 z-30">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${edu.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/30' : 'bg-green-500/20 text-green-600 border border-green-500/30'}`}>
                  <Award className="w-3 h-3 mr-1" />
                  {edu.status}
                </span>
              </div>


              {/* Icon */}
              <div className="mb-6 lg:mb-0 lg:mr-8 z-10 select-none flex-shrink-0">
                <div className={`p-4 rounded-2xl bg-primary/10 border border-primary/20 transition-all duration-200 ${tappedIdx === idx ? 'drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]' : 'group-hover:drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]'}`}>
                  <span className={`text-primary transition-all duration-200 ${tappedIdx === idx ? 'drop-shadow-[0_0_20px_rgba(220,38,38,1)]' : 'group-hover:drop-shadow-[0_0_20px_rgba(220,38,38,1)]'}`}>{edu.icon}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 w-full text-center lg:text-left overflow-hidden">
                <h3 className="text-xl lg:text-2xl font-bold mb-4 text-foreground break-words leading-tight">
                  {edu.degree}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="w-4 h-4 text-primary/70" />
                    <span className="font-medium">{edu.institution}</span>
                  </div>
                  
                  {edu.duration && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary/70" />
                      <span>{edu.duration}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}; 