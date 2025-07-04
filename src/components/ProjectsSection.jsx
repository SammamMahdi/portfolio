import { ArrowRight, ExternalLink, Github } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const pinnedRepos = [
  "Stroke-Detection",
  "WeHeal-final",
  "LeetCode_Solutions"
];

export const ProjectsSection = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tappedIdx, setTappedIdx] = useState(null);

  useEffect(() => {
    fetch("https://corsproxy.io/?https://api.github.com/users/SammamMahdi/repos?sort=updated&per_page=30")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch repos");
        return res.json();
      })
      .then((data) => {
        // Sort pinned repos first, in the order specified
        const pinned = pinnedRepos
          .map(name => data.find(repo => repo.name === name))
          .filter(Boolean);
        const rest = data.filter(repo => !pinnedRepos.includes(repo.name));
        setRepos([...pinned, ...rest].slice(0, 6));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        console.error('Error fetching repos:', err);
        setLoading(false);
      });
    // Remove tap effect on scroll or tap elsewhere
    const handleTouch = () => setTappedIdx(null);
    window.addEventListener('touchstart', handleTouch);
    return () => window.removeEventListener('touchstart', handleTouch);
  }, []);

  return (
    <section id="projects" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Featured <span className="text-foreground"> Projects </span>
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Here are some of my recent GitHub projects. This list updates live from my public repositories.
        </p>
        {loading && <div className="text-center">Loading projects...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {repos.map((repo, idx) => {
            return (
              <motion.div
                key={repo.id}
                className={`relative group bg-card/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg ${tappedIdx === idx ? 'scale-105 shadow-[0_4px_32px_0_rgba(220,38,38,0.15)]' : ''}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
                whileHover={{ scale: 1.04, boxShadow: "0 4px 32px 0 rgba(220, 38, 38, 0.15)", transition: { duration: 0.18 } }}
                onTouchStart={e => {
                  e.stopPropagation();
                  setTappedIdx(idx);
                }}
                onClick={e => {
                  // Prevent tap from triggering link immediately
                  if (tappedIdx !== idx) {
                    e.preventDefault();
                    setTappedIdx(idx);
                  }
                }}
              >
                {/* Red accent bar */}
                <span className={`absolute left-0 top-4 bottom-4 w-1 rounded-full bg-primary transition-transform duration-300 ${tappedIdx === idx ? 'scale-y-110' : 'group-hover:scale-y-110'}`} />
                <div className="h-48 overflow-hidden flex items-center justify-center bg-secondary">
                  {/* If repo has a homepage/demo, show an ExternalLink icon, else GitHub icon */}
                  {repo.homepage ? (
                    <ExternalLink size={40} className="text-primary" />
                  ) : (
                    <Github size={40} className={`text-primary transition-all duration-300 ${tappedIdx === idx ? 'drop-shadow-[0_0_12px_rgba(220,38,38,0.8)]' : 'group-hover:drop-shadow-[0_0_12px_rgba(220,38,38,0.8)]'}`} />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(repo.topics || []).map((tag) => (
                      <span key={tag} className="px-2 py-1 text-xs font-medium border rounded-full bg-secondary text-secondary-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-semibold mb-1 text-foreground">{repo.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {repo.description || "No description provided."}
                  </p>
                  {/* Icon row at the bottom */}
                  <div className="flex gap-4 mt-4">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:drop-shadow-[0_0_10px_rgba(220,38,38,0.7)] transition-all duration-200"
                      title="View on GitHub"
                      onClick={e => e.stopPropagation()}
                    >
                      <Github size={28} />
                    </a>
                    {repo.homepage && (
                      <a
                        href={repo.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:drop-shadow-[0_0_10px_rgba(220,38,38,0.7)] transition-all duration-200"
                        title="View Demo/Homepage"
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink size={28} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="text-center mt-12">
          <a
            className="cosmic-button w-fit flex items-center mx-auto gap-2"
            target="_blank"
            href="https://github.com/SammamMahdi"
            rel="noopener noreferrer"
          >
            Check My Github <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};
