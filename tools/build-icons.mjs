// Gera js/icons.js a partir do pacote lucide-static (licença ISC).
// Uso: node tools/build-icons.mjs <pasta-lucide-static/icons>
import fs from 'node:fs';
import path from 'node:path';

const src = process.argv[2];
if (!src) { console.error('Informe a pasta de ícones do lucide-static.'); process.exit(1); }

const NAMES = [
  'bone','search','star','user','settings','sun','moon','layout-dashboard','paw-print','box','graduation-cap',
  'git-compare','chart-column','book-open','library','eye','eye-off','maximize','minimize','rotate-ccw','crosshair',
  'focus','scan','layers','sparkles','zap','clock','trophy','target','flame','check','x','chevron-right','chevron-down',
  'chevron-left','chevron-up','panel-left','panel-right','info','flag','bookmark','notebook-pen','download','upload','trash-2',
  'play','pause','plus','minus','list-tree','filter','heart','brain','heart-pulse','wind','utensils','droplets','baby',
  'activity','link','lock','circle-help','lightbulb','triangle-alert','shield-check','file-up','camera','sliders-horizontal',
  'expand','shrink','hand','mouse-pointer-2','boxes','cuboid','ghost','bird','cat','dog','beef','rabbit','move','refresh-cw',
  'external-link','menu','arrow-right','arrow-left','circle-check','circle-x','history','repeat','shuffle','type','ruler',
  'microscope','book-marked','map-pin','tag','pencil','save','scan-eye','sliders','award','calendar-check','square-dashed',
  'rotate-3d','undo-2','list','grid-3x3','keyboard','smartphone','monitor','gauge','cpu','database','folder-open','eraser',
  'message-square','circle-dot','swords','puzzle','spline','eye-closed','align-justify','wand-sparkles','file-text'
];

const out = {};
const missing = [];
for (const n of NAMES) {
  const f = path.join(src, n + '.svg');
  if (!fs.existsSync(f)) { missing.push(n); continue; }
  const txt = fs.readFileSync(f, 'utf8');
  const inner = txt.replace(/<!--[\s\S]*?-->/g, '').replace(/<svg[\s\S]*?>/, '').replace(/<\/svg>\s*$/, '')
    .replace(/\s+/g, ' ').trim();
  out[n] = inner;
}

const js = `// GERADO por tools/build-icons.mjs — ícones Lucide (https://lucide.dev, licença ISC).
// Não edite manualmente. Cada entrada contém o conteúdo interno do <svg> de 24x24.
const ICONS = ${JSON.stringify(out, null, 1)};

/**
 * Retorna uma string <svg> inline do ícone Lucide solicitado.
 * @param {string} name  nome do ícone (ex.: 'bone')
 * @param {number} [size=18]  tamanho em px
 * @param {string} [cls='']  classes CSS extras
 */
export function icon(name, size = 18, cls = '') {
  const inner = ICONS[name] ?? ICONS['circle-help'];
  return \`<svg class="lucide \${cls}" xmlns="http://www.w3.org/2000/svg" width="\${size}" height="\${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">\${inner}</svg>\`;
}

export const hasIcon = (name) => name in ICONS;
`;
fs.writeFileSync(path.resolve('js/icons.js'), js);
console.log('Ícones gerados:', Object.keys(out).length, '| ausentes:', missing.join(', ') || 'nenhum');
