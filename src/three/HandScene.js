import * as THREE from "three";
import { Stage, AMBER, AMBER_HI, AMBER_DIM, ALERT } from "./core.js";
import { DragOrbit } from "./orbit.js";

/**
 * A 21-landmark hand (MediaPipe Hands topology) performing the mouse gestures
 * of the gesture-keyboard project's open-source controller. Gesture state is
 * not scripted: it is read back from the skeleton with that code's rules
 * (a finger is "down" when its tip is below its PIP joint).
 */
const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
];

// right hand, palm toward the camera (+z), fingers up (+y); units ≈ palm width
const FINGERS = [
  { name: "index", mcp: [0.3, 0.92, 0], fan: -0.1, len: [0.4, 0.24, 0.2], ids: [5, 6, 7, 8] },
  { name: "middle", mcp: [0.09, 0.98, 0], fan: -0.02, len: [0.45, 0.28, 0.21], ids: [9, 10, 11, 12] },
  { name: "ring", mcp: [-0.12, 0.93, 0], fan: 0.06, len: [0.42, 0.26, 0.2], ids: [13, 14, 15, 16] },
  { name: "pinky", mcp: [-0.31, 0.82, 0], fan: 0.16, len: [0.33, 0.2, 0.18], ids: [17, 18, 19, 20] },
];
const THUMB = {
  cmc: [0.24, 0.22, 0.06],
  len: [0.32, 0.28, 0.24],
  rest: [[0.7, 0.62, 0.3], [0.55, 0.8, 0.2], [0.45, 0.88, 0.15]],
  flex: [[-0.2, 0.75, 0.6], [-0.75, 0.3, 0.6], [-0.9, -0.1, 0.4]],
};

// curl order: thumb, index, middle, ring, pinky
export const GESTURES = [
  { id: "move", label: "move", rule: "index fingertip drives the cursor", dur: 2.6, curl: [0, 0, 0, 0, 0], moves: true },
  { id: "click", label: "left click", rule: "pinky tip drops below its PIP joint", dur: 1.7, curl: [0, 0, 0, 0, 1], tap: true },
  { id: "move", label: "move", rule: "index fingertip drives the cursor", dur: 2.2, curl: [0, 0, 0, 0, 0], moves: true },
  { id: "right", label: "right click", rule: "ring tip drops below its PIP joint", dur: 1.7, curl: [0, 0, 0, 1, 0], tap: true },
  { id: "drag", label: "drag", rule: "middle tip held below its PIP joint", dur: 3.2, curl: [0, 0, 1, 0, 0], moves: true },
  { id: "exit", label: "exit", rule: "rock and roll: index + pinky up, middle + ring curled", dur: 2.6, curl: [0.75, 0, 1, 1, 0] },
];

const n3 = (v) => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

const PVERT = /* glsl */ `
attribute float aSize;
attribute float aGlow;
uniform float uScale;
varying float vGlow;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uScale / -mv.z;
  vGlow = aGlow;
}`;
const PFRAG = /* glsl */ `
uniform vec3 uA;
uniform vec3 uB;
varying float vGlow;
void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  float ring = smoothstep(0.5, 0.38, r) * (1.0 - smoothstep(0.3, 0.18, r) * (1.0 - vGlow));
  gl_FragColor = vec4(mix(uA, uB, vGlow), ring);
}`;

export class HandScene extends Stage {
  constructor(canvas, { reducedMotion = false, onState, onCursor } = {}) {
    super(canvas, { fov: 32 });
    this.reduced = reducedMotion;
    this.onState = onState;
    this.onCursor = onCursor;
    this.curl = [0, 0, 0, 0, 0];
    this.gi = 0;
    this.gt = 0;
    this.prev = {};
    this.P = Array.from({ length: 21 }, () => [0, 0, 0]);

    this.bones = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(EDGES.length * 6), 3)),
      new THREE.LineBasicMaterial({ color: AMBER, transparent: true, opacity: 0.85 })
    );
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(21 * 3), 3));
    const size = new Float32Array(21).fill(0.07);
    [4, 8, 12, 16, 20].forEach((i) => (size[i] = 0.11));
    pg.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    pg.setAttribute("aGlow", new THREE.BufferAttribute(new Float32Array(21), 1));
    this.u = { uScale: { value: 400 }, uA: { value: AMBER.clone() }, uB: { value: AMBER_HI.clone() } };
    this.joints = new THREE.Points(pg, new THREE.ShaderMaterial({ vertexShader: PVERT, fragmentShader: PFRAG, uniforms: this.u, transparent: true, depthWrite: false }));
    // the controller's rule, drawn: a tick at each PIP joint; the tip "clicks" when it falls below it
    this.ticks = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(4 * 6), 3)),
      new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.95 })
    );
    this.ticks.geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(4 * 6), 3));

    this.hand = new THREE.Group();
    this.hand.add(this.bones, this.joints, this.ticks);
    this.pivot = new THREE.Group();
    this.pivot.add(this.hand);
    this.pivot.position.y = -0.75;
    this.scene.add(this.pivot);
    this.camera.position.set(0, 0, 4.4);

    this.orbit = new DragOrbit(canvas, { yaw: -0.25, pitch: 0.05, yawLimit: 1.0, pitchLimit: 0.5 });
    this.solve();
  }

  /** Forward kinematics from the current curls. */
  solve() {
    const P = this.P;
    P[0] = [0, 0, 0];
    // thumb
    let p = THUMB.cmc;
    P[1] = p;
    for (let s = 0; s < 3; s++) {
      const c = Math.min(1, this.curl[0] * (0.7 + s * 0.25));
      const r = THUMB.rest[s], f = THUMB.flex[s];
      const d = n3([r[0] + (f[0] - r[0]) * c, r[1] + (f[1] - r[1]) * c, r[2] + (f[2] - r[2]) * c]);
      p = [p[0] + d[0] * THUMB.len[s], p[1] + d[1] * THUMB.len[s], p[2] + d[2] * THUMB.len[s]];
      P[2 + s] = p;
    }
    // fingers: flexion about the finger's lateral axis, toward the palm (+z)
    FINGERS.forEach((f, k) => {
      const c = this.curl[k + 1];
      const ux = -Math.sin(f.fan), uy = Math.cos(f.fan);
      const angles = [c * 1.35, c * 1.75, c * 1.1];
      let q = f.mcp, th = 0;
      P[f.ids[0]] = q;
      for (let s = 0; s < 3; s++) {
        th += angles[s];
        q = [q[0] + ux * Math.cos(th) * f.len[s], q[1] + uy * Math.cos(th) * f.len[s], q[2] + Math.sin(th) * f.len[s]];
        P[f.ids[s + 1]] = q;
      }
    });

    const b = this.bones.geometry.attributes.position.array;
    EDGES.forEach(([i, j], e) => b.set([...P[i], ...P[j]], e * 6));
    this.bones.geometry.attributes.position.needsUpdate = true;
    const jp = this.joints.geometry.attributes.position.array;
    P.forEach((v, i) => jp.set(v, i * 3));
    this.joints.geometry.attributes.position.needsUpdate = true;
  }

  /** The controller's rules, evaluated on the skeleton (y up here, so "below" is a smaller y). */
  read() {
    const P = this.P;
    const down = (tip, pip, m = 0) => P[tip][1] < P[pip][1] - m;
    const up = (tip, pip, m = 0) => P[tip][1] > P[pip][1] + m;
    const fingers = { index: down(8, 6), middle: down(12, 10), ring: down(16, 14), pinky: down(20, 18) };
    const M = 0.1; // the code's 0.04 image-height threshold, in hand units
    const rock = up(8, 6, M) && up(20, 18, M) && down(12, 10, M) && down(16, 14, M);
    return { fingers, rock };
  }

  onResize(w, h) {
    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const fit = 1.45;
    this.camera.position.z = Math.max(fit / tan, fit / (tan * this.camera.aspect));
    this.u.uScale.value = (h * this.renderer.getPixelRatio()) / (2 * tan);
  }

  update(dt, t) {
    const g = GESTURES[this.gi];
    if (!this.reduced) {
      this.gt += dt;
      if (this.gt > g.dur) {
        this.gt = 0;
        this.gi = (this.gi + 1) % GESTURES.length;
      }
    }
    // target curls: taps go down and back up inside the gesture window
    const ph = this.gt / g.dur;
    const tap = g.tap ? Math.sin(Math.min(1, Math.max(0, (ph - 0.25) / 0.45)) * Math.PI) : 1;
    const k = this.reduced || dt === 0 ? 1 : Math.min(1, dt * 9);
    for (let i = 0; i < 5; i++) this.curl[i] += (g.curl[i] * tap - this.curl[i]) * k;
    this.solve();

    // hand drifts while moving the cursor (and while dragging)
    const mv = g.moves && !this.reduced ? 1 : 0;
    const hx = 0.42 * Math.sin(t * 1.25) * mv, hy = 0.26 * Math.sin(t * 2.1) * mv;
    this.hand.position.x += (hx - this.hand.position.x) * Math.min(1, dt * 4 || 1);
    this.hand.position.y += (hy - this.hand.position.y) * Math.min(1, dt * 4 || 1);

    const { fingers, rock } = this.read();
    // PIP ticks
    const tp = this.ticks.geometry.attributes.position.array, tc = this.ticks.geometry.attributes.color.array;
    const on = ALERT, off = AMBER_DIM;
    FINGERS.forEach((f, k) => {
      const pip = this.P[f.ids[1]];
      tp.set([pip[0] - 0.09, pip[1], pip[2], pip[0] + 0.09, pip[1], pip[2]], k * 6);
      const col = fingers[f.name] ? on : off;
      tc.set([col.r, col.g, col.b, col.r, col.g, col.b], k * 6);
    });
    this.ticks.geometry.attributes.position.needsUpdate = true;
    this.ticks.geometry.attributes.color.needsUpdate = true;
    const glow = this.joints.geometry.attributes.aGlow.array;
    glow.fill(0);
    glow[8] = 1;
    if (fingers.middle) glow[12] = 1;
    if (fingers.ring) glow[16] = 1;
    if (fingers.pinky) glow[20] = 1;
    this.joints.geometry.attributes.aGlow.needsUpdate = true;

    // edge-triggered events, as in the controller
    const ev = [];
    if (fingers.pinky && !this.prev.pinky) ev.push("click");
    if (fingers.ring && !this.prev.ring) ev.push("right");
    if (fingers.middle && !this.prev.middle) ev.push("grab");
    if (!fingers.middle && this.prev.middle) ev.push("release");
    if (rock && !this.prev.rock) ev.push("exit");
    const key = `${this.gi}|${fingers.index}${fingers.middle}${fingers.ring}${fingers.pinky}${rock}`;
    if (key !== this.prev.key || ev.length) this.onState?.({ gesture: g, fingers, rock, events: ev });
    this.prev = { ...fingers, rock, key };

    const o = this.orbit;
    if (!this.reduced && o.idleFor() > 3) o.tYaw += (-0.25 + 0.2 * Math.sin(t * 0.3) - o.tYaw) * Math.min(1, dt);
    o.update(dt === 0 ? 1 : dt);
    this.pivot.rotation.set(o.pitch, o.yaw, 0);

    // cursor follows the index fingertip (relative to where it rests), as the controller's pointer does
    const tip = this.P[8], px = tip[0] + this.hand.position.x, py = tip[1] + this.hand.position.y;
    const cl = (v) => Math.min(0.96, Math.max(0.04, v));
    this.onCursor?.(cl(0.5 + (px - 0.3) / 1.05), cl(0.5 - (py - 1.75) / 0.7));
  }

  dispose() {
    this.orbit.dispose();
    super.dispose();
  }
}
