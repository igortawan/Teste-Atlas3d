/**
 * Árvore Anatômica Interativa (painel esquerdo do Laboratório 3D).
 * Adapta-se à espécie, exibe contadores reais de ossos cadastrados, permite ocultar/exibir regiões no 3D,
 * filtrar por texto/status e sincronizar a seleção com o visualizador 3D.
 */
import { icon } from './icons.js';
import { state } from './state.js';
import { isFavorite } from './favorites.js';
import { getStructureMastery } from './progressManager.js';

export class AnatomyTreeUI {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.regionsData = null;
    this.structures = [];
    this.filterText = '';
    this.statusFilter = 'all'; // 'all' | 'fav' | 'mastered' | 'pending'
    this.expanded = new Set(['skeleton', 'axial', 'appendicular', 'skull', 'thoracic_limb', 'pelvic_limb']);
    this.hiddenRegions = new Set();
  }

  setData(regionsData, structures) {
    this.regionsData = regionsData;
    this.structures = structures || [];
    this.hiddenRegions.clear();
    this.render();
  }

  _matchesFilters(bone) {
    if (this.statusFilter === 'fav' && !isFavorite(bone.id)) return false;
    const mastery = getStructureMastery(bone.id);
    if (this.statusFilter === 'mastered' && mastery !== 'mastered') return false;
    if (this.statusFilter === 'pending' && mastery !== 'pending') return false;
    if (!this.filterText) return true;
    const q = this.filterText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const hay = `${bone.name} ${bone.latinName} ${bone.popularName || ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return hay.includes(q);
  }

  _bonesForNode(node) {
    return this.structures.filter((b) => {
      if (node.id === 'axial') return b.division === 'axial';
      if (node.id === 'appendicular') return b.division === 'appendicular';
      if (node.subregion) return b.region === node.region && b.subregion === node.subregion;
      if (node.region) return b.region === node.region;
      return true;
    });
  }

  render() {
    if (!this.regionsData) {
      this.container.innerHTML = `<div class="panel-head"><h2>${icon('list-tree', 16)} Árvore anatômica</h2></div><div class="small muted" style="padding:14px;">Carregando estrutura...</div>`;
      return;
    }

    const total = this.structures.length;
    const treeHtml = this._renderNode(this.regionsData.tree, 0);

    this.container.innerHTML = `
      <div class="panel-head">
        <h2>${icon('list-tree', 16)} Árvore <span class="badge">${total} ossos</span></h2>
        <button class="btn btn-ghost btn-icon" id="tree-collapse-btn" title="Recolher painel esquerdo" aria-label="Recolher árvore anatômica">
          ${icon('panel-left', 16)}
        </button>
      </div>
      <div class="tree-filters">
        <input class="input" id="tree-filter-input" type="search" placeholder="Filtrar osso ou termo em latim..." value="${this._esc(this.filterText)}" aria-label="Filtrar ossos na árvore" />
        <div class="chip-row" role="group" aria-label="Filtro de status">
          <button class="chip ${this.statusFilter === 'all' ? 'active' : ''}" data-filter="all">Todos</button>
          <button class="chip ${this.statusFilter === 'fav' ? 'active' : ''}" data-filter="fav">Favoritos</button>
          <button class="chip ${this.statusFilter === 'mastered' ? 'active' : ''}" data-filter="mastered">Dominados</button>
          <button class="chip ${this.statusFilter === 'pending' ? 'active' : ''}" data-filter="pending">Revisar</button>
        </div>
      </div>
      <div class="tree-scroll" id="tree-scroll-area">
        ${treeHtml || '<p class="small muted" style="padding:12px;">Nenhuma estrutura encontrada para este filtro.</p>'}
      </div>
    `;

    this._bindEvents();
    this._scrollToSelected();
  }

  _renderNode(node, depth) {
    const allBones = this._bonesForNode(node);
    const visibleBones = allBones.filter((b) => this._matchesFilters(b));
    if (!visibleBones.length && (this.filterText || this.statusFilter !== 'all')) return '';

    const isOpen = this.filterText || this.statusFilter !== 'all' || this.expanded.has(node.id);
    const isHidden = this.hiddenRegions.has(node.id);

    let inner = '';
    if (isOpen) {
      if (node.children?.length) {
        inner = `<div class="tree-children">${node.children.map((ch) => this._renderNode(ch, depth + 1)).join('')}</div>`;
      } else {
        inner = `<div class="tree-children">${visibleBones.map((b) => this._renderLeaf(b)).join('')}</div>`;
      }
    }

    if (depth === 0) return inner;

    return `
      <div class="tree-group" data-node="${node.id}">
        <div class="tree-group-header">
          <button class="tree-toggle" data-toggle="${node.id}" aria-expanded="${isOpen}">
            ${icon(isOpen ? 'chevron-down' : 'chevron-right', 14)}
            <span>${node.name}</span>
            <span class="muted small" style="font-weight:500;">(${visibleBones.length})</span>
          </button>
          <button class="btn btn-ghost btn-sm" style="padding:2px 5px;" data-vis="${node.id}" title="${isHidden ? 'Mostrar região no 3D' : 'Ocultar região no 3D'}" aria-label="${isHidden ? 'Mostrar região' : 'Ocultar região'}">
            ${icon(isHidden ? 'eye-off' : 'eye', 14)}
          </button>
        </div>
        ${inner}
      </div>
    `;
  }

  _renderLeaf(bone) {
    const isSel = state.selectedBoneId === bone.id;
    const fav = isFavorite(bone.id);
    const mastery = getStructureMastery(bone.id);
    const visited = !!state.persisted.progress.visited[bone.id];
    const hidden = state.hiddenBoneIds.includes(bone.id);
    const label = state.noLabelsMode ? 'Estrutura oculta (modo sem etiquetas)' : bone.name;

    return `
      <button class="tree-leaf ${isSel ? 'selected' : ''}" data-bone="${bone.id}" title="${this._esc(label)}">
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${this._esc(label)}</span>
        <span class="tree-leaf-icons">
          ${hidden ? icon('eye-off', 12) : ''}
          ${fav ? `<span style="color:var(--accent-amber);display:inline-flex;">${icon('star', 12)}</span>` : ''}
          ${mastery === 'mastered' ? `<span style="color:var(--accent-emerald);display:inline-flex;" title="Dominado">${icon('circle-check', 12)}</span>` : visited ? `<span style="color:var(--accent-cyan);display:inline-flex;" title="Estudado">${icon('circle-dot', 11)}</span>` : ''}
        </span>
      </button>
    `;
  }

  _bindEvents() {
    this.container.querySelector('#tree-collapse-btn')?.addEventListener('click', () => {
      this.callbacks.onCollapse?.();
    });

    const input = this.container.querySelector('#tree-filter-input');
    input?.addEventListener('input', (e) => {
      this.filterText = e.target.value;
      const caret = e.target.selectionStart;
      this.render();
      const nextInput = this.container.querySelector('#tree-filter-input');
      if (nextInput) {
        nextInput.focus();
        nextInput.setSelectionRange(caret, caret);
      }
    });

    this.container.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.statusFilter = btn.dataset.filter;
        this.render();
      });
    });

    this.container.querySelectorAll('[data-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.toggle;
        if (this.expanded.has(id)) this.expanded.delete(id);
        else this.expanded.add(id);
        this.render();
      });
    });

    this.container.querySelectorAll('[data-vis]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nodeId = btn.dataset.vis;
        const hide = !this.hiddenRegions.has(nodeId);
        if (hide) this.hiddenRegions.add(nodeId);
        else this.hiddenRegions.delete(nodeId);
        const node = this._findNode(this.regionsData.tree, nodeId);
        if (node) {
          const ids = this._bonesForNode(node).map((b) => b.id);
          this.callbacks.onToggleRegionVisibility?.(ids, hide);
        }
        this.render();
      });
    });

    this.container.querySelectorAll('[data-bone]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.callbacks.onSelectBone?.(btn.dataset.bone);
      });
    });
  }

  _findNode(node, id) {
    if (node.id === id) return node;
    for (const ch of node.children || []) {
      const f = this._findNode(ch, id);
      if (f) return f;
    }
    return null;
  }

  expandForBone(bone) {
    if (!bone) return;
    this.expanded.add(bone.division);
    this.expanded.add(bone.region);
    this.expanded.add(bone.subregion);
    this.render();
  }

  _scrollToSelected() {
    if (!state.selectedBoneId) return;
    const el = this.container.querySelector(`[data-bone="${state.selectedBoneId}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }

  _esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
}
