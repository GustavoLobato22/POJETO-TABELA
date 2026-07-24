import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { getLevelProgress } from '../engine/gamification.js';
import { daysUntilExam } from '../engine/planner.js';
import { openStats } from './stats.js';
import { openStudyPlan } from './studyPlan.js';
import { openAchievements } from './achievements.js';
import { openFocusMode } from './focusMode.js';
import { openRedacao } from './redacao.js';
import { openSettings } from './settings.js';
import { openEditalInfo } from './editalInfo.js';
import { openPastExams } from './pastExams.js';

const MENU = [
  { id: 'plan', label: 'Plano de estudos', icon: 'calendar', open: openStudyPlan },
  { id: 'stats', label: 'Estatísticas e mapa de calor', icon: 'chart', open: openStats },
  { id: 'achievements', label: 'Conquistas e missões', icon: 'trophy', open: openAchievements },
  { id: 'focus', label: 'Modo foco (Pomodoro)', icon: 'timer', open: openFocusMode },
  { id: 'redacao', label: 'Redação', icon: 'edit', open: openRedacao },
  { id: 'edital', label: 'Sobre o concurso (edital)', icon: 'shield', open: openEditalInfo },
  { id: 'past-exams', label: 'Provas anteriores (referências)', icon: 'scroll', open: openPastExams },
  { id: 'settings', label: 'Configurações', icon: 'settings', open: openSettings },
];

export function renderProfile(root) {
  const { profile } = store.state;
  const levelInfo = getLevelProgress(store.state.gamification.xp);
  const days = daysUntilExam(profile.examDate);
  const initials = (profile.name || 'C').trim().slice(0, 2).toUpperCase();

  root.innerHTML = `
    <div class="screen-header">
      <div class="screen-header__titles">
        <div class="text-title">Perfil</div>
      </div>
    </div>

    <div class="section">
      <div class="card" style="display:flex;align-items:center;gap:16px">
        <div class="avatar">${initials}</div>
        <div style="flex:1;min-width:0">
          <div class="text-headline">${profile.name || 'Concurseiro(a)'}</div>
          <div class="text-footnote text-secondary">Nível ${levelInfo.level} · ${levelInfo.xp} XP · ${days !== null ? `${days} dias até a prova` : 'Sem data de prova definida'}</div>
          <div class="progress-track" style="margin-top:8px"><div class="progress-fill progress-fill--accent" style="width:${levelInfo.progressPct}%"></div></div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="card">
        ${MENU.map((m, i) => `
          <button class="menu-row" data-menu="${m.id}" style="width:100%;text-align:left;${i < MENU.length - 1 ? 'border-bottom:1px solid var(--color-border)' : ''}">
            <span class="menu-row__icon">${icon(m.icon, { size: 18 })}</span>
            <span class="menu-row__label">${m.label}</span>
            <span class="menu-row__chevron">${icon('chevronRight', { size: 16 })}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  root.querySelectorAll('[data-menu]').forEach((btn) => {
    const item = MENU.find((m) => m.id === btn.dataset.menu);
    btn.addEventListener('click', () => item.open());
  });
}
