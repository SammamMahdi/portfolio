import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export const AnimatedRobot = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [walkDirection, setWalkDirection] = useState(1);
  const [isClicked, setIsClicked] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFixing(prev => !prev);
    }, 3000);

    const walkInterval = setInterval(() => {
      setWalkDirection(prev => prev === 1 ? -1 : 1);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(walkInterval);
    };
  }, []);

  const handleRobotClick = () => {
    setIsClicked(true);
    setClickCount(prev => prev + 1);
    
    // Hide speech bubble after 3 clicks
    if (clickCount >= 2) {
      setShowSpeechBubble(false);
    }
    
    // Reset after animation
    setTimeout(() => {
      setIsClicked(false);
    }, 3000);
  };

  const getSpeechText = () => {
    switch (clickCount) {
      case 0:
        return "Welcome to Sir Sammam's page! Would you like me to do something fun? Please tap on me for some entertainment!";
      case 1:
        return "I can show you other cool stuff too! Let's have some more fun together!";
      case 2:
        return "Here's another awesome animation! I hope you're enjoying the show!";
      default:
        return "";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 pr-6 pointer-events-auto z-10 w-24 flex justify-end">
      {/* Speech Bubble */}
      {showSpeechBubble && (
        <motion.div
          className="absolute bottom-full right-0 mb-4 bg-card/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-xl max-w-56 border border-primary/30"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            boxShadow: "0 8px 32px rgba(220, 38, 38, 0.15), 0 4px 16px rgba(220, 38, 38, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
          }}
        >
          <div className="text-sm font-medium text-foreground leading-relaxed">
            {getSpeechText()}
          </div>
          {/* Speech bubble arrow */}
          <div className="absolute top-full right-6 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent" 
               style={{ borderTopColor: 'rgba(220, 38, 38, 0.3)' }}></div>
        </motion.div>
      )}

      <motion.div
        className="relative cursor-pointer"
        animate={{
          x: walkDirection * 6,
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse"
        }}
        onClick={handleRobotClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ maxWidth: 64 }}
      >
        {/* Robot Body */}
        <motion.div
          className="w-12 h-16 bg-gray-800 rounded-lg relative"
          style={{
            boxShadow: "0 0 15px rgba(220, 38, 38, 0.8), inset 0 0 15px rgba(220, 38, 38, 0.3)"
          }}
          animate={{
            boxShadow: [
              "0 0 15px rgba(220, 38, 38, 0.8), inset 0 0 15px rgba(220, 38, 38, 0.3)",
              "0 0 25px rgba(220, 38, 38, 1), inset 0 0 25px rgba(220, 38, 38, 0.5)",
              "0 0 15px rgba(220, 38, 38, 0.8), inset 0 0 15px rgba(220, 38, 38, 0.3)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Robot Head */}
          <motion.div
            className="w-8 h-8 bg-gray-700 rounded-full mx-auto -mt-1 relative"
            style={{
              boxShadow: "0 0 10px rgba(220, 38, 38, 0.6)"
            }}
            animate={{
              rotate: isClicked ? (clickCount === 1 ? [0, 720, 0] : [0, 360, 0]) : [0, 5, 0, -5, 0]
            }}
            transition={{
              duration: isClicked ? (clickCount === 1 ? 1 : 0.5) : 3,
              repeat: isClicked ? 0 : Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Eyes */}
            <div className="flex justify-center space-x-1 pt-2">
              <motion.div
                className="w-1 h-1 bg-red-500 rounded-full"
                animate={{
                  scale: isClicked ? (clickCount === 2 ? [1, 3, 1] : [1, 2, 1]) : [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: isClicked ? (clickCount === 2 ? 0.5 : 0.3) : 1.5,
                  repeat: isClicked ? (clickCount === 2 ? 5 : 3) : Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  boxShadow: "0 0 5px rgba(220, 38, 38, 0.8)"
                }}
              />
              <motion.div
                className="w-1 h-1 bg-red-500 rounded-full"
                animate={{
                  scale: isClicked ? (clickCount === 2 ? [1, 3, 1] : [1, 2, 1]) : [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: isClicked ? (clickCount === 2 ? 0.5 : 0.3) : 1.5,
                  repeat: isClicked ? (clickCount === 2 ? 5 : 3) : Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                style={{
                  boxShadow: "0 0 5px rgba(220, 38, 38, 0.8)"
                }}
              />
            </div>
          </motion.div>

          {/* Robot Arms */}
          <div className="flex justify-between px-1 mt-1">
            {/* Left Arm */}
            <motion.div
              className="w-2 h-6 bg-gray-700 rounded-full relative"
              style={{
                boxShadow: "0 0 8px rgba(220, 38, 38, 0.5)"
              }}
              animate={{
                rotate: isClicked ? 
                  (clickCount === 1 ? [0, -90, 0, 90, 0] : 
                   clickCount === 2 ? [0, -180, 0] : 
                   [0, -45, 0, 45, 0]) : 
                  (isFixing ? [0, -30, 0] : [0, 10, 0])
              }}
              transition={{
                duration: isClicked ? (clickCount === 2 ? 0.8 : 0.5) : 1,
                repeat: isClicked ? (clickCount === 2 ? 2 : 3) : Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Tool in hand */}
              {isFixing && (
                <motion.div
                  className="w-1 h-3 bg-yellow-400 rounded-sm absolute -bottom-1 -left-1"
                  style={{
                    boxShadow: "0 0 5px rgba(255, 255, 0, 0.6)"
                  }}
                  animate={{
                    rotate: [0, 90, 0]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              )}
            </motion.div>

            {/* Right Arm */}
            <motion.div
              className="w-2 h-6 bg-gray-700 rounded-full relative"
              style={{
                boxShadow: "0 0 8px rgba(220, 38, 38, 0.5)"
              }}
              animate={{
                rotate: isClicked ? 
                  (clickCount === 1 ? [0, 90, 0, -90, 0] : 
                   clickCount === 2 ? [0, 180, 0] : 
                   [0, 45, 0, -45, 0]) : 
                  (isFixing ? [0, 30, 0] : [0, -10, 0])
              }}
              transition={{
                duration: isClicked ? (clickCount === 2 ? 0.8 : 0.5) : 1,
                repeat: isClicked ? (clickCount === 2 ? 2 : 3) : Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              {/* Screwdriver in hand */}
              {isFixing && (
                <motion.div
                  className="w-1 h-4 bg-blue-400 rounded-sm absolute -bottom-1 -right-1"
                  style={{
                    boxShadow: "0 0 5px rgba(59, 130, 246, 0.6)"
                  }}
                  animate={{
                    rotate: [0, -90, 0]
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              )}
            </motion.div>
          </div>

          {/* Robot Legs */}
          <div className="flex justify-center space-x-1 mt-1">
            <motion.div
              className="w-3 h-4 bg-gray-700 rounded-full"
              style={{
                boxShadow: "0 0 6px rgba(220, 38, 38, 0.4)"
              }}
              animate={{
                y: isClicked ? 
                  (clickCount === 1 ? [0, -12, 0] : 
                   clickCount === 2 ? [0, -15, 0, -5, 0] : 
                   [0, -8, 0]) : 
                  [0, -3, 0]
              }}
              transition={{
                duration: isClicked ? (clickCount === 2 ? 0.6 : 0.3) : 1,
                repeat: isClicked ? (clickCount === 2 ? 3 : 3) : Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="w-3 h-4 bg-gray-700 rounded-full"
              style={{
                boxShadow: "0 0 6px rgba(220, 38, 38, 0.4)"
              }}
              animate={{
                y: isClicked ? 
                  (clickCount === 1 ? [0, -12, 0] : 
                   clickCount === 2 ? [0, -15, 0, -5, 0] : 
                   [0, -8, 0]) : 
                  [0, -3, 0]
              }}
              transition={{
                duration: isClicked ? (clickCount === 2 ? 0.6 : 0.3) : 1,
                repeat: isClicked ? (clickCount === 2 ? 3 : 3) : Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
          </div>

          {/* Antenna */}
          <motion.div
            className="w-1 h-3 bg-gray-600 mx-auto mt-1 relative"
            style={{
              boxShadow: "0 0 4px rgba(220, 38, 38, 0.3)"
            }}
          >
            <motion.div
              className="w-1 h-1 bg-red-500 rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2"
              animate={{
                scale: isClicked ? (clickCount === 2 ? [1, 3, 1] : [1, 2, 1]) : [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: isClicked ? (clickCount === 2 ? 0.5 : 0.3) : 2,
                repeat: isClicked ? (clickCount === 2 ? 5 : 3) : Infinity,
                ease: "easeInOut"
              }}
              style={{
                boxShadow: "0 0 8px rgba(220, 38, 38, 0.8)"
              }}
            />
          </motion.div>
        </motion.div>

        {/* Fixing Animation - Sparks */}
        {isFixing && (
          <div className="absolute -top-3 -right-3">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-yellow-400 rounded-full absolute"
                style={{
                  boxShadow: "0 0 4px rgba(255, 255, 0, 0.8)"
                }}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1
                }}
                animate={{
                  x: [0, Math.random() * 15 - 7],
                  y: [0, -15 - Math.random() * 8],
                  opacity: [1, 0]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}

        {/* Click Animation - Extra Sparks */}
        {isClicked && (
          <div className="absolute -top-2 -left-2">
            {[...Array(clickCount === 2 ? 8 : 5)].map((_, i) => (
              <motion.div
                key={i}
                className={`w-1 h-1 rounded-full absolute ${
                  clickCount === 2 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{
                  boxShadow: clickCount === 2 ? 
                    "0 0 6px rgba(255, 255, 0, 0.8)" : 
                    "0 0 6px rgba(220, 38, 38, 0.8)"
                }}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1
                }}
                animate={{
                  x: [0, (Math.random() - 0.5) * (clickCount === 2 ? 40 : 30)],
                  y: [0, -20 - Math.random() * (clickCount === 2 ? 20 : 15)],
                  opacity: [1, 0]
                }}
                transition={{
                  duration: 1,
                  repeat: 0,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}; 