import { icon } from './icons.js';
import { store } from './store/store.js';
import { renderDashboard } from './screens/dashboard.js';
import { renderQuestionBank } from './screens/questionBank.js';
import { renderSimuladoSetup } from './screens/simuladoSetup.js';
import { renderFlashcards } from './screens/flashcards.js';
import { renderProfile } from './screens/profile.js';
import { openPracticeSession } from './screens/practice.js';
import { dueQuestionReviews, dueFlashcardsReviewOnly } from './store/selectors.js';

export const TABS = [
  { id: 'dashboard', label: 'Início', icon: 'home', render: renderDashboard },
  { id: 'questoes', label: 'Questões', icon: 'book', render: renderQuestionBank },
  { id: 'simulado', label: 'Simulado', icon: 'clipboardList', render: renderSimuladoSetup },
  { id: 'flashcards', label: 'Revisão', icon: 'layers', render: renderFlashcards },
  { id: 'perfil', label: 'Perfil', icon: 'user', render: renderProfile },
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
  const hasPending = dueQuestionReviews(store.state).length + dueFlashcardsReviewOnly(store.state).length > 0;
  tabBar.innerHTML = TABS.map(
    (t) => `
    <button class="tab-bar__item ${t.id === currentTabId ? 'is-active' : ''}" data-tab="${t.id}">
      ${icon(t.icon, { size: 22 })}
      ${t.id === 'flashcards' && hasPending ? '<span class="tab-bar__dot"></span>' : ''}
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
  fab.style.display = 'flex';
  fab.innerHTML = icon('play', { size: 24 });
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

  document.getElementById('fab').addEventListener('click', () => openPracticeSession({ mode: 'quick' }));

  store.subscribe(() => {
    renderTabBar();
    renderScreen();
  });
}
