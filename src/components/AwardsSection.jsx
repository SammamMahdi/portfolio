import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
const awards = [
  { icon: <Trophy className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />, title: "Daily Star Awards" },
  { icon: <Trophy className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />, title: "Duke of Edinburgh Award", extra: " (Bronze)" },
  { icon: <Trophy className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />, title: "Academia High Achievers' Award" },
  { icon: <Trophy className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />, title: "HULT Prize Semi-Finalist", extra: " at BRAC University" },
  { icon: <Trophy className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.7)]" />, title: "Edexcel High Achievers' Awards" },
];

export const AwardsSection = () => (
  <section id="awards" className="py-24 px-4 relative">
    <div className="container mx-auto max-w-5xl">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        Awards & Achievements
      </h2>
      <div className="space-y-10">
        {awards.map((award, idx) => (
          <motion.div
            key={idx}
            className="relative flex items-center bg-card/80 backdrop-blur-md p-8 rounded-2xl shadow-lg overflow-hidden group cursor-pointer"
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
            <span className="absolute left-0 top-6 bottom-6 w-1 rounded-full bg-primary group-hover:scale-y-110 transition-transform duration-300" />
            <span className="mr-6 z-10 select-none">
              <span className="transition-all duration-200 group-hover:drop-shadow-[0_0_16px_rgba(220,38,38,0.95)]">
                {award.icon}
              </span>
            </span>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2 text-primary">
                {award.title}
                {award.extra && <span className="text-primary font-bold">{award.extra}</span>}
              </h3>
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