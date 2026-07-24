import { icon } from '../icons.js';
import { openPage } from '../ui/page.js';
import { PAST_EXAMS, PAST_EXAMS_DISCLAIMER } from '../data/pastExams.js';

export function openPastExams() {
  openPage({
    title: 'Provas anteriores',
    render: (body) => draw(body),
  });
}

function draw(body) {
  body.innerHTML = `
    <div class="section">
      <div class="insight insight--warning">
        <span class="insight__icon">${icon('alertTriangle', { size: 18 })}</span>
        <span class="insight__text">${PAST_EXAMS_DISCLAIMER}</span>
      </div>
    </div>

    <div class="section" style="display:flex;flex-direction:column;gap:14px">
      ${PAST_EXAMS.map((e) => `
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:8px">
            <div class="text-headline">${e.year} — ${e.cargo}</div>
            <span class="badge badge--neutral">${e.status}</span>
          </div>
          <div class="text-footnote text-secondary" style="margin-bottom:2px">Banca: ${e.banca || 'Não confirmada'}</div>
          <div class="text-footnote text-secondary" style="margin-bottom:14px">Vagas: ${e.vagas ? e.vagas.toLocaleString('pt-BR') : 'Não confirmado'}</div>
          <a class="btn ${e.sourceType === 'oficial' ? 'btn--secondary' : 'btn--outline'} btn--sm" href="${e.sourceUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">
            ${icon(e.sourceType === 'oficial' ? 'shield' : 'search', { size: 15 })}
            ${e.sourceLabel}
          </a>
        </div>
      `).join('')}
    </div>
  `;
}
