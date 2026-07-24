import { initTheme } from './theme.js';
import { initRouter } from './router.js';
import { isAppLocked, showLockScreen } from './screens/lock.js';
import { store } from './store/store.js';
import { getSession } from './auth/accounts.js';
import { showAuthScreen } from './screens/auth.js';

initTheme();

function boot(userId, displayName) {
  store.loadForUser(userId, displayName);
  if (isAppLocked()) {
    showLockScreen(initRouter);
  } else {
    initRouter();
  }
}

const session = getSession();
if (session) {
  boot(session);
} else {
  showAuthScreen(boot);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
