import { useEffect, useState } from "react";

// Realistic star color palette (hot to cool)
const STAR_COLORS = [
  { core: "#b9e2ff", edge: "#3a7bd5" }, // blue
  { core: "#e6f0ff", edge: "#b3cfff" }, // blue-white
  { core: "#fff", edge: "#e0e0ff" },    // white
  { core: "#fffbe6", edge: "#ffe680" }, // yellow-white
  { core: "#fff6cc", edge: "#ffe066" }, // yellow
  { core: "#ffe0b3", edge: "#ffb347" }, // orange
  { core: "#ffd6d6", edge: "#ff6666" }, // red
  { core: "#e0b3ff", edge: "#7d3cff" }, // purple
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
      const colorIdx = Math.floor(Math.random() * STAR_COLORS.length);
      const color = STAR_COLORS[colorIdx];
      newStars.push({
        id: i,
        size: Math.random() * 4.5 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: Math.random() * 0.5 + 0.5,
        animationDuration: Math.random() * 4 + 2,
        color,
      });
    }

    setStars(newStars);
  };

  const generateMeteors = () => {
    const minMeteors = 3;
    const maxMeteors = 6;
    const numberOfMeteors = Math.floor(Math.random() * (maxMeteors - minMeteors + 1)) + minMeteors;
    // Shuffle the METEOR_COLORS array and pick the first 6 for unique colors
    const shuffledColors = METEOR_COLORS
      .map((color) => ({ color, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ color }) => color)
      .slice(0, numberOfMeteors);
    const newMeteors = [];

    // Use a grid approach for well-spread meteors in the top-left quadrant
    const cols = 3; // number of columns in the grid
    const rows = 2; // number of rows in the grid
    let cell = 0;
    for (let i = 0; i < numberOfMeteors; i++) {
      const color = shuffledColors[i];
      // Calculate grid position
      const col = cell % cols;
      const row = Math.floor(cell / cols);
      // Each cell covers a portion of the 0-50% width and 0-50% height
      const cellWidth = 50 / cols;
      const cellHeight = 50 / rows;
      // Randomize within the cell for natural spread
      const x = col * cellWidth + Math.random() * cellWidth;
      const y = row * cellHeight + Math.random() * cellHeight;
      newMeteors.push({
        id: i,
        size: Math.random() * 2 + 1,
        x,
        y,
        delay: Math.random() * 15,
        animationDuration: Math.random() * 3 + 3,
        color,
      });
      cell++;
    }

    setMeteors(newMeteors);
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((star) => (
        <svg
          key={star.id}
          className="absolute animate-pulse-subtle"
          style={{
            width: star.size + "px",
            height: star.size + "px",
            left: star.x + "%",
            top: star.y + "%",
            opacity: star.opacity,
            animationDuration: star.animationDuration + "s",
            pointerEvents: "none",
          }}
        >
          <defs>
            <radialGradient id={`star-gradient-${star.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={star.color.core} stopOpacity="1" />
              <stop offset="100%" stopColor={star.color.edge} stopOpacity="0.2" />
            </radialGradient>
          </defs>
          <circle cx="50%" cy="50%" r="50%" fill={`url(#star-gradient-${star.id})`} />
        </svg>
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
            background: `linear-gradient(90deg, ${meteor.color} 0%, #000 100%)`,
            transform: `rotate(${meteor.angle ?? 0}deg)`,
            boxShadow: `0 0 8px 2px ${meteor.color}`,
            borderRadius: meteor.size + "px",
            opacity: 0.92,
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
};
