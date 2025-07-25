import { ArrowUp } from "lucide-react";
import React, { useEffect, useState } from "react";

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
  const [visitorCount, setVisitorCount] = useState(null);

  useEffect(() => {
    let uuid = getCookie('unique_visitor_id');
    if (!uuid) {
      uuid = generateUUID();
      setCookie('unique_visitor_id', uuid);
    }
    fetch("/api/visitor", {
      headers: {
        'x-visitor-id': uuid
      }
    })
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
            background: "transparent",
            boxShadow: "none",
            border: "2px solid #ff1744",
            color: "#ff1744",
            fontWeight: 700,
            fontSize: "1.3rem",
            textShadow: "0 0 2px #ff1744, 0 0 2px #fff",
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
