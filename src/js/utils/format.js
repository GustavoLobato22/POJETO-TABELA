const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const numberFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

export function formatCurrency(value) {
  const v = Number(value) || 0;
  return currencyFormatter.format(v);
}

export function formatCurrencyCompact(value) {
  const v = Number(value) || 0;
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return (v / 1_000_000).toFixed(1).replace('.', ',') + 'M';
  if (abs >= 1_000) return (v / 1_000).toFixed(1).replace('.', ',') + 'k';
  return numberFormatter.format(v);
}

export function formatSignedCurrency(value, kind) {
  const sign = kind === 'income' ? '+' : kind === 'expense' ? '−' : value < 0 ? '−' : '+';
  return `${sign} ${formatCurrency(Math.abs(value))}`;
}

const WEEKDAYS_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MONTHS_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function toDateKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isSameDay(a, b) {
  return toDateKey(a) === toDateKey(b);
}

export function formatDateLong(date) {
  const d = date instanceof Date ? date : fromDateKey(date);
  return `${d.getDate()} de ${MONTHS_FULL[d.getMonth()]}, ${d.getFullYear()}`;
}

export function formatDateShort(date) {
  const d = date instanceof Date ? date : fromDateKey(date);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function formatWeekday(date) {
  const d = date instanceof Date ? date : fromDateKey(date);
  return WEEKDAYS_SHORT[d.getDay()];
}

export function formatMonthYear(date) {
  const d = date instanceof Date ? date : fromDateKey(date);
  return `${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

export function monthLabelShort(monthIndex) {
  return MONTHS_SHORT[monthIndex];
}

export function relativeDayLabel(dateKey) {
  const today = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - 86400000));
  if (dateKey === today) return 'Hoje';
  if (dateKey === yesterday) return 'Ontem';
  return formatDateLong(dateKey);
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function startOfMonth(date) {
  const d = date instanceof Date ? date : new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(date, n) {
  const d = date instanceof Date ? date : new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export { MONTHS_FULL, MONTHS_SHORT, WEEKDAYS_SHORT };
