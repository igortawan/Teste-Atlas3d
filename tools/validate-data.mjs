// Validador de integridade dos dados anatômicos e referências do ATLAS VET 3D.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data');

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(DATA, rel), 'utf8'));

const refsDoc = readJson('references.json');
const spDoc = readJson('species.json');
const refIds = new Set(refsDoc.references.map((r) => r.id));

let totalBones = 0;
let totalLandmarks = 0;
let totalArticulations = 0;
const errors = [];

for (const sp of spDoc.species) {
  const ost = readJson(`${sp.id}/osteology.json`);
  const reg = readJson(`${sp.id}/skeletalRegions.json`);
  if (!reg.tree || !reg.explosionScopes?.length) errors.push(`${sp.id}: skeletalRegions.json incompleto.`);

  const idSet = new Set(ost.structures.map((b) => b.id));
  if (idSet.size !== ost.structures.length) errors.push(`${sp.id}: IDs duplicados detectados.`);

  for (const b of ost.structures) {
    totalBones++;
    for (const field of ['id', 'species', 'name', 'latinName', 'division', 'region', 'side', 'meshName', 'description', 'location', 'function', 'morphology', 'clinicalImportance']) {
      if (!b[field]) errors.push(`${b.id}: campo obrigatório ausente (${field}).`);
    }
    if (!Array.isArray(b.references) || !b.references.length) {
      errors.push(`${b.id}: sem referências.`);
    } else {
      for (const r of b.references) {
        if (!refIds.has(r)) errors.push(`${b.id}: referência inválida "${r}".`);
      }
    }
    for (const a of b.articulations || []) {
      totalArticulations++;
      if (!idSet.has(a.targetId)) errors.push(`${b.id}: articulação aponta para targetId inexistente "${a.targetId}".`);
    }
    for (const lm of b.landmarks || []) {
      totalLandmarks++;
      if (!lm.id || !lm.name || !lm.location || !lm.function) errors.push(`${b.id}: marco anatômico incompleto.`);
    }
  }
}

if (errors.length) {
  console.error('FALHAS DE VALIDAÇÃO:\n' + errors.slice(0, 20).join('\n'));
  process.exit(1);
}

console.log(`Validação OK: ${spDoc.species.length} espécies | ${totalBones} ossos | ${totalLandmarks} marcos anatômicos | ${totalArticulations} ligações articulares | ${refIds.size} referências.`);
