// Particularidades por espécie (mamíferos). Cada entrada complementa o catálogo genérico (catalog.mjs).
// Campos por tipo: descAdd, morphAdd, clinAdd, funcAdd, locAdd, curio[], cmp, lmAdd[], unverified[], pt, latin, popular, homologNote.
// Itens cuja presença/forma NÃO foi conferida em fonte primária vão em `unverified` (exibidos como "não verificado").
import { L } from './catalog.mjs';

const cat = (a, b) => [a, b].filter(Boolean).join(' ');
const mergeTypes = (...objs) => {
  const out = {};
  for (const o of objs) for (const [k, v] of Object.entries(o)) {
    const cur = out[k] || (out[k] = {});
    for (const [f, val] of Object.entries(v)) {
      if (Array.isArray(val)) cur[f] = [...(cur[f] || []), ...val];
      else if (['descAdd', 'morphAdd', 'clinAdd', 'funcAdd', 'locAdd'].includes(f)) cur[f] = cat(cur[f], val);
      else cur[f] = val;
    }
  }
  return out;
};

// ---------- Traços comuns aos ruminantes (bovino, caprino, ovino) ----------
const RUMINANT = {
  cranium: {
    morphAdd: 'Seios frontais amplos que, nos ruminantes com chifres, se estendem aos processos cornuais (osso cornual).',
    clinAdd: 'Em animais adultos, a descorna expõe o seio cornual (extensão do seio frontal), com risco de sinusite.',
    lmAdd: [L('Processo cornual', 'Processus cornualis', 'processo', [0.1, 1, 0.8], 'Projeção do osso frontal, caudolateral à órbita, que sustenta o estojo córneo (chifre).', 'Suporte ósseo do chifre.', ['Osso frontal', 'Seio frontal'], 'Descorna: o osso cornual contém uma extensão do seio frontal.')],
    unverified: ['Presença, forma e tamanho dos chifres variam por raça, sexo e manejo (ex.: animais mochos).']
  },
  maxilla: {
    descAdd: 'Ruminantes não possuem incisivos superiores: o osso incisivo não tem alvéolos e sustenta o coxim dental (pulvino dental), contra o qual atuam os incisivos inferiores. Fórmula dentária permanente: I 0/3, C 0/1 (canino incisiforme), P 3/3, M 3/3.',
    lmAdd: [L('Crista facial', 'Crista facialis', 'crista', [-0.1, 0.1, 1], 'Elevação na face lateral da maxila, sobre os molares.', 'Origem do músculo masseter.', ['Músculo masseter'], null)]
  },
  mandible: { morphAdd: 'Na extremidade rostral há quatro pares de dentes incisiformes (três incisivos e um canino incisiforme) e amplo espaço interdental (diastema).' },
  radius: { descAdd: 'Nos ruminantes, rádio e ulna fundem-se no adulto (sinostose), com pequenos espaços interósseos proximal e distal; não há pronação nem supinação.' },
  ulna: { descAdd: 'Nos ruminantes está fundida ao rádio no adulto (sinostose), com o corpo reduzido; o olécrano permanece pronunciado.' },
  scapula: { unverified: ['Forma e presença do acrômio nesta espécie: não verificadas nesta versão; consultar König & Liebich ou Dyce.'] },
  metacarpus: {
    pt: 'Osso metacarpal III e IV (fundidos)', popular: 'Canela; osso canhão',
    morphAdd: 'Os metacarpais III e IV fundem-se em um único osso longo, com sulco longitudinal dorsal e incisura intertroclear distal. Os demais metacarpais são reduzidos ou ausentes.',
    homologNote: 'Corresponde aos metacarpais III e IV, que aqui formam um osso único (fusão).'
  },
  phalanges: {
    descAdd: 'Os dígitos III e IV são funcionais (falanges proximal, média e distal e sesamoides); os dígitos II e V são acessórios, rudimentares e sem contato com o solo.',
    clinAdd: 'Doenças do casco (ex.: laminite, úlcera de sola, dermatite digital) são causas importantes de claudicação em bovinos leiteiros.'
  },
  fibula: {
    pt: 'Fíbula (vestigial)',
    descAdd: 'Nos ruminantes a porção proximal pode estar fundida ao côndilo lateral da tíbia e a porção distal é representada pelo osso maleolar (os malleolare), unido à tíbia.',
    homologNote: 'Fíbula reduzida; parte distal representada pelo osso maleolar.'
  },
  tarsus: { morphAdd: 'O osso centroquartal resulta da fusão do osso central com o tarsal IV; o tálus apresenta trócleas proximal e distal ("polia dupla"), o que favorece flexão e extensão em um único plano.' },
  metatarsus: { pt: 'Osso metatarsal III e IV (fundidos)', popular: 'Canela; osso canhão', morphAdd: 'Os metatarsais III e IV fundem-se em um osso único com sulco longitudinal dorsal.', homologNote: 'Metatarsais III e IV fundidos.' },
  phalanges_pes: { descAdd: 'Dígitos III e IV funcionais; dígitos II e V rudimentares.' },
  coxal: { lmAdd: [L('Túber sacral', 'Tuber sacrale', 'tuberosidade', [0.7, 1, 0.3], 'Ângulo craniomedial da asa do ílio.', 'Origem de ligamentos sacroilíacos; palpável.', ['Músculos glúteos'], 'Referência palpável ("ponta da garupa").')] },
  femur: { clinAdd: 'Em ruminantes não há terceiro trocânter.' }
};

// ---------- Bovino ----------
const bovine = mergeTypes(RUMINANT, {
  cranium: { descAdd: 'Em bovinos o osso frontal é extenso, forma grande parte do teto craniano e dá origem aos processos cornuais.' },
  rib: { descAdd: 'Em bovinos há 13 pares de costelas (8 esternais e 5 asternais); são largas e achatadas.' },
  coxal: { clinAdd: 'A pelvimetria é usada em novilhas e vacas para avaliar o canal do parto (distocia). O túber coxal e o túber isquiático são referências palpáveis para escore corporal.', curio: ['O túber isquiático ("ponta da nádega") e o túber coxal ("ponta da anca") são pontos clássicos de avaliação do escore de condição corporal em bovinos.'] },
  vert_lumbar: { curio: ['A largura dos processos transversos lombares influencia o formato do lombo, característica avaliada em bovinos de corte.'] },
  sacrum: { descAdd: 'Em bovinos, cinco vértebras sacrais fundem-se.' }
});

// ---------- Caprino / Ovino ----------
const caprine = mergeTypes(RUMINANT, {
  cranium: { descAdd: 'Em caprinos os chifres (processos cornuais) ocorrem na maioria das raças e, em geral, em ambos os sexos; há animais mochos.' },
  metacarpus: { curio: ['Em caprinos os metápodes costumam ser descritos como proporcionalmente delgados em comparação com ovinos (descrição geral; sem medidas verificadas).'], unverified: ['A comparação de esbeltez dos metápodes entre caprinos e ovinos não foi quantificada nesta versão.'] },
  rib: { descAdd: 'Em pequenos ruminantes há 13 pares de costelas (8 esternais e 5 asternais).' },
  sacrum: { descAdd: 'Em pequenos ruminantes, quatro vértebras sacrais fundem-se.' }
});
const ovine = mergeTypes(RUMINANT, {
  cranium: {
    descAdd: 'Em ovinos a presença de chifres varia conforme a raça e o sexo (comum em machos de várias raças).',
    lmAdd: [L('Fossa pré-orbital (lacrimal)', 'Fossa lacrimalis', 'fossa', [0.4, 0.3, 1], 'Depressão na face do osso lacrimal, rostral à órbita.', 'Aloja o seio pré-orbital (glândula pré-orbital) descrito em ovinos.', ['Osso lacrimal', 'Órbita'], null)],
    unverified: ['A fossa pré-orbital (lacrimal) é descrita em ovinos e é ausente em caprinos; a terminologia latina precisa ser conferida na NAV.']
  },
  rib: { descAdd: 'Em pequenos ruminantes há 13 pares de costelas (8 esternais e 5 asternais).' },
  sacrum: { descAdd: 'Em pequenos ruminantes, quatro vértebras sacrais fundem-se.' },
  vert_caudal: { clinAdd: 'A caudectomia em ovinos é discutida do ponto de vista do bem-estar e do número de vértebras caudais mantido.' }
});

// ---------- Equino ----------
const equine = {
  cranium: { descAdd: 'Crânio longo (dolicocéfalo), com seios paranasais extensos.', clinAdd: 'Trepanação dos seios frontal ou maxilar é usada para drenagem em sinusites.' },
  maxilla: {
    descAdd: 'Arcada superior com incisivos, canino (frequentemente ausente em éguas), pré-molares e molares hipsodontes; entre incisivos/caninos e pré-molares existe o espaço interdental (barras), onde repousa o freio.',
    clinAdd: 'A odontologia equina e a estimativa de idade baseiam-se nos dentes; o freio repousa no espaço interdental (barras da boca).',
    lmAdd: [L('Crista facial', 'Crista facialis', 'crista', [-0.1, 0.1, 1], 'Crista proeminente na face lateral da maxila, acima dos molares.', 'Origem do músculo masseter.', ['Músculo masseter'], 'Palpável; referência para localizar seios paranasais e dentes molares.')]
  },
  mandible: { morphAdd: 'O corpo apresenta o espaço interdental (barras) entre incisivos/caninos e pré-molares.' },
  vert_cervical: { clinAdd: 'A estenose do canal vertebral cervical causa a síndrome de Wobbler (ataxia).', curio: ['O ligamento nucal liga o crânio e as vértebras cervicais aos processos espinhosos da cernelha e sustenta passivamente a cabeça.'] },
  vert_thoracic: {
    morphAdd: 'Os processos espinhosos das vértebras torácicas craniais são particularmente altos e formam a base óssea da cernelha.',
    clinAdd: 'A fístula de cernelha (bursite supraespinhosa) acomete os tecidos sobre esses processos; "kissing spines" podem causar dor no dorso.'
  },
  rib: { descAdd: 'Em equinos há 18 pares de costelas (8 esternais e 10 asternais); são mais estreitas e mais arqueadas que as dos bovinos.' },
  sternum: { descAdd: 'Em equinos o esterno é comprimido lateralmente e apresenta crista ventral; a região caudal ao esterno é referência para a cilha.' },
  scapula: {
    descAdd: 'Em equinos, a espinha termina em um tuber da espinha (sem acrômio) e a margem dorsal tem cartilagem escapular espessa.',
    clinAdd: 'A paralisia do nervo supraescapular causa atrofia dos músculos supra e infraespinhoso ("sweeny").',
    lmAdd: [L('Túber da espinha escapular', 'Tuber spinae scapulae', 'tuberosidade', [0.05, -0.25, 1], 'Extremidade distal da espinha.', 'Corresponde ao acrômio nos carnívoros, aqui reduzido a uma tuberosidade.', ['Músculo deltoide'], null)]
  },
  humerus: {
    morphAdd: 'Além dos tubérculos maior e menor, há o tubérculo intermédio, que divide o sulco intertubercular em dois sulcos para o tendão do bíceps braquial.',
    clinAdd: 'Fraturas do úmero podem lesionar o nervo radial, causando incapacidade de apoiar o membro; o aparelho recíproco e de sustentação do membro torácico depende dessa região.'
  },
  radius: { descAdd: 'Em equinos o rádio é o osso principal do antebraço; a ulna é reduzida e fundida ao rádio.' },
  ulna: { descAdd: 'Em equinos o corpo é reduzido e fundido ao rádio; o olécrano é muito desenvolvido.', clinAdd: 'Fraturas do olécrano são relativamente comuns em potros e em equinos adultos após traumas.' },
  carpus: { clinAdd: 'Fraturas em lascas ("chip fractures") dos ossos carpais ocorrem em cavalos atletas.' },
  metacarpus: {
    pt: 'Osso metacarpal III', popular: 'Canela; osso canhão',
    morphAdd: 'É o osso funcional do metacarpo; os metacarpais II e IV são reduzidos (ossos estiloides).',
    clinAdd: 'A "periostite metacárpica dorsal" ("shin buck") é descrita em potros de corrida.',
    homologNote: 'Corresponde ao metacarpal III; II e IV aparecem na estrutura "ossos estiloides".'
  },
  metatarsus: { pt: 'Osso metatarsal III', popular: 'Canela; osso canhão', morphAdd: 'É o osso funcional do metatarso; os metatarsais II e IV são reduzidos.', homologNote: 'Corresponde ao metatarsal III; II e IV aparecem em "ossos estiloides".' },
  coxal: {
    lmAdd: [L('Túber sacral', 'Tuber sacrale', 'tuberosidade', [0.7, 1, 0.3], 'Ângulo craniomedial da asa do ílio.', 'Origem de ligamentos sacroilíacos; palpável.', ['Músculos glúteos'], 'Referência palpável ("ponta da garupa").')],
    curio: ['A "ponta da anca" (túber coxal) e a "ponta da garupa" (túber sacral) são pontos de referência palpáveis na avaliação do exterior do cavalo.']
  },
  femur: {
    morphAdd: 'Possui terceiro trocânter na face lateral da diáfise, exclusivo dos equinos dentre as espécies deste atlas, e lábio medial da tróclea mais elevado.',
    clinAdd: 'O aparelho de sustentação do membro pélvico (fixação da patela) envolve o lábio medial da tróclea; a fixação patelar superior é uma afecção descrita em equinos.',
    lmAdd: [L('Terceiro trocânter', 'Trochanter tertius', 'processo', [0.1, 0.35, 1], 'Projeção lateral da diáfise proximal.', 'Inserção do músculo glúteo superficial.', ['Músculo glúteo superficial'], null)]
  },
  fibula: { pt: 'Fíbula (reduzida)', descAdd: 'Em equinos a fíbula se reduz à cabeça e a um corpo delgado que termina de forma afilada; o maléolo lateral é formado pela tíbia.', homologNote: 'Fíbula reduzida.' },
  tarsus: { morphAdd: 'O tálus tem cristas trocleares oblíquas; o calcâneo forma a ponta do jarrete.', clinAdd: 'O esparavão ósseo (osteoartrite dos ossos tarsais distais) é causa frequente de claudicação pélvica.' }
};

// ---------- Suíno ----------
const swine = {
  cranium: { descAdd: 'Crânio cuneiforme, com crista nucal alta e seios frontais amplos.', clinAdd: 'A espessura dos seios frontais é considerada na insensibilização (aspectos de bem-estar animal), que exige posicionamento adequado do equipamento.' },
  maxilla: { descAdd: 'Os caninos (presas) são grandes e de crescimento contínuo nos machos. Fórmula dentária permanente: I 3/3, C 1/1, P 4/4, M 3/3.' },
  mandible: { clinAdd: 'O corte dos "dentes de agulha" nos leitões é praticado em alguns sistemas de produção, com discussão sobre bem-estar.' },
  rib: { descAdd: 'Em suínos há 14 a 15 pares de costelas (7 esternais).' },
  scapula: { unverified: ['Presença e forma do acrômio em suínos: não verificadas nesta versão.'] },
  radius: { descAdd: 'Em suínos, rádio e ulna são completos e fixos entre si, sem pronação e supinação funcional.' },
  ulna: { descAdd: 'Em suínos a ulna é longa, completa e fixa ao rádio.' },
  metacarpus: { pt: 'Ossos metacarpais II a V', popular: 'Canela', morphAdd: 'Os metacarpais III e IV são os maiores; II e V são menores e completos.', homologNote: 'Agrupa os metacarpais II a V; III e IV são os principais de suporte.' },
  phalanges: { descAdd: 'Membros tetradáctilos: os dígitos III e IV sustentam o peso; II e V são menores e tocam o solo em terrenos moles.' },
  fibula: { descAdd: 'Em suínos a fíbula é completa e delgada.' },
  metatarsus: { pt: 'Ossos metatarsais II a V', morphAdd: 'Os metatarsais III e IV são os maiores; II e V são menores.', homologNote: 'Agrupa os metatarsais II a V.' },
  vert_caudal: { clinAdd: 'A caudectomia em suínos é praticada em alguns sistemas de produção, com discussão sobre bem-estar.' },
  femur: { clinAdd: 'Osteocondrose e problemas de aprumos ("leg weakness") são relevantes em suínos de crescimento rápido.' }
};

// ---------- Canino ----------
const canine = {
  cranium: {
    descAdd: 'Crânio com órbita incompleta lateralmente (fechada pelo ligamento orbital) e bula timpânica proeminente.',
    clinAdd: 'A síndrome braquicefálica obstrutiva é associada a raças de focinho curto.',
    lmAdd: [L('Crista sagital externa', 'Crista sagittalis externa', 'crista', [-0.1, 1, 0], 'Crista mediana dorsal do parietal.', 'Origem dos músculos temporais (mais desenvolvida em cães dolicocéfalos).', ['Músculo temporal'], null)],
    curio: ['Cães apresentam grande variação craniana entre raças: dolicocéfalas, mesocéfalas e braquicéfalas.']
  },
  maxilla: { descAdd: 'Fórmula dentária permanente do cão: I 3/3, C 1/1, P 4/4, M 2/3. O quarto pré-molar superior e o primeiro molar inferior formam os dentes carniceiros.' },
  vert_cervical: { clinAdd: 'Doença do disco intervertebral cervical é comum em raças condrodistróficas.' },
  vert_thoracic: { clinAdd: 'A doença do disco intervertebral toracolombar (Hansen tipo I) é comum em raças condrodistróficas, como o Dachshund.' },
  vert_lumbar: { clinAdd: 'A estenose lombossacra (síndrome da cauda equina) acomete cães de grande porte.' },
  rib: { descAdd: 'Em cães há 13 pares de costelas (9 esternais e 4 asternais).' },
  scapula: {
    descAdd: 'Em cães a espinha termina no acrômio, que possui processo hamato.',
    lmAdd: [L('Acrômio', 'Acromion', 'processo', [0.1, -0.15, 1], 'Extremidade distal da espinha.', 'Inserção de músculos (deltoide, omotransversário).', ['Músculo deltoide'], null)]
  },
  humerus: {
    morphAdd: 'Em cães há forame supratroclear, que comunica a fossa do olécrano com a fossa radial.',
    clinAdd: 'A região do forame supratroclear é zona de fragilidade em fraturas condilares e em casos de ossificação incompleta do côndilo umeral (spaniels).',
    lmAdd: [L('Forame supratroclear', 'Foramen supratrochleare', 'forame', [0, -0.75, 0], 'Entre as fossas do olécrano e radial.', 'Comunicação entre as fossas; zona de menor espessura óssea.', ['Fossa do olécrano', 'Fossa radial'], 'Fraturas condilares em Y/T.')]
  },
  radius: { descAdd: 'Em cães o rádio e a ulna são separados, com pequena pronação/supinação.', clinAdd: 'Fraturas distais de rádio e ulna são frequentes em cães de raças toy.' },
  ulna: { descAdd: 'Em cães a ulna é completa e independente do rádio.', clinAdd: 'Em cães, a displasia do cotovelo (fragmentação do processo coronoide, não união do processo ancôneo) é uma importante causa de claudicação.' },
  carpus: { morphAdd: 'Em cães há sete ossos do carpo: o carporadial resulta da fusão dos ossos radial, intermédio e central (descrição pode variar conforme a fonte).' },
  metacarpus: { pt: 'Ossos metacarpais I a V', popular: 'Dedos da mão; canela', morphAdd: 'Há cinco metacarpais; o primeiro é rudimentar e faz parte do dedo-lobo; os metacarpais III e IV são os maiores.', clinAdd: 'A remoção do dedo-lobo é um procedimento comum em filhotes, com discussão sobre bem-estar.', homologNote: 'Agrupa os metacarpais I a V.' },
  phalanges: { descAdd: 'O dedo I (dedo-lobo) tem duas falanges; II a V têm três. As garras não são retráteis.', lmAdd: [L('Crista unguicular', 'Crista unguicularis', 'crista', [1, 0.2, 0], 'Base da falange distal.', 'Fixa o estojo córneo da garra e protege o leito ungueal.', ['Garra'], 'O corte da unha na região do leito vascular provoca sangramento (quick).')] },
  coxal: { clinAdd: 'A displasia do quadril é um achado frequente em cães de médio e grande porte e envolve o acetábulo.' },
  femur: { morphAdd: 'Duas fabelas (sesamoides do músculo gastrocnêmio) articulam-se com os côndilos femorais posteriores; uma fabela do músculo poplíteo é descrita em carnívoros.', clinAdd: 'A colocefalectomia é opção cirúrgica em cães de pequeno porte; a doença de Legg-Calvé-Perthes acomete raças pequenas.' },
  patella: { clinAdd: 'A luxação medial de patela é muito comum em cães de raças pequenas.' },
  tibia: { clinAdd: 'A ruptura do ligamento cruzado cranial é tratada, entre outras técnicas, pela osteotomia de nivelamento do platô tibial (TPLO) e pelo avanço da tuberosidade tibial (TTA).' },
  fibula: { descAdd: 'Em cães a fíbula é completa e delgada.' },
  metatarsus: { pt: 'Ossos metatarsais II a V', morphAdd: 'Em geral há quatro metatarsais principais (II a V); o primeiro metatarsal é rudimentar ou ausente e, quando presente, forma o dedo-lobo posterior (variável entre raças).', homologNote: 'Agrupa os metatarsais II a V.' },
  phalanges_pes: { descAdd: 'Em geral quatro dedos principais; garras não retráteis.' }
};

// ---------- Felino ----------
const feline = {
  cranium: { descAdd: 'Crânio arredondado com órbitas amplas voltadas para frente; a bula timpânica é dividida por um septo ósseo em duas câmaras.', clinAdd: 'A osteotomia da bula timpânica é indicada em otite média e pólipos de ouvido médio.' },
  maxilla: { descAdd: 'Fórmula dentária permanente do gato: I 3/3, C 1/1, P 3/2, M 1/1.' },
  mandible: { clinAdd: 'A separação traumática da sínfise mandibular é comum após quedas.' },
  vert_caudal: { clinAdd: 'Lesões por tração da cauda ("tail pull") podem lesionar nervos sacrais e caudais, com repercussão sobre função vesical e anal.' },
  rib: { descAdd: 'Em gatos há 13 pares de costelas (9 esternais e 4 asternais).' },
  scapula: { descAdd: 'Em gatos, o acrômio possui processos hamato e suprahamato.', lmAdd: [L('Acrômio', 'Acromion', 'processo', [0.1, -0.15, 1], 'Extremidade distal da espinha.', 'Inserção de músculos (deltoide, omotransversário).', ['Músculo deltoide'], null)] },
  humerus: {
    morphAdd: 'Em gatos há forame supracondilar na face medial da extremidade distal, ausente nos cães; o forame supratroclear não está presente.',
    clinAdd: 'O forame supracondilar não deve ser confundido com lesão óssea em radiografias.',
    lmAdd: [L('Forame supracondilar', 'Foramen supracondylare', 'forame', [-0.2, -0.65, -0.9], 'Acima do epicôndilo medial.', 'Passagem do nervo mediano e da artéria braquial.', ['Nervo mediano', 'Artéria braquial'], 'Referência em radiografias; fraturas supracondilares.')]
  },
  radius: { descAdd: 'Em gatos, rádio e ulna são separados e há maior mobilidade de pronação e supinação que em cães.' },
  ulna: { descAdd: 'Em gatos a ulna é completa e independente do rádio.' },
  metacarpus: { pt: 'Ossos metacarpais I a V', morphAdd: 'Há cinco metacarpais; o primeiro é rudimentar.', homologNote: 'Agrupa os metacarpais I a V.' },
  phalanges: {
    descAdd: 'As garras são retráteis: ligamentos elásticos dorsais mantêm a falange distal retraída sobre a média e o músculo flexor profundo a protrai.',
    clinAdd: 'A onicectomia envolve a amputação da falange distal e é considerada um procedimento de bem-estar controverso (restrito ou proibido em vários países); não é recomendação clínica.',
    lmAdd: [L('Crista unguicular', 'Crista unguicularis', 'crista', [1, 0.2, 0], 'Base da falange distal.', 'Fixa o estojo córneo da garra.', ['Garra'], null)]
  },
  femur: { morphAdd: 'Duas fabelas articulam-se com os côndilos femorais posteriores.', clinAdd: 'A epifisiólise da cabeça do fêmur ocorre em gatos jovens, especialmente machos castrados.' },
  metatarsus: { pt: 'Ossos metatarsais II a V', morphAdd: 'Há quatro metatarsais principais.', homologNote: 'Agrupa os metatarsais II a V.' },
  phalanges_pes: { descAdd: 'Em geral quatro dedos principais; garras retráteis.' }
};

// ---------- Estruturas exclusivas ou específicas (extras) ----------
export const EXTRA = {
  rostral: {
    key: 'rostral', pt: 'Osso rostral', latin: 'Os rostrale', popular: 'Osso do focinho', side: 'median',
    div: 'axial', region: 'skull', sub: 'facial_bones', shape: 'rostral', group: 'skull', dir: [1, 0, 0], homolog: null,
    desc: 'Pequeno osso exclusivo do suíno na ponta do focinho (rostral ao osso incisivo), que sustenta o disco nasal.',
    loc: 'Extremidade rostral da cabeça, diante dos ossos nasais e incisivos.',
    func: 'Sustentar o disco nasal usado para fuçar (exploração do solo).',
    morph: 'Peça óssea curta, em geral única, na extremidade livre do focinho.',
    clin: 'Referência anatômica para cirurgias do focinho e para colocação de argolas nasais, que são praticadas em alguns sistemas de criação extensiva, com discussão sobre bem-estar.',
    curio: ['Estrutura exclusiva do suíno entre as espécies do atlas, adaptada ao hábito de fuçar.'],
    lm: [L('Face rostral', null, 'face', [1, 0, 0], 'Extremidade rostral do osso rostral.', 'Apoia o disco nasal.', ['Disco nasal'], null)],
    homologNote: 'Sem correspondente homólogo nas demais espécies deste atlas.'
  },
  splint: {
    key: 'splint_bones', perLimb: true, pt: 'Ossos metacarpais II e IV (estiloides)', ptPes: 'Ossos metatarsais II e IV (estiloides)', latin: 'Ossa metacarpalia II et IV', popular: 'Ossos do esplinte', side: 'both',
    div: 'appendicular', shape: 'splint_bones', dir: [0, -0.4, 1], homolog: 'splint',
    desc: 'Metapódios II (medial) e IV (lateral) reduzidos, aplicados ao osso metacarpal/metatarsal III.',
    loc: 'Margens medial e lateral do osso metapodial III, unidos a ele por tecido interósseo.',
    func: 'Apoiar a articulação carpal/tarsal e dar suporte ao ligamento suspensório do boleto.',
    morph: 'Hastes estreitas que terminam distalmente em pequena extremidade (botão).',
    clin: 'Os "esplintes" (exostoses por inflamação da união interóssea) e as fraturas por trauma são afecções descritas em cavalos jovens.',
    curio: ['Os ossos estiloides são vestígios de dígitos laterais de ancestrais com mais dedos.'],
    lm: [L('Botão distal', null, 'extremidade', [0, -1, 0], 'Extremidade distal livre.', 'Terminação do osso estiloide.', ['Osso metapodial III'], 'Fraturas do botão distal e esplintes.')],
    homologNote: 'Agrupa os metapódios II e IV; não existem como ossos isolados nas outras espécies.'
  },
  phalanx_proximal: {
    key: 'phalanx_proximal', perLimb: true, pt: 'Falange proximal (osso da quartela)', latin: 'Phalanx proximalis', popular: 'Osso da quartela; primeira falange', side: 'both',
    div: 'appendicular', shape: 'phalanx_proximal', dir: [1, -0.3, 1], homolog: 'phalanges',
    desc: 'Primeira falange do dedo III do equino (osso longo curto).', loc: 'Entre o osso metapodial III e a falange média.',
    func: 'Suportar a carga e transmitir força ao casco; forma, com os sesamoides proximais, a articulação do boleto.',
    morph: 'Base proximal com fóvea articular, corpo achatado e cabeça distal com tróclea para a falange média.',
    clin: 'Fraturas (inclusive em cavalos de corrida) e osteoartrite interfalangeana proximal ("ringbone alto").',
    curio: ['O cavalo apoia o peso sobre um único dedo (dedo III): é monodáctilo e ungulígrado.'],
    lm: [L('Fóvea proximal', 'Fovea articularis proximalis', 'faceta articular', [0, 1, 0], 'Extremidade proximal.', 'Articula-se com o metapódio III.', ['Metapódio III', 'Sesamoides proximais'], 'Artrite do boleto.')],
    homologNote: 'Corresponde à falange proximal; nas demais espécies as falanges aparecem agrupadas.'
  },
  phalanx_middle: {
    key: 'phalanx_middle', perLimb: true, pt: 'Falange média (osso da coroa)', latin: 'Phalanx media', popular: 'Osso da coroa; segunda falange', side: 'both',
    div: 'appendicular', shape: 'phalanx_middle', dir: [1, -0.5, 1], homolog: 'phalanges',
    desc: 'Segunda falange do dedo III do equino.', loc: 'Entre a falange proximal e a distal; parcialmente dentro do casco.',
    func: 'Transmitir a carga da quartela à falange distal; articula-se com o osso navicular.',
    morph: 'Osso curto com extremidade proximal côncava e distal em tróclea.',
    clin: 'Fraturas e osteoartrite da articulação interfalangeana distal ("ringbone baixo").',
    curio: ['Parte desta falange fica oculta no casco, enquanto outra parte é palpável na região da coroa.'],
    lm: [L('Extremidade distal da falange média', 'Extremitas distalis', 'faceta articular', [0, -1, 0], 'Extremidade distal em tróclea.', 'Articula-se com a falange distal e o osso navicular.', ['Falange distal', 'Osso navicular'], null)],
    homologNote: 'Corresponde à falange média; nas demais espécies as falanges aparecem agrupadas.'
  },
  phalanx_distal: {
    key: 'phalanx_distal', perLimb: true, pt: 'Falange distal (osso do casco)', latin: 'Phalanx distalis', popular: 'Osso do casco; terceira falange', side: 'both',
    div: 'appendicular', shape: 'phalanx_distal', dir: [1, -1, 1], homolog: 'phalanges',
    desc: 'Terceira falange do equino, contida no casco, com a forma geral do casco.', loc: 'Dentro do casco.',
    func: 'Suportar o peso e sustentar o casco; ancoragem das lâminas do casco por meio do tecido laminar.',
    morph: 'Osso em forma de cunha com processo extensor, processos palmares e face solear.',
    clin: 'A laminite pode causar rotação ou afundamento da falange distal; fraturas de falange distal; abscessos solares.',
    curio: ['A forma interna do casco acompanha a forma da falange distal.'],
    lm: [
      L('Processo extensor', 'Processus extensorius', 'processo', [0.7, 0.9, 0], 'Projeção dorsoproximal.', 'Inserção do tendão extensor digital comum.', ['Tendão extensor digital comum'], null),
      L('Processo palmar', 'Processus palmaris', 'processo', [-0.9, 0.2, 0.9], 'Projeção caudolateral e caudomedial (asas).', 'Sustenta a cartilagem ungular.', ['Cartilagens ungulares'], 'Fraturas dos processos palmares.'),
      L('Face solear', 'Facies solearis', 'face', [0, -1, 0], 'Face ventral côncava.', 'Apoia a sola do casco.', ['Sola do casco'], 'Rotação/afundamento na laminite.')
    ],
    homologNote: 'Corresponde à falange distal; nas demais espécies as falanges aparecem agrupadas.'
  },
  navicular: {
    key: 'navicular', perLimb: true, pt: 'Osso sesamoide distal (osso navicular)', latin: 'Os sesamoideum distale', popular: 'Osso navicular', side: 'both',
    div: 'appendicular', shape: 'navicular', dir: [-0.5, -1, 1], homolog: 'navicular',
    desc: 'Pequeno osso sesamoide situado atrás da articulação interfalangeana distal, sobre o qual desliza o tendão flexor digital profundo.',
    loc: 'Entre a falange média e a falange distal, na face palmar/plantar, dentro do casco.',
    func: 'Aumentar a alavanca do tendão flexor digital profundo e reduzir o atrito.',
    morph: 'Osso curto transversalmente alongado, com face flexora revestida por cartilagem.',
    clin: 'A síndrome podotroclear ("doença do navicular") é causa importante de claudicação anterior crônica em equinos.',
    curio: ['É um osso exclusivo da região digital do cavalo, sem equivalente anatômico direto nas outras espécies do atlas.'],
    lm: [L('Face flexora', 'Facies flexoria', 'face', [-1, 0, 0], 'Face palmar/plantar.', 'Superfície de deslizamento do tendão flexor digital profundo.', ['Tendão flexor digital profundo'], 'Erosões nesta face estão associadas à síndrome podotroclear.')],
    homologNote: 'Sem correspondente homólogo direto nas demais espécies do atlas.'
  },
  clavicle: { key: 'clavicle', useCatalog: 'clavicle' }
};

// ---------- Configuração por espécie ----------
export const SPECIES_CFG = {
  bovine: {
    vf: { C: 7, T: 13, L: 6, S: 5, Cd: '18–20' }, ribs: 13, sternalRibs: 8, caudalSeries: true,
    types: bovine, extras: [], distal: ['phalanges'], vertNote: ''
  },
  equine: {
    vf: { C: 7, T: 18, L: 6, S: 5, Cd: '15–21' }, ribs: 18, sternalRibs: 8,
    types: equine, extras: ['splint', 'phalanx_proximal', 'phalanx_middle', 'phalanx_distal', 'navicular'],
    distal: ['phalanx_proximal', 'phalanx_middle', 'phalanx_distal'], dropTypes: ['phalanges', 'phalanges_pes']
  },
  caprine: {
    vf: { C: 7, T: 13, L: 6, S: 4, Cd: '12–16' }, ribs: 13, sternalRibs: 8,
    types: caprine, extras: [], distal: ['phalanges'],
    vertNote: 'Variação descrita: 6 a 7 vértebras lombares (modelo com 6).'
  },
  ovine: {
    vf: { C: 7, T: 13, L: 6, S: 4, Cd: '16–18' }, ribs: 13, sternalRibs: 8,
    types: ovine, extras: [], distal: ['phalanges'],
    vertNote: 'Variação descrita: 6 a 7 vértebras lombares (modelo com 6); número de caudais depende da raça.'
  },
  swine: {
    vf: { C: 7, T: 14, L: 6, S: 4, Cd: '20–23' }, ribs: 14, sternalRibs: 7,
    types: swine, extras: ['rostral'], distal: ['phalanges'],
    vertNote: 'Variação descrita: 14 a 15 vértebras torácicas e 6 a 7 lombares (modelo com 14 torácicas e 6 lombares).'
  },
  canine: {
    vf: { C: 7, T: 13, L: 7, S: 3, Cd: '20–23' }, ribs: 13, sternalRibs: 9,
    types: canine, extras: [], distal: ['phalanges']
  },
  feline: {
    vf: { C: 7, T: 13, L: 7, S: 3, Cd: '18–23' }, ribs: 13, sternalRibs: 9,
    types: feline, extras: ['clavicle'], distal: ['phalanges']
  }
};
