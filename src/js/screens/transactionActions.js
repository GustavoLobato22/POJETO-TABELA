import { openSheet } from '../ui/sheet.js';
import { showToast } from '../ui/toast.js';
import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { openAddTransactionSheet } from './addTransaction.js';
import { formatCurrency, formatDateLong } from '../utils/format.js';
import { getCategory } from '../data/categories.js';

export function openTransactionActionsSheet(tx) {
  openSheet({
    title: tx.description,
    subtitle: formatDateLong(tx.date),
    render(body, close) {
      const cat = getCategory(tx.category);
      body.innerHTML = `
        <div class="card card--flat" style="background:var(--color-surface-sunken);display:flex;align-items:center;gap:12px;margin-bottom:20px">
          <span class="list-item__icon" style="background:${cat.color}22;color:${cat.color}">${icon(cat.icon, { size: 20 })}</span>
          <div style="flex:1">
            <div class="text-body-lg">${tx.description}</div>
            <div class="text-footnote text-tertiary">${cat.label}</div>
          </div>
          <div class="text-headline ${tx.type === 'income' ? 'text-positive' : 'text-negative'}">${tx.type === 'income' ? '+' : '−'} ${formatCurrency(tx.amount)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="btn btn--secondary" data-action="favorite" style="justify-content:flex-start;gap:12px">${icon('star', { size: 18 })} ${tx.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</button>
          <button class="btn btn--secondary" data-action="edit" style="justify-content:flex-start;gap:12px">${icon('edit', { size: 18 })} Editar</button>
          <button class="btn btn--secondary" data-action="duplicate" style="justify-content:flex-start;gap:12px">${icon('copy', { size: 18 })} Duplicar</button>
          <button class="btn btn--danger" data-action="delete" style="justify-content:flex-start;gap:12px">${icon('trash', { size: 18 })} Excluir</button>
        </div>
      `;

      body.querySelector('[data-action="favorite"]').addEventListener('click', () => {
        store.toggleFavorite(tx.id);
        close();
      });
      body.querySelector('[data-action="edit"]').addEventListener('click', () => {
        close();
        setTimeout(() => openAddTransactionSheet({ transaction: tx }), 220);
      });
      body.querySelector('[data-action="duplicate"]').addEventListener('click', () => {
        store.duplicateTransaction(tx.id);
        close();
        showToast('Movimentação duplicada');
      });
      body.querySelector('[data-action="delete"]').addEventListener('click', () => {
        store.deleteTransaction(tx.id);
        close();
        showToast('Movimentação excluída');
      });
    },
  });
}
