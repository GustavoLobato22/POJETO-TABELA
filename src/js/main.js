import { initTheme } from './theme.js';
import { initRouter } from './router.js';
import { store } from './store/store.js';
import { runOnboarding } from './screens/onboarding.js';

initTheme();

if (!store.state.profile.onboarded) {
  runOnboarding(() => initRouter());
} else {
  initRouter();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
