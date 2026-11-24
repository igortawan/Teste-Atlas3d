/**
 * Painel direito da Ficha Anatômica Completa: redimensionável, retrátil, com as 8 abas científicas,
 * acidentes ósseos interativos, articulações clicáveis, favoritos, domínio e anotações.
 */
import { icon } from './icons.js';
import { state } from './state.js';
import { getSpeciesMetaSync, getReferencesByIds } from './anatomyDatabase.js';
import { isFavorite, toggleFavorite, getReviewLists, addToReviewList } from './favorites.js';
import { getNotesForStructure, addNote, deleteNote } from './notesManager.js';
import { getStructureMastery, setStructureMastery } from './progressManager.js';

const TABS = [
  { id: 'overview', label: 'Visão geral' },
  { id: 'anatomy', label: 'Anatomia' },
  { id: 'function', label: 'Função' },
  { id: 'articulations', label: 'Articulações' },
  { id: 'clinical', label: 'Aplicação clínica' },
  { id: 'curiosities', label: 'Curiosidades' },
  { id: 'comparison', label: 'Comparação' },
  { id: 'references', label: 'Referências' }
];

const REGION_PT = {
  skull: 'Crânio',
  vertebral_column: 'Coluna vertebral',
  thoracic_cage: 'Caixa torácica',
  thoracic_limb: 'Membro torácico',
  pelvic_limb: 'Membro pélvico'
};

const SIDE_PT = { left: 'Esquerdo', right: 'Direito', median: 'Mediano (ímpar)' };

export class AnatomyPanelUI {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.bone = null;
    this.activeTab = state.activeSheetTab || 'overview';
    this._bindResize();
  }

  setBone(bone) {
    this.bone = bone;
    this.render();
  }

  _bindResize() {
    let dragging = false;
    let startX = 0;
    let startW = 390;

    const onMove = (e) => {
      if (!dragging) return;
      const dx = startX - e.clientX;
      const next = Math.max(300, Math.min(640, startW + dx));
      this.container.style.width = `${next}px`;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    this.container.addEventListener('pointerdown', (e) => {
      if (!e.target.classList.contains('resize-handle')) return;
      dragging = true;
      startX = e.clientX;
      startW = this.container.getBoundingClientRect().width;
      document.body.style.userSelect = 'none';
    });
  }

  render() {
    const bone = this.bone;
    if (!bone) {
      this.container.innerHTML = `
        <div class="resize-handle" title="Arraste para redimensionar"></div>
        <div class="panel-head">
          <h2>${icon('info', 16)} Ficha anatômica</h2>
          <div style="display:flex;gap:4px;">
            <button class="btn btn-ghost btn-icon sheet-expand-mobile-btn" id="sheet-expand-btn" title="Expandir/reduzir ficha" aria-label="Expandir ou reduzir ficha">${icon('chevron-up', 16)}</button>
            <button class="btn btn-ghost btn-icon" id="sheet-collapse-btn" title="Recolher painel">${icon('panel-right', 16)}</button>
          </div>
        </div>
        <div class="sheet-body">
          <div class="info-block">
            <div class="info-label">Nenhuma estrutura selecionada</div>
            <p class="info-text muted">Clique em qualquer osso no modelo 3D ou escolha uma estrutura na árvore anatômica à esquerda para abrir sua ficha científica completa.</p>
          </div>
          <div class="info-block">
            <div class="info-label">Dicas rápidas do laboratório</div>
            <ul class="small muted" style="margin:6px 0 0;padding-left:18px;">
              <li>Arraste com o mouse ou dedo para girar 360°.</li>
              <li>Use a roda do mouse ou pinça para aproximar.</li>
              <li>Use o controle de <strong>Anatomia Explodida</strong> para afastar ossos e regiões.</li>
              <li>Pressione <kbd class="kbd-hint">Ctrl+K</kbd> para pesquisar qualquer osso ou marco.</li>
            </ul>
          </div>
        </div>
      `;
      this.container.querySelector('#sheet-collapse-btn')?.addEventListener('click', () => this.callbacks.onCollapse?.());
      this.container.querySelector('#sheet-expand-btn')?.addEventListener('click', () => this._toggleMobileExpand());
      return;
    }

    const spMeta = getSpeciesMetaSync(bone.species);
    const fav = isFavorite(bone.id);
    const mastery = getStructureMastery(bone.id);
    const isolated = state.isolatedBoneId === bone.id;

    if (state.noLabelsMode) {
      this.container.innerHTML = `
        <div class="resize-handle"></div>
        <div class="panel-head">
          <h2>${icon('eye-off', 16)} Modo sem etiquetas</h2>
          <button class="btn btn-ghost btn-icon" id="sheet-collapse-btn" title="Recolher painel">${icon('panel-right', 16)}</button>
        </div>
        <div class="sheet-body">
          <div class="info-block">
            <div class="info-label">Avaliação prática ativa</div>
            <p class="info-text">Os nomes anatômicos e etiquetas estão ocultos para simular uma prova prática. Desative o <strong>Modo Sem Etiquetas</strong> na barra superior para consultar a ficha completa.</p>
          </div>
          <button class="btn btn-primary" id="sheet-reveal-labels">${icon('eye', 16)} Revelar ficha anatômica</button>
        </div>
      `;
      this.container.querySelector('#sheet-collapse-btn')?.addEventListener('click', () => this.callbacks.onCollapse?.());
      this.container.querySelector('#sheet-reveal-labels')?.addEventListener('click', () => this.callbacks.onToggleNoLabels?.());
      return;
    }

    this.container.innerHTML = `
      <div class="resize-handle" title="Arraste para redimensionar"></div>
      <div class="sheet-header">
        <div class="sheet-title-row">
          <div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:5px;">
              <span class="badge badge-emerald">${spMeta?.name || bone.species}</span>
              <span class="badge badge-cyan">${REGION_PT[bone.region] || bone.region}</span>
              <span class="badge">${SIDE_PT[bone.side] || bone.side}</span>
            </div>
            <h2 class="sheet-title">${this._esc(bone.name)}</h2>
            <div class="sheet-latin">${this._esc(bone.latinName)}</div>
            ${bone.popularName ? `<div class="small muted">Popular: ${this._esc(bone.popularName)}</div>` : ''}
          </div>
          <div style="display:flex;gap:4px;flex-shrink:0;">
            <button class="btn btn-ghost btn-icon sheet-expand-mobile-btn" id="sheet-expand-btn" title="Expandir/reduzir ficha" aria-label="Expandir ou reduzir ficha">${icon('chevron-up', 16)}</button>
            <button class="btn btn-ghost btn-icon" id="sheet-collapse-btn" title="Recolher ficha" aria-label="Recolher ficha anatômica">
              ${icon('panel-right', 16)}
            </button>
          </div>
        </div>

        <div class="sheet-actions">
          <button class="btn btn-sm ${fav ? 'btn-primary' : ''}" id="act-fav" title="Favoritar estrutura">
            ${icon('star', 14)} ${fav ? 'Favorita' : 'Favoritar'}
          </button>
          <button class="btn btn-sm ${mastery === 'mastered' ? 'btn-primary' : ''}" id="act-mastered" title="Marcar como dominada">
            ${icon('circle-check', 14)} ${mastery === 'mastered' ? 'Dominada' : 'Dominar'}
          </button>
          <button class="btn btn-sm ${mastery === 'pending' ? 'badge-amber' : ''}" id="act-pending" title="Marcar para revisar">
            ${icon('flag', 14)} Revisar
          </button>
          <button class="btn btn-sm ${isolated ? 'btn-primary' : ''}" id="act-isolate" title="Isolar osso no 3D">
            ${icon('focus', 14)} ${isolated ? 'Mostrar tudo' : 'Isolar'}
          </button>
          <button class="btn btn-sm" id="act-compare" title="Comparar com outra espécie">
            ${icon('git-compare', 14)} Comparar
          </button>
        </div>
      </div>

      <div class="sheet-tabs" role="tablist">
        ${TABS.map((t) => `<button class="sheet-tab ${this.activeTab === t.id ? 'active' : ''}" role="tab" aria-selected="${this.activeTab === t.id}" data-tab="${t.id}">${t.label}</button>`).join('')}
      </div>

      <div class="sheet-body" id="sheet-tab-content">
        ${this._renderTabContent(bone, spMeta)}
      </div>
    `;

    this._bindEvents(bone);
  }

  _renderTabContent(bone, spMeta) {
    switch (this.activeTab) {
      case 'overview':
        return `
          <div class="info-block">
            <div class="info-label">Descrição geral</div>
            <p class="info-text">${this._esc(bone.description)}</p>
          </div>
          <div class="kv-grid">
            <div class="info-block"><div class="info-label">Espécie</div><div class="small">${this._esc(spMeta?.name || bone.species)}</div></div>
            <div class="info-block"><div class="info-label">Divisão</div><div class="small">${bone.division === 'axial' ? 'Esqueleto axial' : 'Esqueleto apendicular'}</div></div>
            <div class="info-block"><div class="info-label">Região</div><div class="small">${REGION_PT[bone.region] || bone.region}</div></div>
            <div class="info-block"><div class="info-label">Lateralidade</div><div class="small">${SIDE_PT[bone.side] || bone.side}</div></div>
          </div>
          <div class="info-block">
            <div class="info-label">Localização anatômica</div>
            <p class="info-text">${this._esc(bone.location)}</p>
          </div>
          ${bone.notVerified?.length ? `<div class="clinical-warning"><strong>Observação de verificação:</strong><ul style="margin:4px 0 0;padding-left:16px;">${bone.notVerified.map((u) => `<li>${this._esc(u)}</li>`).join('')}</ul></div>` : ''}
        `;

      case 'anatomy':
        return `
          <div class="info-block">
            <div class="info-label">Características morfológicas e acidentes ósseos</div>
            <p class="info-text">${this._esc(bone.morphology)}</p>
          </div>
          <div class="info-label" style="margin-top:4px;">Marcos anatômicos clicáveis (${bone.landmarks?.length || 0})</div>
          ${(bone.landmarks || []).map((lm) => `
            <button class="landmark-card" data-lm="${lm.id}">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                <strong style="font-size:0.86rem;">${this._esc(lm.name)}</strong>
                <span class="badge badge-cyan">${this._esc(lm.type)}</span>
              </div>
              ${lm.latinName ? `<div class="small muted" style="font-style:italic;">${this._esc(lm.latinName)}</div>` : ''}
              <div class="small muted" style="margin-top:4px;">${this._esc(lm.location)}</div>
            </button>
          `).join('')}
        `;

      case 'function':
        return `
          <div class="info-block">
            <div class="info-label">Papel estrutural, biomecânico e fisiológico</div>
            <p class="info-text">${this._esc(bone.function)}</p>
          </div>
          <div class="info-block">
            <div class="info-label">Localização e relação espacial</div>
            <p class="info-text">${this._esc(bone.location)}</p>
          </div>
        `;

      case 'articulations':
        return `
          <div class="info-label">Articulações e ossos relacionados (${bone.articulations?.length || 0})</div>
          ${(bone.articulations || []).map((a) => `
            <button class="landmark-card" data-jump-bone="${a.targetId}">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <strong style="font-size:0.86rem;">${this._esc(a.targetName)}</strong>
                ${icon('arrow-right', 14)}
              </div>
              <div class="small" style="color:var(--accent-emerald);margin-top:2px;">${this._esc(a.jointName)}</div>
              <div class="small muted">${this._esc(a.jointType)}</div>
            </button>
          `).join('') || '<p class="small muted">Sem articulações cadastradas.</p>'}
        `;

      case 'clinical':
        return `
          <div class="clinical-warning">
            <strong>Finalidade educacional:</strong> O conteúdo abaixo aborda relevância anatômica e cirúrgica para estudo; não substitui conduta médica veterinária nem avaliação clínica presencial.
          </div>
          <div class="info-block">
            <div class="info-label">Importância clínica e anatomia aplicada</div>
            <p class="info-text">${this._esc(bone.clinicalImportance)}</p>
          </div>
          ${(bone.landmarks || []).filter((l) => l.clinicalImportance && !l.clinicalImportance.startsWith('Sem aplicação')).map((l) => `
            <div class="info-block">
              <div class="info-label">Marco clínico: ${this._esc(l.name)}</div>
              <p class="info-text small">${this._esc(l.clinicalImportance)}</p>
            </div>
          `).join('')}
        `;

      case 'curiosities':
        return `
          <div class="info-label">Curiosidades e adaptações evolutivas</div>
          ${(bone.curiosities || []).map((c) => `<div class="info-block"><p class="info-text">${this._esc(c)}</p></div>`).join('') || '<p class="small muted">Nenhuma curiosidade cadastrada para esta estrutura.</p>'}
        `;

      case 'comparison':
        return `
          <div class="info-block">
            <div class="info-label">Anatomia comparada entre espécies</div>
            <p class="info-text">${this._esc(bone.speciesComparison)}</p>
          </div>
          ${bone.homologNote ? `<div class="info-block"><div class="info-label">Nota de equivalência anatômica</div><p class="info-text small">${this._esc(bone.homologNote)}</p></div>` : ''}
          <button class="btn btn-primary" id="btn-open-compare">${icon('git-compare', 16)} Abrir no comparador lado a lado</button>
        `;

      case 'references': {
        const refs = getReferencesByIds(bone.references);
        const notes = getNotesForStructure(bone.id);
        const lists = getReviewLists();
        return `
          <div class="info-label">Referências bibliográficas associadas</div>
          ${refs.map((r) => `
            <div class="info-block">
              <strong class="small">${this._esc(r.title)}</strong>
              <div class="small muted">${this._esc((r.authors || []).join('; '))} ${r.year ? `(${r.year})` : ''} — ${this._esc(r.publisher || '')}</div>
              ${r.url ? `<a class="small" href="${this._esc(r.url)}" target="_blank" rel="noopener noreferrer">${this._esc(r.urlLabel || 'Consultar fonte')} ${icon('external-link', 12)}</a>` : ''}
            </div>
          `).join('')}
          <div class="small muted">${this._esc(bone.verification?.note || '')}</div>

          <hr style="border:none;border-top:1px solid var(--border-subtle);width:100%;" />

          <div class="info-label">Lista de revisão</div>
          <div style="display:flex;gap:6px;">
            <select class="select small" id="rev-list-select">
              ${lists.map((l) => `<option value="${l.id}">${this._esc(l.name)} (${l.items.length})</option>`).join('')}
            </select>
            <button class="btn btn-sm" id="btn-add-rev">${icon('plus', 14)} Adicionar</button>
          </div>

          <div class="info-label" style="margin-top:6px;">Anotações e dúvidas do estudante (${notes.length})</div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <select class="select small" id="note-kind">
              <option value="note">Anotação de estudo</option>
              <option value="question">Dúvida para revisar</option>
            </select>
            <textarea class="textarea small" id="note-text" rows="2" placeholder="Registre sua anotação ou dúvida sobre esta estrutura..."></textarea>
            <button class="btn btn-primary btn-sm" id="btn-save-note">${icon('save', 14)} Salvar anotação</button>
          </div>
          <div class="stack-list">
            ${notes.map((n) => `
              <div class="info-block">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:4px;">
                  <span class="badge ${n.kind === 'question' ? 'badge-amber' : 'badge-cyan'}">${n.kind === 'question' ? 'Dúvida' : 'Anotação'}</span>
                  <button class="btn btn-ghost btn-sm" data-del-note="${n.id}" title="Excluir anotação">${icon('trash-2', 13)}</button>
                </div>
                <p class="info-text small">${this._esc(n.text)}</p>
              </div>
            `).join('')}
          </div>
        `;
      }
      default:
        return '';
    }
  }

  _toggleMobileExpand() {
    const expanded = this.container.classList.toggle('expanded-mobile');
    const btn = this.container.querySelector('#sheet-expand-btn');
    if (btn) btn.innerHTML = icon(expanded ? 'chevron-down' : 'chevron-up', 16);
  }

  _bindEvents(bone) {
    this.container.querySelector('#sheet-collapse-btn')?.addEventListener('click', () => this.callbacks.onCollapse?.());
    this.container.querySelector('#sheet-expand-btn')?.addEventListener('click', () => this._toggleMobileExpand());
    this.container.querySelector('#act-fav')?.addEventListener('click', () => {
      toggleFavorite(bone.id, bone.species);
      this.render();
      this.callbacks.onStateChanged?.();
    });
    this.container.querySelector('#act-mastered')?.addEventListener('click', () => {
      const cur = getStructureMastery(bone.id);
      setStructureMastery(bone, cur === 'mastered' ? null : 'mastered');
      this.render();
      this.callbacks.onStateChanged?.();
    });
    this.container.querySelector('#act-pending')?.addEventListener('click', () => {
      const cur = getStructureMastery(bone.id);
      setStructureMastery(bone, cur === 'pending' ? null : 'pending');
      this.render();
      this.callbacks.onStateChanged?.();
    });
    this.container.querySelector('#act-isolate')?.addEventListener('click', () => {
      this.callbacks.onToggleIsolate?.(bone.id);
    });
    this.container.querySelector('#act-compare')?.addEventListener('click', () => {
      this.callbacks.onCompare?.(bone);
    });
    this.container.querySelector('#btn-open-compare')?.addEventListener('click', () => {
      this.callbacks.onCompare?.(bone);
    });

    this.container.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        state.activeSheetTab = this.activeTab;
        this.render();
      });
    });

    this.container.querySelectorAll('[data-lm]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lm = (bone.landmarks || []).find((x) => x.id === btn.dataset.lm);
        if (lm) this.callbacks.onFocusLandmark?.(lm);
      });
    });

    this.container.querySelectorAll('[data-jump-bone]').forEach((btn) => {
      btn.addEventListener('click', () => this.callbacks.onJumpBone?.(btn.dataset.jumpBone));
    });

    this.container.querySelector('#btn-add-rev')?.addEventListener('click', () => {
      const listId = this.container.querySelector('#rev-list-select')?.value;
      if (listId) {
        addToReviewList(listId, bone.id, bone.species);
        this.callbacks.onToast?.('Estrutura adicionada à lista de revisão.', 'success');
      }
    });

    this.container.querySelector('#btn-save-note')?.addEventListener('click', () => {
      const text = this.container.querySelector('#note-text')?.value;
      const kind = this.container.querySelector('#note-kind')?.value || 'note';
      if (addNote(bone.id, bone.species, text, kind)) {
        this.render();
        this.callbacks.onToast?.('Anotação salva localmente.', 'success');
      }
    });

    this.container.querySelectorAll('[data-del-note]').forEach((btn) => {
      btn.addEventListener('click', () => {
        deleteNote(bone.id, btn.dataset.delNote);
        this.render();
      });
    });
  }

  _esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
}
