import { getCategory } from '../data/categories.js';
import { getPaymentMethod } from '../data/paymentMethods.js';

function escapeCsv(value) {
  const s = String(value ?? '');
  if (/[",\n;]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function transactionsToCsv(transactions) {
  const header = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Forma de pagamento', 'Valor', 'Observação'];
  const rows = transactions.map((t) => [
    t.date,
    t.type === 'income' ? 'Receita' : 'Despesa',
    getCategory(t.category).label,
    t.description,
    getPaymentMethod(t.paymentMethod).label,
    t.amount.toFixed(2).replace('.', ','),
    t.note || '',
  ]);
  return [header, ...rows].map((r) => r.map(escapeCsv).join(';')).join('\n');
}

export function downloadTextFile(filename, content, mime = 'text/csv;charset=utf-8;') {
  const blob = new Blob(['﻿' + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function exportTransactionsCsv(transactions) {
  const csv = transactionsToCsv(transactions);
  const stamp = new Date().toISOString().slice(0, 10);
  downloadTextFile(`movimentacoes-${stamp}.csv`, csv);
}

export function exportBackupJson(state) {
  const stamp = new Date().toISOString().slice(0, 10);
  downloadTextFile(`backup-financas-${stamp}.json`, JSON.stringify(state, null, 2), 'application/json');
}
