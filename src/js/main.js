import { initTheme } from './theme.js';
import { initRouter } from './router.js';
import { store } from './store/store.js';
import { runOnboarding } from './screens/onboarding.js';
import { runProfileLogin } from './screens/profileLogin.js';
import { getActiveProfileId } from './store/profiles.js';

function boot() {
  initTheme();
  if (!store.state.profile.onboarded) {
    runOnboarding(() => initRouter());
  } else {
    initRouter();
  }
}

if (!getActiveProfileId()) {
  runProfileLogin();
} else {
  boot();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
