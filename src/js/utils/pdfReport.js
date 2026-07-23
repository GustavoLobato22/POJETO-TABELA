import { formatCurrency, formatMonthYear, formatDateShort } from './format.js';
import { getCategory } from '../data/categories.js';
import { monthSummary, categoryBreakdown, monthTransactions } from '../store/selectors.js';

export function printMonthlyReport(state) {
  const now = new Date();
  const summary = monthSummary(state.transactions, now);
  const monthTx = monthTransactions(state.transactions, now.getFullYear(), now.getMonth()).sort((a, b) => (a.date < b.date ? 1 : -1));
  const breakdown = categoryBreakdown(monthTx, 'expense');

  const rows = monthTx
    .map(
      (t) => `
    <tr>
      <td>${formatDateShort(t.date)}</td>
      <td>${t.description}</td>
      <td>${getCategory(t.category).label}</td>
      <td style="text-align:right;color:${t.type === 'income' ? '#16A34A' : '#DC2626'}">${t.type === 'income' ? '+' : '−'} ${formatCurrency(t.amount)}</td>
    </tr>`
    )
    .join('');

  const catRows = breakdown
    .map((b) => `<tr><td>${getCategory(b.category).label}</td><td style="text-align:right">${formatCurrency(b.total)}</td></tr>`)
    .join('');

  const html = `
    <!doctype html><html><head><meta charset="utf-8"><title>Relatório financeiro</title>
    <style>
      body{font-family:-apple-system,Helvetica,Arial,sans-serif;color:#12141A;padding:32px;}
      h1{font-size:20px;margin-bottom:2px}
      .muted{color:#62666F;font-size:13px;margin-bottom:24px}
      .summary{display:flex;gap:24px;margin-bottom:28px}
      .summary div{flex:1}
      .label{font-size:11px;color:#62666F;text-transform:uppercase;letter-spacing:.04em}
      .value{font-size:18px;font-weight:700;margin-top:2px}
      table{width:100%;border-collapse:collapse;margin-bottom:28px}
      th,td{padding:8px 6px;border-bottom:1px solid #EBECEF;font-size:13px;text-align:left}
      th{color:#62666F;font-weight:600}
      h2{font-size:15px;margin:0 0 10px}
    </style></head><body>
      <h1>Relatório financeiro</h1>
      <div class="muted">${formatMonthYear(now)}</div>
      <div class="summary">
        <div><div class="label">Receitas</div><div class="value" style="color:#16A34A">${formatCurrency(summary.income)}</div></div>
        <div><div class="label">Despesas</div><div class="value" style="color:#DC2626">${formatCurrency(summary.expense)}</div></div>
        <div><div class="label">Economia</div><div class="value">${formatCurrency(summary.savings)}</div></div>
      </div>
      <h2>Gastos por categoria</h2>
      <table><tbody>${catRows || '<tr><td>Sem dados</td></tr>'}</tbody></table>
      <h2>Movimentações do mês</h2>
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th style="text-align:right">Valor</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4">Sem movimentações</td></tr>'}</tbody>
      </table>
    </body></html>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => iframe.remove(), 1000);
  }, 250);
}
