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
  Music,
  Globe,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const ContactSection = () => {
  return (
    <section id="contact" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Get In <span className="text-foreground"> Touch</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          {/* Contact Info Card */}
          <motion.div
            className="relative group bg-card/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg"
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
              <h3 className="text-2xl font-bold mb-8 text-center tracking-wide">Contact Information</h3>
              <div className="space-y-6 md:space-y-8">
                {/* Email */}
                <div className="flex flex-wrap items-center gap-4 md:gap-5 min-w-0">
                  <div className="p-3 md:p-4 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-200 group-hover:bg-primary/20 group-hover:shadow-[0_0_12px_2px_rgba(220,38,38,0.3)]">
                    <Mail className="h-7 w-7 text-primary transition-all duration-200 group-hover:drop-shadow-[0_0_6px_crimson]" />
                  </div>
                  <div className="flex flex-col justify-center text-left min-w-0">
                    <div className="font-semibold text-base mb-0.5 break-words">Email</div>
                    <a
                      href="mailto:sammam.mahdi@gmail.com"
                      className="text-muted-foreground hover:text-primary transition-colors text-sm text-left break-words"
                    >
                      sammam.mahdi@gmail.com
                    </a>
                  </div>
                </div>
                {/* Phone */}
                <div className="flex flex-wrap items-center gap-4 md:gap-5 min-w-0">
                  <div className="p-3 md:p-4 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-200 group-hover:bg-primary/20 group-hover:shadow-[0_0_12px_2px_rgba(220,38,38,0.3)]">
                    <Phone className="h-7 w-7 text-primary transition-all duration-200 group-hover:drop-shadow-[0_0_6px_crimson]" />
                  </div>
                  <div className="flex flex-col justify-center text-left min-w-0">
                    <div className="font-semibold text-base mb-0.5 break-words">Phone</div>
                    <a
                      href="tel:+8801822926571"
                      className="text-muted-foreground hover:text-primary transition-colors text-sm text-left break-words"
                    >
                      +880 1822926571
                    </a>
                  </div>
                </div>
                {/* Location */}
                <div className="flex flex-wrap items-center gap-4 md:gap-5 min-w-0">
                  <div className="p-3 md:p-4 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-200 group-hover:bg-primary/20 group-hover:shadow-[0_0_12px_2px_rgba(220,38,38,0.3)]">
                    <MapPin className="h-7 w-7 text-primary transition-all duration-200 group-hover:drop-shadow-[0_0_6px_crimson]" />
                  </div>
                  <div className="flex flex-col justify-center text-left min-w-0">
                    <div className="font-semibold text-base mb-0.5 break-words">Location</div>
                    <span className="text-muted-foreground text-sm text-left break-words">Dhaka, Bangladesh</span>
                  </div>
                </div>
              </div>
              <div className="pt-8 md:pt-10">
                <h4 className="font-semibold mb-4 text-center tracking-wide">Connect With Me</h4>
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
                    <Music className="w-6 h-6" />
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
                    <Globe className="w-6 h-6" />
                  </a>
                  {/* ORCID */}
                  <a href="https://orcid.org/my-orcid?orcid=0009-0005-7202-2692" target="_blank" rel="noopener noreferrer" className="transition-all duration-200 hover:text-primary hover:scale-110" title="ORCID">
                    <User className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
          {/* Contact Form Card */}
          <motion.div
            className="relative group bg-card/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          >
            {/* Neon accent bar */}
            <span className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-primary group-hover:scale-y-110 transition-transform duration-300" />
            <div className="p-5 md:p-8">
              <h3 className="text-2xl font-semibold mb-6">Send a Message</h3>
              <form
                action="https://formspree.io/f/myzjvlay"
                method="POST"
                className="space-y-6"
              >
                <input type="hidden" name="_next" value="/thank-you" />
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                    placeholder="Sammam Mahdi..."
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                    placeholder="john@gmail.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Hello, I'd like to talk about..."
                  />
                </div>
                <button
                  type="submit"
                  className={cn(
                    "cosmic-button w-full flex items-center justify-center gap-2"
                  )}
                >
                  Send Message
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
