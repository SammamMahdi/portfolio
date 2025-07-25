import { ArrowUp } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Helper to generate UUID (v4)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper to get/set cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}
function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

export const Footer = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let uuid = getCookie('unique_visitor_id');
    if (!uuid) {
      uuid = generateUUID();
      setCookie('unique_visitor_id', uuid);
    }
  }, []);

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
      {/* Visually hidden analytics button */}
      <button
        onClick={handleCounterClick}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          opacity: 0,
          pointerEvents: "auto",
          zIndex: 20,
          border: "none",
          background: "none",
          padding: 0,
          margin: 0,
        }}
        aria-label="Show analytics (hidden)"
        tabIndex={0}
      />
      <p className="text-base text-muted-foreground">
        &copy; {new Date().getFullYear()} Sammam Mahdi. All rights reserved.
      </p>
    </footer>
  );
};
