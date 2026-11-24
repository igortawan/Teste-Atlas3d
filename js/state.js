/**
 * Gerenciador de estado reativo centralizado do ATLAS VET 3D.
 */
import { loadPersistedData, savePersistedData } from './storage.js';

const persisted = loadPersistedData();

const initialState = {
  route: '/dashboard',
  routeParams: {},
  currentSpecies: persisted.lastSession.species || 'bovine',
  selectedBoneId: persisted.lastSession.boneId || null,
  activeSheetTab: 'overview',
  explodedPercent: 0,
  explosionScope: 'all',
  xrayMode: false,
  noLabelsMode: false,
  isolatedBoneId: null,
  hiddenBoneIds: [],
  activeLandmarkId: null,
  persisted
};

const listeners = new Map();
let saveTimer = null;

export const state = initialState;

export function subscribe(event, fn) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(fn);
  return () => listeners.get(event)?.delete(fn);
}

export function emit(event, payload) {
  listeners.get(event)?.forEach((fn) => {
    try { fn(payload, state); } catch (e) { console.error(`[state:${event}]`, e); }
  });
}

export function persistSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    savePersistedData(state.persisted);
  }, 150);
}

export function updateSettings(patch) {
  Object.assign(state.persisted.settings, patch);
  persistSoon();
  emit('settings:changed', state.persisted.settings);
}

export function updateProfile(patch) {
  Object.assign(state.persisted.profile, patch);
  persistSoon();
  emit('profile:changed', state.persisted.profile);
}

export function setCurrentSpecies(speciesId) {
  state.currentSpecies = speciesId;
  state.persisted.lastSession.species = speciesId;
  state.selectedBoneId = null;
  state.isolatedBoneId = null;
  state.hiddenBoneIds = [];
  state.activeLandmarkId = null;
  persistSoon();
  emit('species:changed', speciesId);
}

export function setSelectedBone(boneId, { silent = false } = {}) {
  state.selectedBoneId = boneId;
  state.activeLandmarkId = null;
  if (boneId) {
    state.persisted.lastSession.boneId = boneId;
    persistSoon();
  }
  if (!silent) emit('bone:selected', boneId);
}

export function replacePersisted(newPersisted) {
  state.persisted = newPersisted;
  savePersistedData(state.persisted);
  emit('settings:changed', state.persisted.settings);
  emit('progress:changed', state.persisted.progress);
  emit('favorites:changed', state.persisted.favorites);
  emit('notes:changed', state.persisted.notes);
}
