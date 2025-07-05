import { motion } from "framer-motion";
import { Trophy, Calendar, Star } from "lucide-react";
import { useState, useEffect } from "react";

const awards = [
  { 
    icon: <Trophy className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />, 
    title: "Duke of Edinburgh Award", 
    extra: " (Bronze)",
    type: "Achievement",
    year: "2023"
  },
  { 
    icon: <Trophy className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />, 
    title: "HULT Prize Semi-Finalist", 
    extra: " at BRAC University",
    type: "Competition",
    year: "2023"
  },
  { 
    icon: <Trophy className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />, 
    title: "Edexcel High Achievers' Awards",
    type: "Academic",
    year: "2022"
  },
  { 
    icon: <Trophy className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />, 
    title: "Daily Star Awards",
    type: "Recognition",
    year: "2019 & 2022"
  },
  { 
    icon: <Trophy className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />, 
    title: "Academia High Achievers' Award",
    type: "Academic",
    year: "2019 & 2022"
  },
];

export const AwardsSection = () => {
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
    const isAcademic = type === 'Academic';
    const isCompetition = type === 'Competition';
    const isAchievement = type === 'Achievement';
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
        isAcademic 
          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
          : isCompetition
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          : isAchievement
          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      }`}>
        {isAcademic ? <Star className="w-3 h-3 mr-1" /> : <Trophy className="w-3 h-3 mr-1" />}
        {type}
      </div>
    );
  };

  return (
    <section id="awards" className="py-24 px-4 relative bg-gradient-to-br from-background/80 via-secondary/10 to-background/80">
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
            Awards & Achievements
          </h2>
        </motion.div>
        <div className="space-y-8">
          {awards.map((award, idx) => (
            <motion.div
              key={idx}
              className={`relative flex flex-col lg:flex-row items-start bg-card/50 backdrop-blur-md p-6 lg:p-8 rounded-3xl shadow-xl overflow-hidden group cursor-pointer border border-primary/10 ${tappedIdx === idx ? 'scale-105 shadow-[0_8px_40px_0_rgba(220,38,38,0.25)]' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
              whileHover={{ scale: 1.03, boxShadow: '0 8px 40px 0 rgba(220, 38, 38, 0.25)', transition: { duration: 0.25, ease: 'easeOut' } }}
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
              
              {/* Award type badge */}
              <div className="absolute top-6 right-6 z-30">
                {getTypeBadge(award.type)}
              </div>

              {/* Year badge */}
              {award.year && (
                <div className="absolute top-6 left-6 z-30">
                  <div className="inline-flex items-center px-2 py-1 rounded-lg bg-primary/20 text-primary text-xs font-medium border border-primary/30">
                    <Calendar className="w-3 h-3 mr-1" />
                    {award.year}
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className="mb-6 lg:mb-0 lg:mr-8 z-10 select-none flex-shrink-0">
                <div className={`p-4 rounded-2xl bg-primary/10 border border-primary/20 transition-all duration-200 ${tappedIdx === idx ? 'drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]' : 'group-hover:drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]'}`}>
                  <span className={`transition-all duration-200 ${tappedIdx === idx ? 'drop-shadow-[0_0_20px_rgba(220,38,38,1)]' : 'group-hover:drop-shadow-[0_0_20px_rgba(220,38,38,1)]'}`}>{award.icon}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 w-full text-center lg:text-left overflow-hidden">
                <h3 className="text-xl lg:text-2xl font-bold mb-4 text-foreground break-words leading-tight">
                  {award.title}
                  {award.extra && <span className="text-primary font-bold">{award.extra}</span>}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}; 