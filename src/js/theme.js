import { store } from './store/store.js';

export function applyTheme() {
  const { theme } = store.state.settings;
  const root = document.documentElement;
  if (theme === 'dark' || theme === 'light') {
    root.setAttribute('data-theme', theme);
  } else {
    root.removeAttribute('data-theme');
  }
}

export function initTheme() {
  applyTheme();
  store.subscribe(applyTheme);
}
