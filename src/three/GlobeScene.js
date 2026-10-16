import * as THREE from "three";
import { Stage, AMBER, AMBER_HI, AMBER_DIM, ALERT, LINE, DEEP, easeInOut, clamp01 } from "./core.js";
import { DragOrbit } from "./orbit.js";
import { COAST } from "@/data/world";

export const DHAKA = { lat: 23.81, lon: 90.41 };
const D2R = Math.PI / 180;

/** lat/lon (degrees) → unit vector; lon 0 faces +z, north is +y. */
export function ll(lat, lon, r = 1) {
  const a = lat * D2R, b = lon * D2R;
  return new THREE.Vector3(Math.cos(a) * Math.sin(b) * r, Math.sin(a) * r, Math.cos(a) * Math.cos(b) * r);
}

/** Subsolar point from a Date (declination + hour angle; ignores the equation of time, ±1°). */
export function subsolar(date = new Date()) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = (date - start) / 864e5;
  const decl = -23.44 * Math.cos(((2 * Math.PI) / 365) * (day + 10));
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
  return { lat: decl, lon: -15 * (hours - 12) };
}

const NIGHT_VERT = /* glsl */ `
varying vec3 vN;
void main() {
  vN = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const NIGHT_FRAG = /* glsl */ `
uniform vec3 uSun;
uniform vec3 uShade;
uniform vec3 uDay;
varying vec3 vN;
void main() {
  float d = dot(vN, uSun);
  float night = smoothstep(0.08, -0.12, d);
  // night darkens the lines; the lit side gets a faint phosphor wash
  gl_FragColor = vec4(mix(uDay, uShade, night), mix(0.08 * smoothstep(0.0, 0.6, d), 0.74, night));
}`;

export class GlobeScene extends Stage {
  constructor(canvas, { reducedMotion = false, visitor } = {}) {
    super(canvas, { fov: 30 });
    this.reduced = reducedMotion;
    this.globe = new THREE.Group();
    this.scene.add(this.globe);

    // solid core hides the far side's lines
    this.globe.add(new THREE.Mesh(new THREE.SphereGeometry(0.995, 48, 32), new THREE.MeshBasicMaterial({ color: DEEP })));

    // graticule every 30°
    const g = [];
    for (let lat = -60; lat <= 60; lat += 30)
      for (let lon = 0; lon < 360; lon += 5) g.push(...ll(lat, lon, 1.001).toArray(), ...ll(lat, lon + 5, 1.001).toArray());
    for (let lon = 0; lon < 360; lon += 30)
      for (let lat = -85; lat < 85; lat += 5) g.push(...ll(lat, lon, 1.001).toArray(), ...ll(lat + 5, lon, 1.001).toArray());
    this.globe.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(g, 3)), new THREE.LineBasicMaterial({ color: LINE })));

    // coastlines (Natural Earth 1:110m)
    const raw = new Int16Array(Uint8Array.from(atob(COAST), (c) => c.charCodeAt(0)).buffer);
    const c = [];
    let prev = null;
    for (let i = 0; i < raw.length; i += 2) {
      if (raw[i] === -32768) {
        prev = null;
        continue;
      }
      const p = ll(raw[i + 1] / 100, raw[i] / 100, 1.003);
      if (prev) c.push(...prev.toArray(), ...p.toArray());
      prev = p;
    }
    this.globe.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(c, 3)), new THREE.LineBasicMaterial({ color: AMBER, transparent: true, opacity: 0.85 })));

    // night side + terminator
    this.u = { uSun: { value: new THREE.Vector3(0, 0, 1) }, uShade: { value: DEEP.clone() }, uDay: { value: AMBER.clone() } };
    const shade = new THREE.Mesh(new THREE.SphereGeometry(1.006, 64, 40), new THREE.ShaderMaterial({ vertexShader: NIGHT_VERT, fragmentShader: NIGHT_FRAG, uniforms: this.u, transparent: true, depthWrite: false }));
    shade.renderOrder = 10; // always over the coastlines
    this.globe.add(shade);
    this.terminator = new THREE.LineLoop(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: AMBER_DIM }));
    this.globe.add(this.terminator);
    this.updateSun();

    // Dhaka: beacon + pulsing ring
    const home = ll(DHAKA.lat, DHAKA.lon, 1.004);
    this.beacon = new THREE.Line(new THREE.BufferGeometry().setFromPoints([home, ll(DHAKA.lat, DHAKA.lon, 1.28)]), new THREE.LineBasicMaterial({ color: AMBER_HI }));
    this.ring = this.makeRing(DHAKA, 0.05);
    this.dot = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), new THREE.MeshBasicMaterial({ color: AMBER_HI }));
    this.dot.position.copy(home);
    this.globe.add(this.beacon, this.ring, this.dot);

    // the visitor and the arc between
    this.visitor = visitor;
    if (visitor) {
      this.youDot = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), new THREE.MeshBasicMaterial({ color: ALERT }));
      this.youDot.position.copy(ll(visitor.lat, visitor.lon, 1.004));
      this.globe.add(this.youDot);
      const a = ll(visitor.lat, visitor.lon), b = ll(DHAKA.lat, DHAKA.lon);
      const ang = a.angleTo(b);
      this.arcPts = [];
      for (let i = 0; i <= 64; i++) {
        const t = i / 64;
        const p = ang < 1e-3 ? a.clone() : a.clone().multiplyScalar(Math.sin((1 - t) * ang)).add(b.clone().multiplyScalar(Math.sin(t * ang))).divideScalar(Math.sin(ang));
        this.arcPts.push(p.normalize().multiplyScalar(1.004 + Math.sin(Math.PI * t) * Math.min(0.32, ang * 0.22)));
      }
      const arc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(this.arcPts), new THREE.LineDashedMaterial({ color: ALERT, dashSize: 0.025, gapSize: 0.02, transparent: true, opacity: 0.9 }));
      arc.computeLineDistances();
      this.globe.add(arc);
      this.packet = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), new THREE.MeshBasicMaterial({ color: AMBER_HI }));
      this.packet.visible = false;
      this.globe.add(this.packet);
    }
    this.flight = -1;

    // markers stay lit on the night side: draw them after the shading
    this.globe.traverse((o) => {
      if (o === this.beacon || o === this.ring || o === this.dot || o === this.youDot || o === this.packet || o.material?.isLineDashedMaterial) {
        o.renderOrder = 11;
        o.material.transparent = true;
      }
    });

    // start with Dhaka (and the visitor, if any) facing the camera
    const mid = visitor ? (DHAKA.lon + visitor.lon) / 2 : DHAKA.lon;
    this.baseYaw = -mid * D2R + (visitor && Math.abs(DHAKA.lon - visitor.lon) > 180 ? Math.PI : 0);
    this.orbit = new DragOrbit(canvas, { yaw: 0, pitch: 0.15, yawLimit: Math.PI, pitchLimit: 0.9 });
    this.camera.position.set(0, 0, 4.1);
    this.camera.lookAt(0, 0, 0);
  }

  /** A circle lying on the surface at a point, built around its own centre so it scales in place. */
  makeRing(at, r) {
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
    }
    const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: AMBER_HI, transparent: true }));
    ring.position.copy(ll(at.lat, at.lon, 1.004));
    ring.lookAt(ll(at.lat, at.lon, 2));
    return ring;
  }

  updateSun() {
    const s = subsolar();
    const sun = ll(s.lat, s.lon);
    this.u.uSun.value.copy(sun);
    // terminator: great circle perpendicular to the sun vector
    const t1 = new THREE.Vector3(0, 1, 0).cross(sun).normalize(), t2 = sun.clone().cross(t1);
    const pts = [];
    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      pts.push(t1.clone().multiplyScalar(Math.cos(a) * 1.007).add(t2.clone().multiplyScalar(Math.sin(a) * 1.007)));
    }
    this.terminator.geometry.setFromPoints(pts);
    this.sunAt = Date.now();
  }

  /** Send a packet from the visitor to Dhaka. */
  fire() {
    if (!this.packet) return;
    this.flight = 0;
    this.packet.visible = true;
    if (!this.active) this.renderOnce();
  }

  onResize() {
    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    this.camera.position.z = 1.32 / (tan * Math.min(1, this.camera.aspect));
  }

  update(dt, t) {
    if (Date.now() - this.sunAt > 60000) this.updateSun();
    const o = this.orbit;
    if (!this.reduced && o.idleFor() > 3) o.tYaw += (0.35 * Math.sin(t * 0.12) - o.tYaw) * Math.min(1, dt * 0.5);
    o.update(dt === 0 ? 1 : dt);
    this.globe.rotation.set(o.pitch + 0.3, this.baseYaw + o.yaw, 0, "XYZ");
    const pulse = this.reduced ? 0.5 : (t * 0.8) % 1;
    this.ring.scale.setScalar(1 + pulse * 1.6);
    this.ring.material.opacity = 1 - pulse;
    if (this.flight >= 0 && this.arcPts) {
      this.flight += dt / 2.2;
      const k = easeInOut(clamp01(this.flight)) * (this.arcPts.length - 1);
      const i = Math.floor(k), f = k - i;
      const a = this.arcPts[i], b = this.arcPts[Math.min(i + 1, this.arcPts.length - 1)];
      this.packet.position.copy(a).lerp(b, f);
      if (this.flight >= 1) {
        this.flight = -1;
        this.packet.visible = false;
        this.ring.scale.setScalar(3);
      }
    }
  }

  dispose() {
    this.orbit.dispose();
    super.dispose();
  }
}
