// Metadados das espécies e dos módulos anatômicos (fonte de data/species.json).
export const SPECIES_INFO = [
  {
    id: 'bovine', name: 'Bovino', scientificName: 'Bos taurus / Bos indicus', group: 'Mamífero — ruminante (Artiodactyla)', icon: 'beef',
    locomotion: 'Ungulígrado; dígitos III e IV funcionais (cascos bipartidos)', vertebralFormula: 'C7 T13 L6 S5 Cd18–20', dentalFormula: 'I 0/3, C 0/1, P 3/3, M 3/3 (32)', withersHeightM: 1.4,
    summary: 'Ruminante de grande porte, base da pecuária de corte e leite. O esqueleto reflete a adaptação à sustentação de grande massa e ao pastejo.',
    generalCharacteristics: ['Osso incisivo sem alvéolos; coxim dental superior.', 'Rádio e ulna fundidos; metacarpais III e IV fundidos (osso canhão).', 'Processos cornuais no osso frontal (na maioria das raças).', 'Cinco vértebras sacrais fundidas.'],
    highlights: ['Pelvimetria e distocia em novilhas.', 'Doenças do casco e claudicação em gado leiteiro.', 'Descorna e seio cornual.']
  },
  {
    id: 'equine', name: 'Equino', scientificName: 'Equus ferus caballus', group: 'Mamífero — herbívoro monogástrico (Perissodactyla)', icon: 'paw-print',
    locomotion: 'Ungulígrado; monodáctilo (dígito III)', vertebralFormula: 'C7 T18 L6 S5 Cd15–21', dentalFormula: 'I 3/3, C 1/1, P 3–4/3, M 3/3 (36–44)', withersHeightM: 1.55,
    summary: 'Animal cursorial de grande porte, com um único dedo funcional. A anatomia do aparelho locomotor é central em medicina esportiva e em zootecnia equina.',
    generalCharacteristics: ['Dígito III único com falange distal contida no casco.', 'Terceiro trocânter do fêmur.', 'Processos espinhosos torácicos altos formam a base da cernelha.', '18 pares de costelas.'],
    highlights: ['Laminite e síndrome podotroclear (navicular).', 'Fraturas em lascas do carpo.', 'Fixação patelar e aparelho de sustentação.']
  },
  {
    id: 'caprine', name: 'Caprino', scientificName: 'Capra hircus', group: 'Mamífero — ruminante de pequeno porte (Artiodactyla)', icon: 'paw-print',
    locomotion: 'Ungulígrado; dígitos III e IV funcionais', vertebralFormula: 'C7 T13 L6–7 S4 Cd12–16', dentalFormula: 'I 0/3, C 0/1, P 3/3, M 3/3 (32)', withersHeightM: 0.75,
    summary: 'Pequeno ruminante rústico. O esqueleto é semelhante ao do ovino, com diferenças de formato craniano e proporções.',
    generalCharacteristics: ['Chifres presentes em ambos os sexos na maioria das raças.', 'Rádio e ulna fundidos; metápodes III e IV fundidos.', 'Sem fossa pré-orbital (presente em ovinos).'],
    highlights: ['Casqueamento e doenças podais.', 'Descorna de cabritos e implicações de bem-estar.']
  },
  {
    id: 'ovine', name: 'Ovino', scientificName: 'Ovis aries', group: 'Mamífero — ruminante de pequeno porte (Artiodactyla)', icon: 'paw-print',
    locomotion: 'Ungulígrado; dígitos III e IV funcionais', vertebralFormula: 'C7 T13 L6–7 S4 Cd16–18', dentalFormula: 'I 0/3, C 0/1, P 3/3, M 3/3 (32)', withersHeightM: 0.7,
    summary: 'Pequeno ruminante criado para lã, carne e leite. A cauda varia conforme a raça (caudas longas e curtas).',
    generalCharacteristics: ['Fossa pré-orbital descrita no crânio.', 'Rádio e ulna fundidos; metápodes III e IV fundidos.', 'Número de vértebras caudais varia entre raças.'],
    highlights: ['Caudectomia e bem-estar.', 'Casqueamento e podridão dos cascos.']
  },
  {
    id: 'swine', name: 'Suíno', scientificName: 'Sus scrofa domesticus', group: 'Mamífero — onívoro (Artiodactyla, não ruminante)', icon: 'paw-print',
    locomotion: 'Ungulígrado; tetradáctilo (III e IV de apoio, II e V acessórios)', vertebralFormula: 'C7 T14–15 L6–7 S4 Cd20–23', dentalFormula: 'I 3/3, C 1/1, P 4/4, M 3/3 (44)', withersHeightM: 0.9,
    summary: 'Animal de produção com crescimento rápido; focinho com osso rostral para fuçar. Esqueleto adaptado a hábitos onívoros.',
    generalCharacteristics: ['Osso rostral na ponta do focinho.', 'Rádio e ulna completos e fixos entre si.', 'Fíbula completa.', 'Quatro dedos com os dígitos III e IV de apoio.'],
    highlights: ['Osteocondrose e problemas de aprumos.', 'Caudectomia e corte de dentes de agulha (bem-estar).']
  },
  {
    id: 'canine', name: 'Canino', scientificName: 'Canis lupus familiaris', group: 'Mamífero — carnívoro (Carnivora)', icon: 'dog',
    locomotion: 'Digitígrado; cinco dedos torácicos e quatro pélvicos principais', vertebralFormula: 'C7 T13 L7 S3 Cd20–23', dentalFormula: 'I 3/3, C 1/1, P 4/4, M 2/3 (42)', withersHeightM: 0.6,
    summary: 'Carnívoro doméstico com enorme variação de porte e forma craniana entre raças. Principal espécie de clínica de pequenos animais.',
    generalCharacteristics: ['Rádio e ulna separados.', 'Forame supratroclear no úmero.', 'Garras não retráteis.', 'Fabelas associadas ao fêmur.'],
    highlights: ['Displasia coxofemoral e do cotovelo.', 'Ruptura do ligamento cruzado cranial (TPLO/TTA).', 'Doença do disco intervertebral.']
  },
  {
    id: 'feline', name: 'Felino', scientificName: 'Felis catus', group: 'Mamífero — carnívoro (Carnivora)', icon: 'cat',
    locomotion: 'Digitígrado; garras retráteis', vertebralFormula: 'C7 T13 L7 S3 Cd18–23', dentalFormula: 'I 3/3, C 1/1, P 3/2, M 1/1 (30)', withersHeightM: 0.25,
    summary: 'Carnívoro doméstico de esqueleto flexível, com clavícula vestigial e grande mobilidade do antebraço.',
    generalCharacteristics: ['Clavícula vestigial no músculo braquiocefálico.', 'Forame supracondilar do úmero.', 'Garras retráteis.', 'Grande mobilidade de pronação e supinação.'],
    highlights: ['Separação da sínfise mandibular em quedas.', 'Epifisiólise da cabeça do fêmur.', 'Onicectomia: tema de bem-estar.']
  },
  {
    id: 'avian', name: 'Ave — galinha', scientificName: 'Gallus gallus domesticus', group: 'Ave — Galliformes', icon: 'bird',
    locomotion: 'Bípede; vôo curto; dígitos anisodáctilos', vertebralFormula: 'C14 T7 (notário, sinsacro e pigóstilo)', dentalFormula: 'Sem dentes (bico córneo)', withersHeightM: 0.45,
    summary: 'Ave doméstica de produção, com esqueleto leve, vértebras fundidas e ossos pneumáticos (úmero). Terminologia da Nomina Anatomica Avium.',
    generalCharacteristics: ['Crânio com côndilo occipital único e osso quadrado móvel.', 'Notário, sinsacro e pigóstilo.', 'Esterno com carena e fúrcula.', 'Úmero pneumático; pelve aberta ventralmente.'],
    highlights: ['Fraturas e deformidades da carena em poedeiras.', 'Discondroplasia tibial em frangos de corte.', 'Debicagem: tema de bem-estar.']
  }
];

export const MODULES = [
  { id: 'osteology', name: 'Osteologia', icon: 'bone', implemented: true, description: 'Esqueleto e ossos individuais em 3D: ficha anatômica, marcos, vista explodida, estudo e quiz.', plannedScope: '' },
  { id: 'comparative', name: 'Anatomia comparada', icon: 'git-compare', implemented: true, description: 'Osteologia comparada lado a lado entre espécies, sem falsas equivalências. Nesta versão, o escopo é a osteologia.', plannedScope: '' },
  { id: 'arthrology', name: 'Artrologia', icon: 'link', implemented: false, description: 'Articulações, ligamentos, movimentos e classificação.', plannedScope: 'Articulações, ligamentos, movimentos e classificação funcional. Hoje as fichas ósseas listam apenas as articulações entre ossos.' },
  { id: 'myology', name: 'Miologia', icon: 'activity', implemented: false, description: 'Músculos: origem, inserção, ação e relações anatômicas.', plannedScope: 'Músculos, origem, inserção, ação e relações anatômicas.' },
  { id: 'nervous', name: 'Sistema nervoso', icon: 'brain', implemented: false, description: 'Encéfalo, medula espinhal e nervos.', plannedScope: 'Encéfalo, medula, nervos e estruturas relacionadas.' },
  { id: 'circulatory', name: 'Sistema circulatório', icon: 'heart-pulse', implemented: false, description: 'Coração, vasos e circulação.', plannedScope: 'Coração, vasos e circulação.' },
  { id: 'respiratory', name: 'Sistema respiratório', icon: 'wind', implemented: false, description: 'Narinas, cavidades, laringe, traqueia, brônquios e pulmões.', plannedScope: 'Narinas, cavidades, laringe, traqueia, brônquios e pulmões.' },
  { id: 'digestive', name: 'Sistema digestório', icon: 'utensils', implemented: false, description: 'Órgãos digestivos de ruminantes, monogástricos e aves.', plannedScope: 'Órgãos digestivos e particularidades entre ruminantes, monogástricos e aves.' },
  { id: 'urinary', name: 'Sistema urinário', icon: 'droplets', implemented: false, description: 'Rins, ureteres, bexiga e uretra.', plannedScope: 'Rins, ureteres, bexiga e uretra.' },
  { id: 'reproductive', name: 'Sistema reprodutor', icon: 'baby', implemented: false, description: 'Estruturas masculinas e femininas, com anatomia comparada.', plannedScope: 'Estruturas masculinas e femininas, com anatomia comparada.' }
];
