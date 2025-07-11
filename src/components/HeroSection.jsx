import { ArrowDown } from "lucide-react";
import profileImg from "../assets/profile.jpg";
import { motion } from "framer-motion";

export const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
    >
      <div className="container max-w-4xl mx-auto flex flex-col items-center justify-center min-h-screen text-center z-10">
        <div className="space-y-6 flex flex-col items-center flex-1 justify-center">
          {/* Profile Image with Neon Beam */}
          <div className="relative flex items-center justify-center mb-4">
            {/* Neon Beam */}
            <span
              className="absolute w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-primary animate-spin-slow pointer-events-none"
              style={{
                boxShadow: '0 0 24px 6px rgba(220,38,38,0.7), 0 0 60px 10px rgba(220,38,38,0.3)',
                borderColor: 'rgba(220,38,38,0.85)',
                borderTopColor: 'rgba(220,38,38,1)',
                borderRightColor: 'rgba(220,38,38,0.5)',
                borderBottomColor: 'rgba(220,38,38,0.2)',
                borderLeftColor: 'rgba(220,38,38,0.5)',
              }}
            />
            <motion.img
              src={profileImg}
              alt="Sammam Mahdi profile"
              className="mx-auto w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary shadow-lg object-cover bg-background relative z-10"
              style={{ boxShadow: '0 0 0 6px rgba(220,38,38,0.15)' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="opacity-0 animate-fade-in"> Hi, I&apos;m</span>
            <span
              className="text-primary neon-glow"
            >
              {" Sammam Mahdi"}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in-delay-3">
            Driven Computer Science student passionate about coding and innovation. Experienced in Machine Learning, Artificial Intelligence, and hands-on research. Always building, always learning, always pushing boundaries.
          </p>

          <div className="pt-4 opacity-0 animate-fade-in-delay-4 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#projects" className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black/60 backdrop-blur text-primary font-bold text-lg shadow-lg border border-white/10 hover:bg-black/80 neon-glow transition-all duration-300 transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary">
              View My Work
            </a>
            <a
              href="/sammamcv.pdf"
              download
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black/60 backdrop-blur text-primary font-bold text-lg shadow-lg border border-white/10 hover:bg-black/80 neon-glow transition-all duration-300 transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary"
            >
              Download CV
            </a>
        </div>
        <div className="mt-10 flex flex-col items-center animate-bounce">
          <span className="text-sm text-muted-foreground mb-2"> Scroll </span>
          <span className="relative flex items-center justify-center">
            <span className="absolute w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-lg animate-pulse" />
            <ArrowDown className="h-5 w-5 text-primary relative z-10" />
          </span>
          </div>
        </div>
      </div>
      {/* Neon Beam Animation */}
      <style>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3.5s linear infinite;
        }
        /* Always keep the black hole left and vertically centered, even on mobile */
        #hero .absolute.z-0 {
          left: 0 !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          width: 128px !important;
          height: 128px !important;
          opacity: 0.7 !important;
        }
      `}</style>
    </section>
  );
};
