/**
 * Motor de Busca Anatômica Global com tolerância a acentos e pequenos erros de digitação (Levenshtein),
 * cobrindo nome em português, latim, nome popular, região, função, articulações, marcos, clínica e espécie.
 */
import { getAllSpeciesSync, getLoadedOsteologySync, preloadAllSpecies } from './anatomyDatabase.js';

const REGION_PT = {
  skull: 'Crânio',
  vertebral_column: 'Coluna vertebral',
  thoracic_cage: 'Caixa torácica',
  thoracic_limb: 'Membro torácico',
  pelvic_limb: 'Membro pélvico'
};

function norm(str) {
  return String(str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function levenshtein(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 99;
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cur = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = cur;
    }
  }
  return dp[b.length];
}

let searchIndex = [];
let indexReady = false;

export async function ensureSearchIndex() {
  if (indexReady) return searchIndex;
  await preloadAllSpecies();
  const speciesList = getAllSpeciesSync();
  const spNames = new Map(speciesList.map((s) => [s.id, s.name]));

  const items = [];
  for (const sp of speciesList) {
    const ost = getLoadedOsteologySync(sp.id);
    if (!ost) continue;
    for (const b of ost.structures) {
      const lmText = (b.landmarks || []).map((l) => `${l.name} ${l.latinName || ''} ${l.clinicalImportance || ''}`).join(' ');
      const artText = (b.articulations || []).map((a) => `${a.targetName} ${a.jointName}`).join(' ');
      const spName = spNames.get(sp.id) || sp.id;
      const full = norm([
        b.name, b.latinName, b.popularName, spName, REGION_PT[b.region],
        b.function, b.clinicalImportance, lmText, artText
      ].join(' '));
      const words = Array.from(new Set(full.split(/[^a-z0-9]+/).filter((w) => w.length >= 4)));
      items.push({
        id: b.id,
        species: sp.id,
        speciesName: spName,
        name: b.name,
        latinName: b.latinName,
        regionName: REGION_PT[b.region] || b.region,
        nameNorm: norm(b.name),
        latinNorm: norm(b.latinName),
        lmNorm: norm(lmText),
        fullNorm: full,
        words
      });
    }
  }
  searchIndex = items;
  indexReady = true;
  return searchIndex;
}

export async function searchAnatomy(query, limit = 14) {
  const q = norm(query);
  if (!q) return [];
  const idx = await ensureSearchIndex();
  const terms = q.split(/\s+/).filter(Boolean);
  const scored = [];

  for (const item of idx) {
    let score = 0;
    let matchedAll = true;
    for (const t of terms) {
      if (item.nameNorm.startsWith(t)) score += 35;
      else if (item.nameNorm.includes(t)) score += 24;
      else if (item.latinNorm.includes(t)) score += 20;
      else if (item.lmNorm.includes(t)) score += 14;
      else if (item.fullNorm.includes(t)) score += 8;
      else if (t.length >= 5 && item.words.some((w) => levenshtein(t, w) <= 2)) score += 6;
      else { matchedAll = false; break; }
    }
    if (matchedAll && score > 0) scored.push({ ...item, score });
  }

  return scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).slice(0, limit);
}
