import { icon } from './icons.js';
import { store } from './store/store.js';
import { renderDashboard } from './screens/dashboard.js';
import { renderCalendar } from './screens/calendar.js';
import { renderHistory } from './screens/history.js';
import { renderReports } from './screens/reports.js';
import { renderProfile } from './screens/profile.js';
import { openAddTransactionSheet } from './screens/addTransaction.js';

export const TABS = [
  { id: 'dashboard', label: 'Início', icon: 'home', render: renderDashboard, showFab: true },
  { id: 'calendar', label: 'Calendário', icon: 'calendar', render: renderCalendar, showFab: true },
  { id: 'history', label: 'Histórico', icon: 'list', render: renderHistory, showFab: true },
  { id: 'reports', label: 'Relatórios', icon: 'chart', render: renderReports, showFab: false },
  { id: 'profile', label: 'Perfil', icon: 'user', render: renderProfile, showFab: false },
];

let currentTabId = 'dashboard';

function tabFromHash() {
  const id = location.hash.replace('#/', '');
  return TABS.find((t) => t.id === id) ? id : 'dashboard';
}

export function navigateTab(id) {
  location.hash = `#/${id}`;
}

function renderTabBar() {
  const tabBar = document.getElementById('tab-bar');
  tabBar.innerHTML = TABS.map(
    (t) => `
    <button class="tab-bar__item ${t.id === currentTabId ? 'is-active' : ''}" data-tab="${t.id}">
      ${icon(t.icon, { size: 23 })}
      <span class="tab-bar__label">${t.label}</span>
    </button>
  `
  ).join('');
  tabBar.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => navigateTab(btn.dataset.tab));
  });
}

function renderFab() {
  const fab = document.getElementById('fab');
  const tab = TABS.find((t) => t.id === currentTabId);
  fab.style.display = tab?.showFab ? 'flex' : 'none';
  fab.innerHTML = icon('plus', { size: 26 });
}

function renderScreen() {
  const root = document.getElementById('screen-root');
  const tab = TABS.find((t) => t.id === currentTabId) || TABS[0];
  const scrollY = root.scrollTop;
  tab.render(root);
  root.scrollTop = scrollY;
}

export function renderAll() {
  renderTabBar();
  renderFab();
  renderScreen();
}

export function initRouter() {
  currentTabId = tabFromHash();
  renderAll();

  window.addEventListener('hashchange', () => {
    const next = tabFromHash();
    if (next === currentTabId) return;
    currentTabId = next;
    renderAll();
  });

  document.getElementById('fab').addEventListener('click', () => openAddTransactionSheet());

  store.subscribe(() => {
    renderFab();
    renderScreen();
  });
}
