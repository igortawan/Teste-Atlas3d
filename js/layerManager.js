/**
 * Gerenciador de Camadas Anatômicas 3D (arquitetura expansível).
 * Camada 01: Pele / Conformação Externa (Animal Completo)
 * Camada 02: Ossos (Osteologia segmentada)
 * Camadas 03-06: Preparadas na arquitetura como futuras camadas.
 */
export const ANATOMICAL_LAYERS = [
  {
    id: 'skin',
    order: 1,
    code: 'Camada 01',
    name: 'Pele e Conformação Externa',
    subtitle: 'Animal completo (tegumento)',
    icon: 'paw-print',
    implemented: true,
    defaultVisible: true,
    defaultOpacity: 0.38
  },
  {
    id: 'bones',
    order: 2,
    code: 'Camada 02',
    name: 'Ossos (Esqueleto)',
    subtitle: 'Osteologia segmentada',
    icon: 'bone',
    implemented: true,
    defaultVisible: true,
    defaultOpacity: 1.0
  },
  {
    id: 'muscles',
    order: 3,
    code: 'Camada 03',
    name: 'Músculos (Miologia)',
    subtitle: 'Camada futura planejada',
    icon: 'activity',
    implemented: false
  },
  {
    id: 'joints',
    order: 4,
    code: 'Camada 04',
    name: 'Articulações e Ligamentos',
    subtitle: 'Camada futura planejada',
    icon: 'link',
    implemented: false
  },
  {
    id: 'organs',
    order: 5,
    code: 'Camada 05',
    name: 'Órgãos Internos (Vísceras)',
    subtitle: 'Camada futura planejada',
    icon: 'heart-pulse',
    implemented: false
  },
  {
    id: 'vessels',
    order: 6,
    code: 'Camada 06',
    name: 'Vasos e Nervos',
    subtitle: 'Camada futura planejada',
    icon: 'brain',
    implemented: false
  }
];

export const LAYER_PRESETS = {
  animal_solid: {
    id: 'animal_solid',
    label: 'Animal 3D',
    fullLabel: 'Animal Completo (Pele 100%)',
    skinVisible: true,
    skinOpacity: 1.0,
    bonesVisible: true
  },
  translucent: {
    id: 'translucent',
    label: 'Pele + Ossos',
    fullLabel: 'Pele Translúcida + Ossos',
    skinVisible: true,
    skinOpacity: 0.38,
    bonesVisible: true
  },
  bones_only: {
    id: 'bones_only',
    label: 'Só Ossos',
    fullLabel: 'Somente Ossos (Esqueleto)',
    skinVisible: false,
    skinOpacity: 0.38,
    bonesVisible: true
  }
};

export function createDefaultLayerState() {
  return {
    preset: 'translucent',
    skinVisible: true,
    skinOpacity: 0.38,
    skinStyle: 'natural', // 'natural' | 'clinical'
    bonesVisible: true
  };
}

export function applyPresetToLayerState(current, presetId) {
  const p = LAYER_PRESETS[presetId];
  if (!p) return current;
  return {
    ...current,
    preset: p.id,
    skinVisible: p.skinVisible,
    skinOpacity: p.skinOpacity,
    bonesVisible: p.bonesVisible
  };
}

export function detectPresetFromLayerState(st) {
  if (!st.skinVisible && st.bonesVisible) return 'bones_only';
  if (st.skinVisible && st.skinOpacity >= 0.95) return 'animal_solid';
  if (st.skinVisible && st.bonesVisible && Math.abs(st.skinOpacity - 0.38) < 0.08) return 'translucent';
  return 'custom';
}

/**
 * Aplica visibilidade, opacidade e regras de Z-buffer/renderOrder nas camadas 3D
 * para garantir que ossos internos permaneçam nítidos através da pele translúcida.
 */
export function applyLayersToModel(layers, layerState, { explosionFactor = 0 } = {}) {
  if (!layers) return;

  if (layers.bones) {
    layers.bones.visible = !!layerState.bonesVisible;
    layers.bones.traverse((child) => {
      if (child.isMesh) {
        child.renderOrder = 1;
      }
    });
  }

  if (layers.skin) {
    // Durante anatomia explodida (>5%), atenua automaticamente a pele para não atravessar os ossos
    const explodedFade = explosionFactor > 0.05 ? Math.max(0.08, layerState.skinOpacity * (1 - explosionFactor * 0.85)) : layerState.skinOpacity;
    const isSolid = layerState.skinVisible && explodedFade >= 0.98 && explosionFactor <= 0.05;
    layers.skin.visible = !!layerState.skinVisible && explodedFade > 0.02;

    layers.skin.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const m = child.material;
      if (!child.userData.naturalColor) {
        child.userData.naturalColor = m.color.clone();
      }
      if (layerState.skinStyle === 'clinical') {
        m.color.setHex(child.userData.isAccentDetail ? 0x0ea5e9 : 0x38bdf8);
      } else {
        m.color.copy(child.userData.naturalColor);
      }

      if (isSolid) {
        m.transparent = false;
        m.opacity = 1;
        m.depthWrite = true;
        child.renderOrder = 2;
        child.castShadow = true;
      } else {
        m.transparent = true;
        m.opacity = explodedFade;
        m.depthWrite = false;
        child.renderOrder = 3;
        child.castShadow = false;
      }
      m.needsUpdate = true;
    });
  }
}
