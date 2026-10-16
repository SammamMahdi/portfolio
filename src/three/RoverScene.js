import * as THREE from "three";
import { Stage, AMBER, AMBER_HI, AMBER_DIM, ALERT, DEEP } from "./core.js";
import { mulberry32 } from "../lib/rand.js";
import { pal } from "../lib/themes.js";

/**
 * A small Mars-yard simulation in the spirit of the University Rover Challenge
 * autonomous-navigation mission: GNSS-style waypoints, a six-wheel
 * rocker-bogie rover, and a mast camera whose YOLO-style boxes are projected
 * from the objects' real 3D bounds. Written for this page; not team software.
 */
const HALF = 22; // terrain spans [-HALF, HALF] metres
const N = 100;
const ROVER_R = 0.62; // collision radius of the rover footprint
const INFLUENCE = 2.4; // rocks closer than this (edge to edge) bend the path

function makeHeight(seed) {
  const rng = mulberry32(seed);
  const G = 64, grid = new Float32Array(G * G).map(() => rng() * 2 - 1);
  const at = (i, j) => grid[(((i % G) + G) % G) * G + (((j % G) + G) % G)];
  const sm = (t) => t * t * (3 - 2 * t);
  const noise = (x, y) => {
    const i = Math.floor(x), j = Math.floor(y), u = sm(x - i), v = sm(y - j);
    const a = at(i, j), b = at(i + 1, j), c = at(i, j + 1), d = at(i + 1, j + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  return (x, z) => 1.25 * (0.9 * noise(x * 0.085, z * 0.085) + 0.32 * noise(x * 0.21 + 7, z * 0.21 + 3) + 0.1 * noise(x * 0.6 + 1, z * 0.6 + 9));
}

const edges = (geo, color, opacity = 1) =>
  new THREE.LineSegments(new THREE.EdgesGeometry(geo, 1), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));

export const TARGETS = [
  { name: "mallet", at: [9, 6] },
  { name: "bottle", at: [-6, 12] },
  { name: "aruco", at: [-11, -5] },
  { name: "home", at: [1, -9] },
];

export class RoverScene extends Stage {
  constructor(canvas, { hud, reducedMotion = false, onStatus } = {}) {
    super(canvas, { fov: 50 });
    this.reduced = reducedMotion;
    this.onStatus = onStatus;
    this.hud = hud;
    this.hctx = hud.getContext("2d");
    this.renderer.setClearColor(DEEP, 1);
    this.scene.fog = new THREE.Fog(DEEP, 9, 30);
    this.ground = makeHeight(11);

    this.buildTerrain();
    this.buildTargets();
    this.buildRover();

    this.state = { x: 1, z: -9, yaw: 0.6, v: 0, w: 0 };
    this.mode = "auto";
    this.leg = 0;
    this.pause = 0;
    this.found = new Set();
    this.keys = new Set();
    this.camYaw = 0;
    this.camPos = new THREE.Vector3(0, 6, -16);
    this.mastCam = new THREE.PerspectiveCamera(62, 4 / 3, 0.05, 40);
    this.detections = [];
    this.clearance = 9;
    this.navDir = this.state.yaw;
    this.bumped = 0;

    // safety ring (collision footprint) and the planner's heading vector
    const ring = [];
    for (let i = 0; i <= 40; i++) ring.push(new THREE.Vector3(Math.sin((i / 40) * 6.283) * ROVER_R, 0, Math.cos((i / 40) * 6.283) * ROVER_R));
    this.ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ring), new THREE.LineBasicMaterial({ color: AMBER_DIM, transparent: true, opacity: 0.9 }));
    this.navLine = new THREE.Line(
      new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3)),
      new THREE.LineDashedMaterial({ color: AMBER_HI, dashSize: 0.18, gapSize: 0.12, transparent: true, opacity: 0.9 })
    );
    this.scene.add(this.ring, this.navLine);

    canvas.addEventListener("keydown", this.onKey);
    canvas.addEventListener("keyup", this.onKey);
    canvas.addEventListener("blur", this.onBlur);
    canvas.addEventListener("pointerdown", this.onDown);
    window.addEventListener("pointermove", this.onMove);
    window.addEventListener("pointerup", this.onUp);
    this.placeRover(0);
  }

  /* ── world ─────────────────────────────────────────────────────────── */
  buildTerrain() {
    const v = [];
    const step = (2 * HALF) / (N - 1);
    const P = (i, j) => {
      const x = -HALF + i * step, z = -HALF + j * step;
      return [x, this.ground(x, z), z];
    };
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N - 1; i++) v.push(...P(i, j), ...P(i + 1, j));
    for (let i = 0; i < N; i += 2)
      for (let j = 0; j < N - 1; j++) v.push(...P(i, j), ...P(i, j + 1));
    const g = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    this.scene.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: AMBER_DIM, transparent: true, opacity: 0.55 })));

    // rocks: scattered, plus one sitting near the middle of each leg so the planner has work to do
    const rng = mulberry32(3);
    const rock = new THREE.DodecahedronGeometry(1, 0);
    this.rocks = [];
    const addRock = (x, z, s) => {
      const zs = 0.7 + rng() * 0.6;
      const r = edges(rock, AMBER, 0.75);
      r.scale.set(s, s * (0.5 + rng() * 0.4), s * zs);
      r.rotation.set(0, rng() * 3, 0);
      r.position.set(x, this.ground(x, z) + s * 0.25, z);
      this.scene.add(r);
      this.rocks.push({ x, z, r: s * Math.max(1, zs) * 0.95 });
    };
    const clearOf = (x, z, d) => TARGETS.every((t) => Math.hypot(t.at[0] - x, t.at[1] - z) > d);
    TARGETS.forEach((t, i) => {
      const prev = TARGETS[(i + TARGETS.length - 1) % TARGETS.length].at;
      const mx = (prev[0] + t.at[0]) / 2, mz = (prev[1] + t.at[1]) / 2;
      addRock(mx + (rng() - 0.5) * 0.4, mz + (rng() - 0.5) * 0.4, 0.55 + rng() * 0.2);
    });
    for (let k = 0; k < 46; k++) {
      const x = (rng() * 2 - 1) * (HALF - 2), z = (rng() * 2 - 1) * (HALF - 2);
      if (!clearOf(x, z, 3) || this.rocks.some((q) => Math.hypot(q.x - x, q.z - z) < q.r + 1.6)) continue;
      addRock(x, z, 0.18 + rng() * 0.45);
    }
  }

  buildTargets() {
    this.objects = [];
    const place = (obj, [x, z], lift = 0) => {
      obj.position.set(x, this.ground(x, z) + lift, z);
      this.scene.add(obj);
      return obj;
    };
    // mallet lying on the ground
    const mallet = new THREE.Group();
    const handle = edges(new THREE.CylinderGeometry(0.035, 0.035, 0.6, 6), AMBER_HI);
    handle.rotation.z = Math.PI / 2;
    const head = edges(new THREE.BoxGeometry(0.14, 0.14, 0.3), AMBER_HI);
    head.position.x = 0.32;
    mallet.add(handle, head);
    mallet.rotation.y = 0.7;
    this.objects.push({ name: "mallet", obj: place(mallet, TARGETS[0].at, 0.08) });
    // water bottle
    const bottle = new THREE.Group();
    const body = edges(new THREE.CylinderGeometry(0.09, 0.09, 0.42, 10), AMBER_HI);
    const neck = edges(new THREE.CylinderGeometry(0.035, 0.08, 0.12, 10), AMBER_HI);
    neck.position.y = 0.27;
    bottle.add(body, neck);
    this.objects.push({ name: "bottle", obj: place(bottle, TARGETS[1].at, 0.21) });
    // ArUco marker post
    const post = new THREE.Group();
    const pole = edges(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6), AMBER);
    pole.position.y = 0.55;
    const tex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 6;
      const x = c.getContext("2d");
      x.fillStyle = "#000";
      x.fillRect(0, 0, 6, 6);
      const bits = [0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0];
      x.fillStyle = "#ffffff"; // tinted by the material colour, so it follows the theme
      bits.forEach((b, i) => b && x.fillRect(1 + (i % 4), 1 + Math.floor(i / 4), 1, 1));
      const t = new THREE.CanvasTexture(c);
      t.magFilter = THREE.NearestFilter;
      t.minFilter = THREE.NearestFilter;
      return t;
    })();
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), new THREE.MeshBasicMaterial({ map: tex, color: AMBER_HI, side: THREE.DoubleSide }));
    plate.position.y = 1.0;
    post.add(pole, plate);
    post.rotation.y = 0.9;
    this.objects.push({ name: "aruco", obj: place(post, TARGETS[2].at) });

    // GNSS waypoint pins + the planned route
    const route = [];
    TARGETS.forEach((t, i) => {
      const [x, z] = t.at, y = this.ground(x, z);
      const pin = new THREE.Group();
      pin.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 2.2, 0)]), new THREE.LineBasicMaterial({ color: AMBER_DIM })));
      const d = edges(new THREE.OctahedronGeometry(0.16, 0), AMBER);
      d.position.y = 2.35;
      pin.add(d);
      pin.position.set(x + 1.2, y, z + 1.2);
      this.scene.add(pin);
      const prev = TARGETS[(i + TARGETS.length - 1) % TARGETS.length].at;
      for (let s = 0; s <= 24; s++) {
        const px = prev[0] + ((x - prev[0]) * s) / 24, pz = prev[1] + ((z - prev[1]) * s) / 24;
        route.push(new THREE.Vector3(px, this.ground(px, pz) + 0.05, pz));
      }
    });
    const rl = new THREE.Line(new THREE.BufferGeometry().setFromPoints(route), new THREE.LineDashedMaterial({ color: AMBER, dashSize: 0.3, gapSize: 0.35, transparent: true, opacity: 0.6 }));
    rl.computeLineDistances();
    this.scene.add(rl);
  }

  buildRover() {
    const r = new THREE.Group();
    this.body = new THREE.Group();
    const chassis = edges(new THREE.BoxGeometry(0.72, 0.22, 1.0), AMBER_HI);
    const deck = edges(new THREE.BoxGeometry(0.5, 0.08, 0.6), AMBER);
    deck.position.set(0, 0.15, -0.1);
    const mast = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.1, 0.38), new THREE.Vector3(0, 0.78, 0.38)]), new THREE.LineBasicMaterial({ color: AMBER_HI }));
    const head = edges(new THREE.BoxGeometry(0.2, 0.1, 0.12), AMBER_HI);
    head.position.set(0, 0.82, 0.4);
    const ant = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.25, 0.1, -0.42), new THREE.Vector3(-0.25, 0.75, -0.48)]), new THREE.LineBasicMaterial({ color: AMBER }));
    this.body.add(chassis, deck, mast, head, ant);
    r.add(this.body);
    this.scene.add(r);
    this.rover = r;

    const wheelGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.12, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    this.wheelOffsets = [];
    for (const sx of [-1, 1]) for (const sz of [1, 0, -1]) this.wheelOffsets.push([sx * 0.48, sz * 0.43]);
    this.wheels = this.wheelOffsets.map(() => {
      const w = edges(wheelGeo, AMBER_HI);
      this.scene.add(w);
      return w;
    });
    // per side: rocker pivot -> front wheel, rocker -> bogie, bogie -> middle and rear wheels
    this.links = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(2 * 8 * 3), 3)),
      new THREE.LineBasicMaterial({ color: AMBER })
    );
    this.scene.add(this.links);
    this.spin = 0;
  }

  placeRover(dt) {
    const s = this.state, h = this.ground;
    const c = Math.cos(s.yaw), sn = Math.sin(s.yaw);
    const W = this.wheelOffsets.map(([lx, lz]) => {
      const x = s.x + lx * c + lz * sn, z = s.z - lx * sn + lz * c;
      return new THREE.Vector3(x, h(x, z) + 0.16, z);
    });
    this.spin += (s.v * dt) / 0.16;
    W.forEach((p, i) => {
      this.wheels[i].position.copy(p);
      this.wheels[i].rotation.set(this.spin, s.yaw, 0, "YXZ");
    });
    // rocker-bogie: the body rides on the mean of its wheels and takes their tilt
    const avg = (ids) => ids.reduce((a, i) => a + W[i].y, 0) / ids.length;
    const front = avg([0, 3]), rear = avg([2, 5]), left = avg([0, 1, 2]), right = avg([3, 4, 5]);
    this.rover.position.set(s.x, (left + right) / 2 + 0.24, s.z);
    this.rover.rotation.set(0, s.yaw, 0, "YXZ");
    this.body.rotation.set(-Math.atan2(front - rear, 0.86), 0, Math.atan2(left - right, 0.96), "YXZ");
    this.rover.updateMatrixWorld();
    // rocker-bogie links from each side's pivots to its wheels
    const lp = this.links.geometry.attributes.position.array;
    [-1, 1].forEach((sx, side) => {
      const pivot = new THREE.Vector3(sx * 0.42, -0.06, 0.05).applyMatrix4(this.body.matrixWorld);
      const bogie = new THREE.Vector3(sx * 0.46, -0.14, -0.22).applyMatrix4(this.body.matrixWorld);
      const [front, mid, rear] = side === 0 ? [0, 1, 2] : [3, 4, 5];
      [pivot, W[front], pivot, bogie, bogie, W[mid], bogie, W[rear]].forEach((p, k) => lp.set([p.x, p.y, p.z], (side * 8 + k) * 3));
    });
    this.links.geometry.attributes.position.needsUpdate = true;
  }

  /* ── input ─────────────────────────────────────────────────────────── */
  onKey = (e) => {
    const k = e.key.toLowerCase();
    if (!["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) return;
    e.preventDefault();
    if (e.type === "keydown") {
      this.keys.add(k);
      this.setMode("teleop");
    } else this.keys.delete(k);
  };

  onBlur = () => this.keys.clear();

  press(k, on) {
    if (on) {
      this.keys.add(k);
      this.setMode("teleop");
    } else this.keys.delete(k);
  }

  onDown = (e) => {
    this.drag = { x: e.clientX, yaw: this.camYaw };
  };

  onMove = (e) => {
    if (this.drag) this.camYaw = this.drag.yaw - (e.clientX - this.drag.x) * 0.008;
  };

  onUp = () => {
    this.drag = null;
  };

  setMode(m) {
    if (m === this.mode) return;
    this.mode = m;
    if (m === "auto") this.keys.clear();
    this.emit();
  }

  emit() {
    const t = TARGETS[this.leg];
    this.onStatus?.({ mode: this.mode, target: t.name, found: [...this.found] });
  }

  /* ── sim ───────────────────────────────────────────────────────────── */
  update(dt) {
    const s = this.state;
    let v = 0, w = 0;
    if (this.mode === "teleop") {
      const K = this.keys;
      if (K.has("w") || K.has("arrowup")) v += 2.2;
      if (K.has("s") || K.has("arrowdown")) v -= 1.2;
      if (K.has("a") || K.has("arrowleft")) w += 1.3;
      if (K.has("d") || K.has("arrowright")) w -= 1.3;
    } else if (!this.reduced) {
      const t = TARGETS[this.leg], dx = t.at[0] - s.x, dz = t.at[1] - s.z, dist = Math.hypot(dx, dz);
      if (this.pause > 0) {
        this.pause -= dt;
        if (this.pause <= 0) {
          this.leg = (this.leg + 1) % TARGETS.length;
          if (this.leg === 0) this.found.clear();
          this.emit();
        }
      } else if (dist < 1.6) {
        this.pause = 1.6;
        if (t.name !== "home") this.found.add(t.name);
        this.emit();
      } else {
        // local planner: goal attraction + repulsion from rocks ahead, plus a tangential
        // "slide" around each one toward the goal side (breaks the head-on deadlock)
        const gx = dx / dist, gz = dz / dist, hx = Math.sin(s.yaw), hz = Math.cos(s.yaw);
        let ax = 0, az = 0;
        for (const q of this.rocks) {
          const ox = s.x - q.x, oz = s.z - q.z, d = Math.hypot(ox, oz) || 1e-3;
          const clear = d - q.r - ROVER_R;
          if (clear > INFLUENCE || (ox * hx + oz * hz) / d > 0.35) continue; // far, or behind us
          const nx = ox / d, nz = oz / d, wgt = ((INFLUENCE - Math.max(0, clear)) / INFLUENCE) ** 2 * 2.4;
          let tx = -nz, tz = nx;
          if (tx * gx + tz * gz < 0) { tx = -tx; tz = -tz; }
          ax += (nx * 0.7 + tx) * wgt;
          az += (nz * 0.7 + tz) * wgt;
        }
        const want = Math.atan2(gx + ax, gz + az);
        this.navDir = want;
        let err = want - s.yaw;
        err = Math.atan2(Math.sin(err), Math.cos(err));
        w = Math.max(-1.2, Math.min(1.2, err * 2.4));
        const slow = Math.min(1, Math.max(0.3, (this.clearance - 0.2) / 1.4));
        v = Math.min(2.0, dist * 0.8) * Math.max(0.15, Math.cos(err)) * slow;
      }
    }
    const k = Math.min(1, dt * 4);
    s.v += (v - s.v) * k;
    s.w += (w - s.w) * k;
    s.yaw += s.w * dt;
    s.x = Math.max(-HALF + 2, Math.min(HALF - 2, s.x + Math.sin(s.yaw) * s.v * dt));
    s.z = Math.max(-HALF + 2, Math.min(HALF - 2, s.z + Math.cos(s.yaw) * s.v * dt));
    this.collide();
    this.placeRover(dt);

    const base = this.ground(s.x, s.z) + 0.04;
    this.ring.position.set(s.x, base, s.z);
    this.ring.material.color.copy(this.clearance < 0.35 || this.bumped > 0 ? ALERT : AMBER_DIM);
    const nav = this.navLine.geometry.attributes.position.array, L = 2.4;
    const nd = this.mode === "auto" ? this.navDir : s.yaw;
    nav.set([s.x, base + 0.05, s.z, s.x + Math.sin(nd) * L, this.ground(s.x + Math.sin(nd) * L, s.z + Math.cos(nd) * L) + 0.09, s.z + Math.cos(nd) * L]);
    this.navLine.geometry.attributes.position.needsUpdate = true;
    this.navLine.computeLineDistances();
    this.navLine.visible = this.mode === "auto" && this.pause <= 0;

    // chase camera (drag to swing it around)
    const yaw = s.yaw + this.camYaw;
    const want = new THREE.Vector3(s.x - Math.sin(yaw) * 5.2, 0, s.z - Math.cos(yaw) * 5.2);
    want.y = Math.max(this.ground(want.x, want.z) + 1.4, this.rover.position.y + 2.4);
    this.camPos.lerp(want, dt === 0 ? 1 : Math.min(1, dt * 3));
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(s.x + Math.sin(s.yaw) * 1.6, this.rover.position.y + 0.5, s.z + Math.cos(s.yaw) * 1.6);

    // mast camera
    const head = new THREE.Vector3(0, 0.82, 0.48).applyMatrix4(this.body.matrixWorld);
    const ahead = new THREE.Vector3(0, 0.5, 4).applyMatrix4(this.body.matrixWorld);
    this.mastCam.position.copy(head);
    this.mastCam.lookAt(ahead);
    this.mastCam.updateMatrixWorld();
    this.detect();
  }

  /** Rocks are solid: push the rover back out and kill the speed into them. */
  collide() {
    const s = this.state;
    let nearest = Infinity;
    this.bumped = Math.max(0, (this.bumped || 0) - 0.02);
    for (const q of this.rocks) {
      const ox = s.x - q.x, oz = s.z - q.z, d = Math.hypot(ox, oz) || 1e-3, min = q.r + ROVER_R;
      if (d < min) {
        s.x = q.x + (ox / d) * min;
        s.z = q.z + (oz / d) * min;
        const into = Math.sin(s.yaw) * (-ox / d) + Math.cos(s.yaw) * (-oz / d);
        if (into * s.v > 0) {
          s.v *= 0.2;
          this.bumped = 1;
        }
      }
      nearest = Math.min(nearest, d - min);
    }
    this.clearance = nearest;
  }

  /** YOLO-style boxes: each object's 3D bounds projected into the mast camera. */
  detect() {
    const out = [];
    const box = new THREE.Box3(), v = new THREE.Vector3();
    for (const { name, obj } of this.objects) {
      box.setFromObject(obj);
      const dist = obj.position.distanceTo(this.mastCam.position);
      if (dist > 16) continue;
      let x0 = 1, y0 = 1, x1 = -1, y1 = -1, behind = false;
      for (let i = 0; i < 8; i++) {
        v.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
        v.project(this.mastCam);
        if (v.z > 1) behind = true;
        x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y);
      }
      if (behind || x1 < -1 || x0 > 1 || y1 < -1 || y0 > 1) continue;
      const conf = Math.max(0.42, Math.min(0.97, 0.99 - dist * 0.035));
      out.push({ name, conf, x0: Math.max(-1, x0), x1: Math.min(1, x1), y0: Math.max(-1, y0), y1: Math.min(1, y1), dist });
    }
    this.detections = out;
  }

  inset() {
    const iw = Math.round(Math.min(220, this.width * 0.36)), ih = Math.round((iw * 3) / 4);
    return { x: this.width - iw - 10, y: this.height - ih - 10, w: iw, h: ih };
  }

  onResize(w, h) {
    const dpr = this.renderer.getPixelRatio();
    this.hud.width = Math.round(w * dpr);
    this.hud.height = Math.round(h * dpr);
    this.hctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  render() {
    const r = this.renderer;
    r.setViewport(0, 0, this.width, this.height);
    r.setScissorTest(false);
    r.render(this.scene, this.camera);
    const I = this.inset();
    // mast camera inset (WebGL viewport y is from the bottom)
    r.setScissorTest(true);
    r.setScissor(I.x, 10, I.w, I.h);
    r.setViewport(I.x, 10, I.w, I.h);
    this.mastCam.aspect = I.w / I.h;
    this.mastCam.updateProjectionMatrix();
    r.render(this.scene, this.mastCam);
    r.setScissorTest(false);
    r.setViewport(0, 0, this.width, this.height);
    this.drawHud(I);
  }

  drawHud(I) {
    const c = this.hctx, s = this.state;
    c.clearRect(0, 0, this.width, this.height);
    c.font = '10px "IBM Plex Mono", ui-monospace, monospace';
    // inset frame + detections
    c.strokeStyle = pal.dim;
    c.strokeRect(I.x + 0.5, I.y + 0.5, I.w - 1, I.h - 1);
    c.fillStyle = pal.dim;
    c.fillText(I.w < 200 ? "MAST CAM" : "MAST CAM · detections", I.x + 4, I.y - 5);
    c.save();
    c.beginPath();
    c.rect(I.x, I.y, I.w, I.h);
    c.clip();
    for (const d of this.detections) {
      const x = I.x + ((d.x0 + 1) / 2) * I.w, X = I.x + ((d.x1 + 1) / 2) * I.w;
      const y = I.y + ((1 - d.y1) / 2) * I.h, Y = I.y + ((1 - d.y0) / 2) * I.h;
      c.strokeStyle = pal.alert;
      c.lineWidth = 1.5;
      c.strokeRect(x, y, Math.max(4, X - x), Math.max(4, Y - y));
      c.lineWidth = 1;
      const label = `${d.name} ${d.conf.toFixed(2)}`;
      const lw = c.measureText(label).width + 6;
      const lx = Math.min(x, I.x + I.w - lw), ly = y - 12 < I.y ? Y : y - 12;
      c.fillStyle = pal.alert;
      c.fillRect(lx, ly, lw, 12);
      c.fillStyle = pal.bg;
      c.fillText(label, lx + 3, ly + 9);
    }
    c.restore();
    // telemetry
    const t = TARGETS[this.leg];
    const dist = Math.hypot(t.at[0] - s.x, t.at[1] - s.z);
    const hdg = ((((s.yaw * 180) / Math.PI) % 360) + 360) % 360;
    const f2 = (x) => (Math.abs(x) < 0.005 ? 0 : x).toFixed(2);
    const lines = [
      [`MODE ${this.mode === "auto" ? "AUTONOMOUS" : "TELEOP"}`, this.mode === "auto" ? pal.hi : pal.alert],
      [`v ${f2(s.v)} m/s   ω ${f2(s.w)} rad/s`, pal.text],
      [`hdg ${hdg.toFixed(0).padStart(3, "0")}°   pos ${s.x.toFixed(1)}, ${s.z.toFixed(1)}`, pal.text],
      [this.mode === "auto" ? `→ ${t.name} · ${dist.toFixed(1)} m${this.pause > 0 ? " · reached" : ""}` : "W A S D / arrows to drive", pal.dim],
      this.bumped > 0.5
        ? ["contact! rock in the way", pal.alert]
        : this.clearance < INFLUENCE
          ? [`obstacle ${Math.max(0, this.clearance).toFixed(1)} m${this.mode === "auto" ? " · avoiding" : ""}`, pal.alert]
          : ["path clear", pal.faint],
    ];
    lines.forEach(([txt, col], i) => {
      c.fillStyle = col;
      c.fillText(txt, 12, 18 + i * 14);
    });
  }

  dispose() {
    const c = this.canvas;
    c.removeEventListener("keydown", this.onKey);
    c.removeEventListener("keyup", this.onKey);
    c.removeEventListener("blur", this.onBlur);
    c.removeEventListener("pointerdown", this.onDown);
    window.removeEventListener("pointermove", this.onMove);
    window.removeEventListener("pointerup", this.onUp);
    super.dispose();
  }
}
