import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { renderLineChart } from '../charts/lineChart.js';
import { formatDateShort } from '../utils/format.js';
import { openSimuladoRunner } from './simuladoRunner.js';

const SIZES = [20, 40, 60, 80, 100];
let selectedSize = 40;

export function renderSimuladoSetup(root) {
  const history = [...store.state.simulados].sort((a, b) => a.createdAt - b.createdAt);
  const series = history.slice(-8).map((s, i) => ({ label: `#${history.length - Math.min(8, history.length) + i + 1}`, value: s.scorePct }));

  root.innerHTML = `
    <div class="screen-header">
      <div class="screen-header__titles">
        <div class="text-footnote text-secondary">Prova cronometrada</div>
        <div class="text-title">Simulado PMES</div>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <div class="text-headline" style="margin-bottom:4px">Quantas questões?</div>
        <div class="text-footnote text-secondary" style="margin-bottom:16px">A prova real da PMES tem 80 questões. O cronômetro é ajustado proporcionalmente (~3 min por questão).</div>
        <div class="chip-row">
          ${SIZES.map((n) => `<button class="chip ${n === selectedSize ? 'is-active' : ''}" data-size="${n}">${n} questões</button>`).join('')}
        </div>
        <button class="btn btn--primary" id="start" style="margin-top:20px">${icon('play', { size: 18 })} Iniciar simulado (${selectedSize} questões · ~${selectedSize * 3} min)</button>
      </div>
    </div>

    ${history.length ? `
    <div class="section">
      <div class="section__title"><span class="text-headline">Evolução</span></div>
      <div class="card">${renderLineChart(series.length ? series : [{ label: '—', value: 0 }], { color: '#1C3F72' })}</div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Histórico</span></div>
      <div class="card">
        ${[...history].reverse().slice(0, 8).map((s, i, arr) => `
          <div class="list-item" style="${i < arr.length - 1 ? 'border-bottom:1px solid var(--color-border)' : ''}">
            <span class="list-item__icon" style="background:var(--color-brand-soft);color:var(--color-brand)">${icon('clipboardList', { size: 16 })}</span>
            <span class="list-item__body">
              <span class="list-item__title">${s.size} questões · ${formatDateShort(new Date(s.createdAt))}</span>
              <span class="list-item__subtitle">${Math.round(s.durationSeconds / 60)} min de duração</span>
            </span>
            <span class="badge badge--${s.scorePct >= 70 ? 'positive' : s.scorePct >= 50 ? 'warning' : 'negative'}">${s.scorePct}%</span>
          </div>
        `).join('')}
      </div>
    </div>` : `
    <div class="empty-state">${icon('clipboardList', { size: 36 })}<div class="text-footnote">Faça seu primeiro simulado para começar a acompanhar sua evolução</div></div>
    `}
  `;

  root.querySelectorAll('[data-size]').forEach((btn) => btn.addEventListener('click', () => {
    selectedSize = Number(btn.dataset.size);
    renderSimuladoSetup(root);
  }));
  root.querySelector('#start').addEventListener('click', () => openSimuladoRunner(selectedSize));
}
