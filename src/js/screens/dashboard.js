import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { aggregateStats } from '../engine/statsEngine.js';
import { getLevelProgress } from '../engine/gamification.js';
import { daysUntilExam, generateTodayPlan, estimateReadiness } from '../engine/planner.js';
import { missionsProgressToday, dueQuestionReviews, dueFlashcardsReviewOnly } from '../store/selectors.js';
import { formatHours, formatDuration } from '../utils/format.js';
import { openPracticeSession } from './practice.js';
import { openSimuladoRunner } from './simuladoRunner.js';
import { openReviewQueue } from './reviewQueue.js';
import { navigateTab } from '../router.js';

export function renderDashboard(root) {
  const state = store.state;
  const stats = aggregateStats(state);
  const levelInfo = getLevelProgress(state.gamification.xp);
  const days = daysUntilExam(state.profile.examDate);
  const readiness = estimateReadiness({
    examDate: state.profile.examDate,
    accuracyOverall: stats.accuracyOverall,
    totalAnswered: stats.totalAnswered,
    bestSimuladoPct: stats.bestSimuladoPct,
    simuladosCount: stats.simuladosCount,
  });
  const todayPlan = generateTodayPlan({ dailyHours: state.profile.dailyHours, bySubjectStats: stats.bySubject, attempts: state.attempts });
  const { missions } = missionsProgressToday(state);
  const pendingReviews = dueQuestionReviews(state).length + dueFlashcardsReviewOnly(state).length;

  const ringCircumference = 2 * Math.PI * 27;
  const ringOffset = ringCircumference * (1 - levelInfo.progressPct / 100);

  root.innerHTML = `
    <div class="screen-header">
      <div class="screen-header__titles">
        <div class="text-footnote text-secondary">${days !== null ? `${days} dias até a prova` : 'Defina sua data de prova no Perfil'}</div>
        <div class="text-title">Olá, ${state.profile.name || 'concurseiro(a)'}</div>
      </div>
      <button class="icon-btn" id="goto-profile" aria-label="Perfil">${icon('user', { size: 18 })}</button>
    </div>

    <div class="section">
      <div class="hero-card">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div class="hero-card__label">Nível ${levelInfo.level} · ${levelInfo.xp} XP</div>
            <div class="hero-card__value" style="font-size:26px">${readiness}% de preparo estimado</div>
          </div>
          <div class="level-ring">
            <svg viewBox="0 0 64 64">
              <circle class="level-ring__track" cx="32" cy="32" r="27" fill="none" stroke-width="6"/>
              <circle class="level-ring__fill" cx="32" cy="32" r="27" fill="none" stroke-width="6"
                stroke-dasharray="${ringCircumference}" stroke-dashoffset="${ringOffset}"/>
            </svg>
            <div class="level-ring__value">${icon('flame', { size: 22 })}</div>
          </div>
        </div>
        <div class="hero-card__row">
          <div class="hero-card__stat">
            <div class="hero-card__stat-label">${icon('flame', { size: 12 })} Sequência</div>
            <div class="hero-card__stat-value tabular-nums">${stats.currentStreak} dia(s)</div>
          </div>
          <div class="hero-card__divider"></div>
          <div class="hero-card__stat">
            <div class="hero-card__stat-label">${icon('target', { size: 12 })} Aproveitamento</div>
            <div class="hero-card__stat-value tabular-nums">${stats.accuracyOverall}%</div>
          </div>
        </div>
        <div class="text-caption" style="opacity:0.75;margin-top:14px">Estimativa com base no seu histórico — não é garantia de aprovação.</div>
      </div>
    </div>

    <div class="section">
      <div class="stat-grid">
        <div class="stat-tile">
          <div class="stat-tile__label text-footnote">${icon('book', { size: 14 })} Questões resolvidas</div>
          <div class="stat-tile__value tabular-nums">${stats.totalAnswered}</div>
        </div>
        <div class="stat-tile">
          <div class="stat-tile__label text-footnote">${icon('timer', { size: 14 })} Tempo médio/questão</div>
          <div class="stat-tile__value tabular-nums">${stats.avgTimePerQuestion}s</div>
        </div>
        <div class="stat-tile">
          <div class="stat-tile__label text-footnote">${icon('clock', { size: 14 })} Foco acumulado</div>
          <div class="stat-tile__value tabular-nums">${formatDuration(stats.focusSeconds)}</div>
        </div>
        <div class="stat-tile">
          <div class="stat-tile__label text-footnote">${icon('repeat', { size: 14 })} Revisões pendentes</div>
          <div class="stat-tile__value tabular-nums ${pendingReviews > 0 ? 'text-warning' : ''}">${pendingReviews}</div>
        </div>
      </div>
    </div>

    ${pendingReviews > 0 ? `
    <div class="section">
      <div class="insight insight--warning" id="goto-reviews" style="cursor:pointer">
        <span class="insight__icon">${icon('repeat', { size: 18 })}</span>
        <span class="insight__text">Você tem <strong>${pendingReviews}</strong> revisão(ões) pendente(s) da repetição espaçada. Revisar agora fixa o conteúdo antes que ele seja esquecido.</span>
      </div>
    </div>` : ''}

    <div class="section">
      <div class="section__title">
        <span class="text-headline">Plano de hoje</span>
        <span class="text-footnote text-tertiary">${formatHours(state.profile.dailyHours)}</span>
      </div>
      <div class="card">
        ${todayPlan.map((p, i) => `
          <div style="display:flex;align-items:center;gap:12px;${i < todayPlan.length - 1 ? 'margin-bottom:14px' : ''}">
            <span class="subject-row__swatch" style="width:10px;height:10px;border-radius:3px;background:${p.color}"></span>
            <div style="flex:1;min-width:0">
              <div class="text-body" style="font-weight:600">${p.label}</div>
              ${p.suggestedTopic ? `<div class="text-caption text-tertiary">Foco sugerido: ${p.suggestedTopic}</div>` : ''}
            </div>
            <div class="badge badge--neutral">${p.minutes} min</div>
          </div>
        `).join('')}
        <button class="btn btn--primary btn--sm" id="start-today-plan" style="margin-top:6px">${icon('play', { size: 16 })} Começar a estudar</button>
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Missões de hoje</span></div>
      <div class="card">
        ${missions.map((m, i) => `
          <div class="mission-row ${m.done ? 'is-done' : ''}" style="${i < missions.length - 1 ? 'border-bottom:1px solid var(--color-border)' : ''}">
            <div class="mission-row__icon">${icon(m.done ? 'check' : m.icon, { size: 18 })}</div>
            <div style="flex:1;min-width:0">
              <div class="text-footnote" style="font-weight:600">${m.label}</div>
              <div class="progress-track" style="margin-top:6px"><div class="progress-fill ${m.done ? 'progress-fill--positive' : ''}" style="width:${m.progressPct}%"></div></div>
            </div>
            <div class="badge badge--accent">+${m.xp} XP</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Atalhos</span></div>
      <div style="display:flex;gap:12px">
        <button class="btn btn--secondary" id="goto-simulado" style="flex-direction:column;height:auto;padding:16px;gap:6px">
          ${icon('clipboardList', { size: 22 })}<span class="text-footnote" style="font-weight:700">Simulado</span>
        </button>
        <button class="btn btn--secondary" id="goto-flashcards" style="flex-direction:column;height:auto;padding:16px;gap:6px">
          ${icon('layers', { size: 22 })}<span class="text-footnote" style="font-weight:700">Flashcards</span>
        </button>
      </div>
    </div>
  `;

  root.querySelector('#goto-profile').addEventListener('click', () => navigateTab('perfil'));
  root.querySelector('#goto-simulado').addEventListener('click', () => navigateTab('simulado'));
  root.querySelector('#goto-flashcards').addEventListener('click', () => navigateTab('flashcards'));
  const reviewsBanner = root.querySelector('#goto-reviews');
  if (reviewsBanner) reviewsBanner.addEventListener('click', () => openReviewQueue());
  root.querySelector('#start-today-plan').addEventListener('click', () => {
    if (todayPlan.length) openPracticeSession({ mode: 'subject', subjectId: todayPlan[0].subjectId });
  });
}
