/**
 * Controle de progresso de estudo, tempo acumulado, domínio de estruturas e revisão inteligente.
 */
import { state, emit, persistSoon } from './state.js';
import { getAllSpeciesSync, getLoadedOsteologySync } from './anatomyDatabase.js';

let studyTickTimer = null;

export function startStudyTimer() {
  if (studyTickTimer) return;
  studyTickTimer = setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    if (['/lab', '/study', '/compare'].includes(state.route)) {
      state.persisted.progress.studySeconds += 5;
      persistSoon();
      emit('studyTime:tick', state.persisted.progress.studySeconds);
    }
  }, 5000);
}

export function formatStudyDuration(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`;
  return `${m} min`;
}

export function recordStructureVisit(bone) {
  if (!bone) return;
  const v = state.persisted.progress.visited;
  const prev = v[bone.id];
  v[bone.id] = {
    species: bone.species,
    region: bone.region,
    name: bone.name,
    count: (prev?.count || 0) + 1,
    lastAt: new Date().toISOString()
  };
  persistSoon();
  emit('progress:changed', state.persisted.progress);
}

export function getStructureMastery(structureId) {
  return state.persisted.progress.mastered[structureId]?.status || null;
}

export function setStructureMastery(bone, status) {
  const m = state.persisted.progress.mastered;
  if (!status) {
    delete m[bone.id];
  } else {
    m[bone.id] = {
      species: bone.species,
      region: bone.region,
      name: bone.name,
      status, // 'mastered' | 'pending'
      updatedAt: new Date().toISOString()
    };
  }
  persistSoon();
  emit('progress:changed', state.persisted.progress);
}

export function recordQuizAnswer(bone, isCorrect) {
  const qs = state.persisted.progress.quizStats;
  qs.totalAnswered += 1;
  if (isCorrect) {
    qs.totalCorrect += 1;
    qs.currentStreak += 1;
    qs.bestStreak = Math.max(qs.bestStreak, qs.currentStreak);
  } else {
    qs.currentStreak = 0;
  }

  if (bone?.region) {
    const reg = qs.byRegion[bone.region] || { attempts: 0, correct: 0 };
    reg.attempts += 1;
    if (isCorrect) reg.correct += 1;
    qs.byRegion[bone.region] = reg;
  }

  if (bone?.id) {
    const st = qs.byStructure[bone.id] || { attempts: 0, wrong: 0, species: bone.species, name: bone.name };
    st.attempts += 1;
    if (!isCorrect) {
      st.wrong += 1;
      st.lastWrongAt = new Date().toISOString();
    }
    qs.byStructure[bone.id] = st;
  }

  persistSoon();
  emit('progress:changed', state.persisted.progress);
}

export function recordStudySession({ species, mode, score, total, durationSec }) {
  state.persisted.progress.sessions.unshift({
    date: new Date().toISOString(),
    species,
    mode,
    score,
    total,
    durationSec: Math.round(durationSec || 0)
  });
  state.persisted.progress.sessions = state.persisted.progress.sessions.slice(0, 40);
  persistSoon();
  emit('progress:changed', state.persisted.progress);
}

export function getSpeciesProgress(speciesId) {
  const ost = getLoadedOsteologySync(speciesId);
  const total = ost ? ost.count : 0;
  const visitedIds = Object.values(state.persisted.progress.visited).filter((x) => x.species === speciesId);
  const masteredIds = Object.values(state.persisted.progress.mastered).filter((x) => x.species === speciesId && x.status === 'mastered');
  const pendingIds = Object.values(state.persisted.progress.mastered).filter((x) => x.species === speciesId && x.status === 'pending');
  const pct = total > 0 ? Math.round((Math.min(total, new Set([...visitedIds.map((_, i) => i), ...masteredIds]).size || visitedIds.length) / total) * 100) : 0;
  const realPct = total > 0 ? Math.min(100, Math.round((visitedIds.length / total) * 100)) : 0;
  return {
    total,
    visited: visitedIds.length,
    mastered: masteredIds.length,
    pending: pendingIds.length,
    percent: realPct || pct
  };
}

export function getOverallProgressSummary() {
  const species = getAllSpeciesSync();
  let totalStructures = 0;
  let totalVisited = 0;
  let totalMastered = 0;
  let totalPending = 0;
  for (const sp of species) {
    const p = getSpeciesProgress(sp.id);
    totalStructures += p.total;
    totalVisited += p.visited;
    totalMastered += p.mastered;
    totalPending += p.pending;
  }
  const percent = totalStructures > 0 ? Math.min(100, Math.round((totalVisited / totalStructures) * 100)) : 0;
  return { totalStructures, totalVisited, totalMastered, totalPending, percent };
}

/**
 * Revisão inteligente baseada em taxa de erro no quiz + marcações "pendente".
 */
export function getSmartReviewRecommendations(speciesId = null, limit = 8) {
  const { mastered, quizStats, visited } = state.persisted.progress;
  const scored = [];
  for (const [id, st] of Object.entries(quizStats.byStructure)) {
    if (speciesId && st.species !== speciesId) continue;
    if (st.wrong > 0) {
      const ratio = st.wrong / Math.max(1, st.attempts);
      scored.push({ id, species: st.species, name: st.name, priority: 100 + st.wrong * 20 + ratio * 50, reason: `${st.wrong} erro(s) em ${st.attempts} tentativa(s)` });
    }
  }
  for (const [id, m] of Object.entries(mastered)) {
    if (speciesId && m.species !== speciesId) continue;
    if (m.status === 'pending' && !scored.some((x) => x.id === id)) {
      scored.push({ id, species: m.species, name: m.name, priority: 80, reason: 'Marcada para revisão' });
    }
  }
  if (!scored.length && speciesId) {
    const ost = getLoadedOsteologySync(speciesId);
    if (ost) {
      for (const b of ost.structures) {
        if (!visited[b.id]) {
          scored.push({ id: b.id, species: b.species, name: b.name, priority: 10, reason: 'Ainda não visitada' });
        }
        if (scored.length >= limit) break;
      }
    }
  }
  return scored.sort((a, b) => b.priority - a.priority).slice(0, limit);
}

export function getRecentStudies(limit = 6) {
  return Object.entries(state.persisted.progress.visited)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => (b.lastAt || '').localeCompare(a.lastAt || ''))
    .slice(0, limit);
}
