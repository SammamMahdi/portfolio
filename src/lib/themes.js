/**
 * Phosphor themes. CSS reads them as --t-* variables (html[data-theme]);
 * canvases and three.js scenes read the live `pal` object, which is mutated
 * in place on a switch and announced to subscribers.
 * Every value within a theme is distinct: 3D scenes recolour by matching hex.
 */
export const THEMES = {
  amber: {
    label: "amber",
    tube: "P3",
    bg: "#0c0905", deep: "#080603", panel: "#110c06", raised: "#1a130a",
    amber: "#ffb000", hi: "#ffd68a", text: "#f2c27b", dim: "#b8843a",
    faint: "#6b4a1c", line: "#3a2810", lo: "#4a3214", alert: "#ff7a45", bezel: "#050302",
  },
  green: {
    label: "green",
    tube: "P1",
    bg: "#040a06", deep: "#030805", panel: "#07110a", raised: "#0c1a10",
    amber: "#3dff7e", hi: "#c6ffd6", text: "#97efb2", dim: "#46ad6b", faint: "#1f5c35", line: "#123a21",
    lo: "#194a2b", alert: "#ffb347", bezel: "#020503",
  },
  ice: {
    label: "ice",
    tube: "P4",
    bg: "#05080c", deep: "#04060a", panel: "#081019", raised: "#0d1826",
    amber: "#7fd4ff", hi: "#e2f4ff", text: "#b6d9f0", dim: "#5e90b4", faint: "#2b4a66", line: "#18293b",
    lo: "#203b55", alert: "#ff8a7a", bezel: "#020407",
  },
};

export const THEME_ORDER = ["amber", "green", "ice"];

let current = "amber";
export const pal = { ...THEMES.amber };
const subs = new Set();

export const themeName = () => current;

/** Subscribe to switches: fn(prevPalette, nextPalette). Returns an unsubscribe. */
export function onTheme(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}

export function readSavedTheme() {
  try {
    const t = localStorage.getItem("theme");
    return THEMES[t] ? t : "amber";
  } catch {
    return "amber";
  }
}

export function applyTheme(name) {
  const next = THEMES[name] ? name : "amber";
  const prev = { ...pal };
  current = next;
  Object.assign(pal, THEMES[next]);
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", pal.bg);
  }
  if (prev.amber !== pal.amber) subs.forEach((fn) => fn(prev, pal));
}
