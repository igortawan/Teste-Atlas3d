/**
 * Visualizador 3D principal (Three.js + WebGL) do Laboratório Virtual.
 * Inclui iluminação de laboratório, grade anatômica, otimização adaptativa de FPS,
 * controle de qualidade gráfica, suspensão quando inativo e gerenciamento de memória.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CameraController } from './cameraControls.js';
import { SelectionManager } from './selectionManager.js';
import { ExplodedViewController } from './explodedView.js';
import { LandmarkManager } from './landmarkManager.js';
import { loadSpeciesModel, loadUserUploadedModel, disposeObject3D } from './modelLoader.js';
import { applyLayersToModel, createDefaultLayerState } from './layerManager.js';

export class Viewer3D {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.disposed = false;
    this.active = true;
    this.quality = callbacks.quality || 'medium';
    this.currentModelRoot = null;
    this.meshMap = new Map();
    this.layers = null;
    this.layerState = callbacks.initialLayerState ? { ...callbacks.initialLayerState } : createDefaultLayerState();
    this.isDemoModel = true;
    this.rafId = null;
    this.lastTime = performance.now();
    this.needsRender = true;

    this._initScene();
    this._initLightsAndGrid();
    this._initControllers();
    this._bindResizeAndVisibility();
    this._loop();
  }

  _initScene() {
    this.scene = new THREE.Scene();
    const w = Math.max(160, this.container.clientWidth);
    const h = Math.max(140, this.container.clientHeight);
    this.camera = new THREE.PerspectiveCamera(42, w / h, 0.04, 45);
    this.camera.position.set(2.05, 1.35, 2.55);

    this.renderer = new THREE.WebGLRenderer({ antialias: this.quality !== 'low', alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(w, h);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.applyQuality(this.quality);
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 0.35;
    this.controls.maxDistance = 12;
    this.controls.addEventListener('change', () => { this.needsRender = true; });
  }

  _initLightsAndGrid() {
    this.ambientLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.85);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xfffbeb, 1.55);
    this.keyLight.position.set(3.2, 4.8, 3.6);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(1024, 1024);
    this.keyLight.shadow.bias = -0.0004;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 16;
    const d = 2.6;
    this.keyLight.shadow.camera.left = -d;
    this.keyLight.shadow.camera.right = d;
    this.keyLight.shadow.camera.top = d;
    this.keyLight.shadow.camera.bottom = -d;
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 0.55);
    this.rimLight.position.set(-3.2, 2.2, -3.0);
    this.scene.add(this.rimLight);

    this.fillLight = new THREE.DirectionalLight(0x10b981, 0.25);
    this.fillLight.position.set(0, -2.5, 1.5);
    this.scene.add(this.fillLight);

    // Piso receptor de sombra e grade científica
    const floorGeom = new THREE.CircleGeometry(3.8, 48);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.24 });
    this.shadowFloor = new THREE.Mesh(floorGeom, floorMat);
    this.shadowFloor.rotation.x = -Math.PI / 2;
    this.shadowFloor.receiveShadow = true;
    this.scene.add(this.shadowFloor);

    this.grid = new THREE.GridHelper(4.8, 24, 0x14b8a6, 0x334155);
    this.grid.position.y = 0.001;
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.34;
    this.scene.add(this.grid);
  }

  _initControllers() {
    this.cameraCtrl = new CameraController(this.camera, this.controls, () => { this.needsRender = true; });
    this.selection = new SelectionManager({
      camera: this.camera,
      domElement: this.renderer.domElement,
      onSelect: (id) => this.callbacks.onBoneClicked?.(id),
      onHover: (id, x, y) => this.callbacks.onBoneHover?.(id, x, y)
    });
    this.exploded = new ExplodedViewController(this.scene);
    this.landmarks = new LandmarkManager({
      scene: this.scene,
      camera: this.camera,
      domElement: this.renderer.domElement,
      onSelectLandmark: (lm) => this.callbacks.onLandmarkClicked?.(lm)
    });
  }

  _bindResizeAndVisibility() {
    this._ro = new ResizeObserver(() => this.resize());
    this._ro.observe(this.container);
    this._onVis = () => {
      this.active = document.visibilityState === 'visible';
      if (this.active) this.needsRender = true;
    };
    document.addEventListener('visibilitychange', this._onVis);
  }

  resize() {
    if (this.disposed) return;
    const w = Math.max(160, this.container.clientWidth);
    const h = Math.max(140, this.container.clientHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.needsRender = true;
  }

  applyQuality(level) {
    this.quality = level;
    const dpr = window.devicePixelRatio || 1;
    if (level === 'low') {
      this.renderer.setPixelRatio(Math.min(1, dpr));
      this.renderer.shadowMap.enabled = false;
    } else if (level === 'high') {
      this.renderer.setPixelRatio(Math.min(2, dpr));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } else {
      this.renderer.setPixelRatio(Math.min(1.5, dpr));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
    }
    this.needsRender = true;
  }

  setGridVisible(visible) {
    this.grid.visible = !!visible;
    this.needsRender = true;
  }

  async loadSpecies(speciesId, structures, { onProgress } = {}) {
    this.clearCurrentModel();
    const loaded = await loadSpeciesModel(speciesId, structures, { onProgress });
    this._mountModel(loaded);
    return loaded;
  }

  async loadCustomFile(file, structures) {
    this.clearCurrentModel();
    const loaded = await loadUserUploadedModel(file, structures);
    this._mountModel(loaded);
    return loaded;
  }

  _mountModel({ root, meshMap, layers, isDemoModel }) {
    this.currentModelRoot = root;
    this.meshMap = meshMap;
    this.layers = layers || { skin: null, bones: root };
    this.isDemoModel = isDemoModel;
    this.scene.add(root);

    this.selection.setMeshMap(meshMap);
    this.exploded.setMeshMap(meshMap);
    this.landmarks.clear();
    this.applyLayerState(this.layerState);

    const box = new THREE.Box3().setFromObject(root);
    this.cameraCtrl.setSceneBounds(box);
    this.cameraCtrl.reset();
    this.needsRender = true;
  }

  applyLayerState(nextState) {
    this.layerState = { ...this.layerState, ...nextState };
    applyLayersToModel(this.layers, this.layerState, { explosionFactor: this.exploded.currentFactor });
    this.selection.setBonesLayerVisible(this.layerState.bonesVisible);
    this.landmarks.setEnabled(this.landmarks.enabled && this.layerState.bonesVisible);
    this.needsRender = true;
  }

  clearCurrentModel() {
    this.landmarks.clear();
    this.exploded.clearGuides();
    if (this.currentModelRoot) {
      this.scene.remove(this.currentModelRoot);
      disposeObject3D(this.currentModelRoot);
      this.currentModelRoot = null;
    }
    this.layers = null;
    this.meshMap = new Map();
  }

  selectBone(bone, { focusCamera = true } = {}) {
    const id = bone?.id || null;
    this.selection.select(id);
    this.exploded.setScope(this.exploded.scope, id);
    if (bone && this.meshMap.has(id)) {
      const mesh = this.meshMap.get(id);
      this.landmarks.showForBone(mesh, bone.landmarks || []);
      if (focusCamera) this.cameraCtrl.focusOnObject(mesh);
    } else {
      this.landmarks.clear();
    }
    this.needsRender = true;
  }

  setIndividualTransform(boneId, { rotYDeg = 0, rotXDeg = 0, lift = 0 } = {}) {
    const mesh = this.meshMap.get(boneId);
    if (!mesh) return;
    mesh.userData.inspectEuler.set((rotXDeg * Math.PI) / 180, (rotYDeg * Math.PI) / 180, 0);
    mesh.userData.inspectOffset.set(0, lift, 0);
    this.exploded.applyTransforms();
    this.landmarks.syncPositions();
    this.needsRender = true;
  }

  resetIndividualTransforms() {
    for (const mesh of this.meshMap.values()) {
      mesh.userData.inspectEuler?.set(0, 0, 0);
      mesh.userData.inspectOffset?.set(0, 0, 0);
    }
    this.exploded.applyTransforms();
    this.landmarks.syncPositions();
    this.needsRender = true;
  }

  _loop() {
    if (this.disposed) return;
    this.rafId = requestAnimationFrame(() => this._loop());
    if (!this.active) return;

    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    const camAnim = this.cameraCtrl.update(now);
    const exAnim = this.exploded.update(dt);
    const pulseAnim = this.selection.updatePulse(dt);
    const ctrlChanged = this.controls.update();

    if (exAnim || camAnim || pulseAnim || ctrlChanged || this.needsRender) {
      if (exAnim && this.layers?.skin) {
        applyLayersToModel(this.layers, this.layerState, { explosionFactor: this.exploded.currentFactor });
      }
      this.landmarks.syncPositions();
      this.renderer.render(this.scene, this.camera);
      this.needsRender = false;
    }
  }

  dispose() {
    this.disposed = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this._ro?.disconnect();
    document.removeEventListener('visibilitychange', this._onVis);
    this.selection.dispose();
    this.landmarks.dispose();
    this.clearCurrentModel();
    this.controls.dispose();
    this.shadowFloor.geometry.dispose();
    this.shadowFloor.material.dispose();
    this.grid.geometry.dispose();
    this.grid.material.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
