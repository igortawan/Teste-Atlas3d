/**
 * Gerenciador de Marcos Anatômicos (acidentes ósseos) em 3D.
 * Renderiza marcadores clicáveis posicionados sobre a caixa delimitadora local do osso selecionado.
 */
import * as THREE from 'three';

export class LandmarkManager {
  constructor({ scene, camera, domElement, onSelectLandmark }) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.onSelectLandmark = onSelectLandmark;
    this.group = new THREE.Group();
    this.group.name = 'landmark_markers';
    this.scene.add(this.group);
    this.enabled = true;
    this.activeBoneMesh = null;
    this.activeLandmarkId = null;
    this.markers = [];
    this.raycaster = new THREE.Raycaster();
    this.downPos = { x: 0, y: 0 };

    this._onDown = (e) => { this.downPos = { x: e.clientX, y: e.clientY }; };
    this._onUp = (e) => {
      if (!this.enabled || !this.markers.length) return;
      if (Math.hypot(e.clientX - this.downPos.x, e.clientY - this.downPos.y) > 6) return;
      const rect = this.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      this.raycaster.setFromCamera(ndc, this.camera);
      const hits = this.raycaster.intersectObjects(this.markers, false);
      if (hits[0]) {
        const lm = hits[0].object.userData.landmark;
        this.setActiveLandmark(lm.id);
        this.onSelectLandmark?.(lm);
      }
    };
    domElement.addEventListener('pointerdown', this._onDown);
    domElement.addEventListener('pointerup', this._onUp);
  }

  dispose() {
    this.domElement.removeEventListener('pointerdown', this._onDown);
    this.domElement.removeEventListener('pointerup', this._onUp);
    this.clear();
    this.scene.remove(this.group);
  }

  setEnabled(enabled) {
    this.enabled = !!enabled;
    this.group.visible = this.enabled;
  }

  clear() {
    for (const m of this.markers) {
      m.geometry.dispose();
      m.material.dispose();
      this.group.remove(m);
    }
    this.markers = [];
    this.activeBoneMesh = null;
    this.activeLandmarkId = null;
  }

  showForBone(boneMesh, landmarks = []) {
    this.clear();
    if (!boneMesh || !landmarks.length) return;
    this.activeBoneMesh = boneMesh;
    boneMesh.geometry.computeBoundingBox();
    const bb = boneMesh.geometry.boundingBox;
    const center = bb.getCenter(new THREE.Vector3());
    const half = bb.getSize(new THREE.Vector3()).multiplyScalar(0.5);

    const sphereGeom = new THREE.SphereGeometry(0.017, 12, 10);
    for (const lm of landmarks) {
      const off = lm.localOffset || [0, 0, 0];
      const localPos = new THREE.Vector3(
        center.x + off[0] * Math.max(half.x, 0.02),
        center.y + off[1] * Math.max(half.y, 0.02),
        center.z + off[2] * Math.max(half.z, 0.02)
      );
      const mat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const pin = new THREE.Mesh(sphereGeom.clone(), mat);
      pin.userData = { landmark: lm, localPos };
      this.group.add(pin);
      this.markers.push(pin);
    }
    sphereGeom.dispose();
    this.syncPositions();
  }

  setActiveLandmark(landmarkId) {
    this.activeLandmarkId = landmarkId;
    for (const m of this.markers) {
      const active = m.userData.landmark.id === landmarkId;
      m.material.color.setHex(active ? 0xf59e0b : 0x06b6d4);
      m.scale.setScalar(active ? 1.45 : 1.0);
    }
  }

  syncPositions() {
    if (!this.activeBoneMesh || !this.markers.length) return;
    this.activeBoneMesh.updateMatrixWorld(true);
    for (const m of this.markers) {
      m.position.copy(m.userData.localPos).applyMatrix4(this.activeBoneMesh.matrixWorld);
    }
  }
}
