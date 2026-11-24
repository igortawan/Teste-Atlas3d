/**
 * Ponto de entrada do ATLAS VET 3D.
 */
import { bootApp } from './app.js';

bootApp().catch((err) => {
  console.error('[ATLAS VET 3D] Erro crítico na inicialização:', err);
  const main = document.getElementById('app-main');
  if (main) {
    main.innerHTML = `
      <div class="page-container">
        <div class="card" style="padding:24px;border-color:var(--accent-rose);">
          <h2 style="margin-top:0;">Erro ao inicializar o ATLAS VET 3D</h2>
          <p class="small muted">Verifique se o aplicativo está sendo executado através de um servidor HTTP local (ex.: <code>node server.mjs</code> ou <code>iniciar-atlas.bat</code>) e não diretamente via <code>file://</code>.</p>
          <pre class="small mono" style="white-space:pre-wrap;">${String(err.message || err)}</pre>
        </div>
      </div>
    `;
  }
});
