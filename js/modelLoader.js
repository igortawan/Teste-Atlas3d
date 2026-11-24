/**
 * Carregador de modelos 3D segmentados (.glb, .gltf, .obj) com carregamento progressivo,
 * suporte a arquivos locais do usuário, fallback automático para o modo demonstrativo
 * e descarte seguro de memória (dispose).
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { getModelManifestForSpecies } from './anatomyDatabase.js';
import { buildDemoSkeleton } from './demoSkeletonBuilder.js';

const gltfLoader = new GLTFLoader();
const objLoader = new OBJLoader();

export function disposeObject3D(obj) {
  if (!obj) return;
  obj.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      for (const m of mats) {
        if (m.map) m.map.dispose();
        m.dispose();
      }
    }
  });
}

function indexExternalModel(root, structures) {
  const byMeshName = new Map(structures.map((b) => [b.meshName || b.id, b]));
  const meshMap = new Map();
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  const normScale = 2.2 / maxDim;

  // Normaliza tamanho e apoio no piso
  root.scale.multiplyScalar(normScale);
  root.updateMatrixWorld(true);
  const normBox = new THREE.Box3().setFromObject(root);
  const normCenter = normBox.getCenter(new THREE.Vector3());
  root.position.set(-normCenter.x, -normBox.min.y, -normCenter.z);
  root.updateMatrixWorld(true);

  let unmatchedCount = 0;
  const skinMeshes = [];
  root.traverse((child) => {
    if (!child.isMesh) return;
    if ((child.name || '').toLowerCase().startsWith('skin_')) {
      skinMeshes.push(child);
      return;
    }
    child.castShadow = true;
    child.receiveShadow = true;
    const matched = byMeshName.get(child.name);
    const structureId = matched ? matched.id : `custom_${child.name || unmatchedCount++}`;
    const bBox = new THREE.Box3().setFromObject(child);
    const bCenter = bBox.getCenter(new THREE.Vector3());
    const radial = bCenter.clone().sub(new THREE.Vector3(0, normBox.getSize(new THREE.Vector3()).y * 0.5, 0));
    if (radial.lengthSq() < 0.001) radial.set(0, 1, 0);
    radial.normalize().multiplyScalar(0.55);

    child.userData = {
      structureId,
      customName: child.name || structureId,
      species: matched?.species || null,
      region: matched?.region || 'custom',
      subregion: matched?.subregion || 'custom',
      side: matched?.side || 'median',
      regionGroups: matched?.explosionConfig?.regionGroups || ['all'],
      basePosition: child.position.clone(),
      baseQuaternion: child.quaternion.clone(),
      baseRotation: child.rotation.clone(),
      explosionVector: radial,
      inspectOffset: new THREE.Vector3(),
      inspectEuler: new THREE.Euler(),
      landmarks: matched?.landmarks || []
    };
    meshMap.set(structureId, child);
  });

  // Se o modelo externo possuir malhas com prefixo skin_, agrupa-as na Camada 01
  let skinLayer = null;
  if (skinMeshes.length) {
    skinLayer = new THREE.Group();
    skinLayer.name = 'external_layer_skin';
    skinMeshes.forEach((m) => {
      m.userData.naturalColor = m.material?.color?.clone() || new THREE.Color(0xb08d6a);
      skinLayer.attach(m);
    });
    root.add(skinLayer);
  }

  return { root, meshMap, layers: { skin: skinLayer, bones: root }, isDemoModel: false, center };
}

export async function loadSpeciesModel(speciesId, structures, { onProgress, scaleMultiplier = 1 } = {}) {
  const entry = getModelManifestForSpecies(speciesId);
  if (entry?.file) {
    try {
      const ext = (entry.format || entry.file.split('.').pop() || 'glb').toLowerCase();
      if (ext === 'obj') {
        const obj = await new Promise((resolve, reject) => objLoader.load(entry.file, resolve, onProgress, reject));
        return indexExternalModel(obj, structures);
      }
      const gltf = await new Promise((resolve, reject) => gltfLoader.load(entry.file, resolve, onProgress, reject));
      return indexExternalModel(gltf.scene, structures);
    } catch (err) {
      console.warn(`[ATLAS VET 3D] Modelo externo não carregado (${entry.file}); ativando modo demonstrativo.`, err);
    }
  }
  return buildDemoSkeleton(speciesId, structures, { scaleMultiplier });
}

export async function loadUserUploadedModel(file, structures) {
  const url = URL.createObjectURL(file);
  try {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'obj') {
      const obj = await new Promise((resolve, reject) => objLoader.load(url, resolve, undefined, reject));
      return indexExternalModel(obj, structures);
    }
    const gltf = await new Promise((resolve, reject) => gltfLoader.load(url, resolve, undefined, reject));
    return indexExternalModel(gltf.scene, structures);
  } finally {
    URL.revokeObjectURL(url);
  }
}
