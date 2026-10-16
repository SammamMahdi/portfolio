import { useCallback, useEffect, useMemo, useState } from "react";
import { TermContext } from "./termStore";
import { applyTheme, themeName, THEME_ORDER } from "@/lib/themes";

function readCrt() {
  try {
    return localStorage.getItem("crt") !== "off";
  } catch {
    return true;
  }
}

export function TermProvider({ children }) {
  const [crt, setCrtState] = useState(readCrt);
  const [shellOpen, setShellOpen] = useState(false);
  const [theme, setThemeState] = useState(themeName);

  useEffect(() => {
    document.documentElement.dataset.crt = crt ? "on" : "off";
  }, [crt]);

  const setCrt = useCallback((on) => {
    setCrtState(on);
    try {
      localStorage.setItem("crt", on ? "on" : "off");
    } catch {
      /* storage unavailable: the toggle still works for this visit */
    }
  }, []);

  const setTheme = useCallback((name) => {
    applyTheme(name);
    setThemeState(themeName());
    try {
      localStorage.setItem("theme", themeName());
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      crt,
      setCrt,
      theme,
      setTheme,
      cycleTheme: () => setTheme(THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length]),
      shellOpen,
      setShellOpen,
      toggleShell: () => setShellOpen((o) => !o),
    }),
    [crt, setCrt, theme, setTheme, shellOpen]
  );
  return <TermContext.Provider value={value}>{children}</TermContext.Provider>;
}
