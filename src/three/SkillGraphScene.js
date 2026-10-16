import * as THREE from "three";
import { Stage, AMBER, AMBER_HI, AMBER_DIM, LINE } from "./core.js";
import { DragOrbit } from "./orbit.js";
import { mulberry32 } from "../lib/rand.js";

/**
 * Skills ↔ work as a 3D force-directed graph. Hover to light a node's
 * neighbourhood, click a work node to open it, drag to orbit.
 */
const SHAPES = {
  area: () => new THREE.IcosahedronGeometry(0.15, 0),
  paper: () => new THREE.OctahedronGeometry(0.11, 0),
  project: () => new THREE.BoxGeometry(0.15, 0.15, 0.15),
  role: () => new THREE.TetrahedronGeometry(0.15, 0),
};

function label(text, big) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  const font = `${big ? 600 : 500} 44px "IBM Plex Mono", ui-monospace, monospace`;
  ctx.font = font;
  c.width = Math.ceil(ctx.measureText(text).width) + 16;
  c.height = 60;
  ctx.font = font;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 8, 31);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace;
  return { tex, aspect: c.width / c.height };
}

function layout(nodes, edges, seed = 7) {
  const rng = mulberry32(seed);
  const idx = new Map(nodes.map((n, i) => [n.id, i]));
  const P = nodes.map((n, i) => {
    // golden-spiral start: areas on an inner shell, work outside
    const k = i + 0.5, y = 1 - (2 * k) / nodes.length, r = Math.sqrt(1 - y * y), th = k * 2.39996;
    const R = n.kind === "area" ? 1.2 : 2.4;
    return new THREE.Vector3(Math.cos(th) * r * R, y * R * 0.8, Math.sin(th) * r * R).addScalar((rng() - 0.5) * 0.05);
  });
  const E = edges.map(([a, b]) => [idx.get(a), idx.get(b)]);
  const F = P.map(() => new THREE.Vector3());
  const d = new THREE.Vector3();
  for (let it = 0; it < 420; it++) {
    F.forEach((f) => f.set(0, 0, 0));
    for (let i = 0; i < P.length; i++)
      for (let j = i + 1; j < P.length; j++) {
        d.subVectors(P[i], P[j]);
        const l2 = Math.max(0.04, d.lengthSq());
        d.multiplyScalar(0.2 / (l2 * Math.sqrt(l2)));
        F[i].add(d);
        F[j].sub(d);
      }
    for (const [a, b] of E) {
      d.subVectors(P[b], P[a]);
      const l = d.length() || 1e-3;
      d.multiplyScalar(((l - 1.45) * 0.06) / l);
      F[a].add(d);
      F[b].sub(d);
    }
    const step = 1 - it / 460;
    P.forEach((p, i) => {
      F[i].addScaledVector(p, -0.012);
      if (F[i].length() > 0.2) F[i].setLength(0.2);
      p.addScaledVector(F[i], step);
    });
  }
  // centre and fit
  const c = P.reduce((s, p) => s.add(p), new THREE.Vector3()).divideScalar(P.length);
  const rmax = Math.max(...P.map((p) => p.distanceTo(c)));
  P.forEach((p) => p.sub(c).multiplyScalar(2.5 / rmax));
  return { P, E };
}

export class SkillGraphScene extends Stage {
  constructor(canvas, { graph, reducedMotion = false, onHover, onPick, onPinArea } = {}) {
    super(canvas, { fov: 32 });
    this.reduced = reducedMotion;
    this.onHover = onHover;
    this.onPick = onPick;
    this.onPinArea = onPinArea;
    this.nodes = graph.nodes;
    const { P, E } = layout(graph.nodes, graph.edges);
    this.P = P;
    this.E = E;
    this.nbr = graph.nodes.map(() => new Set());
    E.forEach(([a, b]) => {
      this.nbr[a].add(b);
      this.nbr[b].add(a);
    });

    this.root = new THREE.Group();
    this.scene.add(this.root);

    // edges with per-vertex colour so a neighbourhood can light up
    const pos = new Float32Array(E.length * 6);
    E.forEach(([a, b], k) => pos.set([...P[a].toArray(), ...P[b].toArray()], k * 6));
    const eg = new THREE.BufferGeometry();
    eg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    eg.setAttribute("color", new THREE.BufferAttribute(new Float32Array(E.length * 6), 3));
    this.edges = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9 }));
    this.root.add(this.edges);

    // nodes: a wire shape, an invisible hit sphere, a label sprite
    this.items = graph.nodes.map((n, i) => {
      const g = new THREE.Group();
      g.position.copy(P[i]);
      const area = n.kind === "area";
      const shape = new THREE.LineSegments(new THREE.EdgesGeometry(SHAPES[n.kind]()), new THREE.LineBasicMaterial({ color: area ? AMBER_HI : AMBER, transparent: true }));
      const hit = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
      hit.userData.i = i;
      const { tex, aspect } = label(n.kind === "paper" ? `${n.label}` : n.label, area);
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: area ? AMBER_HI : AMBER, transparent: true, depthWrite: false }));
      const h = area ? 0.17 : 0.13;
      spr.scale.set(h * aspect, h, 1);
      spr.position.set(0, area ? 0.26 : 0.21, 0);
      g.add(shape, hit, spr);
      this.root.add(g);
      return { g, shape, hit, spr, spin: (i % 2 ? 1 : -1) * (0.3 + (i % 5) * 0.08) };
    });

    this.hover = -1;
    this.pinned = -1;
    this.applyHighlight();

    this.orbit = new DragOrbit(canvas, { yaw: 0, pitch: 0.12, yawLimit: Math.PI, pitchLimit: 0.6 });
    this.ray = new THREE.Raycaster();
    this.ndc = new THREE.Vector2();
    this.pointer = null;
    canvas.addEventListener("pointermove", this.onMove);
    canvas.addEventListener("pointerleave", this.onLeave);
    canvas.addEventListener("pointerdown", this.onDown);
    canvas.addEventListener("pointerup", this.onUp);
  }

  onMove = (e) => {
    const r = this.canvas.getBoundingClientRect();
    this.pointer = [((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1];
  };
  onLeave = () => {
    this.pointer = null;
  };
  onDown = (e) => {
    this.press = [e.clientX, e.clientY];
  };
  onUp = (e) => {
    if (!this.press || Math.hypot(e.clientX - this.press[0], e.clientY - this.press[1]) > 5) return;
    const i = this.hover;
    if (i < 0) return;
    if (this.nodes[i].kind === "area") this.onPinArea?.(this.nodes[i].id);
    else this.onPick?.(this.nodes[i]);
  };

  /** Pin a node from outside (e.g. the side panel). */
  pin(id) {
    this.pinned = id == null ? -1 : this.nodes.findIndex((n) => n.id === id);
    this.applyHighlight();
    if (!this.active) this.renderOnce();
  }

  applyHighlight() {
    const focus = this.hover >= 0 ? this.hover : this.pinned;
    const lit = focus >= 0 ? new Set([focus, ...this.nbr[focus]]) : null;
    this.items.forEach((it, i) => {
      const on = !lit || lit.has(i);
      it.shape.material.opacity = on ? 1 : 0.18;
      it.spr.material.opacity = on ? (this.nodes[i].kind === "area" || lit ? 1 : 0.6) : 0.12;
      it.g.scale.setScalar(i === focus ? 1.35 : 1);
    });
    const col = this.edges.geometry.attributes.color.array;
    this.E.forEach(([a, b], k) => {
      const on = lit && (a === focus || b === focus);
      const c = on ? AMBER_HI : lit ? LINE : AMBER_DIM;
      col.set([c.r, c.g, c.b, c.r, c.g, c.b], k * 6);
    });
    this.edges.geometry.attributes.color.needsUpdate = true;
  }

  onTheme() {
    this.applyHighlight();
  }

  onResize() {
    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    this.camera.position.set(0, 0, 2.45 / (tan * Math.min(1, this.camera.aspect)));
    this.camera.lookAt(0, 0, 0);
  }

  update(dt) {
    const o = this.orbit;
    if (!this.reduced && o.idleFor() > 2.5 && this.hover < 0) o.tYaw += dt * 0.12;
    o.update(dt === 0 ? 1 : dt);
    this.root.rotation.set(o.pitch, o.yaw, 0);
    if (!this.reduced) this.items.forEach((it) => (it.shape.rotation.y += dt * it.spin));

    let idx = -1;
    if (this.pointer) {
      this.ndc.set(...this.pointer);
      this.ray.setFromCamera(this.ndc, this.camera);
      const hit = this.ray.intersectObjects(this.items.map((it) => it.hit), false)[0];
      if (hit) idx = hit.object.userData.i;
    }
    if (idx !== this.hover) {
      this.hover = idx;
      this.canvas.style.cursor = idx >= 0 ? "pointer" : "";
      this.applyHighlight();
      this.onHover?.(idx >= 0 ? this.nodes[idx] : null);
    }
  }

  dispose() {
    this.orbit.dispose();
    this.canvas.removeEventListener("pointermove", this.onMove);
    this.canvas.removeEventListener("pointerleave", this.onLeave);
    this.canvas.removeEventListener("pointerdown", this.onDown);
    this.canvas.removeEventListener("pointerup", this.onUp);
    super.dispose();
  }
}
