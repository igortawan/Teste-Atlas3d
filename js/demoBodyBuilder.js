/**
 * Construtor Anatômico Demonstrativo da Camada 01 — Pele e Conformação Externa (Animal Completo).
 * Gera uma malha 3D orgânica para cada uma das 8 espécies diretamente alinhada sobre as posições
 * reais dos ossos da Camada 02 (meshMap), permitindo alternar entre animal completo e visão interna.
 */
import * as THREE from 'three';

const SKIN_PALETTE = {
  bovine:  { coat: 0x8c5638, accent: 0x2b221e, eye: 0x111827, detail: 0xd6bfa6, nose: 0x2d2420 },
  equine:  { coat: 0x7c3f23, accent: 0x1e1815, eye: 0x111827, detail: 0x241d19, nose: 0x261f1c },
  caprine: { coat: 0xb08d6a, accent: 0x2c2420, eye: 0x111827, detail: 0x3b312b, nose: 0x382c26 },
  ovine:   { coat: 0xded9cc, accent: 0x4b4640, eye: 0x111827, detail: 0x625a52, nose: 0x3d3733 },
  swine:   { coat: 0xd2917d, accent: 0x5c4239, eye: 0x111827, detail: 0xe2a896, nose: 0xc27065 },
  canine:  { coat: 0xb67e46, accent: 0x211c19, eye: 0x111827, detail: 0xd2a46f, nose: 0x1c1917 },
  feline:  { coat: 0x6b7280, accent: 0x374151, eye: 0xf59e0b, detail: 0x9ca3af, nose: 0xd98695 },
  avian:   { coat: 0xb56532, accent: 0xbe123c, eye: 0x111827, detail: 0xd97706, nose: 0xd97706 }
};

function makeSkinMat(hex, { roughness = 0.78, isAccentDetail = false } = {}) {
  const mat = new THREE.MeshStandardMaterial({
    color: hex,
    roughness,
    metalness: 0.02,
    side: THREE.FrontSide
  });
  return { mat, isAccentDetail };
}

/**
 * Gera um tubo orgânico contínuo por seções transversais elípticas assimétricas
 * ao longo de pontos 3D. Cada estação define { pos: Vector3, rx, ryTop, ryBot }.
 */
function buildLoftedGeometry(stations, radialSegs = 20, capEnds = true) {
  const points = stations.map((s) => s.pos);
  const curve = new THREE.CatmullRomCurve3(points);
  const steps = Math.max(24, stations.length * 6);

  const sampleParam = (u, key) => {
    const f = u * (stations.length - 1);
    const i = Math.min(stations.length - 2, Math.floor(f));
    const t = f - i;
    const smooth = t * t * (3 - 2 * t);
    return stations[i][key] * (1 - smooth) + stations[i + 1][key] * smooth;
  };

  const positions = [];
  const indices = [];
  const upRef = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const p = curve.getPointAt(u);
    const tangent = curve.getTangentAt(u).normalize();

    // Eixo lateral (Z aproximado) perpendicular ao plano sagital da coluna
    let side = new THREE.Vector3().crossVectors(tangent, upRef);
    if (side.lengthSq() < 0.0004) side.set(0, 0, 1);
    side.normalize();
    const normalUp = new THREE.Vector3().crossVectors(side, tangent).normalize();

    const rz = sampleParam(u, 'rz');
    const ryTop = sampleParam(u, 'ryTop');
    const ryBot = sampleParam(u, 'ryBot');

    for (let j = 0; j <= radialSegs; j++) {
      const theta = (j / radialSegs) * Math.PI * 2;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);
      const ry = sin >= 0 ? ryTop : ryBot;
      const vx = p.x + side.x * cos * rz + normalUp.x * sin * ry;
      const vy = p.y + side.y * cos * rz + normalUp.y * sin * ry;
      const vz = p.z + side.z * cos * rz + normalUp.z * sin * ry;
      positions.push(vx, vy, vz);
    }
  }

  const ringStride = radialSegs + 1;
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * ringStride + j;
      const b = (i + 1) * ringStride + j;
      const c = (i + 1) * ringStride + (j + 1);
      const d = i * ringStride + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  if (capEnds) {
    const startCenterIdx = positions.length / 3;
    const p0 = curve.getPointAt(0);
    positions.push(p0.x, p0.y, p0.z);
    for (let j = 0; j < radialSegs; j++) {
      indices.push(startCenterIdx, j + 1, j);
    }
    const endCenterIdx = positions.length / 3;
    const p1 = curve.getPointAt(1);
    positions.push(p1.x, p1.y, p1.z);
    const lastBase = steps * ringStride;
    for (let j = 0; j < radialSegs; j++) {
      indices.push(endCenterIdx, lastBase + j, lastBase + j + 1);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

function addMesh(group, geom, hex, { roughness = 0.78, isAccentDetail = false, pos = null, rot = null, scale = null } = {}) {
  const { mat } = makeSkinMat(hex, { roughness, isAccentDetail });
  const m = new THREE.Mesh(geom, mat);
  if (pos) m.position.copy(pos);
  if (rot) m.rotation.copy(rot);
  if (scale) m.scale.copy(scale);
  m.userData.isAccentDetail = isAccentDetail;
  m.userData.naturalColor = mat.color.clone();
  m.castShadow = true;
  m.receiveShadow = true;
  group.add(m);
  return m;
}

function posOf(meshMap, id) {
  return meshMap.get(id)?.userData?.basePosition?.clone() || null;
}

function buildLimbTube(group, pts, radii, hex, hoofHex, isHoofed, isAvianLeg = false, isDoubleHoof = false) {
  const valid = pts.filter(Boolean);
  if (valid.length < 2) return;
  const stations = valid.map((p, idx) => {
    const r = radii[Math.min(idx, radii.length - 1)];
    return { pos: p, rz: r * 0.92, ryTop: r, ryBot: r };
  });
  const geom = buildLoftedGeometry(stations, 14, true);
  addMesh(group, geom, hex, { roughness: isAvianLeg ? 0.65 : 0.78 });

  // Extremidade distal (casco / pata / dedos)
  const foot = valid[valid.length - 1];
  if (isAvianLeg) {
    // Pé fino com dedos no solo
    const pad = new THREE.CylinderGeometry(radii[radii.length - 1] * 0.95, radii[radii.length - 1] * 1.4, 0.025, 10);
    addMesh(group, pad, hoofHex, { isAccentDetail: true, pos: new THREE.Vector3(foot.x + 0.015, Math.max(0.014, foot.y), foot.z) });
  } else if (isHoofed) {
    const rFoot = radii[radii.length - 1] * 1.28;
    if (isDoubleHoof) {
      for (const dz of [-rFoot * 0.48, rFoot * 0.48]) {
        const hoof = new THREE.CylinderGeometry(rFoot * 0.56, rFoot * 0.72, rFoot * 1.15, 10);
        addMesh(group, hoof, hoofHex, { isAccentDetail: true, pos: new THREE.Vector3(foot.x + 0.01, rFoot * 0.58, foot.z + dz) });
      }
    } else {
      const hoof = new THREE.CylinderGeometry(rFoot * 0.85, rFoot * 1.08, rFoot * 1.2, 12);
      addMesh(group, hoof, hoofHex, { isAccentDetail: true, pos: new THREE.Vector3(foot.x + 0.01, rFoot * 0.6, foot.z) });
    }
  } else {
    const rPaw = radii[radii.length - 1] * 1.32;
    const paw = new THREE.SphereGeometry(rPaw, 12, 10);
    addMesh(group, paw, hex, {
      pos: new THREE.Vector3(foot.x + rPaw * 0.35, rPaw * 0.55, foot.z),
      scale: new THREE.Vector3(1.35, 0.65, 1.05)
    });
  }
}

/**
 * Constrói a Camada 01 (Animal Completo) alinhada com os ossos já posicionados no meshMap.
 */
export function buildDemoBody(speciesId, p, meshMap) {
  const pal = SKIN_PALETTE[speciesId] || SKIN_PALETTE.bovine;
  const skinGroup = new THREE.Group();
  skinGroup.name = `${speciesId}_layer_skin`;

  const cranium = posOf(meshMap, `${speciesId}_cranium`);
  const mandible = posOf(meshMap, `${speciesId}_mandible`);
  const atlas = posOf(meshMap, `${speciesId}_atlas`);
  const sacrum = posOf(meshMap, speciesId === 'avian' ? 'avian_synsacrum' : `${speciesId}_sacrum`);
  const sternum = posOf(meshMap, `${speciesId}_sternum`);

  // Coleta vértebras para seguir exatamente a linha anatômica da coluna
  const thor = [];
  const lumb = [];
  const cerv = [];
  for (const [id, m] of meshMap.entries()) {
    if (id.includes('_vert_thoracic_')) thor.push({ idx: Number(id.split('_').pop()), pos: m.userData.basePosition.clone() });
    else if (id.includes('_vert_lumbar_')) lumb.push({ idx: Number(id.split('_').pop()), pos: m.userData.basePosition.clone() });
    else if (id.includes('_vert_cervical_')) cerv.push({ idx: Number(id.split('_').pop()), pos: m.userData.basePosition.clone() });
  }
  thor.sort((a, b) => a.idx - b.idx);
  lumb.sort((a, b) => a.idx - b.idx);
  cerv.sort((a, b) => a.idx - b.idx);

  // =========================================================================
  // AVE — GALINHA (postura bípede, asas laterais, crista, bico e cauda em leque)
  // =========================================================================
  if (speciesId === 'avian') {
    const notarium = posOf(meshMap, 'avian_notarium') || new THREE.Vector3(0, 0.65, 0);
    const synsacrum = sacrum || new THREE.Vector3(-0.2, 0.56, 0);
    const pygostyle = posOf(meshMap, 'avian_pygostyle') || new THREE.Vector3(-0.44, 0.56, 0);
    const neckMid = cerv[Math.floor(cerv.length / 2)]?.pos || new THREE.Vector3(0.18, 0.80, 0);
    const headBase = cranium || new THREE.Vector3(0.40, 1.02, 0);

    // Tronco plumoso arredondado + pescoço em S
    const bodyStations = [
      { pos: new THREE.Vector3(pygostyle.x + 0.04, synsacrum.y - 0.04, 0), rz: 0.08, ryTop: 0.07, ryBot: 0.07 },
      { pos: new THREE.Vector3(synsacrum.x, synsacrum.y - 0.06, 0), rz: 0.16, ryTop: 0.11, ryBot: 0.16 },
      { pos: new THREE.Vector3(notarium.x, (notarium.y + (sternum?.y || 0.36)) * 0.5, 0), rz: 0.175, ryTop: 0.15, ryBot: 0.19 },
      { pos: new THREE.Vector3(notarium.x + 0.13, notarium.y - 0.03, 0), rz: 0.125, ryTop: 0.11, ryBot: 0.14 },
      { pos: new THREE.Vector3(neckMid.x, neckMid.y, 0), rz: 0.062, ryTop: 0.065, ryBot: 0.065 },
      { pos: new THREE.Vector3((atlas?.x || headBase.x - 0.06), (atlas?.y || headBase.y - 0.04), 0), rz: 0.052, ryTop: 0.055, ryBot: 0.055 }
    ];
    addMesh(skinGroup, buildLoftedGeometry(bodyStations, 22, true), pal.coat, { roughness: 0.85 });

    // Cabeça, bico, olhos, crista e barbelas
    addMesh(skinGroup, new THREE.SphereGeometry(0.082, 16, 12), pal.coat, {
      pos: headBase.clone().add(new THREE.Vector3(-0.01, 0, 0)),
      scale: new THREE.Vector3(1.18, 0.96, 0.92)
    });
    const beakGeom = new THREE.ConeGeometry(0.032, 0.11, 10);
    beakGeom.rotateZ(-Math.PI / 2);
    addMesh(skinGroup, beakGeom, pal.detail, { isAccentDetail: true, roughness: 0.45, pos: headBase.clone().add(new THREE.Vector3(0.11, -0.015, 0)) });

    // Crista carnosa dorsal e barbelas ventrais
    const comb = new THREE.BoxGeometry(0.12, 0.065, 0.018);
    addMesh(skinGroup, comb, pal.accent, { isAccentDetail: true, roughness: 0.6, pos: headBase.clone().add(new THREE.Vector3(0.0, 0.085, 0)) });
    for (const s of [-1, 1]) {
      addMesh(skinGroup, new THREE.SphereGeometry(0.022, 10, 8), pal.accent, {
        isAccentDetail: true,
        pos: headBase.clone().add(new THREE.Vector3(0.045, -0.075, s * 0.022)),
        scale: new THREE.Vector3(0.9, 1.45, 0.55)
      });
      addMesh(skinGroup, new THREE.SphereGeometry(0.014, 8, 8), pal.eye, {
        isAccentDetail: true, roughness: 0.2,
        pos: headBase.clone().add(new THREE.Vector3(0.035, 0.015, s * 0.062))
      });
      // Asas fechadas sobre os ossos da asa
      const hum = posOf(meshMap, `avian_humerus_${s < 0 ? 'left' : 'right'}`);
      const carp = posOf(meshMap, `avian_carpometacarpus_${s < 0 ? 'left' : 'right'}`);
      if (hum && carp) {
        const wingMid = hum.clone().lerp(carp, 0.5).add(new THREE.Vector3(-0.03, 0, s * 0.02));
        addMesh(skinGroup, new THREE.SphereGeometry(0.10, 14, 10), pal.coat, {
          pos: wingMid,
          scale: new THREE.Vector3(1.65, 0.85, 0.35),
          rot: new THREE.Euler(0, 0, -0.25)
        });
      }
      // Pernas (coxa emplumada -> canela amarela)
      const sideKey = s < 0 ? 'left' : 'right';
      const hip = posOf(meshMap, `avian_femur_${sideKey}`);
      const tib = posOf(meshMap, `avian_tibiotarsus_${sideKey}`);
      const tars = posOf(meshMap, `avian_tarsometatarsus_${sideKey}`);
      const foot = posOf(meshMap, `avian_pedal_digits_${sideKey}`);
      if (hip && tib) {
        buildLimbTube(skinGroup, [hip.clone().add(new THREE.Vector3(0, 0.05, 0)), tib], [0.078, 0.038], pal.coat, pal.coat, false, false);
      }
      if (tib && tars && foot) {
        buildLimbTube(skinGroup, [tib.clone().add(new THREE.Vector3(0, -0.06, 0)), tars, foot], [0.024, 0.016, 0.014], pal.detail, pal.detail, false, true);
      }
    }
    // Cauda em leque sobre o pigóstilo
    const tailFan = new THREE.ConeGeometry(0.11, 0.22, 8);
    tailFan.rotateZ(Math.PI * 0.65);
    addMesh(skinGroup, tailFan, pal.coat, {
      pos: pygostyle.clone().add(new THREE.Vector3(-0.06, 0.06, 0)),
      scale: new THREE.Vector3(1, 1, 0.32)
    });
    return skinGroup;
  }

  // =========================================================================
  // MAMÍFEROS QUADRÚPEDES (Bovino, Equino, Caprino, Ovino, Suíno, Canino, Felino)
  // =========================================================================
  const tFirst = thor[0]?.pos || new THREE.Vector3(0.4, p.bodyH * 0.75, 0);
  const tMid = thor[Math.floor(thor.length * 0.35)]?.pos || new THREE.Vector3(0.15, p.bodyH * 0.78, 0);
  const tLast = thor[thor.length - 1]?.pos || new THREE.Vector3(-0.1, p.bodyH * 0.76, 0);
  const lMid = lumb[Math.floor(lumb.length * 0.5)]?.pos || new THREE.Vector3(-0.28, p.bodyH * 0.77, 0);
  const sacPos = sacrum || new THREE.Vector3(-0.5, p.bodyH * 0.74, 0);
  const cervMid = cerv[Math.floor(cerv.length * 0.5)]?.pos || tFirst.clone().lerp(atlas || tFirst, 0.5);
  const neckEnd = atlas || cranium || cervMid;

  const isRuminant = ['bovine', 'caprine', 'ovine'].includes(speciesId);
  const isSheep = speciesId === 'ovine';
  const isPig = speciesId === 'swine';
  const isHorse = speciesId === 'equine';
  const isCarnivore = ['canine', 'feline'].includes(speciesId);

  const chestDrop = (tMid.y - (sternum?.y || tMid.y - p.bodyH * 0.36)) + 0.05;
  const wScale = isSheep ? 1.24 : isPig ? 1.15 : isCarnivore ? 0.92 : 1.05;
  const bellyBot = isCarnivore ? chestDrop * 0.58 : isHorse ? chestDrop * 0.76 : chestDrop * 0.94;
  const neckThick = isPig ? 1.32 : isHorse ? 0.95 : isSheep ? 1.18 : 1.0;

  const trunkStations = [
    { pos: new THREE.Vector3(sacPos.x - 0.10, sacPos.y - 0.14, 0), rz: p.chestW * 0.42 * wScale, ryTop: 0.10, ryBot: 0.12 },
    { pos: new THREE.Vector3(sacPos.x + 0.04, sacPos.y - 0.12, 0), rz: p.chestW * 0.68 * wScale, ryTop: 0.15, ryBot: 0.20 },
    { pos: new THREE.Vector3(lMid.x, lMid.y - 0.14, 0), rz: p.chestW * 0.76 * wScale, ryTop: 0.15, ryBot: bellyBot },
    { pos: new THREE.Vector3(tLast.x, tLast.y - 0.16, 0), rz: p.chestW * 0.92 * wScale, ryTop: 0.16, ryBot: chestDrop * 0.88 },
    { pos: new THREE.Vector3(tMid.x, tMid.y - 0.16, 0), rz: p.chestW * 0.96 * wScale, ryTop: 0.18 + (isHorse ? 0.06 : 0), ryBot: chestDrop * 0.94 },
    { pos: new THREE.Vector3(tFirst.x + 0.04, tFirst.y - 0.12, 0), rz: p.chestW * 0.74 * wScale, ryTop: 0.15, ryBot: chestDrop * 0.72 },
    { pos: new THREE.Vector3(cervMid.x, cervMid.y - 0.04, 0), rz: p.chestW * 0.44 * neckThick, ryTop: 0.14 * neckThick, ryBot: 0.17 * neckThick },
    { pos: new THREE.Vector3(neckEnd.x, neckEnd.y - 0.02, 0), rz: p.chestW * 0.34 * neckThick, ryTop: 0.11 * neckThick, ryBot: 0.12 * neckThick }
  ];
  addMesh(skinGroup, buildLoftedGeometry(trunkStations, 24, true), pal.coat, { roughness: isSheep ? 0.94 : 0.76 });

  // Barbela (papada) característica no bovino
  if (speciesId === 'bovine') {
    const dewlap = new THREE.SphereGeometry(0.11, 12, 10);
    addMesh(skinGroup, dewlap, pal.coat, {
      pos: new THREE.Vector3(tFirst.x + 0.14, tFirst.y - chestDrop * 0.72, 0),
      scale: new THREE.Vector3(1.85, 0.85, 0.38),
      rot: new THREE.Euler(0, 0, 0.45)
    });
  }

  // Crina dorsal característica no equino
  if (isHorse) {
    const maneStations = [
      { pos: new THREE.Vector3(tFirst.x + 0.02, tFirst.y + 0.05, 0), rz: 0.032, ryTop: 0.065, ryBot: 0.02 },
      { pos: new THREE.Vector3(cervMid.x - 0.03, cervMid.y + 0.11, 0), rz: 0.035, ryTop: 0.085, ryBot: 0.02 },
      { pos: new THREE.Vector3(neckEnd.x - 0.02, neckEnd.y + 0.10, 0), rz: 0.028, ryTop: 0.075, ryBot: 0.02 }
    ];
    addMesh(skinGroup, buildLoftedGeometry(maneStations, 10, true), pal.accent, { isAccentDetail: true, roughness: 0.9 });
  }

  // Cabeça + Focinho + Orelhas + Olhos + Chifres
  if (cranium) {
    const headBase = cranium.clone();
    const headR = p.skullLen * 0.44;
    addMesh(skinGroup, new THREE.SphereGeometry(headR, 16, 12), pal.coat, {
      pos: headBase,
      scale: new THREE.Vector3(1.22, 0.96, 0.88),
      rot: new THREE.Euler(0, 0, -0.25)
    });

    const muzzleDir = new THREE.Vector3(Math.cos(-0.42), Math.sin(-0.42), 0);
    const muzzlePos = headBase.clone().addScaledVector(muzzleDir, p.skullLen * 0.56);
    const snoutRad = isPig ? headR * 0.55 : isCarnivore ? headR * 0.46 : headR * 0.50;
    const snoutGeom = new THREE.CylinderGeometry(snoutRad * 0.72, snoutRad, p.skullLen * 0.62, 14);
    snoutGeom.rotateZ(-Math.PI / 2 - 0.42);
    addMesh(skinGroup, snoutGeom, isSheep ? pal.accent : pal.coat, { pos: muzzlePos });

    // Focinho / Muflo / Disco rostral suíno
    const nosePos = headBase.clone().addScaledVector(muzzleDir, p.skullLen * 0.88);
    if (isPig) {
      const disc = new THREE.CylinderGeometry(snoutRad * 0.74, snoutRad * 0.74, 0.035, 14);
      disc.rotateZ(-Math.PI / 2 - 0.42);
      addMesh(skinGroup, disc, pal.nose, { isAccentDetail: true, roughness: 0.55, pos: nosePos });
    } else {
      addMesh(skinGroup, new THREE.SphereGeometry(snoutRad * 0.58, 12, 10), pal.nose, {
        isAccentDetail: true, roughness: 0.48, pos: nosePos, scale: new THREE.Vector3(0.85, 0.85, 1.05)
      });
    }

    // Mandíbula externa revestida
    if (mandible) {
      addMesh(skinGroup, new THREE.SphereGeometry(headR * 0.55, 12, 10), isSheep ? pal.accent : pal.coat, {
        pos: mandible.clone().add(new THREE.Vector3(0.03, 0, 0)),
        scale: new THREE.Vector3(1.45, 0.62, 0.72),
        rot: new THREE.Euler(0, 0, -0.35)
      });
    }

    // Cavanhaque no caprino
    if (speciesId === 'caprine') {
      const beard = new THREE.ConeGeometry(0.025, 0.09, 8);
      addMesh(skinGroup, beard, pal.accent, {
        isAccentDetail: true,
        pos: nosePos.clone().add(new THREE.Vector3(-0.07, -0.07, 0)),
        rot: new THREE.Euler(0, 0, -0.25)
      });
    }

    // Olhos, Orelhas e Chifres
    for (const s of [-1, 1]) {
      addMesh(skinGroup, new THREE.SphereGeometry(headR * 0.14, 10, 8), pal.eye, {
        isAccentDetail: true, roughness: 0.18,
        pos: headBase.clone().add(new THREE.Vector3(p.skullLen * 0.14, headR * 0.15, s * headR * 0.74))
      });

      // Orelhas por espécie
      const earLen = isHorse ? p.skullLen * 0.34 : isPig ? p.skullLen * 0.36 : p.skullLen * 0.38;
      const earGeom = new THREE.ConeGeometry(earLen * 0.32, earLen, 8);
      const earPos = headBase.clone().add(new THREE.Vector3(-p.skullLen * 0.16, headR * 0.68, s * headR * 0.64));
      let earRot;
      if (isHorse || speciesId === 'feline') {
        earRot = new THREE.Euler(s * 0.25, 0, 0.25);
      } else if (isPig || speciesId === 'canine') {
        earRot = new THREE.Euler(s * 1.15, 0, -0.55);
      } else {
        earRot = new THREE.Euler(s * 1.28, 0, -0.1);
      }
      addMesh(skinGroup, earGeom, isSheep ? pal.accent : pal.coat, { pos: earPos, rot: earRot, scale: new THREE.Vector3(0.85, 1, 0.42) });

      // Chifres revestidos por estojo córneo
      if (isRuminant && p.horns) {
        const len = p.skullLen;
        const hCurve = new THREE.CatmullRomCurve3(
          p.horns === 'bovine'
            ? [new THREE.Vector3(-len * 0.24, len * 0.16, s * len * 0.18), new THREE.Vector3(-len * 0.18, len * 0.28, s * len * 0.46), new THREE.Vector3(-len * 0.03, len * 0.44, s * len * 0.54)]
            : p.horns === 'caprine'
              ? [new THREE.Vector3(-len * 0.22, len * 0.18, s * len * 0.12), new THREE.Vector3(-len * 0.46, len * 0.36, s * len * 0.23), new THREE.Vector3(-len * 0.68, len * 0.32, s * len * 0.34)]
              : [new THREE.Vector3(-len * 0.22, len * 0.16, s * len * 0.16), new THREE.Vector3(-len * 0.36, len * 0.24, s * len * 0.36), new THREE.Vector3(-len * 0.22, len * 0.05, s * len * 0.40)]
        );
        const hTube = new THREE.TubeGeometry(hCurve, 12, len * 0.056, 8, false);
        addMesh(skinGroup, hTube, pal.detail, { isAccentDetail: true, roughness: 0.55, pos: headBase, rot: new THREE.Euler(0, 0, -0.25) });
      }
    }
  }

  // Cauda externa por espécie
  const tailBase = new THREE.Vector3(sacPos.x - 0.10, sacPos.y - 0.05, 0);
  const tCurve = isHorse
    ? new THREE.CatmullRomCurve3([tailBase, tailBase.clone().add(new THREE.Vector3(-0.18, -0.05, 0)), tailBase.clone().add(new THREE.Vector3(-0.26, -0.38, 0)), tailBase.clone().add(new THREE.Vector3(-0.28, -0.68, 0))])
    : speciesId === 'feline' || speciesId === 'canine'
      ? new THREE.CatmullRomCurve3([tailBase, tailBase.clone().add(new THREE.Vector3(-0.18, 0.06, 0)), tailBase.clone().add(new THREE.Vector3(-0.36, 0.18, 0)), tailBase.clone().add(new THREE.Vector3(-0.48, 0.30, 0))])
      : speciesId === 'caprine'
        ? new THREE.CatmullRomCurve3([tailBase, tailBase.clone().add(new THREE.Vector3(-0.08, 0.08, 0)), tailBase.clone().add(new THREE.Vector3(-0.12, 0.18, 0))])
        : isPig
          ? new THREE.CatmullRomCurve3([tailBase, tailBase.clone().add(new THREE.Vector3(-0.09, 0.06, 0.03)), tailBase.clone().add(new THREE.Vector3(-0.14, 0.12, -0.02)), tailBase.clone().add(new THREE.Vector3(-0.09, 0.16, -0.04))])
          : new THREE.CatmullRomCurve3([tailBase, tailBase.clone().add(new THREE.Vector3(-0.09, -0.10, 0)), tailBase.clone().add(new THREE.Vector3(-0.11, -0.34, 0)), tailBase.clone().add(new THREE.Vector3(-0.12, -0.52, 0))]);
  const tailThick = isHorse ? 0.055 : isSheep ? 0.045 : 0.026 * p.heavy;
  addMesh(skinGroup, new THREE.TubeGeometry(tCurve, 14, tailThick, 8, false), isHorse ? pal.accent : pal.coat, { isAccentDetail: isHorse, roughness: 0.85 });

  // Membros torácicos e pélvicos alinhados aos ossos reais
  const isHoofed = isRuminant || isHorse || isPig;
  const isDoubleHoof = isRuminant || isPig;
  const legColor = isSheep ? pal.accent : pal.coat;
  const h = p.heavy;

  for (const side of ['left', 'right']) {
    // Membro torácico
    const sc = posOf(meshMap, `${speciesId}_scapula_${side}`);
    const hu = posOf(meshMap, `${speciesId}_humerus_${side}`);
    const ra = posOf(meshMap, `${speciesId}_radius_${side}`);
    const ca = posOf(meshMap, `${speciesId}_carpus_${side}`);
    const mc = posOf(meshMap, `${speciesId}_metacarpus_${side}`);
    const ftF = isHorse
      ? posOf(meshMap, `${speciesId}_phalanx_distal_manus_${side}`)
      : posOf(meshMap, `${speciesId}_phalanges_${side}`);
    buildLimbTube(
      skinGroup,
      [sc?.clone().add(new THREE.Vector3(0, 0.06, 0)), hu, ra, ca, mc, ftF],
      [0.11 * h, 0.092 * h, 0.064 * h, 0.046 * h, 0.038 * h, 0.038 * h],
      legColor, pal.accent, isHoofed, false, isDoubleHoof
    );

    // Membro pélvico
    const cx = posOf(meshMap, `${speciesId}_coxal_${side}`);
    const fe = posOf(meshMap, `${speciesId}_femur_${side}`);
    const ti = posOf(meshMap, `${speciesId}_tibia_${side}`);
    const ta = posOf(meshMap, `${speciesId}_tarsus_${side}`);
    const mt = posOf(meshMap, `${speciesId}_metatarsus_${side}`);
    const ftH = isHorse
      ? posOf(meshMap, `${speciesId}_phalanx_distal_pes_${side}`)
      : posOf(meshMap, `${speciesId}_phalanges_pes_${side}`);
    buildLimbTube(
      skinGroup,
      [cx?.clone().add(new THREE.Vector3(0, 0.04, 0)), fe, ti, ta, mt, ftH],
      [0.135 * h, 0.115 * h, 0.070 * h, 0.048 * h, 0.040 * h, 0.040 * h],
      legColor, pal.accent, isHoofed, false, isDoubleHoof
    );
  }

  return skinGroup;
}
