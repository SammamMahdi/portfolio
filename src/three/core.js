import * as THREE from "three";
import { pal, onTheme } from "../lib/themes.js";

/* Theme colours as shared THREE.Colors. They are updated in place on a theme
   switch; materials that copied a value are recoloured by Stage.retheme. */
const C3 = (k) => new THREE.Color(pal[k]);
export const AMBER = C3("amber");
export const AMBER_HI = C3("hi");
export const AMBER_DIM = C3("faint");
export const ALERT = C3("alert");
export const LINE = C3("line");
export const LO = C3("lo");
export const BG = C3("bg");
export const DEEP = C3("deep");
const PALETTE = { amber: AMBER, hi: AMBER_HI, faint: AMBER_DIM, alert: ALERT, line: LINE, lo: LO, bg: BG, deep: DEEP, dim: C3("dim"), text: C3("text") };

const stages = new Set();
onTheme((prev, next) => {
  const map = new Map();
  for (const k of Object.keys(PALETTE)) {
    map.set(new THREE.Color(prev[k]).getHex(), new THREE.Color(next[k]));
    PALETTE[k].set(next[k]);
  }
  stages.forEach((s) => s.retheme(map));
});

/**
 * Owns a renderer + scene + camera and a render loop that only runs while
 * the stage is "active" (on screen and the tab is visible). Subclasses
 * implement update(dt, t).
 */
export class Stage {
  constructor(canvas, { fov = 35 } = {}) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(fov, 1, 0.01, 100);
    this.clock = new THREE.Clock(false);
    this.time = 0;
    this.active = false;
    this.raf = 0;
    this.width = 1;
    this.height = 1;
    stages.add(this);
  }

  /** Recolour everything still using the previous theme's colours. */
  retheme(map) {
    const fix = (c) => {
      if (!c?.isColor) return;
      const n = map.get(c.getHex());
      if (n) c.copy(n);
    };
    this.scene.traverse((o) => {
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      mats.forEach((m) => {
        fix(m.color);
        Object.values(m.uniforms || {}).forEach((u) => fix(u?.value));
      });
    });
    if (this.scene.fog) fix(this.scene.fog.color);
    const cc = new THREE.Color();
    this.renderer.getClearColor(cc);
    const n = map.get(cc.getHex());
    if (n) this.renderer.setClearColor(n, this.renderer.getClearAlpha());
    this.onTheme?.();
    if (!this.active) this.renderOnce();
  }

  setActive(on) {
    this.wanted = on;
    on = on && !this.suspended;
    if (on === this.active) return;
    this.active = on;
    if (on) {
      this.clock.start();
      this.loop();
    } else {
      this.clock.stop();
      cancelAnimationFrame(this.raf);
    }
  }

  /** Pause rendering while the canvas is hidden by its UI (independent of visibility). */
  suspend(on) {
    this.suspended = on;
    this.setActive(!!this.wanted);
  }

  loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.time += dt;
    this.update(dt, this.time);
    this.render();
  };

  /** Draw the frame; subclasses with extra passes (e.g. an inset camera) override this. */
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /** Render one frame without starting the loop (used for static/reduced-motion). */
  renderOnce() {
    this.update(0, this.time);
    this.render();
  }

  resize(w, h) {
    if (w < 2 || h < 2) return;
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.onResize?.(w, h);
    if (!this.active) this.renderOnce();
  }

  update(/* dt, t */) {}

  dispose() {
    stages.delete(this);
    this.setActive(false);
    this.scene.traverse((o) => {
      o.geometry?.dispose?.();
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      mats.forEach((m) => {
        Object.values(m.uniforms || {}).forEach((u) => u?.value?.isTexture && u.value.dispose());
        m.map?.dispose?.();
        m.dispose?.();
      });
    });
    this.renderer.dispose();
  }
}

export { mulberry32, gaussian } from "../lib/rand.js";

export const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
