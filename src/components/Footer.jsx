import { ArrowUp } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-8 px-4 bg-card border-t border-border mt-12 flex flex-col items-center justify-center text-center">
      <a
        href="#hero"
        className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors mb-3"
        title="Back to top"
      >
        <ArrowUp size={22} />
      </a>
      <p className="text-base text-muted-foreground">
        &copy; {new Date().getFullYear()} Sammam Mahdi. All rights reserved.
      </p>
    </footer>
  );
};
