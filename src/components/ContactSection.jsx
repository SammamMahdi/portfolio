import {
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Send,
  Twitter,
  Github,
  Facebook,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// SVGs for Spotify, IEEE, ORCID
const SpotifyIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" fill="none" />
    <path d="M8 15c2.5-1 5.5-1 8 0" />
    <path d="M7 12c3-1.5 7-1.5 10 0" />
    <path d="M6.5 9c3.5-2 8.5-2 12 0" />
  </svg>
);
const IEEEIcon = (props) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="6" y="6" width="20" height="20" rx="2" fill="none" />
    <path d="M16 10v12M10 16h12" />
    <circle cx="16" cy="16" r="2.5" />
  </svg>
);
const OrcidIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" fill="none" />
    <circle cx="8.5" cy="12" r="1.5" />
    <path d="M12 8v8m3.5-4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
  </svg>
);
const DiscordIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" fill="none" />
    <path d="M7.5 16c1.5 1 7.5 1 9 0" />
    <ellipse cx="9" cy="12" rx="1" ry="1.5" />
    <ellipse cx="15" cy="12" rx="1" ry="1.5" />
    <path d="M7 7l2 2m6-2l-2 2" />
  </svg>
);

export const ContactSection = () => {
  return (
    <section id="contact" className="py-24 px-4 relative bg-gradient-to-br from-background/80 via-secondary/10 to-background/80">
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
            Get In Touch
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-2 font-medium">
            Let&apos;s connect! I&apos;m open to collaborations, questions, and opportunities.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          {/* Contact Info Card */}
          <motion.div
            className="relative group bg-card/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-white/20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            whileHover={{ scale: 1.04, boxShadow: '0 4px 32px 0 rgba(220, 38, 38, 0.18)', transition: { duration: 0.18 } }}
            style={{ background: 'linear-gradient(135deg, rgba(30,30,40,0.95) 60%, rgba(60,0,20,0.7) 100%)' }}
          >
            {/* Neon accent bar, thicker and glowing */}
            <span className="absolute left-0 top-4 bottom-4 w-1.5 rounded-full bg-primary shadow-[0_0_16px_2px_rgba(220,38,38,0.7)] group-hover:scale-y-110 transition-transform duration-300" />
            <div className="p-5 md:p-10 md:pt-12 md:pb-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center tracking-wide">Contact Information</h3>
              <div className="space-y-6 md:space-y-8 divide-y divide-white/10">
                {/* Email */}
                <div className="flex flex-wrap items-center gap-4 md:gap-5 min-w-0 pb-4">
                  <div className="p-3 md:p-4 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-200 group-hover:bg-primary/20 group-hover:shadow-[0_0_12px_2px_rgba(220,38,38,0.3)]">
                    <Mail className="h-7 w-7 text-primary transition-all duration-200 group-hover:drop-shadow-[0_0_6px_crimson]" />
                  </div>
                  <div className="flex flex-col justify-center text-left min-w-0">
                    <div className="font-semibold text-lg mb-0.5 break-words">Email</div>
                    <a
                      href="mailto:sammam.mahdi@gmail.com"
                      className="text-primary text-lg underline underline-offset-2 hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary transition-all"
                    >
                      sammam.mahdi@gmail.com
                    </a>
                  </div>
                </div>
                {/* Phone */}
                <div className="flex flex-wrap items-center gap-4 md:gap-5 min-w-0 py-4">
                  <div className="p-3 md:p-4 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-200 group-hover:bg-primary/20 group-hover:shadow-[0_0_12px_2px_rgba(220,38,38,0.3)]">
                    <Phone className="h-7 w-7 text-primary transition-all duration-200 group-hover:drop-shadow-[0_0_6px_crimson]" />
                  </div>
                  <div className="flex flex-col justify-center text-left min-w-0">
                    <div className="font-semibold text-lg mb-0.5 break-words">Phone</div>
                    <a
                      href="tel:+8801822926571"
                      className="text-primary text-lg underline underline-offset-2 hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary transition-all"
                    >
                      +880 1822926571
                    </a>
                  </div>
                </div>
                {/* Location */}
                <div className="flex flex-wrap items-center gap-4 md:gap-5 min-w-0 pt-4">
                  <div className="p-3 md:p-4 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-200 group-hover:bg-primary/20 group-hover:shadow-[0_0_12px_2px_rgba(220,38,38,0.3)]">
                    <MapPin className="h-7 w-7 text-primary transition-all duration-200 group-hover:drop-shadow-[0_0_6px_crimson]" />
                  </div>
                  <div className="flex flex-col justify-center text-left min-w-0">
                    <div className="font-semibold text-lg mb-0.5 break-words">Location</div>
                    <span className="text-muted-foreground text-lg text-left break-words">Dhaka, Bangladesh</span>
                  </div>
                </div>
              </div>
              <div className="pt-8 md:pt-10 border-t border-white/10 mt-8">
                <h4 className="font-semibold text-xl md:text-2xl mb-4 text-center tracking-wide">Connect With Me</h4>
                <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
                  {/* LinkedIn */}
                  <a href="https://www.linkedin.com/in/sammam-mahdi-290937170/" target="_blank" rel="noopener noreferrer" className="transition-all duration-200 hover:text-primary hover:scale-110" title="LinkedIn">
                    <Linkedin className="w-6 h-6" />
                  </a>
                  {/* Facebook */}
                  <a href="https://www.facebook.com/izdatimpotent" target="_blank" rel="noopener noreferrer" className="transition-all duration-200 hover:text-primary hover:scale-110" title="Facebook">
                    <Facebook className="w-6 h-6" />
                  </a>
                  {/* Instagram */}
                  <a href="https://www.instagram.com/izdatimpotent/" target="_blank" rel="noopener noreferrer" className="transition-all duration-200 hover:text-primary hover:scale-110" title="Instagram">
                    <Instagram className="w-6 h-6" />
                  </a>
                  {/* Spotify */}
                  <a href="https://open.spotify.com/user/31nnfvatqutw3qkxru4ugwmb233m" target="_blank" rel="noopener noreferrer" className="transition-all duration-200 hover:text-primary hover:scale-110" title="Spotify">
                    <SpotifyIcon className="w-6 h-6" />
                  </a>
                  {/* Twitter/X */}
                  <a href="https://x.com/sammam_mahdi" target="_blank" rel="noopener noreferrer" className="transition-all duration-200 hover:text-primary hover:scale-110" title="X (Twitter)">
                    <Twitter className="w-6 h-6" />
                  </a>
                  {/* GitHub */}
                  <a href="https://github.com/SammamMahdi" target="_blank" rel="noopener noreferrer" className="transition-all duration-200 hover:text-primary hover:scale-110" title="GitHub">
                    <Github className="w-6 h-6" />
                  </a>
                  {/* IEEE */}
                  <a href="https://authorprofile.ieee.org/author/241810796639769/dashboard" target="_blank" rel="noopener noreferrer" className="transition-all duration-200 hover:text-primary hover:scale-110" title="IEEE">
                    <IEEEIcon className="w-6 h-6" />
                  </a>
                  {/* ORCID */}
                  <a href="https://orcid.org/my-orcid?orcid=0009-0005-7202-2692" target="_blank" rel="noopener noreferrer" className="transition-all duration-200 hover:text-primary hover:scale-110" title="ORCID">
                    <OrcidIcon className="w-6 h-6" />
                  </a>
                  {/* Discord */}
                  <a href="https://discord.com/users/sammammahdi" target="_blank" rel="noopener noreferrer" className="transition-all duration-200 hover:text-primary hover:scale-110" title="Discord: sammammahdi">
                    <DiscordIcon className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
          {/* Contact Form Card */}
          <motion.div
            className="relative group bg-card/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-white/20 mt-8 md:mt-0"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          >
            {/* Neon accent bar */}
            <span className="absolute left-0 top-4 bottom-4 w-1.5 rounded-full bg-primary shadow-[0_0_16px_2px_rgba(220,38,38,0.7)] group-hover:scale-y-110 transition-transform duration-300" />
            <div className="p-5 md:p-8">
              <h3 className="text-2xl md:text-3xl font-semibold mb-6">Send a Message</h3>
              <form
                action="https://formspree.io/f/myzjvlay"
                method="POST"
                className="space-y-6"
              >
                <input type="hidden" name="_next" value="/thank-you" />
                <div>
                  <label
                    htmlFor="name"
                    className="block text-lg font-medium mb-2"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 rounded-md border border-input bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary/80 focus:bg-background/90 transition-all text-lg"
                    placeholder="Sammam Mahdi..."
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-lg font-medium mb-2"
                  >
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-md border border-input bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary/80 focus:bg-background/90 transition-all text-lg"
                    placeholder="john@gmail.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-lg font-medium mb-2"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    className="w-full px-4 py-3 rounded-md border border-input bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary/80 focus:bg-background/90 transition-all resize-none text-lg"
                    placeholder="Hello, I&apos;d like to talk about..."
                  />
                </div>
                <button
                  type="submit"
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black/60 backdrop-blur text-primary font-bold text-xl shadow-lg border border-white/10 hover:bg-black/80 neon-glow transition-all duration-300 transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary"
                  )}
                >
                  Send Message
                  <Send size={20} />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
