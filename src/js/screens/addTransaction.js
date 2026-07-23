import { openSheet } from '../ui/sheet.js';
import { showToast } from '../ui/toast.js';
import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { categoriesFor, getCategory } from '../data/categories.js';
import { PAYMENT_METHODS } from '../data/paymentMethods.js';
import { toDateKey } from '../utils/format.js';

function centsToDisplay(cents) {
  const value = cents / 100;
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function openAddTransactionSheet({ transaction, defaultType = 'expense' } = {}) {
  const isEdit = !!transaction;
  const state = {
    type: transaction?.type || defaultType,
    cents: transaction ? Math.round(transaction.amount * 100) : 0,
    description: transaction?.description || '',
    category: transaction?.category || null,
    date: transaction?.date || toDateKey(new Date()),
    paymentMethod: transaction?.paymentMethod || 'pix',
    note: transaction?.note || '',
  };

  openSheet({
    title: isEdit ? 'Editar movimentação' : 'Nova movimentação',
    render(body, close) {
      body.innerHTML = `
        <div class="segmented" id="type-segmented" style="margin-bottom:20px">
          <div class="segmented__item" data-type="income">Receita</div>
          <div class="segmented__item" data-type="expense">Despesa</div>
        </div>

        <div style="text-align:center;margin-bottom:8px">
          <div class="text-footnote text-secondary">Valor</div>
          <div style="display:flex;align-items:baseline;justify-content:center;gap:6px">
            <span class="text-headline text-secondary">R$</span>
            <input class="field__value-input" id="amount-input" inputmode="decimal" autocomplete="off" value="${centsToDisplay(state.cents)}" />
          </div>
        </div>

        <div class="field">
          <label class="field__label">Descrição</label>
          <input class="field__input" id="desc-input" placeholder="Ex: Supermercado" value="${state.description}" maxlength="60" />
        </div>

        <div class="field">
          <label class="field__label">Categoria</label>
          <div class="category-grid" id="category-grid"></div>
        </div>

        <div class="field">
          <label class="field__label">Data</label>
          <input class="field__input" id="date-input" type="date" value="${state.date}" />
        </div>

        <div class="field">
          <label class="field__label">Forma de pagamento</label>
          <div class="chip-row" id="payment-row"></div>
        </div>

        <div class="field">
          <label class="field__label">Observação (opcional)</label>
          <textarea class="field__input" id="note-input" placeholder="Adicione uma observação...">${state.note}</textarea>
        </div>

        <button class="btn btn--primary" id="save-btn" style="margin-top:4px">${isEdit ? 'Salvar alterações' : 'Adicionar movimentação'}</button>
      `;

      const segmented = body.querySelector('#type-segmented');
      const grid = body.querySelector('#category-grid');
      const paymentRow = body.querySelector('#payment-row');
      const saveBtn = body.querySelector('#save-btn');
      const amountInput = body.querySelector('#amount-input');

      function renderSegmented() {
        segmented.querySelectorAll('.segmented__item').forEach((el) => {
          el.classList.toggle('is-active', el.dataset.type === state.type);
        });
        saveBtn.classList.toggle('btn--primary', true);
        saveBtn.style.background = state.type === 'income' ? 'var(--color-positive)' : 'var(--color-negative)';
      }

      function renderCategoryGrid() {
        const cats = categoriesFor(state.type);
        if (!state.category || !cats.find((c) => c.id === state.category)) {
          state.category = cats[0]?.id || null;
        }
        grid.innerHTML = cats
          .map(
            (c) => `
          <button type="button" class="category-item ${c.id === state.category ? 'is-active' : ''}" data-category="${c.id}">
            <span class="category-item__icon" style="${c.id === state.category ? `background:${c.color};color:#fff` : ''}">${icon(c.icon, { size: 20 })}</span>
            <span class="category-item__label">${c.label}</span>
          </button>
        `
          )
          .join('');
      }

      function renderPaymentRow() {
        paymentRow.innerHTML = PAYMENT_METHODS.map(
          (p) => `
          <button type="button" class="chip ${p.id === state.paymentMethod ? 'is-active' : ''}" data-payment="${p.id}">
            ${icon(p.icon, { size: 14 })} ${p.label}
          </button>
        `
        ).join('');
      }

      segmented.addEventListener('click', (e) => {
        const item = e.target.closest('[data-type]');
        if (!item) return;
        state.type = item.dataset.type;
        state.category = null;
        renderSegmented();
        renderCategoryGrid();
      });

      grid.addEventListener('click', (e) => {
        const item = e.target.closest('[data-category]');
        if (!item) return;
        state.category = item.dataset.category;
        renderCategoryGrid();
      });

      paymentRow.addEventListener('click', (e) => {
        const item = e.target.closest('[data-payment]');
        if (!item) return;
        state.paymentMethod = item.dataset.payment;
        renderPaymentRow();
      });

      amountInput.addEventListener('input', () => {
        const digits = amountInput.value.replace(/\D/g, '');
        state.cents = digits ? parseInt(digits, 10) : 0;
        amountInput.value = centsToDisplay(state.cents);
        amountInput.setSelectionRange(amountInput.value.length, amountInput.value.length);
      });
      amountInput.addEventListener('focus', () => {
        requestAnimationFrame(() => amountInput.setSelectionRange(amountInput.value.length, amountInput.value.length));
      });

      body.querySelector('#desc-input').addEventListener('input', (e) => (state.description = e.target.value));
      body.querySelector('#date-input').addEventListener('input', (e) => (state.date = e.target.value));
      body.querySelector('#note-input').addEventListener('input', (e) => (state.note = e.target.value));

      saveBtn.addEventListener('click', () => {
        if (state.cents <= 0) {
          amountInput.focus();
          amountInput.style.color = 'var(--color-negative)';
          setTimeout(() => (amountInput.style.color = ''), 500);
          return;
        }
        if (!state.description.trim()) {
          const el = body.querySelector('#desc-input');
          el.focus();
          el.style.borderColor = 'var(--color-negative)';
          setTimeout(() => (el.style.borderColor = ''), 800);
          return;
        }

        const payload = {
          type: state.type,
          amount: state.cents / 100,
          description: state.description.trim(),
          category: state.category,
          date: state.date,
          paymentMethod: state.paymentMethod,
          note: state.note.trim(),
        };

        saveBtn.classList.add('transition-standard');
        saveBtn.style.transform = 'scale(0.96)';
        saveBtn.innerHTML = icon('check', { size: 20 });

        setTimeout(() => {
          if (isEdit) {
            store.updateTransaction(transaction.id, payload);
          } else {
            store.addTransaction(payload);
          }
          close();
          showToast(isEdit ? 'Movimentação atualizada' : 'Movimentação adicionada');
        }, 180);
      });

      renderSegmented();
      renderCategoryGrid();
      renderPaymentRow();

      setTimeout(() => body.querySelector('#amount-input').focus(), 260);
    },
  });
}
