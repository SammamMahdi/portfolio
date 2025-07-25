import { ArrowUp } from "lucide-react";
import React, { useEffect, useState } from "react";

export const Footer = () => {
  const [visitorCount, setVisitorCount] = useState(null);

  useEffect(() => {
    fetch("/api/visitor")
      .then((res) => res.json())
      .then((data) => setVisitorCount(data.uniqueVisitors))
      .catch(() => setVisitorCount(null));
  }, []);

  return (
    <footer className="py-8 px-4 bg-card border-t border-border mt-12 flex flex-col items-center justify-center text-center relative">
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
      {visitorCount !== null && (
        <span
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            fontSize: "0.9rem",
            color: "#888",
            zIndex: 10,
            userSelect: "none"
          }}
        >
          {visitorCount}
        </span>
      )}
    </footer>
  );
};
