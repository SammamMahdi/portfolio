import * as THREE from "three";
import { Stage, AMBER, AMBER_HI, AMBER_DIM, easeInOut, clamp01 } from "./core.js";
import { DragOrbit } from "./orbit.js";

/** Visits per day as a 3D skyline: weeks run along x, weekdays along z. */
const CUBE = (() => {
  const g = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
  return Array.from(g.attributes.position.array);
})();

export class SkylineScene extends Stage {
  constructor(canvas, { reducedMotion = false, onHover } = {}) {
    super(canvas, { fov: 34 });
    this.reduced = reducedMotion;
    this.onHover = onHover;
    this.days = [];
    this.grow = 1;
    this.hover = -1;
    this.orbit = new DragOrbit(canvas, { yaw: -0.35, pitch: 0, yawLimit: 1.2, pitchLimit: 0.35 });
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.ray = new THREE.Raycaster();
    this.ndc = new THREE.Vector2();
    this.pointer = null;
    canvas.addEventListener("pointermove", this.onMove);
    canvas.addEventListener("pointerleave", this.onLeave);
  }

  onMove = (e) => {
    const r = this.canvas.getBoundingClientRect();
    this.pointer = [((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1];
  };

  onLeave = () => {
    this.pointer = null;
  };

  /** days: [{ date, count, week, weekday }] with week 0 = oldest. */
  setData(days) {
    this.group.traverse((o) => {
      o.geometry?.dispose();
      o.material?.dispose?.();
    });
    this.group.clear();
    this.days = days;
    const weeks = Math.max(1, ...days.map((d) => d.week + 1));
    this.max = Math.max(1, ...days.map((d) => d.count));
    this.cx = (weeks - 1) / 2;

    this.fill = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.32, depthWrite: false }),
      days.length
    );
    this.fill.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.edges = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(days.length * CUBE.length), 3)),
      new THREE.LineBasicMaterial({ color: AMBER, transparent: true, opacity: 0.85 })
    );
    // floor grid + weekday rail
    const g = [];
    for (let w = 0; w <= weeks; w++) g.push(w - 0.5 - this.cx, 0, -0.5 - 3, w - 0.5 - this.cx, 0, 6.5 - 3);
    for (let d = 0; d <= 7; d++) g.push(-0.5 - this.cx, 0, d - 0.5 - 3, weeks - 0.5 - this.cx, 0, d - 0.5 - 3);
    const floor = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(g, 3)),
      new THREE.LineBasicMaterial({ color: AMBER_DIM, transparent: true, opacity: 0.6 })
    );
    this.group.add(floor, this.fill, this.edges);
    this.weeks = weeks;
    this.grow = this.reduced ? 1 : 0;
    this.layout();
    this.onResize(this.width, this.height);
    if (!this.active) this.renderOnce();
  }

  layout() {
    const m = new THREE.Matrix4(), col = new THREE.Color(), e = this.edges.geometry.attributes.position.array;
    const k = easeInOut(clamp01(this.grow));
    this.days.forEach((d, i) => {
      const h = Math.max(0.04, (d.count / this.max) * 5.5 * k);
      const x = d.week - this.cx, z = d.weekday - 3;
      m.makeScale(0.78, h, 0.78).setPosition(x, h / 2, z);
      this.fill.setMatrixAt(i, m);
      const t = d.count / this.max;
      col.copy(i === this.hover ? AMBER_HI : d.count ? AMBER : AMBER_DIM).multiplyScalar(i === this.hover ? 1.2 : 0.35 + 0.65 * t);
      this.fill.setColorAt(i, col);
      for (let v = 0; v < CUBE.length; v += 3) {
        e[i * CUBE.length + v] = x + CUBE[v] * 0.78;
        e[i * CUBE.length + v + 1] = (CUBE[v + 1] + 0.5) * h;
        e[i * CUBE.length + v + 2] = z + CUBE[v + 2] * 0.78;
      }
    });
    this.fill.instanceMatrix.needsUpdate = true;
    if (this.fill.instanceColor) this.fill.instanceColor.needsUpdate = true;
    this.edges.geometry.attributes.position.needsUpdate = true;
    this.edges.geometry.computeBoundingSphere();
    this.fill.computeBoundingSphere();
  }

  onTheme() {
    if (this.days.length) this.layout();
  }

  onResize() {
    const span = Math.max(this.weeks || 10, 10);
    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    // half the grid's projected width (weeks along x, plus the 7-day depth at the default yaw) + margin,
    // over the horizontal half-FOV
    const halfW = (span * Math.cos(0.35) + 7 * Math.sin(0.35)) / 2 + 1.2;
    this.dist = halfW / (tan * Math.max(0.6, this.camera.aspect));
  }

  update(dt, t) {
    if (this.grow < 1) {
      this.grow = Math.min(1, this.grow + dt * 0.8);
      if (this.days.length) this.layout();
    }
    const o = this.orbit;
    if (!this.reduced && o.idleFor() > 4) o.tYaw += (-0.35 + 0.25 * Math.sin(t * 0.2) - o.tYaw) * Math.min(1, dt);
    o.update(dt === 0 ? 1 : dt);
    const yaw = o.yaw, pitch = 0.55 + o.pitch;
    const d = this.dist || 20;
    this.camera.position.set(Math.sin(yaw) * Math.cos(pitch) * d, Math.sin(pitch) * d + 1, Math.cos(yaw) * Math.cos(pitch) * d);
    this.camera.lookAt(0, 1.2, 0);

    // hover pick
    let idx = -1;
    if (this.pointer && this.fill) {
      this.ndc.set(...this.pointer);
      this.ray.setFromCamera(this.ndc, this.camera);
      const hit = this.ray.intersectObject(this.fill, false)[0];
      if (hit) idx = hit.instanceId;
    }
    if (idx !== this.hover) {
      this.hover = idx;
      if (this.days.length) this.layout();
      this.onHover?.(idx >= 0 ? this.days[idx] : null);
    }
  }

  dispose() {
    this.orbit.dispose();
    this.canvas.removeEventListener("pointermove", this.onMove);
    this.canvas.removeEventListener("pointerleave", this.onLeave);
    super.dispose();
  }
}
