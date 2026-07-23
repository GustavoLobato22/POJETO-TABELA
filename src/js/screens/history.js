import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { relativeDayLabel } from '../utils/format.js';
import { getCategory, CATEGORIES } from '../data/categories.js';
import { transactionRowHtml, bindTransactionRows } from '../components/transactionRow.js';

const state = {
  query: '',
  typeFilter: 'all', // all | income | expense | favorite
  categoryFilter: null,
};

function normalize(s) {
  return (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function matchesQuery(tx, query) {
  if (!query) return true;
  const q = normalize(query);
  const cat = getCategory(tx.category);
  return (
    normalize(tx.description).includes(q) ||
    normalize(cat.label).includes(q) ||
    normalize(tx.note).includes(q) ||
    tx.amount.toFixed(2).includes(q.replace(',', '.'))
  );
}

function groupTransactions(list) {
  const groups = [];
  let lastDate = null;
  let bucket = null;
  for (const tx of list) {
    if (tx.date !== lastDate) {
      bucket = { date: tx.date, items: [] };
      groups.push(bucket);
      lastDate = tx.date;
    }
    bucket.items.push(tx);
  }
  return groups;
}

export function renderHistory(root) {
  const { transactions } = store.state;

  let filtered = transactions.filter((tx) => {
    if (state.typeFilter === 'income' && tx.type !== 'income') return false;
    if (state.typeFilter === 'expense' && tx.type !== 'expense') return false;
    if (state.typeFilter === 'favorite' && !tx.favorite) return false;
    if (state.categoryFilter && tx.category !== state.categoryFilter) return false;
    if (!matchesQuery(tx, state.query)) return false;
    return true;
  });
  filtered = [...filtered].sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1));

  const groups = groupTransactions(filtered);

  root.innerHTML = `
    <div class="screen-header">
      <div class="screen-header__titles"><div class="text-title">Histórico</div></div>
    </div>

    <div class="field" style="margin-bottom:14px">
      <div style="position:relative">
        <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--color-text-tertiary)">${icon('search', { size: 18 })}</span>
        <input class="field__input" id="search-input" style="padding-left:44px" placeholder="Buscar por descrição, categoria ou valor" value="${state.query}" />
      </div>
    </div>

    <div class="chip-row" style="margin-bottom:12px">
      <button class="chip ${state.typeFilter === 'all' ? 'is-active' : ''}" data-type="all">Todos</button>
      <button class="chip ${state.typeFilter === 'income' ? 'is-active' : ''}" data-type="income">${icon('arrowUp', { size: 12 })} Receitas</button>
      <button class="chip ${state.typeFilter === 'expense' ? 'is-active' : ''}" data-type="expense">${icon('arrowDown', { size: 12 })} Despesas</button>
      <button class="chip ${state.typeFilter === 'favorite' ? 'is-active' : ''}" data-type="favorite">${icon('star', { size: 12 })} Favoritos</button>
    </div>

    <div class="chip-row" style="margin-bottom:20px;flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px">
      <button class="chip ${!state.categoryFilter ? 'is-active' : ''}" data-cat="">Todas categorias</button>
      ${CATEGORIES.map((c) => `<button class="chip ${state.categoryFilter === c.id ? 'is-active' : ''}" data-cat="${c.id}"><span class="chip__dot" style="background:${c.color}"></span>${c.label}</button>`).join('')}
    </div>

    <div class="section">
      ${groups.length ? groups.map((g) => `
        <div style="margin-bottom:18px">
          <div class="text-footnote text-secondary" style="font-weight:700;margin-bottom:8px">${relativeDayLabel(g.date)}</div>
          <div class="card">
            ${g.items.map((tx, i) => transactionRowHtml(tx, { showDivider: i < g.items.length - 1 })).join('')}
          </div>
        </div>
      `).join('') : `<div class="empty-state">${icon('search', { size: 32 })}<div class="text-footnote">Nenhuma movimentação encontrada</div></div>`}
    </div>
  `;

  root.querySelector('#search-input').addEventListener('input', (e) => {
    state.query = e.target.value;
    renderHistory(root);
    root.querySelector('#search-input').focus();
    const val = root.querySelector('#search-input');
    val.setSelectionRange(val.value.length, val.value.length);
  });

  root.querySelectorAll('[data-type]').forEach((el) => {
    el.addEventListener('click', () => { state.typeFilter = el.dataset.type; renderHistory(root); });
  });
  root.querySelectorAll('[data-cat]').forEach((el) => {
    el.addEventListener('click', () => { state.categoryFilter = el.dataset.cat || null; renderHistory(root); });
  });

  bindTransactionRows(root, filtered);
}
