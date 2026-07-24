import { uid } from '../utils/id.js';
import { toDateKey } from '../utils/format.js';
import { buildEmptyState } from '../data/emptyState.js';

function defaultSettings() {
  return {
    theme: 'system', // 'system' | 'light' | 'dark'
    pinEnabled: false,
    biometricEnabled: false,
    pin: null,
    userName: 'Você',
  };
}

class Store {
  constructor() {
    // No one is logged in yet — loadForUser() populates real data once an
    // account is chosen. Keeping an empty shell here (rather than null)
    // means every screen can render safely before that happens.
    this.userId = null;
    this.storageKey = null;
    this.state = buildEmptyState();
    this.listeners = new Set();
    this._saveScheduled = false;
  }

  loadForUser(userId, displayName) {
    this.userId = userId;
    this.storageKey = 'financas.v1.' + userId;
    let state = null;
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) state = JSON.parse(raw);
    } catch (e) {
      console.warn('Falha ao carregar dados salvos', e);
    }
    if (!state) {
      state = buildEmptyState();
      if (displayName) state.settings.userName = displayName;
    }
    state.settings = { ...defaultSettings(), ...(state.settings || {}) };
    this.state = state;
    this.notify();
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.persist();
    this.listeners.forEach((fn) => fn(this.state));
  }

  persist() {
    if (!this.storageKey) return;
    if (this._saveScheduled) return;
    this._saveScheduled = true;
    queueMicrotask(() => {
      this._saveScheduled = false;
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      } catch (e) {
        console.warn('Falha ao salvar dados', e);
      }
    });
  }

  // ---------------- Transactions ----------------
  addTransaction(data) {
    const tx = {
      id: uid(),
      type: data.type, // 'income' | 'expense'
      amount: Math.abs(Number(data.amount) || 0),
      description: data.description || '',
      category: data.category,
      date: data.date || toDateKey(new Date()),
      paymentMethod: data.paymentMethod,
      note: data.note || '',
      cardId: data.cardId || null,
      favorite: false,
      createdAt: Date.now(),
    };
    this.state.transactions.unshift(tx);
    this.notify();
    return tx;
  }

  updateTransaction(id, patch) {
    const tx = this.state.transactions.find((t) => t.id === id);
    if (!tx) return;
    Object.assign(tx, patch);
    this.notify();
  }

  deleteTransaction(id) {
    this.state.transactions = this.state.transactions.filter((t) => t.id !== id);
    this.notify();
  }

  duplicateTransaction(id) {
    const tx = this.state.transactions.find((t) => t.id === id);
    if (!tx) return;
    const copy = { ...tx, id: uid(), date: toDateKey(new Date()), createdAt: Date.now() };
    this.state.transactions.unshift(copy);
    this.notify();
    return copy;
  }

  toggleFavorite(id) {
    const tx = this.state.transactions.find((t) => t.id === id);
    if (!tx) return;
    tx.favorite = !tx.favorite;
    this.notify();
  }

  // ---------------- Goals ----------------
  addGoal(data) {
    const goal = {
      id: uid(),
      title: data.title,
      targetAmount: Number(data.targetAmount) || 0,
      savedAmount: Number(data.savedAmount) || 0,
      icon: data.icon || 'target',
      color: data.color || '#16A34A',
      createdAt: Date.now(),
      deadline: data.deadline || null,
    };
    this.state.goals.unshift(goal);
    this.notify();
    return goal;
  }

  updateGoal(id, patch) {
    const goal = this.state.goals.find((g) => g.id === id);
    if (!goal) return;
    Object.assign(goal, patch);
    this.notify();
  }

  contributeToGoal(id, amount) {
    const goal = this.state.goals.find((g) => g.id === id);
    if (!goal) return;
    goal.savedAmount = Math.max(0, goal.savedAmount + Number(amount));
    this.notify();
  }

  deleteGoal(id) {
    this.state.goals = this.state.goals.filter((g) => g.id !== id);
    this.notify();
  }

  // ---------------- Fixed bills ----------------
  addFixedBill(data) {
    const bill = {
      id: uid(),
      title: data.title,
      amount: Number(data.amount) || 0,
      category: data.category || 'moradia',
      dueDay: Number(data.dueDay) || 5,
      active: true,
      createdAt: Date.now(),
    };
    this.state.fixedBills.unshift(bill);
    this.notify();
    return bill;
  }

  updateFixedBill(id, patch) {
    const bill = this.state.fixedBills.find((b) => b.id === id);
    if (!bill) return;
    Object.assign(bill, patch);
    this.notify();
  }

  deleteFixedBill(id) {
    this.state.fixedBills = this.state.fixedBills.filter((b) => b.id !== id);
    this.notify();
  }

  // ---------------- Cards ----------------
  addCard(data) {
    const card = {
      id: uid(),
      name: data.name,
      last4: data.last4 || '0000',
      limit: Number(data.limit) || 0,
      used: Number(data.used) || 0,
      closingDay: Number(data.closingDay) || 1,
      dueDay: Number(data.dueDay) || 10,
      color: data.color || '#12141A',
      createdAt: Date.now(),
    };
    this.state.cards.unshift(card);
    this.notify();
    return card;
  }

  updateCard(id, patch) {
    const card = this.state.cards.find((c) => c.id === id);
    if (!card) return;
    Object.assign(card, patch);
    this.notify();
  }

  deleteCard(id) {
    this.state.cards = this.state.cards.filter((c) => c.id !== id);
    this.notify();
  }

  // ---------------- Settings ----------------
  updateSettings(patch) {
    Object.assign(this.state.settings, patch);
    this.notify();
  }

  // ---------------- Danger zone ----------------
  wipeAll() {
    const name = this.state.settings.userName;
    this.state = buildEmptyState();
    this.state.settings.userName = name;
    this.notify();
  }
}

export const store = new Store();
