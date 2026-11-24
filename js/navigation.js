/**
 * Cabeçalho global, navegação principal, busca global (Ctrl+K), tema claro/escuro,
 * favoritos, perfil do estudante e configurações (incluindo backup JSON).
 */
import { icon } from './icons.js';
import { state, updateSettings, updateProfile, replacePersisted } from './state.js';
import { navigate } from './router.js';
import { searchAnatomy } from './searchEngine.js';
import { getFavorites, getReviewLists } from './favorites.js';
import { getSpeciesMetaSync, getStructureByIdSync, loadSpeciesOsteology } from './anatomyDatabase.js';
import { exportUserBackup, parseUserBackup, cloudSyncAdapter } from './storage.js';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Início', icon: 'layout-dashboard' },
  { path: '/species', label: 'Espécies', icon: 'paw-print' },
  { path: '/lab', label: 'Laboratório 3D', icon: 'box' },
  { path: '/study', label: 'Estudar', icon: 'graduation-cap' },
  { path: '/compare', label: 'Comparar', icon: 'git-compare' },
  { path: '/progress', label: 'Progresso', icon: 'chart-column' },
  { path: '/library', label: 'Biblioteca', icon: 'library' }
];

export function showToast(message, type = 'info') {
  const root = document.getElementById('toast-root');
  if (!root) return;
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  const ic = type === 'success' ? 'circle-check' : type === 'warning' ? 'triangle-alert' : type === 'error' ? 'circle-x' : 'info';
  el.innerHTML = `${icon(ic, 16)}<span>${esc(message)}</span>`;
  root.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

export function openModal(title, bodyHtml, { onMount } = {}) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop" role="dialog" aria-modal="true">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="btn btn-ghost btn-icon" id="modal-close-btn" aria-label="Fechar janela">${icon('x', 18)}</button>
        </div>
        <div id="modal-body">${bodyHtml}</div>
      </div>
    </div>
  `;
  const close = () => { root.innerHTML = ''; };
  root.querySelector('#modal-close-btn')?.addEventListener('click', close);
  root.querySelector('#modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-backdrop') close();
  });
  onMount?.(root, close);
  return close;
}

export function applyThemeAndTypography() {
  const { theme, fontScale } = state.persisted.settings;
  document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
  document.documentElement.style.setProperty('--font-scale', String(fontScale || 1));
}

export function renderHeader() {
  const header = document.getElementById('app-header');
  if (!header) return;
  const favCount = getFavorites().length;
  const isDark = state.persisted.settings.theme !== 'light';

  header.innerHTML = `
    <button class="brand" id="brand-home" title="Voltar ao Dashboard">
      <span class="brand-mark">${icon('bone', 18)}</span>
      <span class="brand-text">
        <span class="brand-title">ATLAS VET 3D</span>
        <span class="brand-sub">ANATOMIA VIRTUAL</span>
      </span>
    </button>

    <button class="btn btn-ghost btn-icon mobile-menu-btn" id="mobile-nav-toggle" aria-label="Abrir menu">${icon('menu', 18)}</button>

    <nav class="main-nav" id="main-nav" aria-label="Navegação principal">
      ${NAV_ITEMS.map((n) => `
        <button class="nav-link ${state.route === n.path ? 'active' : ''}" data-route="${n.path}">
          ${icon(n.icon, 15)}<span>${n.label}</span>
        </button>
      `).join('')}
    </nav>

    <div class="global-search" id="global-search-wrap">
      <div class="global-search-box">
        ${icon('search', 15)}
        <input id="global-search-input" type="search" placeholder="Buscar osso, latim, acidente, clínica..." autocomplete="off" aria-label="Busca anatômica global" />
        <span class="kbd-hint">Ctrl+K</span>
      </div>
      <div class="search-dropdown hidden" id="global-search-results"></div>
    </div>

    <div class="header-actions">
      <button class="btn btn-ghost btn-icon icon-badge-btn" id="hdr-fav-btn" title="Favoritos e listas de revisão" aria-label="Favoritos">
        ${icon('star', 17)}
        ${favCount ? `<span class="count-pill">${favCount}</span>` : ''}
      </button>
      <button class="btn btn-ghost btn-icon" id="hdr-theme-btn" title="${isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}" aria-label="Alternar tema">
        ${icon(isDark ? 'sun' : 'moon', 17)}
      </button>
      <button class="btn btn-ghost btn-icon" id="hdr-profile-btn" title="Perfil do estudante" aria-label="Perfil do estudante">
        ${icon('user', 17)}
      </button>
      <button class="btn btn-ghost btn-icon" id="hdr-settings-btn" title="Configurações" aria-label="Configurações">
        ${icon('settings', 17)}
      </button>
    </div>
  `;

  header.querySelector('#brand-home')?.addEventListener('click', () => navigate('/dashboard'));
  header.querySelector('#mobile-nav-toggle')?.addEventListener('click', () => {
    header.querySelector('#main-nav')?.classList.toggle('open');
  });
  header.querySelectorAll('[data-route]').forEach((btn) => {
    btn.addEventListener('click', () => {
      header.querySelector('#main-nav')?.classList.remove('open');
      navigate(btn.dataset.route);
    });
  });

  header.querySelector('#hdr-theme-btn')?.addEventListener('click', () => {
    const next = state.persisted.settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: next });
    applyThemeAndTypography();
    renderHeader();
  });

  header.querySelector('#hdr-fav-btn')?.addEventListener('click', openFavoritesModal);
  header.querySelector('#hdr-profile-btn')?.addEventListener('click', openProfileModal);
  header.querySelector('#hdr-settings-btn')?.addEventListener('click', openSettingsModal);

  _bindGlobalSearch(header);
  renderMobileBottomNav();
}

function renderMobileBottomNav() {
  const nav = document.getElementById('mobile-bottom-nav');
  if (!nav) return;
  const quick = [
    { path: '/dashboard', label: 'Início', icon: 'layout-dashboard' },
    { path: '/species', label: 'Espécies', icon: 'paw-print' },
    { path: '/lab', label: 'Lab 3D', icon: 'box' },
    { path: '/study', label: 'Estudar', icon: 'graduation-cap' },
    { path: '/compare', label: 'Comparar', icon: 'git-compare' }
  ];
  const moreActive = state.route === '/progress' || state.route === '/library';

  nav.innerHTML = `
    ${quick.map((q) => `
      <button class="mobile-bottom-btn ${state.route === q.path ? 'active' : ''}" data-mroute="${q.path}">
        ${icon(q.icon, 18)}
        <span>${q.label}</span>
      </button>
    `).join('')}
    <button class="mobile-bottom-btn ${moreActive ? 'active' : ''}" id="mobile-more-btn" aria-label="Mais seções">
      ${icon('menu', 18)}
      <span>Mais</span>
    </button>
  `;

  nav.querySelectorAll('[data-mroute]').forEach((b) => {
    b.addEventListener('click', () => navigate(b.dataset.mroute));
  });
  nav.querySelector('#mobile-more-btn')?.addEventListener('click', () => {
    openModal(`${icon('layers', 18)} Mais recursos`, `
      <div class="stack-list">
        <button class="mini-item mini-item-btn" id="more-progress">
          <div style="display:flex;align-items:center;gap:10px;">${icon('chart-column', 18)}<div><strong>Progresso e Desempenho</strong><div class="small muted">Gráficos, revisões e anotações</div></div></div>
          ${icon('arrow-right', 15)}
        </button>
        <button class="mini-item mini-item-btn" id="more-library">
          <div style="display:flex;align-items:center;gap:10px;">${icon('library', 18)}<div><strong>Biblioteca Científica</strong><div class="small muted">Obras acadêmicas e nomenclaturas</div></div></div>
          ${icon('arrow-right', 15)}
        </button>
        <button class="mini-item mini-item-btn" id="more-favs">
          <div style="display:flex;align-items:center;gap:10px;">${icon('star', 18)}<div><strong>Favoritos e Listas de Revisão</strong><div class="small muted">Suas estruturas salvas</div></div></div>
          ${icon('arrow-right', 15)}
        </button>
      </div>
    `, {
      onMount: (root, close) => {
        root.querySelector('#more-progress')?.addEventListener('click', () => { close(); navigate('/progress'); });
        root.querySelector('#more-library')?.addEventListener('click', () => { close(); navigate('/library'); });
        root.querySelector('#more-favs')?.addEventListener('click', () => { close(); openFavoritesModal(); });
      }
    });
  });
}

function _bindGlobalSearch(header) {
  const input = header.querySelector('#global-search-input');
  const dropdown = header.querySelector('#global-search-results');
  if (!input || !dropdown) return;

  let timer = null;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    const val = input.value.trim();
    if (!val) { dropdown.classList.add('hidden'); return; }
    timer = setTimeout(async () => {
      const results = await searchAnatomy(val);
      if (!results.length) {
        dropdown.innerHTML = `<div class="small muted" style="padding:12px;">Nenhuma estrutura encontrada para "${esc(val)}".</div>`;
      } else {
        dropdown.innerHTML = results.map((r) => `
          <button class="search-item" data-sp="${r.species}" data-id="${r.id}">
            <div>
              <div class="search-item-title">${esc(r.name)}</div>
              <div class="search-item-meta"><i>${esc(r.latinName)}</i> · ${esc(r.regionName)}</div>
            </div>
            <span class="badge badge-emerald">${esc(r.speciesName)}</span>
          </button>
        `).join('');
        dropdown.querySelectorAll('.search-item').forEach((btn) => {
          btn.addEventListener('click', () => {
            dropdown.classList.add('hidden');
            input.value = '';
            navigate('/lab', { species: btn.dataset.sp, bone: btn.dataset.id });
          });
        });
      }
      dropdown.classList.remove('hidden');
    }, 140);
  });

  document.addEventListener('click', (e) => {
    if (!header.querySelector('#global-search-wrap')?.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
}

async function openFavoritesModal() {
  const favs = getFavorites();
  const lists = getReviewLists();
  await Promise.all([...new Set(favs.map((f) => f.species))].map((sp) => loadSpeciesOsteology(sp)));

  const favHtml = favs.length ? favs.map((f) => {
    const bone = getStructureByIdSync(f.species, f.id);
    const sp = getSpeciesMetaSync(f.species);
    return `
      <div class="mini-item">
        <div>
          <strong class="small">${esc(bone?.name || f.id)}</strong>
          <div class="small muted">${esc(sp?.name || f.species)} · <i>${esc(bone?.latinName || '')}</i></div>
        </div>
        <button class="btn btn-sm btn-primary" data-open-fav="${f.species}|${f.id}">${icon('box', 13)} Abrir 3D</button>
      </div>
    `;
  }).join('') : '<p class="small muted">Nenhuma estrutura favoritada ainda. Clique na estrela dentro da ficha de qualquer osso.</p>';

  const listsHtml = lists.map((l) => `
    <div class="info-block">
      <div style="display:flex;justify-content:space-between;">
        <strong>${esc(l.name)}</strong>
        <span class="badge">${l.items.length} itens</span>
      </div>
    </div>
  `).join('');

  openModal(`${icon('star', 18)} Favoritos e Listas de Revisão`, `
    <div class="stack-list">${favHtml}</div>
    <h4 style="margin:18px 0 8px;">Listas de revisão</h4>
    <div class="stack-list">${listsHtml}</div>
  `, {
    onMount: (root, close) => {
      root.querySelectorAll('[data-open-fav]').forEach((b) => {
        b.addEventListener('click', () => {
          const [sp, id] = b.dataset.openFav.split('|');
          close();
          navigate('/lab', { species: sp, bone: id });
        });
      });
    }
  });
}

function openProfileModal() {
  const p = state.persisted.profile;
  openModal(`${icon('user', 18)} Perfil do Estudante`, `
    <div class="stack-list">
      <div><label class="info-label">Nome</label><input class="input" id="prof-name" value="${esc(p.name)}" /></div>
      <div><label class="info-label">Instituição / Curso</label><input class="input" id="prof-inst" value="${esc(p.institution)}" /></div>
      <div>
        <label class="info-label">Perfil de acesso (preparado para sincronização futura)</label>
        <select class="select" id="prof-role">
          <option value="student" ${p.role === 'student' ? 'selected' : ''}>Estudante (Medicina Veterinária / Zootecnia)</option>
          <option value="professor" ${p.role === 'professor' ? 'selected' : ''}>Professor / Monitor</option>
        </select>
      </div>
      <div><label class="info-label">Meta diária de estudo (minutos)</label><input class="input" type="number" min="5" max="240" id="prof-goal" value="${p.goalMinutesPerDay}" /></div>
      <div class="info-block small muted">${icon('shield-check', 14)} ${esc(cloudSyncAdapter.statusLabel)}</div>
      <button class="btn btn-primary" id="prof-save">${icon('save', 15)} Salvar perfil</button>
    </div>
  `, {
    onMount: (root, close) => {
      root.querySelector('#prof-save')?.addEventListener('click', () => {
        updateProfile({
          name: root.querySelector('#prof-name').value.trim() || 'Estudante',
          institution: root.querySelector('#prof-inst').value.trim(),
          role: root.querySelector('#prof-role').value,
          goalMinutesPerDay: Math.max(5, Number(root.querySelector('#prof-goal').value) || 30)
        });
        showToast('Perfil atualizado.', 'success');
        close();
      });
    }
  });
}

function openSettingsModal() {
  const s = state.persisted.settings;
  openModal(`${icon('settings', 18)} Configurações do Laboratório`, `
    <div class="stack-list">
      <div>
        <label class="info-label">Tema visual</label>
        <select class="select" id="cfg-theme">
          <option value="dark" ${s.theme === 'dark' ? 'selected' : ''}>Escuro Científico (Padrão)</option>
          <option value="light" ${s.theme === 'light' ? 'selected' : ''}>Claro Laboratorial</option>
        </select>
      </div>
      <div>
        <label class="info-label">Tamanho da tipografia (acessibilidade)</label>
        <select class="select" id="cfg-font">
          <option value="0.92" ${s.fontScale == 0.92 ? 'selected' : ''}>Compacto (92%)</option>
          <option value="1" ${s.fontScale == 1 ? 'selected' : ''}>Padrão (100%)</option>
          <option value="1.12" ${s.fontScale == 1.12 ? 'selected' : ''}>Ampliado (112%)</option>
        </select>
      </div>
      <div>
        <label class="info-label">Qualidade gráfica WebGL 3D</label>
        <select class="select" id="cfg-quality">
          <option value="low" ${s.quality === 'low' ? 'selected' : ''}>Baixa (economiza bateria/GPU)</option>
          <option value="medium" ${s.quality === 'medium' ? 'selected' : ''}>Média (recomendado)</option>
          <option value="high" ${s.quality === 'high' ? 'selected' : ''}>Alta (sombras suaves e maior nitidez)</option>
        </select>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;padding:6px 0;">
        <label class="small"><input type="checkbox" id="cfg-grid" ${s.showGrid ? 'checked' : ''} /> Exibir grade 3D</label>
        <label class="small"><input type="checkbox" id="cfg-focus" ${s.autoFocusSelection ? 'checked' : ''} /> Aproximar câmera ao clicar em osso</label>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;border-top:1px solid var(--border-subtle);padding-top:12px;">
        <button class="btn btn-sm" id="cfg-export">${icon('download', 14)} Exportar progresso (.json)</button>
        <label class="btn btn-sm" style="cursor:pointer;">
          ${icon('upload', 14)} Importar backup (.json)
          <input type="file" id="cfg-import" accept=".json,application/json" class="hidden" />
        </label>
      </div>
      <button class="btn btn-primary" id="cfg-save">${icon('check', 15)} Aplicar configurações</button>
    </div>
  `, {
    onMount: (root, close) => {
      root.querySelector('#cfg-export')?.addEventListener('click', () => {
        const blob = new Blob([exportUserBackup(state.persisted)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `atlas-vet-3d-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Backup exportado.', 'success');
      });

      root.querySelector('#cfg-import')?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
          const text = await file.text();
          const parsed = parseUserBackup(text);
          replacePersisted(parsed);
          applyThemeAndTypography();
          renderHeader();
          showToast('Progresso restaurado com sucesso!', 'success');
          close();
        } catch (err) {
          showToast(err.message || 'Falha ao ler arquivo de backup.', 'error');
        }
      });

      root.querySelector('#cfg-save')?.addEventListener('click', () => {
        updateSettings({
          theme: root.querySelector('#cfg-theme').value,
          fontScale: Number(root.querySelector('#cfg-font').value) || 1,
          quality: root.querySelector('#cfg-quality').value,
          showGrid: root.querySelector('#cfg-grid').checked,
          autoFocusSelection: root.querySelector('#cfg-focus').checked
        });
        applyThemeAndTypography();
        renderHeader();
        showToast('Configurações aplicadas.', 'success');
        close();
      });
    }
  });
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
