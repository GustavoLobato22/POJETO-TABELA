import { fromDateKey } from '../utils/format.js';

export function inMonth(tx, year, month) {
  const d = fromDateKey(tx.date);
  return d.getFullYear() === year && d.getMonth() === month;
}

export function monthTransactions(transactions, year, month) {
  return transactions.filter((t) => inMonth(t, year, month));
}

export function sumByType(transactions, type) {
  return transactions.filter((t) => t.type === type).reduce((acc, t) => acc + t.amount, 0);
}

export function monthSummary(transactions, date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const txs = monthTransactions(transactions, year, month);
  const income = sumByType(txs, 'income');
  const expense = sumByType(txs, 'expense');
  return { income, expense, savings: income - expense, count: txs.length };
}

export function totalBalance(transactions) {
  return transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
}

export function percentChange(current, previous) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function last6MonthsSeries(transactions, refDate = new Date()) {
  const out = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    const s = monthSummary(transactions, d);
    out.push({ year: d.getFullYear(), month: d.getMonth(), ...s });
  }
  return out;
}

export function categoryBreakdown(transactions, type = 'expense') {
  const map = new Map();
  transactions.filter((t) => t.type === type).forEach((t) => {
    map.set(t.category, (map.get(t.category) || 0) + t.amount);
  });
  return [...map.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export function groupByDay(transactions) {
  const map = new Map();
  transactions.forEach((t) => {
    if (!map.has(t.date)) map.set(t.date, []);
    map.get(t.date).push(t);
  });
  return map;
}

export function dailyTotals(dayTransactions) {
  const income = sumByType(dayTransactions, 'income');
  const expense = sumByType(dayTransactions, 'expense');
  return { income, expense, balance: income - expense };
}

export function averageDaily(transactions, type, days) {
  const total = sumByType(transactions, type);
  return days > 0 ? total / days : 0;
}

export function biggest(transactions, type) {
  const filtered = transactions.filter((t) => t.type === type);
  if (!filtered.length) return null;
  return filtered.reduce((max, t) => (t.amount > max.amount ? t : max), filtered[0]);
}
