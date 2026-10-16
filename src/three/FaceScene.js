import * as THREE from "three";
import { Stage, AMBER, AMBER_HI, AMBER_DIM, ALERT, LINE } from "./core.js";
import { DragOrbit } from "./orbit.js";
import { FACE, REGIONS, IMPORTANCE, TOP10 } from "@/data/faceMesh";

/**
 * The stroke paper's pipeline on my own face mesh: MediaPipe tessellation ->
 * 468 landmarks -> the paper's 228 selected features across 29 regions ->
 * nose-tip/eye-distance normalisation -> region importance from the paper's
 * XAI -> a simulated one-sided droop and how far it moves the y/x signature.
 */
export const STEPS = ["mesh", "landmarks", "select", "normalize", "xai", "droop"];

const VERT = /* glsl */ `
attribute float aImp;
attribute float aSel;
attribute float aTop;
uniform float uSel;
uniform float uImp;
uniform float uSize;
uniform float uScale;
varying float vA;
varying float vHeat;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float keep = mix(1.0, mix(0.1, 1.0, aSel), uSel);
  vHeat = mix(0.55, aImp, uImp);
  vA = keep;
  float grow = 1.0 + uImp * aTop * 0.9;
  gl_PointSize = uSize * uScale * grow / -mv.z;
}`;

const FRAG = /* glsl */ `
uniform vec3 uLo;
uniform vec3 uMid;
uniform vec3 uHi;
uniform float uAlpha;
varying float vA;
varying float vHeat;
void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  vec3 col = vHeat < 0.5 ? mix(uLo, uMid, vHeat * 2.0) : mix(uMid, uHi, (vHeat - 0.5) * 2.0);
  gl_FragColor = vec4(col, smoothstep(0.5, 0.2, r) * vA * uAlpha);
}`;

const PAIRS = [
  [61, 291], // mouth corners
  [205, 425], // cheeks
  [33, 263], // outer eye corners
  [105, 334], // brows
];

function rotate(p, yaw, roll) {
  // undo head roll (about z) then yaw (about y)
  const cr = Math.cos(-roll), sr = Math.sin(-roll);
  const x1 = p[0] * cr - p[1] * sr, y1 = p[0] * sr + p[1] * cr, z1 = p[2];
  const cy = Math.cos(-yaw), sy = Math.sin(-yaw);
  return [x1 * cy + z1 * sy, y1, -x1 * sy + z1 * cy];
}

export class FaceScene extends Stage {
  constructor(canvas, { reducedMotion = false, onReadout } = {}) {
    super(canvas, { fov: 28 });
    this.reduced = reducedMotion;
    this.onReadout = onReadout;
    this.step = "mesh";
    this.droop = 0;

    // frontalise for display: level the eyes, then equalise their depth
    const N = 468;
    const raw = [];
    for (let i = 0; i < N; i++) raw.push(FACE.pos.slice(i * 3, i * 3 + 3));
    const a = raw[33], b = raw[263];
    const roll = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const a1 = rotate(a, 0, roll), b1 = rotate(b, 0, roll);
    const yaw = Math.atan2(b1[2] - a1[2], b1[0] - a1[0]);
    this.base = raw.map((p) => rotate(p, -yaw, roll));

    // per-landmark region attributes
    const maxImp = Math.max(...Object.values(IMPORTANCE));
    const imp = new Float32Array(N), sel = new Float32Array(N), top = new Float32Array(N);
    const top10 = new Set(TOP10);
    for (const [region, ids] of Object.entries(REGIONS)) {
      for (const id of ids) {
        sel[id] = 1;
        imp[id] = Math.max(imp[id], (IMPORTANCE[region] || 0) / maxImp);
        if (top10.has(region)) top[id] = 1;
      }
    }
    this.top10Ids = [...new Set(TOP10.flatMap((r) => REGIONS[r]))];

    // droop weights: subject's right side (image left, x < 0), centred on the mouth corner and cheek
    const at = (i) => this.base[i];
    const g = (p, c, s) => Math.exp(-((p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2) / (2 * s * s));
    this.droopW = this.base.map((p) => {
      const side = Math.min(1, Math.max(0, (0.06 - p[0]) / 0.2));
      return side * Math.min(1, g(p, at(61), 0.42) + 0.55 * g(p, at(205), 0.35) + 0.3 * g(p, at(145), 0.16));
    });

    this.posAttr = new THREE.BufferAttribute(new Float32Array(N * 3), 3);
    this.posAttr.setUsage(THREE.DynamicDrawUsage);
    this.applyDroop(0);

    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", this.posAttr);
    pg.setAttribute("aImp", new THREE.BufferAttribute(imp, 1));
    pg.setAttribute("aSel", new THREE.BufferAttribute(sel, 1));
    pg.setAttribute("aTop", new THREE.BufferAttribute(top, 1));
    this.u = {
      uSel: { value: 0 },
      uImp: { value: 0 },
      uSize: { value: 0.028 },
      uScale: { value: 400 },
      uAlpha: { value: 0.55 },
      uLo: { value: LINE.clone() },
      uMid: { value: AMBER.clone() },
      uHi: { value: AMBER_HI.clone() },
    };
    this.points = new THREE.Points(
      pg,
      new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: this.u, transparent: true, depthWrite: false })
    );

    const edges = new Uint16Array(Uint8Array.from(atob(FACE.edges), (c) => c.charCodeAt(0)).buffer);
    const eg = new THREE.BufferGeometry();
    eg.setAttribute("position", this.posAttr);
    eg.setIndex(new THREE.BufferAttribute(edges, 1));
    this.mesh = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color: AMBER, transparent: true, opacity: 0.55, depthWrite: false }));

    // normalisation overlay: origin cross at the nose tip + the eye-corner unit segment
    this.norm = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: AMBER_HI, transparent: true, opacity: 0 })
    );
    // symmetry pairs for the droop step
    this.pairs = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: ALERT, transparent: true, opacity: 0 })
    );

    this.group = new THREE.Group();
    this.group.add(this.mesh, this.points, this.norm, this.pairs);
    this.scene.add(this.group);
    this.syncOverlays();

    // centre of the face for framing
    const box = new THREE.Box3().setFromBufferAttribute(this.posAttr);
    this.center = box.getCenter(new THREE.Vector3());
    this.group.position.copy(this.center).multiplyScalar(-1);
    this.pivot = new THREE.Group();
    this.scene.remove(this.group);
    this.pivot.add(this.group);
    this.scene.add(this.pivot);

    this.orbit = new DragOrbit(canvas, { yaw: 0.45, pitch: -0.05, yawLimit: 1.3, pitchLimit: 0.5, onInteract: () => this.onUser?.() });
    this.neutral = this.signature();
    this.tilt0 = this.tilt();
  }

  applyDroop(d) {
    const arr = this.posAttr.array;
    for (let i = 0; i < this.base.length; i++) {
      const [x, y, z] = this.base[i], w = this.droopW[i] * d;
      arr[i * 3] = x + w * 0.03;
      arr[i * 3 + 1] = y - w * 0.2;
      arr[i * 3 + 2] = z - w * 0.05;
    }
    this.posAttr.needsUpdate = true;
  }

  p(i) {
    const a = this.posAttr.array;
    return [a[i * 3], a[i * 3 + 1], a[i * 3 + 2]];
  }

  /** The paper's feature: y/x of each normalised landmark (top-10 regions, as in the final model). */
  signature() {
    return this.top10Ids.map((i) => {
      const [x, y] = this.p(i);
      return Math.abs(x) < 0.06 ? null : y / x;
    });
  }

  tilt() {
    const a = this.p(61), b = this.p(291);
    return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  }

  syncOverlays() {
    const o = [0, 0, 0], L = 0.35, e1 = this.p(33), e2 = this.p(263);
    const n = [o[0] - L, o[1], o[2], o[0] + L, o[1], o[2], o[0], o[1] - L, o[2], o[0], o[1] + L, o[2]];
    n.push(...e1, ...e2);
    n.push(e1[0], e1[1] + 0.06, e1[2], e1[0], e1[1] - 0.06, e1[2], e2[0], e2[1] + 0.06, e2[2], e2[0], e2[1] - 0.06, e2[2]);
    this.norm.geometry.setAttribute("position", new THREE.Float32BufferAttribute(n, 3));
    const pr = [];
    for (const [i, j] of PAIRS) pr.push(...this.p(i), ...this.p(j));
    this.pairs.geometry.setAttribute("position", new THREE.Float32BufferAttribute(pr, 3));
  }

  setStep(step) {
    this.step = step;
    if (step !== "droop") this.setDroop(0);
    if (!this.active) this.renderOnce();
  }

  setDroop(d) {
    this.droop = d;
    this.applyDroop(d);
    this.syncOverlays();
    const s = this.signature();
    let sum = 0, n = 0;
    s.forEach((v, k) => {
      const v0 = this.neutral?.[k];
      if (v == null || v0 == null) return;
      sum += Math.min(1, Math.abs(v - v0));
      n++;
    });
    this.onReadout?.({ drift: n ? sum / n : 0, tilt: this.tilt0 == null ? 0 : this.tilt() - this.tilt0, features: n });
    if (!this.active) this.renderOnce();
  }

  onResize(w, h) {
    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const fit = 1.25;
    this.dist = Math.max(fit / tan, fit / (tan * this.camera.aspect));
    this.u.uScale.value = (h * this.renderer.getPixelRatio()) / (2 * tan);
  }

  update(dt, t) {
    const s = this.step, k = this.reduced || dt === 0 ? 1 : Math.min(1, dt * 3);
    const target = {
      mesh: s === "mesh" ? 0.55 : s === "landmarks" ? 0.1 : 0.05,
      alpha: s === "mesh" ? 0.45 : 1,
      sel: ["select", "normalize", "xai", "droop"].includes(s) ? 1 : 0,
      imp: s === "xai" || s === "droop" ? 1 : 0,
      norm: s === "normalize" ? 1 : 0,
      pairs: s === "droop" ? 1 : 0,
    };
    const m = this.mesh.material;
    m.opacity += (target.mesh - m.opacity) * k;
    this.u.uAlpha.value += (target.alpha - this.u.uAlpha.value) * k;
    this.u.uSel.value += (target.sel - this.u.uSel.value) * k;
    this.u.uImp.value += (target.imp - this.u.uImp.value) * k;
    this.norm.material.opacity += (target.norm - this.norm.material.opacity) * k;
    this.pairs.material.opacity += (target.pairs - this.pairs.material.opacity) * k;

    const o = this.orbit;
    if (!this.reduced && o.idleFor() > 3) {
      const auto = 0.45 * Math.cos(t * 0.35);
      o.tYaw += (auto - o.tYaw) * Math.min(1, dt * 0.8);
    }
    o.update(dt === 0 ? 1 : dt);
    this.pivot.rotation.set(o.pitch, o.yaw, 0);
    this.camera.position.set(0, 0, this.dist || 5);
    this.camera.lookAt(0, 0, 0);
  }

  dispose() {
    this.orbit.dispose();
    super.dispose();
  }
}
