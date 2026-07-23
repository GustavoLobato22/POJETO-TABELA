import { icon } from '../icons.js';
import { openPage } from '../ui/page.js';
import { openSheet } from '../ui/sheet.js';
import { showToast } from '../ui/toast.js';
import { store } from '../store/store.js';
import { formatCurrency, toDateKey } from '../utils/format.js';
import { categoriesFor, getCategory } from '../data/categories.js';
import { monthTransactions } from '../store/selectors.js';

function billStatus(bill) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const paid = monthTransactions(store.state.transactions, year, month).some(
    (t) => t.type === 'expense' && t.description === bill.title && t.category === bill.category
  );
  if (paid) return { label: 'Pago este mês', kind: 'positive' };
  const diff = bill.dueDay - now.getDate();
  if (diff < 0) return { label: `Atrasada há ${Math.abs(diff)}d`, kind: 'negative' };
  if (diff === 0) return { label: 'Vence hoje', kind: 'warning' };
  if (diff <= 3) return { label: `Vence em ${diff}d`, kind: 'warning' };
  return { label: `Vence dia ${bill.dueDay}`, kind: 'neutral' };
}

export function openFixedBillsPage() {
  openPage({
    title: 'Contas fixas',
    headerAction: { html: `<button class="icon-btn">${icon('plus', { size: 18 })}</button>`, onClick: () => openBillForm({ onSaved: () => ctxRef.rerender() }) },
    render(body, ctx) {
      ctxRef = ctx;
      const bills = store.state.fixedBills;
      const total = bills.reduce((a, b) => a + b.amount, 0);
      body.innerHTML = `
        <div class="card" style="margin-bottom:20px">
          <div class="text-footnote text-secondary">Total mensal em contas fixas</div>
          <div class="text-title" style="margin-top:4px">${formatCurrency(total)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${bills.length ? bills.map((b) => billRowHtml(b)).join('') : `<div class="empty-state">${icon('repeat', { size: 32 })}<div class="text-footnote">Nenhuma conta fixa cadastrada</div></div>`}
        </div>
        <button class="btn btn--secondary" id="new-bill-btn" style="margin-top:20px">${icon('plus', { size: 18 })} Nova conta fixa</button>
      `;
      body.querySelectorAll('[data-bill-id]').forEach((el) => {
        const bill = bills.find((b) => b.id === el.dataset.billId);
        el.querySelector('[data-action="pay"]')?.addEventListener('click', (e) => {
          e.stopPropagation();
          store.addTransaction({ type: 'expense', amount: bill.amount, description: bill.title, category: bill.category, date: toDateKey(new Date()), paymentMethod: 'conta' });
          showToast(`${bill.title} lançada como paga`);
          ctx.rerender();
        });
        el.addEventListener('click', () => openBillForm({ bill, onSaved: () => ctx.rerender() }));
      });
      body.querySelector('#new-bill-btn').addEventListener('click', () => openBillForm({ onSaved: () => ctx.rerender() }));
    },
  });
}

let ctxRef = null;

function billRowHtml(bill) {
  const cat = getCategory(bill.category);
  const status = billStatus(bill);
  return `
    <div class="card card--pressable" data-bill-id="${bill.id}" role="button" tabindex="0">
      <div style="display:flex;align-items:center;gap:12px">
        <span style="width:40px;height:40px;border-radius:12px;background:${cat.color}1F;color:${cat.color};display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon(cat.icon, { size: 19 })}</span>
        <div style="flex:1;min-width:0">
          <div class="text-body-lg" style="font-weight:700">${bill.title}</div>
          <div class="text-caption" style="margin-top:2px" data-kind="${status.kind}">
            <span class="badge badge--${status.kind}">${status.label}</span>
          </div>
        </div>
        <div style="text-align:right">
          <div class="text-body-lg tabular-nums" style="font-weight:700">${formatCurrency(bill.amount)}</div>
          ${status.kind !== 'positive' ? `<button class="text-footnote text-brand" data-action="pay" style="font-weight:700;margin-top:4px">Marcar paga</button>` : ''}
        </div>
      </div>
    </div>
  `;
}

function openBillForm({ bill, onSaved }) {
  const isEdit = !!bill;
  const state = {
    title: bill?.title || '',
    amount: bill?.amount || '',
    category: bill?.category || 'moradia',
    dueDay: bill?.dueDay || 5,
  };
  openSheet({
    title: isEdit ? 'Editar conta fixa' : 'Nova conta fixa',
    render(body, close) {
      body.innerHTML = `
        <div class="field"><label class="field__label">Nome</label><input class="field__input" id="title-input" placeholder="Ex: Aluguel" value="${state.title}" /></div>
        <div class="field"><label class="field__label">Valor</label><input class="field__input" id="amount-input" type="number" inputmode="decimal" placeholder="R$ 0,00" value="${state.amount}" /></div>
        <div class="field"><label class="field__label">Categoria</label>
          <div class="category-grid">${categoriesFor('expense').map((c) => `
            <button type="button" class="category-item ${c.id === state.category ? 'is-active' : ''}" data-category="${c.id}">
              <span class="category-item__icon" style="${c.id === state.category ? `background:${c.color};color:#fff` : ''}">${icon(c.icon, { size: 20 })}</span>
              <span class="category-item__label">${c.label}</span>
            </button>`).join('')}
          </div>
        </div>
        <div class="field"><label class="field__label">Dia de vencimento</label><input class="field__input" id="day-input" type="number" min="1" max="28" value="${state.dueDay}" /></div>
        <button class="btn btn--primary" id="save-btn" style="margin-top:4px">${isEdit ? 'Salvar' : 'Adicionar conta fixa'}</button>
        ${isEdit ? `<button class="btn btn--danger" id="delete-btn" style="margin-top:10px">${icon('trash', { size: 16 })} Excluir</button>` : ''}
      `;
      body.querySelectorAll('[data-category]').forEach((el) => el.addEventListener('click', () => {
        state.category = el.dataset.category;
        body.querySelectorAll('[data-category]').forEach((e) => {
          const active = e.dataset.category === state.category;
          const c = getCategory(e.dataset.category);
          e.classList.toggle('is-active', active);
          e.querySelector('.category-item__icon').style.cssText = active ? `background:${c.color};color:#fff` : '';
        });
      }));
      body.querySelector('#save-btn').addEventListener('click', () => {
        const title = body.querySelector('#title-input').value.trim();
        const amount = parseFloat(body.querySelector('#amount-input').value);
        const dueDay = parseInt(body.querySelector('#day-input').value, 10) || 5;
        if (!title || !amount || amount <= 0) return;
        if (isEdit) store.updateFixedBill(bill.id, { title, amount, category: state.category, dueDay });
        else store.addFixedBill({ title, amount, category: state.category, dueDay });
        close();
        showToast(isEdit ? 'Conta fixa atualizada' : 'Conta fixa adicionada');
        onSaved();
      });
      body.querySelector('#delete-btn')?.addEventListener('click', () => {
        store.deleteFixedBill(bill.id);
        close();
        onSaved();
      });
    },
  });
}
