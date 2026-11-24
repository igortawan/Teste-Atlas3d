/**
 * Gerenciamento de anotações pessoais, comentários e dúvidas vinculadas a cada osso e espécie.
 */
import { state, emit, persistSoon } from './state.js';

export function getNotesForStructure(structureId) {
  return state.persisted.notes[structureId] || [];
}

export function addNote(structureId, species, text, kind = 'note') {
  const clean = (text || '').trim();
  if (!clean) return null;
  if (!state.persisted.notes[structureId]) state.persisted.notes[structureId] = [];
  const entry = {
    id: 'n_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    species,
    kind, // 'note' | 'question'
    text: clean,
    createdAt: new Date().toISOString()
  };
  state.persisted.notes[structureId].unshift(entry);
  persistSoon();
  emit('notes:changed', state.persisted.notes);
  return entry;
}

export function deleteNote(structureId, noteId) {
  const list = state.persisted.notes[structureId];
  if (!list) return;
  state.persisted.notes[structureId] = list.filter((n) => n.id !== noteId);
  if (!state.persisted.notes[structureId].length) delete state.persisted.notes[structureId];
  persistSoon();
  emit('notes:changed', state.persisted.notes);
}

export function getAllNotes() {
  const out = [];
  for (const [structureId, items] of Object.entries(state.persisted.notes)) {
    for (const item of items) out.push({ ...item, structureId });
  }
  return out.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}
