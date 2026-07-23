import { icon } from '../icons.js';
import { store } from '../store/store.js';
import {
  formatCurrency, formatMonthYear, formatDateLong, toDateKey, fromDateKey,
  daysInMonth, WEEKDAYS_SHORT, relativeDayLabel,
} from '../utils/format.js';
import { groupByDay, dailyTotals } from '../store/selectors.js';
import { transactionRowHtml, bindTransactionRows } from '../components/transactionRow.js';
import { openSheet } from '../ui/sheet.js';

const view = {
  cursor: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  selected: toDateKey(new Date()),
  filter: 'day', // day | week | month | year | custom
  customRange: null,
};

function txInRange(transactions, start, end) {
  return transactions.filter((t) => {
    const d = fromDateKey(t.date);
    return d >= start && d <= end;
  });
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function scopedTransactions(transactions) {
  const selectedDate = fromDateKey(view.selected);
  if (view.filter === 'day') {
    return { list: transactions.filter((t) => t.date === view.selected), label: relativeDayLabel(view.selected) };
  }
  if (view.filter === 'week') {
    const start = startOfWeek(selectedDate);
    const end = new Date(start); end.setDate(end.getDate() + 6); end.setHours(23, 59, 59, 999);
    return { list: txInRange(transactions, start, end), label: `Semana de ${formatDateLong(start)}` };
  }
  if (view.filter === 'year') {
    const start = new Date(selectedDate.getFullYear(), 0, 1);
    const end = new Date(selectedDate.getFullYear(), 11, 31, 23, 59, 59);
    return { list: txInRange(transactions, start, end), label: `Ano de ${selectedDate.getFullYear()}` };
  }
  if (view.filter === 'custom' && view.customRange) {
    const start = fromDateKey(view.customRange.from);
    const end = fromDateKey(view.customRange.to);
    end.setHours(23, 59, 59, 999);
    return { list: txInRange(transactions, start, end), label: `${formatDateLong(start)} — ${formatDateLong(end)}` };
  }
  const start = new Date(view.cursor.getFullYear(), view.cursor.getMonth(), 1);
  const end = new Date(view.cursor.getFullYear(), view.cursor.getMonth() + 1, 0, 23, 59, 59);
  return { list: txInRange(transactions, start, end), label: formatMonthYear(view.cursor) };
}

export function renderCalendar(root) {
  const { transactions } = store.state;
  const byDay = groupByDay(transactions);
  const year = view.cursor.getFullYear();
  const month = view.cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const totalDays = daysInMonth(year, month);
  const todayKey = toDateKey(new Date());

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const { list: scopedList, label: scopedLabel } = scopedTransactions(transactions);
  const totals = dailyTotals(scopedList);
  const sortedScoped = [...scopedList].sort((a, b) => (a.date < b.date ? 1 : -1));

  root.innerHTML = `
    <div class="screen-header">
      <div class="screen-header__titles">
        <div class="text-title">Calendário</div>
      </div>
    </div>

    <div class="card" style="margin-bottom:20px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <button class="icon-btn" id="prev-month">${icon('chevronLeft', { size: 18 })}</button>
        <span class="text-body-lg" style="font-weight:700">${formatMonthYear(view.cursor)}</span>
        <button class="icon-btn" id="next-month">${icon('chevronRight', { size: 18 })}</button>
      </div>
      <div class="calendar-grid" style="margin-bottom:6px">
        ${WEEKDAYS_SHORT.map((w) => `<div class="calendar-weekday">${w}</div>`).join('')}
      </div>
      <div class="calendar-grid">
        ${cells
          .map((date) => {
            if (!date) return `<div class="calendar-day is-outside"></div>`;
            const key = toDateKey(date);
            const dayTx = byDay.get(key) || [];
            const t = dailyTotals(dayTx);
            const isToday = key === todayKey;
            const isSelected = key === view.selected;
            const dots = [];
            if (t.income > 0) dots.push(`<span class="calendar-day__dot" style="background:var(--color-positive)"></span>`);
            if (t.expense > 0) dots.push(`<span class="calendar-day__dot" style="background:var(--color-negative)"></span>`);
            return `
              <button class="calendar-day ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}" data-day="${key}">
                <span class="calendar-day__num">${date.getDate()}</span>
                <span class="calendar-day__dots">${dots.join('')}</span>
              </button>
            `;
          })
          .join('')}
      </div>
    </div>

    <div class="section" style="display:flex;gap:8px;align-items:center">
      <div class="segmented" id="period-segmented" style="flex:1">
        <div class="segmented__item" data-filter="day">Dia</div>
        <div class="segmented__item" data-filter="week">Semana</div>
        <div class="segmented__item" data-filter="month">Mês</div>
        <div class="segmented__item" data-filter="year">Ano</div>
      </div>
      <button class="icon-btn" id="custom-range" aria-label="Intervalo personalizado">${icon('filter', { size: 16 })}</button>
    </div>

    <div class="section">
      <div class="card" style="margin-bottom:16px">
        <div class="text-footnote text-secondary" style="margin-bottom:12px">${scopedLabel}</div>
        <div style="display:flex;gap:12px">
          <div style="flex:1">
            <div class="text-caption text-tertiary">Entrou</div>
            <div class="text-body-lg text-positive tabular-nums" style="font-weight:700">${formatCurrency(totals.income)}</div>
          </div>
          <div style="flex:1">
            <div class="text-caption text-tertiary">Saiu</div>
            <div class="text-body-lg text-negative tabular-nums" style="font-weight:700">${formatCurrency(totals.expense)}</div>
          </div>
          <div style="flex:1">
            <div class="text-caption text-tertiary">Saldo</div>
            <div class="text-body-lg tabular-nums" style="font-weight:700">${formatCurrency(totals.balance)}</div>
          </div>
        </div>
      </div>

      <div class="card">
        ${sortedScoped.length
          ? sortedScoped.map((tx, i) => transactionRowHtml(tx, { showDivider: i < sortedScoped.length - 1 })).join('')
          : `<div class="empty-state">${icon('calendar', { size: 32 })}<div class="text-footnote">Nenhuma movimentação neste período</div></div>`}
      </div>
    </div>
  `;

  root.querySelector('#prev-month').addEventListener('click', () => {
    view.cursor = new Date(year, month - 1, 1);
    renderCalendar(root);
  });
  root.querySelector('#next-month').addEventListener('click', () => {
    view.cursor = new Date(year, month + 1, 1);
    renderCalendar(root);
  });

  root.querySelectorAll('[data-day]').forEach((el) => {
    el.addEventListener('click', () => {
      view.selected = el.dataset.day;
      view.filter = 'day';
      renderCalendar(root);
    });
  });

  root.querySelectorAll('[data-filter]').forEach((el) => {
    el.classList.toggle('is-active', el.dataset.filter === view.filter);
    el.addEventListener('click', () => {
      view.filter = el.dataset.filter;
      renderCalendar(root);
    });
  });

  root.querySelector('#custom-range').addEventListener('click', () => {
    const from = view.customRange?.from || toDateKey(new Date(year, month, 1));
    const to = view.customRange?.to || todayKey;
    openSheet({
      title: 'Intervalo personalizado',
      render(body, close) {
        body.innerHTML = `
          <div class="field">
            <label class="field__label">De</label>
            <input class="field__input" type="date" id="from-input" value="${from}" />
          </div>
          <div class="field">
            <label class="field__label">Até</label>
            <input class="field__input" type="date" id="to-input" value="${to}" />
          </div>
          <button class="btn btn--primary" id="apply-range">Aplicar</button>
        `;
        body.querySelector('#apply-range').addEventListener('click', () => {
          const fromVal = body.querySelector('#from-input').value;
          const toVal = body.querySelector('#to-input').value;
          if (!fromVal || !toVal) return;
          view.customRange = { from: fromVal, to: toVal };
          view.filter = 'custom';
          close();
          renderCalendar(root);
        });
      },
    });
  });

  bindTransactionRows(root, sortedScoped);
}
