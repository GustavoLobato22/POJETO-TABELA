// Single source of truth for overlay (sheet/page) history handling.
// Only one popstate listener exists app-wide, and it always closes exactly
// the top-most overlay — this is what prevents a sheet opened on top of a
// full-screen page from also closing that page when it's dismissed.
const stack = [];

export function pushOverlay(closeDomFn) {
  stack.push(closeDomFn);
  history.pushState({ overlayDepth: stack.length }, '');
}

export function requestCloseTop() {
  if (!stack.length) return;
  history.back();
}

window.addEventListener('popstate', () => {
  const closeDomFn = stack.pop();
  if (closeDomFn) closeDomFn();
});
