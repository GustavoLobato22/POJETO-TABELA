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

export function addDays(date, n) {
  const d = date instanceof Date ? date : fromDateKey(date);
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function daysBetween(a, b) {
  const da = a instanceof Date ? a : fromDateKey(a);
  const db = b instanceof Date ? b : fromDateKey(b);
  const ms = new Date(db.getFullYear(), db.getMonth(), db.getDate()) -
    new Date(da.getFullYear(), da.getMonth(), da.getDate());
  return Math.round(ms / 86400000);
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
  const yesterday = toDateKey(addDays(new Date(), -1));
  const tomorrow = toDateKey(addDays(new Date(), 1));
  if (dateKey === today) return 'Hoje';
  if (dateKey === yesterday) return 'Ontem';
  if (dateKey === tomorrow) return 'Amanhã';
  return formatDateShort(dateKey);
}

export function formatDuration(seconds) {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`;
  if (m > 0) return `${m}min ${String(sec).padStart(2, '0')}s`;
  return `${sec}s`;
}

export function formatClock(seconds) {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function formatPercent(value, digits = 0) {
  return `${(Number(value) || 0).toFixed(digits)}%`;
}

export function formatHours(hoursDecimal) {
  const h = Math.floor(hoursDecimal);
  const m = Math.round((hoursDecimal - h) * 60);
  if (h <= 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export { MONTHS_FULL, MONTHS_SHORT, WEEKDAYS_SHORT };
