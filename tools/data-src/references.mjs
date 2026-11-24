// Biblioteca científica: SOMENTE obras reais e verificáveis (livros-texto e nomenclaturas oficiais).
// Regras: não há DOI/ISBN preenchido quando não foi conferido; "url" aponta para páginas institucionais
// estáveis ou para buscas públicas (Google Livros / PubMed / SciELO), nunca para páginas inventadas.
const gb = (q) => 'https://www.google.com/search?tbm=bks&q=' + encodeURIComponent(q);

export const REFERENCES = [
  {
    id: 'konig_liebich_2016', type: 'livro',
    title: 'Anatomia dos Animais Domésticos: Texto e Atlas Colorido',
    authors: ['König, H. E.', 'Liebich, H.-G.'], year: 2016, edition: '6ª ed. (tradução brasileira)',
    publisher: 'Artmed', doi: null, isbn: null,
    url: gb('König Liebich Anatomia dos Animais Domésticos Texto e Atlas Colorido'), urlLabel: 'Buscar no Google Livros',
    speciesCovered: ['bovine', 'equine', 'caprine', 'ovine', 'swine', 'canine', 'feline', 'avian'], systemsCovered: ['osteology', 'arthrology', 'myology'],
    summary: 'Texto e atlas de anatomia dos mamíferos domésticos e das aves; inclui sistema esquelético de todas as espécies do atlas.'
  },
  {
    id: 'dyce_2010', type: 'livro',
    title: "Dyce, Sack and Wensing's Textbook of Veterinary Anatomy",
    authors: ['Dyce, K. M.', 'Sack, W. O.', 'Wensing, C. J. G.'], year: 2010, edition: '4ª ed.',
    publisher: 'Saunders/Elsevier', doi: null, isbn: null,
    url: gb("Dyce Sack Wensing Textbook of Veterinary Anatomy"), urlLabel: 'Buscar no Google Livros',
    speciesCovered: ['bovine', 'equine', 'caprine', 'ovine', 'swine', 'canine', 'feline', 'avian'], systemsCovered: ['osteology', 'arthrology', 'myology'],
    summary: 'Livro-texto de referência com abordagem regional e comparada dos animais domésticos, com capítulos específicos para cada grupo.'
  },
  {
    id: 'getty_1975', type: 'livro',
    title: "Sisson and Grossman's The Anatomy of the Domestic Animals",
    authors: ['Getty, R.'], year: 1975, edition: '5ª ed. (2 volumes)',
    publisher: 'W. B. Saunders', doi: null, isbn: null,
    url: gb('Getty Sisson and Grossman The Anatomy of the Domestic Animals'), urlLabel: 'Buscar no Google Livros',
    speciesCovered: ['bovine', 'equine', 'caprine', 'ovine', 'swine', 'canine', 'avian'], systemsCovered: ['osteology', 'arthrology', 'myology'],
    summary: 'Tratado clássico de anatomia descritiva comparada dos animais domésticos, incluindo detalhada osteologia por espécie.'
  },
  {
    id: 'nickel_1986', type: 'livro',
    title: 'The Anatomy of the Domestic Animals, Vol. 1: The Locomotor System of the Domestic Mammals',
    authors: ['Nickel, R.', 'Schummer, A.', 'Seiferle, E.'], year: 1986, edition: 'tradução inglesa (Verlag Paul Parey)',
    publisher: 'Verlag Paul Parey', doi: null, isbn: null,
    url: gb('Nickel Schummer Seiferle The Locomotor System of the Domestic Mammals'), urlLabel: 'Buscar no Google Livros',
    speciesCovered: ['bovine', 'equine', 'caprine', 'ovine', 'swine', 'canine', 'feline'], systemsCovered: ['osteology', 'arthrology', 'myology'],
    summary: 'Volume dedicado ao sistema locomotor (ossos, articulações e músculos) dos mamíferos domésticos.'
  },
  {
    id: 'evans_delahunta_2013', type: 'livro',
    title: "Miller's Anatomy of the Dog",
    authors: ['Evans, H. E.', 'de Lahunta, A.'], year: 2013, edition: '4ª ed.',
    publisher: 'Elsevier Saunders', doi: null, isbn: null,
    url: gb("Evans de Lahunta Miller's Anatomy of the Dog"), urlLabel: 'Buscar no Google Livros',
    speciesCovered: ['canine'], systemsCovered: ['osteology', 'arthrology', 'myology', 'nervous', 'circulatory'],
    summary: 'Referência principal em anatomia do cão; osteologia detalhada com nomenclatura NAV.'
  },
  {
    id: 'hudson_hamilton_1993', type: 'livro',
    title: 'Atlas of Feline Anatomy for Veterinarians',
    authors: ['Hudson, L. C.', 'Hamilton, W. P.'], year: 1993, edition: '1ª ed.',
    publisher: 'W. B. Saunders', doi: null, isbn: null,
    url: gb('Hudson Hamilton Atlas of Feline Anatomy for Veterinarians'), urlLabel: 'Buscar no Google Livros',
    speciesCovered: ['feline'], systemsCovered: ['osteology', 'myology'],
    summary: 'Atlas dedicado à anatomia do gato doméstico, com ilustrações do esqueleto.'
  },
  {
    id: 'popesko_1992', type: 'livro',
    title: 'Atlas of Topographical Anatomy of the Domestic Animals',
    authors: ['Popesko, P.'], year: 1992, edition: '3ª ed.',
    publisher: 'W. B. Saunders', doi: null, isbn: null,
    url: gb('Popesko Atlas of Topographical Anatomy of the Domestic Animals'), urlLabel: 'Buscar no Google Livros',
    speciesCovered: ['bovine', 'equine', 'caprine', 'ovine', 'swine', 'canine', 'feline'], systemsCovered: ['osteology', 'myology'],
    summary: 'Atlas topográfico com relações regionais e marcos palpáveis dos animais domésticos.'
  },
  {
    id: 'baumel_1993', type: 'livro',
    title: 'Handbook of Avian Anatomy: Nomina Anatomica Avium',
    authors: ['Baumel, J. J.', 'King, A. S.', 'Breazile, J. E.', 'Evans, H. E.', 'Vanden Berge, J. C.'], year: 1993, edition: '2ª ed. (Publications of the Nuttall Ornithological Club, nº 23)',
    publisher: 'Nuttall Ornithological Club', doi: null, isbn: null,
    url: gb('Baumel Handbook of Avian Anatomy Nomina Anatomica Avium'), urlLabel: 'Buscar no Google Livros',
    speciesCovered: ['avian'], systemsCovered: ['osteology', 'arthrology', 'myology'],
    summary: 'Nomenclatura oficial da anatomia das aves (NAA), base da terminologia latina usada no módulo aviário.'
  },
  {
    id: 'king_mclelland_1984', type: 'livro',
    title: 'Birds: Their Structure and Function',
    authors: ['King, A. S.', 'McLelland, J.'], year: 1984, edition: '2ª ed.',
    publisher: 'Baillière Tindall', doi: null, isbn: null,
    url: gb('King McLelland Birds Their Structure and Function'), urlLabel: 'Buscar no Google Livros',
    speciesCovered: ['avian'], systemsCovered: ['osteology', 'respiratory', 'digestive', 'reproductive'],
    summary: 'Texto de anatomia e fisiologia aviárias, incluindo o esqueleto e a pneumatização óssea.'
  },
  {
    id: 'nav_2017', type: 'nomenclatura',
    title: 'Nomina Anatomica Veterinaria',
    authors: ['International Committee on Veterinary Gross Anatomical Nomenclature (I.C.V.G.A.N.)'], year: 2017, edition: '6ª ed. (revisada)',
    publisher: 'World Association of Veterinary Anatomists (WAVA)', doi: null, isbn: null,
    url: 'https://www.wava-amav.org/', urlLabel: 'Site oficial da WAVA',
    speciesCovered: ['bovine', 'equine', 'caprine', 'ovine', 'swine', 'canine', 'feline'], systemsCovered: ['osteology', 'arthrology', 'myology', 'nervous', 'circulatory', 'respiratory', 'digestive', 'urinary', 'reproductive'],
    summary: 'Terminologia anatômica veterinária oficial; adotada para os termos latinos dos mamíferos.'
  },
  {
    id: 'pubmed', type: 'base de dados',
    title: 'PubMed (National Library of Medicine)', authors: ['U.S. National Library of Medicine'], year: null, edition: null,
    publisher: 'NCBI/NLM', doi: null, isbn: null,
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=veterinary+anatomy+skeleton', urlLabel: 'Buscar "veterinary anatomy skeleton" no PubMed',
    speciesCovered: [], systemsCovered: ['osteology'],
    summary: 'Base para localizar artigos revisados por pares. Nenhum artigo específico foi catalogado nesta versão (sem DOI conferido).'
  },
  {
    id: 'scielo', type: 'base de dados',
    title: 'SciELO Brasil', authors: ['SciELO'], year: null, edition: null,
    publisher: 'FAPESP/BIREME', doi: null, isbn: null,
    url: 'https://search.scielo.org/?q=anatomia+veterin%C3%A1ria+esqueleto', urlLabel: 'Buscar "anatomia veterinária esqueleto" no SciELO',
    speciesCovered: [], systemsCovered: ['osteology'],
    summary: 'Periódicos brasileiros revisados por pares (ex.: Pesquisa Veterinária Brasileira, Ciência Rural).'
  }
];

export const MAMMAL_CORE = ['dyce_2010', 'konig_liebich_2016', 'getty_1975', 'nickel_1986', 'nav_2017'];
export const SPECIES_REFS = {
  bovine: MAMMAL_CORE, equine: MAMMAL_CORE, caprine: MAMMAL_CORE, ovine: MAMMAL_CORE, swine: MAMMAL_CORE,
  canine: [...MAMMAL_CORE, 'evans_delahunta_2013'],
  feline: [...MAMMAL_CORE, 'hudson_hamilton_1993'],
  avian: ['baumel_1993', 'king_mclelland_1984', 'konig_liebich_2016', 'dyce_2010']
};
