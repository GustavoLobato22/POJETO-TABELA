import { icon } from '../icons.js';
import { getCategory } from '../data/categories.js';
import { formatCurrency } from '../utils/format.js';
import { openTransactionActionsSheet } from '../screens/transactionActions.js';

export function transactionRowHtml(tx, { showDivider = true } = {}) {
  const cat = getCategory(tx.category);
  const isIncome = tx.type === 'income';
  return `
    <div class="list-item" data-tx-id="${tx.id}" role="button" tabindex="0">
      <span class="list-item__icon" style="background:${cat.color}1F;color:${cat.color}">${icon(cat.icon, { size: 19 })}</span>
      <div class="list-item__body">
        <div class="list-item__title">${tx.description}${tx.favorite ? ' ★' : ''}</div>
        <div class="list-item__subtitle">${cat.label}</div>
      </div>
      <div class="list-item__amount ${isIncome ? 'text-positive' : 'text-negative'}">${isIncome ? '+' : '−'} ${formatCurrency(tx.amount)}</div>
    </div>
    ${showDivider ? '<div class="list-divider"></div>' : ''}
  `;
}

export function bindTransactionRows(container, transactions) {
  container.querySelectorAll('[data-tx-id]').forEach((el) => {
    const open = () => {
      const tx = transactions.find((t) => t.id === el.dataset.txId);
      if (tx) openTransactionActionsSheet(tx);
    };
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
}
