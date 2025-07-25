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
            left: 24,
            bottom: 24,
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "rgba(30, 0, 0, 0.7)",
            boxShadow: "0 0 8px 2px #ff1744, 0 0 12px 2px #ff1744 inset",
            border: "2px solid #ff1744",
            color: "#ff1744",
            fontWeight: 700,
            fontSize: "1.3rem",
            textShadow: "0 0 4px #ff1744, 0 0 6px #fff, 0 0 1px #ff1744",
            zIndex: 10,
            userSelect: "none",
            transition: "box-shadow 0.3s"
          }}
        >
          {visitorCount}
        </span>
      )}
    </footer>
  );
};
