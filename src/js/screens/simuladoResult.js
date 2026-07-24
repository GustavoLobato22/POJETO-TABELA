import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { openPage } from '../ui/page.js';
import { getSubject } from '../data/subjects.js';
import { formatDuration } from '../utils/format.js';
import { renderBarChart } from '../charts/barChart.js';

export function openSimuladoResult(record) {
  openPage({
    title: 'Resultado do simulado',
    render: (body, { close }) => draw(body, record, close),
  });
}

function draw(body, record, close) {
  const history = store.state.simulados.filter((s) => s.id !== record.id);
  const previous = history[0];
  const delta = previous ? Math.round((record.scorePct - previous.scorePct) * 10) / 10 : null;

  // Faixa de corte histórica citada em editais anteriores da PMES (40-50%
  // geral / 20-30% por disciplina) — usada aqui apenas como referência de
  // estudo, nunca como garantia de aprovação no concurso real.
  const approvalLikely = record.scorePct >= 60 ? 'alta' : record.scorePct >= 45 ? 'média' : 'baixa';
  const approvalColor = record.scorePct >= 60 ? 'positive' : record.scorePct >= 45 ? 'warning' : 'negative';

  const subjectSeries = Object.entries(record.subjectBreakdown).map(([id, b]) => ({
    label: getSubject(id)?.short.slice(0, 4) || id,
    a: b.correct,
    b: b.total - b.correct,
  }));

  body.innerHTML = `
    <div class="section" style="text-align:center">
      <div class="hero-card">
        <div class="hero-card__label">Sua nota</div>
        <div class="hero-card__value">${record.scorePct}%</div>
        <div class="hero-card__row">
          <div class="hero-card__stat">
            <div class="hero-card__stat-label">${icon('checkCircle', { size: 12 })} Acertos</div>
            <div class="hero-card__stat-value">${record.correctCount}/${record.size}</div>
          </div>
          <div class="hero-card__divider"></div>
          <div class="hero-card__stat">
            <div class="hero-card__stat-label">${icon('clock', { size: 12 })} Tempo total</div>
            <div class="hero-card__stat-value">${formatDuration(record.durationSeconds)}</div>
          </div>
        </div>
      </div>
    </div>

    ${delta !== null ? `
    <div class="section">
      <div class="insight ${delta >= 0 ? '' : 'insight--warning'}">
        <span class="insight__icon">${icon(delta >= 0 ? 'arrowUp' : 'arrowDown', { size: 18 })}</span>
        <span class="insight__text">${delta >= 0 ? `Você melhorou ${delta}%` : `Sua nota caiu ${Math.abs(delta)}%`} em relação ao simulado anterior (${previous.scorePct}%).</span>
      </div>
    </div>` : ''}

    <div class="section">
      <div class="card">
        <div class="text-headline" style="margin-bottom:8px">Chance estimada de aprovação: <span class="badge badge--${approvalColor}">${approvalLikely}</span></div>
        <div class="text-footnote text-secondary">Estimativa baseada no seu desempenho neste simulado frente à faixa de corte histórica da PMES (cerca de 40–50% geral e 20–30% por disciplina). É apenas uma referência de estudo — nunca uma garantia de aprovação real.</div>
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Acertos por disciplina</span></div>
      <div class="card">
        ${renderBarChart(subjectSeries, { grouped: true, colorA: '#16A34A', colorB: '#DC2626' })}
        <div class="heatmap-legend" style="margin-top:8px">
          <span class="heatmap-legend__item"><span class="heatmap-legend__dot" style="background:#16A34A"></span>Acertos</span>
          <span class="heatmap-legend__item"><span class="heatmap-legend__dot" style="background:#DC2626"></span>Erros/brancos</span>
        </div>
      </div>
    </div>

    <div class="section">
      <button class="btn btn--primary" id="close-result">Concluir</button>
    </div>
  `;

  body.querySelector('#close-result').addEventListener('click', () => close());
}
