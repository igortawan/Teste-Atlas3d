// Gerador determinístico dos arquivos em data/. Uso: node tools/generate-data.mjs
// Lê os catálogos em tools/data-src e escreve species.json, references.json e, por espécie,
// osteology.json e skeletalRegions.json. Rode tools/validate-data.mjs em seguida.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TYPES } from './data-src/catalog.mjs';
import { SPECIES_CFG, EXTRA } from './data-src/speciesOverrides.mjs';
import { AV_TYPES, AV_CFG } from './data-src/avian.mjs';
import { REFERENCES, SPECIES_REFS } from './data-src/references.mjs';
import { SPECIES_INFO, MODULES } from './data-src/speciesInfo.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data');
const write = (rel, obj) => {
  const f = path.join(DATA, rel); fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(obj, null, 1) + '\n', 'utf8');
};

const SIDE_LABEL = { left: 'esquerdo', right: 'direito' };
const FEM = new Set(['maxilla', 'rib', 'scapula', 'ulna', 'patella', 'tibia', 'fibula', 'clavicle', 'phalanges', 'phalanges_pes', 'phalanx_proximal', 'phalanx_middle', 'phalanx_distal', 'wing_digits', 'pedal_digits', 'vert_cervical', 'vert_thoracic', 'vert_lumbar', 'furcula', 'mandible']);
const DISCLAIMER = 'Conteúdo educacional preliminar, redigido a partir de conhecimento anatômico consolidado e das obras listadas em references.json (sem indicação de página). Não substitui a consulta às fontes nem a revisão por um anatomista. Itens marcados como "não verificado" precisam de conferência. Não constitui recomendação clínica.';

const TYPE_TIPS = {
  forame: 'Um forame é uma abertura óssea que dá passagem a vasos e/ou nervos.',
  processo: 'Um processo é uma projeção óssea, em geral local de inserção muscular ou de articulação.',
  crista: 'Uma crista é uma elevação linear do osso, geralmente uma linha de inserção muscular.',
  côndilo: 'Um côndilo é uma saliência articular arredondada.',
  fossa: 'Uma fossa é uma depressão óssea que serve de superfície articular, de inserção ou de alojamento.',
  tubérculo: 'Um tubérculo é uma pequena elevação, geralmente de inserção de músculos ou ligamentos.',
  tuberosidade: 'Uma tuberosidade é uma elevação rugosa onde se inserem músculos ou ligamentos.',
  'faceta articular': 'Faceta articular é uma superfície lisa revestida por cartilagem, onde o osso se articula com outro.',
  sulco: 'Um sulco é um canal longitudinal que acomoda tendão, vaso ou nervo.',
  extremidade: 'Extremidades (epífises) costumam concentrar as superfícies articulares.',
  ângulo: 'Ângulos marcam mudanças de direção do osso e são locais de inserção.',
  arco: 'Arcos formam anéis ou pontes ósseas que protegem estruturas neurais.',
  corpo: 'O corpo é a parte principal do osso.',
  septo: 'Septo é uma lâmina óssea que divide cavidades.',
  face: 'Face é uma superfície do osso, descrita pela sua orientação.',
  ponte: 'Ponte é uma faixa óssea que cobre um tendão ou vaso.',
  espinha: 'Uma espinha é uma crista alta e afilada.'
};

const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const fill = (s, n) => (s == null ? s : s.replaceAll('{n}', String(n)));
const joinTxt = (...p) => p.filter(Boolean).join(' ');

function genderOf(typeKey, name) {
  if (name.startsWith('Ossos')) return 'mp';
  if (name.startsWith('Falanges')) return 'fp';
  return FEM.has(typeKey) ? 'f' : 'm';
}
function withSide(name, typeKey, side) {
  if (side !== 'left' && side !== 'right') return name;
  const g = genderOf(typeKey, name);
  let adj = SIDE_LABEL[side];
  if (g === 'f') adj = adj.replace(/o$/, 'a');
  if (g === 'mp') adj += 's';
  if (g === 'fp') adj = adj.replace(/o$/, 'as');
  const i = name.indexOf(' (');
  return i < 0 ? `${name} ${adj}` : `${name.slice(0, i)} ${adj}${name.slice(i)}`;
}

function buildLandmarks(boneId, boneName, lmList) {
  return lmList.map((m, i) => ({
    id: `${boneId}__${slug(m.name)}`, name: m.name, latinName: m.latin, type: m.type,
    localOffset: m.off, location: m.where, function: m.func, relatedStructures: m.related,
    clinicalImportance: m.clin || 'Sem aplicação clínica específica destacada nesta versão.',
    explanation: joinTxt(`Marco do tipo "${m.type}" em ${boneName}.`, TYPE_TIPS[m.type] || '', m.where)
  }));
}

// ---------- construção de um osso ----------
function makeBone(sp, typeKey, T, O, { n = null, side = 'median', limb = null, ptOverride = null, homologKey, homologRelation = 'equivalent', homologNote = null, regionOverride = null }) {
  O = O || {};
  const idParts = [sp, typeKey]; if (n != null) idParts.push(n); if (limb) idParts.push(limb); if (side !== 'median') idParts.push(side);
  const id = idParts.join('_');
  const baseName = fill(ptOverride || O.pt || T.pt, n);
  const name = withSide(baseName, typeKey, side);
  const region = regionOverride?.region || T.region; const sub = regionOverride?.sub || T.sub;
  const lms = [...T.lm, ...(O.lmAdd || [])];
  const groups = [].concat(regionOverride?.group || T.group);
  const dir = [...T.dir]; if (side === 'left') dir[2] = -Math.abs(dir[2]); if (side === 'right') dir[2] = Math.abs(dir[2]);
  const notVerified = [...(T.unverified || []), ...(O.unverified || [])];
  return {
    id, species: sp, structureType: 'bone', name,
    latinName: fill(O.latin || T.latin, n), popularName: O.popular || T.popular || null,
    division: T.div, region, subregion: sub, side, meshName: id, shapeKey: T.shape, serialIndex: n,
    homologKey, homologRelation, homologNote: homologNote || O.homologNote || null,
    description: joinTxt(T.desc, O.descAdd), location: joinTxt(T.loc, O.locAdd), function: joinTxt(T.func, O.funcAdd),
    morphology: joinTxt(T.morph, O.morphAdd),
    articulations: [],
    landmarks: buildLandmarks(id, name, lms.map((m) => ({ ...m }))),
    clinicalImportance: joinTxt(T.clin, O.clinAdd),
    curiosities: [...(T.curio || []), ...(O.curio || [])],
    speciesComparison: O.cmp || T.cmp || 'Use o módulo Comparar para ver a estrutura correspondente em outra espécie, quando houver equivalência anatômica.',
    notVerified,
    verification: { status: 'preliminar', note: DISCLAIMER },
    references: SPECIES_REFS[sp],
    explosionConfig: { regionGroups: groups, direction: dir, order: n ?? 0 }
  };
}

// ---------- articulações ----------
function linker(bones) {
  const byId = new Map(bones.map((b) => [b.id, b]));
  const exists = (id) => byId.has(id);
  const link = (idA, idB, jointName, jointType) => {
    if (!exists(idA) || !exists(idB)) return false;
    const a = byId.get(idA), b = byId.get(idB);
    if (!a.articulations.some((x) => x.targetId === idB && x.jointName === jointName)) a.articulations.push({ targetId: idB, targetName: b.name, jointName, jointType });
    if (!b.articulations.some((x) => x.targetId === idA && x.jointName === jointName)) b.articulations.push({ targetId: idA, targetName: a.name, jointName, jointType });
    return true;
  };
  return { link, exists };
}

const J = {
  atlantooccipital: ['Articulação atlanto-occipital', 'sinovial condilar (elipsoide)'],
  atlantoaxial: ['Articulação atlantoaxial', 'sinovial trocóidea (pivô)'],
  intervertebral: ['Articulação intervertebral (disco e articulações dos processos articulares)', 'cartilagínea (sínfise) + sinovial plana'],
  lumbosacral: ['Articulação lombossacral', 'cartilagínea (sínfise) + sinovial plana'],
  sacrocaudal: ['Articulação sacrocaudal', 'cartilagínea (sínfise)'],
  tmj: ['Articulação temporomandibular', 'sinovial condilar com disco articular'],
  suture: ['Sutura craniofacial', 'fibrosa (sutura)'],
  costovertebral: ['Articulação costovertebral (cabeça e tubérculo da costela)', 'sinovial plana'],
  sternocostal: ['Articulação esternocostal (por cartilagem costal)', 'cartilagínea/sinovial'],
  sacroiliac: ['Articulação sacroilíaca', 'sinovial plana + sindesmose'],
  pubic: ['Sínfise pélvica', 'cartilagínea (sínfise)'],
  shoulder: ['Articulação do ombro', 'sinovial esferóidea (enartrose)'],
  elbow: ['Articulação do cotovelo', 'sinovial gínglimo (troclear), composta'],
  radioulnar: ['Articulação radioulnar', 'sinovial trocóidea / sinostose (varia conforme a espécie)'],
  carpal: ['Articulação do carpo (antebraquiocarpal)', 'sinovial composta'],
  carpometacarpal: ['Articulação carpometacarpal', 'sinovial plana'],
  mcp: ['Articulação metacarpofalângica (boleto)', 'sinovial gínglimo'],
  pip: ['Articulação interfalângica proximal', 'sinovial gínglimo'],
  dip: ['Articulação interfalângica distal', 'sinovial gínglimo'],
  hip: ['Articulação do quadril (coxofemoral)', 'sinovial esferóidea (enartrose)'],
  patellofemoral: ['Articulação femoropatelar', 'sinovial selar/plana'],
  stifle: ['Articulação femorotibial (joelho)', 'sinovial condilar com meniscos'],
  tibiofibular: ['Articulação tibiofibular', 'sinovial plana / sindesmose'],
  tarsal: ['Articulação do tarso (talocrural)', 'sinovial gínglimo'],
  tarsometatarsal: ['Articulação tarsometatársica', 'sinovial plana'],
  mtp: ['Articulação metatarsofalângica', 'sinovial gínglimo'],
  interosseous: ['União interóssea (sindesmose)', 'fibrosa (sindesmose)'],
  sternocoracoid: ['Articulação esternocoracoide', 'sinovial selar'],
  coracoscapular: ['Articulação coracoescapular', 'sinovial/fibrosa'],
  furcular: ['União fúrcula–coracoide (membrana)', 'fibrosa (sindesmose)'],
  quadratemandibular: ['Articulação quadrado-mandibular', 'sinovial'],
  quadratocranial: ['Articulação quadrado-craniana (cinese)', 'sinovial']
};
const jl = (link, a, b, k) => link(a, b, ...J[k]);

// ---------- mamíferos ----------
function buildMammal(sp) {
  const cfg = SPECIES_CFG[sp];
  const O = cfg.types;
  const bones = [];
  const T = (k) => TYPES[k];
  const add = (typeKey, opts = {}) => bones.push(makeBone(sp, typeKey, T(typeKey), O[typeKey], { homologKey: typeKey, ...opts }));
  const both = (typeKey, opts = {}) => ['left', 'right'].forEach((s) => add(typeKey, { ...opts, side: s }));
  const dropped = new Set(cfg.dropTypes || []);

  add('cranium'); both('maxilla'); add('mandible');
  if (cfg.extras.includes('rostral')) {
    const E = EXTRA.rostral; bones.push(makeBone(sp, 'rostral', E, null, { homologKey: null, homologRelation: 'exclusive', homologNote: E.homologNote }));
  }
  add('atlas', { homologKey: 'atlas' }); add('axis', { homologKey: 'axis' });
  for (let i = 3; i <= 7; i++) add('vert_cervical', { n: i, homologKey: `vert_cervical_${i}`, homologNote: 'Correspondência por posição seriada.' });
  for (let i = 1; i <= cfg.vf.T; i++) add('vert_thoracic', { n: i, homologKey: `vert_thoracic_${i}`, homologNote: 'Correspondência por posição seriada; espécies com mais vértebras têm segmentos sem par numérico.' });
  for (let i = 1; i <= cfg.vf.L; i++) add('vert_lumbar', { n: i, homologKey: `vert_lumbar_${i}`, homologNote: 'Correspondência por posição seriada.' });
  add('sacrum'); add('vert_caudal');
  for (let i = 1; i <= cfg.ribs; i++) both('rib', { n: i, homologKey: `rib_${i}`, homologNote: 'Correspondência por posição seriada.' });
  add('sternum');
  // membro torácico
  both('scapula');
  if (cfg.extras.includes('clavicle')) both('clavicle');
  both('humerus'); both('radius'); both('ulna'); both('carpus'); both('metacarpus');
  // dígitos do membro torácico
  if (!dropped.has('phalanges')) both('phalanges');
  // membro pélvico
  both('coxal'); both('femur'); both('patella'); both('tibia'); both('fibula'); both('tarsus'); both('metatarsus');
  if (!dropped.has('phalanges_pes')) both('phalanges_pes', { homologKey: 'phalanges_pes' });
  // extras por membro (equino)
  for (const ex of cfg.extras) {
    const E = EXTRA[ex]; if (!E || !E.perLimb) continue;
    for (const limb of ['manus', 'pes']) for (const side of ['left', 'right']) {
      const isManus = limb === 'manus';
      const ptOverride = isManus ? E.pt : (E.ptPes || (E.pt.includes('(') ? E.pt.replace(')', ', membro pélvico)') : `${E.pt} (membro pélvico)`));
      const nameFinal = isManus && !E.ptPes ? (E.pt.includes('(') ? E.pt : `${E.pt} (membro torácico)`) : ptOverride;
      const Tx = { ...E, region: isManus ? 'thoracic_limb' : 'pelvic_limb', sub: limb, group: isManus ? 'thoracic_limb' : 'pelvic_limb' };
      bones.push(makeBone(sp, E.key, Tx, null, {
        side, limb, ptOverride: nameFinal, homologKey: E.homolog === 'phalanges' && !isManus ? 'phalanges_pes' : E.homolog,
        homologRelation: E.homolog === 'phalanges' ? 'composite' : (E.homolog === 'splint' || E.homolog === 'navicular' ? 'exclusive' : 'equivalent'),
        homologNote: E.homologNote
      }));
    }
  }
  // tipos nomeados no cfg da espécie que não são "both" geram erro se faltar
  // --- articulações ---
  const { link, exists } = linker(bones);
  const id = (k, n, s, limb) => [sp, k, n, limb, s].filter((x) => x != null).join('_');
  jl(link, id('cranium'), id('atlas'), 'atlantooccipital');
  jl(link, id('atlas'), id('axis'), 'atlantoaxial');
  jl(link, id('axis'), id('vert_cervical', 3), 'intervertebral');
  for (let i = 3; i < 7; i++) jl(link, id('vert_cervical', i), id('vert_cervical', i + 1), 'intervertebral');
  jl(link, id('vert_cervical', 7), id('vert_thoracic', 1), 'intervertebral');
  for (let i = 1; i < cfg.vf.T; i++) jl(link, id('vert_thoracic', i), id('vert_thoracic', i + 1), 'intervertebral');
  jl(link, id('vert_thoracic', cfg.vf.T), id('vert_lumbar', 1), 'intervertebral');
  for (let i = 1; i < cfg.vf.L; i++) jl(link, id('vert_lumbar', i), id('vert_lumbar', i + 1), 'intervertebral');
  jl(link, id('vert_lumbar', cfg.vf.L), id('sacrum'), 'lumbosacral');
  jl(link, id('sacrum'), id('vert_caudal'), 'sacrocaudal');
  jl(link, id('mandible'), id('cranium'), 'tmj');
  for (const s of ['left', 'right']) { jl(link, id('maxilla', null, s), id('cranium'), 'suture'); }
  jl(link, id('maxilla', null, 'left'), id('maxilla', null, 'right'), 'suture');
  if (cfg.extras.includes('rostral')) jl(link, id('rostral'), id('maxilla', null, 'left'), 'suture'), jl(link, id('rostral'), id('maxilla', null, 'right'), 'suture');
  for (const s of ['left', 'right']) {
    for (let i = 1; i <= cfg.ribs; i++) {
      jl(link, id('rib', i, s), id('vert_thoracic', i), 'costovertebral');
      if (i <= cfg.sternalRibs) jl(link, id('rib', i, s), id('sternum'), 'sternocostal');
    }
    jl(link, id('sacrum'), id('coxal', null, s), 'sacroiliac');
    jl(link, id('scapula', null, s), id('humerus', null, s), 'shoulder');
    jl(link, id('humerus', null, s), id('radius', null, s), 'elbow');
    jl(link, id('humerus', null, s), id('ulna', null, s), 'elbow');
    jl(link, id('radius', null, s), id('ulna', null, s), 'radioulnar');
    jl(link, id('radius', null, s), id('carpus', null, s), 'carpal');
    jl(link, id('carpus', null, s), id('metacarpus', null, s), 'carpometacarpal');
    // dígitos torácicos
    if (cfg.distal[0] === 'phalanges') jl(link, id('metacarpus', null, s), id('phalanges', null, s), 'mcp');
    else {
      jl(link, id('metacarpus', null, s), id('phalanx_proximal', null, s, 'manus'), 'mcp');
      jl(link, id('phalanx_proximal', null, s, 'manus'), id('phalanx_middle', null, s, 'manus'), 'pip');
      jl(link, id('phalanx_middle', null, s, 'manus'), id('phalanx_distal', null, s, 'manus'), 'dip');
      jl(link, id('phalanx_middle', null, s, 'manus'), id('navicular', null, s, 'manus'), 'dip');
      jl(link, id('phalanx_distal', null, s, 'manus'), id('navicular', null, s, 'manus'), 'dip');
      jl(link, id('metacarpus', null, s), id('splint_bones', null, s, 'manus'), 'interosseous');
      jl(link, id('carpus', null, s), id('splint_bones', null, s, 'manus'), 'carpometacarpal');
      jl(link, id('metatarsus', null, s), id('splint_bones', null, s, 'pes'), 'interosseous');
      jl(link, id('tarsus', null, s), id('splint_bones', null, s, 'pes'), 'tarsometatarsal');
      jl(link, id('metatarsus', null, s), id('phalanx_proximal', null, s, 'pes'), 'mtp');
      jl(link, id('phalanx_proximal', null, s, 'pes'), id('phalanx_middle', null, s, 'pes'), 'pip');
      jl(link, id('phalanx_middle', null, s, 'pes'), id('phalanx_distal', null, s, 'pes'), 'dip');
      jl(link, id('phalanx_middle', null, s, 'pes'), id('navicular', null, s, 'pes'), 'dip');
      jl(link, id('phalanx_distal', null, s, 'pes'), id('navicular', null, s, 'pes'), 'dip');
    }
    jl(link, id('coxal', null, s), id('femur', null, s), 'hip');
    jl(link, id('femur', null, s), id('patella', null, s), 'patellofemoral');
    jl(link, id('femur', null, s), id('tibia', null, s), 'stifle');
    jl(link, id('femur', null, s), id('fibula', null, s), 'stifle');
    jl(link, id('tibia', null, s), id('fibula', null, s), 'tibiofibular');
    jl(link, id('tibia', null, s), id('tarsus', null, s), 'tarsal');
    jl(link, id('tarsus', null, s), id('metatarsus', null, s), 'tarsometatarsal');
    if (cfg.distal[0] === 'phalanges') jl(link, id('metatarsus', null, s), id('phalanges_pes', null, s), 'mtp');
  }
  jl(link, id('coxal', null, 'left'), id('coxal', null, 'right'), 'pubic');
  return bones;
}

// ---------- aves ----------
function buildAvian() {
  const sp = 'avian';
  const bones = [];
  const refs = { atlas: 'atlas', axis: 'axis' };
  const add = (typeKey, opts = {}) => bones.push(makeBone(sp, typeKey, AV_TYPES[typeKey], null, { homologKey: typeKey, ...opts }));
  const both = (typeKey, opts = {}) => ['left', 'right'].forEach((s) => add(typeKey, { ...opts, side: s }));
  add('cranium'); add('mandible'); both('quadrate', { homologKey: 'quadrate', homologRelation: 'exclusive', homologNote: 'Osso quadrado: sem estrutura homóloga equivalente neste atlas de mamíferos.' });
  add('atlas'); add('axis');
  for (let i = 3; i <= AV_CFG.cervicalCount; i++) add('vert_cervical', { n: i, homologKey: i <= 7 ? `vert_cervical_${i}` : null, homologRelation: i <= 7 ? 'equivalent' : 'exclusive', homologNote: i <= 7 ? 'Correspondência por posição seriada.' : 'Vértebra cervical adicional: mamíferos domésticos têm sete cervicais.' });
  add('vert_thoracic', { n: 1, homologKey: 'vert_thoracic_1', homologNote: 'Correspondência por posição seriada.' });
  add('notarium', { homologKey: null, homologRelation: 'exclusive', homologNote: 'Notário: fusão de vértebras torácicas; não há estrutura equivalente nos mamíferos domésticos.' });
  add('vert_thoracic', { n: 6, homologKey: 'vert_thoracic_6', homologNote: 'Correspondência por posição seriada.' });
  add('synsacrum', { homologKey: 'sacrum', homologRelation: 'composite', homologNote: 'O sinsacro inclui vértebras torácicas, lombares, sacrais e caudais fundidas; não equivale apenas ao sacro dos mamíferos.' });
  add('vert_caudal', { homologKey: 'vert_caudal', homologRelation: 'composite', homologNote: 'Série de vértebras caudais livres; o número difere do dos mamíferos.' });
  add('pygostyle', { homologKey: null, homologRelation: 'exclusive', homologNote: 'Pigóstilo: sem estrutura equivalente nos mamíferos domésticos.' });
  for (let i = 1; i <= AV_CFG.ribs; i++) both('rib', { n: i, homologKey: `rib_${i}`, homologNote: 'Correspondência por posição seriada; as costelas aviárias têm processo uncinado.' });
  add('sternum', { homologKey: 'sternum', homologRelation: 'composite', homologNote: 'O esterno aviário tem carena, sem equivalente nos mamíferos domésticos.' });
  add('furcula', { homologKey: 'clavicle', homologRelation: 'composite', homologNote: 'A fúrcula corresponde às clavículas fundidas; nos mamíferos domésticos a clavícula é ausente ou vestigial.' });
  both('coracoid', { homologKey: 'coracoid', homologRelation: 'exclusive', homologNote: 'Nos mamíferos o coracoide está reduzido a um processo da escápula; não há osso equivalente.' });
  both('scapula'); both('humerus'); both('radius'); both('ulna');
  both('carpometacarpus', { homologKey: 'metacarpus', homologRelation: 'composite', homologNote: 'Resulta da fusão de ossos carpais distais com os metacarpais II–IV.' });
  both('wing_digits', { homologKey: 'phalanges', homologRelation: 'composite', homologNote: 'Dígitos da asa reduzidos; não equivalem diretamente às falanges dos mamíferos.' });
  both('pelvis', { homologKey: 'coxal', homologRelation: 'partial', homologNote: 'Osso coxal fundido ao sinsacro e aberto ventralmente (sem sínfise).' });
  both('femur'); 
  both('tibiotarsus', { homologKey: 'tibia', homologRelation: 'composite', homologNote: 'O tibiotarso inclui a tíbia e a fileira proximal do tarso fundida.' });
  both('fibula');
  both('tarsometatarsus', { homologKey: 'metatarsus', homologRelation: 'composite', homologNote: 'Resulta da fusão de ossos tarsais distais com os metatarsais II–IV.' });
  both('pedal_digits', { homologKey: 'phalanges_pes', homologRelation: 'composite', homologNote: 'Quatro dígitos anisodáctilos.' });

  const { link } = linker(bones);
  const id = (k, n, s) => [sp, k, n, s].filter((x) => x != null).join('_');
  jl(link, id('cranium'), id('atlas'), 'atlantooccipital');
  jl(link, id('atlas'), id('axis'), 'atlantoaxial');
  jl(link, id('axis'), id('vert_cervical', 3), 'intervertebral');
  for (let i = 3; i < AV_CFG.cervicalCount; i++) jl(link, id('vert_cervical', i), id('vert_cervical', i + 1), 'intervertebral');
  jl(link, id('vert_cervical', AV_CFG.cervicalCount), id('vert_thoracic', 1), 'intervertebral');
  jl(link, id('vert_thoracic', 1), id('notarium'), 'intervertebral');
  jl(link, id('notarium'), id('vert_thoracic', 6), 'intervertebral');
  jl(link, id('vert_thoracic', 6), id('synsacrum'), 'intervertebral');
  jl(link, id('synsacrum'), id('vert_caudal'), 'sacrocaudal');
  jl(link, id('vert_caudal'), id('pygostyle'), 'sacrocaudal');
  for (const s of ['left', 'right']) {
    jl(link, id('quadrate', null, s), id('cranium'), 'quadratocranial');
    jl(link, id('quadrate', null, s), id('mandible'), 'quadratemandibular');
    const ribTarget = (i) => (i === 1 ? id('vert_thoracic', 1) : i === 6 ? id('vert_thoracic', 6) : i >= 2 && i <= 5 ? id('notarium') : id('synsacrum'));
    for (let i = 1; i <= AV_CFG.ribs; i++) {
      jl(link, id('rib', i, s), ribTarget(i), 'costovertebral');
      jl(link, id('rib', i, s), id('sternum'), 'sternocostal');
    }
    jl(link, id('coracoid', null, s), id('sternum'), 'sternocoracoid');
    jl(link, id('coracoid', null, s), id('scapula', null, s), 'coracoscapular');
    jl(link, id('coracoid', null, s), id('furcula'), 'furcular');
    jl(link, id('scapula', null, s), id('humerus', null, s), 'shoulder');
    jl(link, id('coracoid', null, s), id('humerus', null, s), 'shoulder');
    jl(link, id('humerus', null, s), id('radius', null, s), 'elbow');
    jl(link, id('humerus', null, s), id('ulna', null, s), 'elbow');
    jl(link, id('radius', null, s), id('ulna', null, s), 'radioulnar');
    jl(link, id('radius', null, s), id('carpometacarpus', null, s), 'carpal');
    jl(link, id('ulna', null, s), id('carpometacarpus', null, s), 'carpal');
    jl(link, id('carpometacarpus', null, s), id('wing_digits', null, s), 'mcp');
    jl(link, id('pelvis', null, s), id('synsacrum'), 'sacroiliac');
    jl(link, id('pelvis', null, s), id('femur', null, s), 'hip');
    jl(link, id('femur', null, s), id('tibiotarsus', null, s), 'stifle');
    jl(link, id('femur', null, s), id('fibula', null, s), 'stifle');
    jl(link, id('tibiotarsus', null, s), id('fibula', null, s), 'tibiofibular');
    jl(link, id('tibiotarsus', null, s), id('tarsometatarsus', null, s), 'tarsal');
    jl(link, id('tarsometatarsus', null, s), id('pedal_digits', null, s), 'mtp');
  }
  return bones;
}

// ---------- árvore regional ----------
const R = {
  axial: ['Esqueleto axial', 'Skeleton axiale'], appendicular: ['Esqueleto apendicular', 'Skeleton appendiculare'],
  skull: ['Crânio', 'Cranium'], cranial_bones: ['Ossos cranianos', 'Ossa cranii'], facial_bones: ['Ossos faciais', 'Ossa faciei'],
  vertebral_column: ['Coluna vertebral', 'Columna vertebralis'], cervical: ['Vértebras cervicais', 'Vertebrae cervicales'], thoracic: ['Vértebras torácicas', 'Vertebrae thoracicae'],
  lumbar: ['Vértebras lombares', 'Vertebrae lumbales'], sacral: ['Sacro', 'Os sacrum'], caudal: ['Vértebras caudais', 'Vertebrae caudales'],
  thoracic_cage: ['Caixa torácica', 'Thorax'], ribs: ['Costelas', 'Costae'], sternum: ['Esterno', 'Sternum'],
  thoracic_limb: ['Membro torácico', 'Membrum thoracicum'], pectoral_girdle: ['Cintura torácica (escapular)', 'Cingulum membri thoracici'], arm: ['Braço', 'Brachium'],
  forearm: ['Antebraço', 'Antebrachium'], manus: ['Mão (carpo, metacarpo e dígitos)', 'Manus'],
  pelvic_limb: ['Membro pélvico', 'Membrum pelvicum'], pelvic_girdle: ['Cintura pélvica', 'Cingulum membri pelvici'], thigh: ['Coxa', 'Femur (regio)'], leg: ['Perna', 'Crus'], pes: ['Pé (tarso, metatarso e dígitos)', 'Pes']
};
const R_AVIAN = { thoracic_limb: ['Asa (membro torácico)', 'Membrum thoracicum (ala)'], sacral: ['Sinsacro', 'Synsacrum'], manus: ['Mão da asa', 'Manus'], caudal: ['Vértebras caudais e pigóstilo', 'Vertebrae caudales et pygostylus'] };

function buildRegions(sp, bones) {
  const labels = { ...R, ...(sp === 'avian' ? R_AVIAN : {}) };
  const node = (id, region, children, leafSub) => ({ id, name: labels[id][0], latinName: labels[id][1], region: region || null, subregion: leafSub || null, children: children || [] });
  const has = (region, sub) => bones.some((b) => b.region === region && b.subregion === sub);
  const leaf = (region, sub) => (has(region, sub) ? [node(sub, region, null, sub)] : []);
  const tree = {
    id: 'skeleton', name: 'Esqueleto', latinName: 'Skeleton', children: [
      { ...node('axial', null, [
        { ...node('skull', 'skull', [...leaf('skull', 'cranial_bones'), ...leaf('skull', 'facial_bones')]) },
        { ...node('vertebral_column', 'vertebral_column', ['cervical', 'thoracic', 'lumbar', 'sacral', 'caudal'].flatMap((s) => leaf('vertebral_column', s))) },
        { ...node('thoracic_cage', 'thoracic_cage', [...leaf('thoracic_cage', 'ribs'), ...leaf('thoracic_cage', 'sternum')]) }
      ]) },
      { ...node('appendicular', null, [
        { ...node('thoracic_limb', 'thoracic_limb', ['pectoral_girdle', 'arm', 'forearm', 'manus'].flatMap((s) => leaf('thoracic_limb', s))) },
        { ...node('pelvic_limb', 'pelvic_limb', ['pelvic_girdle', 'thigh', 'leg', 'pes'].flatMap((s) => leaf('pelvic_limb', s))) }
      ]) }
    ]
  };
  return {
    schemaVersion: 1, species: sp, tree,
    explosionScopes: [
      { id: 'all', name: 'Esqueleto completo' }, { id: 'skull', name: 'Crânio' }, { id: 'vertebral_column', name: 'Coluna vertebral' },
      { id: 'thoracic_cage', name: 'Caixa torácica' }, { id: 'thoracic_limb', name: sp === 'avian' ? 'Asa (membro torácico)' : 'Membro torácico' },
      { id: 'pelvic_limb', name: 'Membro pélvico' }, { id: 'pelvis', name: 'Pelve' }
    ]
  };
}

// ---------- execução ----------
write('references.json', { schemaVersion: 1, disclaimer: 'Somente obras reais. DOI/ISBN não são informados quando não conferidos. Nenhum artigo específico foi catalogado ainda.', references: REFERENCES });
write('species.json', {
  schemaVersion: 1,
  species: SPECIES_INFO.map((s) => ({ ...s, availableSystems: ['osteology', 'comparative'], dataPath: `data/${s.id}/`, modelPath: `models/${s.id}/skeleton.glb` })),
  modules: MODULES, futureSpecies: ['Búfalo', 'Asinino', 'Coelho', 'Animais silvestres']
});
let total = 0;
for (const s of SPECIES_INFO) {
  const bones = s.id === 'avian' ? buildAvian() : buildMammal(s.id);
  // verificação interna: IDs únicos
  const ids = new Set(); for (const b of bones) { if (ids.has(b.id)) throw new Error('ID duplicado: ' + b.id); ids.add(b.id); }
  write(`${s.id}/osteology.json`, { schemaVersion: 1, species: s.id, module: 'osteology', count: bones.length, structures: bones });
  write(`${s.id}/skeletalRegions.json`, buildRegions(s.id, bones));
  console.log(s.id.padEnd(8), bones.length, 'estruturas');
  total += bones.length;
}
console.log('Total:', total);
