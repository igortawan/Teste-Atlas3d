/**
 * Orquestrador principal de telas do ATLAS VET 3D:
 * Dashboard principal, Progresso de Desempenho, Biblioteca Científica e modais de Módulos Futuros.
 */
import { icon } from './icons.js';
import { state, subscribe } from './state.js';
import { navigate, initRouter } from './router.js';
import {
  loadCoreMetadata, getAllSpeciesSync, getModulesSync,
  getAllReferencesSync, preloadAllSpecies, getSpeciesMetaSync, getStructureByIdSync
} from './anatomyDatabase.js';
import { applyThemeAndTypography, renderHeader, openModal } from './navigation.js';
import { renderSpeciesView } from './speciesManager.js';
import { renderLabView, destroyLabView } from './labView.js';
import { renderStudyView, destroyStudyView } from './quizEngine.js';
import { renderComparisonView, destroyComparisonView } from './comparison.js';
import {
  startStudyTimer, formatStudyDuration, getOverallProgressSummary,
  getSpeciesProgress, getRecentStudies, getSmartReviewRecommendations
} from './progressManager.js';
import { getFavorites } from './favorites.js';
import { getAllNotes } from './notesManager.js';
import { getSpeciesIllustration } from './speciesIllustrations.js';

const REGION_PT = {
  skull: 'Crânio',
  vertebral_column: 'Coluna vertebral',
  thoracic_cage: 'Caixa torácica',
  thoracic_limb: 'Membro torácico',
  pelvic_limb: 'Membro pélvico'
};

export async function bootApp() {
  applyThemeAndTypography();
  await loadCoreMetadata();
  await preloadAllSpecies();
  startStudyTimer();

  subscribe('route:changed', ({ path, params }) => {
    renderHeader();
    renderActiveRoute(path, params);
  });
  subscribe('favorites:changed', () => renderHeader());

  // Atalhos globais de teclado
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      document.getElementById('global-search-input')?.focus();
    }
    if (e.key === 'Escape') {
      document.getElementById('modal-root').innerHTML = '';
      document.getElementById('global-search-results')?.classList.add('hidden');
    }
  });

  initRouter();
}

function renderActiveRoute(path, params) {
  const main = document.getElementById('app-main');
  const shell = document.querySelector('.app-shell');
  if (!main) return;
  shell?.classList.toggle('is-lab-route', path === '/lab');
  if (path !== '/lab') destroyLabView();
  if (path !== '/study') destroyStudyView();
  if (path !== '/compare') destroyComparisonView();
  if (path !== '/lab') window.scrollTo(0, 0);

  switch (path) {
    case '/dashboard':
      renderDashboard(main);
      break;
    case '/species':
      renderSpeciesView(main, params);
      break;
    case '/lab':
      renderLabView(main, params);
      break;
    case '/study':
      renderStudyView(main, params);
      break;
    case '/compare':
      renderComparisonView(main, params);
      break;
    case '/progress':
      renderProgressView(main);
      break;
    case '/library':
      renderLibraryView(main);
      break;
    default:
      renderDashboard(main);
  }
}

function getDailyChallenge(speciesList) {
  const daySeed = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < daySeed.length; i++) hash = (hash * 31 + daySeed.charCodeAt(i)) % 997;
  const sp = speciesList[hash % speciesList.length];
  return {
    species: sp,
    title: `Desafio do dia (${daySeed}): Identificação em ${sp.name}`,
    desc: `Explore o esqueleto de ${sp.name} e conclua uma rodada de Localização 3D ou Identificação.`
  };
}

function renderDashboard(container) {
  const profile = state.persisted.profile;
  const speciesList = getAllSpeciesSync();
  const modules = getModulesSync();
  const overall = getOverallProgressSummary();
  const recent = getRecentStudies(5);
  const favs = getFavorites().slice(0, 5);
  const recs = getSmartReviewRecommendations(state.currentSpecies, 4);
  const lastSp = getSpeciesMetaSync(state.persisted.lastSession.species) || speciesList[0];
  const lastBone = state.persisted.lastSession.boneId ? getStructureByIdSync(lastSp.id, state.persisted.lastSession.boneId) : null;
  const challenge = getDailyChallenge(speciesList);
  const qs = state.persisted.progress.quizStats;
  const accuracy = qs.totalAnswered > 0 ? Math.round((qs.totalCorrect / qs.totalAnswered) * 100) : 0;

  container.innerHTML = `
    <div class="page-container">
      <section class="hero-banner">
        <div>
          <div class="hero-eyebrow">${icon('microscope', 14)} Laboratório Virtual de Anatomia Veterinária e Zootécnica</div>
          <h1 class="hero-title">Olá, ${esc(profile.name)}</h1>
          <p class="hero-desc">
            Explore esqueletos tridimensionais segmentados de 8 espécies domésticas, isole peças, acione a vista explodida por região, consulte marcos anatômicos e compare espécies com rigor bibliográfico.
          </p>
          <div class="hero-cta-row">
            <button class="btn btn-primary" id="dash-open-lab">${icon('box', 16)} Abrir Laboratório 3D</button>
            <button class="btn" id="dash-open-species">${icon('paw-print', 16)} Escolher Espécie</button>
            <button class="btn" id="dash-open-compare">${icon('git-compare', 16)} Anatomia Comparada</button>
          </div>
        </div>

        <div class="continue-card">
          <div>
            <span class="badge badge-cyan">Continuar estudando</span>
            <h3 style="margin:10px 0 4px;">${lastSp.name} — Osteologia</h3>
            <p class="small muted" style="margin:0;">
              ${lastBone ? `Última estrutura: <strong>${esc(lastBone.name)}</strong> (<i>${esc(lastBone.latinName)}</i>)` : `Pronto para explorar ${lastSp.name} no visualizador 3D.`}
            </p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" id="dash-resume">${icon('play', 14)} Retomar agora</button>
            <button class="btn btn-sm" id="dash-challenge">${icon('zap', 14)} ${esc(challenge.title.split(':')[0])}</button>
          </div>
        </div>
      </section>

      <section class="kpi-grid">
        <div class="card kpi-card">
          <div class="kpi-top"><span>Progresso geral</span>${icon('chart-column', 16)}</div>
          <div class="kpi-value">${overall.percent}%</div>
          <div class="progress-track"><div class="progress-fill" style="width:${overall.percent}%"></div></div>
          <div class="kpi-foot">${overall.totalVisited} de ${overall.totalStructures} estruturas visitadas</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-top"><span>Tempo de estudo</span>${icon('clock', 16)}</div>
          <div class="kpi-value">${formatStudyDuration(state.persisted.progress.studySeconds)}</div>
          <div class="kpi-foot">Meta diária: ${profile.goalMinutesPerDay} min</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-top"><span>Estruturas dominadas</span>${icon('trophy', 16)}</div>
          <div class="kpi-value">${overall.totalMastered}</div>
          <div class="kpi-foot">${overall.totalPending} marcada(s) para revisão</div>
        </div>
        <div class="card kpi-card">
          <div class="kpi-top"><span>Desempenho em quizzes</span>${icon('target', 16)}</div>
          <div class="kpi-value">${qs.totalAnswered ? `${accuracy}%` : '—'}</div>
          <div class="kpi-foot">${qs.totalAnswered} resposta(s) · Melhor sequência: ${qs.bestStreak}</div>
        </div>
      </section>

      <section class="dash-columns">
        <div class="card panel-box">
          <div class="panel-box-head">
            <h2 class="panel-box-title">${icon('layers', 17)} Módulos anatômicos</h2>
            <span class="badge badge-emerald">Osteologia completa</span>
          </div>
          <div class="modules-grid">
            ${modules.map((m) => `
              <button class="module-card ${m.implemented ? 'implemented' : 'future'}" data-mod="${m.id}">
                <div class="module-icon">${icon(m.icon, 18)}</div>
                <div>
                  <div class="module-name">
                    ${esc(m.name)}
                    <span class="badge ${m.implemented ? 'badge-emerald' : ''}">${m.implemented ? 'Disponível' : 'Módulo futuro'}</span>
                  </div>
                  <div class="module-desc">${esc(m.description)}</div>
                </div>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="stack-list">
          <div class="card panel-box">
            <div class="panel-box-head">
              <h2 class="panel-box-title">${icon('zap', 17)} Desafio diário</h2>
              <span class="badge badge-amber">Ativo</span>
            </div>
            <p class="small" style="margin:0 0 10px;"><strong>${esc(challenge.title)}</strong><br><span class="muted">${esc(challenge.desc)}</span></p>
            <button class="btn btn-sm btn-primary" id="dash-go-challenge">${icon('graduation-cap', 14)} Iniciar desafio</button>
          </div>

          <div class="card panel-box">
            <div class="panel-box-head">
              <h2 class="panel-box-title">${icon('history', 17)} Estudos recentes</h2>
            </div>
            <div class="stack-list">
              ${recent.length ? recent.map((r) => `
                <button class="mini-item mini-item-btn" data-jump="${r.species}|${r.id}">
                  <div>
                    <div class="small"><strong>${esc(r.name)}</strong></div>
                    <div class="small muted">${esc(getSpeciesMetaSync(r.species)?.name || r.species)}</div>
                  </div>
                  ${icon('arrow-right', 14)}
                </button>
              `).join('') : '<p class="small muted" style="margin:0;">Nenhuma estrutura visitada ainda. Abra uma espécie no Laboratório 3D.</p>'}
            </div>
          </div>

          <div class="card panel-box">
            <div class="panel-box-head">
              <h2 class="panel-box-title">${icon('lightbulb', 17)} Recomendações & Favoritos</h2>
            </div>
            <div class="stack-list">
              ${favs.map((f) => {
                const b = getStructureByIdSync(f.species, f.id);
                return `
                  <button class="mini-item mini-item-btn" data-jump="${f.species}|${f.id}">
                    <span class="small">${icon('star', 13)} <strong>${esc(b?.name || f.id)}</strong></span>
                    <span class="badge">${esc(getSpeciesMetaSync(f.species)?.name || f.species)}</span>
                  </button>
                `;
              }).join('')}
              ${recs.slice(0, 3).map((r) => `
                <button class="mini-item mini-item-btn" data-jump="${r.species}|${r.id}">
                  <div>
                    <div class="small"><strong>${esc(r.name)}</strong></div>
                    <div class="small muted">${esc(r.reason)}</div>
                  </div>
                  <span class="badge badge-cyan">Revisar</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div class="section-header">
          <div>
            <h2 style="margin:0;font-size:1.15rem;">Espécies disponíveis (${speciesList.length})</h2>
            <p class="small muted" style="margin:2px 0 0;">Clique em qualquer espécie para iniciar imediatamente no Laboratório 3D.</p>
          </div>
          <button class="btn btn-sm" id="dash-all-species">Ver detalhes de todas</button>
        </div>
        <div class="dash-species-strip">
          ${speciesList.map((sp) => {
            const p = getSpeciesProgress(sp.id);
            return `
              <button class="card mini-item mini-item-btn" style="padding:12px;" data-open-sp="${sp.id}">
                <div style="display:flex;align-items:center;gap:10px;width:100%;">
                  <div style="width:62px;height:42px;color:var(--accent-emerald);flex-shrink:0;">${getSpeciesIllustration(sp.id)}</div>
                  <div style="flex:1;min-width:0;">
                    <strong class="small">${sp.name}</strong>
                    <div class="small muted">${p.total} ossos · ${p.percent}%</div>
                  </div>
                </div>
              </button>
            `;
          }).join('')}
        </div>
      </section>
    </div>
  `;

  container.querySelector('#dash-open-lab')?.addEventListener('click', () => navigate('/lab', { species: lastSp.id }));
  container.querySelector('#dash-open-species')?.addEventListener('click', () => navigate('/species'));
  container.querySelector('#dash-all-species')?.addEventListener('click', () => navigate('/species'));
  container.querySelector('#dash-open-compare')?.addEventListener('click', () => navigate('/compare'));
  container.querySelector('#dash-resume')?.addEventListener('click', () => navigate('/lab', { species: lastSp.id, bone: lastBone?.id || '' }));
  container.querySelector('#dash-challenge')?.addEventListener('click', () => navigate('/study', { species: challenge.species.id }));
  container.querySelector('#dash-go-challenge')?.addEventListener('click', () => navigate('/study', { species: challenge.species.id }));

  container.querySelectorAll('[data-jump]').forEach((b) => {
    b.addEventListener('click', () => {
      const [sp, id] = b.dataset.jump.split('|');
      navigate('/lab', { species: sp, bone: id });
    });
  });

  container.querySelectorAll('[data-open-sp]').forEach((b) => {
    b.addEventListener('click', () => navigate('/lab', { species: b.dataset.openSp }));
  });

  container.querySelectorAll('[data-mod]').forEach((b) => {
    b.addEventListener('click', () => {
      const mod = modules.find((m) => m.id === b.dataset.mod);
      if (!mod) return;
      if (mod.id === 'osteology') navigate('/lab');
      else if (mod.id === 'comparative') navigate('/compare');
      else {
        openModal(`${icon('lock', 18)} ${mod.name} — Módulo Futuro`, `
          <div class="stack-list">
            <span class="badge badge-amber">Em desenvolvimento — não disponível nesta versão</span>
            <p class="small" style="margin:6px 0 0;">O <strong>ATLAS VET 3D</strong> prioriza precisão científica e não simula funcionalidades inexistentes.</p>
            <div class="info-block">
              <div class="info-label">Escopo previsto na arquitetura</div>
              <p class="small" style="margin:0;">${esc(mod.plannedScope || mod.description)}</p>
            </div>
            <p class="small muted" style="margin:0;">Atualmente os módulos completos disponíveis são <strong>Osteologia 3D</strong> e <strong>Anatomia Comparada (Osteologia)</strong>.</p>
          </div>
        `);
      }
    });
  });
}

function renderProgressView(container) {
  const speciesList = getAllSpeciesSync();
  const overall = getOverallProgressSummary();
  const prog = state.persisted.progress;
  const qs = prog.quizStats;
  const notes = getAllNotes();
  const recs = getSmartReviewRecommendations(null, 8);

  container.innerHTML = `
    <div class="page-container">
      <div class="section-header">
        <div>
          <h1 class="section-title">Desempenho e Histórico de Estudos</h1>
          <p class="section-subtitle">Acompanhe sua evolução por espécie, regiões com maior dificuldade, sessões de estudo e anotações.</p>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="card kpi-card"><div class="kpi-top"><span>Cadastradas</span></div><div class="kpi-value">${overall.totalStructures}</div><div class="kpi-foot">Em ${speciesList.length} espécies</div></div>
        <div class="card kpi-card"><div class="kpi-top"><span>Visitadas</span></div><div class="kpi-value">${overall.totalVisited}</div><div class="kpi-foot">${overall.percent}% do atlas</div></div>
        <div class="card kpi-card"><div class="kpi-top"><span>Dominadas</span></div><div class="kpi-value">${overall.totalMastered}</div><div class="kpi-foot">${overall.totalPending} para revisar</div></div>
        <div class="card kpi-card"><div class="kpi-top"><span>Tempo total</span></div><div class="kpi-value">${formatStudyDuration(prog.studySeconds)}</div><div class="kpi-foot">${qs.totalCorrect}/${qs.totalAnswered} acertos no quiz</div></div>
      </div>

      <div class="dash-columns">
        <div class="card panel-box">
          <h2 class="panel-box-title">${icon('paw-print', 17)} Progresso por espécie</h2>
          <div class="bar-chart" style="margin-top:14px;">
            ${speciesList.map((sp) => {
              const p = getSpeciesProgress(sp.id);
              return `
                <div class="bar-row">
                  <span>${sp.name}</span>
                  <div class="progress-track"><div class="progress-fill" style="width:${p.percent}%"></div></div>
                  <span class="mono small">${p.visited}/${p.total}</span>
                </div>
              `;
            }).join('')}
          </div>

          <h2 class="panel-box-title" style="margin-top:22px;">${icon('target', 17)} Desempenho por região nos quizzes</h2>
          <div class="bar-chart" style="margin-top:12px;">
            ${Object.entries(REGION_PT).map(([rk, label]) => {
              const st = qs.byRegion[rk] || { attempts: 0, correct: 0 };
              const pct = st.attempts ? Math.round((st.correct / st.attempts) * 100) : 0;
              return `
                <div class="bar-row">
                  <span>${label}</span>
                  <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
                  <span class="mono small">${st.attempts ? `${pct}%` : '—'}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="stack-list">
          <div class="card panel-box">
            <h2 class="panel-box-title">${icon('lightbulb', 17)} Prioridades de revisão</h2>
            <div class="stack-list" style="margin-top:10px;">
              ${recs.length ? recs.map((r) => `
                <button class="mini-item mini-item-btn" data-pjump="${r.species}|${r.id}">
                  <div>
                    <div class="small"><strong>${esc(r.name)}</strong></div>
                    <div class="small muted">${esc(getSpeciesMetaSync(r.species)?.name || r.species)} · ${esc(r.reason)}</div>
                  </div>
                  ${icon('arrow-right', 14)}
                </button>
              `).join('') : '<p class="small muted">Sem pendências registradas até o momento.</p>'}
            </div>
          </div>

          <div class="card panel-box">
            <h2 class="panel-box-title">${icon('history', 17)} Histórico recente de sessões</h2>
            <div class="stack-list" style="margin-top:10px;">
              ${prog.sessions.length ? prog.sessions.slice(0, 6).map((s) => `
                <div class="mini-item">
                  <div>
                    <div class="small"><strong>${esc(s.mode)}</strong> — ${esc(getSpeciesMetaSync(s.species)?.name || s.species)}</div>
                    <div class="small muted">${new Date(s.date).toLocaleString('pt-BR')}</div>
                  </div>
                  <span class="badge badge-emerald">${s.score}/${s.total}</span>
                </div>
              `).join('') : '<p class="small muted">Nenhuma sessão de quiz concluída ainda.</p>'}
            </div>
          </div>

          <div class="card panel-box">
            <h2 class="panel-box-title">${icon('notebook-pen', 17)} Suas anotações (${notes.length})</h2>
            <div class="stack-list" style="margin-top:10px;">
              ${notes.slice(0, 5).map((n) => `
                <button class="mini-item mini-item-btn" data-pjump="${n.species}|${n.structureId}">
                  <div>
                    <div class="small"><strong>${esc(getStructureByIdSync(n.species, n.structureId)?.name || n.structureId)}</strong></div>
                    <div class="small muted">${esc(n.text)}</div>
                  </div>
                  <span class="badge">${n.kind === 'question' ? 'Dúvida' : 'Nota'}</span>
                </button>
              `).join('') || '<p class="small muted">Sem anotações salvas.</p>'}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-pjump]').forEach((b) => {
    b.addEventListener('click', () => {
      const [sp, id] = b.dataset.pjump.split('|');
      navigate('/lab', { species: sp, bone: id });
    });
  });
}

function renderLibraryView(container) {
  const refs = getAllReferencesSync();
  const speciesList = getAllSpeciesSync();
  let filterText = '';
  let filterSp = 'all';

  const draw = () => {
    const q = filterText.toLowerCase();
    const list = refs.filter((r) => {
      if (filterSp !== 'all' && !(r.speciesCovered || []).includes(filterSp)) return false;
      if (!q) return true;
      return `${r.title} ${(r.authors || []).join(' ')} ${r.summary}`.toLowerCase().includes(q);
    });

    container.innerHTML = `
      <div class="page-container">
        <div class="section-header">
          <div>
            <h1 class="section-title">Biblioteca Científica</h1>
            <p class="section-subtitle">Obras clássicas de anatomia veterinária, nomenclaturas oficiais e bases acadêmicas utilizadas como referência.</p>
          </div>
        </div>

        <div class="card panel-box" style="margin-bottom:16px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <input class="input" id="lib-search" style="flex:1;min-width:220px;" placeholder="Filtrar por título, autor ou tema..." value="${esc(filterText)}" />
          <select class="select" id="lib-sp" style="width:auto;">
            <option value="all">Todas as espécies</option>
            ${speciesList.map((s) => `<option value="${s.id}" ${s.id === filterSp ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select>
        </div>

        <div class="refs-grid">
          ${list.map((r) => `
            <article class="card ref-card">
              <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;">
                <strong style="font-size:0.98rem;">${esc(r.title)}</strong>
                <span class="badge badge-cyan">${esc(r.type)}</span>
              </div>
              <div class="small muted">${esc((r.authors || []).join('; '))}</div>
              <div class="small muted">${r.edition ? `${esc(r.edition)} · ` : ''}${r.publisher ? `${esc(r.publisher)} · ` : ''}${r.year || ''}</div>
              <p class="small" style="margin:2px 0;">${esc(r.summary)}</p>
              <div class="chip-row">
                ${(r.speciesCovered || []).map((spId) => `<span class="badge">${esc(getSpeciesMetaSync(spId)?.name || spId)}</span>`).join('')}
              </div>
              ${r.url ? `<a class="small" style="margin-top:4px;display:inline-flex;align-items:center;gap:5px;" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.urlLabel || 'Acessar fonte')} ${icon('external-link', 13)}</a>` : ''}
            </article>
          `).join('')}
        </div>
      </div>
    `;

    const sIn = container.querySelector('#lib-search');
    sIn?.addEventListener('input', (e) => {
      filterText = e.target.value;
      const pos = e.target.selectionStart;
      draw();
      const next = container.querySelector('#lib-search');
      next?.focus();
      next?.setSelectionRange(pos, pos);
    });
    container.querySelector('#lib-sp')?.addEventListener('change', (e) => {
      filterSp = e.target.value;
      draw();
    });
  };

  draw();
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
