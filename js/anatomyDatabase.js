/**
 * Banco de dados anatômico com carregamento sob demanda (lazy loading) por espécie e cache em memória.
 */
const cache = {
  speciesMeta: null,
  references: null,
  osteology: new Map(),
  regions: new Map(),
  manifest: null
};

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao carregar ${url} (HTTP ${res.status})`);
  return res.json();
}

export async function loadCoreMetadata() {
  if (!cache.speciesMeta) {
    const [sp, refs, manifest] = await Promise.all([
      fetchJson('./data/species.json'),
      fetchJson('./data/references.json'),
      fetchJson('./models/manifest.json').catch(() => ({ models: {} }))
    ]);
    cache.speciesMeta = sp;
    cache.references = refs;
    cache.manifest = manifest;
  }
  return {
    species: cache.speciesMeta.species,
    modules: cache.speciesMeta.modules,
    futureSpecies: cache.speciesMeta.futureSpecies || [],
    references: cache.references.references,
    referencesDisclaimer: cache.references.disclaimer,
    manifest: cache.manifest
  };
}

export function getAllSpeciesSync() {
  return cache.speciesMeta?.species || [];
}

export function getSpeciesMetaSync(speciesId) {
  return getAllSpeciesSync().find((s) => s.id === speciesId) || null;
}

export function getModulesSync() {
  return cache.speciesMeta?.modules || [];
}

export function getReferencesByIds(ids = []) {
  const all = cache.references?.references || [];
  const set = new Set(ids);
  return all.filter((r) => set.has(r.id));
}

export function getAllReferencesSync() {
  return cache.references?.references || [];
}

export function getModelManifestForSpecies(speciesId) {
  return cache.manifest?.models?.[speciesId] || null;
}

export async function loadSpeciesOsteology(speciesId) {
  if (!cache.osteology.has(speciesId)) {
    const [ost, reg] = await Promise.all([
      fetchJson(`./data/${speciesId}/osteology.json`),
      fetchJson(`./data/${speciesId}/skeletalRegions.json`)
    ]);
    cache.osteology.set(speciesId, ost);
    cache.regions.set(speciesId, reg);
  }
  return {
    osteology: cache.osteology.get(speciesId),
    regions: cache.regions.get(speciesId)
  };
}

export function getLoadedOsteologySync(speciesId) {
  return cache.osteology.get(speciesId) || null;
}

export function getLoadedRegionsSync(speciesId) {
  return cache.regions.get(speciesId) || null;
}

export function getStructureByIdSync(speciesId, structureId) {
  const ost = cache.osteology.get(speciesId);
  if (!ost) return null;
  return ost.structures.find((s) => s.id === structureId) || null;
}

export async function preloadAllSpecies() {
  const list = getAllSpeciesSync();
  await Promise.all(list.map((s) => loadSpeciesOsteology(s.id)));
}

export function findHomologueInSpecies(sourceBone, targetSpeciesId) {
  if (!sourceBone) return { status: 'none', structure: null, note: 'Nenhuma estrutura selecionada.' };
  const targetOst = cache.osteology.get(targetSpeciesId);
  if (!targetOst) return { status: 'loading', structure: null, note: 'Dados da espécie alvo ainda não carregados.' };

  if (!sourceBone.homologKey) {
    return {
      status: 'exclusive',
      structure: null,
      note: sourceBone.homologNote || 'Esta estrutura não possui equivalente anatômico direto na espécie comparada.'
    };
  }

  // Busca correspondência direta por homologKey e mesma lateralidade (quando bilateral)
  const candidates = targetOst.structures.filter((b) => b.homologKey === sourceBone.homologKey);
  if (!candidates.length) {
    return {
      status: 'absent',
      structure: null,
      note: sourceBone.homologNote || `Sem equivalente direto cadastrado em ${getSpeciesMetaSync(targetSpeciesId)?.name || targetSpeciesId}.`
    };
  }

  const exactSide = candidates.find((b) => b.side === sourceBone.side) || candidates[0];
  const isComposite = sourceBone.homologRelation !== 'equivalent' || exactSide.homologRelation !== 'equivalent';
  return {
    status: isComposite ? 'partial' : 'equivalent',
    structure: exactSide,
    note: exactSide.homologNote || sourceBone.homologNote || (isComposite ? 'Equivalência parcial ou por fusão óssea.' : 'Correspondência anatômica direta.')
  };
}
