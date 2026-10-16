import * as THREE from "three";
import { Stage, AMBER, AMBER_HI, easeInOut, clamp01 } from "./core.js";
import { DragOrbit } from "./orbit.js";
import { makeGlyphAtlas } from "./glyphAtlas.js";

const VERT = /* glsl */ `
attribute float aGlyph;
attribute float aDepth;
attribute vec2 aGrid;
uniform float uReveal;
uniform float uBeam;
uniform float uDepth;
uniform float uSlice;
uniform float uSize;
uniform float uScale;
uniform vec2 uProbe;
uniform float uProbeOn;
varying float vGlyph;
varying float vLight;
varying float vAlpha;
void main() {
  vec3 p = position;
  p.z = (aDepth - 0.5) * uDepth;
  float probe = uProbeOn * smoothstep(0.075, 0.0, distance(aGrid, uProbe));
  p.z += probe * 0.06;
  float shown = smoothstep(aGrid.y - 0.025, aGrid.y, uReveal);
  float beam = exp(-pow((aGrid.y - uBeam) * 34.0, 2.0));
  float slice = exp(-pow((aDepth - uSlice) * 16.0, 2.0)) * step(0.02, uDepth);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uScale / -mv.z * (1.0 + probe * 0.3);
  vGlyph = aGlyph;
  vAlpha = shown;
  vLight = 0.22 + 0.92 * (aGlyph / 9.0) + 0.9 * beam + 0.5 * slice + 0.7 * probe;
}`;

const FRAG = /* glsl */ `
uniform sampler2D uAtlas;
uniform float uCount;
uniform vec3 uColor;
uniform vec3 uHi;
varying float vGlyph;
varying float vLight;
varying float vAlpha;
void main() {
  vec2 uv = vec2((vGlyph + gl_PointCoord.x) / uCount, 1.0 - gl_PointCoord.y);
  float a = texture2D(uAtlas, uv).a * vAlpha;
  if (a < 0.03) discard;
  vec3 col = mix(uColor, uHi, clamp(vLight - 0.8, 0.0, 1.0)) * min(vLight, 1.5);
  gl_FragColor = vec4(col, a);
}`;

const HALF = 1; // portrait spans [-1, 1] in x and y
const DEPTH_ON = 0.95;
// The flat scan keeps an imperceptible relief: a perfectly planar, camera-facing
// sheet of sprites rendered blank on SwiftShader, so never let it be exactly flat.
const FLAT = 0.01;
const REVEAL_END = 1.5;
const INFLATE_END = 2.9;

/**
 * The hero: the ASCII portrait as a point cloud of glyph sprites, each lifted
 * to the relative depth a monocular model predicted for that cell.
 */
export class PortraitCloud extends Stage {
  constructor(canvas, { data, ramp, mode = "flat", reducedMotion = false, onProbe, onModeRequest } = {}) {
    super(canvas, { fov: 30 });
    this.reduced = reducedMotion;
    this.onProbe = onProbe;
    this.mode = mode;
    this.depthNow = reducedMotion && mode === "depth" ? DEPTH_ON : FLAT;
    this.age = reducedMotion ? INFLATE_END + 1 : 0;

    const { cols, rows } = data;
    const lines = data.glyphs.split("\n");
    const raw = Uint8Array.from(atob(data.depth), (ch) => ch.charCodeAt(0));
    // Flying-pixel removal: silhouette cells pick up background depth from the
    // monocular model. Snap any cell far behind its 3x3 neighbourhood median.
    const dmap = raw.slice();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const d = raw[r * cols + c];
        if (!d) continue;
        const nb = [];
        for (let j = -1; j <= 1; j++)
          for (let i = -1; i <= 1; i++) {
            const v = raw[(r + j) * cols + (c + i)];
            if ((i || j) && r + j >= 0 && r + j < rows && c + i >= 0 && c + i < cols && v) nb.push(v);
          }
        if (nb.length < 3) continue;
        nb.sort((a, b) => a - b);
        const med = nb[nb.length >> 1];
        if (d < med - 30) dmap[r * cols + c] = med;
      }
    }
    const pos = [], glyph = [], depth = [], grid = [];
    const cw = (2 * HALF) / cols, ch = (2 * HALF) / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const g = ramp.indexOf(lines[r]?.[c] ?? " ");
        if (g <= 0) continue;
        const d = dmap[r * cols + c] || 128;
        pos.push(-HALF + (c + 0.5) * cw, HALF - (r + 0.5) * ch, 0);
        glyph.push(g);
        depth.push(d / 255);
        grid.push((c + 0.5) / cols, (r + 0.5) / rows);
      }
    }
    this.cols = cols;
    this.rows = rows;
    this.count = glyph.length;
    this.pts = { pos, depth, grid, glyph };

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("aGlyph", new THREE.Float32BufferAttribute(glyph, 1));
    geo.setAttribute("aDepth", new THREE.Float32BufferAttribute(depth, 1));
    geo.setAttribute("aGrid", new THREE.Float32BufferAttribute(grid, 2));

    const atlas = makeGlyphAtlas(ramp);
    this.uniforms = {
      uAtlas: { value: atlas.texture },
      uCount: { value: atlas.count },
      uColor: { value: AMBER.clone() },
      uHi: { value: AMBER_HI.clone() },
      uReveal: { value: reducedMotion ? 2 : -0.05 },
      uBeam: { value: -1 },
      uDepth: { value: this.depthNow },
      uSlice: { value: -1 },
      uSize: { value: ch * 1.15 },
      uScale: { value: 400 },
      uProbe: { value: new THREE.Vector2(-1, -1) },
      uProbeOn: { value: 0 },
    };
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.group = new THREE.Group();
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.group.add(this.points);
    this.scene.add(this.group);

    this.orbit = new DragOrbit(canvas, {
      yaw: reducedMotion && mode === "depth" ? -0.38 : 0,
      pitch: reducedMotion && mode === "depth" ? 0.05 : 0,
      yawLimit: 1.05,
      pitchLimit: 0.4,
      // dragging the flat scan lifts it into 3D
      onInteract: () => this.mode === "flat" && onModeRequest?.("depth"),
    });

    // pointer probe: nearest glyph in screen space
    this.pointer = null;
    this.probeIdx = -1;
    this.probeOn = 0;
    this.tmp = new THREE.Vector3();
    canvas.addEventListener("pointermove", this.onMove);
    canvas.addEventListener("pointerleave", this.onLeave);
  }

  onMove = (e) => {
    const r = this.canvas.getBoundingClientRect();
    this.pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  onLeave = () => {
    this.pointer = null;
  };

  setMode(mode) {
    this.mode = mode;
    if (mode === "flat") this.orbit.setTarget(0, 0);
    if (this.reduced && !this.active) this.renderOnce();
  }

  /** Replay the raster-scan intro (e.g. when the viewer switches from the photo). */
  replay() {
    if (this.reduced) return;
    this.age = 0;
    this.depthNow = FLAT;
    this.orbit.setTarget(0, 0);
    this.orbit.yaw = this.orbit.pitch = 0;
  }

  onResize(w, h) {
    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const fit = HALF * 1.22;
    const dist = Math.max(fit / tan, fit / (tan * this.camera.aspect));
    this.camera.position.set(0, 0, dist);
    this.camera.lookAt(0, 0, 0);
    this.uniforms.uScale.value = (h * this.renderer.getPixelRatio()) / (2 * tan);
  }

  pick() {
    if (!this.pointer) return -1;
    const { pos, depth } = this.pts;
    const m = this.points.matrixWorld;
    let best = -1, bestD = 18 * 18;
    for (let i = 0; i < this.count; i++) {
      this.tmp.set(pos[i * 3], pos[i * 3 + 1], (depth[i] - 0.5) * this.depthNow).applyMatrix4(m).project(this.camera);
      const dx = (this.tmp.x * 0.5 + 0.5) * this.width - this.pointer.x;
      const dy = (-this.tmp.y * 0.5 + 0.5) * this.height - this.pointer.y;
      const d = dx * dx + dy * dy;
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  update(dt, t) {
    this.age += dt;
    const a = this.age;
    const o = this.orbit;

    if (!this.reduced) {
      // 1) raster reveal, 2) inflate to depth, 3) idle sway
      this.uniforms.uReveal.value = a < REVEAL_END ? -0.05 + 1.12 * easeInOut(clamp01(a / REVEAL_END)) : 2;
      // scanner beam: the reveal edge during the intro, then a slow periodic sweep over the flat scan
      this.uniforms.uBeam.value =
        a < REVEAL_END ? this.uniforms.uReveal.value : this.mode === "flat" ? ((t * 0.15) % 1) * 1.4 - 0.2 : -1;
      if (o.idleFor() > 2.5) {
        const w = this.mode === "depth" ? clamp01((a - REVEAL_END) / (INFLATE_END - REVEAL_END)) : 0;
        const autoYaw = w * (-0.42 * Math.cos((a - INFLATE_END) * 0.3 * (a > INFLATE_END ? 1 : 0)));
        const autoPitch = w * 0.06 * Math.sin(a * 0.23);
        const k = Math.min(1, dt * 1.6);
        o.tYaw += (autoYaw - o.tYaw) * k;
        o.tPitch += (autoPitch - o.tPitch) * k;
      }
      this.uniforms.uSlice.value = this.mode === "depth" && a > INFLATE_END ? ((t * 0.17) % 1) * 1.4 - 0.2 : -1;
    }

    const target = this.mode === "depth" && (this.reduced || a > REVEAL_END) ? DEPTH_ON : FLAT;
    this.depthNow += (target - this.depthNow) * (this.reduced || dt === 0 ? 1 : Math.min(1, dt * 2.4));
    this.uniforms.uDepth.value = this.depthNow;

    o.update(dt === 0 ? 1 : dt);
    this.group.rotation.set(o.pitch, o.yaw, 0);
    this.group.updateMatrixWorld();

    // probe
    const idx = this.pick();
    if (idx !== this.probeIdx) {
      this.probeIdx = idx;
      if (idx >= 0) {
        const { grid, depth, glyph } = this.pts;
        this.uniforms.uProbe.value.set(grid[idx * 2], grid[idx * 2 + 1]);
        this.onProbe?.({
          row: Math.floor(grid[idx * 2 + 1] * this.rows),
          col: Math.floor(grid[idx * 2] * this.cols),
          depth: depth[idx],
          glyph: glyph[idx],
        });
      } else this.onProbe?.(null);
    }
    this.probeOn += ((idx >= 0 ? 1 : 0) - this.probeOn) * (dt === 0 ? 1 : Math.min(1, dt * 10));
    this.uniforms.uProbeOn.value = this.probeOn;
  }

  dispose() {
    this.orbit.dispose();
    this.canvas.removeEventListener("pointermove", this.onMove);
    this.canvas.removeEventListener("pointerleave", this.onLeave);
    super.dispose();
  }
}
