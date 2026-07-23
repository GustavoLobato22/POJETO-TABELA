import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { openPage } from '../ui/page.js';
import { aggregateStats, heatmapData, dailySeries, weeklySeries, monthlySeries } from '../engine/statsEngine.js';
import { renderLineChart } from '../charts/lineChart.js';
import { formatDuration } from '../utils/format.js';
import { getSubject } from '../data/subjects.js';

const MASTERY_COLOR = { alta: 'var(--color-mastery-high)', media: 'var(--color-mastery-mid)', baixa: 'var(--color-mastery-low)', 'sem-dados': 'var(--color-mastery-none)' };

export function openStats() {
  let tab = 'geral';
  openPage({
    title: 'Estatísticas',
    render: (body, { rerender }) => draw(body, rerender, () => tab, (t) => { tab = t; }),
  });
}

function draw(body, rerender, getTab, setTab) {
  const tab = getTab();
  const stats = aggregateStats(store.state);
  const heatmap = heatmapData(store.state.attempts);

  body.innerHTML = `
    <div class="segmented" style="margin-bottom:20px">
      <button class="segmented__item ${tab === 'geral' ? 'is-active' : ''}" data-tab="geral">Visão geral</button>
      <button class="segmented__item ${tab === 'heatmap' ? 'is-active' : ''}" data-tab="heatmap">Mapa de calor</button>
      <button class="segmented__item ${tab === 'evolucao' ? 'is-active' : ''}" data-tab="evolucao">Evolução</button>
    </div>
    <div id="tab-content"></div>
  `;

  const content = body.querySelector('#tab-content');
  if (tab === 'geral') content.innerHTML = geralHtml(stats);
  else if (tab === 'heatmap') content.innerHTML = heatmapHtml(heatmap);
  else content.innerHTML = evolucaoHtml(store.state.attempts);

  body.querySelectorAll('[data-tab]').forEach((btn) => btn.addEventListener('click', () => {
    setTab(btn.dataset.tab);
    rerender();
  }));
}

function geralHtml(stats) {
  return `
    <div class="stat-grid" style="margin-bottom:20px">
      <div class="stat-tile"><div class="stat-tile__label text-footnote">${icon('book', { size: 14 })} Questões</div><div class="stat-tile__value">${stats.totalAnswered}</div></div>
      <div class="stat-tile"><div class="stat-tile__label text-footnote">${icon('checkCircle', { size: 14 })} Acertos</div><div class="stat-tile__value text-positive">${stats.correctCount}</div></div>
      <div class="stat-tile"><div class="stat-tile__label text-footnote">${icon('target', { size: 14 })} Aproveitamento</div><div class="stat-tile__value">${stats.accuracyOverall}%</div></div>
      <div class="stat-tile"><div class="stat-tile__label text-footnote">${icon('timer', { size: 14 })} Tempo médio</div><div class="stat-tile__value">${stats.avgTimePerQuestion}s</div></div>
      <div class="stat-tile"><div class="stat-tile__label text-footnote">${icon('flame', { size: 14 })} Melhor sequência</div><div class="stat-tile__value">${stats.bestStreak}d</div></div>
      <div class="stat-tile"><div class="stat-tile__label text-footnote">${icon('clock', { size: 14 })} Foco acumulado</div><div class="stat-tile__value">${formatDuration(stats.focusSeconds)}</div></div>
      <div class="stat-tile"><div class="stat-tile__label text-footnote">${icon('clipboardList', { size: 14 })} Simulados</div><div class="stat-tile__value">${stats.simuladosCount}</div></div>
      <div class="stat-tile"><div class="stat-tile__label text-footnote">${icon('trophy', { size: 14 })} Melhor nota</div><div class="stat-tile__value">${stats.bestSimuladoPct}%</div></div>
    </div>
    <div class="card">
      <div class="text-headline" style="margin-bottom:12px">Aproveitamento por disciplina</div>
      ${Object.values(stats.bySubject).map((b, i, arr) => `
        <div style="${i < arr.length - 1 ? 'margin-bottom:14px' : ''}">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span class="text-footnote" style="font-weight:600">${getSubject(b.subjectId)?.short || b.subjectId}</span>
            <span class="text-footnote tabular-nums">${b.answered ? `${b.pct}%` : '—'}</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${b.pct}%"></div></div>
        </div>
      `).join('')}
    </div>
  `;
}

function heatmapHtml(heatmap) {
  return `
    <div class="card">
      <div class="text-headline" style="margin-bottom:16px">Domínio por disciplina</div>
      <div class="heatmap-grid">
        ${heatmap.map((h) => `
          <div class="heatmap-row">
            <div class="heatmap-row__label">${h.label}</div>
            <div class="heatmap-row__track"><div class="heatmap-row__fill" style="width:${h.answered ? Math.max(h.pct, 4) : 0}%;background:${MASTERY_COLOR[h.level]}"></div></div>
            <div class="heatmap-row__pct">${h.answered ? `${h.pct}%` : '—'}</div>
          </div>
        `).join('')}
      </div>
      <div class="heatmap-legend">
        <span class="heatmap-legend__item"><span class="heatmap-legend__dot" style="background:var(--color-mastery-high)"></span>Dominado (≥75%)</span>
        <span class="heatmap-legend__item"><span class="heatmap-legend__dot" style="background:var(--color-mastery-mid)"></span>Médio (50–74%)</span>
        <span class="heatmap-legend__item"><span class="heatmap-legend__dot" style="background:var(--color-mastery-low)"></span>Crítico (&lt;50%)</span>
        <span class="heatmap-legend__item"><span class="heatmap-legend__dot" style="background:var(--color-mastery-none)"></span>Sem dados</span>
      </div>
    </div>
  `;
}

function evolucaoHtml(attempts) {
  const daily = dailySeries(attempts, 14);
  const weekly = weeklySeries(attempts, 8);
  const monthly = monthlySeries(attempts, 6);
  return `
    <div class="section">
      <div class="section__title"><span class="text-headline">Últimos 14 dias</span></div>
      <div class="card">${renderLineChart(daily.map((d) => ({ label: d.date.slice(8), value: d.pct })), { color: '#1C3F72' })}</div>
    </div>
    <div class="section">
      <div class="section__title"><span class="text-headline">Últimas 8 semanas</span></div>
      <div class="card">${renderLineChart(weekly.map((w) => ({ label: w.label, value: w.pct })), { color: '#B9832A' })}</div>
    </div>
    <div class="section">
      <div class="section__title"><span class="text-headline">Últimos 6 meses</span></div>
      <div class="card">${renderLineChart(monthly.map((m) => ({ label: m.label, value: m.pct })), { color: '#16A34A' })}</div>
    </div>
  `;
}
