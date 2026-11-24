// Catálogo anatômico GENÉRICO dos mamíferos domésticos (texto-base comum a todas as espécies de mamíferos).
// As particularidades de cada espécie ficam em speciesOverrides.mjs.
// Convenção do quadro anatômico canônico (usado pelos marcos): X = cranial/rostral, Y = dorsal ou proximal,
// Z = lateral (positivo). Os deslocamentos dos marcos são normalizados para a caixa delimitadora do osso ([-1, 1]).
// Terminologia latina: Nomina Anatomica Veterinaria (NAV). Conteúdo educacional; não substitui as obras-fonte.

export const L = (name, latin, type, off, where, func, related = [], clin = null) =>
  ({ name, latin, type, off, where, func, related, clin });

export const TYPES = {
  cranium: {
    pt: 'Crânio (neurocrânio)', latin: 'Cranium (ossa cranii)', popular: 'Caixa craniana', side: 'median',
    div: 'axial', region: 'skull', sub: 'cranial_bones', shape: 'cranium', group: 'skull', dir: [0.7, 0.5, 0],
    desc: 'Conjunto de ossos planos que envolve e protege o encéfalo (occipital, esfenoide, parietal, interparietal, frontal, temporal e etmoide). Nesta versão é representado como uma única peça didática, pois os ossos se unem por suturas.',
    loc: 'Porção caudodorsal da cabeça. Articula-se caudalmente com o atlas pelos côndilos occipitais e rostralmente com os ossos da face.',
    func: 'Proteger o encéfalo e as estruturas da orelha interna; fornecer áreas de inserção para músculos mastigatórios e cervicais; sustentar a articulação atlanto-occipital.',
    morph: 'Ossos planos unidos por suturas. Caudalmente destacam-se o forame magno e os côndilos occipitais; lateralmente, a fossa temporal e o processo zigomático do temporal; ventralmente, a bula timpânica.',
    clin: 'Referência em radiografia e tomografia da cabeça; fraturas e traumas cranianos; a punção da cisterna magna (coleta de líquor) é feita entre o occipital e o atlas.',
    curio: ['O formato do crânio varia amplamente entre espécies e raças; em cães e gatos fala-se em crânios dolicocéfalos, mesocéfalos e braquicéfalos.', 'Os seios paranasais (frontal, maxilar, entre outros) são muito mais desenvolvidos em bovinos e equinos que em carnívoros.'],
    lm: [
      L('Forame magno', 'Foramen magnum', 'forame', [-1, -0.1, 0], 'Abertura na face caudal do occipital, entre os côndilos occipitais.', 'Passagem da junção entre o bulbo (medula oblonga) e a medula espinhal.', ['Atlas', 'Côndilos occipitais', 'Medula espinhal'], 'Malformações da junção craniocervical (ex.: malformação tipo Chiari em cães de raças pequenas) envolvem esta região.'),
      L('Côndilo occipital', 'Condylus occipitalis', 'côndilo', [-0.95, -0.45, 0.35], 'Dois côndilos convexos ventrolaterais ao forame magno.', 'Articulam-se com o atlas e permitem flexão e extensão da cabeça (movimento de "sim").', ['Atlas (fóveas articulares craniais)'], 'Luxações e malformações atlanto-occipitais afetam esta articulação.'),
      L('Processo paracondilar', 'Processus paracondylaris', 'processo', [-0.85, -0.85, 0.45], 'Projeção ventral situada lateralmente ao côndilo occipital.', 'Área de inserção de músculos que movem a cabeça e a mandíbula.', ['Côndilo occipital', 'Bula timpânica'], null),
      L('Processo zigomático do temporal', 'Processus zygomaticus ossis temporalis', 'processo', [0, -0.1, 1], 'Projeção lateral do temporal que, com o osso zigomático, forma o arco zigomático.', 'Origem do músculo masseter e articulação (fossa mandibular) com a mandíbula.', ['Osso zigomático', 'Mandíbula (articulação temporomandibular)'], 'O arco zigomático é palpável e pode fraturar em traumas faciais.')
    ]
  },
  maxilla: {
    pt: 'Maxila (face superior)', latin: 'Maxilla (com os ossos incisivo e nasal associados)', popular: 'Maxilar superior', side: 'both',
    div: 'axial', region: 'skull', sub: 'facial_bones', shape: 'maxilla', group: 'skull', dir: [1, 0.2, 0.4],
    desc: 'Osso principal da face superior; sustenta os dentes superiores, forma parte do palato duro, da cavidade nasal e da órbita. Nesta versão o osso incisivo (pré-maxila) e os nasais estão agrupados à representação da maxila.',
    loc: 'Face lateral e rostral da cabeça, ventral à órbita e à cavidade nasal. Articula-se com o osso zigomático, o lacrimal, o palatino, o frontal e o osso homólogo contralateral.',
    func: 'Suportar dentes e delimitar as vias respiratórias superiores; contribuir com a mastigação ao oferecer a arcada dental superior.',
    morph: 'Possui processo alveolar (alvéolos dentários), processo palatino (palato duro), forame infraorbitário na face lateral e um seio maxilar em muitas espécies.',
    clin: 'Fraturas maxilares e faciais; infecção periapical dos dentes superiores pode atingir o seio maxilar; o forame infraorbitário é referência para bloqueio anestésico do nervo infraorbitário.',
    curio: ['O número e o tipo de dentes superiores variam muito: ruminantes não têm incisivos superiores, enquanto o cavalo possui incisivos, caninos (frequentemente ausentes em éguas) e pré-molares/molares hipsodontes.'],
    lm: [
      L('Forame infraorbitário', 'Foramen infraorbitale', 'forame', [0.45, 0.2, 1], 'Abertura na face lateral da maxila, rostral à órbita.', 'Passagem do nervo e dos vasos infraorbitários, que suprem lábio superior e focinho.', ['Nervo maxilar', 'Canal infraorbitário'], 'Local de bloqueio anestésico regional do nervo infraorbitário (a técnica e o acesso variam por espécie).'),
      L('Processo alveolar', 'Processus alveolaris', 'processo', [0, -1, 0.6], 'Borda ventral da maxila que aloja os alvéolos dentários.', 'Fixação dos dentes (articulação dento-alveolar, gonfose).', ['Dentes superiores'], 'Doença periodontal e extrações dentárias envolvem este processo.')
    ]
  },
  mandible: {
    pt: 'Mandíbula', latin: 'Mandibula', popular: 'Maxilar inferior', side: 'median',
    div: 'axial', region: 'skull', sub: 'facial_bones', shape: 'mandible', group: 'skull', dir: [0.6, -1, 0],
    desc: 'Único osso móvel da cabeça (hemimandíbulas direita e esquerda unidas rostralmente). Nesta versão é representada como uma peça mediana.',
    loc: 'Parte inferior da cabeça; articula-se com a fossa mandibular do temporal pela articulação temporomandibular.',
    func: 'Sustentar os dentes inferiores e realizar os movimentos da mastigação; inserção do masseter, temporal e pterigóideos.',
    morph: 'Cada hemimandíbula tem corpo (parte alveolar) e ramo; o ramo apresenta processo coronoide, processo condilar e ângulo da mandíbula. Forames mentual (face lateral) e mandibular (face medial).',
    clin: 'Fraturas e luxações da articulação temporomandibular; em cães e gatos a sínfise mandibular pode se separar em traumas; bloqueio anestésico do nervo alveolar inferior no forame mandibular/mentual.',
    curio: ['Em carnívoros as hemimandíbulas são unidas por sínfise fibrocartilagínea, o que permite pequena mobilidade entre elas.'],
    lm: [
      L('Processo coronoide', 'Processus coronoideus', 'processo', [-0.2, 1, 0], 'Projeção dorsal do ramo, rostral ao processo condilar.', 'Inserção do músculo temporal.', ['Músculo temporal', 'Arco zigomático'], null),
      L('Processo condilar', 'Processus condylaris', 'côndilo', [-0.6, 0.85, 0.2], 'Extremidade dorsocaudal do ramo.', 'Articula-se com o temporal (articulação temporomandibular).', ['Fossa mandibular do temporal', 'Disco articular'], 'Luxações e fraturas do côndilo causam má oclusão e dor ao mastigar.'),
      L('Ângulo da mandíbula', 'Angulus mandibulae', 'ângulo', [-1, -0.6, 0.5], 'Borda caudoventral do ramo.', 'Inserção do masseter e do pterigóideo medial.', ['Músculo masseter'], null),
      L('Forame mentual', 'Foramen mentale', 'forame', [0.8, 0, 1], 'Face lateral do corpo, próximo à porção rostral.', 'Saída do nervo e vasos mentuais.', ['Nervo alveolar inferior'], 'Referência para bloqueio anestésico do nervo mentual.')
    ]
  },
  atlas: {
    pt: 'Atlas (C1)', latin: 'Atlas (vértebra cervical I)', popular: 'Primeira vértebra cervical', side: 'median',
    div: 'axial', region: 'vertebral_column', sub: 'cervical', shape: 'atlas', group: 'vertebral_column', dir: [0.8, 0.3, 0],
    desc: 'Primeira vértebra cervical, em forma de anel, sem corpo vertebral típico nem processo espinhoso.',
    loc: 'Entre o crânio e o áxis (C2).',
    func: 'Sustentar o crânio e permitir os movimentos de flexão-extensão (articulação atlanto-occipital) em conjunto com o áxis.',
    morph: 'Arco dorsal e arco ventral, massas laterais com fóveas articulares craniais (para os côndilos occipitais) e caudais (para o áxis), e asas (processos transversos) bem desenvolvidas.',
    clin: 'Referência palpável lateralmente na região da nuca; malformações e luxações atlantoaxiais e atlanto-occipitais; local de acesso para punção da cisterna magna.',
    curio: ['O nome vem de Atlas, titã da mitologia grega que sustentava o céu, em alusão ao suporte do crânio.'],
    lm: [
      L('Asa do atlas', 'Ala atlantis', 'processo', [0, 0, 1], 'Processo transverso expandido lateralmente.', 'Inserção de músculos que movem a cabeça e o pescoço.', ['Crânio'], 'Palpável; referência para identificar a transição craniocervical.'),
      L('Fóvea articular cranial', 'Fovea articularis cranialis', 'faceta articular', [1, -0.2, 0.5], 'Faces côncavas cranioventrais das massas laterais.', 'Recebem os côndilos occipitais (articulação atlanto-occipital).', ['Côndilo occipital'], null),
      L('Arco dorsal', 'Arcus dorsalis', 'arco', [0, 1, 0], 'Teto do forame vertebral do atlas.', 'Protege a medula espinhal na junção craniocervical.', ['Medula espinhal'], null)
    ]
  },
  axis: {
    pt: 'Áxis (C2)', latin: 'Axis (vértebra cervical II)', popular: 'Segunda vértebra cervical', side: 'median',
    div: 'axial', region: 'vertebral_column', sub: 'cervical', shape: 'axis', group: 'vertebral_column', dir: [0.6, 0.4, 0],
    desc: 'Segunda vértebra cervical, identificada pelo dente (processo odontoide) e pela crista espinhosa alta.',
    loc: 'Entre o atlas (C1) e a terceira vértebra cervical (C3).',
    func: 'Servir de pivô para a rotação da cabeça (movimento de "não") por meio do dente que se encaixa no atlas.',
    morph: 'Corpo alongado com o dente cranial, processo espinhoso em crista, processos transversos curtos com forame transverso e processos articulares caudais.',
    clin: 'Instabilidade atlantoaxial por anomalias ou fraturas do dente é descrita sobretudo em cães de raças pequenas; fraturas do áxis têm risco neurológico.',
    curio: ['O ligamento transverso do atlas mantém o dente junto ao arco ventral do atlas.'],
    lm: [
      L('Dente do áxis', 'Dens axis', 'processo', [1, 0.1, 0], 'Projeção cranial do corpo vertebral.', 'Pivô da articulação atlantoaxial; permite rotação da cabeça.', ['Atlas', 'Ligamento transverso do atlas'], 'Instabilidade atlantoaxial (agenesia/hipoplasia ou fratura do dente).'),
      L('Processo espinhoso do áxis', 'Processus spinosus', 'crista', [0, 1, 0], 'Crista dorsal larga e alta.', 'Inserção de músculos e ligamentos cervicais.', ['Músculos cervicais', 'Ligamento nucal'], null),
      L('Forame transverso', 'Foramen transversarium', 'forame', [-0.4, -0.2, 1], 'Atravessa o processo transverso.', 'Passagem da artéria e veia vertebrais.', ['Artéria vertebral'], null)
    ]
  },
  vert_cervical: {
    pt: 'Vértebra cervical {n} (C{n})', latin: 'Vertebra cervicalis {n}', popular: 'Vértebra do pescoço', side: 'median', serial: true,
    div: 'axial', region: 'vertebral_column', sub: 'cervical', shape: 'vert_cervical', group: 'vertebral_column', dir: [0.9, 0.4, 0],
    desc: 'Vértebra cervical típica (C3 a C7): corpo alongado, arco vertebral e processos transversos com forame transverso (nas vértebras anteriores).',
    loc: 'Região do pescoço, entre o áxis e a primeira vértebra torácica.',
    func: 'Sustentar e dar mobilidade ao pescoço e à cabeça; proteger a medula espinhal; abrigar a artéria vertebral nos forames transversos.',
    morph: 'Corpo com cabeça convexa cranial e fossa côncava caudal; processos articulares cranial e caudal bem desenvolvidos; processos espinhoso e transversos de tamanho variável. A sétima cervical geralmente não tem forame transverso e possui fóveas costais caudais.',
    clin: 'Doenças do disco e instabilidade cervical (ex.: síndrome de Wobbler em cães e equinos); fraturas cervicais com lesão medular; acesso para injeção intramuscular e para coleta de sangue (veia jugular) é feito nesta região em tecidos moles.',
    curio: ['Quase todos os mamíferos têm sete vértebras cervicais, mesmo girafas e baleias; exceções incluem preguiças e peixes-boi.'],
    lm: [
      L('Processo espinhoso', 'Processus spinosus', 'processo', [0, 1, 0], 'Projeção dorsal do arco vertebral.', 'Inserção de músculos e ligamentos (ex.: ligamento nucal).', ['Ligamento nucal'], null),
      L('Processo transverso', 'Processus transversus', 'processo', [0, -0.1, 1], 'Projeção lateral do arco/corpo.', 'Inserção muscular e proteção da artéria vertebral (forame transverso).', ['Artéria vertebral'], null),
      L('Processo articular cranial', 'Processus articularis cranialis', 'faceta articular', [0.75, 0.5, 0.6], 'Projeção dorsocranial do arco.', 'Articula-se com a vértebra precedente (articulação interapofisária).', ['Vértebra cranial'], null),
      L('Cabeça do corpo vertebral', 'Caput vertebrae', 'extremidade', [1, -0.2, 0], 'Extremidade cranial convexa do corpo.', 'Encaixa-se na fossa da vértebra anterior, formando a articulação do disco intervertebral.', ['Disco intervertebral'], null)
    ]
  },
  vert_thoracic: {
    pt: 'Vértebra torácica {n} (T{n})', latin: 'Vertebra thoracica {n}', popular: 'Vértebra do dorso', side: 'median', serial: true,
    div: 'axial', region: 'vertebral_column', sub: 'thoracic', shape: 'vert_thoracic', group: 'vertebral_column', dir: [0, 1, 0],
    desc: 'Vértebra torácica típica, que se articula com um par de costelas.',
    loc: 'Região do tórax, entre as vértebras cervicais e lombares.',
    func: 'Formar o teto da caixa torácica, suportar as costelas e proteger a medula espinhal; os processos espinhosos fornecem inserção para músculos e ligamentos do dorso.',
    morph: 'Corpo curto, processo espinhoso alto (mais alto cranialmente), fóveas costais cranial e caudal no corpo e fóvea costal no processo transverso para o tubérculo da costela.',
    clin: 'Doenças discais e fraturas toracolombares com compressão medular; em equinos, processos espinhosos próximos entre si podem sofrer contato ("kissing spines").',
    curio: ['A inclinação dos processos espinhosos muda ao longo do dorso: cranialmente apontam para trás e caudalmente para frente; a vértebra de inclinação neutra é chamada de anticlinal.'],
    lm: [
      L('Processo espinhoso', 'Processus spinosus', 'processo', [0, 1, 0], 'Projeção dorsal.', 'Inserção de músculos e ligamentos supraespinhoso e nucal (nas cranial).', ['Ligamento supraespinhoso'], null),
      L('Fóvea costal', 'Fovea costalis', 'faceta articular', [0.6, 0.1, 0.5], 'Margem do corpo vertebral.', 'Articulação com a cabeça da costela.', ['Costela correspondente'], null),
      L('Processo transverso', 'Processus transversus', 'processo', [0, 0.2, 1], 'Projeção lateral do arco.', 'Articula-se com o tubérculo da costela (fóvea costal transversal).', ['Tubérculo da costela'], null)
    ]
  },
  vert_lumbar: {
    pt: 'Vértebra lombar {n} (L{n})', latin: 'Vertebra lumbalis {n}', popular: 'Vértebra do lombo', side: 'median', serial: true,
    div: 'axial', region: 'vertebral_column', sub: 'lumbar', shape: 'vert_lumbar', group: 'vertebral_column', dir: [0, 1, 0],
    desc: 'Vértebra lombar típica, sem costelas articuladas, com processos transversos longos.',
    loc: 'Região do lombo, entre as vértebras torácicas e o sacro.',
    func: 'Sustentar o tronco, permitir flexão-extensão e flexão lateral do dorso e transmitir a força dos membros pélvicos à coluna.',
    morph: 'Corpo longo, processo espinhoso curto a médio, processos transversos (costais) alongados e achatados, processos articulares e (em carnívoros) mamilares.',
    clin: 'Estenose lombossacra e doença do disco intervertebral em cães; os processos transversos são referência na anestesia paravertebral/epidural lombar (ex.: bloqueio paralombar em ruminantes).',
    curio: ['Os processos transversos lombares são ricos em inserções musculares e determinam parte da largura do lombo, característica avaliada em bovinos de corte.'],
    lm: [
      L('Processo transverso', 'Processus transversus', 'processo', [0.1, 0, 1], 'Projeção lateral longa e achatada.', 'Inserção da musculatura sublombar e do dorso.', ['Músculos hipaxiais'], 'Referência palpável em bloqueios paralombares.'),
      L('Processo espinhoso', 'Processus spinosus', 'processo', [0, 1, 0], 'Projeção dorsal.', 'Inserção de músculos epaxiais e ligamentos.', ['Ligamento supraespinhoso'], null),
      L('Processo articular cranial', 'Processus articularis cranialis', 'faceta articular', [0.8, 0.5, 0.4], 'Projeção cranial do arco.', 'Articula-se com a vértebra anterior.', ['Vértebra cranial'], null)
    ]
  },
  sacrum: {
    pt: 'Sacro', latin: 'Os sacrum', popular: 'Osso sacro', side: 'median',
    div: 'axial', region: 'vertebral_column', sub: 'sacral', shape: 'sacrum', group: ['vertebral_column', 'pelvis'], dir: [-0.3, 0.6, 0],
    desc: 'Osso único formado pela fusão das vértebras sacrais.',
    loc: 'Entre a última vértebra lombar e a primeira caudal; une-se aos ílios na articulação sacroilíaca.',
    func: 'Transmitir o peso e o impulso dos membros pélvicos à coluna e formar o teto da cavidade pélvica.',
    morph: 'Asas (partes laterais) com face auricular para o ílio, promontório (borda cranioventral), forames sacrais dorsais e ventrais e crista sacral mediana.',
    clin: 'A articulação sacroilíaca pode sofrer luxação em traumas pélvicos; o espaço lombossacro é local de anestesia epidural em várias espécies; o sacro participa do canal do parto.',
    curio: ['O número de vértebras fundidas varia entre as espécies (3 em carnívoros, 4 em pequenos ruminantes e suínos, 5 em bovinos e equinos).'],
    lm: [
      L('Asa do sacro', 'Ala sacralis', 'processo', [0.2, 0.3, 1], 'Porção lateral cranial do sacro.', 'Superfície de articulação (face auricular) com o ílio.', ['Ílio (articulação sacroilíaca)'], 'Luxação sacroilíaca em politraumatismos.'),
      L('Promontório', 'Promontorium', 'crista', [1, -0.9, 0], 'Margem cranioventral do corpo do primeiro segmento sacral.', 'Marca a entrada da cavidade pélvica.', ['Última vértebra lombar'], 'Referência em pelvimetria e avaliação obstétrica.'),
      L('Forames sacrais dorsais', 'Foramina sacralia dorsalia', 'forame', [-0.1, 0.9, 0.3], 'Aberturas na face dorsal do sacro.', 'Passagem dos ramos dorsais dos nervos sacrais.', ['Nervos sacrais'], null)
    ]
  },
  vert_caudal: {
    pt: 'Vértebras caudais (série)', latin: 'Vertebrae caudales', popular: 'Ossos da cauda', side: 'median',
    div: 'axial', region: 'vertebral_column', sub: 'caudal', shape: 'vert_caudal_series', group: 'vertebral_column', dir: [-1, 0, 0],
    desc: 'Série de vértebras da cauda que diminui progressivamente de tamanho e perde os elementos do arco. Nesta versão a série é representada como uma única peça didática (agrupamento).',
    loc: 'Continuação caudal do sacro.',
    func: 'Sustentar a cauda, usada em equilíbrio, comunicação e afastamento de insetos; inserção de músculos e ligamentos caudais.',
    morph: 'Vértebras proximais com arco, processos transversos e espinhoso; as distais reduzem-se a pequenos corpos cilíndricos. Em muitas espécies há arcos hemais ventrais nas vértebras proximais.',
    clin: 'Cauda é local de coleta de sangue e injeção (veia/artéria caudal mediana em bovinos); caudectomias em ovinos e suínos têm implicações de bem-estar; fraturas e luxações caudais.',
    curio: ['O número de vértebras caudais é muito variável entre espécies e raças.'],
    lm: [
      L('Processos transversos', 'Processus transversi', 'processo', [-0.6, 0, 1], 'Projeções laterais das vértebras caudais proximais.', 'Inserção da musculatura caudal.', ['Músculos coccígeos'], null),
      L('Corpos vertebrais caudais', 'Corpus vertebrae caudalis', 'corpo', [0, 0, 0], 'Porção central de cada vértebra.', 'Sustentação da cauda.', ['Discos intervertebrais'], null)
    ]
  },
  rib: {
    pt: 'Costela {n}', latin: 'Costa {n}', popular: 'Costela', side: 'both', serial: true,
    div: 'axial', region: 'thoracic_cage', sub: 'ribs', shape: 'rib', group: 'thoracic_cage', dir: [0, 0.4, 1],
    desc: 'Osso longo e curvo que forma a parede lateral da caixa torácica. Os ossos costais articulam-se dorsalmente com as vértebras e ventralmente com a cartilagem costal.',
    loc: 'Parede torácica; articula-se com a vértebra torácica de mesmo número (cabeça e tubérculo) e, nas costelas esternais, com o esterno via cartilagem costal.',
    func: 'Proteger coração e pulmões e participar da mecânica respiratória (aumento do volume torácico na inspiração).',
    morph: 'Cabeça (articula com os corpos vertebrais), colo, tubérculo (articula com o processo transverso), ângulo e corpo; extremidade ventral ligada à cartilagem costal.',
    clin: 'Fraturas costais; toracocentese e acupunção são feitas na borda cranial da costela para evitar os vasos e o nervo intercostais (que correm na borda caudal); costelas são usadas como referência para localizar órgãos.',
    curio: ['As costelas esternais (verdadeiras) alcançam o esterno; as asternais (falsas) ligam-se ao arco costal e as flutuantes terminam livres.'],
    lm: [
      L('Cabeça da costela', 'Caput costae', 'extremidade', [-0.1, 1, -0.2], 'Extremidade dorsal da costela.', 'Articula-se com os corpos de duas vértebras vizinhas (articulação da cabeça da costela).', ['Vértebras torácicas'], null),
      L('Tubérculo da costela', 'Tuberculum costae', 'tubérculo', [-0.1, 0.85, 0.3], 'Elevação próxima ao colo.', 'Articula-se com o processo transverso da vértebra.', ['Processo transverso'], null),
      L('Ângulo da costela', 'Angulus costae', 'ângulo', [-0.2, 0.55, 0.9], 'Curva mais acentuada do corpo.', 'Inserção do músculo iliocostal; marca a transição entre porções dorsal e ventral.', ['Músculo iliocostal'], 'Local frequente de fraturas por trauma lateral.')
    ]
  },
  sternum: {
    pt: 'Esterno', latin: 'Sternum', popular: 'Osso do peito', side: 'median',
    div: 'axial', region: 'thoracic_cage', sub: 'sternum', shape: 'sternum', group: 'thoracic_cage', dir: [0.3, -1, 0],
    desc: 'Conjunto de peças ósseas (esternebras) alinhadas ventralmente na parede torácica. Nesta versão é representado como uma peça única.',
    loc: 'Linha média ventral do tórax.',
    func: 'Fechar ventralmente a caixa torácica, receber as cartilagens costais e proteger o coração.',
    morph: 'Manúbrio (cranial), esternebras (corpo) e processo xifoide (caudal) com cartilagem xifoide.',
    clin: 'Pode ser usado para coleta de medula óssea (esternebras) em algumas espécies; fraturas esternais são raras.',
    curio: ['A forma do esterno varia: em equinos é comprimido lateralmente e formado por esternebras alinhadas em uma crista ventral.'],
    lm: [
      L('Manúbrio do esterno', 'Manubrium sterni', 'extremidade', [1, 0, 0], 'Extremidade cranial.', 'Articula-se com a primeira cartilagem costal.', ['Primeira costela'], null),
      L('Processo xifoide', 'Processus xiphoideus', 'processo', [-1, -0.1, 0], 'Extremidade caudal.', 'Suporta a cartilagem xifoide e a parede abdominal ventral.', ['Linha alba'], null)
    ]
  },
  scapula: {
    pt: 'Escápula', latin: 'Scapula', popular: 'Paleta; omoplata', side: 'both',
    div: 'appendicular', region: 'thoracic_limb', sub: 'pectoral_girdle', shape: 'scapula', group: 'thoracic_limb', dir: [0.2, 0.7, 1],
    desc: 'Osso plano triangular que forma o esqueleto do ombro. Em mamíferos domésticos não se articula diretamente com o esqueleto axial (sinsarcose).',
    loc: 'Parede lateral cranial do tórax, entre as costelas e o úmero; articula-se distalmente com o úmero.',
    func: 'Suportar o membro torácico por meio de músculos (sinsarcose) e amortecer o impacto; origem e inserção de músculos do ombro; articulação do ombro (cavidade glenoidal).',
    morph: 'Face costal (fossa subescapular) e face lateral dividida pela espinha da escápula em fossas supraespinhosa e infraespinhosa; borda dorsal com cartilagem escapular; extremidade distal com cavidade glenoidal, tubérculo supraglenoidal e processo coracoide.',
    clin: 'A espinha escapular é palpável e referência de injeção/bloqueio; fraturas do colo e da cavidade glenoidal; o nervo supraescapular passa pela incisura escapular (neuropatias do supraescapular).',
    curio: ['Os mamíferos domésticos não têm clavícula funcional, o que dá ao membro torácico grande liberdade de movimento no plano sagital (cursorialidade).'],
    cmp: 'Forma e acidentes variam entre espécies: o cavalo não tem acrômio (a espinha termina em tuber); cão e gato têm acrômio, com processo hamato (e suprahamato no gato). Em outras espécies, consulte as obras de referência.',
    lm: [
      L('Espinha da escápula', 'Spina scapulae', 'crista', [0, 0.1, 1], 'Crista que atravessa a face lateral.', 'Inserção de músculos (trapézio, deltoide) e divisão das fossas.', ['Fossa supraespinhosa', 'Fossa infraespinhosa'], 'Palpável sob a pele; referência para bloqueios e acupuntura.'),
      L('Fossa supraespinhosa', 'Fossa supraspinata', 'fossa', [0.45, 0.35, 1], 'Cranial à espinha.', 'Origem do músculo supraespinhoso.', ['Músculo supraespinhoso'], null),
      L('Fossa infraespinhosa', 'Fossa infraspinata', 'fossa', [-0.45, 0.2, 1], 'Caudal à espinha.', 'Origem do músculo infraespinhoso.', ['Músculo infraespinhoso'], null),
      L('Cavidade glenoidal', 'Cavitas glenoidalis', 'faceta articular', [0, -1, 0.3], 'Extremidade distal.', 'Articula-se com a cabeça do úmero (articulação do ombro).', ['Úmero'], 'Luxação do ombro, osteocondrose e fraturas articulares.')
    ]
  },
  humerus: {
    pt: 'Úmero', latin: 'Humerus', popular: 'Osso do braço', side: 'both',
    div: 'appendicular', region: 'thoracic_limb', sub: 'arm', shape: 'humerus', group: 'thoracic_limb', dir: [0.2, 0.1, 1],
    desc: 'Osso longo do braço, entre a escápula e os ossos do antebraço.',
    loc: 'Entre a articulação do ombro (proximal) e a do cotovelo (distal).',
    func: 'Transmitir forças entre o ombro e o antebraço e servir de alavanca para músculos do ombro e do cotovelo.',
    morph: 'Extremidade proximal com cabeça, colo e tubérculos maior e menor separados pelo sulco intertubercular; diáfise torcida com tuberosidade deltoide; extremidade distal com côndilo (cabeça e tróclea), epicôndilos e fossa do olécrano.',
    clin: 'Fraturas diafisárias e condilares; o nervo radial passa em espiral pelo sulco do músculo braquial e lesiona-se em fraturas; osteocondrose da cabeça umeral em cães.',
    curio: ['O tendão do bíceps braquial desliza no sulco intertubercular, estrutura essencial no aparelho de sustentação do cavalo.'],
    cmp: 'Cães têm forame supratroclear; gatos têm forame supracondilar; equinos têm tubérculo intermédio dividindo o sulco intertubercular.',
    lm: [
      L('Cabeça do úmero', 'Caput humeri', 'extremidade', [-0.3, 1, 0], 'Superfície articular proximal arredondada.', 'Articula-se com a cavidade glenoidal.', ['Escápula'], 'Osteocondrose e luxações.'),
      L('Tubérculo maior', 'Tuberculum majus', 'tubérculo', [0.6, 0.9, 0.5], 'Projeção proximolateral.', 'Inserção dos músculos supraespinhoso e infraespinhoso.', ['Músculos do manguito rotador'], null),
      L('Sulco intertubercular', 'Sulcus intertubercularis', 'sulco', [0.75, 0.8, 0], 'Entre os tubérculos maior e menor.', 'Passagem do tendão do bíceps braquial.', ['Músculo bíceps braquial'], 'Tenossinovite bicipital.'),
      L('Tuberosidade deltoide', 'Tuberositas deltoidea', 'tuberosidade', [0.2, 0.1, 0.95], 'Face lateral da diáfise.', 'Inserção do músculo deltoide.', ['Músculo deltoide'], null),
      L('Côndilo do úmero', 'Condylus humeri', 'côndilo', [0.2, -0.95, 0], 'Extremidade distal.', 'Articula-se com rádio e ulna (articulação do cotovelo).', ['Rádio', 'Ulna'], 'Fraturas condilares.'),
      L('Fossa do olécrano', 'Fossa olecrani', 'fossa', [-0.7, -0.8, 0], 'Face caudal da extremidade distal.', 'Aloja o processo ancôneo da ulna na extensão do cotovelo.', ['Processo ancôneo'], null)
    ]
  },
  radius: {
    pt: 'Rádio', latin: 'Radius', popular: 'Osso do antebraço (cranial)', side: 'both',
    div: 'appendicular', region: 'thoracic_limb', sub: 'forearm', shape: 'radius', group: 'thoracic_limb', dir: [0.5, 0, 1],
    desc: 'Osso principal de sustentação de peso do antebraço, cranial à ulna.',
    loc: 'Entre o cotovelo e o carpo; articula-se com o úmero, a ulna e o carpo.',
    func: 'Suportar a carga do membro torácico e transmiti-la ao carpo.',
    morph: 'Extremidade proximal com fóvea da cabeça; diáfise com tuberosidade do radio; extremidade distal com tróclea do rádio e processo estiloide.',
    clin: 'Fraturas distais do rádio e da ulna são comuns em cães de raças pequenas; o rádio é local de coleta de enxerto e de fixação com placas.',
    curio: ['A mobilidade entre rádio e ulna (pronação/supinação) é grande em primatas, moderada em felinos e reduzida ou nula em ungulados.'],
    cmp: 'Em carnívoros rádio e ulna são separados; em ruminantes e equinos são fundidos em graus variáveis.',
    lm: [
      L('Fóvea da cabeça do rádio', 'Fovea capitis radii', 'faceta articular', [0, 1, 0], 'Extremidade proximal.', 'Articula-se com o côndilo do úmero.', ['Úmero'], null),
      L('Tuberosidade do rádio', 'Tuberositas radii', 'tuberosidade', [0.6, 0.7, 0], 'Face craniomedial, proximal.', 'Inserção do músculo bíceps braquial.', ['Músculo bíceps braquial'], null),
      L('Processo estiloide do rádio', 'Processus styloideus radii', 'processo', [-0.1, -1, -0.5], 'Margem medial da extremidade distal.', 'Estabilização medial do carpo (ligamento colateral).', ['Ossos do carpo'], 'Fraturas distais comprometem a congruência do carpo.')
    ]
  },
  ulna: {
    pt: 'Ulna', latin: 'Ulna', popular: 'Osso do antebraço (caudal)', side: 'both',
    div: 'appendicular', region: 'thoracic_limb', sub: 'forearm', shape: 'ulna', group: 'thoracic_limb', dir: [-0.5, 0, 1],
    desc: 'Osso do antebraço caudal ao rádio; forma a ponta do cotovelo (olécrano).',
    loc: 'Margem caudal do antebraço; articula-se com o úmero e o rádio.',
    func: 'Alavanca para os músculos extensores do cotovelo (tríceps braquial) e estabilidade lateral do cotovelo.',
    morph: 'Olécrano com túber do olécrano, incisura troclear com processo ancôneo e processo coronoide medial e lateral, corpo longo e processo estiloide distal.',
    clin: 'Fratura do olécrano (desvio por tração do tríceps) e displasia do cotovelo (fragmentação do processo coronoide) em cães.',
    curio: ['Em equinos e ruminantes a ulna é reduzida e fundida ao rádio; em cães permanece independente e robusta.'],
    cmp: 'O olécrano é muito desenvolvido em quase todos os mamíferos domésticos; o grau de redução do corpo da ulna varia.',
    lm: [
      L('Olécrano', 'Olecranon', 'processo', [-0.7, 1, 0], 'Extremidade proximal.', 'Ponta do cotovelo; alavanca do tríceps braquial.', ['Músculo tríceps braquial'], 'Fraturas e bursite do olécrano.'),
      L('Túber do olécrano', 'Tuber olecrani', 'tuberosidade', [-1, 0.95, 0], 'Extremidade livre do olécrano.', 'Inserção do tríceps.', ['Músculo tríceps braquial'], null),
      L('Incisura troclear', 'Incisura trochlearis', 'faceta articular', [0.5, 0.65, 0], 'Face cranial, proximal.', 'Articula-se com a tróclea do úmero.', ['Úmero'], null),
      L('Processo ancôneo', 'Processus anconeus', 'processo', [0.3, 0.9, 0], 'Projeção proximal da incisura troclear.', 'Encaixa-se na fossa do olécrano (extensão do cotovelo).', ['Fossa do olécrano'], 'Não união do processo ancôneo em cães de grande porte.')
    ]
  },
  carpus: {
    pt: 'Ossos do carpo', latin: 'Ossa carpi', popular: 'Joelho (no cavalo e bovino, termo popular); punho', side: 'both',
    div: 'appendicular', region: 'thoracic_limb', sub: 'manus', shape: 'carpus', group: 'thoracic_limb', dir: [0.3, -0.5, 1],
    desc: 'Conjunto de pequenos ossos organizados em duas fileiras (proximal e distal), entre o antebraço e o metacarpo. Representado como peça única (agrupamento didático).',
    loc: 'Articulação entre o antebraço e o metacarpo.',
    func: 'Absorver impacto e permitir flexão e extensão do membro; transmitir a carga do antebraço aos ossos metacarpais.',
    morph: 'O número de ossos varia entre as espécies. Em todas há um osso carpal acessório na face palmar, que serve de polia para os flexores.',
    clin: 'Fraturas articulares em cavalos de corrida; hiperextensão do carpo em cães; bursites carpais em bovinos ("joelho de bezerro").',
    curio: ['O "joelho" do cavalo é anatomicamente o carpo; o verdadeiro joelho (articulação do fêmur com a tíbia) é a soldra.'],
    lm: [
      L('Osso carpal acessório', 'Os carpi accessorium', 'extremidade', [-1, 0.4, 0.7], 'Face palmar, lateral.', 'Polia de reflexão para tendões flexores e alavanca para músculos flexores do carpo.', ['Rádio', 'Ulna'], 'Fratura em cavalos e cães de corrida.')
    ]
  },
  metacarpus: {
    pt: 'Metacarpo', latin: 'Ossa metacarpalia', popular: 'Canela (membro torácico)', side: 'both',
    div: 'appendicular', region: 'thoracic_limb', sub: 'manus', shape: 'metapodium', group: 'thoracic_limb', dir: [0.3, -0.6, 1],
    desc: 'Ossos longos entre o carpo e as falanges. O número e o grau de fusão variam por espécie (ver particularidades).',
    loc: 'Entre o carpo e as falanges proximais.',
    func: 'Suportar a carga e formar uma alavanca longa para aumentar a amplitude do passo.',
    morph: 'Base proximal (articula com o carpo), corpo e cabeça distal com superfície articular para a falange proximal.',
    clin: 'Fraturas; exostoses (esplintes em equinos); referência para bloqueios perineurais.',
    curio: ['A redução do número de dedos é uma adaptação à corrida (cursorialidade) observada em ungulados.'],
    cmp: 'Número de ossos metacarpais funcionais: 5 (cão), 5 (gato), 2 (suíno, com II e V menores), 2 fundidos (ruminantes) e 1 (equinos, com II e IV reduzidos).',
    lm: [
      L('Base do metacarpo', 'Basis metacarpalis', 'extremidade', [0, 1, 0], 'Extremidade proximal.', 'Articula-se com os ossos carpais distais.', ['Carpo'], null),
      L('Cabeça distal do metacarpo', 'Caput metacarpale', 'côndilo', [0, -1, 0], 'Extremidade distal.', 'Articula-se com a falange proximal e os ossos sesamoides.', ['Falange proximal', 'Sesamoides'], null)
    ]
  },
  phalanges: {
    pt: 'Falanges (membro torácico)', latin: 'Ossa digitorum manus', popular: 'Dedos; quartela e casco', side: 'both',
    div: 'appendicular', region: 'thoracic_limb', sub: 'manus', shape: 'phalanges', group: 'thoracic_limb', dir: [1, -0.5, 1],
    desc: 'Ossos dos dedos (falange proximal, média e distal, e sesamoides), representados como peça única por membro.',
    loc: 'Extremidade distal do membro, distal ao metacarpo.',
    func: 'Suportar o peso e interagir com o solo; fixação das estruturas córneas (unhas, cascos).',
    morph: 'Cada dedo tem três falanges (exceto o primeiro dedo, com duas), terminando em falange distal que sustenta o casco ou a unha.',
    clin: 'Fraturas e artrites interfalangeanas; claudicações de dedos e cascos; cirurgias de dedos em carnívoros.',
    curio: ['A forma da falange distal acompanha a estrutura córnea: casco (ungulados) ou garra (carnívoros).'],
    lm: [
      L('Falange distal', 'Phalanx distalis', 'extremidade', [1, -0.6, 0], 'Extremidade livre do dedo.', 'Sustenta o casco ou a unha.', ['Estrutura córnea'], null)
    ]
  },
  coxal: {
    pt: 'Osso do quadril (osso coxal)', latin: 'Os coxae (ílio, ísquio e púbis)', popular: 'Osso da bacia', side: 'both',
    div: 'appendicular', region: 'pelvic_limb', sub: 'pelvic_girdle', shape: 'coxal', group: ['pelvic_limb', 'pelvis'], dir: [-0.3, 0.2, 1],
    desc: 'Osso largo formado pela fusão de ílio, ísquio e púbis. Os dois ossos coxais formam a pelve óssea com o sacro e as primeiras vértebras caudais.',
    loc: 'Região da bacia; articula-se com o sacro (articulação sacroilíaca) e com o fêmur (articulação do quadril).',
    func: 'Transmitir o impulso dos membros pélvicos à coluna, proteger vísceras pélvicas e formar o canal pélvico (parto).',
    morph: 'Asa do ílio com túber coxal e túber sacral; corpo do ílio; ísquio com túber isquiático; púbis com ramo cranial e sínfise pélvica; acetábulo; forame obturado.',
    clin: 'Fraturas pélvicas, luxação sacroilíaca e displasia do quadril (cães); pelvimetria e avaliação obstétrica; referência para palpação de ossos pélvicos e injeções.',
    curio: ['As três partes do osso coxal fundem-se no acetábulo durante o desenvolvimento, em idades diferentes entre as espécies.'],
    cmp: 'A inclinação do ílio e o tamanho do túber coxal variam muito: em bovinos e equinos o túber coxal é proeminente ("ponta da anca").',
    lm: [
      L('Túber coxal', 'Tuber coxae', 'tuberosidade', [0.9, 0.7, 1], 'Ângulo craniolateral da asa do ílio.', 'Origem de músculos abdominais e do tensor da fáscia lata; palpável.', ['Músculos abdominais'], 'Referência palpável ("ponta da anca") para avaliação do escore e fraturas.'),
      L('Túber isquiático', 'Tuber ischiadicum', 'tuberosidade', [-1, -0.2, 0.6], 'Extremidade caudal do ísquio.', 'Origem de músculos isquiotibiais.', ['Músculos isquiotibiais'], 'Referência palpável (ponta da nádega).'),
      L('Acetábulo', 'Acetabulum', 'faceta articular', [0.05, -0.1, 1], 'Cavidade onde se reúnem ílio, ísquio e púbis.', 'Recebe a cabeça do fêmur (articulação do quadril).', ['Fêmur'], 'Displasia coxofemoral e luxação do quadril.'),
      L('Forame obturado', 'Foramen obturatum', 'forame', [-0.2, -0.65, 0], 'Grande abertura entre púbis e ísquio.', 'Passagem do nervo obturatório, coberto pela membrana obturadora.', ['Nervo obturatório'], null)
    ]
  },
  femur: {
    pt: 'Fêmur', latin: 'Os femoris', popular: 'Osso da coxa', side: 'both',
    div: 'appendicular', region: 'pelvic_limb', sub: 'thigh', shape: 'femur', group: 'pelvic_limb', dir: [0.4, 0.2, 1],
    desc: 'Osso longo da coxa, o mais robusto do membro pélvico.',
    loc: 'Entre o quadril (acetábulo) e o joelho (tíbia e patela).',
    func: 'Suportar o peso do corpo e transmitir o impulso; alavanca para músculos glúteos, isquiotibiais e quadríceps.',
    morph: 'Extremidade proximal com cabeça, colo, trocânter maior e menor e fossa trocantérica; diáfise com superfícies; extremidade distal com tróclea femoral, côndilos medial e lateral e fossa intercondilar.',
    clin: 'Fraturas de colo, diáfise e fise; colocefalectomia (excisão da cabeça e colo do fêmur) como tratamento paliativo em cães e gatos; necrose avascular da cabeça do fêmur em cães jovens de raças pequenas.',
    curio: ['O fêmur é o maior osso do membro pélvico e, em cavalos, abriga a inserção de grandes massas musculares da garupa.'],
    cmp: 'O terceiro trocânter existe nos equinos e é ausente nos ruminantes e nos carnívoros; as fabelas (sesamoides do músculo gastrocnêmio) aparecem em cães e gatos.',
    lm: [
      L('Cabeça do fêmur', 'Caput ossis femoris', 'extremidade', [-0.55, 0.95, -0.5], 'Esfera proximal medial.', 'Articula-se com o acetábulo; fóvea da cabeça para o ligamento da cabeça do fêmur.', ['Osso coxal'], 'Displasia, luxação e necrose avascular.'),
      L('Trocânter maior', 'Trochanter major', 'processo', [0, 1, 0.8], 'Projeção proximolateral.', 'Inserção dos músculos glúteos médio e profundo.', ['Músculos glúteos'], 'Referência palpável para o acesso cirúrgico ao quadril.'),
      L('Trocânter menor', 'Trochanter minor', 'processo', [-0.4, 0.6, -0.6], 'Projeção medial, distal à cabeça.', 'Inserção do iliopsoas.', ['Músculo iliopsoas'], null),
      L('Tróclea femoral', 'Trochlea ossis femoris', 'faceta articular', [1, -0.85, 0], 'Face cranial da extremidade distal.', 'Deslizamento da patela.', ['Patela'], 'Sulco raso predispõe à luxação de patela.'),
      L('Côndilo lateral do fêmur', 'Condylus lateralis', 'côndilo', [-0.6, -1, 0.7], 'Extremidade distal, lateral.', 'Articula-se com o côndilo lateral da tíbia e o menisco lateral.', ['Tíbia', 'Menisco lateral'], 'Fraturas condilares; local de inserção dos ligamentos colaterais.')
    ]
  },
  patella: {
    pt: 'Patela', latin: 'Patella', popular: 'Rótula', side: 'both',
    div: 'appendicular', region: 'pelvic_limb', sub: 'thigh', shape: 'patella', group: 'pelvic_limb', dir: [1, 0, 0.5],
    desc: 'Maior osso sesamoide do corpo, imerso no tendão do músculo quadríceps femoral.',
    loc: 'Face cranial do joelho, sobre a tróclea femoral.',
    func: 'Aumentar a alavanca do quadríceps e proteger a articulação do joelho.',
    morph: 'Formato de gota ou triangular, com base proximal, ápice distal e face articular posterior.',
    clin: 'Luxação medial ou lateral da patela, especialmente em cães de raças pequenas; fixação da patela em equinos.',
    curio: ['A patela dos mamíferos não é um osso longo: ossifica-se no interior de um tendão.'],
    lm: [
      L('Base da patela', 'Basis patellae', 'extremidade', [0, 1, 0], 'Extremidade proximal.', 'Recebe o tendão do quadríceps.', ['Músculo quadríceps femoral'], null),
      L('Ápice da patela', 'Apex patellae', 'extremidade', [0, -1, 0], 'Extremidade distal.', 'Origem do ligamento patelar.', ['Ligamento patelar'], null)
    ]
  },
  tibia: {
    pt: 'Tíbia', latin: 'Tibia', popular: 'Osso da perna (medial)', side: 'both',
    div: 'appendicular', region: 'pelvic_limb', sub: 'leg', shape: 'tibia', group: 'pelvic_limb', dir: [0.4, 0, 1],
    desc: 'Osso principal de sustentação de peso da perna; articula-se com o fêmur e o tarso.',
    loc: 'Entre o joelho e o jarrete (tarso).',
    func: 'Suportar a carga do membro pélvico e transmitir o impulso.',
    morph: 'Côndilos medial e lateral, tuberosidade da tíbia (inserção do ligamento patelar), crista da tíbia, cóclea tibial e maléolo medial.',
    clin: 'Fraturas; cirurgias de estabilização do joelho (TPLO, TTA) para ruptura do ligamento cruzado cranial em cães.',
    curio: ['A crista da tíbia forma uma borda cranial palpável e o terço médio é pouco coberto por tecidos moles.'],
    lm: [
      L('Tuberosidade da tíbia', 'Tuberositas tibiae', 'tuberosidade', [1, 0.85, 0], 'Face cranial proximal.', 'Inserção do ligamento patelar.', ['Ligamento patelar'], 'Referência para a osteotomia de avanço da tuberosidade tibial (TTA).'),
      L('Côndilo medial da tíbia', 'Condylus medialis', 'côndilo', [0, 1, -0.6], 'Extremidade proximal.', 'Articula-se com o fêmur através do menisco medial.', ['Fêmur', 'Menisco medial'], null),
      L('Cóclea da tíbia', 'Cochlea tibiae', 'faceta articular', [0.1, -1, 0], 'Extremidade distal.', 'Articula-se com o tálus.', ['Tálus'], null),
      L('Maléolo medial', 'Malleolus medialis', 'processo', [0, -0.9, -0.8], 'Margem medial distal.', 'Estabiliza medialmente o jarrete.', ['Ligamento colateral medial do tarso'], 'Fraturas maleolares.')
    ]
  },
  fibula: {
    pt: 'Fíbula', latin: 'Fibula', popular: 'Osso da perna (lateral)', side: 'both',
    div: 'appendicular', region: 'pelvic_limb', sub: 'leg', shape: 'fibula', group: 'pelvic_limb', dir: [-0.2, 0, 1],
    desc: 'Osso delgado lateral à tíbia, com grau de redução variável entre as espécies.',
    loc: 'Margem lateral da perna.',
    func: 'Inserção muscular e estabilização lateral do joelho e do tarso; pouca função na sustentação de peso.',
    morph: 'Cabeça proximal, corpo delgado e maléolo lateral distal (parte do tarso ou fusionado à tíbia em algumas espécies).',
    clin: 'Fraturas associadas às de tíbia; a cabeça da fíbula é referência para o nervo fibular.',
    curio: ['A redução da fíbula é uma tendência evolutiva nos ungulados.'],
    cmp: 'Fíbula completa em carnívoros e suínos; reduzida em equinos e ruminantes.',
    lm: [
      L('Cabeça da fíbula', 'Caput fibulae', 'extremidade', [0, 1, 0], 'Extremidade proximal.', 'Articula-se (ou une-se) com o côndilo lateral da tíbia.', ['Tíbia'], 'O nervo fibular comum cruza a face lateral da cabeça da fíbula.'),
      L('Maléolo lateral', 'Malleolus lateralis', 'processo', [0, -1, 0], 'Extremidade distal.', 'Estabilização lateral do tarso.', ['Tálus', 'Calcâneo'], null)
    ]
  },
  tarsus: {
    pt: 'Ossos do tarso', latin: 'Ossa tarsi', popular: 'Jarrete; curvilhão', side: 'both',
    div: 'appendicular', region: 'pelvic_limb', sub: 'pes', shape: 'tarsus', group: 'pelvic_limb', dir: [-0.5, -0.4, 1],
    desc: 'Conjunto de ossos organizados em fileiras, incluindo tálus e calcâneo. Representado como peça única (agrupamento didático).',
    loc: 'Entre a perna (tíbia e fíbula) e o metatarso.',
    func: 'Transmitir o impulso do membro pélvico; o calcâneo é alavanca do tendão calcâneo comum.',
    morph: 'O calcâneo tem túber calcâneo na extremidade proximal e o tálus apresenta tróclea; ossos centrais e tarsais distais completam o conjunto.',
    clin: 'Esparavão ósseo e osteoartrite em equinos; ruptura do tendão calcâneo; osteocondrose do tálus em cães; luxações.',
    curio: ['O jarrete é a principal alavanca de propulsão do membro pélvico.'],
    lm: [
      L('Túber calcâneo', 'Tuber calcanei', 'tuberosidade', [-1, 1, 0], 'Extremidade proximal do calcâneo.', 'Inserção do tendão calcâneo comum.', ['Tendão calcâneo comum'], 'Ponta do jarrete palpável; lesões do tendão calcâneo.'),
      L('Tróclea do tálus', 'Trochlea tali', 'faceta articular', [0.4, 0.5, 0], 'Superfície proximal.', 'Articula-se com a cóclea da tíbia.', ['Tíbia'], 'Osteocondrose da tróclea do tálus.')
    ]
  },
  metatarsus: {
    pt: 'Metatarso', latin: 'Ossa metatarsalia', popular: 'Canela (membro pélvico)', side: 'both',
    div: 'appendicular', region: 'pelvic_limb', sub: 'pes', shape: 'metapodium', group: 'pelvic_limb', dir: [0.1, -0.7, 1],
    desc: 'Ossos longos entre o tarso e as falanges do membro pélvico.',
    loc: 'Entre o tarso e as falanges proximais.',
    func: 'Suportar a carga e formar um braço de alavanca longo para o impulso.',
    morph: 'Base proximal, corpo e cabeça distal, em número e grau de fusão variáveis por espécie.',
    clin: 'Fraturas e exostoses; referência de bloqueios perineurais.',
    curio: ['Em geral o metatarso é mais longo e mais cilíndrico que o metacarpo correspondente.'],
    lm: [
      L('Base do metatarso', 'Basis metatarsalis', 'extremidade', [0, 1, 0], 'Extremidade proximal.', 'Articula-se com os ossos tarsais distais.', ['Tarso'], null),
      L('Cabeça distal do metatarso', 'Caput metatarsale', 'côndilo', [0, -1, 0], 'Extremidade distal.', 'Articula-se com a falange proximal e os sesamoides.', ['Falange proximal'], null)
    ]
  },
  phalanges_pes: {
    pt: 'Falanges (membro pélvico)', latin: 'Ossa digitorum pedis', popular: 'Dedos do membro pélvico', side: 'both',
    div: 'appendicular', region: 'pelvic_limb', sub: 'pes', shape: 'phalanges', group: 'pelvic_limb', dir: [1, -0.5, 1],
    desc: 'Ossos dos dedos do membro pélvico (falanges e sesamoides), representados como peça única por membro.',
    loc: 'Extremidade distal do membro pélvico.',
    func: 'Suportar o peso e interagir com o solo.',
    morph: 'Três falanges por dedo, exceto no primeiro dedo (quando presente), com duas.',
    clin: 'Fraturas e artrites interfalangeanas; claudicações de casco/dígito.',
    curio: ['A estrutura córnea que reveste a falange distal (casco ou unha) cresce continuamente.'],
    lm: [
      L('Falange distal', 'Phalanx distalis', 'extremidade', [1, -0.6, 0], 'Extremidade livre do dedo.', 'Sustenta o casco ou a unha.', ['Estrutura córnea'], null)
    ]
  },
  clavicle: {
    pt: 'Clavícula (vestigial)', latin: 'Clavicula', popular: 'Clavícula', side: 'both',
    div: 'appendicular', region: 'thoracic_limb', sub: 'pectoral_girdle', shape: 'clavicle', group: 'thoracic_limb', dir: [0.8, -0.2, 1],
    desc: 'Pequeno osso delgado, vestigial, incluído no músculo braquiocefálico.',
    loc: 'Cranial ao ombro, incluída no músculo braquiocefálico (intersecção clavicular).',
    func: 'Sem função de suspensão do membro; funciona como marcador ósseo no músculo braquiocefálico.',
    morph: 'Peça óssea fina e curta, sem articulação com a escápula ou o esterno.',
    clin: 'Aparece em radiografias torácicas e não deve ser confundida com corpo estranho ou fratura.',
    curio: ['A presença de clavícula vestigial é um achado típico dos carnívoros e ilustra a redução evolutiva da clavícula nos mamíferos cursoriais.'],
    lm: [
      L('Extremidade acromial', 'Extremitas acromialis', 'extremidade', [1, 0.2, 0.9], 'Extremidade lateral.', 'Sem articulação óssea; fixa-se por tecido conjuntivo.', ['Músculo braquiocefálico'], null)
    ]
  }
};
