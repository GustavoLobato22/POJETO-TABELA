import { icon } from '../icons.js';
import { pushOverlay, requestCloseTop } from './overlayStack.js';

export function openSheet({ title, subtitle, render, onClose, showClose = true }) {
  const root = document.getElementById('overlay-root');

  const overlay = document.createElement('div');
  overlay.className = 'sheet-overlay';

  const sheet = document.createElement('div');
  sheet.className = 'sheet';

  const header = document.createElement('div');
  if (title || showClose) {
    header.className = 'sheet__header';
    header.innerHTML = `
      <div class="sheet__header__titles">
        <div class="text-headline">${title || ''}</div>
        ${subtitle ? `<div class="text-footnote text-secondary" style="margin-top:2px">${subtitle}</div>` : ''}
      </div>
      ${showClose ? `<button class="icon-btn" data-close-sheet aria-label="Fechar">${icon('close', { size: 18 })}</button>` : ''}
    `;
  }

  const handle = document.createElement('div');
  handle.className = 'sheet__handle';

  const body = document.createElement('div');
  body.className = 'sheet__body';

  sheet.appendChild(handle);
  if (header.className) sheet.appendChild(header);
  sheet.appendChild(body);
  overlay.appendChild(sheet);
  root.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  let closed = false;
  function closeDom() {
    if (closed) return;
    closed = true;
    overlay.classList.add('is-closing');
    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = '';
      if (onClose) onClose();
    }, 200);
  }

  function close() {
    if (closed) return;
    requestCloseTop();
  }

  pushOverlay(closeDom);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  const closeBtn = header.querySelector('[data-close-sheet]');
  if (closeBtn) closeBtn.addEventListener('click', () => close());

  render(body, close);

  return close;
}
