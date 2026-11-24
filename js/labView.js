/**
 * Tela principal do Laboratório Virtual 3D (#/lab):
 * Integra Viewer3D, Árvore Anatômica, Ficha Completa, Toolbar Flutuante, Vistas de Câmera,
 * Anatomia Explodida (global e por região), Marcos Anatômicos 3D e Inspeção Individual.
 */
import { icon } from './icons.js';
import { state, setCurrentSpecies, setSelectedBone } from './state.js';
import {
  getAllSpeciesSync, getSpeciesMetaSync, loadSpeciesOsteology,
  getLoadedOsteologySync, getLoadedRegionsSync, getStructureByIdSync
} from './anatomyDatabase.js';
import { Viewer3D } from './viewer3d.js';
import { AnatomyTreeUI } from './anatomyTree.js';
import { AnatomyPanelUI } from './anatomyPanel.js';
import { recordStructureVisit, getSpeciesProgress } from './progressManager.js';
import { navigate } from './router.js';
import { showToast } from './navigation.js';

let activeViewer = null;

export function destroyLabView() {
  if (activeViewer) {
    activeViewer.dispose();
    activeViewer = null;
  }
}

export async function renderLabView(container, params = {}) {
  destroyLabView();
  const speciesId = params.species || state.currentSpecies || 'bovine';
  if (state.currentSpecies !== speciesId) setCurrentSpecies(speciesId);

  const speciesList = getAllSpeciesSync();
  const spMeta = getSpeciesMetaSync(speciesId) || speciesList[0];

  container.innerHTML = `
    <div class="lab-shell" id="lab-shell">
      <div class="lab-topbar">
        <div class="lab-topbar-group">
          <label class="small muted" for="lab-species-select">Espécie:</label>
          <select class="select" id="lab-species-select" style="width:auto;padding:5px 10px;font-size:0.84rem;">
            ${speciesList.map((s) => `<option value="${s.id}" ${s.id === speciesId ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select>
          <span class="badge badge-emerald">Osteologia</span>
          <span class="badge" id="lab-region-badge">Esqueleto completo</span>
        </div>

        <div class="lab-topbar-group">
          <button class="btn btn-sm ${state.noLabelsMode ? 'btn-primary' : ''}" id="lab-nolabels-btn" title="Ocultar todos os nomes para simular avaliação prática">
            ${icon(state.noLabelsMode ? 'eye-off' : 'eye', 14)} ${state.noLabelsMode ? 'Sem etiquetas (ativo)' : 'Modo sem etiquetas'}
          </button>
          <label class="btn btn-sm" style="cursor:pointer;" title="Carregar modelo 3D segmentado (.glb, .gltf ou .obj) do seu computador">
            ${icon('upload', 14)} Importar GLB/GLTF
            <input type="file" id="lab-upload-glb" accept=".glb,.gltf,.obj" class="hidden" />
          </label>
          <button class="btn btn-sm" id="lab-reset-all" title="Restaurar vista, explosão e visibilidade">
            ${icon('rotate-ccw', 14)} Restaurar tudo
          </button>
        </div>
      </div>

      <div class="lab-workspace">
        <div class="lab-drawer-backdrop hidden" id="lab-drawer-backdrop"></div>
        <aside class="lab-left-panel" id="lab-left-panel" aria-label="Árvore anatômica"></aside>

        <section class="lab-viewport-wrap" id="lab-viewport-wrap" aria-label="Visualizador 3D anatômico">
          <button class="btn btn-sm reopen-left-btn hidden" id="reopen-left-btn">${icon('panel-left', 14)} Árvore</button>
          <button class="btn btn-sm reopen-right-btn hidden" id="reopen-right-btn">${icon('panel-right', 14)} Ficha</button>

          <div class="demo-banner" id="lab-demo-banner">
            ${icon('triangle-alert', 14)}
            <span id="lab-demo-text">MODO DEMONSTRATIVO ILUSTRATIVO — Geometria esquemática (suporte GLB/GLTF ativo)</span>
          </div>

          <div class="floating-toolbar" role="toolbar" aria-label="Ferramentas 3D">
            <button class="tool-btn" id="tl-reset-cam" title="Restaurar posição original (R)">${icon('rotate-ccw', 16)}</button>
            <button class="tool-btn" id="tl-center-cam" title="Centralizar câmera">${icon('crosshair', 16)}</button>
            <button class="tool-btn" id="tl-fullscreen" title="Tela cheia">${icon('maximize', 16)}</button>
            <div class="tool-sep"></div>
            <button class="tool-btn" id="tl-isolate" title="Isolar osso selecionado">${icon('focus', 16)}</button>
            <button class="tool-btn" id="tl-hide" title="Ocultar osso selecionado">${icon('eye-off', 16)}</button>
            <button class="tool-btn" id="tl-show-all" title="Mostrar todas as estruturas">${icon('eye', 16)}</button>
            <button class="tool-btn" id="tl-xray" title="Modo transparência / Raio-X">${icon('layers', 16)}</button>
            <div class="tool-sep"></div>
            <button class="tool-btn active" id="tl-landmarks" title="Ligar/desligar marcos anatômicos 3D">${icon('map-pin', 16)}</button>
            <button class="tool-btn" id="tl-inspect" title="Rotação / inspeção individual do osso">${icon('rotate-3d', 16)}</button>
            <button class="tool-btn" id="tl-explode-toggle" title="Abrir/ocultar painel de Anatomia Explodida (E)">${icon('expand', 16)}</button>
          </div>

          <div class="camera-views-bar" role="group" aria-label="Ângulos anatômicos de câmera">
            <button class="view-pill" data-cam="iso">3D</button>
            <button class="view-pill" data-cam="frontal">Frontal</button>
            <button class="view-pill" data-cam="cranial">Cranial</button>
            <button class="view-pill" data-cam="caudal">Caudal</button>
            <button class="view-pill" data-cam="left">Lat. Esq</button>
            <button class="view-pill" data-cam="right">Lat. Dir</button>
            <button class="view-pill" data-cam="dorsal">Dorsal</button>
            <button class="view-pill" data-cam="ventral">Ventral</button>
          </div>

          <div class="viewport-canvas-host" id="lab-canvas-host"></div>

          <div class="viewer-tooltip hidden" id="lab-tooltip"></div>
          <div class="landmark-popover hidden" id="lab-landmark-popover"></div>

          <div class="loading-overlay" id="lab-loading">
            ${icon('box', 28)}
            <strong>Montando laboratório 3D de ${spMeta?.name || speciesId}...</strong>
            <span class="small muted" id="lab-loading-pct">Preparando ossos e malhas segmentadas</span>
          </div>

          <!-- Painel flutuante de inspeção individual do osso -->
          <div class="exploded-dock hidden" id="lab-inspect-dock" style="bottom:86px;width:min(480px,calc(100% - 24px));">
            <div class="exploded-row" style="justify-content:space-between;">
              <strong class="small">${icon('rotate-3d', 14)} Inspeção individual da peça selecionada</strong>
              <div style="display:flex;gap:6px;">
                <button class="btn btn-sm" id="insp-reset-btn">Restaurar peça</button>
                <button class="btn btn-ghost btn-sm" id="insp-close-btn">${icon('x', 14)}</button>
              </div>
            </div>
            <div class="exploded-row">
              <span class="small muted" style="width:62px;">Rot. Y</span>
              <input type="range" class="exploded-slider" id="insp-rot-y" min="-180" max="180" value="0" />
              <span class="small muted" style="width:62px;">Afastar</span>
              <input type="range" class="exploded-slider" id="insp-lift" min="-0.3" max="0.6" step="0.02" value="0" />
            </div>
          </div>

          <!-- Dock de Anatomia Explodida -->
          <button class="btn btn-sm btn-primary mobile-explode-open hidden" id="mobile-explode-open">
            ${icon('expand', 14)} Explodir (<span id="mob-ex-pct">0%</span>)
          </button>
          <div class="exploded-dock" id="lab-exploded-dock">
            <div class="exploded-row">
              <strong class="small" style="display:flex;align-items:center;gap:6px;">${icon('expand', 14)} Anatomia Explodida</strong>
              <select class="select small" id="ex-scope" style="width:auto;padding:4px 8px;">
                <option value="all">Esqueleto completo</option>
                <option value="skull">Crânio</option>
                <option value="vertebral_column">Coluna vertebral</option>
                <option value="thoracic_cage">Caixa torácica</option>
                <option value="thoracic_limb">Membro torácico</option>
                <option value="pelvic_limb">Membro pélvico</option>
                <option value="pelvis">Pelve</option>
                <option value="selected">Apenas região/peça selecionada</option>
              </select>
              <div class="chip-row" style="margin-left:auto;">
                ${[0, 25, 50, 75, 100].map((v) => `<button class="chip" data-ex-preset="${v}">${v}%</button>`).join('')}
                <button class="btn btn-ghost btn-sm" id="ex-close-btn" title="Minimizar controle de explosão" aria-label="Minimizar Anatomia Explodida">${icon('x', 14)}</button>
              </div>
            </div>
            <div class="exploded-row">
              <input type="range" class="exploded-slider" id="ex-slider" min="0" max="100" value="0" aria-label="Porcentagem da vista explodida" />
              <span class="mono small" id="ex-value" style="min-width:38px;">0%</span>
              <button class="btn btn-sm btn-primary" id="ex-anim-btn">${icon('play', 13)} Animar</button>
              <button class="btn btn-sm" id="ex-reset-btn">${icon('undo-2', 13)} Posição anatômica</button>
            </div>
          </div>
        </section>

        <aside class="lab-right-panel" id="lab-right-panel" aria-label="Ficha anatômica"></aside>
      </div>

      <div class="lab-statusbar">
        <div>
          <span id="status-species-info"><strong>${spMeta?.name || ''}</strong> · ${spMeta?.vertebralFormula || ''}</span>
        </div>
        <div id="status-progress-info">Carregando progresso...</div>
        <div class="small muted status-controls-hint">Controles: Arrastar = Girar · Scroll = Zoom · Botão direito = Mover · Clique = Selecionar</div>
      </div>
    </div>
  `;

  // Carrega dados da espécie e inicia o motor 3D
  const { osteology, regions } = await loadSpeciesOsteology(speciesId);
  const leftEl = container.querySelector('#lab-left-panel');
  const rightEl = container.querySelector('#lab-right-panel');
  const backdropEl = container.querySelector('#lab-drawer-backdrop');
  const isCompactLab = () => window.innerWidth <= 840 || (window.innerWidth <= 960 && window.innerHeight <= 520);
  const syncBackdrop = () => {
    const openLeft = !leftEl.classList.contains('collapsed');
    backdropEl.classList.toggle('hidden', !(isCompactLab() && openLeft));
  };

  if (isCompactLab()) {
    leftEl.classList.add('collapsed');
    container.querySelector('#reopen-left-btn').classList.remove('hidden');
    if (!params.bone) {
      rightEl.classList.add('collapsed');
      container.querySelector('#reopen-right-btn').classList.remove('hidden');
    }
  }
  const canvasHost = container.querySelector('#lab-canvas-host');
  const loadingEl = container.querySelector('#lab-loading');
  const tooltipEl = container.querySelector('#lab-tooltip');
  const lmPopoverEl = container.querySelector('#lab-landmark-popover');

  const viewer = new Viewer3D(canvasHost, {
    quality: state.persisted.settings.quality,
    onBoneClicked: (id) => selectStructureById(id, { focusCamera: state.persisted.settings.autoFocusSelection }),
    onBoneHover: (id, x, y) => {
      if (!id || state.noLabelsMode) { tooltipEl.classList.add('hidden'); return; }
      const b = getStructureByIdSync(speciesId, id);
      const label = b ? `${b.name} (${b.latinName})` : id;
      const rect = canvasHost.getBoundingClientRect();
      tooltipEl.textContent = label;
      tooltipEl.style.left = `${Math.min(rect.width - 220, Math.max(8, x - rect.left + 12))}px`;
      tooltipEl.style.top = `${Math.max(8, y - rect.top - 28)}px`;
      tooltipEl.classList.remove('hidden');
    },
    onLandmarkClicked: (lm) => showLandmarkPopover(lmPopoverEl, lm)
  });
  activeViewer = viewer;
  viewer.setGridVisible(state.persisted.settings.showGrid);

  const treeUI = new AnatomyTreeUI(leftEl, {
    onCollapse: () => {
      leftEl.classList.add('collapsed');
      container.querySelector('#reopen-left-btn').classList.remove('hidden');
      syncBackdrop();
      viewer.resize();
    },
    onSelectBone: (id) => selectStructureById(id, { focusCamera: true }),
    onToggleRegionVisibility: (ids, hide) => {
      ids.forEach((id) => viewer.selection.setHidden(id, hide));
      state.hiddenBoneIds = [...viewer.selection.hiddenIds];
      viewer.needsRender = true;
    }
  });
  treeUI.setData(regions, osteology.structures);

  const panelUI = new AnatomyPanelUI(rightEl, {
    onCollapse: () => {
      rightEl.classList.add('collapsed');
      rightEl.classList.remove('expanded-mobile');
      container.querySelector('#reopen-right-btn').classList.remove('hidden');
      viewer.resize();
    },
    onToggleNoLabels: () => toggleNoLabels(),
    onStateChanged: () => {
      treeUI.render();
      updateStatusProgress();
    },
    onToggleIsolate: (id) => toggleIsolate(id),
    onCompare: (bone) => navigate('/compare', { a: bone.species, b: bone.species === 'equine' ? 'bovine' : 'equine', bone: bone.id }),
    onFocusLandmark: (lm) => {
      viewer.landmarks.setActiveLandmark(lm.id);
      viewer.needsRender = true;
      showLandmarkPopover(lmPopoverEl, lm);
    },
    onJumpBone: (targetId) => selectStructureById(targetId, { focusCamera: true }),
    onToast: showToast
  });
  panelUI.render();

  function updateStatusProgress() {
    const prog = getSpeciesProgress(speciesId);
    const el = container.querySelector('#status-progress-info');
    if (el) el.innerHTML = `Progresso em ${spMeta?.name}: <strong>${prog.visited}/${prog.total}</strong> estudadas (${prog.percent}%) · ${prog.mastered} dominadas`;
  }

  function selectStructureById(id, { focusCamera = true } = {}) {
    const bone = getStructureByIdSync(speciesId, id);
    if (!bone) {
      showToast(`Malha "${id}" sem ficha vinculada neste catálogo.`, 'warning');
      return;
    }
    setSelectedBone(bone.id);
    recordStructureVisit(bone);
    viewer.selectBone(bone, { focusCamera });
    treeUI.expandForBone(bone);
    panelUI.setBone(bone);
    if (isCompactLab()) {
      leftEl.classList.add('collapsed');
      container.querySelector('#reopen-left-btn').classList.remove('hidden');
      syncBackdrop();
    }
    rightEl.classList.remove('collapsed');
    container.querySelector('#reopen-right-btn').classList.add('hidden');
    lmPopoverEl.classList.add('hidden');

    const regNames = { skull: 'Crânio', vertebral_column: 'Coluna vertebral', thoracic_cage: 'Caixa torácica', thoracic_limb: 'Membro torácico', pelvic_limb: 'Membro pélvico' };
    container.querySelector('#lab-region-badge').textContent = regNames[bone.region] || bone.region;
    updateStatusProgress();
  }

  function toggleIsolate(id) {
    const target = state.isolatedBoneId === id ? null : id;
    state.isolatedBoneId = target;
    viewer.selection.setIsolated(target);
    viewer.needsRender = true;
    container.querySelector('#tl-isolate').classList.toggle('active', !!target);
    panelUI.render();
  }

  function toggleNoLabels() {
    state.noLabelsMode = !state.noLabelsMode;
    const btn = container.querySelector('#lab-nolabels-btn');
    btn.classList.toggle('btn-primary', state.noLabelsMode);
    btn.innerHTML = `${icon(state.noLabelsMode ? 'eye-off' : 'eye', 14)} ${state.noLabelsMode ? 'Sem etiquetas (ativo)' : 'Modo sem etiquetas'}`;
    tooltipEl.classList.add('hidden');
    treeUI.render();
    panelUI.render();
  }

  // Carrega o modelo 3D (GLB/OBJ do manifesto ou demonstrativo)
  try {
    const loaded = await viewer.loadSpecies(speciesId, osteology.structures, {
      onProgress: (ev) => {
        if (ev?.total) {
          const pct = Math.round((ev.loaded / ev.total) * 100);
          container.querySelector('#lab-loading-pct').textContent = `Carregando modelo: ${pct}%`;
        }
      }
    });
    const banner = container.querySelector('#lab-demo-banner');
    if (loaded.isDemoModel) {
      banner.classList.remove('hidden');
    } else {
      banner.innerHTML = `${icon('shield-check', 14)} <span>Modelo científico segmentado carregado</span>`;
    }
  } catch (err) {
    showToast('Erro ao inicializar modelo 3D: ' + err.message, 'error');
  } finally {
    loadingEl.classList.add('hidden');
  }

  updateStatusProgress();
  if (params.bone && getStructureByIdSync(speciesId, params.bone)) {
    selectStructureById(params.bone, { focusCamera: true });
  }

  // Eventos da barra superior, painéis e ferramentas
  container.querySelector('#lab-species-select')?.addEventListener('change', (e) => {
    navigate('/lab', { species: e.target.value });
  });
  container.querySelector('#lab-nolabels-btn')?.addEventListener('click', toggleNoLabels);
  container.querySelector('#reopen-left-btn')?.addEventListener('click', () => {
    leftEl.classList.remove('collapsed');
    container.querySelector('#reopen-left-btn').classList.add('hidden');
    if (isCompactLab()) {
      rightEl.classList.add('collapsed');
      container.querySelector('#reopen-right-btn').classList.remove('hidden');
    }
    syncBackdrop();
    viewer.resize();
  });
  container.querySelector('#reopen-right-btn')?.addEventListener('click', () => {
    rightEl.classList.remove('collapsed');
    container.querySelector('#reopen-right-btn').classList.add('hidden');
    if (isCompactLab()) {
      leftEl.classList.add('collapsed');
      container.querySelector('#reopen-left-btn').classList.remove('hidden');
    }
    syncBackdrop();
    viewer.resize();
  });
  backdropEl?.addEventListener('click', () => {
    leftEl.classList.add('collapsed');
    container.querySelector('#reopen-left-btn').classList.remove('hidden');
    syncBackdrop();
  });
  container.querySelector('#lab-demo-banner')?.addEventListener('click', () => {
    showToast('Geometria demonstrativa proporcional à espécie. Use "Importar GLB/GLTF" para carregar malhas científicas.', 'info');
  });

  container.querySelector('#lab-upload-glb')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadingEl.classList.remove('hidden');
    try {
      await viewer.loadCustomFile(file, osteology.structures);
      container.querySelector('#lab-demo-text').textContent = `Modelo local carregado: ${file.name} (${viewer.meshMap.size} malha(s) detectada(s))`;
      showToast(`Modelo "${file.name}" carregado no visualizador!`, 'success');
    } catch (err) {
      showToast('Falha ao importar modelo 3D: ' + err.message, 'error');
    } finally {
      loadingEl.classList.add('hidden');
    }
  });

  // Vistas de câmera
  container.querySelectorAll('[data-cam]').forEach((btn) => {
    btn.addEventListener('click', () => viewer.cameraCtrl.setStandardView(btn.dataset.cam));
  });
  container.querySelector('#tl-reset-cam')?.addEventListener('click', () => viewer.cameraCtrl.reset());
  container.querySelector('#tl-center-cam')?.addEventListener('click', () => {
    if (state.selectedBoneId && viewer.meshMap.has(state.selectedBoneId)) {
      viewer.cameraCtrl.focusOnObject(viewer.meshMap.get(state.selectedBoneId));
    } else {
      viewer.cameraCtrl.reset();
    }
  });
  container.querySelector('#tl-fullscreen')?.addEventListener('click', () => {
    const wrap = container.querySelector('#lab-viewport-wrap');
    if (!document.fullscreenElement) wrap.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  container.querySelector('#tl-isolate')?.addEventListener('click', () => {
    if (!state.selectedBoneId) return showToast('Selecione um osso primeiro para isolar.', 'info');
    toggleIsolate(state.selectedBoneId);
  });
  container.querySelector('#tl-hide')?.addEventListener('click', () => {
    if (!state.selectedBoneId) return showToast('Selecione um osso para ocultar.', 'info');
    viewer.selection.setHidden(state.selectedBoneId, true);
    state.hiddenBoneIds = [...viewer.selection.hiddenIds];
    viewer.needsRender = true;
    treeUI.render();
  });
  container.querySelector('#tl-show-all')?.addEventListener('click', () => {
    state.isolatedBoneId = null;
    state.hiddenBoneIds = [];
    viewer.selection.showAll();
    container.querySelector('#tl-isolate').classList.remove('active');
    viewer.needsRender = true;
    treeUI.render();
    panelUI.render();
  });
  container.querySelector('#tl-xray')?.addEventListener('click', (e) => {
    state.xrayMode = !state.xrayMode;
    viewer.selection.setXray(state.xrayMode);
    viewer.needsRender = true;
    e.currentTarget.classList.toggle('active', state.xrayMode);
  });
  container.querySelector('#tl-landmarks')?.addEventListener('click', (e) => {
    const next = !viewer.landmarks.enabled;
    viewer.landmarks.setEnabled(next);
    viewer.needsRender = true;
    e.currentTarget.classList.toggle('active', next);
    if (!next) lmPopoverEl.classList.add('hidden');
  });

  // Inspeção individual da peça
  const inspectDock = container.querySelector('#lab-inspect-dock');
  const rotYInput = container.querySelector('#insp-rot-y');
  const liftInput = container.querySelector('#insp-lift');
  const applyInspect = () => {
    if (!state.selectedBoneId) return;
    viewer.setIndividualTransform(state.selectedBoneId, {
      rotYDeg: Number(rotYInput.value),
      lift: Number(liftInput.value)
    });
  };
  container.querySelector('#tl-inspect')?.addEventListener('click', (e) => {
    if (!state.selectedBoneId) return showToast('Selecione um osso para rotacionar individualmente.', 'info');
    inspectDock.classList.toggle('hidden');
    e.currentTarget.classList.toggle('active', !inspectDock.classList.contains('hidden'));
  });
  container.querySelector('#insp-close-btn')?.addEventListener('click', () => {
    inspectDock.classList.add('hidden');
    container.querySelector('#tl-inspect').classList.remove('active');
  });
  container.querySelector('#insp-reset-btn')?.addEventListener('click', () => {
    rotYInput.value = '0';
    liftInput.value = '0';
    viewer.resetIndividualTransforms();
  });
  rotYInput?.addEventListener('input', applyInspect);
  liftInput?.addEventListener('input', applyInspect);

  // Anatomia Explodida
  const exDock = container.querySelector('#lab-exploded-dock');
  const mobExBtn = container.querySelector('#mobile-explode-open');
  const mobExPct = container.querySelector('#mob-ex-pct');
  const exSlider = container.querySelector('#ex-slider');
  const exVal = container.querySelector('#ex-value');
  const exScope = container.querySelector('#ex-scope');

  const setExplodeDockOpen = (open) => {
    exDock.classList.toggle('hidden', !open);
    mobExBtn.classList.toggle('hidden', open);
    container.querySelector('#tl-explode-toggle').classList.toggle('active', open);
  };

  if (window.innerWidth <= 640 || window.innerHeight <= 620) {
    setExplodeDockOpen(false);
  } else {
    setExplodeDockOpen(true);
  }

  function setExplosion(pct) {
    const clamped = Math.max(0, Math.min(100, Number(pct)));
    state.explodedPercent = clamped;
    exSlider.value = String(clamped);
    exVal.textContent = `${clamped}%`;
    if (mobExPct) mobExPct.textContent = `${clamped}%`;
    viewer.exploded.setTargetPercent(clamped);
    viewer.needsRender = true;
  }

  exSlider?.addEventListener('input', (e) => setExplosion(e.target.value));
  exScope?.addEventListener('change', (e) => {
    viewer.exploded.setScope(e.target.value, state.selectedBoneId);
    viewer.needsRender = true;
  });
  container.querySelectorAll('[data-ex-preset]').forEach((b) => {
    b.addEventListener('click', () => setExplosion(b.dataset.exPreset));
  });
  container.querySelector('#ex-anim-btn')?.addEventListener('click', () => {
    setExplosion(state.explodedPercent >= 65 ? 0 : 85);
  });
  container.querySelector('#ex-reset-btn')?.addEventListener('click', () => {
    setExplosion(0);
    viewer.exploded.animateReset();
    viewer.needsRender = true;
  });
  mobExBtn?.addEventListener('click', () => setExplodeDockOpen(true));
  container.querySelector('#ex-close-btn')?.addEventListener('click', () => setExplodeDockOpen(false));
  container.querySelector('#tl-explode-toggle')?.addEventListener('click', () => {
    setExplodeDockOpen(exDock.classList.contains('hidden'));
  });

  container.querySelector('#lab-reset-all')?.addEventListener('click', () => {
    setExplosion(0);
    exScope.value = 'all';
    viewer.exploded.setScope('all', null);
    viewer.resetIndividualTransforms();
    viewer.selection.showAll();
    viewer.selection.setXray(false);
    viewer.cameraCtrl.reset();
    state.isolatedBoneId = null;
    state.hiddenBoneIds = [];
    state.xrayMode = false;
    container.querySelector('#tl-xray').classList.remove('active');
    container.querySelector('#tl-isolate').classList.remove('active');
    treeUI.render();
    panelUI.render();
  });
}

function showLandmarkPopover(popoverEl, lm) {
  popoverEl.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">
      <div>
        <strong style="font-size:0.9rem;">${lm.name}</strong>
        ${lm.latinName ? `<div class="small muted" style="font-style:italic;">${lm.latinName}</div>` : ''}
      </div>
      <button class="btn btn-ghost btn-sm" id="lm-pop-close" aria-label="Fechar marco">${icon('x', 14)}</button>
    </div>
    <p class="small" style="margin:0 0 6px;"><strong>Localização:</strong> ${lm.location}</p>
    <p class="small" style="margin:0 0 6px;"><strong>Função:</strong> ${lm.function}</p>
    ${lm.relatedStructures?.length ? `<p class="small" style="margin:0 0 6px;"><strong>Estruturas relacionadas:</strong> ${lm.relatedStructures.join(', ')}</p>` : ''}
    <p class="small" style="margin:0 0 6px;"><strong>Importância clínica:</strong> ${lm.clinicalImportance}</p>
    <p class="small muted" style="margin:0;">${lm.explanation}</p>
  `;
  popoverEl.classList.remove('hidden');
  popoverEl.querySelector('#lm-pop-close')?.addEventListener('click', () => popoverEl.classList.add('hidden'));
}
