/**
 * Construtor Anatômico Articulado Demonstrativo (Three.js).
 * Gera esqueletos tridimensionais proporcionais a cada uma das 8 espécies, onde cada osso
 * cadastrado em osteology.json é uma malha independente (THREE.Mesh) identificada pelo meshName.
 * Geometria ilustrativa utilizada quando não há modelo .glb/.gltf científico carregado.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildDemoBody } from './demoBodyBuilder.js';

// Proporções reais aproximadas (em unidades normalizadas de cena, ~2.4 de comprimento total para mamíferos)
const SPECIES_PROPORTIONS = {
  bovine:  { len: 2.35, bodyH: 1.28, chestW: 0.44, neckLen: 0.56, neckPitch: 0.36, legLen: 0.96, skullLen: 0.46, horns: 'bovine', heavy: 1.18, withersBoost: 0.14, tailLen: 0.65 },
  equine:  { len: 2.45, bodyH: 1.42, chestW: 0.40, neckLen: 0.72, neckPitch: 0.68, legLen: 1.10, skullLen: 0.54, horns: null,     heavy: 1.05, withersBoost: 0.24, tailLen: 0.58 },
  caprine: { len: 1.55, bodyH: 0.92, chestW: 0.28, neckLen: 0.44, neckPitch: 0.62, legLen: 0.68, skullLen: 0.34, horns: 'caprine', heavy: 0.85, withersBoost: 0.08, tailLen: 0.24 },
  ovine:   { len: 1.52, bodyH: 0.88, chestW: 0.30, neckLen: 0.40, neckPitch: 0.55, legLen: 0.64, skullLen: 0.34, horns: 'ovine',   heavy: 0.90, withersBoost: 0.07, tailLen: 0.32 },
  swine:   { len: 1.85, bodyH: 0.84, chestW: 0.38, neckLen: 0.34, neckPitch: 0.24, legLen: 0.54, skullLen: 0.44, horns: null,     heavy: 1.22, withersBoost: 0.08, tailLen: 0.34, snout: true },
  canine:  { len: 1.68, bodyH: 0.86, chestW: 0.28, neckLen: 0.42, neckPitch: 0.58, legLen: 0.68, skullLen: 0.38, horns: null,     heavy: 0.86, withersBoost: 0.07, tailLen: 0.56 },
  feline:  { len: 1.32, bodyH: 0.62, chestW: 0.21, neckLen: 0.32, neckPitch: 0.56, legLen: 0.48, skullLen: 0.26, horns: null,     heavy: 0.72, withersBoost: 0.04, tailLen: 0.62 },
  avian:   { len: 1.10, bodyH: 0.85, chestW: 0.24, neckLen: 0.46, neckPitch: 1.15, legLen: 0.66, skullLen: 0.22, horns: null,     heavy: 0.75 }
};

function mergeParts(parts) {
  const normalized = parts.map((g) => {
    const ng = g.index ? g.toNonIndexed() : g.clone();
    if (!ng.getAttribute('normal')) ng.computeVertexNormals();
    // Remove UV para evitar incompatibilidade no merge
    if (ng.getAttribute('uv')) ng.deleteAttribute('uv');
    return ng;
  });
  const merged = mergeGeometries(normalized, false);
  normalized.forEach((g) => g.dispose());
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}

function tx(geom, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz));
  m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(sx, sy, sz));
  geom.applyMatrix4(m);
  return geom;
}

/** Cria um osso longo estilizado com epífises proximal/distal e diáfise levemente curva. */
function makeLongBoneGeom(length, radius, curveZ = 0, headScale = 1.65) {
  const shaft = new THREE.CylinderGeometry(radius * 0.92, radius * 0.88, length * 0.84, 12, 4);
  if (curveZ !== 0) {
    const pos = shaft.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = y / (length * 0.42);
      pos.setX(i, pos.getX(i) + (1 - t * t) * curveZ);
    }
    shaft.computeVertexNormals();
  }
  const prox = tx(new THREE.SphereGeometry(radius * headScale, 12, 10), 0, length * 0.44, 0, 0, 0, 0, 1.05, 0.85, 1.15);
  const dist = tx(new THREE.SphereGeometry(radius * headScale * 0.95, 12, 10), 0, -length * 0.44, 0, 0, 0, 0, 1.1, 0.8, 1.25);
  return mergeParts([shaft, prox, dist]);
}

function makeVertebraGeom(bodyLen, bodyR, spineH, transW, spineTilt = -0.25) {
  const body = tx(new THREE.CylinderGeometry(bodyR, bodyR * 0.95, bodyLen, 10), 0, 0, 0, 0, 0, Math.PI / 2);
  const arch = tx(new THREE.TorusGeometry(bodyR * 0.88, bodyR * 0.28, 6, 10, Math.PI), 0, bodyR * 0.45, 0, 0, Math.PI / 2, 0);
  const spine = tx(new THREE.BoxGeometry(bodyLen * 0.48, spineH, bodyR * 0.36), -spineTilt * spineH * 0.25, bodyR * 1.1 + spineH * 0.45, 0, 0, 0, spineTilt);
  const trL = tx(new THREE.BoxGeometry(bodyLen * 0.38, bodyR * 0.28, transW), 0, bodyR * 0.4, -transW * 0.55);
  const trR = tx(new THREE.BoxGeometry(bodyLen * 0.38, bodyR * 0.28, transW), 0, bodyR * 0.4, transW * 0.55);
  return mergeParts([body, arch, spine, trL, trR]);
}

function makeSkullGeom(len, hornsType = null, isAvian = false) {
  if (isAvian) {
    const vault = tx(new THREE.SphereGeometry(len * 0.36, 14, 12), -len * 0.1, 0.02, 0, 0, 0, 0, 1.2, 0.95, 0.95);
    const beak = tx(new THREE.ConeGeometry(len * 0.16, len * 0.58, 10), len * 0.42, -0.02, 0, 0, 0, -Math.PI / 2);
    return mergeParts([vault, beak]);
  }
  const parts = [
    tx(new THREE.SphereGeometry(len * 0.34, 14, 12), -len * 0.15, 0.03, 0, 0, 0, 0, 1.25, 0.9, 0.92),
    tx(new THREE.BoxGeometry(len * 0.38, len * 0.16, len * 0.44), len * 0.06, 0.01, 0),
    tx(new THREE.TorusGeometry(len * 0.11, len * 0.025, 6, 12), len * 0.08, 0.04, len * 0.24, 0, Math.PI / 2, 0),
    tx(new THREE.TorusGeometry(len * 0.11, len * 0.025, 6, 12), len * 0.08, 0.04, -len * 0.24, 0, Math.PI / 2, 0)
  ];
  if (hornsType === 'bovine' || hornsType === 'caprine' || hornsType === 'ovine') {
    for (const s of [-1, 1]) {
      const curve = new THREE.CatmullRomCurve3(
        hornsType === 'bovine'
          ? [new THREE.Vector3(-len * 0.25, len * 0.16, s * len * 0.18), new THREE.Vector3(-len * 0.2, len * 0.28, s * len * 0.45), new THREE.Vector3(-len * 0.05, len * 0.42, s * len * 0.52)]
          : hornsType === 'caprine'
            ? [new THREE.Vector3(-len * 0.22, len * 0.18, s * len * 0.12), new THREE.Vector3(-len * 0.45, len * 0.36, s * len * 0.22), new THREE.Vector3(-len * 0.65, len * 0.32, s * len * 0.32)]
            : [new THREE.Vector3(-len * 0.22, len * 0.16, s * len * 0.16), new THREE.Vector3(-len * 0.35, len * 0.24, s * len * 0.34), new THREE.Vector3(-len * 0.22, len * 0.06, s * len * 0.38)]
      );
      parts.push(new THREE.TubeGeometry(curve, 10, len * 0.042, 7, false));
    }
  }
  return mergeParts(parts);
}

function makeRibGeom(radiusX, dropY, flareZ, thick, hasUncinate = false) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(radiusX * 0.15, -dropY * 0.18, flareZ * 0.72),
    new THREE.Vector3(radiusX * 0.1, -dropY * 0.58, flareZ),
    new THREE.Vector3(0, -dropY * 0.92, flareZ * 0.55),
    new THREE.Vector3(0, -dropY, flareZ * 0.18)
  ]);
  const tube = new THREE.TubeGeometry(curve, 14, thick, 7, false);
  if (!hasUncinate) return tube;
  const unc = tx(new THREE.BoxGeometry(thick * 5.2, thick * 1.4, thick * 1.1), -thick * 2.5, -dropY * 0.42, flareZ * 0.95, 0, 0, 0.45);
  return mergeParts([tube, unc]);
}

function makeScapulaGeom(h, w, sideSign, isAvian = false) {
  if (isAvian) {
    return tx(new THREE.BoxGeometry(h * 1.2, w * 0.32, w * 0.14), 0, 0, 0, 0, 0, -0.2);
  }
  const blade = tx(new THREE.CylinderGeometry(w * 0.55, w * 0.2, h, 8), 0, 0, 0, 0, 0, 0, 1.0, 1.0, 0.22);
  const spine = tx(new THREE.BoxGeometry(w * 0.12, h * 0.85, w * 0.16), 0, 0, sideSign * w * 0.12);
  const glenoid = tx(new THREE.SphereGeometry(w * 0.22, 10, 8), 0, -h * 0.5, 0);
  return mergeParts([blade, spine, glenoid]);
}

function makeCoxalGeom(len, w) {
  const ilium = tx(new THREE.BoxGeometry(len * 0.58, len * 0.26, w * 0.28), len * 0.22, len * 0.08, 0, 0, 0, 0.32);
  const ischium = tx(new THREE.BoxGeometry(len * 0.48, len * 0.18, w * 0.22), -len * 0.22, -len * 0.06, 0, 0, 0, -0.15);
  const pubis = tx(new THREE.CylinderGeometry(len * 0.055, len * 0.055, w * 0.55, 8), 0.04, -len * 0.12, -w * 0.14, Math.PI / 2, 0, 0);
  const acetab = tx(new THREE.TorusGeometry(len * 0.095, len * 0.032, 8, 12), 0, -len * 0.02, w * 0.11, 0, Math.PI / 2, 0);
  return mergeParts([ilium, ischium, pubis, acetab]);
}

function createBoneMaterial(bone) {
  // Tom marfim mineral realista levemente diferenciado entre axial e apendicular
  const color = bone.division === 'axial' ? 0xe7dfd0 : 0xede6d8;
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.52,
    metalness: 0.04
  });
}

function buildGeomAndPose(bone, p, ctx) {
  const s = bone.side === 'left' ? -1 : bone.side === 'right' ? 1 : 0;
  const h = p.heavy;
  const chestY = p.bodyH * 0.78;
  const spineLen = p.len * 0.62;
  const xShoulder = spineLen * 0.34;
  const xHip = -spineLen * 0.36;
  const zShoulder = p.chestW * 0.62;
  const zHip = p.chestW * 0.44;
  const pos = new THREE.Vector3();
  const rot = new THREE.Euler();
  let geom;

  // --------- AVE (GALINHA) ---------
  if (bone.species === 'avian') {
    switch (bone.shapeKey) {
      case 'av_cranium':
        geom = makeSkullGeom(p.skullLen, null, true);
        pos.set(0.42, p.bodyH * 1.18, 0);
        break;
      case 'av_mandible':
        geom = mergeParts([
          tx(new THREE.BoxGeometry(p.skullLen * 0.62, 0.02, 0.022), 0.03, 0, 0.024, 0, -0.18, 0),
          tx(new THREE.BoxGeometry(p.skullLen * 0.62, 0.02, 0.022), 0.03, 0, -0.024, 0, 0.18, 0)
        ]);
        pos.set(0.45, p.bodyH * 1.12, 0);
        break;
      case 'quadrate':
        geom = new THREE.BoxGeometry(0.03, 0.04, 0.025);
        pos.set(0.39, p.bodyH * 1.13, s * 0.042);
        break;
      case 'atlas':
      case 'axis':
      case 'av_atlas':
      case 'av_axis': {
        const idx = bone.shapeKey.includes('atlas') ? 0 : 1;
        geom = makeVertebraGeom(0.032, 0.018, 0.024, 0.018);
        pos.set(0.34 - idx * 0.03, p.bodyH * 1.14 - idx * 0.03, 0);
        rot.set(0, 0, -0.5);
        break;
      }
      case 'av_vert_cervical': {
        const t = ((bone.serialIndex || 3) - 3) / 11;
        geom = makeVertebraGeom(0.034, 0.017, 0.018, 0.018);
        // Curva em S característica do pescoço aviário
        const x = 0.29 - Math.sin(t * Math.PI) * 0.06 - t * 0.16;
        const y = p.bodyH * 1.07 - t * 0.34 + Math.sin(t * Math.PI * 1.2) * 0.03;
        pos.set(x, y, 0);
        rot.set(0, 0, -0.95 + Math.cos(t * Math.PI) * 0.55);
        break;
      }
      case 'av_vert_thoracic': {
        const x = bone.serialIndex === 1 ? 0.09 : -0.09;
        geom = makeVertebraGeom(0.038, 0.022, 0.045, 0.025);
        pos.set(x, p.bodyH * 0.72, 0);
        rot.set(0, 0, -0.25);
        break;
      }
      case 'notarium':
        geom = mergeParts([
          tx(new THREE.BoxGeometry(0.15, 0.04, 0.045), 0, 0, 0),
          tx(new THREE.BoxGeometry(0.14, 0.045, 0.014), 0, 0.035, 0)
        ]);
        pos.set(0.0, p.bodyH * 0.75, 0);
        rot.set(0, 0, -0.22);
        break;
      case 'synsacrum':
        geom = mergeParts([
          tx(new THREE.BoxGeometry(0.26, 0.042, 0.09), 0, 0, 0),
          tx(new THREE.BoxGeometry(0.24, 0.036, 0.016), 0, 0.03, 0)
        ]);
        pos.set(-0.23, p.bodyH * 0.65, 0);
        rot.set(0, 0, 0.32);
        break;
      case 'av_caudal_series':
        geom = mergeParts([0, 1, 2, 3].map((k) => tx(makeVertebraGeom(0.022, 0.012, 0.018, 0.014), -k * 0.024, 0, 0)));
        pos.set(-0.38, p.bodyH * 0.60, 0);
        rot.set(0, 0, 0.25);
        break;
      case 'pygostyle':
        geom = tx(new THREE.ConeGeometry(0.025, 0.07, 6), 0, 0, 0, 0, 0, Math.PI * 0.42);
        pos.set(-0.48, p.bodyH * 0.63, 0);
        break;
      case 'av_rib': {
        const i = (bone.serialIndex || 1) - 1;
        const t = i / 6;
        geom = makeRibGeom(0.04, 0.22 + Math.sin(t * Math.PI) * 0.06, 0.11, 0.0085, true);
        pos.set(0.08 - t * 0.20, p.bodyH * 0.72 - t * 0.05, s * 0.025);
        if (s < 0) geom.scale(1, 1, -1);
        break;
      }
      case 'av_sternum':
        geom = mergeParts([
          tx(new THREE.BoxGeometry(0.28, 0.022, 0.14), 0, 0.04, 0, 0, 0, -0.18),
          tx(new THREE.BoxGeometry(0.26, 0.10, 0.016), -0.01, -0.02, 0, 0, 0, -0.18)
        ]);
        pos.set(0.02, p.bodyH * 0.43, 0);
        break;
      case 'furcula': {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.04, 0.11, -0.07),
          new THREE.Vector3(0.08, -0.03, 0),
          new THREE.Vector3(0.04, 0.11, 0.07)
        ]);
        geom = new THREE.TubeGeometry(curve, 14, 0.01, 7, false);
        pos.set(0.16, p.bodyH * 0.57, 0);
        break;
      }
      case 'coracoid':
        geom = makeLongBoneGeom(0.17, 0.016, 0);
        pos.set(0.13, p.bodyH * 0.60, s * 0.065);
        rot.set(s * 0.28, 0, -0.35);
        break;
      case 'av_scapula':
        geom = makeScapulaGeom(0.22, 0.08, s, true);
        pos.set(0.0, p.bodyH * 0.77, s * 0.09);
        break;
      case 'av_humerus':
        geom = makeLongBoneGeom(0.20, 0.018, 0.01);
        pos.set(0.03, p.bodyH * 0.69, s * 0.14);
        rot.set(s * 0.15, 0, 0.95);
        break;
      case 'av_radius':
        geom = makeLongBoneGeom(0.19, 0.009, 0.005);
        pos.set(0.01, p.bodyH * 0.67, s * 0.165);
        rot.set(0, 0, -0.75);
        break;
      case 'av_ulna':
        geom = makeLongBoneGeom(0.20, 0.015, -0.012);
        pos.set(-0.01, p.bodyH * 0.65, s * 0.16);
        rot.set(0, 0, -0.75);
        break;
      case 'carpometacarpus':
        geom = mergeParts([
          tx(makeLongBoneGeom(0.14, 0.012), 0, 0, 0),
          tx(new THREE.CylinderGeometry(0.007, 0.007, 0.11, 6), 0.018, 0, 0)
        ]);
        pos.set(-0.06, p.bodyH * 0.69, s * 0.17);
        rot.set(0, 0, 1.15);
        break;
      case 'wing_digits':
        geom = tx(new THREE.ConeGeometry(0.012, 0.07, 6), 0, 0, 0, 0, 0, Math.PI / 2);
        pos.set(-0.16, p.bodyH * 0.65, s * 0.17);
        break;
      case 'av_pelvis':
        geom = makeCoxalGeom(0.26, 0.13);
        pos.set(-0.22, p.bodyH * 0.61, s * 0.085);
        rot.set(0, 0, 0.25);
        break;
      case 'av_femur':
        geom = makeLongBoneGeom(0.19, 0.020, 0.012);
        pos.set(-0.14, p.bodyH * 0.51, s * 0.11);
        rot.set(0, 0, -0.95);
        break;
      case 'tibiotarsus':
        geom = makeLongBoneGeom(0.26, 0.018, 0);
        pos.set(-0.12, p.bodyH * 0.34, s * 0.11);
        rot.set(0, 0, 0.42);
        break;
      case 'av_fibula':
        geom = tx(new THREE.ConeGeometry(0.007, 0.17, 6), 0, 0, 0, 0, 0, Math.PI);
        pos.set(-0.13, p.bodyH * 0.38, s * 0.13);
        rot.set(0, 0, 0.42);
        break;
      case 'tarsometatarsus':
        geom = makeLongBoneGeom(0.18, 0.014, 0);
        pos.set(-0.13, p.bodyH * 0.13, s * 0.10);
        rot.set(0, 0, -0.35);
        break;
      case 'pedal_digits':
        geom = mergeParts([
          tx(new THREE.BoxGeometry(0.11, 0.014, 0.016), 0.04, 0, 0),
          tx(new THREE.BoxGeometry(0.09, 0.013, 0.014), 0.03, 0, s * 0.03, 0, -s * 0.35, 0),
          tx(new THREE.BoxGeometry(0.09, 0.013, 0.014), 0.03, 0, -s * 0.03, 0, s * 0.35, 0),
          tx(new THREE.BoxGeometry(0.055, 0.013, 0.014), -0.04, 0, 0)
        ]);
        pos.set(-0.10, 0.02, s * 0.10);
        break;
      default:
        geom = new THREE.SphereGeometry(0.03, 8, 8);
    }
    return { geom, pos, rot };
  }

  // --------- MAMÍFEROS ---------
  const neckStart = new THREE.Vector3(spineLen * 0.48, chestY + 0.04, 0);
  const skullPos = new THREE.Vector3(
    neckStart.x + Math.cos(p.neckPitch) * p.neckLen + 0.12,
    neckStart.y + Math.sin(p.neckPitch) * p.neckLen + 0.08,
    0
  );

  switch (bone.shapeKey) {
    case 'cranium':
      geom = makeSkullGeom(p.skullLen, p.horns, false);
      pos.copy(skullPos);
      rot.set(0, 0, -0.25);
      break;
    case 'maxilla': {
      const mLen = p.skullLen * 0.56;
      const parts = [tx(new THREE.BoxGeometry(mLen, p.skullLen * 0.22, p.skullLen * 0.22), mLen * 0.35, -p.skullLen * 0.04, 0)];
      if (p.snout) parts.push(tx(new THREE.CylinderGeometry(p.skullLen * 0.11, p.skullLen * 0.13, mLen * 0.5, 10), mLen * 0.5, 0, 0, 0, 0, Math.PI / 2));
      geom = mergeParts(parts);
      pos.set(skullPos.x + p.skullLen * 0.22, skullPos.y - 0.05, s * p.skullLen * 0.10);
      rot.set(0, 0, -0.35);
      break;
    }
    case 'rostral':
      geom = tx(new THREE.CylinderGeometry(0.038, 0.042, 0.045, 10), 0, 0, 0, 0, 0, Math.PI / 2);
      pos.set(skullPos.x + p.skullLen * 0.62, skullPos.y - 0.13, 0);
      break;
    case 'mandible':
      geom = mergeParts([
        tx(new THREE.BoxGeometry(p.skullLen * 0.72, p.skullLen * 0.11, p.skullLen * 0.1), 0.06, -0.04, p.skullLen * 0.13, 0, -0.15, -0.1),
        tx(new THREE.BoxGeometry(p.skullLen * 0.72, p.skullLen * 0.11, p.skullLen * 0.1), 0.06, -0.04, -p.skullLen * 0.13, 0, 0.15, -0.1),
        tx(new THREE.BoxGeometry(p.skullLen * 0.15, p.skullLen * 0.26, p.skullLen * 0.07), -p.skullLen * 0.22, 0.04, p.skullLen * 0.18),
        tx(new THREE.BoxGeometry(p.skullLen * 0.15, p.skullLen * 0.26, p.skullLen * 0.07), -p.skullLen * 0.22, 0.04, -p.skullLen * 0.18)
      ]);
      pos.set(skullPos.x + p.skullLen * 0.08, skullPos.y - p.skullLen * 0.24, 0);
      rot.set(0, 0, -0.30);
      break;
    case 'atlas':
      geom = makeVertebraGeom(0.065 * h, 0.048 * h, 0.03, 0.095 * h);
      pos.copy(neckStart).add(new THREE.Vector3(Math.cos(p.neckPitch) * p.neckLen * 0.94, Math.sin(p.neckPitch) * p.neckLen * 0.94, 0));
      rot.set(0, 0, p.neckPitch - 1.15);
      break;
    case 'axis':
      geom = makeVertebraGeom(0.08 * h, 0.042 * h, 0.075 * h, 0.045 * h);
      pos.copy(neckStart).add(new THREE.Vector3(Math.cos(p.neckPitch) * p.neckLen * 0.80, Math.sin(p.neckPitch) * p.neckLen * 0.80, 0));
      rot.set(0, 0, p.neckPitch - 1.1);
      break;
    case 'vert_cervical': {
      const idx = (bone.serialIndex || 3) - 3; // 0..4
      const t = 1 - (idx + 1.5) / 6.5;
      geom = makeVertebraGeom(p.neckLen * 0.14, 0.038 * h, 0.055 * h, 0.05 * h);
      pos.copy(neckStart).add(new THREE.Vector3(Math.cos(p.neckPitch) * p.neckLen * t, Math.sin(p.neckPitch) * p.neckLen * t - Math.sin(t * Math.PI) * 0.04, 0));
      rot.set(0, 0, p.neckPitch - 1.25);
      break;
    }
    case 'vert_thoracic': {
      const nT = ctx.thoracicCount || 13;
      const i = (bone.serialIndex || 1) - 1;
      const t = i / Math.max(1, nT - 1);
      const isWithers = t < 0.42;
      const spineH = (0.09 + (isWithers ? p.withersBoost * Math.sin((t / 0.42) * Math.PI) : 0.02)) * h;
      geom = makeVertebraGeom((spineLen * 0.56) / nT * 0.88, 0.036 * h, spineH, 0.042 * h, t < 0.7 ? -0.28 : 0.12);
      const x = spineLen * (0.45 - t * 0.55);
      const y = chestY + Math.sin(t * Math.PI) * 0.03;
      pos.set(x, y, 0);
      break;
    }
    case 'vert_lumbar': {
      const nL = ctx.lumbarCount || 6;
      const i = (bone.serialIndex || 1) - 1;
      const t = i / Math.max(1, nL - 1);
      geom = makeVertebraGeom((spineLen * 0.28) / nL * 0.88, 0.038 * h, 0.072 * h, 0.088 * h, 0.12);
      const x = spineLen * (-0.14 - t * 0.24);
      pos.set(x, chestY + 0.025, 0);
      break;
    }
    case 'sacrum':
      geom = mergeParts([
        tx(new THREE.BoxGeometry(spineLen * 0.16, 0.052 * h, 0.12 * h), 0, 0, 0),
        tx(new THREE.BoxGeometry(spineLen * 0.14, 0.055 * h, 0.022 * h), 0, 0.045 * h, 0)
      ]);
      pos.set(spineLen * -0.46, chestY + 0.01, 0);
      rot.set(0, 0, 0.22);
      break;
    case 'vert_caudal_series': {
      const segs = [];
      const count = 8;
      for (let k = 0; k < count; k++) {
        const sc = 1 - k * 0.08;
        segs.push(tx(new THREE.CylinderGeometry(0.018 * h * sc, 0.015 * h * sc, p.tailLen / count * 0.85, 7), -k * (p.tailLen / count) * 0.42, -Math.pow(k, 1.35) * 0.018, 0, 0, 0, 0.85));
      }
      geom = mergeParts(segs);
      pos.set(spineLen * -0.57, chestY - 0.03, 0);
      break;
    }
    case 'rib': {
      const nR = ctx.ribCount || 13;
      const i = (bone.serialIndex || 1) - 1;
      const t = i / Math.max(1, nR - 1);
      const depth = p.bodyH * (0.28 + Math.sin((0.15 + t * 0.75) * Math.PI) * 0.16);
      const flare = p.chestW * (0.55 + Math.sin((0.1 + t * 0.85) * Math.PI) * 0.48);
      geom = makeRibGeom(0.055, depth, flare, (bone.species === 'bovine' ? 0.016 : 0.011) * h, false);
      const x = spineLen * (0.44 - t * 0.54);
      pos.set(x, chestY, s * 0.035);
      if (s < 0) geom.scale(1, 1, -1);
      break;
    }
    case 'sternum':
      geom = tx(new THREE.BoxGeometry(spineLen * 0.46, 0.048 * h, 0.068 * h), 0, 0, 0, 0, 0, 0.16);
      pos.set(spineLen * 0.19, chestY - p.bodyH * 0.40, 0);
      break;
    case 'scapula':
      geom = makeScapulaGeom(p.legLen * 0.38, p.legLen * 0.18, s, false);
      pos.set(xShoulder, chestY - 0.06, s * zShoulder);
      rot.set(0, 0, -0.45);
      break;
    case 'clavicle':
      geom = tx(new THREE.CylinderGeometry(0.006, 0.006, 0.065, 6), 0, 0, 0, 0.5, 0, 0.6);
      pos.set(xShoulder + 0.09, chestY - 0.18, s * (zShoulder * 0.65));
      break;
    case 'humerus': {
      const l = p.legLen * 0.30;
      geom = makeLongBoneGeom(l, 0.028 * h, 0.015);
      pos.set(xShoulder - 0.03, chestY - 0.31, s * (zShoulder * 0.96));
      rot.set(0, 0, 0.55);
      break;
    }
    case 'radius': {
      const l = p.legLen * 0.32;
      geom = makeLongBoneGeom(l, 0.022 * h, 0.008);
      pos.set(xShoulder + 0.02, p.legLen * 0.42, s * (zShoulder * 0.92));
      rot.set(0, 0, -0.08);
      break;
    }
    case 'ulna': {
      const l = p.legLen * 0.35;
      const ulna = makeLongBoneGeom(l, 0.016 * h, -0.006);
      const olecranon = tx(new THREE.BoxGeometry(0.045 * h, 0.075 * h, 0.028 * h), -0.022, l * 0.48, 0);
      geom = mergeParts([ulna, olecranon]);
      pos.set(xShoulder - 0.025, p.legLen * 0.44, s * (zShoulder * 0.92));
      rot.set(0, 0, -0.08);
      break;
    }
    case 'carpus':
      geom = new THREE.BoxGeometry(0.055 * h, 0.055 * h, 0.055 * h);
      pos.set(xShoulder + 0.03, p.legLen * 0.23, s * (zShoulder * 0.92));
      break;
    case 'metacarpus':
      geom = makeLongBoneGeom(p.legLen * 0.21, 0.018 * h, 0);
      pos.set(xShoulder + 0.04, p.legLen * 0.12, s * (zShoulder * 0.92));
      break;
    case 'phalanges':
      geom = mergeParts([
        tx(new THREE.BoxGeometry(0.065 * h, 0.036 * h, 0.055 * h), 0.02, 0, 0, 0, 0, -0.35)
      ]);
      pos.set(xShoulder + 0.06, 0.03, s * (zShoulder * 0.92));
      break;
    case 'coxal':
      geom = makeCoxalGeom(p.len * 0.24, p.chestW * 0.9);
      pos.set(xHip - 0.03, chestY - 0.04, s * zHip);
      rot.set(0, 0, -0.25);
      break;
    case 'femur': {
      const l = p.legLen * 0.35;
      geom = makeLongBoneGeom(l, 0.031 * h, 0.016);
      pos.set(xHip + 0.02, chestY - 0.24, s * (zHip * 1.15));
      rot.set(0, 0, -0.45);
      break;
    }
    case 'patella':
      geom = tx(new THREE.SphereGeometry(0.028 * h, 10, 8), 0, 0, 0, 0, 0, 0, 0.85, 1.25, 0.9);
      pos.set(xHip + 0.12, chestY - 0.37, s * (zHip * 1.15));
      break;
    case 'tibia':
      geom = makeLongBoneGeom(p.legLen * 0.35, 0.025 * h, 0.01);
      pos.set(xHip - 0.02, p.legLen * 0.42, s * (zHip * 1.12));
      rot.set(0, 0, 0.38);
      break;
    case 'fibula':
      geom = makeLongBoneGeom(p.legLen * (['bovine', 'equine', 'caprine', 'ovine'].includes(bone.species) ? 0.15 : 0.32), 0.008 * h, 0);
      pos.set(xHip - 0.05, p.legLen * 0.46, s * (zHip * 1.18));
      rot.set(0, 0, 0.38);
      break;
    case 'tarsus':
      geom = mergeParts([
        tx(new THREE.BoxGeometry(0.055 * h, 0.068 * h, 0.05 * h), 0, 0, 0),
        tx(new THREE.BoxGeometry(0.035 * h, 0.07 * h, 0.032 * h), -0.028, 0.035, 0, 0, 0, 0.3)
      ]);
      pos.set(xHip - 0.09, p.legLen * 0.24, s * (zHip * 1.10));
      break;
    case 'metatarsus':
      geom = makeLongBoneGeom(p.legLen * 0.22, 0.018 * h, 0);
      pos.set(xHip - 0.07, p.legLen * 0.12, s * (zHip * 1.10));
      rot.set(0, 0, -0.05);
      break;
    case 'phalanges_pes':
      geom = tx(new THREE.BoxGeometry(0.068 * h, 0.036 * h, 0.055 * h), 0.02, 0, 0, 0, 0, -0.35);
      pos.set(xHip - 0.04, 0.03, s * (zHip * 1.10));
      break;
    case 'splint_bones': {
      const isManus = bone.region === 'thoracic_limb';
      const bx = isManus ? xShoulder + 0.025 : xHip - 0.085;
      const bz = s * (isManus ? zShoulder * 0.92 : zHip * 1.10);
      geom = mergeParts([
        tx(new THREE.CylinderGeometry(0.005 * h, 0.003 * h, p.legLen * 0.14, 6), 0, 0, 0.022),
        tx(new THREE.CylinderGeometry(0.005 * h, 0.003 * h, p.legLen * 0.14, 6), 0, 0, -0.022)
      ]);
      pos.set(bx, p.legLen * 0.15, bz);
      break;
    }
    case 'phalanx_proximal': {
      const isManus = bone.region === 'thoracic_limb';
      geom = makeLongBoneGeom(0.07, 0.017 * h, 0);
      pos.set(isManus ? xShoulder + 0.055 : xHip - 0.055, 0.075, s * (isManus ? zShoulder * 0.92 : zHip * 1.10));
      rot.set(0, 0, 0.45);
      break;
    }
    case 'phalanx_middle': {
      const isManus = bone.region === 'thoracic_limb';
      geom = makeLongBoneGeom(0.045, 0.018 * h, 0);
      pos.set(isManus ? xShoulder + 0.08 : xHip - 0.03, 0.042, s * (isManus ? zShoulder * 0.92 : zHip * 1.10));
      rot.set(0, 0, 0.55);
      break;
    }
    case 'phalanx_distal': {
      const isManus = bone.region === 'thoracic_limb';
      geom = tx(new THREE.ConeGeometry(0.034 * h, 0.05, 10), 0, 0, 0, 0, 0, -0.2);
      pos.set(isManus ? xShoulder + 0.105 : xHip - 0.005, 0.02, s * (isManus ? zShoulder * 0.92 : zHip * 1.10));
      break;
    }
    case 'navicular': {
      const isManus = bone.region === 'thoracic_limb';
      geom = new THREE.BoxGeometry(0.016, 0.014, 0.038);
      pos.set(isManus ? xShoulder + 0.075 : xHip - 0.035, 0.028, s * (isManus ? zShoulder * 0.92 : zHip * 1.10));
      break;
    }
    default:
      geom = new THREE.SphereGeometry(0.03, 8, 8);
  }

  return { geom, pos, rot };
}

/**
 * Constrói um THREE.Group contendo um esqueleto articulado demonstrativo completo para a espécie.
 */
export function buildDemoSkeleton(speciesId, structures, { scaleMultiplier = 1 } = {}) {
  const p = SPECIES_PROPORTIONS[speciesId] || SPECIES_PROPORTIONS.bovine;
  const ctx = {
    thoracicCount: structures.filter((b) => b.subregion === 'thoracic').length,
    lumbarCount: structures.filter((b) => b.subregion === 'lumbar').length,
    ribCount: Math.round(structures.filter((b) => b.subregion === 'ribs').length / 2)
  };

  const root = new THREE.Group();
  root.name = `${speciesId}_demo_animal`;
  const bonesGroup = new THREE.Group();
  bonesGroup.name = `${speciesId}_layer_bones`;
  root.add(bonesGroup);
  const meshMap = new Map();

  for (const bone of structures) {
    const { geom, pos, rot } = buildGeomAndPose(bone, p, ctx);
    const mat = createBoneMaterial(bone);
    const mesh = new THREE.Mesh(geom, mat);
    mesh.name = bone.meshName || bone.id;
    mesh.position.copy(pos);
    mesh.rotation.copy(rot);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.renderOrder = 1;

    // Calcula vetor de explosão anatômica coerente a partir da direção configurada e posição
    const dir = bone.explosionConfig?.direction || [0, 0.5, 0];
    const exVec = new THREE.Vector3(dir[0], dir[1], dir[2]);
    if (exVec.lengthSq() < 0.001) exVec.set(0, 1, 0);
    exVec.normalize().multiplyScalar(bone.region === 'thoracic_cage' ? 0.42 : 0.55);

    mesh.userData = {
      structureId: bone.id,
      species: bone.species,
      region: bone.region,
      subregion: bone.subregion,
      side: bone.side,
      regionGroups: bone.explosionConfig?.regionGroups || [bone.region],
      basePosition: pos.clone(),
      baseQuaternion: mesh.quaternion.clone(),
      baseRotation: rot.clone(),
      explosionVector: exVec,
      inspectOffset: new THREE.Vector3(),
      inspectEuler: new THREE.Euler(),
      landmarks: bone.landmarks || []
    };

    bonesGroup.add(mesh);
    meshMap.set(bone.id, mesh);
  }

  // Centraliza o esqueleto no eixo X/Z mantendo as patas apoiadas em Y = 0
  const box = new THREE.Box3().setFromObject(bonesGroup);
  const center = box.getCenter(new THREE.Vector3());
  const minY = box.min.y;
  for (const mesh of meshMap.values()) {
    mesh.position.x -= center.x;
    mesh.position.z -= center.z;
    mesh.position.y -= minY;
    mesh.userData.basePosition.copy(mesh.position);
  }

  // Constrói a Camada 01 (Pele / Animal Completo) alinhada às posições centralizadas dos ossos
  const skinGroup = buildDemoBody(speciesId, p, meshMap);
  root.add(skinGroup);

  if (scaleMultiplier !== 1) {
    root.scale.setScalar(scaleMultiplier);
  }

  return {
    root,
    meshMap,
    layers: { skin: skinGroup, bones: bonesGroup },
    isDemoModel: true
  };
}
