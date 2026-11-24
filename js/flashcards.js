/**
 * Sistema de Flashcards interativos por espécie e região anatômica.
 */
import { icon } from './icons.js';
import { setStructureMastery } from './progressManager.js';

export function renderFlashcardsSession(container, { structures, speciesName, onExit }) {
  const deck = [...structures].sort(() => Math.random() - 0.5).slice(0, 20);
  let index = 0;
  let flipped = false;

  function draw() {
    if (index >= deck.length) {
      container.innerHTML = `
        <div class="card flashcard-box" style="max-width:620px;margin:0 auto;text-align:center;justify-content:center;gap:14px;">
          <div style="color:var(--accent-emerald);">${icon('trophy', 40)}</div>
          <h2 style="margin:0;">Baralho concluído!</h2>
          <p class="muted small">Você revisou ${deck.length} estruturas de ${speciesName}.</p>
          <div style="display:flex;justify-content:center;gap:10px;">
            <button class="btn btn-primary" id="fc-restart">${icon('shuffle', 15)} Novo baralho</button>
            <button class="btn" id="fc-back">Voltar aos modos</button>
          </div>
        </div>
      `;
      container.querySelector('#fc-restart')?.addEventListener('click', () => { index = 0; flipped = false; draw(); });
      container.querySelector('#fc-back')?.addEventListener('click', onExit);
      return;
    }

    const bone = deck[index];
    container.innerHTML = `
      <div class="flashcard-stage">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <span class="badge badge-cyan">Cartão ${index + 1} de ${deck.length} · ${speciesName}</span>
          <button class="btn btn-ghost btn-sm" id="fc-exit">${icon('x', 14)} Encerrar</button>
        </div>

        <div class="flashcard-box">
          ${!flipped ? `
            <div>
              <span class="badge">${bone.division === 'axial' ? 'Axial' : 'Apendicular'}</span>
              <h2 style="margin:14px 0 4px;font-size:1.5rem;">${bone.name}</h2>
              <div class="sheet-latin" style="font-size:1rem;">${bone.latinName}</div>
              ${bone.popularName ? `<div class="small muted" style="margin-top:4px;">Popular: ${bone.popularName}</div>` : ''}
            </div>
            <div class="info-block">
              <div class="info-label">Tente lembrar antes de virar</div>
              <p class="small muted" style="margin:0;">Onde este osso se localiza, qual sua função principal e quais acidentes ósseos o identificam?</p>
            </div>
            <button class="btn btn-primary" id="fc-flip">${icon('refresh-cw', 15)} Virar cartão</button>
          ` : `
            <div class="stack-list">
              <div>
                <h3 style="margin:0;">${bone.name}</h3>
                <div class="small muted"><i>${bone.latinName}</i></div>
              </div>
              <div class="info-block"><div class="info-label">Localização</div><p class="small" style="margin:0;">${bone.location}</p></div>
              <div class="info-block"><div class="info-label">Função</div><p class="small" style="margin:0;">${bone.function}</p></div>
              <div class="info-block"><div class="info-label">Características morfológicas</div><p class="small" style="margin:0;">${bone.morphology}</p></div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;">
              <button class="btn" style="flex:1;border-color:var(--accent-amber);" id="fc-review">${icon('flag', 14)} Precisa revisar</button>
              <button class="btn btn-primary" style="flex:1;" id="fc-master">${icon('circle-check', 14)} Já domino</button>
            </div>
          `}
        </div>
      </div>
    `;

    container.querySelector('#fc-exit')?.addEventListener('click', onExit);
    container.querySelector('#fc-flip')?.addEventListener('click', () => { flipped = true; draw(); });
    container.querySelector('#fc-review')?.addEventListener('click', () => {
      setStructureMastery(bone, 'pending');
      index += 1; flipped = false; draw();
    });
    container.querySelector('#fc-master')?.addEventListener('click', () => {
      setStructureMastery(bone, 'mastered');
      index += 1; flipped = false; draw();
    });
  }

  draw();
}
