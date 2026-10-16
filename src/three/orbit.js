/**
 * Drag-to-orbit with inertia and limits. Horizontal drags rotate; vertical
 * swipes on touch still scroll the page (the host sets touch-action: pan-y).
 * Arrow keys rotate when the host element has focus.
 */
export class DragOrbit {
  constructor(el, { yaw = 0, pitch = 0, yawLimit = 1.1, pitchLimit = 0.55, onInteract } = {}) {
    this.el = el;
    this.yaw = this.tYaw = yaw;
    this.pitch = this.tPitch = pitch;
    this.yawLimit = yawLimit;
    this.pitchLimit = pitchLimit;
    this.vYaw = 0;
    this.vPitch = 0;
    this.dragging = false;
    this.lastInteract = -Infinity;
    this.onInteract = onInteract;
    this.px = 0;
    this.py = 0;

    el.addEventListener("pointerdown", this.down);
    window.addEventListener("pointermove", this.move);
    window.addEventListener("pointerup", this.up);
    window.addEventListener("pointercancel", this.up);
    el.addEventListener("keydown", this.key);
  }

  clamp() {
    this.tYaw = Math.max(-this.yawLimit, Math.min(this.yawLimit, this.tYaw));
    this.tPitch = Math.max(-this.pitchLimit, Math.min(this.pitchLimit, this.tPitch));
  }

  touch() {
    this.lastInteract = performance.now();
    this.onInteract?.();
  }

  down = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    this.dragging = true;
    this.px = e.clientX;
    this.py = e.clientY;
    this.vYaw = this.vPitch = 0;
    this.touch();
  };

  move = (e) => {
    if (!this.dragging) return;
    const dx = e.clientX - this.px;
    const dy = e.clientY - this.py;
    this.px = e.clientX;
    this.py = e.clientY;
    this.vYaw = dx * 0.006;
    this.vPitch = dy * 0.005;
    this.tYaw += this.vYaw;
    this.tPitch += this.vPitch;
    this.clamp();
    this.touch();
  };

  up = () => {
    this.dragging = false;
  };

  key = (e) => {
    const step = 0.12;
    if (e.key === "ArrowLeft") this.tYaw -= step;
    else if (e.key === "ArrowRight") this.tYaw += step;
    else if (e.key === "ArrowUp") this.tPitch -= step;
    else if (e.key === "ArrowDown") this.tPitch += step;
    else return;
    e.preventDefault();
    this.clamp();
    this.touch();
  };

  /** Seconds since the user last touched the control. */
  idleFor() {
    return (performance.now() - this.lastInteract) / 1000;
  }

  setTarget(yaw, pitch) {
    this.tYaw = yaw;
    this.tPitch = pitch;
    this.clamp();
  }

  update(dt) {
    if (!this.dragging && (Math.abs(this.vYaw) > 1e-4 || Math.abs(this.vPitch) > 1e-4)) {
      this.tYaw += this.vYaw;
      this.tPitch += this.vPitch;
      this.vYaw *= 0.9;
      this.vPitch *= 0.9;
      this.clamp();
    }
    const k = Math.min(1, dt * 9);
    this.yaw += (this.tYaw - this.yaw) * k;
    this.pitch += (this.tPitch - this.pitch) * k;
  }

  dispose() {
    this.el.removeEventListener("pointerdown", this.down);
    window.removeEventListener("pointermove", this.move);
    window.removeEventListener("pointerup", this.up);
    window.removeEventListener("pointercancel", this.up);
    this.el.removeEventListener("keydown", this.key);
  }
}
