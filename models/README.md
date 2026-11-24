# Modelos Anatômicos 3D Segmentados

Coloque aqui os arquivos `.glb`, `.gltf` ou `.obj` segmentados por osso e atualize `models/manifest.json` definindo `"file": "models/<especie>/skeleton.glb"`.

## Convenção de nomes de malha (`meshName`)
Cada malha independente dentro do modelo deve possuir exatamente o `meshName` definido em `data/<especie>/osteology.json` (por exemplo: `bovine_scapula_left`, `equine_femur_right`, `avian_sternum`).

Enquanto nenhum arquivo externo estiver configurado no manifesto, o **ATLAS VET 3D** inicializa automaticamente o **Construtor Anatômico Articulado Demonstrativo**, exibindo claramente no visualizador que a geometria é ilustrativa. Também é possível carregar arquivos `.glb`/`.gltf` locais diretamente pelo botão **Importar GLB/GLTF** dentro do Laboratório 3D.
