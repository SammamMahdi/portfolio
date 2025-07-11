import { useEffect, useState } from "react";

// Realistic star colors
const STAR_COLORS = [
  '#a3c9ff', // blue
  '#ffffff', // white
  '#ffe066', // yellow
  '#ffb347', // orange
  '#ff7f7f', // red
];

// Vibrant meteor colors
const METEOR_COLORS = [
  '#a3c9ff', // blue
  '#ffffff', // white
  '#ffe066', // yellow
  '#ffb347', // orange
  '#ff7f7f', // red
  '#b388ff', // purple
  '#80ffd3', // teal
];

export const StarBackground = () => {
  const [stars, setStars] = useState([]);
  const [meteors, setMeteors] = useState([]);

  useEffect(() => {
    generateStars();
    generateMeteors();

    const handleResize = () => {
      generateStars();
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const generateStars = () => {
    const numberOfStars = Math.floor(
      (window.innerWidth * window.innerHeight) / 10000
    );

    const newStars = [];

    for (let i = 0; i < numberOfStars; i++) {
      newStars.push({
        id: i,
        size: Math.random() * 3 + 1,
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: Math.random() * 0.5 + 0.5,
        animationDuration: Math.random() * 4 + 2,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      });
    }

    setStars(newStars);
  };

  const generateMeteors = () => {
    const numberOfMeteors = 4 + Math.floor(Math.random() * 3); // 4-6 meteors
    const newMeteors = [];

    for (let i = 0; i < numberOfMeteors; i++) {
      newMeteors.push({
        id: i,
        size: Math.random() * 2 + 1,
        x: Math.random() * 100,
        y: Math.random() * 40, // more vertical randomness
        delay: Math.random() * 15,
        animationDuration: Math.random() * 2 + 2.5, // more speed variety
        angle: Math.random() * 60 - 30, // -30deg to +30deg
        color: METEOR_COLORS[Math.floor(Math.random() * METEOR_COLORS.length)],
      });
    }

    setMeteors(newMeteors);
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star animate-pulse-subtle"
          style={{
            width: star.size + "px",
            height: star.size + "px",
            left: star.x + "%",
            top: star.y + "%",
            opacity: star.opacity,
            animationDuration: star.animationDuration + "s",
            background: star.color,
          }}
        />
      ))}

      {meteors.map((meteor) => (
        <div
          key={meteor.id}
          className="meteor animate-meteor"
          style={{
            width: meteor.size * 50 + "px",
            height: meteor.size * 2 + "px",
            left: meteor.x + "%",
            top: meteor.y + "%",
            animationDelay: meteor.delay,
            animationDuration: meteor.animationDuration + "s",
            background: `linear-gradient(90deg, ${meteor.color} 0%, rgba(0,0,0,0) 100%)`,
            transform: `rotate(${meteor.angle}deg)`,
            boxShadow: `0 0 8px 2px ${meteor.color}`,
          }}
        />
      ))}
    </div>
  );
};
