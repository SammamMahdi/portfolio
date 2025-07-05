import { ArrowRight, ExternalLink, Github, Star, GitBranch, Calendar } from "lucide-react";
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
        setRepos([...pinned, ...rest]);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <section id="projects" className="py-24 px-4 relative bg-gradient-to-br from-background/80 via-secondary/10 to-background/80">
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
            Featured Projects
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Here are some of my recent GitHub projects. This list updates live from my public repositories.
          </p>
        </motion.div>

        {loading && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="inline-flex items-center gap-3 text-muted-foreground">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              Loading projects...
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div 
            className="text-center py-12 text-red-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {!loading && !error && (
          <>
            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {repos.slice(0, 6).map((repo, idx) => {
                const isPinned = pinnedRepos.includes(repo.name);
                return (
                  <motion.div
                    key={repo.id}
                    className={`relative flex flex-col bg-card/50 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden group border border-primary/10 cursor-pointer transition-all duration-300 ${tappedIdx === idx ? 'scale-105 shadow-[0_8px_40px_0_rgba(220,38,38,0.25)]' : ''}`}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
                    whileHover={{ scale: 1.03, boxShadow: "0 8px 40px 0 rgba(220, 38, 38, 0.25)", transition: { duration: 0.25, ease: 'easeOut' } }}
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
                    {/* Pinned Badge */}
                    {isPinned && (
                      <div className="absolute top-4 right-4 z-20">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-600 border border-yellow-500/30">
                          ⭐ Pinned
                        </span>
                      </div>
                    )}

                    {/* Enhanced accent bar */}
                    <span className={`absolute left-0 top-4 bottom-4 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary/60 transition-transform duration-300 ${tappedIdx === idx ? 'scale-y-110 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'group-hover:scale-y-110'}`} />

                    {/* Project Header */}
                    <div className="h-32 flex items-center justify-center bg-gradient-to-br from-secondary/50 to-secondary/30 relative rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />
                      
                      {/* If repo has a homepage/demo, show an ExternalLink icon, else GitHub icon */}
                      {repo.homepage ? (
                        <ExternalLink size={48} className="text-primary relative z-10 group-hover:drop-shadow-[0_0_20px_rgba(220,38,38,0.8)] transition-all duration-300 z-10" />
                      ) : (
                        <Github size={48} className={`text-primary relative z-10 transition-all duration-300 z-10 ${tappedIdx === idx ? 'drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]' : 'group-hover:drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]'}`} />
                      )}
                    </div>

                    {/* Project Content */}
                    <div className="flex-1 flex flex-col p-6">
                      {/* Project Stats */}
                      <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {repo.stargazers_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            {repo.forks_count || 0}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(repo.updated_at)}
                        </span>
                      </div>

                      {/* Project Title */}
                      <h3 className="text-xl font-bold mb-2 text-foreground leading-tight">
                        {repo.name}
                      </h3>

                      {/* Project Description */}
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
                        {repo.description || "No description provided."}
                      </p>

                      {/* Project Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(repo.topics || []).slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-1 text-xs font-medium border rounded-full bg-primary/10 text-primary border-primary/20">
                            {tag}
                          </span>
                        ))}
                        {(repo.topics || []).length > 3 && (
                          <span className="px-2 py-1 text-xs font-medium border rounded-full bg-secondary/50 text-muted-foreground border-border">
                            +{(repo.topics || []).length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Spacer to push buttons to bottom */}
                      <div className="flex-1" />

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-2">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/30 transition-all duration-200 text-sm font-medium"
                          title="View on GitHub"
                          onClick={e => e.stopPropagation()}
                        >
                          <Github size={16} />
                        </a>
                        {repo.homepage && (
                          <a
                            href={repo.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/30 transition-all duration-200 text-sm font-medium"
                            title="View Demo/Homepage"
                            onClick={e => e.stopPropagation()}
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* GitHub Link */}
            <div className="text-center">
              <a
                className="w-fit flex items-center mx-auto gap-2 px-6 py-3 rounded-full bg-black/60 backdrop-blur text-primary font-bold text-lg shadow-lg border border-white/10 hover:bg-black/80 neon-glow transition-all duration-300 transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary"
                target="_blank"
                href="https://github.com/SammamMahdi"
                rel="noopener noreferrer"
              >
                Check My Github <ArrowRight size={16} />
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
