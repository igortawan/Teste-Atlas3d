/**
 * Módulo de Estudo Ativo e Gamificação (#/study):
 * - Modo Identificação 3D (destaca um osso no 3D e pergunta o nome)
 * - Modo Localização 3D (pede para o estudante clicar no osso correto no modelo 3D)
 * - Quiz de Múltipla Escolha por espécie, região e dificuldade
 * - Flashcards e Revisão Inteligente (sem IA externa)
 */
import { icon } from './icons.js';
import { state } from './state.js';
import { getAllSpeciesSync, getSpeciesMetaSync, loadSpeciesOsteology } from './anatomyDatabase.js';
import { Viewer3D } from './viewer3d.js';
import { renderFlashcardsSession } from './flashcards.js';
import { recordQuizAnswer, recordStudySession, getSmartReviewRecommendations } from './progressManager.js';
import { showToast } from './navigation.js';

let studyViewer = null;

export function destroyStudyView() {
  if (studyViewer) {
    studyViewer.dispose();
    studyViewer = null;
  }
}

function norm(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export async function renderStudyView(container, params = {}) {
  destroyStudyView();
  const speciesList = getAllSpeciesSync();
  const activeSpecies = params.species || state.currentSpecies || 'bovine';
  const { osteology } = await loadSpeciesOsteology(activeSpecies);
  const recs = getSmartReviewRecommendations(activeSpecies, 6);

  container.innerHTML = `
    <div class="page-container">
      <div class="section-header">
        <div>
          <h1 class="section-title">Estudo Ativo, Prática 3D e Quiz</h1>
          <p class="section-subtitle">Treine identificação de ossos no modelo tridimensional, localização anatômica, flashcards e revisão inteligente.</p>
        </div>
      </div>

      <div class="study-grid">
        <div class="card panel-box stack-list">
          <div>
            <label class="info-label">Espécie de estudo</label>
            <select class="select" id="st-species">
              ${speciesList.map((s) => `<option value="${s.id}" ${s.id === activeSpecies ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="info-label">Região anatômica</label>
            <select class="select" id="st-region">
              <option value="all">Todas as regiões (${osteology.count})</option>
              <option value="skull">Crânio</option>
              <option value="vertebral_column">Coluna vertebral</option>
              <option value="thoracic_cage">Caixa torácica</option>
              <option value="thoracic_limb">Membro torácico</option>
              <option value="pelvic_limb">Membro pélvico</option>
            </select>
          </div>
          <div>
            <label class="info-label">Nível de dificuldade</label>
            <select class="select" id="st-diff">
              <option value="iniciante">Iniciante (ossos principais)</option>
              <option value="intermediario" selected>Intermediário (esqueleto completo)</option>
              <option value="avancado">Avançado (inclui marcos e digitação)</option>
            </select>
          </div>

          <div class="info-block">
            <div class="info-label">Revisão inteligente sugerida</div>
            ${recs.length ? `
              <ul class="small muted" style="margin:4px 0 0;padding-left:16px;">
                ${recs.slice(0, 4).map((r) => `<li><strong>${r.name}</strong> — ${r.reason}</li>`).join('')}
              </ul>
            ` : '<p class="small muted" style="margin:0;">Responda quizzes ou marque estruturas para revisão para gerar prioridades automáticas.</p>'}
          </div>
        </div>

        <div id="study-stage">
          <div class="modules-grid">
            <button class="module-card implemented" id="mode-identify-3d">
              <div class="module-icon">${icon('scan-eye', 18)}</div>
              <div>
                <div class="module-name">Modo Identificação 3D <span class="badge badge-emerald">WebGL</span></div>
                <div class="module-desc">O laboratório destaca um osso sem etiquetas e pergunta: "Qual é o nome desta estrutura?"</div>
              </div>
            </button>

            <button class="module-card implemented" id="mode-locate-3d">
              <div class="module-icon">${icon('crosshair', 18)}</div>
              <div>
                <div class="module-name">Modo Localização 3D <span class="badge badge-emerald">WebGL</span></div>
                <div class="module-desc">O sistema exibe o nome de um osso e você deve encontrá-lo e clicar nele no esqueleto 3D.</div>
              </div>
            </button>

            <button class="module-card implemented" id="mode-quiz">
              <div class="module-icon">${icon('circle-help', 18)}</div>
              <div>
                <div class="module-name">Quiz Anatômico Completo</div>
                <div class="module-desc">Perguntas sobre identificação, função, articulações, marcos e importância clínica.</div>
              </div>
            </button>

            <button class="module-card implemented" id="mode-flashcards">
              <div class="module-icon">${icon('layers', 18)}</div>
              <div>
                <div class="module-name">Flashcards Interativos</div>
                <div class="module-desc">Cartões de estudo com frente/verso e classificação de domínio.</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#st-species')?.addEventListener('change', (e) => {
    renderStudyView(container, { species: e.target.value });
  });

  const getPool = () => {
    const reg = container.querySelector('#st-region').value;
    const diff = container.querySelector('#st-diff').value;
    let pool = osteology.structures.filter((b) => reg === 'all' || b.region === reg);
    if (diff === 'iniciante') {
      const main = pool.filter((b) => b.serialIndex == null || b.serialIndex <= 2);
      if (main.length >= 4) pool = main;
    }
    return pool;
  };

  const stage = container.querySelector('#study-stage');
  const spMeta = getSpeciesMetaSync(activeSpecies);
  const backToMenu = () => renderStudyView(container, { species: activeSpecies });

  container.querySelector('#mode-flashcards')?.addEventListener('click', () => {
    renderFlashcardsSession(stage, { structures: getPool(), speciesName: spMeta.name, onExit: backToMenu });
  });

  container.querySelector('#mode-quiz')?.addEventListener('click', () => {
    startTextQuiz(stage, { pool: getPool(), allStructures: osteology.structures, speciesId: activeSpecies, speciesName: spMeta.name, diff: container.querySelector('#st-diff').value, onExit: backToMenu });
  });

  container.querySelector('#mode-identify-3d')?.addEventListener('click', () => {
    start3DMode(stage, { mode: 'identify', pool: getPool(), allStructures: osteology.structures, speciesId: activeSpecies, speciesName: spMeta.name, diff: container.querySelector('#st-diff').value, onExit: backToMenu });
  });

  container.querySelector('#mode-locate-3d')?.addEventListener('click', () => {
    start3DMode(stage, { mode: 'locate', pool: getPool(), allStructures: osteology.structures, speciesId: activeSpecies, speciesName: spMeta.name, diff: container.querySelector('#st-diff').value, onExit: backToMenu });
  });
}

function startTextQuiz(stage, { pool, allStructures, speciesId, speciesName, diff, onExit }) {
  const questions = [...pool].sort(() => Math.random() - 0.5).slice(0, 8);
  let idx = 0;
  let score = 0;
  let streak = 0;
  const startedAt = Date.now();

  function renderQ() {
    if (idx >= questions.length) {
      const dur = (Date.now() - startedAt) / 1000;
      recordStudySession({ species: speciesId, mode: `Quiz (${diff})`, score, total: questions.length, durationSec: dur });
      stage.innerHTML = renderSummaryHtml(score, questions.length, dur, speciesName);
      stage.querySelector('#q-done-back')?.addEventListener('click', onExit);
      return;
    }
    const target = questions[idx];
    const askLandmark = diff === 'avancado' && target.landmarks?.length;
    const lm = askLandmark ? target.landmarks[0] : null;
    const promptText = lm
      ? `Em ${speciesName}, a qual osso pertence o marco anatômico "${lm.name}" (${lm.location})?`
      : `Qual estrutura de ${speciesName} possui esta função: "${target.function}"?`;

    const distractors = [...allStructures]
      .filter((b) => b.id !== target.id && b.name !== target.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = [target, ...distractors].sort(() => Math.random() - 0.5);

    stage.innerHTML = `
      <div class="card panel-box">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px;">
          <span class="badge badge-cyan">Pergunta ${idx + 1}/${questions.length} · ${speciesName}</span>
          <span class="badge badge-emerald" id="q-score-badge">Acertos: ${score} · Sequência: ${streak}</span>
          <button class="btn btn-ghost btn-sm" id="q-abort">Sair</button>
        </div>
        <h3 style="margin:6px 0 12px;">${promptText}</h3>
        <div class="quiz-options">
          ${options.map((o) => `<button class="quiz-opt" data-opt="${o.id}">${o.name}<div class="small muted"><i>${o.latinName}</i></div></button>`).join('')}
        </div>
        <div id="q-feedback" style="margin-top:14px;"></div>
      </div>
    `;

    stage.querySelector('#q-abort')?.addEventListener('click', onExit);
    let answered = false;
    stage.querySelectorAll('[data-opt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const ok = btn.dataset.opt === target.id;
        recordQuizAnswer(target, ok);
        if (ok) { score++; streak++; btn.classList.add('correct'); }
        else {
          streak = 0;
          btn.classList.add('wrong');
          stage.querySelector(`[data-opt="${target.id}"]`)?.classList.add('correct');
        }
        const scoreBadge = stage.querySelector('#q-score-badge');
        if (scoreBadge) scoreBadge.textContent = `Acertos: ${score} · Sequência: ${streak}`;
        const fb = stage.querySelector('#q-feedback');
        fb.innerHTML = `
          <div class="info-block">
            <strong>${ok ? 'Correto!' : `Resposta correta: ${target.name}`}</strong>
            <p class="small muted" style="margin:4px 0 8px;">${target.location}</p>
            <button class="btn btn-primary btn-sm" id="q-next">${idx + 1 < questions.length ? 'Próxima pergunta' : 'Ver resultado'}</button>
          </div>
        `;
        fb.querySelector('#q-next')?.addEventListener('click', () => { idx++; renderQ(); });
      });
    });
  }
  renderQ();
}

async function start3DMode(stage, { mode, pool, allStructures, speciesId, speciesName, diff, onExit }) {
  const totalRounds = Math.min(6, pool.length);
  const targets = [...pool].sort(() => Math.random() - 0.5).slice(0, totalRounds);
  let idx = 0;
  let score = 0;
  let locked = false;
  const startedAt = Date.now();

  stage.innerHTML = `
    <div class="card panel-box">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
        <span class="badge badge-emerald">${mode === 'identify' ? 'Modo Identificação 3D' : 'Modo Localização 3D'} · ${speciesName}</span>
        <span class="badge badge-cyan" id="s3d-score">Questão 1/${totalRounds} · Acertos: 0</span>
        <button class="btn btn-ghost btn-sm" id="s3d-exit">${icon('x', 14)} Encerrar</button>
      </div>
      <div id="s3d-prompt" class="info-block" style="margin-bottom:10px;"></div>
      <div id="s3d-canvas" class="study-3d-canvas"></div>
      <div id="s3d-answer-area" style="margin-top:12px;"></div>
    </div>
  `;

  const canvasEl = stage.querySelector('#s3d-canvas');
  studyViewer = new Viewer3D(canvasEl, {
    quality: state.persisted.settings.quality,
    initialLayerState: { preset: 'bones_only', skinVisible: false, skinOpacity: 0.38, skinStyle: 'natural', bonesVisible: true },
    onBoneClicked: (clickedId) => {
      if (mode !== 'locate' || locked) return;
      const target = targets[idx];
      locked = true;
      const ok = clickedId === target.id;
      recordQuizAnswer(target, ok);
      if (ok) score++;
      studyViewer.selectBone(target, { focusCamera: true });
      const clickedBone = allStructures.find((b) => b.id === clickedId);
      stage.querySelector('#s3d-answer-area').innerHTML = `
        <div class="info-block">
          <strong style="color:${ok ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
            ${ok ? 'Localização exata!' : `Você clicou em "${clickedBone?.name || clickedId}". A peça correta está destacada em verde.`}
          </strong>
          <div style="margin-top:8px;">
            <button class="btn btn-primary btn-sm" id="s3d-next">${idx + 1 < totalRounds ? 'Próxima estrutura' : 'Finalizar sessão'}</button>
          </div>
        </div>
      `;
      stage.querySelector('#s3d-next')?.addEventListener('click', () => { idx++; loadRound(); });
    }
  });

  await studyViewer.loadSpecies(speciesId, allStructures);
  stage.querySelector('#s3d-exit')?.addEventListener('click', () => {
    destroyStudyView();
    onExit();
  });

  function loadRound() {
    if (idx >= totalRounds) {
      const dur = (Date.now() - startedAt) / 1000;
      recordStudySession({ species: speciesId, mode: mode === 'identify' ? 'Identificação 3D' : 'Localização 3D', score, total: totalRounds, durationSec: dur });
      destroyStudyView();
      stage.innerHTML = renderSummaryHtml(score, totalRounds, dur, speciesName);
      stage.querySelector('#q-done-back')?.addEventListener('click', onExit);
      return;
    }
    locked = false;
    const target = targets[idx];
    stage.querySelector('#s3d-score').textContent = `Questão ${idx + 1}/${totalRounds} · Acertos: ${score}`;

    if (mode === 'locate') {
      studyViewer.selectBone(null, { focusCamera: false });
      studyViewer.cameraCtrl.reset();
      stage.querySelector('#s3d-prompt').innerHTML = `<strong>Localize e clique no modelo 3D:</strong> <span style="color:var(--accent-emerald);font-size:1.02rem;">${target.name}</span> <span class="small muted">(<i>${target.latinName}</i>)</span>`;
      stage.querySelector('#s3d-answer-area').innerHTML = `<p class="small muted">Gire o esqueleto 3D se necessário e clique sobre o osso pedido.</p>`;
    } else {
      studyViewer.selectBone(target, { focusCamera: true });
      stage.querySelector('#s3d-prompt').innerHTML = `<strong>Qual é o nome desta estrutura destacada em verde no modelo 3D?</strong>`;

      if (diff === 'avancado') {
        stage.querySelector('#s3d-answer-area').innerHTML = `
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <input class="input" id="s3d-type-ans" style="flex:1;min-width:180px;" placeholder="Digite o nome em português ou latim..." />
            <button class="btn btn-primary" id="s3d-type-btn">Verificar</button>
          </div>
          <div id="s3d-fb" style="margin-top:10px;"></div>
        `;
        stage.querySelector('#s3d-type-btn')?.addEventListener('click', () => {
          if (locked) return;
          locked = true;
          const val = norm(stage.querySelector('#s3d-type-ans').value);
          const ok = val.length >= 3 && (norm(target.name).includes(val) || norm(target.latinName).includes(val));
          recordQuizAnswer(target, ok);
          if (ok) score++;
          stage.querySelector('#s3d-fb').innerHTML = `
            <div class="info-block">
              <strong>${ok ? 'Correto!' : `Resposta: ${target.name} (${target.latinName})`}</strong>
              <div style="margin-top:8px;"><button class="btn btn-primary btn-sm" id="s3d-next">Continuar</button></div>
            </div>
          `;
          stage.querySelector('#s3d-next')?.addEventListener('click', () => { idx++; loadRound(); });
        });
      } else {
        const distractors = [...allStructures].filter((b) => b.id !== target.id && b.name !== target.name).sort(() => Math.random() - 0.5).slice(0, 3);
        const options = [target, ...distractors].sort(() => Math.random() - 0.5);
        stage.querySelector('#s3d-answer-area').innerHTML = `
          <div class="quiz-options">
            ${options.map((o) => `<button class="quiz-opt" data-s3d-opt="${o.id}">${o.name}</button>`).join('')}
          </div>
          <div id="s3d-fb" style="margin-top:10px;"></div>
        `;
        stage.querySelectorAll('[data-s3d-opt]').forEach((btn) => {
          btn.addEventListener('click', () => {
            if (locked) return;
            locked = true;
            const ok = btn.dataset.s3dOpt === target.id;
            recordQuizAnswer(target, ok);
            if (ok) { score++; btn.classList.add('correct'); }
            else {
              btn.classList.add('wrong');
              stage.querySelector(`[data-s3d-opt="${target.id}"]`)?.classList.add('correct');
            }
            stage.querySelector('#s3d-fb').innerHTML = `
              <div class="info-block">
                <strong>${ok ? 'Correto!' : `Estrutura correta: ${target.name}`}</strong> — <span class="small muted">${target.location}</span>
                <div style="margin-top:8px;"><button class="btn btn-primary btn-sm" id="s3d-next">Próxima</button></div>
              </div>
            `;
            stage.querySelector('#s3d-next')?.addEventListener('click', () => { idx++; loadRound(); });
          });
        });
      }
    }
  }

  loadRound();
}

function renderSummaryHtml(score, total, durSec, speciesName) {
  const pct = Math.round((score / Math.max(1, total)) * 100);
  return `
    <div class="card panel-box" style="text-align:center;padding:28px;">
      <div style="color:var(--accent-emerald);margin-bottom:8px;">${icon('award', 42)}</div>
      <h2 style="margin:0 0 6px;">Sessão concluída — ${speciesName}</h2>
      <p class="muted">Pontuação: <strong>${score} de ${total}</strong> (${pct}%) · Tempo: ${Math.round(durSec)}s</p>
      <button class="btn btn-primary" id="q-done-back">${icon('arrow-left', 15)} Voltar aos modos de estudo</button>
    </div>
  `;
}
