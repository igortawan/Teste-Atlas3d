/**
 * Ilustrações vetoriais anatômicas estilizadas (silhuetas osteológicas) para as 8 espécies iniciais.
 */
const SILHOUETTES = {
  bovine: `<svg viewBox="0 0 240 130" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M55 44 C78 36 125 36 168 42 L195 30 L214 38 L206 54 L182 54 L165 68 L138 74 L74 72 L56 62 Z" opacity=".2" fill="currentColor"/>
    <path d="M56 44 C82 37 126 37 166 43 M166 43 L192 32 L215 39 L204 54 L184 53 M192 32 C194 20 202 15 208 18 M196 34 C202 22 210 19 214 23"/>
    <path d="M88 42 C86 60 88 74 96 76 M102 41 C100 60 102 76 110 78 M116 40 C114 60 116 76 124 78 M130 40 C128 58 130 74 138 76 M144 41 C142 56 144 70 150 72"/>
    <path d="M160 44 L154 68 L160 92 L162 118 M170 46 L166 72 L168 94 L168 118"/>
    <path d="M62 46 L52 68 L64 92 L60 118 M74 48 L66 72 L76 92 L72 118 M55 44 C44 52 40 72 42 88"/>
  </svg>`,
  equine: `<svg viewBox="0 0 240 130" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M58 50 C88 40 128 42 162 46 L186 22 L214 38 L204 48 L184 38 L164 62 L134 74 L76 70 Z" opacity=".18" fill="currentColor"/>
    <path d="M58 50 C88 38 128 40 160 45 L186 20 L216 36 L208 46 L186 38 M152 38 L158 34"/>
    <path d="M92 43 C90 60 94 74 102 76 M106 42 C104 60 108 76 116 78 M120 42 C118 60 122 76 130 78 M134 43 C132 58 136 74 142 74"/>
    <path d="M158 46 L148 70 L156 96 L156 120 M166 48 L160 72 L168 96 L168 120"/>
    <path d="M64 50 L50 72 L64 96 L60 120 M74 52 L64 74 L74 96 L72 120 M56 50 C42 58 38 78 40 94"/>
  </svg>`,
  caprine: `<svg viewBox="0 0 240 130" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M68 54 C94 46 132 46 164 52 L184 36 L208 44 L198 54 L178 52 L162 72 L136 78 L82 76 Z" opacity=".18" fill="currentColor"/>
    <path d="M68 54 C94 46 132 46 164 52 L184 36 L208 44 L198 54 L182 52 M182 36 C174 18 160 12 146 18 M187 37 C180 20 168 15 156 20"/>
    <path d="M96 49 C94 64 98 76 105 78 M112 48 C110 64 114 78 121 79 M128 48 C126 64 130 76 136 77 M144 49 C142 62 146 74 150 75"/>
    <path d="M158 54 L152 76 L158 98 L158 118 M168 56 L164 78 L168 98 L168 118"/>
    <path d="M72 56 L62 76 L74 98 L70 118 M82 56 L76 78 L84 98 L82 118 M66 54 L54 44"/>
  </svg>`,
  ovine: `<svg viewBox="0 0 240 130" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M66 54 C96 46 136 46 166 52 L186 38 L208 46 L200 56 L180 54 L162 74 L134 80 L78 76 Z" opacity=".18" fill="currentColor"/>
    <path d="M66 54 C96 46 136 46 166 52 L186 38 L208 46 L200 56 L182 54 M182 38 C172 28 164 34 168 44 C172 50 180 48 180 42"/>
    <path d="M96 49 C94 64 98 78 106 80 M112 48 C110 64 114 80 122 81 M128 48 C126 64 130 78 136 79 M144 49 C142 62 146 74 150 76"/>
    <path d="M160 54 L154 78 L160 98 L160 118 M168 56 L164 78 L170 98 L170 118"/>
    <path d="M70 56 L62 78 L72 98 L70 118 M80 56 L74 78 L82 98 L80 118 M64 55 C56 62 54 74 56 84"/>
  </svg>`,
  swine: `<svg viewBox="0 0 240 130" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M58 54 C92 44 136 44 170 52 L192 40 L216 56 L204 68 L176 66 L158 84 L82 82 Z" opacity=".18" fill="currentColor"/>
    <path d="M58 54 C92 44 136 44 170 52 L190 38 L216 56 L202 68 L178 65 M216 56 L220 58"/>
    <path d="M90 48 C88 66 92 80 100 82 M106 47 C104 66 108 82 116 83 M122 47 C120 66 124 82 132 83 M138 48 C136 66 140 80 146 81 M152 50 C150 64 154 76 158 78"/>
    <path d="M164 54 L158 78 L162 98 L162 114 M172 56 L168 80 L172 98 L172 114"/>
    <path d="M64 56 L54 78 L66 98 L62 114 M74 58 L66 80 L76 98 L74 114 M56 54 C48 52 46 60 50 64"/>
  </svg>`,
  canine: `<svg viewBox="0 0 240 130" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M64 52 C94 42 134 42 164 46 L186 28 L212 38 L204 48 L184 46 L164 72 L134 78 L80 74 Z" opacity=".18" fill="currentColor"/>
    <path d="M64 52 C94 42 134 42 164 46 L186 28 L212 38 L204 48 L184 46"/>
    <path d="M96 46 C94 62 98 76 106 78 M112 45 C110 62 114 78 122 79 M128 45 C126 62 130 76 136 77 M144 46 C142 60 146 74 150 75"/>
    <path d="M160 48 L154 74 L158 98 L166 116 M168 50 L164 76 L168 98 L176 116"/>
    <path d="M68 54 L56 76 L70 98 L68 116 M78 54 L68 78 L80 98 L78 116 M62 52 C46 42 36 32 34 24"/>
  </svg>`,
  feline: `<svg viewBox="0 0 240 130" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M64 58 C96 48 134 48 164 52 L184 36 L204 42 L198 52 L182 52 L162 76 L132 80 L78 78 Z" opacity=".18" fill="currentColor"/>
    <path d="M64 58 C96 48 134 48 164 52 L184 36 L204 42 L198 52 L182 52"/>
    <path d="M98 51 C96 66 100 78 108 80 M114 50 C112 66 116 80 124 81 M130 50 C128 66 132 78 138 79 M146 51 C144 64 148 76 152 77"/>
    <path d="M158 54 L152 78 L156 100 L166 116 M166 56 L162 80 L166 100 L174 116"/>
    <path d="M68 60 L56 80 L70 100 L68 116 M78 60 L68 82 L80 100 L78 116 M62 58 C44 48 34 30 42 18"/>
  </svg>`,
  avian: `<svg viewBox="0 0 240 130" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M84 62 C104 46 132 48 148 64 C138 86 112 94 90 82 Z" opacity=".18" fill="currentColor"/>
    <path d="M148 62 C152 46 146 34 156 26 L174 26 L186 32 L172 36 L158 34"/>
    <path d="M84 62 L66 52 L70 66 Z M84 62 C104 46 132 48 148 64 M98 84 C118 96 138 92 146 72"/>
    <path d="M146 66 L132 82 M148 62 L126 52 L106 60 L92 52"/>
    <path d="M108 58 L104 78 M118 56 L114 80 M128 58 L124 80"/>
    <path d="M100 68 L112 82 L104 102 L106 118 L118 118 M104 118 L98 120"/>
  </svg>`
};

export function getSpeciesIllustration(speciesId) {
  return SILHOUETTES[speciesId] || SILHOUETTES.bovine;
}
