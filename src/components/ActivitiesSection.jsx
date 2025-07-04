import { motion } from "framer-motion";
import { Calculator, Rocket, Puzzle, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

const activities = [
  {
    icon: <Calculator className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />,
    title: 'National Mathematical Olympiad',
    description: 'Participant in the ',
    highlight: 'National Mathematical Olympiad',
  },
  {
    icon: <Rocket className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />,
    title: 'University Rover Challenge',
    description: 'Participated in the ',
    highlight: 'University Rover Challenge',
    link: 'https://urc.marssociety.org/'
  },
  {
    icon: <Puzzle className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />,
    title: 'Speed Cubing',
    description: 'Hobby: ',
    highlight: 'Speed Cubing',
  },
  {
    icon: <Puzzle className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />,
    title: 'Speed Cubing',
    description: 'Hobby: ',
    highlight: 'Speed Cubing',
  },
  {
    icon: <Rocket className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />,
    title: 'Robotics Competitions',
    description: 'Participated in several robotics competitions such as ',
    highlight: 'Soccerbot, Battlebot',
  },
  {
    icon: <Calculator className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />,
    title: 'Programming Contests',
    description: 'Participated in multiple ',
    highlight: 'programming contests',
  },
];

export const ActivitiesSection = () => {
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
    <section id="activities" className="py-24 px-4 relative bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          Activities
        </h2>
        <div className="space-y-10">
          {activities.map((activity, idx) => (
            <motion.div
              key={idx}
              className={`relative flex flex-col md:flex-row items-center bg-card/80 backdrop-blur-md p-4 sm:p-8 rounded-2xl shadow-lg overflow-hidden group cursor-pointer ${tappedIdx === idx ? 'scale-105 shadow-[0_4px_32px_0_rgba(220,38,38,0.18)]' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
              whileHover={{ scale: 1.04, boxShadow: '0 4px 32px 0 rgba(220, 38, 38, 0.18)' }}
              {...(isTouchDevice ? {
                onTouchStart: e => { e.stopPropagation(); setTappedIdx(tappedIdx === idx ? null : idx); },
                onClick: e => { if (tappedIdx !== idx) { e.preventDefault(); setTappedIdx(idx); } else { setTappedIdx(null); } }
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
              {/* Red accent bar */}
              <span className={`absolute left-0 top-4 md:top-6 bottom-4 md:bottom-6 w-1 rounded-full bg-primary transition-transform duration-300 ${tappedIdx === idx ? 'scale-y-110' : 'group-hover:scale-y-110'}`} />
              {/* External link icon for University Rover Challenge */}
              {activity.title === 'University Rover Challenge' && activity.link && (
                <a
                  href={activity.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 md:top-6 md:right-6 z-30 text-primary hover:drop-shadow-[0_0_10px_rgba(220,38,38,0.7)] transition-all duration-200"
                  title="About University Rover Challenge"
                  onClick={e => e.stopPropagation()}
                >
                  <ExternalLink size={28} />
                </a>
              )}
              {/* Monotone Neon Icon */}
              <span className="mb-4 md:mb-0 md:mr-6 z-10 select-none flex-shrink-0">
                <span className={`transition-all duration-200 ${tappedIdx === idx ? 'drop-shadow-[0_0_16px_rgba(220,38,38,0.95)]' : 'group-hover:drop-shadow-[0_0_16px_rgba(220,38,38,0.95)]'}`}>{activity.icon}</span>
              </span>
              <div className="flex-1 w-full text-center md:text-left overflow-hidden">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-foreground break-words">
                  {activity.title}
                </h3>
                <p className="text-base sm:text-lg text-muted-foreground break-words">
                  {activity.description}
                  <span className="text-primary font-semibold">{activity.highlight}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}; 