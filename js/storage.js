/**
 * Camada de persistência local do ATLAS VET 3D com tratamento contra dados corrompidos,
 * exportação/importação de backup e gancho arquitetural para sincronização futura na nuvem.
 */
const STORAGE_KEY = 'atlas_vet_3d_state_v1';

export function getDefaultPersistedData() {
  return {
    schemaVersion: 1,
    profile: {
      name: 'Estudante de Medicina Veterinária',
      role: 'student', // 'student' | 'professor' (preparado para evolução futura)
      institution: 'Laboratório Virtual',
      goalMinutesPerDay: 30
    },
    settings: {
      theme: 'dark', // 'dark' | 'light'
      fontScale: 1,
      quality: 'medium', // 'low' | 'medium' | 'high'
      showGrid: true,
      showLabels: true,
      showLandmarks: true,
      autoFocusSelection: true
    },
    lastSession: {
      species: 'bovine',
      boneId: null,
      route: '/dashboard'
    },
    favorites: [], // array de { id, species, addedAt }
    reviewLists: [
      { id: 'rev_padrao', name: 'Revisão de Prova Prática', items: [] }
    ],
    notes: {}, // mapa structureId -> [{ id, species, kind: 'note'|'question', text, createdAt }]
    progress: {
      visited: {}, // structureId -> { species, region, count, lastAt }
      mastered: {}, // structureId -> { species, region, status: 'mastered'|'pending', updatedAt }
      studySeconds: 0,
      quizStats: {
        totalAnswered: 0,
        totalCorrect: 0,
        bestStreak: 0,
        currentStreak: 0,
        byRegion: {}, // region -> { attempts, correct }
        byStructure: {} // structureId -> { attempts, wrong, lastWrongAt }
      },
      sessions: [] // [{ date, species, mode, score, total, durationSec }]
    }
  };
}

function deepMergeDefaults(defaults, raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return structuredClone(defaults);
  const out = structuredClone(defaults);
  for (const key of Object.keys(defaults)) {
    if (!(key in raw)) continue;
    const defVal = defaults[key];
    const rawVal = raw[key];
    if (Array.isArray(defVal)) {
      out[key] = Array.isArray(rawVal) ? rawVal : defVal;
    } else if (defVal && typeof defVal === 'object') {
      out[key] = deepMergeDefaults(defVal, rawVal);
    } else if (typeof rawVal === typeof defVal || rawVal === null) {
      out[key] = rawVal;
    }
  }
  return out;
}

export function loadPersistedData() {
  const defaults = getDefaultPersistedData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return deepMergeDefaults(defaults, parsed);
  } catch (err) {
    console.warn('[ATLAS VET 3D] Dados locais corrompidos; restaurando padrões seguros.', err);
    try {
      localStorage.setItem(`${STORAGE_KEY}_corrupted_backup`, localStorage.getItem(STORAGE_KEY) || '');
    } catch { /* ignora falha de cota */ }
    return defaults;
  }
}

export function savePersistedData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('[ATLAS VET 3D] Erro ao gravar no armazenamento local:', err);
    return false;
  }
}

export function exportUserBackup(data) {
  const payload = {
    app: 'ATLAS VET 3D',
    exportedAt: new Date().toISOString(),
    data
  };
  return JSON.stringify(payload, null, 2);
}

export function parseUserBackup(jsonText) {
  const parsed = JSON.parse(jsonText);
  const candidate = parsed?.data && typeof parsed.data === 'object' ? parsed.data : parsed;
  if (!candidate || typeof candidate !== 'object' || !candidate.progress) {
    throw new Error('Arquivo de backup inválido ou incompatível com o ATLAS VET 3D.');
  }
  return deepMergeDefaults(getDefaultPersistedData(), candidate);
}

/**
 * Adaptador preparado para sincronização remota futura (sem simulação ativa na v1 local).
 */
export const cloudSyncAdapter = {
  enabled: false,
  statusLabel: 'Armazenamento local ativo (sincronização na nuvem planejada para versão futura)',
  async syncNow() {
    return { synced: false, reason: 'Sincronização remota não configurada nesta versão local.' };
  }
};
