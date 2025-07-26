import { ArrowUp } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();

  const handleCounterClick = () => {
    const pin = window.prompt("Enter PIN to view analytics:");
    if (pin === "621311518") {
      navigate("/analytics");
    }
  };

  return (
    <footer className="py-8 px-4 bg-card border-t border-border mt-12 flex flex-col items-center justify-center text-center relative">
      <a
        href="#hero"
        className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors mb-3"
        title="Back to top"
      >
        <ArrowUp size={22} />
      </a>
      {/* Small, visible but unobtrusive analytics button in bottom right */}
      <button
        onClick={handleCounterClick}
        style={{
          position: "absolute",
          right: 12,
          bottom: 12,
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "#444",
          border: "1px solid #888",
          padding: 0,
          margin: 0,
          zIndex: 30,
          cursor: "pointer",
        }}
        title="Show analytics (hidden)"
        aria-label="Show analytics"
        tabIndex={0}
      />
      <p className="text-base text-muted-foreground">
        &copy; {new Date().getFullYear()} Sammam Mahdi. All rights reserved.
      </p>
    </footer>
  );
};
