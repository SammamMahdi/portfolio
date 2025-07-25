import { motion } from "framer-motion";

// Neutron star animation component
const NeutronStarAnimation = () => {
  // Plasma beam animation interval
  return (
    <div className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40">
      {/* Star core */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: '40%', height: '40%', background: 'radial-gradient(circle, #3cf 70%, #09f 100%)', zIndex: 2, boxShadow: '0 0 32px 8px #3cf8, 0 0 80px 20px #09f8' }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Rotating halo */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '100%', height: '100%',
          border: '6px solid #3cf',
          borderTop: '6px solid #fff',
          borderBottom: '6px solid #09f',
          boxShadow: '0 0 40px 10px #3cf8',
          opacity: 0.7,
          zIndex: 1,
        }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
      />
      {/* Plasma beams (animated in interval) */}
      {[0, 1].map((beam, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2"
          style={{
            width: '8px',
            height: '80%',
            background: 'linear-gradient(180deg, #fff 0%, #3cf 60%, transparent 100%)',
            borderRadius: '8px',
            transform: `translate(-50%, -50%) rotate(${i === 0 ? 25 : -25}deg)`,
            zIndex: 0,
            opacity: 0.7,
            filter: 'blur(1px)',
          }}
          animate={{
            scaleY: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            repeatDelay: 0.7 + i * 0.5,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* Extra glow */}
      <div className="absolute rounded-full w-full h-full" style={{boxShadow: '0 0 60px 20px #3cf4, 0 0 100px 40px #09f2', zIndex: 0}} />
    </div>
  );
};

export default function NotFound() {
  return <div style={{ color: '#fff', textAlign: 'center', marginTop: '4rem' }}>Page Not Found</div>;
}
