import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { formatCurrency, formatMonthYear, monthLabelShort } from '../utils/format.js';
import {
  monthSummary, totalBalance, percentChange, last6MonthsSeries, categoryBreakdown, monthTransactions,
} from '../store/selectors.js';
import { buildInsights } from '../utils/insights.js';
import { getCategory } from '../data/categories.js';
import { renderLineChart } from '../charts/lineChart.js';
import { transactionRowHtml, bindTransactionRows } from '../components/transactionRow.js';
import { navigateTab } from '../router.js';

export function renderDashboard(root) {
  const now = new Date();
  const { transactions, goals } = store.state;
  const current = monthSummary(transactions, now);
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previous = monthSummary(transactions, prevDate);
  const balance = totalBalance(transactions);
  const expenseChange = percentChange(current.expense, previous.expense);
  const series = last6MonthsSeries(transactions, now);
  const insights = buildInsights(transactions, goals);
  const thisMonthTx = monthTransactions(transactions, now.getFullYear(), now.getMonth());
  const topCategories = categoryBreakdown(thisMonthTx, 'expense').slice(0, 4);
  const maxCat = topCategories[0]?.total || 1;
  const recent = [...transactions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  root.innerHTML = `
    <div class="screen-header">
      <div class="screen-header__titles">
        <div class="text-footnote text-secondary">${formatMonthYear(now)}</div>
        <div class="text-title">Olá, ${store.state.settings.userName}</div>
      </div>
      <button class="icon-btn" id="goto-profile" aria-label="Perfil">${icon('user', { size: 18 })}</button>
    </div>

    <div class="section">
      <div class="balance-card">
        <div class="balance-card__label">Saldo atual</div>
        <div class="balance-card__value tabular-nums">${formatCurrency(balance)}</div>
        <div class="balance-card__row">
          <div class="balance-card__stat">
            <div class="balance-card__stat-label">${icon('arrowUp', { size: 12 })} Receitas do mês</div>
            <div class="balance-card__stat-value tabular-nums">${formatCurrency(current.income)}</div>
          </div>
          <div class="balance-card__divider"></div>
          <div class="balance-card__stat">
            <div class="balance-card__stat-label">${icon('arrowDown', { size: 12 })} Despesas do mês</div>
            <div class="balance-card__stat-value tabular-nums">${formatCurrency(current.expense)}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="stat-grid">
        <div class="stat-tile">
          <div class="stat-tile__label text-footnote">${icon('wallet', { size: 14 })} Economia do mês</div>
          <div class="stat-tile__value tabular-nums ${current.savings >= 0 ? 'text-positive' : 'text-negative'}">${formatCurrency(current.savings)}</div>
        </div>
        <div class="stat-tile">
          <div class="stat-tile__label text-footnote">${icon('trending', { size: 14 })} vs. mês anterior</div>
          <div class="stat-tile__delta ${expenseChange <= 0 ? 'text-positive' : 'text-negative'}">
            ${icon(expenseChange <= 0 ? 'arrowDown' : 'arrowUp', { size: 12 })} ${Math.abs(expenseChange).toFixed(0)}% em gastos
          </div>
        </div>
      </div>
    </div>

    ${insights.length ? `
    <div class="section" style="display:flex;flex-direction:column;gap:10px">
      ${insights.map((i) => `
        <div class="insight">
          <span class="insight__icon">${icon(i.icon, { size: 18 })}</span>
          <span class="insight__text">${i.text}</span>
        </div>
      `).join('')}
    </div>` : ''}

    <div class="section">
      <div class="section__title">
        <span class="text-headline">Evolução</span>
        <span class="text-footnote text-tertiary">últimos 6 meses</span>
      </div>
      <div class="card">
        ${renderLineChart(series.map((s) => ({ label: monthLabelShort(s.month), value: s.savings })), { color: '#16A34A' })}
      </div>
    </div>

    <div class="section">
      <div class="section__title">
        <span class="text-headline">Maiores gastos</span>
        <button class="text-footnote text-brand" id="goto-reports" style="font-weight:700">Ver relatórios</button>
      </div>
      <div class="card">
        ${topCategories.length ? topCategories.map((c) => {
          const cat = getCategory(c.category);
          const pct = Math.round((c.total / maxCat) * 100);
          return `
            <div style="margin-bottom:14px">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                <span class="text-footnote" style="display:flex;align-items:center;gap:8px;font-weight:600">
                  <span style="width:22px;height:22px;border-radius:7px;background:${cat.color}1F;color:${cat.color};display:inline-flex;align-items:center;justify-content:center">${icon(cat.icon, { size: 13 })}</span>
                  ${cat.label}
                </span>
                <span class="text-footnote tabular-nums" style="font-weight:700">${formatCurrency(c.total)}</span>
              </div>
              <div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${cat.color}"></div></div>
            </div>
          `;
        }).join('') : `<div class="empty-state">${icon('chart', { size: 32 })}<div class="text-footnote">Nenhum gasto registrado ainda</div></div>`}
      </div>
    </div>

    <div class="section">
      <div class="section__title">
        <span class="text-headline">Últimas movimentações</span>
        <button class="text-footnote text-brand" id="goto-history" style="font-weight:700">Ver tudo</button>
      </div>
      <div class="card">
        ${recent.length ? recent.map((tx, i) => transactionRowHtml(tx, { showDivider: i < recent.length - 1 })).join('') : `<div class="empty-state">${icon('wallet', { size: 32 })}<div class="text-footnote">Nenhuma movimentação ainda</div></div>`}
      </div>
    </div>
  `;

  bindTransactionRows(root, recent);
  root.querySelector('#goto-history').addEventListener('click', () => navigateTab('history'));
  root.querySelector('#goto-reports').addEventListener('click', () => navigateTab('reports'));
  root.querySelector('#goto-profile').addEventListener('click', () => navigateTab('profile'));
}
