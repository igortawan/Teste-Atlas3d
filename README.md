# ATLAS VET 3D — Laboratório Virtual de Anatomia Animal

Plataforma educacional web interativa para ensino e estudo de anatomia veterinária e zootécnica, construída com **HTML5, CSS3, JavaScript ES6+ modular e Three.js (WebGL)** sem dependências externas em tempo de execução.

---

## Como Executar o Projeto

### Opção 1 — Atalho no Windows
Dê um duplo clique em `iniciar-atlas.bat`. O script inicia automaticamente o servidor HTTP local na porta `8080` (via Node.js ou Python) e abre o navegador padrão.

### Opção 2 — Terminal (Node.js)
```bash
node server.mjs 8080
```
Acesse em seguida: `http://localhost:8080`

### Opção 3 — Terminal (Python 3)
```bash
python -m http.server 8080
```
Acesse em seguida: `http://localhost:8080`

> **Importante:** Por usar módulos ES6 (`type="module"`) e carregamento dinâmico de JSONs via `fetch`, execute sempre por meio de um servidor HTTP local (e não abrindo `index.html` diretamente via `file://`).

---

## Recursos Implementados

- **Dashboard Científico:** Boas-vindas, retomada de estudo, métricas de progresso, tempo de estudo acumulado, desafio diário, estudos recentes, favoritos, recomendações inteligentes e panorama dos módulos (Osteologia e Anatomia Comparada completos; demais 8 sistemas listados honestamente como módulos futuros).
- **8 Espécies Domésticas:** Bovino, Equino, Caprino, Ovino, Suíno, Canino, Felino e Ave — galinha (*Gallus gallus domesticus*), cada uma com área individual, fórmulas vertebral e dentária, características gerais e osteologia dedicada (**728 estruturas** e **2.148 marcos anatômicos** cadastrados).
- **Laboratório 3D (Three.js + WebGL):**
  - Rotação 360°, zoom, pan, suporte a mouse e toque.
  - Vistas anatômicas rápidas (3D, Frontal, Cranial, Caudal, Lateral Esquerda, Lateral Direita, Dorsal, Ventral), centralização e tela cheia.
  - Seleção por raycasting com contorno geométrico luminoso, isolamento de peça, ocultação/exibição por osso ou região, modo Raio-X (transparência) e inspeção/rotação individual.
  - **Anatomia Explodida (Exploded View):** slider 0%–100%, presets, animação suave e reversa, e explosão filtrada por região (Esqueleto completo, Crânio, Coluna vertebral, Caixa torácica, Membro torácico, Membro pélvico, Pelve ou peça selecionada).
  - **Marcos Anatômicos 3D:** marcadores clicáveis posicionados sobre acidentes ósseos reais.
- **Ficha Anatômica Completa (8 abas):** Visão geral, Anatomia, Função, Articulações (navegáveis entre ossos), Aplicação clínica, Curiosidades, Comparação e Referências, além de favoritos, listas de revisão e anotações/dúvidas locais.
- **Busca Anatômica Global (`Ctrl+K`):** busca parcial e tolerante a acentos/erros de digitação em nomes PT-BR, Latim, regiões, funções, marcos e notas clínicas.
- **Estudo Ativo e Gamificação:** Modo Identificação 3D, Modo Localização 3D, Quiz Anatômico Completo, Flashcards e Revisão Inteligente sem dependência de IA externa.
- **Anatomia Comparada Lado a Lado:** dois viewports 3D em um único contexto WebGL (`setViewport`/`setScissor`), sincronização de câmeras, alternância de escala e correspondência por `homologKey` sem falsas equivalências.
- **Persistência e Backup:** armazenamento em `localStorage` com recuperação contra JSON corrompido e exportação/importação de backup `.json`.

---

## Modelos 3D Segmentados e Modo Demonstrativo

Quando não há arquivo `.glb`/`.gltf` configurado em `models/manifest.json`, o sistema ativa automaticamente o **Construtor Anatômico Articulado Demonstrativo** (`js/demoSkeletonBuilder.js`), exibindo o aviso explícito **`MODO DEMONSTRATIVO ILUSTRATIVO`** na barra superior do visualizador.

Para acoplar modelos científicos escaneados/segmentados reais:
1. Coloque o arquivo `.glb` em `models/<especie>/skeleton.glb`.
2. Nomeie cada malha independente do arquivo com o mesmo `meshName` definido em `data/<especie>/osteology.json` (ex.: `bovine_scapula_left`).
3. Atualize o campo `"file"` em `models/manifest.json`.
4. Também é possível testar qualquer `.glb`, `.gltf` ou `.obj` diretamente pela opção **Importar GLB/GLTF** no topo do Laboratório 3D.

---

## Validação Automatizada

Para validar integridade referencial de todos os dados JSON e sintaxe dos módulos JavaScript:
```bash
node tools/validate-data.mjs
```

---

## Referências Bibliográficas Base

- **König, H. E.; Liebich, H.-G.** — *Anatomia dos Animais Domésticos: Texto e Atlas Colorido*
- **Dyce, K. M.; Sack, W. O.; Wensing, C. J. G.** — *Textbook of Veterinary Anatomy*
- **Getty, R.** — *Sisson and Grossman's The Anatomy of the Domestic Animals*
- **Nickel, R.; Schummer, A.; Seiferle, E.** — *The Anatomy of the Domestic Animals, Vol. 1*
- **Evans, H. E.; de Lahunta, A.** — *Miller's Anatomy of the Dog*
- **Hudson, L. C.; Hamilton, W. P.** — *Atlas of Feline Anatomy for Veterinarians*
- **Popesko, P.** — *Atlas of Topographical Anatomy of the Domestic Animals*
- **Baumel, J. J. et al.** — *Handbook of Avian Anatomy: Nomina Anatomica Avium*
- **King, A. S.; McLelland, J.** — *Birds: Their Structure and Function*
- **I.C.V.G.A.N. (WAVA)** — *Nomina Anatomica Veterinaria (NAV)*
