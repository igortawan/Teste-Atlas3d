/**
 * Gerenciamento de estruturas favoritas e listas de revisão personalizadas.
 */
import { state, emit, persistSoon } from './state.js';

export function isFavorite(structureId) {
  return state.persisted.favorites.some((f) => f.id === structureId);
}

export function toggleFavorite(structureId, species) {
  const list = state.persisted.favorites;
  const idx = list.findIndex((f) => f.id === structureId);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.unshift({ id: structureId, species, addedAt: new Date().toISOString() });
  }
  persistSoon();
  emit('favorites:changed', list);
  return idx < 0;
}

export function getFavorites() {
  return state.persisted.favorites;
}

export function getReviewLists() {
  return state.persisted.reviewLists;
}

export function addToReviewList(listId, structureId, species) {
  const list = state.persisted.reviewLists.find((l) => l.id === listId);
  if (!list) return false;
  if (!list.items.some((i) => i.id === structureId)) {
    list.items.push({ id: structureId, species, addedAt: new Date().toISOString() });
    persistSoon();
    emit('favorites:changed', state.persisted.favorites);
  }
  return true;
}

export function removeFromReviewList(listId, structureId) {
  const list = state.persisted.reviewLists.find((l) => l.id === listId);
  if (!list) return;
  list.items = list.items.filter((i) => i.id !== structureId);
  persistSoon();
  emit('favorites:changed', state.persisted.favorites);
}

export function createReviewList(name) {
  const clean = (name || '').trim();
  if (!clean) return null;
  const item = { id: 'rev_' + Date.now(), name: clean, items: [] };
  state.persisted.reviewLists.push(item);
  persistSoon();
  emit('favorites:changed', state.persisted.favorites);
  return item;
}
