import { toDateKey } from '../utils/format.js';

// Deterministic small PRNG so the demo dataset is stable across reloads
// (before the user starts editing it) without requiring a network fetch.
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const EXPENSE_TEMPLATES = [
  { category: 'alimentacao', desc: 'Restaurante', min: 35, max: 120, paymentMethod: 'credito' },
  { category: 'alimentacao', desc: 'iFood', min: 28, max: 70, paymentMethod: 'pix' },
  { category: 'mercado', desc: 'Supermercado', min: 90, max: 320, paymentMethod: 'debito' },
  { category: 'combustivel', desc: 'Posto Ipiranga', min: 120, max: 220, paymentMethod: 'credito' },
  { category: 'transporte', desc: 'Uber', min: 12, max: 45, paymentMethod: 'pix' },
  { category: 'lazer', desc: 'Cinema', min: 40, max: 90, paymentMethod: 'credito' },
  { category: 'lazer', desc: 'Bar com amigos', min: 50, max: 150, paymentMethod: 'pix' },
  { category: 'saude', desc: 'Farmácia', min: 25, max: 110, paymentMethod: 'debito' },
  { category: 'moradia', desc: 'Aluguel', min: 1450, max: 1450, paymentMethod: 'conta', fixedDay: 5 },
  { category: 'moradia', desc: 'Energia elétrica', min: 140, max: 210, paymentMethod: 'conta', fixedDay: 12 },
  { category: 'moradia', desc: 'Internet', min: 99, max: 99, paymentMethod: 'conta', fixedDay: 8 },
];

const INCOME_TEMPLATES = [
  { category: 'salario', desc: 'Salário', min: 4200, max: 4200, fixedDay: 1, paymentMethod: 'conta' },
  { category: 'freelance', desc: 'Projeto freelance', min: 350, max: 1200, paymentMethod: 'pix' },
  { category: 'investimentos', desc: 'Rendimento CDB', min: 40, max: 130, paymentMethod: 'conta' },
];

function pick(rand, arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function amountFor(rand, tpl) {
  if (tpl.min === tpl.max) return tpl.min;
  return Math.round(tpl.min + rand() * (tpl.max - tpl.min));
}

export function buildSeed() {
  const rand = mulberry32(20260723);
  const now = new Date();
  const transactions = [];

  for (let mOffset = 3; mOffset >= 0; mOffset--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - mOffset, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInThisMonth = new Date(year, month + 1, 0).getDate();
    const lastDay = mOffset === 0 ? Math.min(now.getDate(), daysInThisMonth) : daysInThisMonth;

    // Fixed / recurring items
    for (const tpl of [...EXPENSE_TEMPLATES, ...INCOME_TEMPLATES]) {
      if (tpl.fixedDay && tpl.fixedDay <= lastDay) {
        transactions.push(makeTx(rand, tpl, new Date(year, month, tpl.fixedDay)));
      }
    }

    // Random day-to-day spending
    const spendCount = 16 + Math.floor(rand() * 8);
    const dayVariableTemplates = EXPENSE_TEMPLATES.filter((t) => !t.fixedDay);
    for (let i = 0; i < spendCount; i++) {
      const day = 1 + Math.floor(rand() * lastDay);
      const tpl = pick(rand, dayVariableTemplates);
      transactions.push(makeTx(rand, tpl, new Date(year, month, day)));
    }

    // Occasional freelance income
    if (rand() > 0.35 && lastDay > 10) {
      const day = 5 + Math.floor(rand() * (lastDay - 5));
      transactions.push(makeTx(rand, INCOME_TEMPLATES[1], new Date(year, month, day)));
    }
  }

  transactions.sort((a, b) => (a.date < b.date ? 1 : -1));

  const goals = [
    {
      id: 'goal-moto',
      title: 'Comprar moto',
      targetAmount: 20000,
      savedAmount: 12350,
      icon: 'trending',
      color: '#16A34A',
      createdAt: Date.now() - 86400000 * 120,
      deadline: null,
    },
    {
      id: 'goal-viagem',
      title: 'Viagem para o litoral',
      targetAmount: 6000,
      savedAmount: 2100,
      icon: 'star',
      color: '#3B6FCC',
      createdAt: Date.now() - 86400000 * 60,
      deadline: null,
    },
  ];

  const fixedBills = [
    { id: 'bill-aluguel', title: 'Aluguel', amount: 1450, category: 'moradia', dueDay: 5, active: true, createdAt: Date.now() },
    { id: 'bill-internet', title: 'Internet', amount: 99, category: 'moradia', dueDay: 8, active: true, createdAt: Date.now() },
    { id: 'bill-energia', title: 'Energia', amount: 175, category: 'moradia', dueDay: 12, active: true, createdAt: Date.now() },
    { id: 'bill-agua', title: 'Água', amount: 68, category: 'moradia', dueDay: 15, active: true, createdAt: Date.now() },
    { id: 'bill-academia', title: 'Academia', amount: 120, category: 'saude', dueDay: 10, active: true, createdAt: Date.now() },
    { id: 'bill-netflix', title: 'Netflix', amount: 44.9, category: 'lazer', dueDay: 18, active: true, createdAt: Date.now() },
    { id: 'bill-spotify', title: 'Spotify', amount: 21.9, category: 'lazer', dueDay: 20, active: true, createdAt: Date.now() },
  ];

  const cards = [
    {
      id: 'card-nubank',
      name: 'Nubank',
      last4: '4821',
      limit: 6000,
      used: 2140,
      closingDay: 24,
      dueDay: 2,
      color: '#7C3AED',
      createdAt: Date.now(),
    },
    {
      id: 'card-inter',
      name: 'Inter',
      last4: '9053',
      limit: 3500,
      used: 610,
      closingDay: 10,
      dueDay: 17,
      color: '#F5A623',
      createdAt: Date.now(),
    },
  ];

  return {
    transactions,
    goals,
    fixedBills,
    cards,
    settings: { theme: 'system', pinEnabled: false, biometricEnabled: false, pin: null, userName: 'Você' },
  };
}

function makeTx(rand, tpl, dateObj) {
  return {
    id: 'seed-' + Math.floor(rand() * 1e9).toString(36) + '-' + dateObj.getTime(),
    type: tpl.category === 'salario' || tpl.category === 'freelance' || tpl.category === 'investimentos' ? 'income' : 'expense',
    amount: amountFor(rand, tpl),
    description: tpl.desc,
    category: tpl.category,
    date: toDateKey(dateObj),
    paymentMethod: tpl.paymentMethod,
    note: '',
    cardId: tpl.paymentMethod === 'credito' ? 'card-nubank' : null,
    favorite: false,
    createdAt: dateObj.getTime(),
  };
}
