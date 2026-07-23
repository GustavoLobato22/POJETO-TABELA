import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { openPage } from '../ui/page.js';
import { aggregateStats } from '../engine/statsEngine.js';
import { evaluateBadges } from '../data/badges.js';
import { missionsProgressToday } from '../store/selectors.js';
import { getLevelProgress } from '../engine/gamification.js';

export function openAchievements() {
  openPage({
    title: 'Conquistas',
    render: (body) => draw(body),
  });
}

function draw(body) {
  const stats = aggregateStats(store.state);
  const badges = evaluateBadges(stats);
  const levelInfo = getLevelProgress(store.state.gamification.xp);
  const { missions } = missionsProgressToday(store.state);
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  body.innerHTML = `
    <div class="section">
      <div class="card" style="text-align:center">
        <div class="text-display">${levelInfo.level}</div>
        <div class="text-footnote text-secondary">Nível atual · ${levelInfo.xp} XP total</div>
        <div class="progress-track" style="margin-top:12px"><div class="progress-fill progress-fill--accent" style="width:${levelInfo.progressPct}%"></div></div>
        <div class="text-caption text-tertiary" style="margin-top:6px">Faltam ${levelInfo.xpToNext} XP para o nível ${levelInfo.level + 1}</div>
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
      <div class="section__title"><span class="text-headline">Conquistas (${unlockedCount}/${badges.length})</span></div>
      <div class="card">
        <div class="badge-grid">
          ${badges.map((b) => `
            <div class="badge-item ${b.unlocked ? 'is-unlocked' : ''}">
              <div class="badge-item__icon">${icon(b.icon, { size: 26 })}</div>
              <div class="badge-item__label ${b.unlocked ? '' : 'is-locked-label'}">${b.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
