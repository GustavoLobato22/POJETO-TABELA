import { initTheme } from './theme.js';
import { initRouter } from './router.js';
import { isAppLocked, showLockScreen } from './screens/lock.js';

initTheme();

if (isAppLocked()) {
  showLockScreen(initRouter);
} else {
  initRouter();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
