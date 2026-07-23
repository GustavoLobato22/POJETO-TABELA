import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { openPage } from '../ui/page.js';
import { aggregateStats } from '../engine/statsEngine.js';
import { generateWeeklyAllocation, generateTodayPlan, daysUntilExam } from '../engine/planner.js';
import { formatHours } from '../utils/format.js';
import { openPracticeSession } from './practice.js';

export function openStudyPlan() {
  openPage({
    title: 'Plano de estudos',
    render: (body) => draw(body),
  });
}

function draw(body) {
  const state = store.state;
  const stats = aggregateStats(state);
  const weekly = generateWeeklyAllocation({ dailyHours: state.profile.dailyHours, bySubjectStats: stats.bySubject });
  const today = generateTodayPlan({ dailyHours: state.profile.dailyHours, bySubjectStats: stats.bySubject, attempts: state.attempts });
  const days = daysUntilExam(state.profile.examDate);

  body.innerHTML = `
    <div class="section">
      <div class="insight">
        <span class="insight__icon">${icon('sparkles', { size: 18 })}</span>
        <span class="insight__text">Este plano é recalculado automaticamente toda vez que você o abre, com base no seu desempenho recente e nos dias restantes até a prova (${days !== null ? `${days} dias` : 'defina a data nas Configurações'}). Se você atrasar os estudos, é só voltar aqui — a distribuição se ajusta sozinha.</span>
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Hoje (${formatHours(state.profile.dailyHours)})</span></div>
      <div class="card">
        ${today.map((p, i) => `
          <div style="display:flex;align-items:center;gap:12px;${i < today.length - 1 ? 'margin-bottom:14px' : ''}">
            <span style="width:10px;height:10px;border-radius:3px;background:${p.color};flex-shrink:0"></span>
            <div style="flex:1;min-width:0">
              <div class="text-body" style="font-weight:600">${p.label}</div>
              ${p.suggestedTopic ? `<div class="text-caption text-tertiary">Foco sugerido: ${p.suggestedTopic}</div>` : ''}
            </div>
            <button class="btn btn--secondary btn--sm btn--auto" data-start="${p.subjectId}">Estudar</button>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Distribuição semanal recomendada</span></div>
      <div class="card">
        ${weekly.map((w, i, arr) => `
          <div style="${i < arr.length - 1 ? 'margin-bottom:14px' : ''}">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <span class="text-footnote" style="font-weight:600">${w.label}</span>
              <span class="text-footnote tabular-nums">${w.sharePct}% · ${Math.round(w.minutesPerWeek / 60 * 10) / 10}h/semana</span>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width:${w.sharePct}%;background:${w.color}"></div></div>
          </div>
        `).join('')}
        <div class="text-caption text-tertiary" style="margin-top:12px">Disciplinas com menor aproveitamento (ou ainda pouco praticadas) recebem automaticamente mais tempo de estudo.</div>
      </div>
    </div>
  `;

  body.querySelectorAll('[data-start]').forEach((btn) => btn.addEventListener('click', () => {
    openPracticeSession({ mode: 'subject', subjectId: btn.dataset.start });
  }));
}
