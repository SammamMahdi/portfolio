import * as THREE from "three";
import { Stage, AMBER, AMBER_HI, AMBER_DIM, ALERT, LINE, LO, easeInOut, clamp01 } from "./core.js";
import { DragOrbit } from "./orbit.js";
import { CAPTURE_CAM, LOOK_AT, OBJECTS, CAMERAS, extents, detections, applySim3 } from "./labData.js";

const FAINT = LINE;

const DOT_VERT = /* glsl */ `
attribute vec3 aAli;
attribute vec2 aU;
uniform float uAlign;
uniform float uSize;
varying float vU;
void main() {
  vec3 p = mix(position, aAli, uAlign);
  vU = mix(aU.x, aU.y, uAlign);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.75 + 0.7 * vU) * (5.0 / -mv.z);
}`;

const DOT_FRAG = /* glsl */ `
uniform vec3 uLo;
uniform vec3 uMid;
uniform vec3 uHi;
varying float vU;
void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  float a = smoothstep(0.5, 0.15, r);
  vec3 col = vU < 0.7 ? mix(uLo, uMid, vU / 0.7) : mix(uMid, uHi, (vU - 0.7) / 0.3);
  gl_FragColor = vec4(col, a * (0.3 + 0.7 * vU));
}`;

const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);

/** Rank-normalise to 0..1 (AUSE only depends on the ordering, so show the ordering). */
function ranks(u) {
  const idx = Array.from(u, (_, i) => i).sort((a, b) => u[a] - u[b]);
  const out = new Float32Array(u.length);
  idx.forEach((i, r) => (out[i] = r / (u.length - 1)));
  return out;
}

function lines(color, opacity = 1, dashed = false) {
  const m = dashed
    ? new THREE.LineDashedMaterial({ color, transparent: true, opacity, dashSize: 0.05, gapSize: 0.04 })
    : new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  return new THREE.LineSegments(new THREE.BufferGeometry(), m);
}

function setSegments(obj, arr) {
  obj.geometry.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
  obj.geometry.computeBoundingSphere();
  if (obj.material.isLineDashedMaterial) obj.computeLineDistances();
}

/** Unit cube edges (12 segments) for scaling into boxes. */
const CUBE = (() => {
  const g = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
  return Array.from(g.attributes.position.array);
})();

function boxSegments(c, size, out = []) {
  for (let i = 0; i < CUBE.length; i += 3) out.push(c[0] + CUBE[i] * size[0], c[1] + CUBE[i + 1] * size[1], c[2] + CUBE[i + 2] * size[2]);
  return out;
}

function frustumSegments(pos, target, fovDeg, depth = 0.42, aspect = 4 / 3, out = []) {
  const m = new THREE.Matrix4().lookAt(v3(pos), v3(target), new THREE.Vector3(0, 1, 0));
  const hw = Math.tan(THREE.MathUtils.degToRad(fovDeg / 2)) * depth, hh = hw / aspect;
  const o = v3(pos);
  const corners = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) =>
    new THREE.Vector3(x, y, -depth).applyMatrix4(m).add(o)
  );
  const push = (a, b) => out.push(a.x, a.y, a.z, b.x, b.y, b.z);
  corners.forEach((c, i) => { push(o, c); push(c, corners[(i + 1) % 4]); });
  // "up" tick so orientation reads at a glance
  const top = new THREE.Vector3(0, hh * 1.5, -depth).applyMatrix4(m).add(o);
  push(corners[2], top); push(top, corners[3]);
  return out;
}

export class LabScene extends Stage {
  constructor(canvas, { reducedMotion = false, onPovExit } = {}) {
    super(canvas, { fov: 38 });
    this.reduced = reducedMotion;
    this.onPovExit = onPovExit;
    this.demo = "revar3r";
    this.align = 0;
    this.alignTarget = 0;
    this.pov = false;
    this.povT = 0;
    this.camId = "normal";

    this.orbit = new DragOrbit(canvas, {
      yawLimit: 1.3,
      pitchLimit: 0.42,
      onInteract: () => {
        if (this.pov) {
          this.pov = false;
          this.onPovExit?.();
        }
      },
    });

    // shared room outline
    this.room = lines(FAINT, 1);
    const r = [];
    const fl = [[-1.6, 0, -1.6], [1.6, 0, -1.6], [1.6, 0, 0.8], [-1.6, 0, 0.8]];
    fl.forEach((p, i) => r.push(...p, ...fl[(i + 1) % 4]));
    r.push(-1.6, 0, -1.6, -1.6, 1.35, -1.6, 1.6, 0, -1.6, 1.6, 1.35, -1.6, -1.6, 1.35, -1.6, 1.6, 1.35, -1.6);
    for (let x = -1.2; x <= 1.21; x += 0.4) r.push(x, 0, -1.6, x, 0, 0.8);
    for (let z = -1.2; z <= 0.41; z += 0.4) r.push(-1.6, 0, z, 1.6, 0, z);
    setSegments(this.room, r);
    this.scene.add(this.room);

    this.buildRevar();
    this.buildCamdet();
    this.setDemo("revar3r");
  }

  /* ── ReVar3R ───────────────────────────────────────────────────────── */
  buildRevar() {
    this.revar = new THREE.Group();
    this.dotUniforms = {
      uAlign: { value: 0 },
      uSize: { value: 2.6 * this.renderer.getPixelRatio() },
      uLo: { value: LO.clone() },
      uMid: { value: AMBER.clone() },
      uHi: { value: AMBER_HI.clone() },
    };
    this.dots = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.ShaderMaterial({
        vertexShader: DOT_VERT,
        fragmentShader: DOT_FRAG,
        uniforms: this.dotUniforms,
        transparent: true,
        depthWrite: false,
      })
    );
    this.dots.frustumCulled = false;
    this.revar.add(this.dots);

    this.triads = lines(AMBER_HI, 0.9);
    this.revar.add(this.triads);

    this.capture = lines(AMBER_DIM, 1);
    setSegments(this.capture, frustumSegments(CAPTURE_CAM, LOOK_AT, 60, 0.36));
    this.revar.add(this.capture);
    this.scene.add(this.revar);
  }

  setEnsemble(ens) {
    const { K, n, raw, alignedGT } = ens;
    const pos = new Float32Array(K * n * 3), ali = new Float32Array(K * n * 3), u = new Float32Array(K * n * 2);
    const rr = ranks(ens.uRaw), ra = ranks(ens.uAligned);
    for (let k = 0; k < K; k++) {
      pos.set(raw[k], k * n * 3);
      ali.set(alignedGT[k], k * n * 3);
      for (let i = 0; i < n; i++) {
        u[(k * n + i) * 2] = rr[i];
        u[(k * n + i) * 2 + 1] = ra[i];
      }
    }
    const g = this.dots.geometry;
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aAli", new THREE.BufferAttribute(ali, 3));
    g.setAttribute("aU", new THREE.BufferAttribute(u, 2));

    // each run's gauge frame: a small axis triad at the scene centre
    const L = 0.32, tri = [0, 0, 0, L, 0, 0, 0, 0, 0, 0, L, 0, 0, 0, 0, 0, 0, L];
    this.triRaw = [];
    this.triAli = [];
    for (let k = 0; k < K; k++) {
      const a = applySim3(tri, ens.gauges[k]);
      this.triRaw.push(...a);
      this.triAli.push(...applySim3(applySim3(a, ens.aligns[k]), ens.toGT));
    }
    setSegments(this.triads, this.triRaw);
    this.syncTriads();
    if (!this.active) this.renderOnce();
  }

  syncTriads() {
    if (!this.triRaw) return;
    const p = this.triads.geometry.attributes.position.array, a = this.align;
    for (let i = 0; i < p.length; i++) p[i] = this.triRaw[i] + (this.triAli[i] - this.triRaw[i]) * a;
    this.triads.geometry.attributes.position.needsUpdate = true;
  }

  setAlign(on) {
    this.alignTarget = on ? 1 : 0;
    if (this.reduced) this.align = this.alignTarget;
    if (!this.active) this.renderOnce();
  }

  /* ── CAMDet ────────────────────────────────────────────────────────── */
  buildCamdet() {
    this.camdet = new THREE.Group();
    this.gtBoxes = lines(AMBER_DIM, 1, true);
    setSegments(this.gtBoxes, OBJECTS.flatMap((o) => boxSegments(o.c, extents(o))));
    this.camdet.add(this.gtBoxes);

    this.frusta = CAMERAS.map((c) => {
      const f = lines(AMBER_DIM, 1);
      setSegments(f, frustumSegments(c.pos, LOOK_AT, c.fov));
      this.camdet.add(f);
      return f;
    });
    this.rays = lines(AMBER_DIM, 0.8, true);
    this.blindBoxes = lines(ALERT, 1);
    this.condBoxes = lines(AMBER, 1);
    this.camdet.add(this.rays, this.blindBoxes, this.condBoxes);
    this.det = detections(CAMERAS[1]);
    this.detFrom = this.det;
    this.detT = 1;
    this.scene.add(this.camdet);
  }

  setGtCloud(gt) {
    const pts = new THREE.Points(
      new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(gt, 3)),
      new THREE.PointsMaterial({ color: AMBER_DIM, size: 1.6 * this.renderer.getPixelRatio(), sizeAttenuation: false, transparent: true, opacity: 0.9 })
    );
    this.camdet.add(pts);
  }

  setCamera(id) {
    if (id === this.camId) return;
    this.camId = id;
    this.detFrom = this.currentDet();
    this.det = detections(CAMERAS.find((c) => c.id === id));
    this.detT = this.reduced ? 1 : 0;
    if (!this.active) this.renderOnce();
  }

  setPov(on) {
    this.pov = on;
    if (this.reduced) this.povT = on ? 1 : 0;
    if (!this.active) this.renderOnce();
  }

  currentDet() {
    const t = easeInOut(clamp01(this.detT));
    const mix = (a, b) => a.map((x, i) => x + (b[i] - x) * t);
    return this.det.map((d, i) => {
      const f = this.detFrom[i];
      return {
        blind: { c: mix(f.blind.c, d.blind.c), scale: f.blind.scale + (d.blind.scale - f.blind.scale) * t },
        cond: { c: mix(f.cond.c, d.cond.c), scale: f.cond.scale + (d.cond.scale - f.cond.scale) * t },
        size: d.size,
      };
    });
  }

  syncCamdet() {
    const cam = CAMERAS.find((c) => c.id === this.camId);
    const det = this.currentDet();
    const blind = [], cond = [], rays = [];
    det.forEach((d) => {
      boxSegments(d.blind.c, d.size.map((s) => s * d.blind.scale), blind);
      boxSegments(d.cond.c, d.size.map((s) => s * d.cond.scale), cond);
      const far = d.blind.scale > d.cond.scale ? d.blind.c : d.cond.c;
      rays.push(...cam.pos, ...far);
    });
    setSegments(this.blindBoxes, blind);
    setSegments(this.condBoxes, cond);
    setSegments(this.rays, rays);
    this.frusta.forEach((f, i) => {
      const sel = CAMERAS[i].id === this.camId;
      f.material.color.copy(sel ? AMBER_HI : AMBER_DIM);
      f.visible = !(sel && this.povT > 0.98);
    });
  }

  /* ── shared ────────────────────────────────────────────────────────── */
  setDemo(demo) {
    this.demo = demo;
    this.revar.visible = demo === "revar3r";
    this.camdet.visible = demo === "camdet";
    this.base = demo === "revar3r"
      ? { target: new THREE.Vector3(0, 0.35, -0.4), yaw: 0.62, pitch: 0.42, dist: 4.9 }
      : { target: new THREE.Vector3(0, 0.45, -0.35), yaw: 1.08, pitch: 0.5, dist: 7.6 };
    this.orbit.setTarget(0, 0);
    this.orbit.yaw = this.orbit.pitch = 0;
    if (demo !== "camdet") this.pov = false;
    if (!this.active) this.renderOnce();
  }

  onResize() {
    this.dotUniforms.uSize.value = 2.6 * this.renderer.getPixelRatio();
  }

  update(dt, t) {
    const k = this.reduced ? 1 : Math.min(1, dt * 3.2);
    const o = this.orbit;

    if (!this.reduced && !this.pov && o.idleFor() > 4) {
      const auto = Math.sin(t * 0.16) * 0.32;
      o.tYaw += (auto - o.tYaw) * Math.min(1, dt * 0.6);
    }
    o.update(dt === 0 ? 1 : dt);

    if (this.demo === "revar3r") {
      this.align += (this.alignTarget - this.align) * (this.reduced || dt === 0 ? 1 : Math.min(1, dt * 2.2));
      if (Math.abs(this.alignTarget - this.align) < 1e-3) this.align = this.alignTarget;
      this.dotUniforms.uAlign.value = easeInOut(this.align);
      this.syncTriads();
    } else {
      this.detT = Math.min(1, this.detT + (this.reduced || dt === 0 ? 1 : dt * 1.4));
      this.povT += ((this.pov ? 1 : 0) - this.povT) * (dt === 0 && this.reduced ? 1 : k);
      this.syncCamdet();
    }

    // orbit pose
    const b = this.base;
    const yaw = b.yaw + o.yaw, pitch = b.pitch + o.pitch;
    const eye = new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.cos(yaw) * Math.cos(pitch)
    ).multiplyScalar(b.dist / Math.max(0.65, Math.min(1, this.camera.aspect * 0.85))).add(b.target);
    const qOrbit = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(eye, b.target, new THREE.Vector3(0, 1, 0)));
    let fov = 38;

    if (this.demo === "camdet" && this.povT > 1e-3) {
      const cam = CAMERAS.find((c) => c.id === this.camId);
      const eyeC = v3(cam.pos);
      const qC = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(eyeC, v3(LOOK_AT), new THREE.Vector3(0, 1, 0)));
      const vfov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) / Math.max(1, this.camera.aspect)));
      const s = easeInOut(clamp01(this.povT));
      eye.lerp(eyeC, s);
      qOrbit.slerp(qC, s);
      fov += (vfov - fov) * s;
    }
    this.camera.position.copy(eye);
    this.camera.quaternion.copy(qOrbit);
    if (Math.abs(this.camera.fov - fov) > 1e-3) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
  }

  dispose() {
    this.orbit.dispose();
    super.dispose();
  }
}
