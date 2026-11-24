/**
 * Controles de câmera com interpolação suave para os ângulos anatômicos padrão e foco em estruturas.
 */
import * as THREE from 'three';

export class CameraController {
  constructor(camera, controls, onDemandRender) {
    this.camera = camera;
    this.controls = controls;
    this.onDemandRender = onDemandRender;
    this.anim = null;
    this.defaultTarget = new THREE.Vector3(0, 0.72, 0);
    this.defaultPos = new THREE.Vector3(2.05, 1.35, 2.55);
  }

  setSceneBounds(box) {
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.8);
    this.defaultTarget.copy(center);
    this.defaultPos.set(center.x + maxDim * 0.92, center.y + maxDim * 0.42, center.z + maxDim * 1.15);
    this.modelRadius = maxDim * 0.65;
  }

  animateTo(targetPos, targetLookAt, duration = 420) {
    this.anim = {
      startTime: performance.now(),
      duration,
      fromPos: this.camera.position.clone(),
      fromTarget: this.controls.target.clone(),
      toPos: targetPos.clone(),
      toTarget: targetLookAt.clone()
    };
    this.onDemandRender?.();
  }

  update(now = performance.now()) {
    if (!this.anim) return false;
    const t = Math.min(1, (now - this.anim.startTime) / this.anim.duration);
    const ease = 1 - Math.pow(1 - t, 3);
    this.camera.position.lerpVectors(this.anim.fromPos, this.anim.toPos, ease);
    this.controls.target.lerpVectors(this.anim.fromTarget, this.anim.toTarget, ease);
    this.controls.update();
    if (t >= 1) this.anim = null;
    return true;
  }

  setStandardView(viewName) {
    const c = this.defaultTarget;
    const d = Math.max(1.5, (this.modelRadius || 1.2) * 2.15);
    const offsets = {
      iso:     new THREE.Vector3(d * 0.72, d * 0.38, d * 0.9),
      cranial: new THREE.Vector3(d * 1.05, d * 0.12, 0.001),
      frontal: new THREE.Vector3(d * 1.05, d * 0.12, 0.001),
      caudal:  new THREE.Vector3(-d * 1.05, d * 0.12, 0.001),
      left:    new THREE.Vector3(0, d * 0.08, -d * 1.05),
      right:   new THREE.Vector3(0, d * 0.08, d * 1.05),
      dorsal:  new THREE.Vector3(0.01, d * 1.18, 0.001),
      ventral: new THREE.Vector3(0.01, -d * 1.18, 0.001)
    };
    const off = offsets[viewName] || offsets.iso;
    this.animateTo(c.clone().add(off), c);
  }

  reset() {
    this.animateTo(this.defaultPos, this.defaultTarget);
  }

  focusOnObject(obj) {
    if (!obj) return;
    const box = new THREE.Box3().setFromObject(obj);
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const r = Math.max(size.length() * 0.5, 0.22);
    const dir = this.camera.position.clone().sub(this.controls.target);
    if (dir.lengthSq() < 0.001) dir.set(1, 0.5, 1);
    dir.normalize();
    const dist = Math.max(0.75, Math.min(2.6, r * 3.1));
    this.animateTo(center.clone().add(dir.multiplyScalar(dist)), center);
  }
}
