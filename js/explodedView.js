/**
 * Controlador de Anatomia Explodida (Exploded View) com deslocamento vetorial coerente,
 * animação suave (inclusive reversa), filtro por região e linhas-guia técnicas.
 */
import * as THREE from 'three';

export class ExplodedViewController {
  constructor(scene) {
    this.scene = scene;
    this.meshMap = new Map();
    this.currentFactor = 0;
    this.targetFactor = 0;
    this.scope = 'all'; // 'all' | 'skull' | 'vertebral_column' | 'thoracic_cage' | 'thoracic_limb' | 'pelvic_limb' | 'pelvis' | 'selected'
    this.selectedId = null;
    this.guideLines = null;
  }

  setMeshMap(meshMap) {
    this.clearGuides();
    this.meshMap = meshMap;
    this.currentFactor = 0;
    this.targetFactor = 0;
    this._createGuides();
  }

  setScope(scope, selectedId = null) {
    this.scope = scope || 'all';
    this.selectedId = selectedId;
    this.applyTransforms();
  }

  setTargetPercent(pct) {
    this.targetFactor = Math.max(0, Math.min(1, Number(pct) / 100));
  }

  animateReset() {
    this.targetFactor = 0;
  }

  _boneIncluded(id, mesh) {
    if (this.scope === 'all') return true;
    if (this.scope === 'selected') return id === this.selectedId;
    const groups = mesh.userData.regionGroups || [mesh.userData.region];
    return groups.includes(this.scope);
  }

  _createGuides() {
    if (!this.meshMap.size) return;
    const positions = new Float32Array(this.meshMap.size * 6);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.32 });
    this.guideLines = new THREE.LineSegments(geom, mat);
    this.guideLines.visible = false;
    this.guideLines.frustumCulled = false;
    this.scene.add(this.guideLines);
  }

  clearGuides() {
    if (this.guideLines) {
      this.scene.remove(this.guideLines);
      this.guideLines.geometry.dispose();
      this.guideLines.material.dispose();
      this.guideLines = null;
    }
  }

  applyTransforms() {
    let idx = 0;
    const posAttr = this.guideLines?.geometry?.getAttribute('position');
    let anyMoved = false;

    for (const [id, mesh] of this.meshMap.entries()) {
      const base = mesh.userData.basePosition;
      const exVec = mesh.userData.explosionVector;
      const inspectOff = mesh.userData.inspectOffset || new THREE.Vector3();
      const f = this._boneIncluded(id, mesh) ? this.currentFactor : 0;

      mesh.position.copy(base).addScaledVector(exVec, f).add(inspectOff);

      // Aplica eventual rotação individual do osso sobre a orientação anatômica base
      if (mesh.userData.inspectEuler) {
        const qInspect = new THREE.Quaternion().setFromEuler(mesh.userData.inspectEuler);
        mesh.quaternion.copy(mesh.userData.baseQuaternion).multiply(qInspect);
      }

      if (posAttr) {
        if (f > 0.01 && mesh.visible) {
          anyMoved = true;
          posAttr.setXYZ(idx * 2, base.x, base.y, base.z);
          posAttr.setXYZ(idx * 2 + 1, mesh.position.x, mesh.position.y, mesh.position.z);
        } else {
          posAttr.setXYZ(idx * 2, 0, 0, 0);
          posAttr.setXYZ(idx * 2 + 1, 0, 0, 0);
        }
      }
      idx++;
    }

    if (this.guideLines && posAttr) {
      posAttr.needsUpdate = true;
      this.guideLines.visible = anyMoved && this.currentFactor > 0.01;
    }
  }

  update(dt) {
    const diff = this.targetFactor - this.currentFactor;
    if (Math.abs(diff) < 0.001) {
      if (this.currentFactor !== this.targetFactor) {
        this.currentFactor = this.targetFactor;
        this.applyTransforms();
      }
      return false;
    }
    this.currentFactor += diff * Math.min(1, dt * 8.5);
    this.applyTransforms();
    return true;
  }
}
