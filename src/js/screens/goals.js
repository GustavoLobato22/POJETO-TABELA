import { icon } from '../icons.js';
import { openPage } from '../ui/page.js';
import { openSheet } from '../ui/sheet.js';
import { showToast } from '../ui/toast.js';
import { store } from '../store/store.js';
import { formatCurrency } from '../utils/format.js';
import { monthSummary } from '../store/selectors.js';

const GOAL_ICONS = ['target', 'trending', 'star', 'house', 'card', 'briefcase', 'heart', 'wallet'];
const GOAL_COLORS = ['#16A34A', '#3B6FCC', '#D97706', '#7C3AED', '#DC2626', '#0EA5A5'];

function estimateMonths(goal) {
  const savings = monthSummary(store.state.transactions).savings;
  if (savings <= 0) return null;
  const remaining = goal.targetAmount - goal.savedAmount;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / savings);
}

export function openGoalsPage() {
  openPage({
    title: 'Metas',
    headerAction: { html: `<button class="icon-btn">${icon('plus', { size: 18 })}</button>`, onClick: () => openGoalForm({ onSaved: () => pageCtx.rerender() }) },
    render(body, ctx) {
      pageCtx = ctx;
      const goals = store.state.goals;
      body.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:16px">
          ${goals.length ? goals.map((g) => goalCardHtml(g)).join('') : `
            <div class="empty-state">${icon('target', { size: 32 })}<div class="text-footnote">Nenhuma meta criada ainda</div></div>
          `}
        </div>
        <button class="btn btn--secondary" id="new-goal-btn" style="margin-top:20px">${icon('plus', { size: 18 })} Nova meta</button>
      `;
      body.querySelectorAll('[data-goal-id]').forEach((el) => {
        el.addEventListener('click', () => {
          const goal = goals.find((g) => g.id === el.dataset.goalId);
          openGoalDetail(goal, () => ctx.rerender());
        });
      });
      body.querySelector('#new-goal-btn').addEventListener('click', () => openGoalForm({ onSaved: () => ctx.rerender() }));
    },
  });
}

let pageCtx = null;

function goalCardHtml(goal) {
  const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
  const months = estimateMonths(goal);
  return `
    <div class="card card--pressable" data-goal-id="${goal.id}" role="button" tabindex="0">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <span style="width:40px;height:40px;border-radius:12px;background:${goal.color}1F;color:${goal.color};display:flex;align-items:center;justify-content:center">${icon(goal.icon, { size: 20 })}</span>
        <div style="flex:1">
          <div class="text-body-lg" style="font-weight:700">${goal.title}</div>
          <div class="text-caption text-tertiary">${formatCurrency(goal.savedAmount)} de ${formatCurrency(goal.targetAmount)}</div>
        </div>
        <div class="text-headline" style="color:${goal.color}">${pct}%</div>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${goal.color}"></div></div>
      <div style="display:flex;justify-content:space-between;margin-top:10px">
        <span class="text-footnote text-secondary">Faltam ${formatCurrency(Math.max(0, goal.targetAmount - goal.savedAmount))}</span>
        <span class="text-footnote text-secondary">${months === null ? 'Sem estimativa' : months === 0 ? 'Concluída!' : `~${months} ${months === 1 ? 'mês' : 'meses'}`}</span>
      </div>
    </div>
  `;
}

function openGoalDetail(goal, onChanged) {
  openSheet({
    title: goal.title,
    render(body, close) {
      const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
      const months = estimateMonths(goal);
      body.innerHTML = `
        <div style="text-align:center;margin-bottom:20px">
          <div class="text-display" style="color:${goal.color}">${pct}%</div>
          <div class="text-footnote text-secondary">${formatCurrency(goal.savedAmount)} de ${formatCurrency(goal.targetAmount)}</div>
        </div>
        <div class="progress-track" style="margin-bottom:16px"><div class="progress-fill" style="width:${pct}%;background:${goal.color}"></div></div>
        <div class="stat-grid" style="margin-bottom:20px">
          <div class="stat-tile"><div class="stat-tile__label text-footnote">Falta alcançar</div><div class="stat-tile__value tabular-nums">${formatCurrency(Math.max(0, goal.targetAmount - goal.savedAmount))}</div></div>
          <div class="stat-tile"><div class="stat-tile__label text-footnote">Estimativa</div><div class="stat-tile__value">${months === null ? '—' : months === 0 ? 'Pronta!' : `${months} ${months === 1 ? 'mês' : 'meses'}`}</div></div>
        </div>
        <div class="field">
          <label class="field__label">Adicionar valor guardado</label>
          <input class="field__input" id="contribute-input" type="number" inputmode="decimal" placeholder="R$ 0,00" />
        </div>
        <button class="btn btn--primary" id="contribute-btn" style="margin-bottom:10px">Guardar valor</button>
        <button class="btn btn--danger" id="delete-goal-btn">${icon('trash', { size: 16 })} Excluir meta</button>
      `;
      body.querySelector('#contribute-btn').addEventListener('click', () => {
        const val = parseFloat(body.querySelector('#contribute-input').value);
        if (!val || val <= 0) return;
        store.contributeToGoal(goal.id, val);
        close();
        showToast('Valor adicionado à meta');
        onChanged();
      });
      body.querySelector('#delete-goal-btn').addEventListener('click', () => {
        store.deleteGoal(goal.id);
        close();
        onChanged();
      });
    },
  });
}

function openGoalForm({ onSaved }) {
  const state = { title: '', targetAmount: '', icon: GOAL_ICONS[0], color: GOAL_COLORS[0] };
  openSheet({
    title: 'Nova meta',
    render(body, close) {
      body.innerHTML = `
        <div class="field"><label class="field__label">Nome da meta</label><input class="field__input" id="title-input" placeholder="Ex: Comprar moto" /></div>
        <div class="field"><label class="field__label">Valor objetivo</label><input class="field__input" id="target-input" type="number" inputmode="decimal" placeholder="R$ 0,00" /></div>
        <div class="field"><label class="field__label">Ícone</label>
          <div class="chip-row">${GOAL_ICONS.map((ic) => `<button class="chip icon-choice ${ic === state.icon ? 'is-active' : ''}" data-icon="${ic}">${icon(ic, { size: 16 })}</button>`).join('')}</div>
        </div>
        <div class="field"><label class="field__label">Cor</label>
          <div class="chip-row">${GOAL_COLORS.map((c) => `<button class="color-choice" data-color="${c}" style="width:32px;height:32px;border-radius:50%;background:${c};border:2px solid ${c === state.color ? 'var(--color-text-primary)' : 'transparent'}"></button>`).join('')}</div>
        </div>
        <button class="btn btn--primary" id="save-goal-btn" style="margin-top:8px">Criar meta</button>
      `;
      body.querySelectorAll('.icon-choice').forEach((el) => el.addEventListener('click', () => {
        state.icon = el.dataset.icon;
        body.querySelectorAll('.icon-choice').forEach((e) => e.classList.toggle('is-active', e === el));
      }));
      body.querySelectorAll('.color-choice').forEach((el) => el.addEventListener('click', () => {
        state.color = el.dataset.color;
        body.querySelectorAll('.color-choice').forEach((e) => e.style.borderColor = e === el ? 'var(--color-text-primary)' : 'transparent');
      }));
      body.querySelector('#save-goal-btn').addEventListener('click', () => {
        const title = body.querySelector('#title-input').value.trim();
        const target = parseFloat(body.querySelector('#target-input').value);
        if (!title || !target || target <= 0) return;
        store.addGoal({ title, targetAmount: target, savedAmount: 0, icon: state.icon, color: state.color });
        close();
        showToast('Meta criada');
        onSaved();
      });
    },
  });
}
