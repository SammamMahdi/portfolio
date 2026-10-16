import * as THREE from "three";
import { Stage, AMBER, AMBER_HI, AMBER_DIM } from "./core.js";

/**
 * SCOUT, the site's survey drone: a wireframe body, two rotors, an antenna
 * and a lens that follows the pointer. Rendered at 30 fps into a tiny canvas.
 */
export class ScoutBot extends Stage {
  constructor(canvas, { reducedMotion = false } = {}) {
    super(canvas, { fov: 30 });
    this.reduced = reducedMotion;
    this.mood = "idle"; // idle | talk | think
    this.look = new THREE.Vector2(0, 0);
    this.lookNow = new THREE.Vector2(0, 0);
    this.spin = 0;
    this.skip = false;

    const line = (geo, color, opacity = 1) =>
      new THREE.LineSegments(new THREE.EdgesGeometry(geo, 1), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
    const wire = (geo, color, opacity = 1) =>
      new THREE.LineSegments(new THREE.WireframeGeometry(geo), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));

    this.bot = new THREE.Group();
    const body = wire(new THREE.IcosahedronGeometry(0.62, 1), AMBER, 0.55);
    const belt = line(new THREE.TorusGeometry(0.66, 0.02, 4, 32), AMBER_HI);
    belt.rotation.x = Math.PI / 2;
    this.bot.add(body, belt);

    // the eye: a lens ring, an iris disk and a pupil that track the pointer
    this.eye = new THREE.Group();
    const ring = line(new THREE.TorusGeometry(0.3, 0.025, 4, 28), AMBER_HI);
    this.iris = new THREE.Mesh(new THREE.CircleGeometry(0.2, 28), new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.9 }));
    this.pupil = new THREE.Mesh(new THREE.CircleGeometry(0.085, 20), new THREE.MeshBasicMaterial({ color: 0x0c0905 }));
    this.glint = new THREE.Mesh(new THREE.CircleGeometry(0.03, 10), new THREE.MeshBasicMaterial({ color: AMBER_HI }));
    this.pupil.position.z = 0.002;
    this.glint.position.set(0.06, 0.06, 0.004);
    this.eye.add(ring, this.iris, this.pupil, this.glint);
    this.eye.position.z = 0.6;
    this.eyePivot = new THREE.Group();
    this.eyePivot.add(this.eye);
    this.bot.add(this.eyePivot);

    // rotor arms
    this.rotors = [];
    for (const sx of [-1, 1]) {
      const arm = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(sx * 0.55, 0.35, 0), new THREE.Vector3(sx * 0.95, 0.62, 0)]),
        new THREE.LineBasicMaterial({ color: AMBER })
      );
      const rotor = new THREE.Group();
      const blade = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.32, 0, 0), new THREE.Vector3(0.32, 0, 0)]),
        new THREE.LineBasicMaterial({ color: AMBER_HI })
      );
      const disc = line(new THREE.TorusGeometry(0.32, 0.005, 3, 24), AMBER_DIM, 0.8);
      disc.rotation.x = Math.PI / 2;
      rotor.add(blade, disc);
      rotor.position.set(sx * 0.95, 0.66, 0);
      this.rotors.push(rotor);
      this.bot.add(arm, rotor);
    }
    // antenna with a beacon
    this.bot.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.6, -0.1), new THREE.Vector3(0.12, 1.0, -0.15)]),
        new THREE.LineBasicMaterial({ color: AMBER })
      )
    );
    this.beacon = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: AMBER_HI, transparent: true }));
    this.beacon.position.set(0.12, 1.02, -0.15);
    this.bot.add(this.beacon);

    this.scene.add(this.bot);
    this.camera.position.set(0, 0.15, 5.2);
    this.camera.lookAt(0, 0.15, 0);
  }

  /** Pointer position relative to the drone, in roughly [-1, 1]. */
  setLook(x, y) {
    this.look.set(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)));
  }

  setMood(m) {
    this.mood = m;
  }

  // 30 fps is plenty for a 90-px drone
  loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    this.skip = !this.skip;
    if (this.skip) return;
    const dt = Math.min(this.clock.getDelta(), 0.1);
    this.time += dt;
    this.update(dt, this.time);
    this.render();
  };

  update(dt, t) {
    const r = this.reduced;
    this.lookNow.lerp(this.look, dt === 0 ? 1 : Math.min(1, dt * 6));
    this.eyePivot.rotation.set(-this.lookNow.y * 0.45, this.lookNow.x * 0.6, 0);
    this.bot.rotation.y = this.lookNow.x * 0.25 + (r ? 0 : Math.sin(t * 0.7) * 0.06);
    this.bot.rotation.z = r ? 0 : Math.sin(t * 1.1) * 0.04;
    this.bot.position.y = r ? 0 : Math.sin(t * 1.6) * 0.06;

    const rate = this.mood === "think" ? 26 : this.mood === "talk" ? 16 : 10;
    if (!r) this.spin += dt * rate;
    this.rotors.forEach((ro, i) => (ro.rotation.y = this.spin * (i ? -1 : 1)));

    const talk = this.mood === "talk" && !r ? 0.75 + 0.25 * Math.sin(t * 18) : 1;
    this.iris.material.opacity = 0.9 * talk;
    const blink = !r && (t % 4.2) > 4.05 ? 0.15 : 1;
    this.eye.scale.y = blink;
    this.beacon.material.opacity = r ? 1 : (Math.sin(t * 3) > 0.6 ? 1 : 0.25);
  }
}
