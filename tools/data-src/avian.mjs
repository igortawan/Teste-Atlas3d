// Catálogo anatômico da galinha doméstica (Gallus gallus domesticus). Terminologia latina: Nomina Anatomica Avium (NAA).
// Mesmas convenções de eixos/marcos de catalog.mjs. Itens duvidosos são registrados em `unverified`.
import { L } from './catalog.mjs';

const ANA = (extra = {}) => ({ div: 'axial', ...extra });

export const AV_TYPES = {
  cranium: {
    pt: 'Crânio (neurocrânio e bico superior)', latin: 'Cranium (com rostrum maxillare)', popular: 'Caixa craniana e bico', side: 'median',
    div: 'axial', region: 'skull', sub: 'cranial_bones', shape: 'av_cranium', group: 'skull', dir: [0.7, 0.5, 0],
    desc: 'Crânio leve, de ossos finos fundidos precocemente, com órbitas muito amplas separadas por septo interorbital e um rostro (bico superior) sem dentes. Nesta versão, o bico superior é agrupado ao crânio.',
    loc: 'Extremidade cranial do esqueleto axial; articula-se com o atlas por um côndilo occipital único.',
    func: 'Proteger o encéfalo e os órgãos dos sentidos e sustentar o bico; participa da cinese craniana (movimento relativo entre bico superior e neurocrânio).',
    morph: 'Côndilo occipital único, forame magno, órbitas amplas com septo interorbital fino, anel esclerótico no olho (peças ósseas oculares, não representadas aqui) e rostro sem dentes.',
    clin: 'A debicagem (remoção parcial do bico) é praticada em aves de produção e é discutida do ponto de vista do bem-estar; traumas do bico e sinusite infraorbitária são afecções descritas.',
    curio: ['Aves não possuem dentes; o bico é revestido por ranfoteca, estrutura córnea.', 'O côndilo occipital único permite grande rotação da cabeça.'],
    lm: [
      L('Côndilo occipital', 'Condylus occipitalis', 'côndilo', [-1, -0.45, 0], 'Face caudal do occipital, ao redor do forame magno.', 'Articula-se com o atlas; único (diferente dos mamíferos, que têm dois).', ['Atlas'], null),
      L('Forame magno', 'Foramen magnum', 'forame', [-1, -0.1, 0], 'Face caudal do occipital.', 'Passagem do bulbo para o canal vertebral.', ['Medula espinhal'], null),
      L('Septo interorbital', 'Septum interorbitale', 'septo', [0.1, 0, 0], 'Entre as duas órbitas.', 'Divisão óssea fina entre os olhos.', ['Órbitas'], null)
    ]
  },
  mandible: {
    pt: 'Mandíbula (bico inferior)', latin: 'Mandibula', popular: 'Bico inferior', side: 'median',
    div: 'axial', region: 'skull', sub: 'facial_bones', shape: 'av_mandible', group: 'skull', dir: [0.6, -1, 0],
    desc: 'Mandíbula em formato de V, composta por vários ossos fundidos, coberta pela ranfoteca (bico inferior).',
    loc: 'Parte inferior da cabeça; articula-se com os ossos quadrados.',
    func: 'Apreensão e manipulação do alimento; movimentos de abertura e fechamento do bico.',
    morph: 'Ramos mandibulares unidos rostralmente (sínfise), com fenestra mandibular e cótila quadrática na extremidade articular.',
    clin: 'Fraturas e deformidades do bico inferior; má oclusão do bico.',
    curio: ['O ângulo de abertura do bico depende da cinese craniana mediada pelo osso quadrado.'],
    lm: [
      L('Cótila quadrática', 'Cotyla quadratica', 'faceta articular', [-1, 0.4, 0], 'Extremidade caudal de cada ramo.', 'Articula-se com o osso quadrado.', ['Osso quadrado'], null),
      L('Fenestra mandibular', 'Fenestra mandibulae', 'forame', [-0.3, 0.1, 1], 'Abertura lateral entre os ossos mandibulares.', 'Redução de peso do osso e passagem de vasos.', [], null)
    ]
  },
  quadrate: {
    pt: 'Osso quadrado', latin: 'Os quadratum', popular: 'Quadrado', side: 'both',
    div: 'axial', region: 'skull', sub: 'facial_bones', shape: 'quadrate', group: 'skull', dir: [0.2, -0.2, 1],
    desc: 'Osso móvel que liga a mandíbula ao crânio e aos arcos jugal e pterigopalatino, essencial para a cinese craniana.',
    loc: 'Lateralmente no crânio, entre o osso temporal e a mandíbula.',
    func: 'Transmitir o movimento da mandíbula ao bico superior (cinese prokinética) e articular a mandíbula.',
    morph: 'Osso curto com processo orbital e côndilos mandibulares.',
    clin: 'Luxações e fraturas do quadrado em traumas de cabeça.',
    curio: ['O osso quadrado é uma estrutura homóloga ao osso quadrado dos répteis; nos mamíferos transformou-se em osso do ouvido médio (bigorna).'],
    lm: [
      L('Processo orbital', 'Processus orbitalis', 'processo', [0.2, 0.5, 0.4], 'Projeção rostrodorsal.', 'Inserção muscular e orientação do movimento do quadrado.', ['Órbita'], null),
      L('Côndilos mandibulares', 'Condyli mandibulares', 'côndilo', [0, -1, 0.1], 'Extremidade ventral.', 'Articulam-se com a cótila quadrática da mandíbula.', ['Mandíbula'], null)
    ]
  },
  atlas: {
    pt: 'Atlas (C1)', latin: 'Atlas', popular: 'Primeira vértebra cervical', side: 'median',
    div: 'axial', region: 'vertebral_column', sub: 'cervical', shape: 'av_atlas', group: 'vertebral_column', dir: [0.8, 0.3, 0],
    desc: 'Primeira vértebra cervical, em anel, com fossa condilar única que recebe o côndilo occipital.',
    loc: 'Entre o crânio e o áxis.',
    func: 'Permitir a flexão e a rotação da cabeça em conjunto com o áxis.',
    morph: 'Arco dorsal fino, corpo reduzido e fossa condilar única; articulação atlantoaxial com o dente do áxis.',
    clin: 'Lesões na junção craniocervical por traumas.',
    curio: ['O atlas aviário tem apenas um ponto de articulação com o crânio.'],
    lm: [
      L('Fossa condilar', 'Fossa condyloidea', 'faceta articular', [1, -0.1, 0], 'Face cranial.', 'Recebe o côndilo occipital único.', ['Crânio'], null),
      L('Fossa odontoide', 'Fossa odontoidea', 'fossa', [0, -0.5, 0], 'Face dorsal do corpo.', 'Recebe o dente do áxis.', ['Áxis'], null)
    ]
  },
  axis: {
    pt: 'Áxis (C2)', latin: 'Axis', popular: 'Segunda vértebra cervical', side: 'median',
    div: 'axial', region: 'vertebral_column', sub: 'cervical', shape: 'av_axis', group: 'vertebral_column', dir: [0.6, 0.4, 0],
    desc: 'Segunda vértebra cervical, com dente (processo odontoide) e processo espinhoso baixo.',
    loc: 'Entre o atlas e C3.',
    func: 'Eixo para a rotação da cabeça.',
    morph: 'Corpo com dente cranial, processo espinhoso e superfície articular heterocélica caudal.',
    clin: 'Fraturas em traumas cervicais.',
    curio: ['A flexibilidade cervical das aves é aumentada pelas articulações heterocélicas.'],
    lm: [
      L('Dente do áxis', 'Dens axis', 'processo', [1, 0.1, 0], 'Projeção cranial do corpo.', 'Eixo de rotação da articulação atlantoaxial.', ['Atlas'], null),
      L('Processo espinhoso', 'Processus spinosus', 'processo', [0, 1, 0], 'Projeção dorsal.', 'Inserção de músculos cervicais.', ['Músculos cervicais'], null)
    ]
  },
  vert_cervical: {
    pt: 'Vértebra cervical {n} (C{n})', latin: 'Vertebra cervicalis {n}', popular: 'Vértebra do pescoço', side: 'median', serial: true,
    div: 'axial', region: 'vertebral_column', sub: 'cervical', shape: 'av_vert_cervical', group: 'vertebral_column', dir: [0.9, 0.4, 0],
    desc: 'Vértebra cervical típica da galinha, de tipo heterocélico: as faces articulares têm forma de sela, o que permite grande flexibilidade do pescoço (14 vértebras cervicais).',
    loc: 'Região cervical, formando um pescoço longo em forma de "S".',
    func: 'Permitir movimentos amplos do pescoço (alimentação, bicagem, vigilância); proteger a medula e a artéria vertebral.',
    morph: 'Corpo alongado com superfícies articulares selares (heterocélicas), arco neural baixo, processo carotídeo nas vértebras mais caudais e canal transversário para a artéria vertebral.',
    clin: 'Torção do pescoço (torcicolo) e traumas cervicais.',
    curio: ['As aves possuem de 11 a mais de 20 vértebras cervicais, dependendo da espécie; a galinha tem 14.'],
    lm: [
      L('Face articular heterocélica', null, 'faceta articular', [1, 0, 0], 'Extremidade cranial do corpo.', 'Articulação selar que permite flexão e rotação.', ['Vértebra cranial'], null),
      L('Processo carotídeo', 'Processus caroticus', 'processo', [0, -1, 0.2], 'Face ventral das vértebras cervicais caudais.', 'Forma um canal para as artérias carótidas.', ['Artérias carótidas'], null),
      L('Canal transversário', 'Canalis transversarius', 'forame', [-0.3, -0.1, 0.9], 'Lateral ao corpo.', 'Passagem da artéria vertebral.', ['Artéria vertebral'], null)
    ]
  },
  vert_thoracic: {
    pt: 'Vértebra torácica {n} (T{n}, livre)', latin: 'Vertebra thoracica {n}', popular: 'Vértebra do dorso', side: 'median', serial: true,
    div: 'axial', region: 'vertebral_column', sub: 'thoracic', shape: 'av_vert_thoracic', group: 'vertebral_column', dir: [0, 1, 0],
    desc: 'Vértebra torácica não fundida (livre) que articula-se com uma costela.',
    loc: 'Região torácica do dorso; articula-se com a costela correspondente.',
    func: 'Permitir mobilidade limitada entre os segmentos rígidos do dorso (notário e sinsacro).',
    morph: 'Corpo curto, processo espinhoso, processos transversos e fóvea costal.',
    clin: 'Raramente isolada em clínica; o dorso rígido restringe lesões isoladas.',
    curio: ['Na galinha, as vértebras torácicas craniais e caudais livres funcionam como pontos de mobilidade entre as regiões rígidas do dorso.'],
    lm: [
      L('Processo espinhoso', 'Processus spinosus', 'processo', [0, 1, 0], 'Projeção dorsal.', 'Inserção de músculos e ligamentos.', ['Músculos epaxiais'], null),
      L('Fóvea costal', 'Fovea costalis', 'faceta articular', [0.5, 0.1, 0.6], 'Lateral ao corpo.', 'Articulação com a costela.', ['Costela'], null)
    ]
  },
  notarium: {
    pt: 'Notário (T2–T5)', latin: 'Notarium', popular: 'Vértebras dorsais fundidas', side: 'median',
    div: 'axial', region: 'vertebral_column', sub: 'thoracic', shape: 'notarium', group: 'vertebral_column', dir: [0, 1, 0],
    desc: 'Estrutura rígida resultante da fusão de vértebras torácicas craniais; na galinha, descrita como formada pelas vértebras torácicas 2 a 5.',
    loc: 'Dorso cranial, entre a última vértebra cervical e a vértebra torácica livre.',
    func: 'Dar rigidez ao dorso e servir de base de apoio às costelas e à cintura peitoral durante o voo e a locomoção.',
    morph: 'Fusão dos corpos e arcos, com crista dorsal contínua e fóveas costais.',
    clin: 'Deformidades da coluna e fraturas por trauma em aves de produção.',
    curio: ['O notário reforça o esqueleto para resistir às forças dos músculos do voo.'],
    unverified: ['O número exato de vértebras que compõem o notário pode variar entre fontes e linhagens; conferir em Baumel et al. (1993) e King & McLelland (1984).'],
    lm: [
      L('Crista dorsal do notário', null, 'crista', [0, 1, 0], 'Face dorsal.', 'Resulta da fusão dos processos espinhosos.', [], null),
      L('Fóveas costais', 'Foveae costales', 'faceta articular', [0, 0, 1], 'Laterais.', 'Articulação com as costelas craniais.', ['Costelas'], null)
    ]
  },
  synsacrum: {
    pt: 'Sinsacro', latin: 'Synsacrum', popular: 'Osso lombossacral', side: 'median',
    div: 'axial', region: 'vertebral_column', sub: 'sacral', shape: 'synsacrum', group: ['vertebral_column', 'pelvis'], dir: [-0.3, 0.6, 0],
    desc: 'Osso único formado pela fusão da última vértebra torácica, das vértebras lombares e sacrais e de vértebras caudais iniciais, fundido aos ossos coxais.',
    loc: 'Região caudal do dorso, entre o dorso livre e o pigóstilo.',
    func: 'Formar uma plataforma rígida que sustenta o tronco e transmite as forças dos membros pélvicos; alojar rins e gônadas nas fossas ventrais.',
    morph: 'Estrutura alongada com fossas renais ventrais e fusão dorsal ao ílio.',
    clin: 'Fraturas e deformidades por manejo/traumas; paralisia por compressão em aves jovens.',
    curio: ['A pelve aviária é fusionada ao sinsacro e aberta ventralmente.'],
    lm: [
      L('Fossa renal', 'Fossa renalis', 'fossa', [0, -0.8, 0.3], 'Face ventral do sinsacro, entre os ílios.', 'Aloja os rins.', ['Rins'], null),
      L('Crista dorsal do sinsacro', null, 'crista', [0, 1, 0], 'Face dorsal.', 'Resulta da fusão dos processos espinhosos.', [], null)
    ]
  },
  vert_caudal: {
    pt: 'Vértebras caudais livres (série)', latin: 'Vertebrae caudales', popular: 'Vértebras da cauda', side: 'median',
    div: 'axial', region: 'vertebral_column', sub: 'caudal', shape: 'av_caudal_series', group: 'vertebral_column', dir: [-1, 0.2, 0],
    desc: 'Pequenas vértebras móveis entre o sinsacro e o pigóstilo; representadas como uma série única.',
    loc: 'Cauda, entre o sinsacro e o pigóstilo.',
    func: 'Permitir mobilidade da cauda (direção e equilíbrio).',
    morph: 'Vértebras curtas com processos transversos e espinhoso reduzidos.',
    clin: 'Lesões raras.',
    curio: ['O número de vértebras caudais livres é variável entre as aves.'],
    unverified: ['O número exato de vértebras caudais livres na galinha não foi verificado nesta versão.'],
    lm: [L('Corpos vertebrais caudais', null, 'corpo', [0, 0, 0], 'Segmentos da série.', 'Sustentam a cauda.', [], null)]
  },
  pygostyle: {
    pt: 'Pigóstilo', latin: 'Pygostylus', popular: 'Osso da cauda; "sambiquira"', side: 'median',
    div: 'axial', region: 'vertebral_column', sub: 'caudal', shape: 'pygostyle', group: 'vertebral_column', dir: [-1, 0.3, 0],
    desc: 'Osso terminal da cauda formado pela fusão das últimas vértebras caudais; sustenta as penas retrizes e o bulbo retricial.',
    loc: 'Extremidade caudal da coluna.',
    func: 'Suportar as penas da cauda (retrizes) e o tecido do bulbo retricial.',
    morph: 'Lâmina óssea em forma de arado que se projeta dorsal e caudalmente.',
    clin: 'Inflamações e traumas na região da glândula uropigial adjacente.',
    curio: ['O pigóstilo é uma característica das aves modernas e de alguns dinossauros avianos.'],
    lm: [L('Lâmina do pigóstilo', 'Lamina pygostyli', 'crista', [0, 0.4, 0], 'Face dorsal e caudal.', 'Superfície de inserção das retrizes.', ['Penas retrizes'], null)]
  },
  rib: {
    pt: 'Costela {n}', latin: 'Costa {n}', popular: 'Costela', side: 'both', serial: true,
    div: 'axial', region: 'thoracic_cage', sub: 'ribs', shape: 'av_rib', group: 'thoracic_cage', dir: [0, 0.4, 1],
    desc: 'Costela em duas partes (vertebral e esternal) articuladas, com processo uncinado que sobrepõe a costela seguinte, característico das aves.',
    loc: 'Parede lateral do tórax; articula-se com a vértebra torácica correspondente e, ventralmente, com o esterno.',
    func: 'Proteger órgãos, sustentar o esterno e participar dos movimentos de ventilação (movimento esternal).',
    morph: 'Cabeça e tubérculo para a vértebra, corpo e processo uncinado na maioria das costelas.',
    clin: 'Fraturas costais por trauma; a rigidez torácica dificulta a ventilação em compressões do corpo.',
    curio: ['Os processos uncinados reforçam a caixa torácica e fornecem inserção a músculos da respiração.'],
    unverified: ['O número de pares de costelas e a presença de processo uncinado em cada uma variam entre fontes (5 a 7 pares); o modelo usa 7 pares.'],
    lm: [
      L('Cabeça da costela', 'Caput costae', 'extremidade', [-0.1, 1, -0.2], 'Extremidade dorsal.', 'Articulação com a vértebra.', ['Vértebra torácica'], null),
      L('Tubérculo da costela', 'Tuberculum costae', 'tubérculo', [-0.1, 0.85, 0.3], 'Próximo ao colo.', 'Articulação com o processo transverso.', ['Vértebra torácica'], null),
      L('Processo uncinado', 'Processus uncinatus', 'processo', [-0.5, 0.2, 0.9], 'Projeção caudal do corpo.', 'Sobrepõe-se à costela seguinte, reforçando a caixa torácica.', ['Costela seguinte'], null)
    ]
  },
  sternum: {
    pt: 'Esterno e carena', latin: 'Sternum (Carina sterni)', popular: 'Osso do peito; quilha', side: 'median',
    div: 'axial', region: 'thoracic_cage', sub: 'sternum', shape: 'av_sternum', group: 'thoracic_cage', dir: [0.3, -1, 0],
    desc: 'Osso largo e côncavo com uma carena (quilha) mediana, que fornece inserção aos músculos peitorais, os principais músculos do voo.',
    loc: 'Parede ventral do tórax e do abdômen cranial.',
    func: 'Proteger o coração e o fígado e oferecer superfície de inserção para os músculos peitorais.',
    morph: 'Corpo largo, carena ventral, rostro esternal, sulcos para os coracoides e articulações para as costelas esternais.',
    clin: 'Deformidades e fraturas da carena são problema de bem-estar em galinhas poedeiras; a massa peitoral é avaliada em aves de corte.',
    curio: ['A carena é grande em aves voadoras e reduzida ou ausente em aves não voadoras (ratitas).'],
    lm: [
      L('Carena do esterno', 'Carina sterni', 'crista', [0, -1, 0], 'Crista mediana ventral.', 'Inserção dos músculos peitoral e supracoracoide.', ['Músculos peitorais'], 'Deformidades e fraturas da carena ocorrem em poedeiras.'),
      L('Rostro esternal', 'Rostrum sterni', 'processo', [1, 0.1, 0], 'Extremidade cranial.', 'Sustenta o contato com os coracoides.', ['Coracoides'], null),
      L('Sulco coracoideo', 'Sulcus articularis coracoideus', 'faceta articular', [0.7, 0.4, 0.5], 'Margem cranial lateral.', 'Articula-se com o coracoide.', ['Coracoide'], null)
    ]
  },
  furcula: {
    pt: 'Fúrcula (clavículas fundidas)', latin: 'Furcula (clavicula)', popular: 'Osso da sorte; "forquilha"', side: 'median',
    div: 'appendicular', region: 'thoracic_limb', sub: 'pectoral_girdle', shape: 'furcula', group: 'thoracic_limb', dir: [0.8, 0.3, 0],
    desc: 'Osso em "V" formado pela fusão das clavículas, que funciona como mola elástica durante o voo.',
    loc: 'Entre os dois ombros, cranial ao esterno.',
    func: 'Afastar os ombros e armazenar energia elástica durante o batimento das asas.',
    morph: 'Dois ramos (clavículas) que se unem ventralmente por um hipocleídio.',
    clin: 'Fraturas por trauma em voo.',
    curio: ['A fúrcula é popularmente chamada de "osso da sorte".'],
    lm: [
      L('Apófise da fúrcula', 'Apophysis furculae', 'processo', [0, -1, 0], 'Ápice ventral do V.', 'Liga-se à membrana esternocoracoide e à carena.', ['Esterno'], null),
      L('Extremidade omal', 'Extremitas omalis claviculae', 'extremidade', [0.1, 1, 1], 'Extremidade dorsal.', 'Articula-se com o acrocoracoide.', ['Coracoide'], null)
    ]
  },
  coracoid: {
    pt: 'Coracoide', latin: 'Os coracoideum', popular: 'Coracoide', side: 'both',
    div: 'appendicular', region: 'thoracic_limb', sub: 'pectoral_girdle', shape: 'coracoid', group: 'thoracic_limb', dir: [0.4, 0.2, 1],
    desc: 'Osso robusto que liga o ombro ao esterno, funcionando como escora que resiste à compressão do batimento das asas.',
    loc: 'Entre a escápula (e o úmero) e o esterno.',
    func: 'Manter a distância entre o esterno e o ombro e sustentar a cintura peitoral durante o voo.',
    morph: 'Corpo curto e robusto com extremidade esternal larga e extremidade omal com cótila escapular.',
    clin: 'Fraturas por trauma; local de articulação do ombro.',
    curio: ['Nos mamíferos, o coracoide está reduzido a um processo da escápula.'],
    lm: [
      L('Processo acrocoracoide', 'Processus acrocoracoideus', 'processo', [0.4, 1, 0.4], 'Extremidade omal.', 'Articula-se com a clavícula e forma o canal triósseo.', ['Fúrcula'], null),
      L('Cótila escapular', 'Cotyla scapularis', 'faceta articular', [0, 0.8, -0.6], 'Extremidade omal, face medial.', 'Articula-se com a escápula.', ['Escápula'], null),
      L('Face articular esternal', 'Facies articularis sternalis', 'faceta articular', [0, -1, 0], 'Extremidade esternal.', 'Articula-se com o sulco coracoideo do esterno.', ['Esterno'], null)
    ]
  },
  scapula: {
    pt: 'Escápula', latin: 'Scapula', popular: 'Omoplata', side: 'both',
    div: 'appendicular', region: 'thoracic_limb', sub: 'pectoral_girdle', shape: 'av_scapula', group: 'thoracic_limb', dir: [-0.3, 0.7, 1],
    desc: 'Osso alongado em forma de lâmina fina de sabre, que acompanha a coluna sobre as costelas.',
    loc: 'Lateralmente à coluna torácica e às costelas.',
    func: 'Sustentar a articulação do ombro e a inserção dos músculos da asa.',
    morph: 'Corpo alongado e delgado com acrômio cranial e face articular umeral.',
    clin: 'Fraturas raras; pode lesionar-se em traumas das asas.',
    curio: ['Nas aves, o ombro (escápula + coracoide) forma a articulação com o úmero.'],
    lm: [
      L('Acrômio', 'Acromion', 'processo', [1, 0.4, 0.3], 'Extremidade cranial.', 'Contribui com a articulação do ombro e a inserção muscular.', ['Fúrcula', 'Coracoide'], null),
      L('Face articular umeral', 'Facies articularis humeralis', 'faceta articular', [0.8, -0.2, 0.3], 'Extremidade cranial, face lateral.', 'Articula-se com o úmero.', ['Úmero'], null)
    ]
  },
  humerus: {
    pt: 'Úmero', latin: 'Humerus', popular: 'Osso da asa (braço)', side: 'both',
    div: 'appendicular', region: 'thoracic_limb', sub: 'arm', shape: 'av_humerus', group: 'thoracic_limb', dir: [0.2, 0.1, 1],
    desc: 'Osso longo e pneumático da asa, entre o ombro e o cotovelo.',
    loc: 'Entre o ombro e o cotovelo, dobrado junto ao corpo quando a asa está recolhida.',
    func: 'Sustentar a asa e transmitir a força dos músculos peitorais.',
    morph: 'Cabeça proximal, crista deltopeitoral, fossa pneumotricipital com forame pneumático e côndilos distais.',
    clin: 'Por ser pneumático, o úmero comunica-se com o sistema respiratório (saco aéreo clavicular): em fraturas abertas pode haver entrada de ar; o úmero não é local de infusão intraóssea. Informação educacional — não é recomendação clínica.',
    curio: ['A pneumatização do úmero reduz o peso do esqueleto.'],
    lm: [
      L('Cabeça do úmero', 'Caput humeri', 'extremidade', [-0.1, 1, 0], 'Extremidade proximal.', 'Articula-se com a escápula e o coracoide.', ['Escápula', 'Coracoide'], null),
      L('Crista deltopeitoral', 'Crista deltopectoralis', 'crista', [0.8, 0.7, 0.2], 'Face cranial proximal.', 'Inserção dos músculos peitorais e deltoide.', ['Músculo peitoral'], null),
      L('Fossa pneumotricipital', 'Fossa pneumotricipitalis', 'fossa', [-0.5, 0.8, -0.3], 'Face caudal proximal.', 'Contém o forame pneumático que comunica o osso com o saco aéreo.', ['Saco aéreo clavicular'], 'Local de pneumatização do úmero.')
    ]
  },
  radius: {
    pt: 'Rádio', latin: 'Radius', popular: 'Osso do antebraço (delgado)', side: 'both',
    div: 'appendicular', region: 'thoracic_limb', sub: 'forearm', shape: 'av_radius', group: 'thoracic_limb', dir: [0.5, 0, 1],
    desc: 'Osso delgado do antebraço da asa, ao lado da ulna.', loc: 'Antebraço da asa, cranial à ulna.',
    func: 'Mover a articulação do cotovelo e do carpo; formar o antebraço junto com a ulna.',
    morph: 'Corpo fino e reto, cabeça proximal e extremidade distal articulada ao carpo.',
    clin: 'Fraturas distais em lesões da asa.', curio: ['A ulna é maior que o rádio nas aves.'],
    lm: [L('Extremidade distal do rádio', 'Extremitas distalis radii', 'extremidade', [0, -1, 0], 'Extremidade distal.', 'Articula-se com o carpo.', ['Carpometacarpo'], null)]
  },
  ulna: {
    pt: 'Ulna', latin: 'Ulna', popular: 'Osso do antebraço (robusto)', side: 'both',
    div: 'appendicular', region: 'thoracic_limb', sub: 'forearm', shape: 'av_ulna', group: 'thoracic_limb', dir: [-0.5, 0, 1],
    desc: 'Osso mais robusto do antebraço; apresenta papilas remigais que ancoram as penas secundárias de voo.', loc: 'Antebraço da asa, caudal ao rádio.',
    func: 'Sustentar as penas secundárias de voo e servir de eixo do antebraço.',
    morph: 'Corpo curvo, olécrano proximal e papilas remigais (pequenas saliências) na face caudal.',
    clin: 'A ulna distal é opção para acesso intraósseo em algumas aves (informação educacional; não é recomendação clínica).',
    curio: ['As papilas remigais marcam os pontos de inserção dos ligamentos das penas secundárias.'],
    lm: [
      L('Papilas remigais', 'Papillae remigales caudales', 'tubérculo', [-0.9, 0, 0.3], 'Face caudal do corpo.', 'Ancoram as penas secundárias de voo.', ['Penas secundárias'], null),
      L('Olécrano', 'Olecranon', 'processo', [-0.5, 1, 0], 'Extremidade proximal.', 'Alavanca para o músculo tríceps.', ['Músculo tríceps'], null)
    ]
  },
  carpometacarpus: {
    pt: 'Carpometacarpo', latin: 'Os carpometacarpale', popular: 'Osso da "mão" da asa', side: 'both',
    div: 'appendicular', region: 'thoracic_limb', sub: 'manus', shape: 'carpometacarpus', group: 'thoracic_limb', dir: [0.3, -0.5, 1],
    desc: 'Osso resultante da fusão de ossos carpais distais com os metacarpais II, III e IV.', loc: 'Extremidade distal da asa, entre o antebraço e os dígitos.',
    func: 'Suportar as penas primárias de voo e transmitir a força aos dígitos.',
    morph: 'Fusão proximal e distal, com espaço intermetacarpal e processo extensor.',
    clin: 'Fraturas distais da asa em traumas de voo; amputação da ponta da asa (patagiectomia) é discutida em bem-estar.',
    curio: ['A fusão reduz o número de articulações e aumenta a rigidez da asa.'],
    lm: [
      L('Processo extensor', 'Processus extensorius', 'processo', [0.8, 0.8, 0.2], 'Extremidade proximal, face cranial.', 'Inserção do músculo extensor do carpo radial.', ['Músculo extensor do carpo'], null),
      L('Espaço intermetacarpal', 'Spatium intermetacarpale', 'fossa', [0, 0, 0], 'Entre os metacarpais maior e menor.', 'Separação entre os dois ossos metacarpais fundidos.', [], null)
    ]
  },
  wing_digits: {
    pt: 'Falanges da asa (dígitos)', latin: 'Ossa digitorum manus', popular: 'Pontas da asa', side: 'both',
    div: 'appendicular', region: 'thoracic_limb', sub: 'manus', shape: 'wing_digits', group: 'thoracic_limb', dir: [0.8, -0.4, 1],
    desc: 'Poucas falanges nos dígitos alular, maior e menor, que sustentam as penas primárias; representadas como peça única.', loc: 'Extremidade distal da asa.',
    func: 'Sustentar as penas primárias e a álula (pequenas penas que controlam o fluxo de ar).',
    morph: 'Falanges curtas e finas.', clin: 'Lesões da ponta da asa em traumas e em manejo.',
    curio: ['A asa da galinha tem poucos dígitos, com fusão e redução dos ossos da mão.'],
    unverified: ['O número exato de falanges por dígito não foi verificado nesta versão; consultar Baumel et al. (1993).'],
    lm: [L('Falange do dígito maior', 'Phalanges digiti majoris', 'extremidade', [1, 0, 0], 'Extremidade distal.', 'Suporte de penas primárias.', ['Penas primárias'], null)]
  },
  pelvis: {
    pt: 'Osso do quadril (ílio, ísquio e púbis)', latin: 'Os coxae', popular: 'Osso da bacia', side: 'both',
    div: 'appendicular', region: 'pelvic_limb', sub: 'pelvic_girdle', shape: 'av_pelvis', group: ['pelvic_limb', 'pelvis'], dir: [-0.3, 0.2, 1],
    desc: 'Osso largo formado pela fusão de ílio, ísquio e púbis; aberto ventralmente (sem sínfise púbica), o que facilita a postura de ovos.',
    loc: 'Lateralmente ao sinsacro, ao qual se funde.',
    func: 'Suportar o peso do corpo e articular com o fêmur; proteger rins e órgãos reprodutivos.',
    morph: 'Ílio pré e pós-acetabular, ísquio, púbis delgado, acetábulo aberto com antitrocânter e forame ilioisquiático.',
    clin: 'Fraturas pélvicas em aves; lesões associadas à postura de ovos.',
    curio: ['A pelve aberta ventralmente permite a passagem de ovos grandes.'],
    lm: [
      L('Acetábulo', 'Acetabulum', 'faceta articular', [0, -0.1, 1], 'Lateral, onde ílio e ísquio se encontram.', 'Articula-se com o fêmur.', ['Fêmur'], null),
      L('Antitrocânter', 'Antitrochanter', 'processo', [-0.2, 0.2, 1], 'Caudodorsal ao acetábulo.', 'Apoia o trocânter do fêmur, limitando a abdução.', ['Fêmur'], null),
      L('Forame ilioisquiático', 'Foramen ilioischiadicum', 'forame', [-0.4, 0, 0.8], 'Caudal ao acetábulo.', 'Passagem de vasos e do nervo isquiático.', ['Nervo isquiático'], null)
    ]
  },
  femur: {
    pt: 'Fêmur', latin: 'Femur', popular: 'Osso da coxa', side: 'both',
    div: 'appendicular', region: 'pelvic_limb', sub: 'thigh', shape: 'av_femur', group: 'pelvic_limb', dir: [0.4, 0.2, 1],
    desc: 'Osso curto e robusto, quase horizontal em repouso; escondido sob a pele e as penas.', loc: 'Entre a pelve e o joelho.',
    func: 'Suportar a carga e transmitir a propulsão.',
    morph: 'Cabeça com trocânter proximal, côndilos distais e fossa poplítea.',
    clin: 'Fraturas em aves; a necrose da cabeça do fêmur (osteomielite) é descrita em frangos de corte.',
    curio: ['O fêmur fica escondido junto ao corpo; o segmento livre mais visível da perna é o tibiotarso.'],
    lm: [
      L('Cabeça do fêmur', 'Caput femoris', 'extremidade', [-0.4, 1, -0.5], 'Extremidade proximal medial.', 'Articula-se com o acetábulo.', ['Pelve'], null),
      L('Trocânter do fêmur', 'Trochanter femoris', 'processo', [0, 1, 0.8], 'Extremidade proximal lateral.', 'Inserção muscular; apoia-se no antitrocânter.', ['Antitrocânter'], null),
      L('Côndilos do fêmur', 'Condyli femoris', 'côndilo', [0.4, -1, 0], 'Extremidade distal.', 'Articulam-se com o tibiotarso.', ['Tibiotarso'], null)
    ]
  },
  tibiotarsus: {
    pt: 'Tibiotarso', latin: 'Tibiotarsus', popular: 'Osso da perna ("coxa" na culinária)', side: 'both',
    div: 'appendicular', region: 'pelvic_limb', sub: 'leg', shape: 'tibiotarsus', group: 'pelvic_limb', dir: [0.4, 0, 1],
    desc: 'Osso longo formado pela tíbia e fileira proximal de ossos do tarso fundidos.', loc: 'Entre o joelho e o tarsometatarso.',
    func: 'Suportar a maior parte da carga da perna e transmitir a propulsão.',
    morph: 'Cristas cnemiais proximais, côndilos distais e ponte supratendínea.',
    clin: 'A discondroplasia tibial é uma afecção do crescimento em frangos de corte; a região proximal do tibiotarso é usada como local de acesso intraósseo em aves (informação educacional; não é recomendação clínica).',
    curio: ['Na culinária brasileira, a "coxa" corresponde ao segmento do tibiotarso e a "sobrecoxa" ao segmento do fêmur.'],
    unverified: ['A correspondência entre cortes culinários e ossos é informal e pode variar regionalmente; informação ilustrativa.'],
    lm: [
      L('Crista cnemial cranial', 'Crista cnemialis cranialis', 'crista', [0.9, 0.9, 0], 'Face cranial proximal.', 'Inserção do músculo quadríceps.', ['Músculo quadríceps femoral'], null),
      L('Côndilos do tibiotarso', 'Condyli tibiotarsi', 'côndilo', [0.4, -1, 0], 'Extremidade distal.', 'Articulam-se com o tarsometatarso.', ['Tarsometatarso'], null),
      L('Ponte supratendínea', 'Pons supratendineus', 'ponte', [0.6, -0.8, 0], 'Face cranial distal.', 'Mantém o tendão extensor no lugar.', ['Tendão extensor'], null)
    ]
  },
  fibula: {
    pt: 'Fíbula (reduzida)', latin: 'Fibula', popular: 'Osso delgado da perna', side: 'both',
    div: 'appendicular', region: 'pelvic_limb', sub: 'leg', shape: 'av_fibula', group: 'pelvic_limb', dir: [-0.2, 0, 1],
    desc: 'Osso delgado e curto, reduzido proximalmente ao lado do tibiotarso.', loc: 'Lateralmente à porção proximal do tibiotarso.',
    func: 'Inserção muscular e estabilização lateral do joelho.', morph: 'Haste fina com cabeça proximal.', clin: 'Raramente clínica.',
    curio: ['A fíbula aviária é reduzida e parte dela se une ao tibiotarso.'],
    lm: [L('Cabeça da fíbula', 'Caput fibulae', 'extremidade', [0, 1, 0], 'Extremidade proximal.', 'Articula-se com o fêmur e o tibiotarso.', ['Fêmur'], null)]
  },
  tarsometatarsus: {
    pt: 'Tarsometatarso', latin: 'Tarsometatarsus', popular: 'Canela da ave; "pé" sem as garras', side: 'both',
    div: 'appendicular', region: 'pelvic_limb', sub: 'pes', shape: 'tarsometatarsus', group: 'pelvic_limb', dir: [0.1, -0.7, 1],
    desc: 'Osso longo originado da fusão de ossos tarsais distais com os metatarsais II, III e IV; forma a "canela" da ave.', loc: 'Entre o tibiotarso e os dígitos.',
    func: 'Suportar a carga e dar alavanca ao passo.',
    morph: 'Hipotarso proximal, corpo longo e três tróclea distais; nos galos, núcleo ósseo do esporão.',
    clin: 'Pododermatite e traumas locais; manejo do esporão em machos.',
    curio: ['O esporão do galo é um estojo córneo apoiado sobre um núcleo ósseo do tarsometatarso.'],
    unverified: ['A terminologia do núcleo ósseo do esporão deve ser conferida na NAA.'],
    lm: [
      L('Hipotarso', 'Hypotarsus', 'crista', [-0.8, 0.9, 0], 'Face plantar proximal.', 'Canais para tendões flexores dos dígitos.', ['Tendões flexores'], null),
      L('Núcleo ósseo do esporão', 'Processus calcaris', 'processo', [0, 0.35, -0.9], 'Face medial proximal (machos).', 'Sustenta o esporão córneo.', [], null),
      L('Tróclea metatarsal', 'Trochleae metatarsorum', 'faceta articular', [0.3, -1, 0], 'Extremidade distal.', 'Articulam-se com os dígitos.', ['Falanges do pé'], null)
    ]
  },
  pedal_digits: {
    pt: 'Falanges do pé (dígitos I–IV)', latin: 'Ossa digitorum pedis', popular: 'Dedos do pé', side: 'both',
    div: 'appendicular', region: 'pelvic_limb', sub: 'pes', shape: 'pedal_digits', group: 'pelvic_limb', dir: [1, -0.5, 1],
    desc: 'Quatro dígitos: o I (hálux) caudal e os II–IV cranais (arranjo anisodáctilo), terminando em garras; representados como peça única.',
    loc: 'Extremidade distal do membro pélvico.',
    func: 'Apoiar o peso, agarrar poleiros e raspar o solo.',
    morph: 'Falanges em série, com falange ungueal em cada dígito.',
    clin: 'Pododermatite (bumblefoot), deformidades de dedos e traumas da garra.',
    curio: ['O comportamento de raspar o solo é típico das galiformes.'],
    unverified: ['A fórmula falangeana do pé (padrão geral 2-3-4-5 nos dígitos I-IV) foi registrada de forma geral e deve ser conferida.'],
    lm: [L('Falange ungueal', 'Phalanx ungualis', 'extremidade', [1, -0.6, 0], 'Extremidade distal de cada dígito.', 'Sustenta a garra.', ['Garra'], null)]
  }
};

export const AV_CFG = {
  cervicalCount: 14, thoracicFree: [1, 6], ribs: 7, sternalRibs: 7
};

