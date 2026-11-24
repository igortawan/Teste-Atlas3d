/**
 * Módulo de Anatomia Comparada (#/compare) com dois modelos 3D lado a lado
 * usando um ÚNICO THREE.WebGLRenderer (setViewport + setScissor) para máxima leveza e zero risco de
 * limite de contextos WebGL, preservando rigor científico sem falsas equivalências.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { icon } from './icons.js';
import { state } from './state.js';
import {
  getAllSpeciesSync, getSpeciesMetaSync, loadSpeciesOsteology,
  findHomologueInSpecies
} from './anatomyDatabase.js';
import { loadSpeciesModel, disposeObject3D } from './modelLoader.js';

let activeCompareCtx = null;

export function destroyComparisonView() {
  if (activeCompareCtx) {
    activeCompareCtx.dispose();
    activeCompareCtx = null;
  }
}

export async function renderComparisonView(container, params = {}) {
  destroyComparisonView();
  const speciesList = getAllSpeciesSync();
  const spA = params.a || 'bovine';
  const spB = params.b || 'equine';
  let scaleMode = 'normalized'; // 'normalized' | 'relative'
  let syncCam = true;

  const [dataA, dataB] = await Promise.all([loadSpeciesOsteology(spA), loadSpeciesOsteology(spB)]);
  const metaA = getSpeciesMetaSync(spA);
  const metaB = getSpeciesMetaSync(spB);

  container.innerHTML = `
    <div class="page-container">
      <div class="section-header">
        <div>
          <h1 class="section-title">Anatomia Comparada — Osteologia Lado a Lado</h1>
          <p class="section-subtitle">Selecione duas espécies e clique em qualquer osso para visualizar o correspondente anatômico (quando houver equivalência real).</p>
        </div>
        <div class="chip-row">
          <button class="chip" data-preset="bovine|equine">Bovino × Equino</button>
          <button class="chip" data-preset="ovine|caprine">Ovino × Caprino</button>
          <button class="chip" data-preset="canine|feline">Canino × Felino</button>
          <button class="chip" data-preset="swine|bovine">Suíno × Bovino</button>
          <button class="chip" data-preset="avian|bovine">Galinha × Bovino</button>
        </div>
      </div>

      <div class="card panel-box" style="margin-bottom:16px;">
        <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;">
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <select class="select" id="cmp-sp-a" style="width:auto;">
              ${speciesList.map((s) => `<option value="${s.id}" ${s.id === spA ? 'selected' : ''}>A: ${s.name}</option>`).join('')}
            </select>
            <span class="muted">×</span>
            <select class="select" id="cmp-sp-b" style="width:auto;">
              ${speciesList.map((s) => `<option value="${s.id}" ${s.id === spB ? 'selected' : ''}>B: ${s.name}</option>`).join('')}
            </select>
          </div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <label class="small"><input type="checkbox" id="cmp-sync" checked /> Sincronizar câmeras</label>
            <select class="select small" id="cmp-scale" style="width:auto;">
              <option value="normalized">Escala normalizada didática (não reflete tamanho real)</option>
              <option value="relative">Escala relativa aproximada (baseada na altura de referência)</option>
            </select>
          </div>
        </div>
        <div class="small muted" id="cmp-scale-note" style="margin-top:8px;">
          ${icon('info', 13)} Escala normalizada ativa: ambas as espécies são ajustadas ao mesmo enquadramento para facilitar o estudo morfológico. Modelos demonstrativos ilustrativos.
        </div>
      </div>

      <div class="compare-stage" id="cmp-stage">
        <div class="compare-label-left">${metaA.name} (${dataA.osteology.count} ossos)</div>
        <div class="compare-label-right">${metaB.name} (${dataB.osteology.count} ossos)</div>
        <div class="compare-divider"></div>
      </div>

      <div class="card panel-box" id="cmp-matrix">
        <h2 class="panel-box-title">${icon('git-compare', 17)} Matriz comparativa</h2>
        <p class="small muted" id="cmp-hint">Clique em um osso de qualquer um dos modelos 3D acima para comparar morfologia, articulações, adaptações e equivalência anatômica.</p>
        <div id="cmp-table-wrap"></div>
      </div>
    </div>
  `;

  // Configuração do canvas único split-viewport (horizontal em telas largas, vertical empilhado em retrato mobile)
  const stageEl = container.querySelector('#cmp-stage');
  const w = Math.max(200, stageEl.clientWidth);
  const h = Math.max(240, stageEl.clientHeight);
  const isVerticalSplit = () => renderer.domElement.clientWidth < 640;
  stageEl.classList.toggle('vertical-split', w < 640);
  const renderer = new THREE.WebGLRenderer({ antialias: state.persisted.settings.quality !== 'low', alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
  renderer.setScissorTest(true);
  stageEl.appendChild(renderer.domElement);

  const initAspect = w < 640 ? w / Math.max(120, h * 0.5) : (w * 0.5) / h;

  const buildHalfScene = async (spId, structures) => {
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.9));
    const dl = new THREE.DirectionalLight(0xffffff, 1.4);
    dl.position.set(3, 5, 3);
    scene.add(dl);
    const grid = new THREE.GridHelper(3.8, 16, 0x14b8a6, 0x334155);
    grid.material.transparent = true;
    grid.material.opacity = 0.25;
    scene.add(grid);

    const cam = new THREE.PerspectiveCamera(42, initAspect, 0.05, 30);
    cam.position.set(2.45, 1.48, 3.05);
    const loaded = await loadSpeciesModel(spId, structures);
    scene.add(loaded.root);
    return { scene, cam, root: loaded.root, meshMap: loaded.meshMap, selectedId: null };
  };

  const [halfA, halfB] = await Promise.all([
    buildHalfScene(spA, dataA.osteology.structures),
    buildHalfScene(spB, dataB.osteology.structures)
  ]);

  // OrbitControls conectado ao DOM; sincroniza ou controla o lado sob o ponteiro
  const ctrlA = new OrbitControls(halfA.cam, renderer.domElement);
  ctrlA.target.set(0, 0.85, 0);
  ctrlA.enableDamping = true;
  const ctrlB = new OrbitControls(halfB.cam, renderer.domElement);
  ctrlB.target.set(0, 0.85, 0);
  ctrlB.enableDamping = true;
  ctrlB.enabled = false;

  const raycaster = new THREE.Raycaster();
  let downPos = { x: 0, y: 0 };
  let activeSide = 'A';

  const onDown = (e) => {
    downPos = { x: e.clientX, y: e.clientY };
    const rect = renderer.domElement.getBoundingClientRect();
    if (isVerticalSplit()) {
      activeSide = (e.clientY - rect.top) < rect.height * 0.5 ? 'A' : 'B';
    } else {
      activeSide = (e.clientX - rect.left) < rect.width * 0.5 ? 'A' : 'B';
    }
    if (!syncCam) {
      ctrlA.enabled = activeSide === 'A';
      ctrlB.enabled = activeSide === 'B';
    } else {
      ctrlA.enabled = true;
      ctrlB.enabled = false;
    }
  };

  const highlightMesh = (half, boneId) => {
    half.selectedId = boneId;
    for (const [id, mesh] of half.meshMap.entries()) {
      if (id === boneId) {
        mesh.material.color.setHex(0x34d399);
        mesh.material.emissive.setHex(0x0b5340);
      } else {
        mesh.material.color.setHex(0xe7dfd0);
        mesh.material.emissive.setHex(0x000000);
      }
    }
  };

  const renderComparisonTable = (boneA, boneB, homNote) => {
    const wrap = container.querySelector('#cmp-table-wrap');
    container.querySelector('#cmp-hint').classList.add('hidden');
    wrap.innerHTML = `
      ${homNote ? `<div class="clinical-warning" style="margin-bottom:12px;"><strong>Relação anatômica:</strong> ${homNote}</div>` : ''}
      <table class="compare-table">
        <thead>
          <tr>
            <th>Critério</th>
            <th>${metaA.name}: ${boneA ? boneA.name : 'Sem correspondente direto'}</th>
            <th>${metaB.name}: ${boneB ? boneB.name : 'Sem correspondente direto'}</th>
          </tr>
        </thead>
        <tbody>
          <tr><th>Nome latino</th><td data-label="${metaA.name}"><i>${boneA?.latinName || '—'}</i></td><td data-label="${metaB.name}"><i>${boneB?.latinName || '—'}</i></td></tr>
          <tr><th>Morfologia</th><td data-label="${metaA.name}">${boneA?.morphology || '—'}</td><td data-label="${metaB.name}">${boneB?.morphology || '—'}</td></tr>
          <tr><th>Função</th><td data-label="${metaA.name}">${boneA?.function || '—'}</td><td data-label="${metaB.name}">${boneB?.function || '—'}</td></tr>
          <tr><th>Adaptação locomotora / espécie</th><td data-label="${metaA.name}">${metaA.locomotion}</td><td data-label="${metaB.name}">${metaB.locomotion}</td></tr>
          <tr><th>Articulações</th><td data-label="${metaA.name}">${boneA?.articulations?.map((a) => a.targetName).join(', ') || '—'}</td><td data-label="${metaB.name}">${boneB?.articulations?.map((a) => a.targetName).join(', ') || '—'}</td></tr>
          <tr><th>Importância clínica</th><td data-label="${metaA.name}">${boneA?.clinicalImportance || '—'}</td><td data-label="${metaB.name}">${boneB?.clinicalImportance || '—'}</td></tr>
        </tbody>
      </table>
    `;
  };

  const selectFromSide = (side, boneId) => {
    if (side === 'A') {
      const boneA = dataA.osteology.structures.find((b) => b.id === boneId);
      if (!boneA) return;
      const hom = findHomologueInSpecies(boneA, spB);
      highlightMesh(halfA, boneA.id);
      highlightMesh(halfB, hom.structure?.id || null);
      renderComparisonTable(boneA, hom.structure, hom.note);
    } else {
      const boneB = dataB.osteology.structures.find((b) => b.id === boneId);
      if (!boneB) return;
      const hom = findHomologueInSpecies(boneB, spA);
      highlightMesh(halfB, boneB.id);
      highlightMesh(halfA, hom.structure?.id || null);
      renderComparisonTable(hom.structure, boneB, hom.note);
    }
  };

  const onUp = (e) => {
    if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 6) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const lx = e.clientX - rect.left;
    const ly = e.clientY - rect.top;
    let isFirst;
    let ndc;
    if (isVerticalSplit()) {
      const halfH = rect.height * 0.5;
      isFirst = ly < halfH;
      const localY = isFirst ? ly : ly - halfH;
      ndc = new THREE.Vector2((lx / rect.width) * 2 - 1, -(localY / halfH) * 2 + 1);
    } else {
      const halfW = rect.width * 0.5;
      isFirst = lx < halfW;
      const localX = isFirst ? lx : lx - halfW;
      ndc = new THREE.Vector2((localX / halfW) * 2 - 1, -(ly / rect.height) * 2 + 1);
    }
    const half = isFirst ? halfA : halfB;
    raycaster.setFromCamera(ndc, half.cam);
    const hits = raycaster.intersectObjects([...half.meshMap.values()], false);
    if (hits[0]) {
      selectFromSide(isFirst ? 'A' : 'B', hits[0].object.userData.structureId);
    }
  };

  renderer.domElement.addEventListener('pointerdown', onDown);
  renderer.domElement.addEventListener('pointerup', onUp);

  if (params.bone) {
    if (dataA.osteology.structures.some((b) => b.id === params.bone)) selectFromSide('A', params.bone);
    else if (dataB.osteology.structures.some((b) => b.id === params.bone)) selectFromSide('B', params.bone);
  } else {
    // Pré-seleciona escápula esquerda ou úmero para demonstrar comparação imediata
    const defBone = dataA.osteology.structures.find((b) => b.id.includes('scapula_left'));
    if (defBone) selectFromSide('A', defBone.id);
  }

  let raf = null;
  let disposed = false;
  const updateCompareLayout = () => {
    if (disposed) return;
    const nw = Math.max(200, stageEl.clientWidth);
    const vert = nw < 640;
    stageEl.classList.toggle('vertical-split', vert);
    const nh = Math.max(240, stageEl.clientHeight);
    renderer.setSize(nw, nh);
    const aspect = vert ? nw / Math.max(120, nh * 0.5) : (nw * 0.5) / nh;
    halfA.cam.aspect = aspect;
    halfA.cam.updateProjectionMatrix();
    halfB.cam.aspect = aspect;
    halfB.cam.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(updateCompareLayout);
  ro.observe(stageEl);

  const tick = () => {
    if (disposed) return;
    raf = requestAnimationFrame(tick);
    ctrlA.update();
    if (syncCam) {
      halfB.cam.position.copy(halfA.cam.position);
      halfB.cam.quaternion.copy(halfA.cam.quaternion);
      ctrlB.target.copy(ctrlA.target);
    } else {
      ctrlB.update();
    }
    const cw = renderer.domElement.clientWidth;
    const ch = renderer.domElement.clientHeight;
    if (isVerticalSplit()) {
      const halfH = Math.floor(ch * 0.5);
      // No WebGL y=0 é a borda inferior: metade superior = Espécie A, metade inferior = Espécie B
      renderer.setViewport(0, halfH, cw, ch - halfH);
      renderer.setScissor(0, halfH, cw, ch - halfH);
      renderer.render(halfA.scene, halfA.cam);

      renderer.setViewport(0, 0, cw, halfH);
      renderer.setScissor(0, 0, cw, halfH);
      renderer.render(halfB.scene, halfB.cam);
    } else {
      const halfW = Math.floor(cw * 0.5);
      renderer.setViewport(0, 0, halfW, ch);
      renderer.setScissor(0, 0, halfW, ch);
      renderer.render(halfA.scene, halfA.cam);

      renderer.setViewport(halfW, 0, cw - halfW, ch);
      renderer.setScissor(halfW, 0, cw - halfW, ch);
      renderer.render(halfB.scene, halfB.cam);
    }
  };
  tick();

  activeCompareCtx = {
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      ctrlA.dispose();
      ctrlB.dispose();
      disposeObject3D(halfA.root);
      disposeObject3D(halfB.root);
      renderer.dispose();
      renderer.domElement.remove();
    }
  };

  // Controles UI
  container.querySelector('#cmp-sp-a')?.addEventListener('change', (e) => renderComparisonView(container, { a: e.target.value, b: spB }));
  container.querySelector('#cmp-sp-b')?.addEventListener('change', (e) => renderComparisonView(container, { a: spA, b: e.target.value }));
  container.querySelector('#cmp-sync')?.addEventListener('change', (e) => { syncCam = e.target.checked; });
  container.querySelector('#cmp-scale')?.addEventListener('change', (e) => {
    scaleMode = e.target.value;
    const maxH = Math.max(metaA.withersHeightM, metaB.withersHeightM);
    if (scaleMode === 'relative') {
      halfA.root.scale.setScalar(metaA.withersHeightM / maxH);
      halfB.root.scale.setScalar(metaB.withersHeightM / maxH);
      container.querySelector('#cmp-scale-note').innerHTML = `${icon('ruler', 13)} Escala relativa aproximada baseada na altura média de referência (${metaA.name}: ${metaA.withersHeightM} m vs ${metaB.name}: ${metaB.withersHeightM} m).`;
    } else {
      halfA.root.scale.setScalar(1);
      halfB.root.scale.setScalar(1);
      container.querySelector('#cmp-scale-note').innerHTML = `${icon('info', 13)} Escala normalizada ativa: ambas as espécies são ajustadas ao mesmo enquadramento para facilitar o estudo morfológico.`;
    }
  });
  container.querySelectorAll('[data-preset]').forEach((b) => {
    b.addEventListener('click', () => {
      const [a, br] = b.dataset.preset.split('|');
      renderComparisonView(container, { a, b: br });
    });
  });
}
