/**
 * Gerenciador da tela de Seleção de Espécies e da Área Individual da Espécie.
 */
import { icon } from './icons.js';
import { getAllSpeciesSync, getSpeciesMetaSync, loadSpeciesOsteology } from './anatomyDatabase.js';
import { getSpeciesProgress } from './progressManager.js';
import { getSpeciesIllustration } from './speciesIllustrations.js';
import { navigate } from './router.js';
import { state } from './state.js';

export async function renderSpeciesView(container, params = {}) {
  if (params.species && getSpeciesMetaSync(params.species)) {
    return renderSpeciesDetail(container, params.species);
  }

  const speciesList = getAllSpeciesSync();
  await Promise.all(speciesList.map((s) => loadSpeciesOsteology(s.id)));

  container.innerHTML = `
    <div class="page-container">
      <div class="section-header">
        <div>
          <h1 class="section-title">Seleção de Espécies</h1>
          <p class="section-subtitle">Escolha uma espécie doméstica para explorar suas características anatômicas gerais, progresso e laboratório 3D de Osteologia.</p>
        </div>
        <button class="btn btn-primary" id="sp-go-compare">${icon('git-compare', 16)} Comparar espécies</button>
      </div>

      <div class="species-grid">
        ${speciesList.map((sp) => {
          const prog = getSpeciesProgress(sp.id);
          return `
            <article class="card species-card">
              <div class="species-art">
                <span class="badge badge-emerald species-tag-top">Osteologia</span>
                <span class="badge species-tag-count">${prog.total} ossos</span>
                ${getSpeciesIllustration(sp.id)}
              </div>
              <div class="species-body">
                <div>
                  <h2 class="species-name">${sp.name}</h2>
                  <div class="species-latin">${sp.scientificName}</div>
                </div>
                <div class="species-formula">${sp.vertebralFormula}</div>
                <p class="small muted" style="margin:0;">${sp.summary}</p>
                <div style="margin-top:auto;padding-top:6px;">
                  <div style="display:flex;justify-content:space-between;font-size:0.76rem;margin-bottom:4px;">
                    <span class="muted">Progresso</span>
                    <strong>${prog.visited}/${prog.total} (${prog.percent}%)</strong>
                  </div>
                  <div class="progress-track"><div class="progress-fill" style="width:${prog.percent}%"></div></div>
                </div>
              </div>
              <div class="species-footer">
                <button class="btn btn-sm" style="flex:1;" data-sp-detail="${sp.id}">${icon('info', 14)} Detalhes</button>
                <button class="btn btn-sm btn-primary" style="flex:1;" data-sp-lab="${sp.id}">${icon('box', 14)} Abrir 3D</button>
              </div>
            </article>
          `;
        }).join('')}
      </div>

      <div class="card future-species-banner">
        <div>
          <strong>Expansão futura de espécies prevista na arquitetura</strong>
          <div class="small muted">Estruturas preparadas para receber: Búfalo, Asinino, Coelho e Animais Silvestres com base em <code>data/&lt;especie&gt;/osteology.json</code> e <code>models/&lt;especie&gt;/</code>.</div>
        </div>
        <span class="badge badge-cyan">Arquitetura extensível</span>
      </div>
    </div>
  `;

  container.querySelector('#sp-go-compare')?.addEventListener('click', () => navigate('/compare'));
  container.querySelectorAll('[data-sp-detail]').forEach((b) => {
    b.addEventListener('click', () => navigate('/species', { species: b.dataset.spDetail }));
  });
  container.querySelectorAll('[data-sp-lab]').forEach((b) => {
    b.addEventListener('click', () => navigate('/lab', { species: b.dataset.spLab }));
  });
}

async function renderSpeciesDetail(container, speciesId) {
  const sp = getSpeciesMetaSync(speciesId);
  await loadSpeciesOsteology(speciesId);
  const prog = getSpeciesProgress(speciesId);
  const lastVisited = Object.entries(state.persisted.progress.visited)
    .filter(([, v]) => v.species === speciesId)
    .sort((a, b) => (b[1].lastAt || '').localeCompare(a[1].lastAt || ''))[0];

  container.innerHTML = `
    <div class="page-container">
      <div style="margin-bottom:14px;">
        <button class="btn btn-ghost btn-sm" id="sp-back-all">${icon('arrow-left', 14)} Todas as espécies</button>
      </div>

      <div class="species-detail-grid">
        <div class="card species-detail-art">
          <div class="species-detail-svg">${getSpeciesIllustration(sp.id)}</div>
          <div>
            <h1 style="margin:0;font-size:1.38rem;">${sp.name}</h1>
            <div class="species-latin">${sp.scientificName}</div>
            <div class="small muted" style="margin-top:4px;">${sp.group}</div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:5px;">
              <span class="muted">Progresso na espécie</span>
              <strong>${prog.visited}/${prog.total} estruturas (${prog.percent}%)</strong>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width:${prog.percent}%"></div></div>
          </div>
          ${lastVisited ? `
            <div class="info-block">
              <div class="info-label">Último conteúdo acessado</div>
              <div class="small"><strong>${lastVisited[1].name}</strong></div>
            </div>
          ` : ''}
          <button class="btn btn-primary" id="sp-start-lab">${icon('box', 16)} Iniciar estudo 3D (${sp.name})</button>
          <button class="btn" id="sp-start-quiz">${icon('graduation-cap', 16)} Praticar quiz desta espécie</button>
        </div>

        <div class="stack-list">
          <div class="card panel-box">
            <h2 class="panel-box-title">${icon('paw-print', 17)} Características anatômicas gerais</h2>
            <p class="small muted" style="margin:8px 0 12px;">${sp.summary}</p>
            <div class="kv-grid" style="margin-bottom:12px;">
              <div class="info-block"><div class="info-label">Locomoção e apoio</div><div class="small">${sp.locomotion}</div></div>
              <div class="info-block"><div class="info-label">Fórmula vertebral</div><div class="small mono">${sp.vertebralFormula}</div></div>
              <div class="info-block"><div class="info-label">Fórmula dentária permanente</div><div class="small mono">${sp.dentalFormula}</div></div>
              <div class="info-block"><div class="info-label">Altura média de referência</div><div class="small">${sp.withersHeightM} m</div></div>
            </div>
            <ul class="small" style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:5px;">
              ${sp.generalCharacteristics.map((c) => `<li>${c}</li>`).join('')}
            </ul>
          </div>

          <div class="card panel-box">
            <h2 class="panel-box-title">${icon('activity', 17)} Destaques clínicos e zootécnicos</h2>
            <ul class="small" style="margin:8px 0 0;padding-left:18px;display:flex;flex-direction:column;gap:5px;">
              ${sp.highlights.map((h) => `<li>${h}</li>`).join('')}
            </ul>
          </div>

          <div class="card panel-box">
            <h2 class="panel-box-title">${icon('layers', 17)} Sistemas anatômicos disponíveis</h2>
            <div class="chip-row" style="margin-top:10px;">
              <span class="badge badge-emerald">${icon('bone', 12)} Osteologia (${prog.total} estruturas ativas)</span>
              <span class="badge badge-cyan">${icon('git-compare', 12)} Osteologia comparada (ativo)</span>
              <span class="badge">Demais sistemas: módulos futuros</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#sp-back-all')?.addEventListener('click', () => navigate('/species'));
  container.querySelector('#sp-start-lab')?.addEventListener('click', () => {
    navigate('/lab', { species: speciesId, bone: lastVisited?.[0] || '' });
  });
  container.querySelector('#sp-start-quiz')?.addEventListener('click', () => {
    navigate('/study', { species: speciesId });
  });
}
