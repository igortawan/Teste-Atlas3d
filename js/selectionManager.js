/**
 * Gerenciador de seleção 3D via raycasting (mouse e toque), destaque visual (cor + contorno geométrico),
 * isolamento, ocultação, transparência e rotação/movimentação individual de ossos.
 */
import * as THREE from 'three';

export class SelectionManager {
  constructor({ camera, domElement, onSelect, onHover }) {
    this.camera = camera;
    this.domElement = domElement;
    this.onSelect = onSelect;
    this.onHover = onHover;
    this.raycaster = new THREE.Raycaster();
    this.pointerDownPos = { x: 0, y: 0 };
    this.meshMap = new Map();
    this.selectedId = null;
    this.hoveredId = null;
    this.xrayMode = false;
    this.isolatedId = null;
    this.hiddenIds = new Set();
    this.outlineObj = null;
    this.pulseTimer = 0;

    this._onPointerDown = (e) => { this.pointerDownPos = { x: e.clientX, y: e.clientY }; };
    this._onPointerUp = (e) => this._handlePointerUp(e);
    this._onPointerMove = (e) => this._handlePointerMove(e);

    domElement.addEventListener('pointerdown', this._onPointerDown);
    domElement.addEventListener('pointerup', this._onPointerUp);
    domElement.addEventListener('pointermove', this._onPointerMove);
  }

  dispose() {
    this.domElement.removeEventListener('pointerdown', this._onPointerDown);
    this.domElement.removeEventListener('pointerup', this._onPointerUp);
    this.domElement.removeEventListener('pointermove', this._onPointerMove);
    this._clearOutline();
  }

  setMeshMap(meshMap) {
    this._clearOutline();
    this.meshMap = meshMap;
    this.selectedId = null;
    this.hoveredId = null;
    this.isolatedId = null;
    this.hiddenIds.clear();
    for (const mesh of meshMap.values()) {
      mesh.userData.origColor = mesh.material.color.clone();
      mesh.userData.origEmissive = mesh.material.emissive ? mesh.material.emissive.clone() : new THREE.Color(0x000000);
    }
  }

  _pick(clientX, clientY) {
    const rect = this.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(ndc, this.camera);
    const candidates = [...this.meshMap.values()].filter((m) => m.visible);
    const hits = this.raycaster.intersectObjects(candidates, false);
    return hits[0] || null;
  }

  _handlePointerUp(e) {
    const dx = e.clientX - this.pointerDownPos.x;
    const dy = e.clientY - this.pointerDownPos.y;
    if (Math.hypot(dx, dy) > 6) return; // foi órbita/pan, não clique
    const hit = this._pick(e.clientX, e.clientY);
    if (hit) {
      this.onSelect?.(hit.object.userData.structureId, hit);
    }
  }

  _handlePointerMove(e) {
    if (e.buttons !== 0) return;
    const hit = this._pick(e.clientX, e.clientY);
    const nextId = hit ? hit.object.userData.structureId : null;
    this.domElement.style.cursor = nextId ? 'pointer' : 'grab';
    if (nextId !== this.hoveredId) {
      this.hoveredId = nextId;
      this.refreshMaterials();
    }
    this.onHover?.(nextId, e.clientX, e.clientY);
  }

  select(structureId) {
    this.selectedId = structureId;
    this.pulseTimer = 1.0;
    this._rebuildOutline();
    this.refreshMaterials();
  }

  _clearOutline() {
    if (this.outlineObj && this.outlineObj.parent) {
      this.outlineObj.parent.remove(this.outlineObj);
      this.outlineObj.geometry.dispose();
      this.outlineObj.material.dispose();
    }
    this.outlineObj = null;
  }

  _rebuildOutline() {
    this._clearOutline();
    if (!this.selectedId) return;
    const mesh = this.meshMap.get(this.selectedId);
    if (!mesh) return;
    const edges = new THREE.EdgesGeometry(mesh.geometry, 32);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.9 })
    );
    line.scale.setScalar(1.018);
    mesh.add(line);
    this.outlineObj = line;
  }

  setXray(enabled) {
    this.xrayMode = !!enabled;
    this.refreshMaterials();
  }

  setIsolated(structureId) {
    this.isolatedId = structureId || null;
    this.refreshVisibility();
    this.refreshMaterials();
  }

  setHidden(structureId, hidden) {
    if (hidden) this.hiddenIds.add(structureId);
    else this.hiddenIds.delete(structureId);
    this.refreshVisibility();
  }

  showAll() {
    this.isolatedId = null;
    this.hiddenIds.clear();
    this.refreshVisibility();
    this.refreshMaterials();
  }

  refreshVisibility() {
    for (const [id, mesh] of this.meshMap.entries()) {
      if (this.isolatedId) {
        mesh.visible = id === this.isolatedId;
      } else {
        mesh.visible = !this.hiddenIds.has(id);
      }
    }
  }

  refreshMaterials() {
    for (const [id, mesh] of this.meshMap.entries()) {
      const m = mesh.material;
      const isSel = id === this.selectedId;
      const isHov = id === this.hoveredId;
      if (isSel) {
        m.color.setHex(0x34d399);
        if (m.emissive) m.emissive.setHex(0x0b5340);
        m.transparent = false;
        m.opacity = 1;
        m.depthWrite = true;
      } else if (isHov) {
        m.color.setHex(0x38bdf8);
        if (m.emissive) m.emissive.setHex(0x0c4a6e);
        m.transparent = this.xrayMode;
        m.opacity = this.xrayMode ? 0.55 : 1;
        m.depthWrite = !this.xrayMode;
      } else {
        if (mesh.userData.origColor) m.color.copy(mesh.userData.origColor);
        if (m.emissive) m.emissive.setHex(0x000000);
        m.transparent = this.xrayMode;
        m.opacity = this.xrayMode ? 0.24 : 1;
        m.depthWrite = !this.xrayMode;
      }
      m.needsUpdate = true;
    }
  }

  updatePulse(dt) {
    if (this.pulseTimer <= 0 || !this.selectedId) return false;
    const mesh = this.meshMap.get(this.selectedId);
    if (!mesh) return false;
    this.pulseTimer = Math.max(0, this.pulseTimer - dt * 2.2);
    const bump = 1 + Math.sin(this.pulseTimer * Math.PI) * 0.08;
    mesh.scale.setScalar(bump);
    if (this.pulseTimer === 0) mesh.scale.setScalar(1);
    return true;
  }
}
