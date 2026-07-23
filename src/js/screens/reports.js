import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { formatCurrency, formatMonthYear, monthLabelShort, daysInMonth } from '../utils/format.js';
import {
  monthTransactions, monthSummary, categoryBreakdown, percentChange, last6MonthsSeries, biggest, sumByType,
} from '../store/selectors.js';
import { getCategory } from '../data/categories.js';
import { renderDonutChart } from '../charts/donutChart.js';
import { renderBarChart } from '../charts/barChart.js';

const view = { cursor: new Date(new Date().getFullYear(), new Date().getMonth(), 1) };

export function renderReports(root) {
  const { transactions } = store.state;
  const now = new Date();
  const year = view.cursor.getFullYear();
  const month = view.cursor.getMonth();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const elapsedDays = isCurrentMonth ? now.getDate() : daysInMonth(year, month);

  const monthTx = monthTransactions(transactions, year, month);
  const summary = monthSummary(transactions, view.cursor);
  const breakdown = categoryBreakdown(monthTx, 'expense');
  const totalExpense = breakdown.reduce((a, c) => a + c.total, 0) || 1;

  const prevMonth = new Date(year, month - 1, 1);
  const prevSummary = monthSummary(transactions, prevMonth);
  const expenseChange = percentChange(summary.expense, prevSummary.expense);
  const incomeChange = percentChange(summary.income, prevSummary.income);

  const yearTx = transactions.filter((t) => new Date(t.date).getFullYear() === year);
  const prevYearTx = transactions.filter((t) => new Date(t.date).getFullYear() === year - 1);
  const yearExpense = sumByType(yearTx, 'expense');
  const prevYearExpense = sumByType(prevYearTx, 'expense');
  const yearChange = percentChange(yearExpense, prevYearExpense);

  const series = last6MonthsSeries(transactions, view.cursor);
  const biggestExpense = biggest(monthTx, 'expense');
  const biggestIncome = biggest(monthTx, 'income');

  const dailyAvg = summary.expense / Math.max(1, elapsedDays);
  const weeklyAvg = dailyAvg * 7;
  const monthlyAvg = summary.expense;

  root.innerHTML = `
    <div class="screen-header">
      <div class="screen-header__titles"><div class="text-title">Relatórios</div></div>
    </div>

    <div class="card" style="margin-bottom:20px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <button class="icon-btn" id="prev-month">${icon('chevronLeft', { size: 18 })}</button>
        <span class="text-body-lg" style="font-weight:700">${formatMonthYear(view.cursor)}</span>
        <button class="icon-btn" id="next-month">${icon('chevronRight', { size: 18 })}</button>
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Gastos por categoria</span></div>
      <div class="card" style="display:flex;gap:14px;align-items:center">
        ${breakdown.length ? renderDonutChart(breakdown.map((b) => ({ value: b.total, color: getCategory(b.category).color })), { size: 148 }) : `<div class="text-footnote text-tertiary">Sem dados</div>`}
        <div style="flex:1;display:flex;flex-direction:column;gap:10px;min-width:0">
          ${breakdown.slice(0, 6).map((b) => {
            const cat = getCategory(b.category);
            const pct = Math.round((b.total / totalExpense) * 100);
            return `
              <div style="display:flex;align-items:center;gap:6px">
                <span class="chip__dot" style="background:${cat.color};flex-shrink:0"></span>
                <span class="text-caption" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-transform:none;letter-spacing:0;font-weight:600">${cat.label}</span>
                <span class="text-caption text-tertiary tabular-nums" style="flex-shrink:0">${pct}%</span>
              </div>
            `;
          }).join('') || `<div class="text-footnote text-tertiary">Nenhum gasto neste mês</div>`}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Receitas x Despesas</span><span class="text-footnote text-tertiary">6 meses</span></div>
      <div class="card">
        ${renderBarChart(series.map((s) => ({ label: monthLabelShort(s.month), a: s.income, b: s.expense })), { grouped: true, colorA: '#16A34A', colorB: '#DC2626' })}
        <div style="display:flex;gap:16px;margin-top:10px;justify-content:center">
          <span class="text-caption" style="display:flex;align-items:center;gap:6px"><span class="chip__dot" style="background:#16A34A"></span>Receitas</span>
          <span class="text-caption" style="display:flex;align-items:center;gap:6px"><span class="chip__dot" style="background:#DC2626"></span>Despesas</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Médias de gasto</span></div>
      <div class="stat-grid">
        <div class="stat-tile"><div class="stat-tile__label text-footnote">Média diária</div><div class="stat-tile__value tabular-nums">${formatCurrency(dailyAvg)}</div></div>
        <div class="stat-tile"><div class="stat-tile__label text-footnote">Média semanal</div><div class="stat-tile__value tabular-nums">${formatCurrency(weeklyAvg)}</div></div>
        <div class="stat-tile"><div class="stat-tile__label text-footnote">Média mensal</div><div class="stat-tile__value tabular-nums">${formatCurrency(monthlyAvg)}</div></div>
        <div class="stat-tile">
          <div class="stat-tile__label text-footnote">vs. ano anterior</div>
          <div class="stat-tile__delta ${yearChange <= 0 ? 'text-positive' : 'text-negative'}">${icon(yearChange <= 0 ? 'arrowDown' : 'arrowUp', { size: 12 })} ${Math.abs(yearChange).toFixed(0)}%</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Comparação mensal</span></div>
      <div class="card">
        <div style="display:flex;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid var(--color-border);margin-bottom:12px">
          <span class="text-footnote text-secondary">Receitas</span>
          <span class="badge ${incomeChange >= 0 ? 'badge--positive' : 'badge--negative'}">${icon(incomeChange >= 0 ? 'arrowUp' : 'arrowDown', { size: 11 })} ${Math.abs(incomeChange).toFixed(0)}%</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span class="text-footnote text-secondary">Despesas</span>
          <span class="badge ${expenseChange <= 0 ? 'badge--positive' : 'badge--negative'}">${icon(expenseChange <= 0 ? 'arrowDown' : 'arrowUp', { size: 11 })} ${Math.abs(expenseChange).toFixed(0)}%</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Destaques do mês</span></div>
      <div class="card" style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="text-footnote text-secondary">${icon('arrowDown', { size: 12 })} Maior gasto</span>
          <span class="text-footnote" style="font-weight:700">${biggestExpense ? `${biggestExpense.description} · ${formatCurrency(biggestExpense.amount)}` : '—'}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="text-footnote text-secondary">${icon('arrowUp', { size: 12 })} Maior receita</span>
          <span class="text-footnote" style="font-weight:700">${biggestIncome ? `${biggestIncome.description} · ${formatCurrency(biggestIncome.amount)}` : '—'}</span>
        </div>
      </div>
    </div>
  `;

  root.querySelector('#prev-month').addEventListener('click', () => { view.cursor = new Date(year, month - 1, 1); renderReports(root); });
  root.querySelector('#next-month').addEventListener('click', () => { view.cursor = new Date(year, month + 1, 1); renderReports(root); });
}
