import { icon } from '../icons.js';
import { openPage } from '../ui/page.js';
import { openSheet } from '../ui/sheet.js';
import { showToast } from '../ui/toast.js';
import { store } from '../store/store.js';
import { formatCurrency } from '../utils/format.js';
import { transactionRowHtml, bindTransactionRows } from '../components/transactionRow.js';

const CARD_COLORS = ['#12141A', '#7C3AED', '#F5A623', '#0EA5A5', '#DC2626', '#3B6FCC'];

export function openCardsPage() {
  openPage({
    title: 'Cartões',
    headerAction: { html: `<button class="icon-btn">${icon('plus', { size: 18 })}</button>`, onClick: () => openCardForm({ onSaved: () => ctxRef.rerender() }) },
    render(body, ctx) {
      ctxRef = ctx;
      const cards = store.state.cards;
      body.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:20px">
          ${cards.length ? cards.map((c) => cardBlockHtml(c)).join('') : `<div class="empty-state">${icon('card', { size: 32 })}<div class="text-footnote">Nenhum cartão cadastrado</div></div>`}
        </div>
        <button class="btn btn--secondary" id="new-card-btn" style="margin-top:20px">${icon('plus', { size: 18 })} Novo cartão</button>
      `;
      body.querySelectorAll('[data-edit-card]').forEach((el) => {
        el.addEventListener('click', () => {
          const card = cards.find((c) => c.id === el.dataset.editCard);
          openCardForm({ card, onSaved: () => ctx.rerender() });
        });
      });
      const allTx = store.state.transactions;
      bindTransactionRows(body, allTx);
    },
  });
}

let ctxRef = null;

function cardBlockHtml(card) {
  const available = Math.max(0, card.limit - card.used);
  const pct = card.limit > 0 ? Math.min(100, Math.round((card.used / card.limit) * 100)) : 0;
  const now = new Date();
  const cardTx = store.state.transactions
    .filter((t) => t.cardId === card.id && new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear())
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return `
    <div>
      <div class="credit-card" style="background:linear-gradient(135deg, ${card.color} 0%, ${shade(card.color)} 100%)">
        <div class="credit-card__top">
          <div>
            <div class="text-footnote" style="opacity:.85">Cartão</div>
            <div class="text-headline">${card.name}</div>
          </div>
          <button class="icon-btn" data-edit-card="${card.id}" style="background:rgba(255,255,255,0.15);border-color:transparent;color:#fff">${icon('edit', { size: 16 })}</button>
        </div>
        <div class="credit-card__number">•••• •••• •••• ${card.last4}</div>
        <div class="credit-card__meta">
          <div>
            <div class="text-caption" style="opacity:.8">Disponível</div>
            <div class="text-body-lg" style="font-weight:700">${formatCurrency(available)}</div>
          </div>
          <div style="text-align:right">
            <div class="text-caption" style="opacity:.8">Limite</div>
            <div class="text-footnote">${formatCurrency(card.limit)}</div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:10px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span class="text-footnote text-secondary">Utilizado</span>
          <span class="text-footnote" style="font-weight:700">${formatCurrency(card.used)} (${pct}%)</span>
        </div>
        <div class="progress-track" style="margin-bottom:14px">
          <div class="progress-fill ${pct > 85 ? 'progress-fill--danger' : pct > 60 ? 'progress-fill--warning' : ''}" style="width:${pct}%"></div>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span class="text-caption text-tertiary">Fechamento dia ${card.closingDay}</span>
          <span class="text-caption text-tertiary">Vencimento dia ${card.dueDay}</span>
        </div>
      </div>

      ${cardTx.length ? `
        <div class="card" style="margin-top:10px">
          <div class="text-footnote text-secondary" style="font-weight:700;margin-bottom:6px">Compras este mês</div>
          ${cardTx.map((tx, i) => transactionRowHtml(tx, { showDivider: i < cardTx.length - 1 })).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function shade(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (n >> 16) - 30);
  const g = Math.max(0, ((n >> 8) & 0xff) - 30);
  const b = Math.max(0, (n & 0xff) - 30);
  return `rgb(${r},${g},${b})`;
}

function openCardForm({ card, onSaved }) {
  const isEdit = !!card;
  const state = {
    name: card?.name || '',
    last4: card?.last4 || '',
    limit: card?.limit || '',
    used: card?.used || 0,
    closingDay: card?.closingDay || 1,
    dueDay: card?.dueDay || 10,
    color: card?.color || CARD_COLORS[0],
  };
  openSheet({
    title: isEdit ? 'Editar cartão' : 'Novo cartão',
    render(body, close) {
      body.innerHTML = `
        <div class="field"><label class="field__label">Nome do cartão</label><input class="field__input" id="name-input" placeholder="Ex: Nubank" value="${state.name}" /></div>
        <div class="field"><label class="field__label">Últimos 4 dígitos</label><input class="field__input" id="last4-input" maxlength="4" placeholder="0000" value="${state.last4}" /></div>
        <div class="field"><label class="field__label">Limite total</label><input class="field__input" id="limit-input" type="number" placeholder="R$ 0,00" value="${state.limit}" /></div>
        <div class="field"><label class="field__label">Já utilizado</label><input class="field__input" id="used-input" type="number" placeholder="R$ 0,00" value="${state.used}" /></div>
        <div style="display:flex;gap:12px">
          <div class="field" style="flex:1"><label class="field__label">Fechamento</label><input class="field__input" id="closing-input" type="number" min="1" max="31" value="${state.closingDay}" /></div>
          <div class="field" style="flex:1"><label class="field__label">Vencimento</label><input class="field__input" id="due-input" type="number" min="1" max="31" value="${state.dueDay}" /></div>
        </div>
        <div class="field"><label class="field__label">Cor</label>
          <div class="chip-row">${CARD_COLORS.map((c) => `<button class="color-choice" data-color="${c}" style="width:32px;height:32px;border-radius:50%;background:${c};border:2px solid ${c === state.color ? 'var(--color-text-primary)' : 'transparent'}"></button>`).join('')}</div>
        </div>
        <button class="btn btn--primary" id="save-btn" style="margin-top:4px">${isEdit ? 'Salvar' : 'Adicionar cartão'}</button>
        ${isEdit ? `<button class="btn btn--danger" id="delete-btn" style="margin-top:10px">${icon('trash', { size: 16 })} Excluir cartão</button>` : ''}
      `;
      body.querySelectorAll('.color-choice').forEach((el) => el.addEventListener('click', () => {
        state.color = el.dataset.color;
        body.querySelectorAll('.color-choice').forEach((e) => e.style.borderColor = e === el ? 'var(--color-text-primary)' : 'transparent');
      }));
      body.querySelector('#save-btn').addEventListener('click', () => {
        const name = body.querySelector('#name-input').value.trim();
        const last4 = body.querySelector('#last4-input').value.trim() || '0000';
        const limit = parseFloat(body.querySelector('#limit-input').value) || 0;
        const used = parseFloat(body.querySelector('#used-input').value) || 0;
        const closingDay = parseInt(body.querySelector('#closing-input').value, 10) || 1;
        const dueDay = parseInt(body.querySelector('#due-input').value, 10) || 10;
        if (!name || limit <= 0) return;
        const payload = { name, last4, limit, used, closingDay, dueDay, color: state.color };
        if (isEdit) store.updateCard(card.id, payload);
        else store.addCard(payload);
        close();
        showToast(isEdit ? 'Cartão atualizado' : 'Cartão adicionado');
        onSaved();
      });
      body.querySelector('#delete-btn')?.addEventListener('click', () => {
        store.deleteCard(card.id);
        close();
        onSaved();
      });
    },
  });
}
